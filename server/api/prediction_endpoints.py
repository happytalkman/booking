# server/api/prediction_endpoints.py
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import asyncio
import logging

from ..services.advanced_prediction_service import AdvancedPredictionService
from ..services.market_sentiment_service import MarketSentimentService
from ..services.real_time_data_service import RealTimeDataService
from ..models.prediction_models import (
    PredictionRequest, PredictionResponse, 
    SentimentAnalysisRequest, SentimentAnalysisResponse,
    MarketEventResponse, ABTestRequest, ABTestResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependency injection
def get_prediction_service() -> AdvancedPredictionService:
    return AdvancedPredictionService()

def get_sentiment_service() -> MarketSentimentService:
    return MarketSentimentService()

def get_realtime_service() -> RealTimeDataService:
    return RealTimeDataService()

# ============= 예측 모델 API 엔드포인트 =============

@router.post("/predictions/multi-variable", response_model=PredictionResponse)
async def create_multi_variable_prediction(
    request: PredictionRequest,
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """다중 변수 예측 생성"""
    try:
        result = await prediction_service.predict_multi_variable(
            shipper_id=request.shipper_id,
            variables=request.variables,
            prediction_horizon=request.prediction_horizon,
            confidence_level=request.confidence_level
        )
        return PredictionResponse(**result)
    except Exception as e:
        logger.error(f"Multi-variable prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predictions/scenario-analysis", response_model=List[PredictionResponse])
async def run_scenario_analysis(
    request: PredictionRequest,
    scenarios: List[Dict[str, Any]],
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """시나리오 분석 실행"""
    try:
        results = []
        for scenario in scenarios:
            result = await prediction_service.scenario_analysis(
                shipper_id=request.shipper_id,
                scenario_params=scenario,
                base_variables=request.variables
            )
            results.append(PredictionResponse(**result))
        return results
    except Exception as e:
        logger.error(f"Scenario analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions/model-comparison/{shipper_id}")
async def compare_prediction_models(
    shipper_id: str,
    models: List[str] = ["lstm", "arima", "prophet", "xgboost"],
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """예측 모델 성능 비교"""
    try:
        comparison = await prediction_service.compare_models(
            shipper_id=shipper_id,
            models=models
        )
        return comparison
    except Exception as e:
        logger.error(f"Model comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predictions/ab-test", response_model=ABTestResponse)
async def create_ab_test(
    request: ABTestRequest,
    background_tasks: BackgroundTasks,
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """A/B 테스트 생성 및 실행"""
    try:
        # A/B 테스트 설정
        test_config = await prediction_service.setup_ab_test(
            test_name=request.test_name,
            control_model=request.control_model,
            treatment_model=request.treatment_model,
            traffic_split=request.traffic_split,
            duration_days=request.duration_days
        )
        
        # 백그라운드에서 테스트 실행
        background_tasks.add_task(
            prediction_service.run_ab_test,
            test_config['test_id']
        )
        
        return ABTestResponse(**test_config)
    except Exception as e:
        logger.error(f"A/B test creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions/ab-test/{test_id}/results")
async def get_ab_test_results(
    test_id: str,
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """A/B 테스트 결과 조회"""
    try:
        results = await prediction_service.get_ab_test_results(test_id)
        return results
    except Exception as e:
        logger.error(f"A/B test results error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= 감정 분석 API 엔드포인트 =============

@router.post("/sentiment/analyze", response_model=SentimentAnalysisResponse)
async def analyze_market_sentiment(
    request: SentimentAnalysisRequest,
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """시장 감정 분석 실행"""
    try:
        result = await sentiment_service.analyze_sentiment(
            keywords=request.keywords,
            sources=request.sources,
            time_range=request.time_range,
            language=request.language
        )
        return SentimentAnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment/news-analysis")
async def get_news_sentiment_analysis(
    keywords: List[str],
    hours_back: int = 24,
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """뉴스 감정 분석 조회"""
    try:
        analysis = await sentiment_service.analyze_news_sentiment(
            keywords=keywords,
            hours_back=hours_back
        )
        return analysis
    except Exception as e:
        logger.error(f"News sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment/social-media")
async def get_social_media_sentiment(
    platforms: List[str] = ["twitter", "reddit", "linkedin"],
    keywords: List[str] = ["shipping", "logistics", "trade"],
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """소셜미디어 감정 분석"""
    try:
        analysis = await sentiment_service.analyze_social_sentiment(
            platforms=platforms,
            keywords=keywords
        )
        return analysis
    except Exception as e:
        logger.error(f"Social media sentiment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment/market-events", response_model=List[MarketEventResponse])
async def detect_market_events(
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """시장 이벤트 자동 감지"""
    try:
        events = await sentiment_service.detect_market_events()
        return [MarketEventResponse(**event) for event in events]
    except Exception as e:
        logger.error(f"Market event detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment/emotion-index")
async def get_market_emotion_index(
    time_range: str = "24h",
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """시장 감정 지수 조회"""
    try:
        emotion_index = await sentiment_service.calculate_emotion_index(
            time_range=time_range
        )
        return emotion_index
    except Exception as e:
        logger.error(f"Emotion index calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= 실시간 데이터 API 엔드포인트 =============

@router.get("/realtime/external-data")
async def get_external_data_feed(
    data_types: List[str] = ["weather", "oil_prices", "exchange_rates"],
    realtime_service: RealTimeDataService = Depends(get_realtime_service)
):
    """외부 데이터 피드 조회"""
    try:
        data_feed = await realtime_service.get_external_data(data_types)
        return data_feed
    except Exception as e:
        logger.error(f"External data feed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/realtime/data-integration")
async def integrate_external_data(
    data_sources: List[Dict[str, Any]],
    background_tasks: BackgroundTasks,
    realtime_service: RealTimeDataService = Depends(get_realtime_service)
):
    """외부 데이터 통합 작업 시작"""
    try:
        integration_job = await realtime_service.start_data_integration(data_sources)
        
        # 백그라운드에서 데이터 통합 실행
        background_tasks.add_task(
            realtime_service.process_data_integration,
            integration_job['job_id']
        )
        
        return integration_job
    except Exception as e:
        logger.error(f"Data integration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/realtime/data-quality")
async def check_data_quality(
    data_source: str,
    realtime_service: RealTimeDataService = Depends(get_realtime_service)
):
    """데이터 품질 검사"""
    try:
        quality_report = await realtime_service.check_data_quality(data_source)
        return quality_report
    except Exception as e:
        logger.error(f"Data quality check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= 웹소켓 엔드포인트 (실시간 업데이트) =============

@router.websocket("/ws/predictions/{shipper_id}")
async def websocket_predictions(
    websocket,
    shipper_id: str,
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """실시간 예측 업데이트 웹소켓"""
    await websocket.accept()
    try:
        while True:
            # 실시간 예측 업데이트 전송
            prediction_update = await prediction_service.get_real_time_prediction(shipper_id)
            await websocket.send_json(prediction_update)
            await asyncio.sleep(30)  # 30초마다 업데이트
    except Exception as e:
        logger.error(f"WebSocket prediction error: {e}")
        await websocket.close()

@router.websocket("/ws/sentiment")
async def websocket_sentiment(
    websocket,
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """실시간 감정 분석 웹소켓"""
    await websocket.accept()
    try:
        while True:
            # 실시간 감정 분석 업데이트 전송
            sentiment_update = await sentiment_service.get_real_time_sentiment()
            await websocket.send_json(sentiment_update)
            await asyncio.sleep(60)  # 1분마다 업데이트
    except Exception as e:
        logger.error(f"WebSocket sentiment error: {e}")
        await websocket.close()

# ============= 헬스체크 및 모니터링 =============

@router.get("/health/predictions")
async def prediction_health_check(
    prediction_service: AdvancedPredictionService = Depends(get_prediction_service)
):
    """예측 서비스 헬스체크"""
    try:
        health_status = await prediction_service.health_check()
        return health_status
    except Exception as e:
        logger.error(f"Prediction health check error: {e}")
        raise HTTPException(status_code=503, detail="Prediction service unavailable")

@router.get("/health/sentiment")
async def sentiment_health_check(
    sentiment_service: MarketSentimentService = Depends(get_sentiment_service)
):
    """감정 분석 서비스 헬스체크"""
    try:
        health_status = await sentiment_service.health_check()
        return health_status
    except Exception as e:
        logger.error(f"Sentiment health check error: {e}")
        raise HTTPException(status_code=503, detail="Sentiment service unavailable")