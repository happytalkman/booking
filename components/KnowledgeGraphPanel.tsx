import React, { useState } from 'react';
import { Search, MessageSquare, Info, TrendingUp, ChevronUp, ChevronDown, Sparkles, Network, ArrowRight, X } from 'lucide-react';
import { Language } from '../types';

interface KnowledgeGraphPanelProps {
  lang: Language;
  selectedNode?: any;
  onSearch?: (query: string) => void;
}

type PanelTab = 'search' | 'chat' | 'details' | 'insights';

const KnowledgeGraphPanel: React.FC<KnowledgeGraphPanelProps> = ({ lang, selectedNode, onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  const t = {
    search: { ko: '검색', en: 'Search' },
    chat: { ko: '질의응답', en: 'Q&A' },
    details: { ko: '상세정보', en: 'Details' },
    insights: { ko: '인사이트', en: 'Insights' },
    searchPlaceholder: { ko: '노드, 관계, 속성 검색... (예: "KMTC와 연결된 항로")', en: 'Search nodes, relations, properties... (e.g., "Routes connected to KMTC")' },
    chatPlaceholder: { ko: '지식 그래프에 대해 질문하세요...', en: 'Ask about the knowledge graph...' },
    send: { ko: '전송', en: 'Send' },
    noNodeSelected: { ko: '노드를 선택하세요', en: 'Select a node' },
    quickQuestions: { ko: '빠른 질문', en: 'Quick Questions' },
    recentSearches: { ko: '최근 검색', en: 'Recent Searches' },
    suggestedQueries: { ko: '추천 검색어', en: 'Suggested Queries' },
    nodeType: { ko: '노드 타입', en: 'Node Type' },
    connections: { ko: '연결', en: 'Connections' },
    properties: { ko: '속성', en: 'Properties' },
    relatedNodes: { ko: '관련 노드', en: 'Related Nodes' },
    pathFinding: { ko: '경로 찾기', en: 'Find Path' },
    impactAnalysis: { ko: '영향도 분석', en: 'Impact Analysis' },
    anomalyDetection: { ko: '이상치 탐지', en: 'Anomaly Detection' },
    graphStats: { ko: '그래프 통계', en: 'Graph Statistics' },
    totalNodes: { ko: '전체 노드', en: 'Total Nodes' },
    totalEdges: { ko: '전체 엣지', en: 'Total Edges' },
    avgConnections: { ko: '평균 연결', en: 'Avg Connections' },
    clickToExpand: { ko: '클릭하여 펼치기', en: 'Click to expand' }
  };

  // 빠른 질문 목록
  const quickQuestions = [
    { ko: 'KMTC의 주요 항로는?', en: 'What are KMTC\'s main routes?' },
    { ko: '가장 많이 연결된 노드는?', en: 'Which node has most connections?' },
    { ko: '부산항과 연결된 모든 엔티티는?', en: 'All entities connected to Busan Port?' },
    { ko: '운임 예측과 관련된 요소는?', en: 'Factors related to freight prediction?' }
  ];

  // 추천 검색어
  const suggestedQueries = [
    { ko: 'KMTC', en: 'KMTC' },
    { ko: '부산항', en: 'Busan Port' },
    { ko: '운임', en: 'Freight' },
    { ko: '항로', en: 'Route' },
    { ko: '화주', en: 'Shipper' },
    { ko: '예측', en: 'Prediction' }
  ];

  // 그래프 통계 (실제로는 props로 받아야 함)
  const graphStats = {
    totalNodes: 49,
    totalEdges: 127,
    avgConnections: 2.6,
    nodeTypes: {
      shipper: 8,
      route: 12,
      booking: 15,
      prediction: 10,
      vessel: 4
    }
  };

  // 검색 처리
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
    // 실제로는 그래프 필터링 로직 실행
  };

  // 챗봇 메시지 전송
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatInput);
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }, 500);

    setChatInput('');
  };

  // AI 응답 생성 (실제로는 OpenRouter API 호출)
  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // 운임 관련 질문
    if (lowerQuery.includes('운임') || lowerQuery.includes('freight') || lowerQuery.includes('price')) {
      return lang === 'ko'
        ? `**운임 정보 분석**

현재 주요 항로의 운임 현황입니다.

**주요 항로 운임**
- 부산-LA: $2,850 (전월 대비 +5.2%)
- 부산-상하이: $850 (전월 대비 +2.1%)
- 인천-도쿄: $1,200 (전월 대비 -1.5%)

**운임 영향 요인**
- 유가 상승: 배럴당 $85 → 운임 상승 압력
- 홍해 리스크: 우회 항로로 인한 비용 증가
- 수요 증가: 성수기 진입으로 수요 15% 증가

**예측**
- 향후 2주: 5-8% 추가 상승 예상
- 부킹 추천: 지금 부킹 권장

더 궁금하신 점이 있으시면 물어보세요!`
        : `**Freight Rate Analysis**

Current freight rates for major routes:

**Major Routes**
- Busan-LA: $2,850 (+5.2% MoM)
- Busan-Shanghai: $850 (+2.1% MoM)
- Incheon-Tokyo: $1,200 (-1.5% MoM)

**Influencing Factors**
- Oil price increase: $85/barrel
- Red Sea risk: Detour costs
- Demand surge: +15% (peak season)

**Forecast**
- Next 2 weeks: 5-8% increase expected
- Recommendation: Book now

Feel free to ask more!`;
    }

    // 리스크 관련 질문
    if (lowerQuery.includes('리스크') || lowerQuery.includes('risk') || lowerQuery.includes('위험')) {
      return lang === 'ko'
        ? `**현재 주요 리스크 분석**

**🔴 높음 (즉시 조치 필요)**
- 홍해 지역 불안정성 (리스크 지수: 8.5/10)
  → 우회 항로 사용, 비용 20% 증가
  → 운항 시간 7일 추가

**🟡 중간 (모니터링 필요)**
- 유가 변동성 (리스크 지수: 6.2/10)
  → 배럴당 $80-$90 범위 변동
  → 운임에 직접 영향

**🟢 낮음 (정상 범위)**
- 환율 변동 (리스크 지수: 3.1/10)
  → 원/달러 1,300-1,320원 안정

**대응 전략**
- 홍해 항로: 대체 경로 확보
- 유가 헤지: 선물 계약 검토
- 실시간 모니터링 강화

더 자세한 분석이 필요하시면 말씀해주세요!`
        : `**Current Risk Analysis**

**🔴 High (Immediate Action)**
- Red Sea instability (Risk: 8.5/10)
  → Detour routes, +20% cost
  → +7 days transit time

**🟡 Medium (Monitor)**
- Oil price volatility (Risk: 6.2/10)
  → $80-$90/barrel range
  → Direct freight impact

**🟢 Low (Normal)**
- FX volatility (Risk: 3.1/10)
  → KRW/USD 1,300-1,320 stable

**Response Strategy**
- Red Sea: Secure alternative routes
- Oil: Consider futures hedging
- Enhance real-time monitoring

Ask for more details!`;
    }

    // 추천 관련 질문
    if (lowerQuery.includes('추천') || lowerQuery.includes('recommend') || lowerQuery.includes('부킹')) {
      return lang === 'ko'
        ? `**AI 부킹 추천**

현재 시장 상황을 분석한 결과입니다.

**✅ 지금 부킹 권장 항로**
1. 부산-LA 노선
   - 이유: 향후 2주 내 운임 5-8% 상승 예상
   - 신뢰도: 87%
   - 예상 절감: 약 $150-$200/TEU

2. 인천-도쿄 노선
   - 이유: 현재 운임 하락 추세 종료 시점
   - 신뢰도: 82%
   - 예상 절감: 약 $80-$100/TEU

**⏳ 대기 권장 항로**
- 부산-상하이 노선
  - 이유: 1주 후 운임 하락 가능성
  - 대기 기간: 5-7일
  - 예상 절감: 약 $30-$50/TEU

**📊 근거**
- ML 예측 모델 분석
- 과거 3년 계절성 패턴
- 실시간 시장 지표

결정에 도움이 되셨나요?`
        : `**AI Booking Recommendation**

Based on current market analysis:

**✅ Book Now**
1. Busan-LA Route
   - Reason: 5-8% increase expected in 2 weeks
   - Confidence: 87%
   - Savings: ~$150-$200/TEU

2. Incheon-Tokyo Route
   - Reason: Downtrend ending
   - Confidence: 82%
   - Savings: ~$80-$100/TEU

**⏳ Wait**
- Busan-Shanghai Route
  - Reason: Possible decrease in 1 week
  - Wait: 5-7 days
  - Savings: ~$30-$50/TEU

**📊 Based On**
- ML prediction models
- 3-year seasonal patterns
- Real-time market indicators

Hope this helps!`;
    }

    // 예측 관련 질문
    if (lowerQuery.includes('예측') || lowerQuery.includes('predict') || lowerQuery.includes('forecast')) {
      return lang === 'ko'
        ? `**ML 운임 예측 결과**

TensorFlow.js 기반 30일 예측입니다.

**부산-LA 노선**
- 현재: $2,850
- 1주 후: $2,950 (+3.5%)
- 2주 후: $3,080 (+8.1%)
- 4주 후: $3,150 (+10.5%)
- 신뢰 구간: ±$120

**주요 영향 요인**
1. 유가 (영향도: 35%)
   - 현재 $85/배럴
   - 예상: $88-$92/배럴

2. 수요 (영향도: 28%)
   - 성수기 진입
   - 전년 대비 +15%

3. 홍해 리스크 (영향도: 22%)
   - 우회 항로 지속
   - 비용 증가 압력

**예측 정확도**
- 과거 30일: 92.3%
- 과거 90일: 88.7%

더 궁금하신 점이 있으시면 물어보세요!`
        : `**ML Freight Prediction**

30-day forecast using TensorFlow.js:

**Busan-LA Route**
- Current: $2,850
- 1 week: $2,950 (+3.5%)
- 2 weeks: $3,080 (+8.1%)
- 4 weeks: $3,150 (+10.5%)
- Confidence: ±$120

**Key Factors**
1. Oil Price (Impact: 35%)
   - Current: $85/barrel
   - Expected: $88-$92

2. Demand (Impact: 28%)
   - Peak season entry
   - +15% YoY

3. Red Sea Risk (Impact: 22%)
   - Detour continues
   - Cost pressure

**Accuracy**
- Past 30 days: 92.3%
- Past 90 days: 88.7%

Ask more!`;
    }
    
    // Market Price 허브 노드 관련
    if (lowerQuery.includes('market price') || (lowerQuery.includes('마켓') && lowerQuery.includes('프라이스')) || lowerQuery.includes('중요')) {
      return lang === 'ko' 
        ? `**Market Price 노드의 중요성**

Market Price 노드는 전체 네트워크에서 가장 중요한 허브 역할을 합니다.

**중심 허브 역할 (23개 연결)**
- 전체 네트워크에서 가장 많은 연결을 가진 노드
- 부킹, 항로, 화주, 예측 모델 등과 직접 연결
- 정보 흐름의 중심점 역할

**비즈니스 영향력**
- 시장 운임 변동 → 즉시 부킹 결정에 영향
- 화주들의 계약 조건과 직결
- 경쟁사 가격 전략에 연동

**예측 모델의 핵심 변수**
- ML 예측 모델의 주요 입력 변수
- 운임 예측 정확도에 가장 큰 영향
- 실시간 데이터 업데이트 필수

**리스크 관리**
- 급격한 가격 변동 시 전체 네트워크에 파급 효과
- 실시간 모니터링 필수
- 이상 탐지 시스템 연동`
        : `Let me explain why the Market Price node is crucial:

**1. Central Hub Role (23 connections)**
- Most connected node in the entire network
- Directly linked to bookings, routes, shippers, and prediction models

**2. Business Impact**
- Market freight changes immediately affect booking decisions
- Directly tied to shipper contract terms
- Connected to competitor pricing strategies

**3. Core Variable in Prediction Models**
- Primary input variable for ML prediction models
- Greatest impact on freight prediction accuracy

**4. Risk Management**
- Rapid price changes ripple through entire network
- Real-time monitoring is essential

Feel free to ask more questions!`;
    }
    
    // 클러스터 분석 관련
    if (lowerQuery.includes('클러스터') || lowerQuery.includes('cluster') || lowerQuery.includes('그룹')) {
      return lang === 'ko'
        ? `**클러스터 분석 결과**

네트워크에서 3개의 주요 클러스터가 발견되었습니다.

**클러스터 1: 항로 그룹 (12개 노드)**
- 지리적 연결성 중심
- 주요 노드: 부산-LA, 부산-상하이, 인천-도쿄
- 항구 간 직접 연결 패턴
- 물리적 운송 네트워크 구성

**클러스터 2: 화주 그룹 (8개 노드)**
- 거래 관계 중심
- 주요 노드: 삼성전자, LG전자, 현대자동차
- 계약 및 부킹 관계로 연결
- 고객 세그먼트 형성

**클러스터 3: 예측 그룹 (10개 노드)**
- 데이터 흐름 중심
- 주요 노드: ML 모델, 시장 지표, 과거 데이터
- 데이터 의존성으로 연결
- 의사결정 지원 시스템 구성

**클러스터 간 연결**
- Market Price가 3개 클러스터를 연결하는 브릿지
- 정보 흐름의 중심점 역할
- 클러스터 간 시너지 효과 창출`
        : `Detailed cluster analysis results:

**📍 Cluster 1: Route Group (12 nodes)**
- Feature: Geographic connectivity focus
- Key nodes: Busan-LA, Busan-Shanghai, Incheon-Tokyo
- Connection pattern: Direct port-to-port links
- Business meaning: Physical transport network

**👥 Cluster 2: Shipper Group (8 nodes)**
- Feature: Transaction relationship focus
- Key nodes: Samsung, LG, Hyundai
- Connection pattern: Contract and booking relationships
- Business meaning: Customer segments

**🔮 Cluster 3: Prediction Group (10 nodes)**
- Feature: Data flow focus
- Key nodes: ML models, market indices, historical data
- Connection pattern: Data dependencies
- Business meaning: Decision support system

**💡 Inter-cluster Connections**
- Market Price acts as bridge connecting all 3 clusters
- Central point of information flow

Any specific cluster you'd like to know more about?`;
    }

    // KMTC 연결 패턴 관련
    if (lowerQuery.includes('kmtc') && (lowerQuery.includes('패턴') || lowerQuery.includes('pattern') || lowerQuery.includes('의미'))) {
      return lang === 'ko'
        ? `**KMTC 노드의 연결 패턴 분석**

KMTC는 네트워크에서 핵심 허브 역할을 하고 있습니다.

**연결 통계**
- 총 연결: 18개 (평균의 2.3배)
- 직접 연결: 12개 항로, 4개 화주, 2개 예측 모델
- 네트워크 중심성 지수: 상위 5%

**전략적 위치**

허브 앤 스포크 구조
- KMTC가 중심 허브 역할
- 효율적인 네트워크 운영 가능
- 정보 흐름 최적화

다각화된 포트폴리오
- 다양한 항로와 화주 연결
- 리스크 분산 효과
- 안정적인 수익 구조

데이터 중심성
- 예측 모델과 직접 연결
- 실시간 의사결정 가능
- AI 기반 최적화

**비즈니스 시사점**
- 시장 지배력: 높은 연결성으로 시장 영향력 확보
- 정보 우위: 다양한 데이터 소스 접근 가능
- 유연성: 빠른 시장 대응 능력
- 리스크: 의존도 높은 노드 장애 시 영향 큼

**개선 제안**
- 백업 연결 강화로 안정성 확보
- 중요 노드 실시간 모니터링
- 대체 경로 사전 확보`
        : `Business implications of KMTC node's connection pattern:

**📊 Connection Statistics**
- Total connections: 18 (2.3x average of 7.8)
- Direct links: 12 routes, 4 shippers, 2 prediction models

**🎯 Strategic Position**
1. **Hub-and-Spoke Structure**
   - KMTC as central hub
   - Enables efficient network operations

2. **Diversified Portfolio**
   - Connected to various routes and shippers
   - Risk distribution effect

3. **Data Centrality**
   - Direct connection to prediction models
   - Real-time decision making capability

**💼 Business Implications**
- ✅ Market Power: High connectivity = Market influence
- ✅ Information Advantage: Access to diverse data sources
- ✅ Flexibility: Quick market response capability
- ⚠️ Risk: High impact if dependent nodes fail

**🔄 Improvement Suggestions**
- Strengthen backup connections
- Enhance critical node monitoring
- Secure alternative paths

Would you like analysis from another perspective?`;
    }
    
    // 일반 KMTC 항로 질문
    if (lowerQuery.includes('kmtc') && lowerQuery.includes('항로')) {
      return lang === 'ko' 
        ? 'KMTC는 현재 12개의 주요 항로를 운영하고 있습니다. 가장 활발한 항로는 부산-LA 노선으로, 주 3회 운항하고 있습니다. 그래프에서 KMTC 노드를 클릭하시면 연결된 모든 항로를 확인하실 수 있습니다.\n\n더 자세한 정보가 필요하시면 "KMTC의 연결 패턴이 비즈니스에 어떤 의미가 있나요?"라고 물어보세요!'
        : 'KMTC currently operates 12 major routes. The most active route is Busan-LA, operating 3 times per week. Click the KMTC node in the graph to see all connected routes.\n\nFor more details, ask "What does KMTC node\'s connection pattern mean for business?"';
    }
    
    // 일반 연결 질문
    if (lowerQuery.includes('연결') || lowerQuery.includes('connection')) {
      return lang === 'ko'
        ? '그래프에서 가장 많이 연결된 노드는 "Market Price" 노드로, 23개의 다른 엔티티와 연결되어 있습니다. 이는 시장 가격이 부킹, 항로, 예측 등 다양한 요소에 영향을 미치기 때문입니다.\n\n더 알고 싶으시면 "Market Price 노드가 왜 중요한가요?"라고 물어보세요!'
        : 'The most connected node is "Market Price" with 23 connections to other entities. This is because market price affects bookings, routes, predictions, and more.\n\nTo learn more, ask "Why is the Market Price node important?"';
    }

    // 기본 응답
    return lang === 'ko'
      ? `질문에 대한 답변을 찾고 있습니다. 

**추천 질문:**
• "Market Price 노드가 왜 중요한가요?"
• "클러스터 분석 결과를 자세히 설명해주세요"
• "KMTC 노드의 연결 패턴이 비즈니스에 어떤 의미가 있나요?"

또는 인사이트 탭의 카드를 클릭하시면 자동으로 상세 설명을 받으실 수 있습니다!`
      : `I'm searching for an answer.

**Suggested questions:**
• "Why is the Market Price node important?"
• "Please explain the cluster analysis in detail"
• "What does KMTC node's connection pattern mean for business?"

Or click any insight card in the Insights tab for automatic detailed explanations!`;
  };

  return (
    <>
      {/* 하단 탭 바 (항상 표시) */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* 펼치기/접기 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-t-xl shadow-lg transition-all flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm font-medium">{t.clickToExpand[lang]}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm font-medium">{t.clickToExpand[lang]}</span>
              </>
            )}
          </button>
        </div>

        {/* 슬라이드업 패널 */}
        <div
          className={`bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-2xl transition-all duration-300 ${
            isExpanded ? 'h-[500px]' : 'h-0'
          } overflow-hidden`}
        >
          {/* 탭 헤더 */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'search'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Search className="w-4 h-4" />
                {t.search[lang]}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'chat'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {t.chat[lang]}
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'details'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Info className="w-4 h-4" />
                {t.details[lang]}
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'insights'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {t.insights[lang]}
              </button>
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="h-[calc(100%-57px)] overflow-y-auto p-6">
            {/* 검색 탭 */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                {/* 검색 입력 */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    placeholder={t.searchPlaceholder[lang]}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                {/* 추천 검색어 */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {t.suggestedQueries[lang]}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(query[lang])}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {query[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 그래프 통계 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {graphStats.totalNodes}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.totalNodes[lang]}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {graphStats.totalEdges}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.totalEdges[lang]}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {graphStats.avgConnections}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.avgConnections[lang]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 질의응답 탭 */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                {/* 빠른 질문 */}
                {chatMessages.length === 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      {t.quickQuestions[lang]}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quickQuestions.map((q, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setChatInput(q[lang]);
                            setTimeout(() => handleChatSubmit(), 100);
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-left text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-start gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{q[lang]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 채팅 메시지 */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index}>
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="space-y-3">
                              {msg.content.split('\n\n').map((paragraph, pIdx) => {
                                // 제목 처리 (##, **로 시작하는 줄)
                                if (paragraph.startsWith('**') && paragraph.includes('**')) {
                                  const title = paragraph.replace(/\*\*/g, '').trim();
                                  return (
                                    <div key={pIdx} className="font-bold text-lg text-blue-600 dark:text-blue-400 mt-4 first:mt-0">
                                      {title}
                                    </div>
                                  );
                                }
                                
                                // 리스트 처리
                                if (paragraph.includes('\n-') || paragraph.includes('\n•')) {
                                  const lines = paragraph.split('\n');
                                  const title = lines[0].replace(/\*\*/g, '');
                                  const items = lines.slice(1).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
                                  
                                  return (
                                    <div key={pIdx} className="space-y-2">
                                      {title && <div className="font-semibold text-slate-800 dark:text-slate-200">{title}</div>}
                                      <ul className="space-y-1.5 ml-4">
                                        {items.map((item, iIdx) => (
                                          <li key={iIdx} className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span className="flex-1">{item.replace(/^[-•]\s*/, '').replace(/\*\*/g, '')}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                }
                                
                                // 번호 리스트 처리
                                if (/^\d+\./.test(paragraph.trim())) {
                                  const lines = paragraph.split('\n').filter(l => l.trim());
                                  return (
                                    <ol key={pIdx} className="space-y-2 ml-4 list-decimal">
                                      {lines.map((line, lIdx) => (
                                        <li key={lIdx} className="pl-2">
                                          {line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
                                        </li>
                                      ))}
                                    </ol>
                                  );
                                }
                                
                                // 일반 텍스트
                                return (
                                  <p key={pIdx} className="leading-relaxed">
                                    {paragraph.replace(/\*\*/g, '')}
                                  </p>
                                );
                              })}
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>
                      
                      {/* AI 응답 후 추천 질문 */}
                      {msg.role === 'assistant' && index === chatMessages.length - 1 && (
                        <div className="mt-3 ml-4 space-y-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {lang === 'ko' ? '💡 추천 질문:' : '💡 Suggested Questions:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { ko: '더 자세히 설명해주세요', en: 'Explain in more detail' },
                              { ko: '실제 사례를 알려주세요', en: 'Show me real examples' },
                              { ko: '다른 관점은?', en: 'Other perspectives?' }
                            ].map((q, qIdx) => (
                              <button
                                key={qIdx}
                                onClick={() => {
                                  setChatInput(q[lang]);
                                  setTimeout(() => handleChatSubmit(), 100);
                                }}
                                className="text-xs px-3 py-1.5 bg-white dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-slate-500 border border-slate-200 dark:border-slate-500 rounded-full transition-colors text-slate-700 dark:text-slate-200"
                              >
                                {q[lang]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 입력 영역 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder={t.chatPlaceholder[lang]}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium"
                  >
                    {t.send[lang]}
                  </button>
                </div>
              </div>
            )}

            {/* 상세정보 탭 */}
            {activeTab === 'details' && (
              <div>
                {selectedNode ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {selectedNode.label || 'Selected Node'}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                          {selectedNode.type || 'Unknown Type'}
                        </span>
                      </div>
                    </div>

                    {/* 속성 */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        {t.properties[lang]}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <span className="text-slate-600 dark:text-slate-400">ID</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {selectedNode.id || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <span className="text-slate-600 dark:text-slate-400">{t.connections[lang]}</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {selectedNode.connections || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 관련 노드 */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        {t.relatedNodes[lang]}
                      </h4>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Network className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-900 dark:text-white">Related Node {i}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Network className="w-16 h-16 mb-4" />
                    <p>{t.noNodeSelected[lang]}</p>
                  </div>
                )}
              </div>
            )}

            {/* 인사이트 탭 */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                <div 
                  onClick={() => {
                    setActiveTab('chat');
                    setChatInput(lang === 'ko' 
                      ? 'Market Price 노드가 왜 중요한가요? 자세히 설명해주세요.'
                      : 'Why is the Market Price node important? Please explain in detail.');
                    setTimeout(() => handleChatSubmit(), 100);
                  }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                        {lang === 'ko' ? '주요 허브 노드 발견' : 'Key Hub Node Detected'}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                        {lang === 'ko' 
                          ? '"Market Price" 노드가 23개의 연결을 가진 중심 허브입니다. 이 노드의 변화는 전체 네트워크에 큰 영향을 미칩니다.'
                          : '"Market Price" node is a central hub with 23 connections. Changes to this node significantly impact the entire network.'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        <MessageSquare className="w-3 h-3" />
                        <span>{lang === 'ko' ? '클릭하여 AI에게 자세히 물어보기' : 'Click to ask AI for details'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setActiveTab('chat');
                    setChatInput(lang === 'ko'
                      ? '클러스터 분석 결과를 자세히 설명해주세요. 각 그룹의 특징은 무엇인가요?'
                      : 'Please explain the cluster analysis in detail. What are the characteristics of each group?');
                    setTimeout(() => handleChatSubmit(), 100);
                  }}
                  className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-1">
                        {lang === 'ko' ? '클러스터 분석' : 'Cluster Analysis'}
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                        {lang === 'ko'
                          ? '3개의 주요 클러스터가 감지되었습니다: 항로 그룹, 화주 그룹, 예측 그룹'
                          : '3 major clusters detected: Route Group, Shipper Group, Prediction Group'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <MessageSquare className="w-3 h-3" />
                        <span>{lang === 'ko' ? '클릭하여 AI에게 자세히 물어보기' : 'Click to ask AI for details'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setActiveTab('chat');
                    setChatInput(lang === 'ko'
                      ? 'KMTC 노드의 연결 패턴이 비즈니스에 어떤 의미가 있나요?'
                      : 'What does KMTC node\'s connection pattern mean for business?');
                    setTimeout(() => handleChatSubmit(), 100);
                  }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Network className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 dark:text-green-300 mb-1">
                        {lang === 'ko' ? '연결 패턴' : 'Connection Pattern'}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                        {lang === 'ko'
                          ? 'KMTC 노드는 평균보다 2.3배 많은 연결을 가지고 있어 네트워크의 핵심 역할을 합니다.'
                          : 'KMTC node has 2.3x more connections than average, playing a key role in the network.'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                        <MessageSquare className="w-3 h-3" />
                        <span>{lang === 'ko' ? '클릭하여 AI에게 자세히 물어보기' : 'Click to ask AI for details'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default KnowledgeGraphPanel;
