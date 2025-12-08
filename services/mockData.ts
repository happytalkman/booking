// Mock data for demo purposes when API keys are not configured

export const mockMarketInsights = {
  "항로 경쟁사 운임 비교": {
    title: "실시간 시장 분석 (데모 데이터)",
    content: `## 한미 항로 경쟁사 운임 비교 분석

### 주요 지수 현황
- **SCFI (상하이컨테이너운임지수)**: 1,245.3 (전주 대비 +2.3%)
- **북미 서안 운임**: $2,850/FEU (전주 대비 +5.1%)
- **북미 동안 운임**: $3,420/FEU (전주 대비 +3.8%)

### 경쟁사 운임 비교 (한국-LA 기준)
1. **KMTC**: $2,750/FEU ✅ 경쟁력 우위
2. **Maersk**: $2,950/FEU
3. **MSC**: $2,880/FEU
4. **CMA CGM**: $2,920/FEU

### 시장 동향
- 연말 성수기 진입으로 운임 상승세 지속
- 파나마 운하 통과 대기 시간 감소 (평균 8일 → 5일)
- 미국 소비 지표 개선으로 물동량 증가 예상

### 권장 사항
- 현재 KMTC 운임이 경쟁력 있는 수준
- 향후 2주간 추가 상승 가능성 있어 조기 부킹 권장`,
    sources: []
  },
  "홍해 사태가 스케줄에 미치는 영향": {
    title: "실시간 시장 분석 (데모 데이터)",
    content: `## 홍해 사태 영향 분석

### 현재 상황
- 홍해 우회 항로 지속 중 (희망봉 경유)
- 평균 항해 시간 **10-14일 추가 소요**
- 연료비 약 **30% 증가**

### 주요 항로별 영향
**아시아-유럽 항로**
- 기존: 수에즈 운하 경유 (25-28일)
- 현재: 희망봉 경유 (35-42일)
- 운임 영향: +$800-1,200/FEU

**아시아-지중해 항로**
- 가장 큰 영향권
- 스케줄 신뢰도 하락 (정시 도착률 65% → 48%)

### KMTC 대응 전략
1. 추가 선박 투입으로 주간 서비스 유지
2. 고객사 사전 공지 시스템 강화
3. 대체 항로 옵션 제공

### 향후 전망
- 2024년 상반기까지 우회 항로 지속 예상
- 운임 프리미엄 지속 가능성 높음`,
    sources: []
  },
  "유류할증료(BAF) 추세": {
    title: "실시간 시장 분석 (데모 데이터)",
    content: `## 유류할증료(BAF) 추세 분석

### 현재 유가 동향
- **싱가포르 벙커유(VLSFO)**: $625/톤 (전월 대비 +3.2%)
- **MGO**: $785/톤 (전월 대비 +2.8%)
- **Brent 원유**: $84.5/배럴

### 주요 항로별 BAF
**북미 항로**
- 서안: $450/FEU (전월 대비 +$20)
- 동안: $520/FEU (전월 대비 +$25)

**유럽 항로**
- 북유럽: $680/FEU (전월 대비 +$35)
- 지중해: $720/FEU (전월 대비 +$40)

**동남아 항로**
- $180/FEU (전월 대비 변동 없음)

### 향후 3개월 전망
1. **단기 (1개월)**: 소폭 상승 예상 (+2-3%)
2. **중기 (3개월)**: 안정세 유지
3. **변수**: OPEC+ 감산 정책, 중동 정세

### 비용 절감 팁
- 장기 계약 시 BAF 고정 옵션 검토
- 성수기 이전 조기 부킹으로 요율 확보
- 친환경 선박 이용 시 할인 혜택 활용`,
    sources: []
  }
};

export const mockChatResponses: Record<string, string> = {
  "안녕": "안녕하세요! KMTC AI 어시스턴트입니다. 해운 물류와 관련하여 무엇을 도와드릴까요?",
  "도움": "다음과 같은 도움을 드릴 수 있습니다:\n\n1. **시장 분석**: 운임 동향, 경쟁사 비교\n2. **리스크 관리**: 항로별 리스크 평가\n3. **에이전틱AI 부킹**: 최적 부킹 타이밍 추천\n4. **데이터 해석**: 대시보드 데이터 설명\n\n구체적으로 어떤 부분이 궁금하신가요?",
  "운임": "현재 주요 항로별 운임 동향입니다:\n\n**북미 항로**\n- 서안: $2,850/FEU (상승세)\n- 동안: $3,420/FEU (상승세)\n\n**유럽 항로**\n- 북유럽: $4,200/FEU (안정)\n- 지중해: $4,500/FEU (상승세)\n\n**동남아 항로**\n- $850/FEU (안정)\n\n더 자세한 항로별 분석이 필요하신가요?",
  "default": "죄송합니다. 현재 데모 모드로 실행 중입니다.\n\n**실제 AI 기능을 사용하려면:**\n\n1. .env.local 파일을 열어주세요\n2. 다음 중 하나의 API 키를 설정하세요:\n   - `VITE_OPENROUTER_API_KEY` (권장)\n   - `VITE_GEMINI_API_KEY`\n\n**OpenRouter 설정 방법:**\n- https://openrouter.ai 방문\n- 무료 계정 생성 및 API 키 발급\n- 여러 AI 모델 사용 가능 (GPT-4, Claude, Gemini 등)"
};

export function getMockMarketInsight(query: string) {
  // Find best matching mock data
  for (const [key, value] of Object.entries(mockMarketInsights)) {
    if (query.includes(key) || key.includes(query)) {
      return value;
    }
  }
  
  // Return default insight
  return {
    title: "시장 인사이트 (데모 데이터)",
    content: `## ${query}에 대한 분석

현재 **데모 모드**로 실행 중입니다.

### 실제 AI 분석을 받으려면:

1. **.env.local** 파일 설정
2. **VITE_OPENROUTER_API_KEY** 추가
3. 서버 재시작

### OpenRouter 장점:
- ✅ 여러 AI 모델 사용 가능
- ✅ 자동 폴백 시스템
- ✅ 무료 티어 제공
- ✅ GPT-4, Claude, Gemini 등 지원

자세한 설정 방법은 README.md를 참고하세요.`,
    sources: []
  };
}

export function getMockChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for keyword matches
  for (const [key, response] of Object.entries(mockChatResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return mockChatResponses.default;
}
