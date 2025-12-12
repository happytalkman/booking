import React, { useState, useEffect } from 'react';
import { Ship, Search, Newspaper, ExternalLink, Loader2, Anchor, BarChart2 } from 'lucide-react';
import { fetchMarketInsights } from '../services/geminiService';
import { MarketInsight, Language } from '../types';
import { ProfessionalMarketReport } from '../components/ProfessionalMarketReport';
import MLPredictionPanel from '../components/MLPredictionPanel';
import MarketSentimentAnalyzer from '../components/MarketSentimentAnalyzer';

interface MarketIntelProps {
  lang: Language;
}

const MarketIntel: React.FC<MarketIntelProps> = ({ lang }) => {
  const t = {
    title: { ko: '마켓 인텔리전스 & 벤치마크', en: 'Market Intelligence & Benchmark' },
    subtitle: { ko: '경쟁사 분석, 외부 요인(유가/환율) 및 실시간 시장 뉴스', en: 'Competitor analysis, External Factors (Oil/Forex), and Real-time Market News.' },
    
    scfi: { ko: 'SCFI 지수', en: 'SCFI Index' },
    scfiSub: { ko: '상하이 -> 유럽', en: 'Shanghai -> Europe' },
    oil: { ko: '브렌트유', en: 'Brent Crude' },
    oilSub: { ko: '배럴당', en: 'Per Barrel' },
    forex: { ko: '원/달러 환율', en: 'USD/KRW' },
    forexSub: { ko: '환율', en: 'Exchange Rate' },
    
    aiSearch: { ko: 'AI 시장 조사', en: 'AI Market Research' },
    placeholder: { ko: '경쟁사 운임, 항만 혼잡도에 대해 물어보세요...', en: 'Ask about competitor rates, port congestion...' },
    analyze: { ko: '분석하기', en: 'Analyze' },
    quickAnalysis: { ko: '빠른 분석:', en: 'Quick Analysis:' },
    
    noAnalysis: { ko: '아직 생성된 분석이 없습니다.', en: 'No analysis generated yet.' },
    noAnalysisSub: { ko: '빠른 분석 주제를 선택하거나 직접 질문을 입력하세요.', en: 'Select a quick analysis topic or enter a custom query.' },
    sources: { ko: '출처', en: 'Sources' },
    
    alertsTitle: { ko: '경쟁사 알림', en: 'Competitor Alerts' },
    new: { ko: '3건 신규', en: '3 New' },
    viewAll: { ko: '모든 알림 보기', en: 'View All Alerts' },
    
    adviceTitle: { ko: '전략적 조언', en: 'Strategic Advice' },
    adviceText: { 
      ko: '현재 유가 상승 추세(+1.2%)를 감안하여, 비용 변동을 피하기 위해 3분기 계약의 유류할증료(BAF)를 지금 확정하는 것을 고려하세요.', 
      en: 'Based on current oil price trends (+1.2%), consider locking in BAF for Q3 contracts now to avoid cost fluctuation.' 
    },
    apply: { ko: '제안 적용하기', en: 'Apply Recommendation' },
    
    quickQueries: [
      { ko: '한미 항로 경쟁사 운임 벤치마크', en: 'Competitor Rate Benchmark KR-US' },
      { ko: '홍해 사태가 스케줄에 미치는 영향', en: 'Impact of Red Sea Crisis on Schedules' },
      { ko: '유류할증료(BAF) 추세', en: 'Bunker Adjustment Factor (BAF) Trends' }
    ],
    
    alert1: { 
      ko: 'KR-US-WC 항로 스팟 운임 $150 인하', 
      en: 'Lowered Spot Rate on KR-US-WC by $150.' 
    },
    alert2: { 
      ko: '베트남 신규 직기항 서비스 시작', 
      en: 'Launched new direct service to Vietnam.' 
    }
  };

  const defaultQuery = lang === 'ko' ? 'KMTC 대비 한미 서안 항로 경쟁사 운임 비교' : 'Competitor rates for KR-US West Coast route vs KMTC';
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<MarketInsight | null>(null);

  // Update query when language changes (only if it matches the default of the previous language to avoid overwriting user input)
  useEffect(() => {
     setQuery(defaultQuery);
  }, [lang]);

  const handleSearch = async (customQuery?: string) => {
    const q = customQuery || query;
    setQuery(q);
    setLoading(true);
    const result = await fetchMarketInsights(q);
    setInsight(result);
    setLoading(false);
  };

  const marketIndicators = [
    { label: t.scfi[lang], value: '2,150.00', change: '+5.2%', color: 'text-green-600', sub: t.scfiSub[lang] },
    { label: t.oil[lang], value: '$78.42', change: '-1.2%', color: 'text-red-500', sub: t.oilSub[lang] },
    { label: t.forex[lang], value: '1,320.50', change: '+0.5%', color: 'text-slate-600 dark:text-slate-400', sub: t.forexSub[lang] },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
           <Ship className="w-7 h-7 text-blue-600" /> {t.title[lang]}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
      </div>

      {/* External Factors Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketIndicators.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
             </div>
             <div className={`px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700 font-bold text-sm ${item.color}`}>
                {item.change}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search / Generative AI Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
               <Search className="w-4 h-4 text-blue-500"/> {t.aiSearch[lang]}
            </h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm text-slate-900 dark:text-white"
                placeholder={t.placeholder[lang]}
              />
              <button 
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : t.analyze[lang]}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs font-semibold text-slate-400 py-1.5">{t.quickAnalysis[lang]}</span>
               {t.quickQueries.map(item => (
                  <button 
                    key={item[lang]}
                    onClick={() => handleSearch(item[lang])}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 transition border border-slate-200 dark:border-slate-600"
                  >
                    {item[lang]}
                  </button>
               ))}
            </div>
          </div>

          {/* AI Result Display - Professional Report */}
          {insight ? (
            <ProfessionalMarketReport query={query} insight={insight} lang={lang} />
          ) : (
             !loading && (
               <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-10 flex flex-col items-center justify-center text-center">
                  <BarChart2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.noAnalysis[lang]}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.noAnalysisSub[lang]}</p>
               </div>
             )
          )}
        </div>

        {/* Competitor Sidebar */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center justify-between">
                 <span>{t.alertsTitle[lang]}</span>
                 <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{t.new[lang]}</span>
              </h3>
              <div className="space-y-3">
                 <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500 transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Comp A</span>
                       <span className="text-[10px] text-slate-400">2h ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{t.alert1[lang]}</p>
                 </div>
                 <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500 transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Comp B</span>
                       <span className="text-[10px] text-slate-400">5h ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{t.alert2[lang]}</p>
                 </div>
              </div>
              <button className="w-full mt-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded hover:bg-blue-50 dark:hover:bg-blue-900/50">
                 {t.viewAll[lang]}
              </button>
           </div>

           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-xl text-white shadow-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                 <Anchor className="w-4 h-4 text-blue-200" /> {t.adviceTitle[lang]}
              </h3>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                 {t.adviceText[lang]}
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition backdrop-blur-sm">
                 {t.apply[lang]}
              </button>
           </div>
        </div>
      </div>

      {/* Advanced ML Prediction Panel */}
      <div className="mt-8">
        <MLPredictionPanel lang={lang} />
      </div>

      {/* Market Sentiment Analyzer */}
      <div className="mt-8">
        <MarketSentimentAnalyzer lang={lang} />
      </div>
    </div>
  );
};

export default MarketIntel;