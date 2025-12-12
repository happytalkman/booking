# server/models/prediction_models.py
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum

# ============= 기본 모델 =============

class PredictionVariableType(str, Enum):
    WEATHER = "weather"
    OIL_PRICE = "oil_price"
    EXCHANGE_RATE = "exchange_rate"
    ECONOMIC_INDICATOR = "economic_indicator"
    SEASONAL = "seasonal"
    HISTORICAL = "historical"

class SentimentSource(str, Enum):
    NEWS = "news"
    TWITTER = "twitter"
    REDDIT = "reddit"
    LINKEDIN = "linkedin"
    FINANCIAL_REPORTS = "financial_reports"

class ModelType(str, Enum):
    LSTM = "lstm"
    ARIMA = "arima"
    PROPHET = "prophet"
    XGBOOST = "xgboost"
    ENSEMBLE = "ensemble"

# ============= 예측 관련 모델 =============

class PredictionVariable(BaseModel):
    """예측 변수 정의"""
    name: str = Field(..., description="변수명")
    type: PredictionVariableType = Field(..., description="변수 타입")
    weight: float = Field(default=1.0, ge=0.0, le=1.0, description="가중치")
    data_source: str = Field(..., description="데이터 소스")
    update_frequency: str = Field(default="daily", description="업데이트 주기")

class PredictionRequest(BaseModel):
    """예측 요청 모델"""
    shipper_id: str = Field(..., description="화주 ID")
    variables: List[PredictionVariable] = Field(..., description="예측 변수들")
    prediction_horizon: int = Field(default=30, ge=1, le=365, description="예측 기간(일)")
    confidence_level: float = Field(default=0.95, ge=0.5, le=0.99, description="신뢰도 수준")
    model_type: Optional[ModelType] = Field(default=ModelType.ENSEMBLE, description="모델 타입")
    include_scenarios: bool = Field(default=False, description="시나리오 분석 포함 여부")

class ConfidenceInterval(BaseModel):
    """신뢰구간 모델"""
    lower_bound: float = Field(..., description="하한값")
    upper_bound: float = Field(..., description="상한값")
    confidence_level: float = Field(..., description="신뢰도")

class PredictionPoint(BaseModel):
    """예측 포인트 모델"""
    date: datetime = Field(..., description="예측 날짜")
    predicted_value: float = Field(..., description="예측값")
    confidence_interval: ConfidenceInterval = Field(..., description="신뢰구간")
    contributing_factors: Dict[str, float] = Field(default_factory=dict, description="기여 요인들")

class PredictionResponse(BaseModel):
    """예측 응답 모델"""
    shipper_id: str = Field(..., description="화주 ID")
    prediction_id: str = Field(..., description="예측 ID")
    model_used: str = Field(..., description="사용된 모델")
    created_at: datetime = Field(default_factory=datetime.now, description="생성 시간")
    prediction_horizon: int = Field(..., description="예측 기간")
    predictions: List[PredictionPoint] = Field(..., description="예측 포인트들")
    model_accuracy: float = Field(..., description="모델 정확도")
    feature_importance: Dict[str, float] = Field(default_factory=dict, description="특성 중요도")
    risk_assessment: Dict[str, Any] = Field(default_factory=dict, description="위험 평가")

# ============= A/B 테스트 모델 =============

class ABTestRequest(BaseModel):
    """A/B 테스트 요청 모델"""
    test_name: str = Field(..., description="테스트 이름")
    control_model: ModelType = Field(..., description="대조군 모델")
    treatment_model: ModelType = Field(..., description="실험군 모델")
    traffic_split: float = Field(default=0.5, ge=0.1, le=0.9, description="트래픽 분할 비율")
    duration_days: int = Field(default=14, ge=1, le=90, description="테스트 기간(일)")
    success_metrics: List[str] = Field(default_factory=list, description="성공 지표들")
    minimum_sample_size: int = Field(default=100, description="최소 샘플 크기")

class ABTestResponse(BaseModel):
    """A/B 테스트 응답 모델"""
    test_id: str = Field(..., description="테스트 ID")
    test_name: str = Field(..., description="테스트 이름")
    status: str = Field(..., description="테스트 상태")
    start_date: datetime = Field(..., description="시작 날짜")
    end_date: datetime = Field(..., description="종료 날짜")
    control_group_size: int = Field(..., description="대조군 크기")
    treatment_group_size: int = Field(..., description="실험군 크기")
    preliminary_results: Optional[Dict[str, Any]] = Field(default=None, description="예비 결과")

# ============= 감정 분석 모델 =============

class SentimentAnalysisRequest(BaseModel):
    """감정 분석 요청 모델"""
    keywords: List[str] = Field(..., description="분석 키워드들")
    sources: List[SentimentSource] = Field(..., description="데이터 소스들")
    time_range: str = Field(default="24h", description="시간 범위")
    language: str = Field(default="en", description="언어 코드")
    sentiment_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="감정 임계값")
    include_entities: bool = Field(default=True, description="엔티티 추출 포함")

