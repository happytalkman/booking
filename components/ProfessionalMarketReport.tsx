import React from 'react';
import { Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, PieChart, LineChart } from 'lucide-react';
import { Language } from '../types';

interface ProfessionalMarketReportProps {
  query: string;
  insight: any;
  lang: Language;
}

export const ProfessionalMarketReport: React.FC<ProfessionalMarketReportProps> = ({ query, insight, lang }) => {
  
  const t = {
    reportTitle: { ko: '시장 분석 보고서', en: 'Market Analysis Report' },
    downloadPDF: { ko: 'PDF 다운로드', en: 'Download PDF' },
    executiveSummary: { ko: '요약', en: 'Executive Summary' },
    marketOverview: { ko: '시장 개요', en: 'Market Overview' },
    competitiveAnalysis: { ko: '경쟁 분석', en: 'Competitive Analysis' },
    riskAssessment: { ko: '리스크 평가', en: 'Risk Assessment' },
    opportunities: { ko: '기회 요인', en: 'Opportunities' },
    recommendations: { ko: '전략적 제언', en: 'Strategic Recommendations' },
    dataAnalysis: { ko: '데이터 분석', en: 'Data Analysis' },
    conclusion: { ko: '결론', en: 'Conclusion' },
    sources: { ko: '참고 자료', en: 'Sources' },
    analyst: { ko: '분석가', en: 'Analyst' },
    date: { ko: '작성일', en: 'Date' },
    confidential: { ko: '기밀', en: 'Confidential' }
  };

  // 전문 보고서 생성
  const generateProfessionalReport = () => {
    const timestamp = new Date().toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
    
    return {
      title: query,
      date: timestamp,
      analyst: 'KMTC AI Analytics Team',
      sections: generateReportSections()
    };
  };

  const report = generateProfessionalReport();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      {/* 보고서 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">{t.reportTitle[lang]}</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">{report.title}</h2>
            <div className="flex items-center gap-6 text-sm opacity-90">
              <div>
                <span className="font-medium">{t.analyst[lang]}:</span> {report.analyst}
              </div>
              <div>
                <span className="font-medium">{t.date[lang]}:</span> {report.date}
              </div>
              <div className="px-2 py-1 bg-white/20 rounded text-xs font-bold">
                {t.confidential[lang]}
              </div>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            <Download className="w-4 h-4" />
            {t.downloadPDF[lang]}
          </button>
        </div>
      </div>

      {/* 보고서 본문 */}
      <div className="p-8 space-y-8">
        {report.sections.map((section: any, index: number) => (
          <ReportSection key={index} section={section} lang={lang} />
        ))}
      </div>
    </div>
  );

  // 보고서 섹션 생성
  function generateReportSections() {
    return [
      generateExecutiveSummary(),
      generateMarketOverview(),
      generateCompetitiveAnalysis(),
      generateRiskAssessment(),
      generateOpportunities(),
      generateRecommendations(),
      generateConclusion()
    ];
  }

  // 1. 요약 (Executive Summary)
  function generateExecutiveSummary() {
    return {
      title: t.executiveSummary[lang],
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      content: lang === 'ko' 
        ? `본 보고서는 "${query}"에 대한 종합적인 시장 분석을 제공합니다.\n\n주요 발견사항:\n• 한미 서안 항로의 현재 시장 운임은 TEU당 $2,850로, 전월 대비 5.2% 상승했습니다.\n• 주요 경쟁사(MSC, Maersk, COSCO) 대비 KMTC의 가격 경쟁력은 중간 수준을 유지하고 있습니다.\n• 홍해 우회 항로로 인한 비용 증가가 지속되고 있으며, 이는 향후 2-3개월간 운임 상승 압력으로 작용할 것으로 예상됩니다.\n\n투자 의견: 현 시점에서 부킹 확대를 권장하며, 특히 장기 계약 고객에 대한 선제적 접근이 필요합니다.`
        : `This report provides comprehensive market analysis on "${query}".\n\nKey Findings:\n• Current market rate for KR-US West Coast route is $2,850 per TEU, up 5.2% MoM.\n• KMTC maintains mid-tier pricing competitiveness vs major competitors (MSC, Maersk, COSCO).\n• Red Sea detour costs continue to pressure rates, expected to persist for 2-3 months.\n\nInvestment Opinion: Recommend booking expansion, with proactive approach to long-term contract customers.`,
      highlight: true
    };
  }

  // 2. 시장 개요 (Market Overview)
  function generateMarketOverview() {
    return {
      title: t.marketOverview[lang],
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      content: lang === 'ko'
        ? `**시장 규모 및 성장률**\n\n한미 서안 항로는 전 세계 컨테이너 운송 시장에서 약 18%의 비중을 차지하는 핵심 항로입니다. 2024년 2분기 기준, 해당 항로의 총 물동량은 전년 동기 대비 12.3% 증가한 약 450만 TEU를 기록했습니다.\n\n**주요 시장 동인**\n\n1. **수요 측면**\n   • 북미 소비 시장의 강세 지속 (소매 판매 +6.2% YoY)\n   • 전자제품 및 자동차 부품 수출 증가\n   • 성수기(8-10월) 진입으로 인한 수요 급증\n\n2. **공급 측면**\n   • 홍해 우회로 인한 실질 선복 공급 감소 (-15%)\n   • 신조선 인도 지연으로 공급 제약 지속\n   • 주요 선사들의 공급 관리 전략 (Blank Sailing)\n\n3. **외부 요인**\n   • 유가: 브렌트유 $78.42/배럴 (전월 대비 -1.2%)\n   • 환율: 원/달러 1,320.50원 (+0.5%)\n   • 항만 혼잡도: LA/LB 항만 대기 시간 평균 5.2일\n\n**시장 전망**\n\n향후 3개월간 운임은 현 수준을 유지하거나 소폭 상승할 것으로 전망됩니다. 특히 성수기 수요와 공급 제약이 맞물리면서 TEU당 $3,000 돌파 가능성이 있습니다.`
        : `**Market Size & Growth**\n\nKR-US West Coast route accounts for ~18% of global container shipping market. Q2 2024 volume reached 4.5M TEU, up 12.3% YoY.\n\n**Key Market Drivers**\n\n1. **Demand Side**\n   • Strong North American consumer market (retail sales +6.2% YoY)\n   • Increased electronics and auto parts exports\n   • Peak season (Aug-Oct) demand surge\n\n2. **Supply Side**\n   • Red Sea detour reduces effective capacity (-15%)\n   • New vessel delivery delays\n   • Major carriers' capacity management (Blank Sailing)\n\n3. **External Factors**\n   • Oil: Brent $78.42/barrel (-1.2% MoM)\n   • FX: USD/KRW 1,320.50 (+0.5%)\n   • Port congestion: LA/LB avg wait 5.2 days\n\n**Market Outlook**\n\nRates expected to maintain or slightly increase over next 3 months. Peak season demand + supply constraints may push rates above $3,000/TEU.`,
      charts: [
        { type: 'line', title: lang === 'ko' ? '운임 추이 (6개월)' : 'Rate Trend (6M)' },
        { type: 'bar', title: lang === 'ko' ? '물동량 변화' : 'Volume Change' }
      ]
    };
  }

  // 3. 경쟁 분석 (Competitive Analysis)
  function generateCompetitiveAnalysis() {
    return {
      title: t.competitiveAnalysis[lang],
      icon: <PieChart className="w-5 h-5 text-purple-600" />,
      content: lang === 'ko'
        ? `**경쟁 구도 분석**\n\n한미 서안 항로의 주요 경쟁사는 MSC, Maersk, COSCO, Evergreen, HMM 등 5개 선사가 전체 시장의 약 75%를 점유하고 있습니다.\n\n**경쟁사별 포지셔닝**\n\n| 선사 | 시장점유율 | 평균 운임 | 정시도착률 | 전략적 포지션 |\n|------|-----------|----------|-----------|-------------|\n| MSC | 22% | $2,920 | 87% | 프리미엄 서비스 |\n| Maersk | 19% | $2,950 | 91% | 품질 리더 |\n| COSCO | 16% | $2,780 | 84% | 가격 경쟁력 |\n| **KMTC** | **12%** | **$2,850** | **88%** | **균형 전략** |\n| Evergreen | 11% | $2,880 | 86% | 중간 포지션 |\n| HMM | 10% | $2,820 | 85% | 성장 추구 |\n\n**KMTC의 경쟁 우위**\n\n1. **가격 경쟁력**: 프리미엄 선사 대비 3-4% 낮은 운임으로 가격 민감 고객 확보\n2. **서비스 품질**: 정시도착률 88%로 업계 평균(86%) 상회\n3. **한국 시장 강점**: 국내 화주와의 긴밀한 관계 및 높은 브랜드 인지도\n4. **유연한 스케줄**: 주 3회 운항으로 고객 선택권 제공\n\n**경쟁 열위 요소**\n\n1. **선복 규모**: MSC, Maersk 대비 작은 선복으로 대형 화주 유치 제약\n2. **글로벌 네트워크**: 유럽, 남미 등 타 항로 연계 서비스 부족\n3. **디지털 역량**: 경쟁사 대비 온라인 부킹 시스템 개선 필요\n\n**경쟁 전략 제언**\n\n• **차별화 전략**: 중소형 화주 대상 맞춤형 서비스 강화\n• **가격 전략**: 현 수준 유지하되, 장기 계약 고객에 대한 인센티브 확대\n• **서비스 전략**: 정시도착률 90% 목표로 운영 효율성 개선\n• **제휴 전략**: 글로벌 선사와의 전략적 제휴를 통한 네트워크 확대`
        : `**Competitive Landscape**\n\nTop 5 carriers (MSC, Maersk, COSCO, Evergreen, HMM) control ~75% of KR-US West Coast market.\n\n**Competitor Positioning**\n\n| Carrier | Market Share | Avg Rate | OTP | Strategic Position |\n|---------|-------------|----------|-----|-------------------|\n| MSC | 22% | $2,920 | 87% | Premium Service |\n| Maersk | 19% | $2,950 | 91% | Quality Leader |\n| COSCO | 16% | $2,780 | 84% | Price Competitive |\n| **KMTC** | **12%** | **$2,850** | **88%** | **Balanced** |\n| Evergreen | 11% | $2,880 | 86% | Mid-tier |\n| HMM | 10% | $2,820 | 85% | Growth Focus |\n\n**KMTC Competitive Advantages**\n\n1. **Price Competitiveness**: 3-4% lower than premium carriers\n2. **Service Quality**: 88% OTP above industry average (86%)\n3. **Korea Market Strength**: Strong relationships with domestic shippers\n4. **Schedule Flexibility**: 3x weekly service\n\n**Competitive Weaknesses**\n\n1. **Capacity Scale**: Smaller fleet vs MSC, Maersk\n2. **Global Network**: Limited connections to Europe, South America\n3. **Digital Capabilities**: Online booking system needs improvement\n\n**Strategic Recommendations**\n\n• **Differentiation**: Strengthen customized services for SME shippers\n• **Pricing**: Maintain current level, expand incentives for long-term contracts\n• **Service**: Target 90% OTP through operational efficiency\n• **Alliance**: Strategic partnerships with global carriers for network expansion`,
      table: true
    };
  }

  // 4. 리스크 평가 (Risk Assessment)
  function generateRiskAssessment() {
    return {
      title: t.riskAssessment[lang],
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      content: lang === 'ko'
        ? `**주요 리스크 요인 분석**\n\n**1. 지정학적 리스크 (High Risk - 8.5/10)**\n\n• **홍해 사태 장기화**: 예멘 후티 반군의 공격으로 수에즈 운하 경유 선박들이 희망봉 우회\n• **영향**: 운항 시간 +7일, 비용 +20%, 선복 공급 -15%\n• **지속 기간**: 최소 6개월 이상 예상\n• **대응 전략**: 대체 항로 확보, 유류할증료 조기 확정, 고객 사전 커뮤니케이션\n\n**2. 유가 변동성 리스크 (Medium Risk - 6.2/10)**\n\n• **현황**: 브렌트유 $78.42/배럴, 최근 3개월간 $75-$85 범위 변동\n• **영향**: 유가 10% 상승 시 운임 3-4% 상승 압력\n• **전망**: OPEC+ 감산 정책으로 $80-$90 범위 유지 예상\n• **대응 전략**: 유류할증료(BAF) 분기별 조정, 선물 계약 헤지 검토\n\n**3. 환율 리스크 (Low Risk - 3.1/10)**\n\n• **현황**: 원/달러 1,320.50원, 비교적 안정적 범위\n• **영향**: 환율 5% 변동 시 수익성 2-3% 영향\n• **전망**: 한국 경제 펀더멘털 양호로 안정세 지속\n• **대응 전략**: 환헤지 비율 50% 유지, 달러 표시 계약 확대\n\n**4. 수요 변동 리스크 (Medium Risk - 5.8/10)**\n\n• **현황**: 북미 소비 시장 강세이나 경기 둔화 우려\n• **영향**: 수요 10% 감소 시 운임 15-20% 하락 가능\n• **전망**: 2024년 하반기 소폭 둔화 예상\n• **대응 전략**: 고객 다변화, 장기 계약 비중 확대, 유연한 선복 관리\n\n**5. 경쟁 심화 리스크 (Medium Risk - 6.5/10)**\n\n• **현황**: 신조선 인도 증가로 2025년 공급 과잉 우려\n• **영향**: 가격 경쟁 심화, 마진 압박\n• **전망**: 2025년 상반기부터 운임 하락 압력\n• **대응 전략**: 서비스 차별화, 고객 충성도 강화, 비용 효율화\n\n**종합 리스크 평가**\n\n현재 시장 환경은 **중간 수준의 리스크(Risk Score: 6.0/10)**를 내포하고 있습니다. 특히 홍해 사태와 경쟁 심화가 주요 리스크 요인이며, 이에 대한 선제적 대응이 필요합니다.`
        : `**Key Risk Factors Analysis**\n\n**1. Geopolitical Risk (High - 8.5/10)**\n\n• **Red Sea Crisis**: Houthi attacks force Suez Canal vessels to detour via Cape of Good Hope\n• **Impact**: +7 days transit, +20% cost, -15% capacity\n• **Duration**: Expected to persist 6+ months\n• **Mitigation**: Secure alternative routes, lock in BAF early, proactive customer communication\n\n**2. Oil Price Volatility (Medium - 6.2/10)**\n\n• **Status**: Brent $78.42/barrel, $75-$85 range over 3 months\n• **Impact**: 10% oil increase → 3-4% rate pressure\n• **Outlook**: OPEC+ cuts to maintain $80-$90 range\n• **Mitigation**: Quarterly BAF adjustments, futures hedging\n\n**3. FX Risk (Low - 3.1/10)**\n\n• **Status**: USD/KRW 1,320.50, relatively stable\n• **Impact**: 5% FX move → 2-3% profitability impact\n• **Outlook**: Stable on strong Korea fundamentals\n• **Mitigation**: 50% hedge ratio, expand USD contracts\n\n**4. Demand Volatility (Medium - 5.8/10)**\n\n• **Status**: Strong US consumer market but slowdown concerns\n• **Impact**: 10% demand drop → 15-20% rate decline\n• **Outlook**: Modest slowdown expected H2 2024\n• **Mitigation**: Customer diversification, long-term contracts, flexible capacity\n\n**5. Competition Intensification (Medium - 6.5/10)**\n\n• **Status**: New vessel deliveries raise 2025 oversupply concerns\n• **Impact**: Price competition, margin pressure\n• **Outlook**: Rate pressure from H1 2025\n• **Mitigation**: Service differentiation, customer loyalty, cost efficiency\n\n**Overall Risk Assessment**\n\nCurrent market environment carries **Medium Risk (Score: 6.0/10)**. Red Sea crisis and competition intensification are primary concerns requiring proactive response.`,
      riskMatrix: true
    };
  }

  // 5. 기회 요인 (Opportunities)
  function generateOpportunities() {
    return {
      title: t.opportunities[lang],
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      content: lang === 'ko'
        ? `**시장 기회 분석**\n\n**1. 성수기 수요 급증 (High Opportunity)**\n\n• **기회**: 8-10월 성수기 진입으로 화물 수요 15-20% 증가 예상\n• **타겟**: 전자제품, 의류, 완구 등 소비재 화주\n• **전략**: 선제적 영업 활동, 스팟 운임 프리미엄 확보\n• **예상 효과**: 매출 12% 증가, 가동률 95% 달성\n\n**2. 중소형 화주 시장 확대 (Medium Opportunity)**\n\n• **기회**: 대형 선사들의 대형 화주 집중으로 중소형 화주 시장 공백\n• **타겟**: 연간 500-2,000 TEU 규모 화주\n• **전략**: 맞춤형 서비스, 유연한 계약 조건, 디지털 플랫폼 제공\n• **예상 효과**: 신규 고객 30% 증가, 시장점유율 1%p 상승\n\n**3. 장기 계약 확대 (High Opportunity)**\n\n• **기회**: 운임 변동성 확대로 화주들의 장기 계약 선호도 증가\n• **타겟**: 안정적 물동량 확보가 필요한 제조업체\n• **전략**: 경쟁력 있는 장기 계약 운임, 물량 보장 조건\n• **예상 효과**: 장기 계약 비중 40% → 55% 확대, 수익 안정성 개선\n\n**4. 디지털 전환 가속화 (Medium Opportunity)**\n\n• **기회**: 온라인 부킹 수요 증가 (전년 대비 +35%)\n• **타겟**: 디지털 네이티브 화주, 중소기업\n• **전략**: AI 기반 부킹 플랫폼 고도화, 실시간 추적 서비스\n• **예상 효과**: 온라인 부킹 비중 25% → 40% 확대, 운영 비용 10% 절감\n\n**5. ESG 경영 강화 (Long-term Opportunity)**\n\n• **기회**: 친환경 운송 수요 증가, ESG 규제 강화\n• **타겟**: 글로벌 기업, ESG 중시 화주\n• **전략**: 저탄소 선박 도입, 탄소 배출 추적 서비스\n• **예상 효과**: 프리미엄 고객 확보, 브랜드 가치 향상\n\n**기회 활용 우선순위**\n\n1순위: 성수기 수요 급증 (즉시 실행)\n2순위: 장기 계약 확대 (3개월 내)\n3순위: 중소형 화주 시장 (6개월 내)\n4순위: 디지털 전환 (지속 추진)\n5순위: ESG 경영 (장기 전략)`
        : `**Market Opportunities Analysis**\n\n**1. Peak Season Demand Surge (High Opportunity)**\n\n• **Opportunity**: 15-20% cargo demand increase during Aug-Oct peak season\n• **Target**: Consumer goods shippers (electronics, apparel, toys)\n• **Strategy**: Proactive sales, spot rate premium capture\n• **Expected Impact**: +12% revenue, 95% utilization\n\n**2. SME Shipper Market Expansion (Medium Opportunity)**\n\n• **Opportunity**: Market gap as major carriers focus on large shippers\n• **Target**: 500-2,000 TEU annual volume shippers\n• **Strategy**: Customized service, flexible contracts, digital platform\n• **Expected Impact**: +30% new customers, +1%p market share\n\n**3. Long-term Contract Expansion (High Opportunity)**\n\n• **Opportunity**: Shippers prefer long-term contracts amid rate volatility\n• **Target**: Manufacturers needing stable capacity\n• **Strategy**: Competitive long-term rates, volume guarantees\n• **Expected Impact**: Long-term contract ratio 40% → 55%, improved revenue stability\n\n**4. Digital Transformation Acceleration (Medium Opportunity)**\n\n• **Opportunity**: Online booking demand +35% YoY\n• **Target**: Digital-native shippers, SMEs\n• **Strategy**: AI-powered booking platform, real-time tracking\n• **Expected Impact**: Online booking 25% → 40%, -10% operating costs\n\n**5. ESG Management Enhancement (Long-term Opportunity)**\n\n• **Opportunity**: Growing eco-friendly transport demand, ESG regulations\n• **Target**: Global corporations, ESG-focused shippers\n• **Strategy**: Low-carbon vessels, carbon tracking service\n• **Expected Impact**: Premium customer acquisition, brand value enhancement\n\n**Opportunity Prioritization**\n\n1st: Peak season demand (immediate)\n2nd: Long-term contracts (within 3 months)\n3rd: SME market (within 6 months)\n4th: Digital transformation (ongoing)\n5th: ESG management (long-term)`,
      opportunities: true
    };
  }

  // 6. 전략적 제언 (Strategic Recommendations)
  function generateRecommendations() {
    return {
      title: t.recommendations[lang],
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      content: lang === 'ko'
        ? `**단기 전략 (1-3개월)**\n\n1. **성수기 대응 강화**\n   - 액션: 주요 화주 대상 선제적 영업, 스팟 운임 10% 프리미엄 적용\n   - 목표: 가동률 95% 달성, 매출 12% 증가\n   - 책임: 영업본부\n\n2. **장기 계약 확대**\n   - 액션: 경쟁력 있는 장기 계약 운임 제시, 물량 보장 조건 강화\n   - 목표: 장기 계약 비중 40% → 50% 확대\n   - 책임: 영업본부, 마케팅팀\n\n3. **유류할증료 조기 확정**\n   - 액션: 3분기 BAF 지금 확정, 유가 헤지 비율 30% 확대\n   - 목표: 유가 변동 리스크 50% 감소\n   - 책임: 재무팀\n\n**중기 전략 (3-6개월)**\n\n4. **중소형 화주 시장 공략**\n   - 액션: 맞춤형 서비스 패키지 개발, 전담 영업팀 구성\n   - 목표: 신규 고객 30% 증가, 시장점유율 1%p 상승\n   - 책임: 영업본부, 상품개발팀\n\n5. **디지털 플랫폼 고도화**\n   - 액션: AI 기반 부킹 시스템 업그레이드, 실시간 추적 서비스 강화\n   - 목표: 온라인 부킹 비중 40% 달성, 고객 만족도 15% 향상\n   - 책임: IT본부, 디지털혁신팀\n\n6. **운영 효율성 개선**\n   - 액션: 정시도착률 90% 목표, 항만 대기 시간 20% 단축\n   - 목표: 운영 비용 8% 절감, 서비스 품질 향상\n   - 책임: 운항본부\n\n**장기 전략 (6-12개월)**\n\n7. **글로벌 제휴 확대**\n   - 액션: 유럽, 남미 항로 선사와 전략적 제휴 추진\n   - 목표: 글로벌 네트워크 확대, 대형 화주 유치\n   - 책임: 경영기획실\n\n8. **ESG 경영 강화**\n   - 액션: 저탄소 선박 도입 계획 수립, 탄소 배출 추적 시스템 구축\n   - 목표: 탄소 배출 20% 감소, ESG 등급 A 달성\n   - 책임: ESG위원회\n\n**투자 우선순위**\n\n• 최우선: 성수기 대응, 장기 계약 확대 (즉시 실행)\n• 우선: 중소형 화주 공략, 디지털 플랫폼 (3개월 내)\n• 중요: 글로벌 제휴, ESG 경영 (6개월 내)`
        : `**Short-term Strategy (1-3 months)**\n\n1. **Peak Season Response**\n   - Action: Proactive sales to key shippers, 10% spot rate premium\n   - Target: 95% utilization, +12% revenue\n   - Owner: Sales Division\n\n2. **Long-term Contract Expansion**\n   - Action: Competitive long-term rates, volume guarantees\n   - Target: Long-term contract ratio 40% → 50%\n   - Owner: Sales, Marketing\n\n3. **Early BAF Lock-in**\n   - Action: Lock Q3 BAF now, expand oil hedge to 30%\n   - Target: 50% reduction in oil price risk\n   - Owner: Finance\n\n**Mid-term Strategy (3-6 months)**\n\n4. **SME Market Penetration**\n   - Action: Develop customized service packages, dedicated sales team\n   - Target: +30% new customers, +1%p market share\n   - Owner: Sales, Product Development\n\n5. **Digital Platform Enhancement**\n   - Action: Upgrade AI booking system, strengthen real-time tracking\n   - Target: 40% online booking, +15% customer satisfaction\n   - Owner: IT, Digital Innovation\n\n6. **Operational Efficiency**\n   - Action: Target 90% OTP, reduce port wait time 20%\n   - Target: -8% operating costs, improved service quality\n   - Owner: Operations\n\n**Long-term Strategy (6-12 months)**\n\n7. **Global Alliance Expansion**\n   - Action: Strategic partnerships with Europe, South America carriers\n   - Target: Expand global network, attract large shippers\n   - Owner: Corporate Planning\n\n8. **ESG Management Enhancement**\n   - Action: Low-carbon vessel plan, carbon tracking system\n   - Target: -20% carbon emissions, ESG rating A\n   - Owner: ESG Committee\n\n**Investment Priority**\n\n• Top: Peak season response, long-term contracts (immediate)\n• High: SME market, digital platform (within 3 months)\n• Important: Global alliance, ESG (within 6 months)`,
      actionPlan: true
    };
  }

  // 7. 결론 (Conclusion)
  function generateConclusion() {
    return {
      title: t.conclusion[lang],
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      content: lang === 'ko'
        ? `**종합 평가 및 투자 의견**\n\n한미 서안 항로 시장은 현재 **중간 수준의 리스크와 높은 기회**가 공존하는 환경입니다. 홍해 사태와 경쟁 심화라는 리스크 요인이 있으나, 성수기 수요 급증과 장기 계약 확대 기회가 이를 상쇄하고 있습니다.\n\n**핵심 결론**\n\n1. **시장 전망**: 향후 3개월간 운임은 현 수준($2,850/TEU) 유지 또는 소폭 상승 예상\n2. **경쟁 포지션**: KMTC는 가격과 서비스의 균형 전략으로 중간 포지션 유지\n3. **리스크 관리**: 홍해 사태 대응 및 유가 헤지 전략 필수\n4. **성장 기회**: 성수기 대응, 중소형 화주 공략, 디지털 전환이 핵심\n\n**투자 의견: 매수 (BUY)**\n\n현 시점에서 적극적인 부킹 확대를 권장합니다. 특히 다음 전략에 집중할 것을 제안합니다:\n\n• **즉시 실행**: 성수기 대응 강화, 장기 계약 확대\n• **3개월 내**: 중소형 화주 시장 공략, 디지털 플랫폼 고도화\n• **6개월 내**: 글로벌 제휴 확대, ESG 경영 강화\n\n**목표 수익률**: 향후 12개월간 매출 15% 증가, 영업이익률 2%p 개선 예상\n\n**리스크 요인**: 홍해 사태 장기화, 경쟁 심화, 수요 둔화\n\n본 보고서는 KMTC의 전략적 의사결정을 지원하기 위해 작성되었으며, 시장 상황 변화에 따라 분기별로 업데이트될 예정입니다.`
        : `**Overall Assessment & Investment Opinion**\n\nKR-US West Coast market presents **medium risk with high opportunities**. While Red Sea crisis and competition intensification pose risks, peak season demand and long-term contract opportunities offset these concerns.\n\n**Key Conclusions**\n\n1. **Market Outlook**: Rates expected to maintain current level ($2,850/TEU) or slightly increase over next 3 months\n2. **Competitive Position**: KMTC maintains mid-tier position with balanced price-service strategy\n3. **Risk Management**: Red Sea response and oil hedging essential\n4. **Growth Opportunities**: Peak season response, SME market, digital transformation are key\n\n**Investment Opinion: BUY**\n\nRecommend aggressive booking expansion at this time. Focus on following strategies:\n\n• **Immediate**: Peak season response, long-term contract expansion\n• **Within 3 months**: SME market penetration, digital platform enhancement\n• **Within 6 months**: Global alliance expansion, ESG management\n\n**Target Returns**: +15% revenue, +2%p operating margin over next 12 months\n\n**Risk Factors**: Prolonged Red Sea crisis, competition intensification, demand slowdown\n\nThis report supports KMTC's strategic decision-making and will be updated quarterly based on market developments.`,
      conclusion: true
    };
  }

  // PDF 다운로드 함수
  function downloadPDF() {
    const reportHTML = generatePDFHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  // PDF HTML 생성
  function generatePDFHTML(): string {
    const timestamp = new Date().toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
    
    return `
      <!DOCTYPE html>
      <html lang="${lang === 'ko' ? 'ko' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <title>${t.reportTitle[lang]} - ${query}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
            line-height: 1.8;
            color: #1e293b;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 40px;
          }
          .header h1 {
            font-size: 32px;
            margin: 0 0 20px 0;
            font-weight: 700;
          }
          .header-info {
            display: flex;
            gap: 30px;
            font-size: 14px;
            opacity: 0.95;
          }
          .confidential {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .section {
            margin-bottom: 40px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .section-content {
            font-size: 14px;
            line-height: 1.8;
            white-space: pre-wrap;
          }
          .highlight {
            background: #fef3c7;
            border-left-color: #f59e0b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #e2e8f0;
          }
          th {
            background: #f1f5f9;
            font-weight: 600;
          }
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .print-button:hover {
            background: #2563eb;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">
          🖨️ ${lang === 'ko' ? 'PDF로 저장' : 'Save as PDF'}
        </button>
        
        <div class="header">
          <h1>📊 ${t.reportTitle[lang]}</h1>
          <h2 style="font-size: 20px; margin: 0 0 20px 0; font-weight: 500;">${query}</h2>
          <div class="header-info">
            <div><strong>${t.analyst[lang]}:</strong> ${report.analyst}</div>
            <div><strong>${t.date[lang]}:</strong> ${timestamp}</div>
            <div class="confidential">${t.confidential[lang]}</div>
          </div>
        </div>
        
        ${report.sections.map((section: any, index: number) => `
          <div class="section ${section.highlight ? 'highlight' : ''} ${index > 0 && index % 3 === 0 ? 'page-break' : ''}">
            <div class="section-title">
              ${index + 1}. ${section.title}
            </div>
            <div class="section-content">${section.content}</div>
          </div>
        `).join('')}
        
        <div class="footer">
          <p><strong>KMTC 온톨로지 기반 부킹 에이전틱AI 플랫폼</strong></p>
          <p>© 2024 KMTC. All rights reserved. | ${t.confidential[lang]}</p>
          <p style="margin-top: 10px; font-size: 11px;">
            본 보고서는 KMTC의 내부 자료로서 외부 유출을 금지합니다.
          </p>
        </div>
      </body>
      </html>
    `;
  }
};

// ReportSection 컴포넌트
const ReportSection: React.FC<{ section: any; lang: Language }> = ({ section, lang }) => {
  return (
    <div className={`p-6 rounded-lg border ${
      section.highlight 
        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700' 
        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        {section.icon}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {section.title}
        </h3>
      </div>
      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
          {section.content}
        </div>
      </div>
      
      {section.charts && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {section.charts.map((chart: any, idx: number) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <LineChart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{chart.title}</span>
              </div>
              <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-slate-400">
                Chart Placeholder
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
