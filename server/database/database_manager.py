# server/database/database_manager.py
import asyncio
import asyncpg
import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import json
import os
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class DatabaseConfig:
    """데이터베이스 설정"""
    host: str = os.getenv('DB_HOST', 'localhost')
    port: int = int(os.getenv('DB_PORT', '5432'))
    database: str = os.getenv('DB_NAME', 'kmtc_booking')
    username: str = os.getenv('DB_USER', 'postgres')
    password: str = os.getenv('DB_PASSWORD', 'postgres')
    min_connections: int = int(os.getenv('DB_MIN_CONNECTIONS', '5'))
    max_connections: int = int(os.getenv('DB_MAX_CONNECTIONS', '20'))
    ssl: str = os.getenv('DB_SSL', 'prefer')

class DatabaseManager:
    """데이터베이스 연결 및 쿼리 관리자"""
    
    def __init__(self, config: DatabaseConfig = None):
        self.config = config or DatabaseConfig()
        self.pool: Optional[asyncpg.Pool] = None
        self._initialized = False
    
    async def initialize(self):
        """데이터베이스 연결 풀 초기화"""
        if self._initialized:
            return
        
        try:
            self.pool = await asyncpg.create_pool(
                host=self.config.host,
                port=self.config.port,
                database=self.config.database,
                user=self.config.username,
                password=self.config.password,
                min_size=self.config.min_connections,
                max_size=self.config.max_connections,
                ssl=self.config.ssl,
                command_timeout=60
            )
            self._initialized = True
            logger.info("Database connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            raise
    
    async def close(self):
        """데이터베이스 연결 풀 종료"""
        if self.pool:
            await self.pool.close()
            self._initialized = False
            logger.info("Database connection pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """데이터베이스 연결 컨텍스트 매니저"""
        if not self._initialized:
            await self.initialize()
        
        async with self.pool.acquire() as connection:
            yield connection
    
    @asynccontextmanager
    async def get_transaction(self):
        """트랜잭션 컨텍스트 매니저"""
        async with self.get_connection() as conn:
            async with conn.transaction():
                yield conn

class PredictionDataManager:
    """예측 데이터 관리자"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def create_prediction_job(self, job_data: Dict[str, Any]) -> str:
        """예측 작업 생성"""
        async with self.db.get_transaction() as conn:
            # 예측 작업 생성
            job_id = await conn.fetchval("""
                INSERT INTO prediction_jobs (
                    shipper_id, job_name, model_type, prediction_horizon, 
                    confidence_level, status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            """, 
                job_data['shipper_id'],
                job_data['job_name'],
                job_data['model_type'],
                job_data['prediction_horizon'],
                job_data['confidence_level'],
                'pending'
            )
            
            # 예측 변수들 저장
            if 'variables' in job_data:
                for var in job_data['variables']:
                    await conn.execute("""
                        INSERT INTO prediction_variables (
                            job_id, variable_name, variable_type, weight, 
                            data_source, update_frequency
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                    """,
                        job_id, var['name'], var['type'], var['weight'],
                        var['data_source'], var['update_frequency']
                    )
            
            return str(job_id)
    
    async def save_prediction_results(self, job_id: str, results: List[Dict[str, Any]]):
        """예측 결과 저장"""
        async with self.db.get_transaction() as conn:
            for result in results:
                await conn.execute("""
                    INSERT INTO prediction_results (
                        job_id, prediction_date, predicted_value,
                        confidence_lower, confidence_upper, confidence_level,
                        model_accuracy
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (job_id, prediction_date) 
                    DO UPDATE SET
                        predicted_value = EXCLUDED.predicted_value,
                        confidence_lower = EXCLUDED.confidence_lower,
                        confidence_upper = EXCLUDED.confidence_upper,
                        model_accuracy = EXCLUDED.model_accuracy
                """,
                    job_id, result['date'], result['predicted_value'],
                    result['confidence_lower'], result['confidence_upper'],
                    result['confidence_level'], result.get('model_accuracy')
                )
    
    async def save_feature_importance(self, job_id: str, features: Dict[str, float]):
        """특성 중요도 저장"""
        async with self.db.get_connection() as conn:
            # 기존 특성 중요도 삭제
            await conn.execute("DELETE FROM feature_importance WHERE job_id = $1", job_id)
            
            # 새로운 특성 중요도 저장
            sorted_features = sorted(features.items(), key=lambda x: x[1], reverse=True)
            for rank, (feature_name, importance) in enumerate(sorted_features, 1):
                await conn.execute("""
                    INSERT INTO feature_importance (
                        job_id, feature_name, importance_score, rank
                    ) VALUES ($1, $2, $3, $4)
                """, job_id, feature_name, importance, rank)
    
    async def get_prediction_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """예측 작업 조회"""
        async with self.db.get_connection() as conn:
            job = await conn.fetchrow("""
                SELECT * FROM prediction_jobs WHERE id = $1
            """, job_id)
            
            if not job:
                return None
            
            # 변수들 조회
            variables = await conn.fetch("""
                SELECT * FROM prediction_variables WHERE job_id = $1
            """, job_id)
            
            # 결과들 조회
            results = await conn.fetch("""
                SELECT * FROM prediction_results WHERE job_id = $1
                ORDER BY prediction_date
            """, job_id)
            
            # 특성 중요도 조회
            features = await conn.fetch("""
                SELECT feature_name, importance_score 
                FROM feature_importance WHERE job_id = $1
                ORDER BY rank
            """, job_id)
            
            return {
                'job': dict(job),
                'variables': [dict(var) for var in variables],
                'results': [dict(result) for result in results],
                'feature_importance': {f['feature_name']: f['importance_score'] for f in features}
            }
    
    async def update_job_status(self, job_id: str, status: str, error_message: str = None):
        """작업 상태 업데이트"""
        async with self.db.get_connection() as conn:
            await conn.execute("""
                UPDATE prediction_jobs 
                SET status = $2, error_message = $3, updated_at = NOW()
                WHERE id = $1
            """, job_id, status, error_message)

class SentimentDataManager:
    """감정 분석 데이터 관리자"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def create_sentiment_job(self, job_data: Dict[str, Any]) -> str:
        """감정 분석 작업 생성"""
        async with self.db.get_connection() as conn:
            job_id = await conn.fetchval("""
                INSERT INTO sentiment_analysis_jobs (
                    job_name, keywords, sources, time_range, language, status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            """,
                job_data['job_name'],
                json.dumps(job_data['keywords']),
                json.dumps(job_data['sources']),
                job_data['time_range'],
                job_data.get('language', 'en'),
                'pending'
            )
            
            return str(job_id)
    
    async def save_sentiment_results(self, job_id: str, results: List[Dict[str, Any]]):
        """감정 분석 결과 저장"""
        async with self.db.get_transaction() as conn:
            for result in results:
                await conn.execute("""
                    INSERT INTO sentiment_analysis_results (
                        job_id, source, positive_score, negative_score,
                        neutral_score, compound_score, confidence
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                    job_id, result['source'], result['positive_score'],
                    result['negative_score'], result['neutral_score'],
                    result['compound_score'], result['confidence']
                )
    
    async def save_sentiment_trends(self, job_id: str, trends: List[Dict[str, Any]]):
        """감정 트렌드 저장"""
        async with self.db.get_transaction() as conn:
            for trend in trends:
                await conn.execute("""
                    INSERT INTO sentiment_trends (
                        job_id, time_bucket, positive_score, negative_score,
                        neutral_score, compound_score, volume
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (job_id, time_bucket)
                    DO UPDATE SET
                        positive_score = EXCLUDED.positive_score,
                        negative_score = EXCLUDED.negative_score,
                        neutral_score = EXCLUDED.neutral_score,
                        compound_score = EXCLUDED.compound_score,
                        volume = EXCLUDED.volume
                """,
                    job_id, trend['time_bucket'], trend['positive_score'],
                    trend['negative_score'], trend['neutral_score'],
                    trend['compound_score'], trend['volume']
                )
    
    async def save_key_topics(self, job_id: str, topics: List[Dict[str, Any]]):
        """주요 토픽 저장"""
        async with self.db.get_connection() as conn:
            # 기존 토픽 삭제
            await conn.execute("DELETE FROM key_topics WHERE job_id = $1", job_id)
            
            # 새로운 토픽 저장
            for topic in topics:
                await conn.execute("""
                    INSERT INTO key_topics (
                        job_id, topic, relevance_score, frequency, sentiment_score
                    ) VALUES ($1, $2, $3, $4, $5)
                """,
                    job_id, topic['topic'], topic['relevance_score'],
                    topic['frequency'], topic['sentiment_score']
                )
    
    async def save_influential_posts(self, job_id: str, posts: List[Dict[str, Any]]):
        """영향력 있는 게시물 저장"""
        async with self.db.get_connection() as conn:
            for post in posts:
                await conn.execute("""
                    INSERT INTO influential_posts (
                        job_id, source, post_id, content, author,
                        published_at, engagement_score, sentiment_score, influence_score
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (job_id, source, post_id) DO NOTHING
                """,
                    job_id, post['source'], post['post_id'], post['content'],
                    post.get('author'), post.get('published_at'),
                    post.get('engagement_score', 0), post['sentiment_score'],
                    post['influence_score']
                )

class MarketEventDataManager:
    """시장 이벤트 데이터 관리자"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def create_market_event(self, event_data: Dict[str, Any]) -> str:
        """시장 이벤트 생성"""
        async with self.db.get_transaction() as conn:
            event_id = await conn.fetchval("""
                INSERT INTO market_events (
                    event_type, title, description, severity, confidence,
                    event_date, related_keywords, impact_assessment, recommended_actions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            """,
                event_data['event_type'], event_data['title'],
                event_data.get('description'), event_data['severity'],
                event_data['confidence'], event_data.get('event_date'),
                json.dumps(event_data.get('related_keywords', [])),
                json.dumps(event_data.get('impact_assessment', {})),
                json.dumps(event_data.get('recommended_actions', []))
            )
            
            # 영향 저장
            if 'impacts' in event_data:
                for impact in event_data['impacts']:
                    await conn.execute("""
                        INSERT INTO market_event_impacts (
                            event_id, affected_entity, entity_type,
                            impact_score, impact_description
                        ) VALUES ($1, $2, $3, $4, $5)
                    """,
                        event_id, impact['affected_entity'], impact['entity_type'],
                        impact['impact_score'], impact.get('impact_description')
                    )
            
            return str(event_id)
    
    async def get_active_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """활성 시장 이벤트 조회"""
        async with self.db.get_connection() as conn:
            events = await conn.fetch("""
                SELECT me.*, 
                       COALESCE(
                           json_agg(
                               json_build_object(
                                   'affected_entity', mei.affected_entity,
                                   'entity_type', mei.entity_type,
                                   'impact_score', mei.impact_score,
                                   'impact_description', mei.impact_description
                               )
                           ) FILTER (WHERE mei.id IS NOT NULL), 
                           '[]'::json
                       ) as impacts
                FROM market_events me
                LEFT JOIN market_event_impacts mei ON me.id = mei.event_id
                WHERE me.status = 'active'
                GROUP BY me.id
                ORDER BY me.detected_at DESC
                LIMIT $1
            """, limit)
            
            return [dict(event) for event in events]

class ExternalDataManager:
    """외부 데이터 관리자"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def register_data_source(self, source_data: Dict[str, Any]) -> str:
        """외부 데이터 소스 등록"""
        async with self.db.get_connection() as conn:
            source_id = await conn.fetchval("""
                INSERT INTO external_data_sources (
                    source_name, source_type, api_endpoint, api_key_encrypted,
                    update_frequency, data_format, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            """,
                source_data['source_name'], source_data['source_type'],
                source_data['api_endpoint'], source_data.get('api_key_encrypted'),
                source_data['update_frequency'], source_data.get('data_format', 'json'),
                source_data.get('is_active', True)
            )
            
            return str(source_id)
    
    async def save_external_data(self, source_id: str, data_entries: List[Dict[str, Any]]):
        """외부 데이터 저장"""
        async with self.db.get_transaction() as conn:
            for entry in data_entries:
                await conn.execute("""
                    INSERT INTO external_data (
                        source_id, data_key, data_value, data_timestamp, quality_score
                    ) VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (source_id, data_key, data_timestamp) DO NOTHING
                """,
                    source_id, entry['data_key'], json.dumps(entry['data_value']),
                    entry['data_timestamp'], entry.get('quality_score')
                )
    
    async def get_latest_data(self, source_name: str, data_key: str = None) -> List[Dict[str, Any]]:
        """최신 외부 데이터 조회"""
        async with self.db.get_connection() as conn:
            if data_key:
                data = await conn.fetch("""
                    SELECT ed.* FROM external_data ed
                    JOIN external_data_sources eds ON ed.source_id = eds.id
                    WHERE eds.source_name = $1 AND ed.data_key = $2
                    ORDER BY ed.data_timestamp DESC
                    LIMIT 100
                """, source_name, data_key)
            else:
                data = await conn.fetch("""
                    SELECT ed.* FROM external_data ed
                    JOIN external_data_sources eds ON ed.source_id = eds.id
                    WHERE eds.source_name = $1
                    ORDER BY ed.data_timestamp DESC
                    LIMIT 100
                """, source_name)
            
            return [dict(row) for row in data]
    
    async def save_data_quality_metrics(self, source_id: str, metrics: Dict[str, float]):
        """데이터 품질 지표 저장"""
        async with self.db.get_connection() as conn:
            await conn.execute("""
                INSERT INTO data_quality_metrics (
                    source_id, completeness, accuracy, consistency,
                    timeliness, validity, overall_score
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
                source_id, metrics['completeness'], metrics['accuracy'],
                metrics['consistency'], metrics['timeliness'], metrics['validity'],
                metrics['overall_score']
            )

class ABTestDataManager:
    """A/B 테스트 데이터 관리자"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def create_ab_test(self, test_data: Dict[str, Any]) -> str:
        """A/B 테스트 생성"""
        async with self.db.get_connection() as conn:
            test_id = await conn.fetchval("""
                INSERT INTO ab_tests (
                    test_name, control_model, treatment_model, traffic_split,
                    duration_days, start_date, end_date, success_metrics
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            """,
                test_data['test_name'], test_data['control_model'],
                test_data['treatment_model'], test_data['traffic_split'],
                test_data['duration_days'], test_data['start_date'],
                test_data['end_date'], json.dumps(test_data.get('success_metrics', []))
            )
            
            return str(test_id)
    
    async def assign_participant(self, test_id: str, shipper_id: str, group_type: str):
        """A/B 테스트 참가자 할당"""
        async with self.db.get_connection() as conn:
            await conn.execute("""
                INSERT INTO ab_test_participants (test_id, shipper_id, group_type)
                VALUES ($1, $2, $3)
                ON CONFLICT (test_id, shipper_id) DO NOTHING
            """, test_id, shipper_id, group_type)
    
    async def get_test_results(self, test_id: str) -> Dict[str, Any]:
        """A/B 테스트 결과 조회"""
        async with self.db.get_connection() as conn:
            test = await conn.fetchrow("""
                SELECT * FROM ab_tests WHERE id = $1
            """, test_id)
            
            participants = await conn.fetch("""
                SELECT group_type, COUNT(*) as count
                FROM ab_test_participants
                WHERE test_id = $1
                GROUP BY group_type
            """, test_id)
            
            return {
                'test': dict(test) if test else None,
                'participants': {p['group_type']: p['count'] for p in participants}
            }

# 싱글톤 인스턴스들
db_manager = DatabaseManager()
prediction_data_manager = PredictionDataManager(db_manager)
sentiment_data_manager = SentimentDataManager(db_manager)
market_event_data_manager = MarketEventDataManager(db_manager)
external_data_manager = ExternalDataManager(db_manager)
ab_test_data_manager = ABTestDataManager(db_manager)