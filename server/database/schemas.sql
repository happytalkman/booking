-- server/database/schemas.sql
-- 예측 모델과 감정 분석을 위한 데이터베이스 스키마

-- ============= 예측 관련 테이블 =============

-- 예측 작업 테이블
CREATE TABLE prediction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipper_id VARCHAR(255) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    prediction_horizon INTEGER NOT NULL,
    confidence_level DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- 인덱스
    INDEX idx_prediction_jobs_shipper_id (shipper_id),
    INDEX idx_prediction_jobs_status (status),
    INDEX idx_prediction_jobs_created_at (created_at)
);

-- 예측 변수 테이블
CREATE TABLE prediction_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES prediction_jobs(id) ON DELETE CASCADE,
    variable_name VARCHAR(255) NOT NULL,
    variable_type VARCHAR(50) NOT NULL,
    weight DECIMAL(5,4) NOT NULL,
    data_source VARCHAR(255) NOT NULL,
    update_frequency VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_prediction_variables_job_id (job_id),
    INDEX idx_prediction_variables_type (variable_type)
);

-- 예측 결과 테이블
CREATE TABLE prediction_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES prediction_jobs(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_value DECIMAL(15,4) NOT NULL,
    confidence_lower DECIMAL(15,4) NOT NULL,
    confidence_upper DECIMAL(15,4) NOT NULL,
    confidence_level DECIMAL(3,2) NOT NULL,
    model_accuracy DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_prediction_results_job_id (job_id),
    INDEX idx_prediction_results_date (prediction_date),
    UNIQUE INDEX idx_prediction_results_job_date (job_id, prediction_date)
);

-- 특성 중요도 테이블
CREATE TABLE feature_importance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES prediction_jobs(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    importance_score DECIMAL(8,6) NOT NULL,
    rank INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_feature_importance_job_id (job_id),
    INDEX idx_feature_importance_rank (rank)
);

-- A/B 테스트 테이블
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(255) NOT NULL,
    control_model VARCHAR(50) NOT NULL,
    treatment_model VARCHAR(50) NOT NULL,
    traffic_split DECIMAL(3,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    control_group_size INTEGER DEFAULT 0,
    treatment_group_size INTEGER DEFAULT 0,
    success_metrics JSONB,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_ab_tests_status (status),
    INDEX idx_ab_tests_dates (start_date, end_date)
);

-- A/B 테스트 참가자 테이블
CREATE TABLE ab_test_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    shipper_id VARCHAR(255) NOT NULL,
    group_type VARCHAR(20) NOT NULL, -- 'control' or 'treatment'
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_ab_test_participants_test_id (test_id),
    INDEX idx_ab_test_participants_shipper_id (shipper_id),
    UNIQUE INDEX idx_ab_test_participants_unique (test_id, shipper_id)
);

-- ============= 감정 분석 관련 테이블 =============

-- 감정 분석 작업 테이블
CREATE TABLE sentiment_analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(255) NOT NULL,
    keywords JSONB NOT NULL,
    sources JSONB NOT NULL,
    time_range VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- 인덱스
    INDEX idx_sentiment_jobs_status (status),
    INDEX idx_sentiment_jobs_created_at (created_at),
    INDEX idx_sentiment_jobs_keywords USING GIN (keywords)
);

-- 감정 분석 결과 테이블
CREATE TABLE sentiment_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES sentiment_analysis_jobs(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    positive_score DECIMAL(5,4) NOT NULL,
    negative_score DECIMAL(5,4) NOT NULL,
    neutral_score DECIMAL(5,4) NOT NULL,
    compound_score DECIMAL(6,4) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_sentiment_results_job_id (job_id),
    INDEX idx_sentiment_results_source (source),
    INDEX idx_sentiment_results_analyzed_at (analyzed_at)
);

-- 감정 트렌드 테이블
CREATE TABLE sentiment_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES sentiment_analysis_jobs(id) ON DELETE CASCADE,
    time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
    positive_score DECIMAL(5,4) NOT NULL,
    negative_score DECIMAL(5,4) NOT NULL,
    neutral_score DECIMAL(5,4) NOT NULL,
    compound_score DECIMAL(6,4) NOT NULL,
    volume INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_sentiment_trends_job_id (job_id),
    INDEX idx_sentiment_trends_time_bucket (time_bucket),
    UNIQUE INDEX idx_sentiment_trends_job_time (job_id, time_bucket)
);

