import React from 'react';
import { Network, TrendingUp, AlertTriangle, LayoutDashboard, Share2, Search, ArrowRight, Database, Ship } from 'lucide-react';
import { Language } from '../types';

interface HomeProps {
  lang: Language;
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const t = {
    title: { ko: '부킹최적화 솔루션 플랫폼', en: 'Booking Optimization Platform' },
    subtitle: { ko: 'Palantir 온톨로지 기반 영업/운항 의사결정 지원 시스템', en: 'Palantir Ontology-based Decision Support System for Sales & Ops' },
    
    section1Title: { ko: '플랫폼 개요', en: 'Platform Overview' },
    introText: { ko: '솔루션 소개 및 도입 목적', en: 'Introduction & Objectives' },
    
    objectiveTitle: { ko: '도입 목적', en: 'Objective' },
    objectiveDesc: { ko: '데이터 기반의 정교한 부킹 수요 예측, 영업 활동의 최적화, 그리고 선복 운영 효율화를 통한 수익성 극대화를 목표로 합니다.', en: 'Maximize profitability through data-driven booking forecasting, sales optimization, and efficient fleet operation.' },
    
    techTitle: { ko: '핵심 기술', en: 'Core Technology' },
    techDesc: { ko: 'Palantir 온톨로지와 지식 그래프 기술을 활용하여 고객, 부킹, 항로, 선박, 시황 간의 복잡한 연결 관계를 통합 분석합니다.', en: 'Integrated analysis of complex relationships between customers, bookings, routes, vessels, and market conditions using Palantir Ontology and Knowledge Graph.' },
    
    valueTitle: { ko: '기대 가치', en: 'Expected Value' },
    valueDesc: { ko: '매출 증대 및 수익성 개선, 취소/노쇼 리스크의 선제적 감축, 선복 활용률(Load Factor) 향상, 영업 조직의 생산성 증대 효과를 제공합니다.', en: 'Increase revenue, proactively reduce cancellation/no-show risks, improve Load Factor, and boost sales productivity.' },

    featuresTitle: { ko: '주요 기능 요약', en: 'Key Features Summary' },
    
    f1Title: { ko: '지식 그래프 기능', en: 'Knowledge Graph' },
    f1Desc: { ko: '데이터 간의 복잡한 연결 관계를 시각화하여 직관적인 인사이트를 제공합니다.', en: 'Visualizes complex data relationships for intuitive insights.' },
    f1List: [
        { ko: '전체 구조 탭: 온톨로지 전체 조망', en: 'Full Structure: Ontology Overview' },
        { ko: '화주 중심 뷰: 방사형 관계 분석', en: 'Shipper View: Radial Analysis' },
        { ko: '관계 통계 탭: 노드 및 엣지 정량 분석', en: 'Statistics: Quantitative Analysis' }
    ],

    f2Title: { ko: '부킹 분석 기능', en: 'Booking Analysis' },
    f2Desc: { ko: '다각도의 데이터 분석을 통해 부킹 패턴을 파악하고 수요를 예측합니다.', en: 'Multi-dimensional analysis to identify patterns and forecast demand.' },
    f2List: [
        { ko: '세그먼트별 부킹 물량 및 리드타임 분석', en: 'Volume & Lead Time by Segment' },
        { ko: '가격탄력성(운임 민감도) 측정', en: 'Price Elasticity Measurement' },
        { ko: '부킹 주기 분석 및 미래 수요 예측', en: 'Booking Cycle & Demand Forecasting' }
    ],

    f3Title: { ko: '취소/노쇼 분석', en: 'Risk Analysis' },
    f3Desc: { ko: '이탈 위험을 조기에 감지하고 오버부킹 전략을 최적화하여 손실을 최소화합니다.', en: 'Early detection of churn risk and overbooking optimization.' },
    f3List: [
        { ko: '총 부킹/취소/노쇼 메트릭 모니터링', en: 'Booking/Cancel/No-Show Metrics' },
        { ko: '월별/요일별 취소 추이 및 사유 분석', en: 'Cancellation Trends & Reasons' },
        { ko: '오버부킹 최적화 권고 알고리즘', en: 'Overbooking Optimization' }
    ],

    f4Title: { ko: '대시보드 12종', en: '12 Dashboards' },
    f4Desc: { ko: '영업, 운항, 경영 관점의 핵심 지표를 실시간으로 제공하여 의사결정을 지원합니다.', en: 'Real-time KPIs for Sales, Ops, and Management.' },
    f4List: [
        { ko: '매출/이익 분석 및 재고/물류 관리', en: 'Sales/Profit & Inventory/Logistics' },
        { ko: '리스크/이상탐지 모니터링', en: 'Risk & Anomaly Detection' },
        { ko: '전사적 KPI 종합 현황판', en: 'Comprehensive KPI Dashboard' }
    ],
    
    archTitle: { ko: '시스템 아키텍처', en: 'System Architecture' },
    archDesc: { ko: '데이터 통합부터 분석, 시각화까지의 End-to-End 파이프라인', en: 'End-to-End pipeline from integration to visualization' }
  };