class SentimentScore(BaseModel):
    """감정 점수 모델"""
    positive: float = Field(..., ge=0.0, le=1.0, description="긍정 점수")
    negative: float = Field(..., ge=0.0, le=1.0, description="부정 점수")
    neutral: float = Field(..., ge=0.0, le=1.0, description="중립 점수")
    compound: float = Field(..., ge=-1.0, le=1.0, description="복합 점수")

class SentimentAnalysisResponse(BaseModel):
    """감정 분석 응답 모델"""
    analysis_id: str = Field(..., description="분석 ID")
    keywords: List[str] = Field(..., description="분석된 키워드들")
    overall_sentiment: SentimentScore = Field(..., description="전체 감정 점수")
    sentiment_by_source: Dict[str, SentimentScore] = Field(..., description="소스별 감정 점수")
    sentiment_trend: List[Dict[str, Any]] = Field(..., description="감정 트렌드")
    key_topics: List[str] = Field(..., description="주요 토픽들")
    influential_posts: List[Dict[str, Any]] = Field(..., description="영향력 있는 게시물들")
    emotion_distribution: Dict[str, float] = Field(..., description="감정 분포")
    created_at: datetime = Field(default_factory=datetime.now, description="생성 시간")

class MarketEventResponse(BaseModel):
    """시장 이벤트 응답 모델"""
    event_id: str = Field(..., description="이벤트 ID")
    event_type: str = Field(..., description="이벤트 타입")
    title: str = Field(..., description="이벤트 제목")
    description: str = Field(..., description="이벤트 설명")
    severity: str = Field(..., description="심각도")
    confidence: float = Field(..., ge=0.0, le=1.0, description="신뢰도")
    detected_at: datetime = Field(..., description="감지 시간")
    related_keywords: List[str] = Field(..., description="관련 키워드들")
    impact_assessment: Dict[str, Any] = Field(..., description="영향 평가")
    recommended_actions: List[str] = Field(..., description="권장 조치들")

# ============= 실시간 데이터 모델 =============

class ExternalDataSource(BaseModel):
    """외부 데이터 소스 모델"""
    source_name: str = Field(..., description="소스 이름")
    source_type: str = Field(..., description="소스 타입")
    api_endpoint: str = Field(..., description="API 엔드포인트")
    api_key: Optional[str] = Field(default=None, description="API 키")
    update_frequency: str = Field(..., description="업데이트 주기")
    data_format: str = Field(default="json", description="데이터 형식")

class DataQualityMetrics(BaseModel):
    """데이터 품질 지표 모델"""
    completeness: float = Field(..., ge=0.0, le=1.0, description="완전성")
    accuracy: float = Field(..., ge=0.0, le=1.0, description="정확성")
    consistency: float = Field(..., ge=0.0, le=1.0, description="일관성")
    timeliness: float = Field(..., ge=0.0, le=1.0, description="적시성")
    validity: float = Field(..., ge=0.0, le=1.0, description="유효성")
    overall_score: float = Field(..., ge=0.0, le=1.0, description="전체 점수")

class DataIntegrationJob(BaseModel):
    """데이터 통합 작업 모델"""
    job_id: str = Field(..., description="작업 ID")
    job_name: str = Field(..., description="작업 이름")
    data_sources: List[ExternalDataSource] = Field(..., description="데이터 소스들")
    status: str = Field(..., description="작업 상태")
    progress: float = Field(default=0.0, ge=0.0, le=1.0, description="진행률")
    started_at: datetime = Field(..., description="시작 시간")
    estimated_completion: Optional[datetime] = Field(default=None, description="예상 완료 시간")
    error_messages: List[str] = Field(default_factory=list, description="오류 메시지들")

# ============= 검증자 (Validators) =============

class PredictionRequest(PredictionRequest):
    @validator('variables')
    def validate_variables(cls, v):
        if not v:
            raise ValueError('최소 하나의 예측 변수가 필요합니다')
        
        total_weight = sum(var.weight for var in v)
        if abs(total_weight - 1.0) > 0.01:
            raise ValueError('변수들의 가중치 합은 1.0이어야 합니다')
        
        return v

class SentimentAnalysisRequest(SentimentAnalysisRequest):
    @validator('time_range')
    def validate_time_range(cls, v):
        valid_ranges = ['1h', '6h', '12h', '24h', '7d', '30d']
        if v not in valid_ranges:
            raise ValueError(f'유효한 시간 범위: {valid_ranges}')
        return v

# ============= 응답 래퍼 모델 =============

class APIResponse(BaseModel):
    """API 응답 래퍼"""
    success: bool = Field(..., description="성공 여부")
    message: str = Field(..., description="응답 메시지")
    data: Optional[Any] = Field(default=None, description="응답 데이터")
    error_code: Optional[str] = Field(default=None, description="오류 코드")
    timestamp: datetime = Field(default_factory=datetime.now, description="응답 시간")

class PaginatedResponse(BaseModel):
    """페이지네이션 응답 모델"""
    items: List[Any] = Field(..., description="아이템들")
    total: int = Field(..., description="전체 개수")
    page: int = Field(..., description="현재 페이지")
    size: int = Field(..., description="페이지 크기")
    pages: int = Field(..., description="전체 페이지 수")
    has_next: bool = Field(..., description="다음 페이지 존재 여부")
    has_prev: bool = Field(..., description="이전 페이지 존재 여부")