-- 주요 토픽 테이블
CREATE TABLE key_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES sentiment_analysis_jobs(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    relevance_score DECIMAL(5,4) NOT NULL,
    frequency INTEGER NOT NULL,
    sentiment_score DECIMAL(6,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_key_topics_job_id (job_id),
    INDEX idx_key_topics_relevance (relevance_score DESC)
);

-- 영향력 있는 게시물 테이블
CREATE TABLE influential_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES sentiment_analysis_jobs(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    post_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    engagement_score INTEGER DEFAULT 0,
    sentiment_score DECIMAL(6,4) NOT NULL,
    influence_score DECIMAL(8,6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_influential_posts_job_id (job_id),
    INDEX idx_influential_posts_influence (influence_score DESC),
    INDEX idx_influential_posts_published (published_at)
);

-- ============= 시장 이벤트 관련 테이블 =============

-- 시장 이벤트 테이블
CREATE TABLE market_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_date TIMESTAMP WITH TIME ZONE,
    related_keywords JSONB,
    impact_assessment JSONB,
    recommended_actions JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- 인덱스
    INDEX idx_market_events_type (event_type),
    INDEX idx_market_events_severity (severity),
    INDEX idx_market_events_detected_at (detected_at),
    INDEX idx_market_events_keywords USING GIN (related_keywords)
);

-- 시장 이벤트 영향 테이블
CREATE TABLE market_event_impacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES market_events(id) ON DELETE CASCADE,
    affected_entity VARCHAR(255) NOT NULL, -- shipper_id, route, etc.
    entity_type VARCHAR(50) NOT NULL,
    impact_score DECIMAL(6,4) NOT NULL,
    impact_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_market_event_impacts_event_id (event_id),
    INDEX idx_market_event_impacts_entity (affected_entity),
    INDEX idx_market_event_impacts_score (impact_score DESC)
);

-- ============= 외부 데이터 관련 테이블 =============

-- 외부 데이터 소스 테이블
CREATE TABLE external_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR(255) NOT NULL UNIQUE,
    source_type VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(500) NOT NULL,
    api_key_encrypted TEXT,
    update_frequency VARCHAR(50) NOT NULL,
    data_format VARCHAR(50) NOT NULL DEFAULT 'json',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_external_data_sources_type (source_type),
    INDEX idx_external_data_sources_active (is_active)
);

-- 외부 데이터 테이블
CREATE TABLE external_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES external_data_sources(id) ON DELETE CASCADE,
    data_key VARCHAR(255) NOT NULL,
    data_value JSONB NOT NULL,
    data_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    quality_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_external_data_source_id (source_id),
    INDEX idx_external_data_key (data_key),
    INDEX idx_external_data_timestamp (data_timestamp),
    INDEX idx_external_data_value USING GIN (data_value),
    UNIQUE INDEX idx_external_data_unique (source_id, data_key, data_timestamp)
);

-- 데이터 품질 지표 테이블
CREATE TABLE data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES external_data_sources(id) ON DELETE CASCADE,
    completeness DECIMAL(5,4) NOT NULL,
    accuracy DECIMAL(5,4) NOT NULL,
    consistency DECIMAL(5,4) NOT NULL,
    timeliness DECIMAL(5,4) NOT NULL,
    validity DECIMAL(5,4) NOT NULL,
    overall_score DECIMAL(5,4) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_data_quality_source_id (source_id),
    INDEX idx_data_quality_measured_at (measured_at),
    INDEX idx_data_quality_overall_score (overall_score DESC)
);

-- ============= 데이터 통합 작업 관련 테이블 =============

-- 데이터 통합 작업 테이블
CREATE TABLE data_integration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(255) NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    source_ids JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    progress DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    error_messages JSONB,
    configuration JSONB,
    
    -- 인덱스
    INDEX idx_data_integration_jobs_status (status),
    INDEX idx_data_integration_jobs_started_at (started_at)
);

-- ============= 실시간 알림 관련 테이블 =============

-- 알림 규칙 테이블
CREATE TABLE notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(100) NOT NULL, -- 'prediction_threshold', 'sentiment_change', 'market_event'
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_notification_rules_type (rule_type),
    INDEX idx_notification_rules_active (is_active)
);

-- 알림 히스토리 테이블
CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
    recipient VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    -- 인덱스
    INDEX idx_notification_history_rule_id (rule_id),
    INDEX idx_notification_history_recipient (recipient),
    INDEX idx_notification_history_sent_at (sent_at),
    INDEX idx_notification_history_status (status)
);

-- ============= 시스템 모니터링 관련 테이블 =============

-- 시스템 헬스 체크 테이블
CREATE TABLE system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    
    -- 인덱스
    INDEX idx_system_health_service (service_name),
    INDEX idx_system_health_status (status),
    INDEX idx_system_health_checked_at (checked_at)
);