  return (
    <div className="space-y-10 animate-fade-in text-slate-900 dark:text-slate-100 pb-10">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494412574643-35d324698b93?auto=format&fit=crop&q=80')" }}
        ></div>
        <div className="relative p-10 md:p-16 text-white">
          <div className="flex items-center gap-3 mb-4">
             <Ship className="w-8 h-8 text-blue-400" />
             <span className="text-sm font-bold tracking-widest uppercase bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">KMTC System</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {t.title[lang]}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-light">
            {t.subtitle[lang]}
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4 text-sm font-medium">
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <Database className="w-4 h-4 text-blue-300"/> 7 Core Entities
             </div>
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <Share2 className="w-4 h-4 text-blue-300"/> 8 Key Relationships
             </div>
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <LayoutDashboard className="w-4 h-4 text-blue-300"/> 12 Dashboards
             </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="space-y-6">
         <h2 className="text-2xl font-bold border-l-4 border-blue-600 pl-4">{t.section1Title[lang]} <span className="text-sm font-normal text-slate-500 ml-2">{t.introText[lang]}</span></h2>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  <Search className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-lg mb-2">{t.objectiveTitle[lang]}</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.objectiveDesc[lang]}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
               <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                  <Network className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-lg mb-2">{t.techTitle[lang]}</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.techDesc[lang]}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
               <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-lg mb-2">{t.valueTitle[lang]}</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.valueDesc[lang]}</p>
            </div>
         </div>
      </div>

      {/* Feature Summary */}
      <div className="space-y-6">
         <h2 className="text-2xl font-bold border-l-4 border-blue-600 pl-4">{t.featuresTitle[lang]}</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-5">
               <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-xl flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Network className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{t.f1Title[lang]}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{t.f1Desc[lang]}</p>
                  <ul className="space-y-1">
                     {t.f1List.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {item[lang]}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-5">
               <div className="w-16 h-16 bg-orange-50 dark:bg-slate-700 rounded-xl flex-shrink-0 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{t.f3Title[lang]}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{t.f3Desc[lang]}</p>
                  <ul className="space-y-1">
                     {t.f3List.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                           <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> {item[lang]}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-5">
               <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-700 rounded-xl flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{t.f2Title[lang]}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{t.f2Desc[lang]}</p>
                  <ul className="space-y-1">
                     {t.f2List.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {item[lang]}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-5">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <LayoutDashboard className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">{t.f4Title[lang]}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{t.f4Desc[lang]}</p>
                  <ul className="space-y-1">
                     {t.f4List.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> {item[lang]}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </div>

      {/* Architecture Mini View */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
         <h3 className="text-xl font-bold mb-2">{t.archTitle[lang]}</h3>
         <p className="text-slate-500 dark:text-slate-400 mb-6">{t.archDesc[lang]}</p>
         
         <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="bg-white dark:bg-slate-700 px-6 py-4 rounded-lg shadow-sm font-semibold text-sm">1. Data Sources</div>
            <ArrowRight className="text-slate-400 hidden md:block" />
            <div className="bg-white dark:bg-slate-700 px-6 py-4 rounded-lg shadow-sm font-semibold text-sm">2. Ontology (Palantir)</div>
            <ArrowRight className="text-slate-400 hidden md:block" />
            <div className="bg-white dark:bg-slate-700 px-6 py-4 rounded-lg shadow-sm font-semibold text-sm">3. Analytics & AI</div>
            <ArrowRight className="text-slate-400 hidden md:block" />
            <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg font-semibold text-sm">4. Dashboard (Web)</div>
         </div>
      </div>

    </div>
  );
};

export default Home;