-- API 사용량 통계 테이블
CREATE TABLE api_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_id VARCHAR(255),
    response_status INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인덱스
    INDEX idx_api_usage_endpoint (endpoint),
    INDEX idx_api_usage_user_id (user_id),
    INDEX idx_api_usage_timestamp (timestamp),
    INDEX idx_api_usage_status (response_status)
);

-- ============= 뷰 (Views) =============

-- 예측 성능 요약 뷰
CREATE VIEW prediction_performance_summary AS
SELECT 
    pj.shipper_id,
    pj.model_type,
    COUNT(*) as total_predictions,
    AVG(pr.model_accuracy) as avg_accuracy,
    MIN(pr.model_accuracy) as min_accuracy,
    MAX(pr.model_accuracy) as max_accuracy,
    AVG(pr.confidence_upper - pr.confidence_lower) as avg_confidence_width
FROM prediction_jobs pj
JOIN prediction_results pr ON pj.id = pr.job_id
WHERE pj.status = 'completed'
GROUP BY pj.shipper_id, pj.model_type;

-- 감정 분석 트렌드 요약 뷰
CREATE VIEW sentiment_trend_summary AS
SELECT 
    DATE_TRUNC('day', st.time_bucket) as date,
    AVG(st.compound_score) as avg_sentiment,
    SUM(st.volume) as total_volume,
    COUNT(DISTINCT saj.id) as analysis_count
FROM sentiment_trends st
JOIN sentiment_analysis_jobs saj ON st.job_id = saj.id
WHERE saj.status = 'completed'
GROUP BY DATE_TRUNC('day', st.time_bucket)
ORDER BY date DESC;

-- 시장 이벤트 영향 요약 뷰
CREATE VIEW market_event_impact_summary AS
SELECT 
    me.event_type,
    me.severity,
    COUNT(*) as event_count,
    AVG(mei.impact_score) as avg_impact_score,
    COUNT(DISTINCT mei.affected_entity) as affected_entities
FROM market_events me
JOIN market_event_impacts mei ON me.id = mei.event_id
WHERE me.status = 'active'
GROUP BY me.event_type, me.severity;

-- ============= 함수 (Functions) =============

-- 예측 정확도 계산 함수
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy(
    p_job_id UUID,
    p_actual_values JSONB
) RETURNS DECIMAL(5,4) AS $$
DECLARE
    accuracy DECIMAL(5,4);
BEGIN
    -- 실제 값과 예측 값을 비교하여 정확도 계산
    -- 구현 로직은 비즈니스 요구사항에 따라 조정
    SELECT 
        1.0 - AVG(ABS(pr.predicted_value - (p_actual_values->>pr.prediction_date::text)::DECIMAL) / 
                  NULLIF((p_actual_values->>pr.prediction_date::text)::DECIMAL, 0))
    INTO accuracy
    FROM prediction_results pr
    WHERE pr.job_id = p_job_id
    AND p_actual_values ? pr.prediction_date::text;
    
    RETURN COALESCE(accuracy, 0.0);
END;
$$ LANGUAGE plpgsql;

-- 감정 점수 정규화 함수
CREATE OR REPLACE FUNCTION normalize_sentiment_scores(
    p_positive DECIMAL,
    p_negative DECIMAL,
    p_neutral DECIMAL
) RETURNS JSONB AS $$
DECLARE
    total DECIMAL;
    result JSONB;
BEGIN
    total := p_positive + p_negative + p_neutral;
    
    IF total = 0 THEN
        result := jsonb_build_object(
            'positive', 0.33,
            'negative', 0.33,
            'neutral', 0.34
        );
    ELSE
        result := jsonb_build_object(
            'positive', p_positive / total,
            'negative', p_negative / total,
            'neutral', p_neutral / total
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============= 트리거 (Triggers) =============

-- 예측 작업 상태 업데이트 트리거
CREATE OR REPLACE FUNCTION update_prediction_job_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prediction_job_status
    BEFORE UPDATE ON prediction_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_prediction_job_status();

-- 데이터 품질 점수 자동 계산 트리거
CREATE OR REPLACE FUNCTION calculate_data_quality_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.overall_score = (
        NEW.completeness + 
        NEW.accuracy + 
        NEW.consistency + 
        NEW.timeliness + 
        NEW.validity
    ) / 5.0;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_data_quality_score
    BEFORE INSERT OR UPDATE ON data_quality_metrics
    FOR EACH ROW
    EXECUTE FUNCTION calculate_data_quality_score();