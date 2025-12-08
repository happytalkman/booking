import React, { useState } from 'react';
import { DollarSign, Activity, Clock, BarChart3, Users, AlertTriangle, Target, Search, Calendar } from 'lucide-react';
import KPICard from '../components/KPICard';
import BookingRecommendation from '../components/BookingRecommendation';
import HistoricalComparison from '../components/HistoricalComparison';
import AdvancedSimulator from '../components/AdvancedSimulator';
import CompetitorBenchmark from '../components/CompetitorBenchmark';
import MLPredictionPanel from '../components/MLPredictionPanel';
import { DataQualityPanel } from '../components/DataQualityPanel';
import { KPIDetailModal } from '../components/KPIDetailModal';
import { AIInsightCard } from '../components/AIInsightCard';
import { KPI, Language } from '../types';

interface DashboardProps {
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const t = {
    title: { ko: '종합 지표 대시보드', en: 'Comprehensive Metrics' },
    subtitle: { ko: '영업, 운항, 리스크, 서비스 KPI 실시간 개요', en: 'Real-time overview of Sales, Operations, Risk, and Service KPIs' },
    revenue: { ko: '총 매출', en: 'Total Revenue' },
    profit: { ko: '영업 이익', en: 'Operating Profit' },
    loadFactor: { ko: '적재율(L/F)', en: 'Load Factor' },
    acceptance: { ko: '수락률', en: 'Acceptance Rate' },
    leadTime: { ko: '리드타임', en: 'Lead Time' },
    accuracy: { ko: '예측 정확도', en: 'Forecast Accuracy' },
    cancellation: { ko: '취소율', en: 'Cancellation Rate' },
    noShow: { ko: '노쇼율', en: 'No-Show Rate' },
    
    target: { ko: '목표', en: 'Target' },
    margin: { ko: '마진', en: 'Margin' },
    vsLastMonth: { ko: '전월 대비', en: 'vs Last Month' },
    mom: { ko: '전월 대비', en: 'MoM' },
    faster: { ko: '단축', en: 'Faster' },
    improved: { ko: '개선', en: 'Improved' },
    warning: { ko: '주의', en: 'Warning' },
    days: { ko: '일', en: 'Days' },

    revenueChartTitle: { ko: '매출 vs 목표 (연간 누적)', en: 'Revenue vs Target (YTD)' },
    revenueChartPlaceholder: { ko: '인터랙티브 매출 차트 영역', en: 'Interactive Revenue Chart Area' },
    
    riskTitle: { ko: '주요 감지 리스크', en: 'Top Risks' },
    riskSpike: { ko: '취소 급증', en: 'Spike in Cancellation' },
    riskGroupA: { ko: '특정 화주 그룹 A', en: 'Specific Shipper Group A' },
    riskDelay: { ko: '리드타임 지연', en: 'Lead Time Delay' },
    riskRoute: { ko: '한중 항로', en: 'CN-US Route' },
    riskNoShow: { ko: '노쇼 예측', en: 'No-Show Forecast' },
    riskProb: { ko: '확률 > 85%', en: 'Prob > 85%' },
    high: { ko: '높음', en: 'High' },
    med: { ko: '중간', en: 'Med' }
  };

  const kpis: KPI[] = [
    {
      title: t.revenue[lang],
      value: '$42.5M',
      subValue: `vs $40.0M ${t.target[lang]}`,
      trend: 'up',
      trendValue: '5.4%',
      trendLabel: t.vsLastMonth[lang],
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: t.profit[lang],
      value: '$8.4M',
      subValue: `19.7% ${t.margin[lang]}`,
      trend: 'up',
      trendValue: '8.2%',
      trendLabel: t.vsLastMonth[lang],
      icon: BarChart3,
      color: 'bg-indigo-500'
    },
    {
      title: t.loadFactor[lang],
      value: '94.2%',
      trend: 'up',
      trendValue: '2.1%p',
      trendLabel: t.mom[lang],
      icon: Activity,
      color: 'bg-emerald-500'
    },
    {
      title: t.acceptance[lang],
      value: '98.5%',
      trend: 'neutral',
      trendValue: '0.5%p',
      trendLabel: t.mom[lang],
      icon: Target,
      color: 'bg-teal-500'
    },
    {
      title: t.leadTime[lang],
      value: `14.2 ${t.days[lang]}`,
      trend: 'down',
      trendValue: `0.8 ${t.days[lang]}`,
      trendLabel: t.faster[lang],
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: t.accuracy[lang],
      value: '88.4%',
      trend: 'up',
      trendValue: '4.1%p',
      trendLabel: t.improved[lang],
      icon: Search,
      color: 'bg-purple-500'
    },
    {
      title: t.cancellation[lang],
      value: '8.5%',
      trend: 'down',
      trendValue: '0.3%p',
      trendLabel: t.mom[lang],
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: t.noShow[lang],
      value: '1.0%',
      trend: 'up',
      trendValue: '0.1%p',
      trendLabel: t.warning[lang],
      icon: Users,
      color: 'bg-pink-500'
    }
  ];

  // KPI 목표 및 실제 값 (프로그레스 바용)
  const kpiTargets = [
    { target: 40000000, actual: 42500000 }, // Revenue
    { target: 7500000, actual: 8400000 },   // Profit
    { target: 92, actual: 94.2 },           // Load Factor
    { target: 85, actual: 88.4 },           // Accuracy
    { target: 10, actual: 8.5 },            // Cancellation (lower is better)
    { target: 2, actual: 1.0 },             // No-Show (lower is better)
  ];

  // Modal state
  const [selectedKPI, setSelectedKPI] = useState<{ kpi: KPI; index: number } | null>(null);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">{t.title[lang]}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.subtitle[lang]}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>2024-12-08</span>
        </div>
      </div>

      {/* AI Insight Card */}
      <AIInsightCard lang={lang} />

      {/* KPI Cards with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard 
            key={index} 
            kpi={kpi}
            target={kpiTargets[index]?.target}
            actual={kpiTargets[index]?.actual}
            onClick={() => setSelectedKPI({ kpi, index })}
          />
        ))}
      </div>

      {/* KPI Detail Modal */}
      {selectedKPI && (
        <KPIDetailModal
          isOpen={true}
          onClose={() => setSelectedKPI(null)}
          kpiTitle={selectedKPI.kpi.title}
          kpiValue={selectedKPI.kpi.value}
          kpiIcon={selectedKPI.kpi.icon}
        />
      )}

      {/* Historical Comparison Chart */}
      <HistoricalComparison lang={lang} />

      {/* Advanced Simulator */}
      <AdvancedSimulator lang={lang} />

      {/* Competitor Benchmark */}
      <CompetitorBenchmark lang={lang} />

      {/* ML Prediction */}
      <MLPredictionPanel lang={lang} />

      {/* Data Quality Panel (SHACL) */}
      <DataQualityPanel />

      {/* AI Booking Recommendations & Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Booking Recommendations */}
        <div className="lg:col-span-2">
          <BookingRecommendation lang={lang} />
        </div>

        {/* Risk Alerts */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-bold mb-4">{t.riskTitle[lang]}</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                 <div>
                    <p className="text-sm font-semibold text-red-900 dark:text-red-300">{t.riskSpike[lang]}</p>
                    <p className="text-xs text-red-700 dark:text-red-400">{t.riskGroupA[lang]}</p>
                 </div>
                 <span className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-bold rounded">{t.high[lang]}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                 <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">{t.riskDelay[lang]}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">{t.riskRoute[lang]}</p>
                 </div>
                 <span className="px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold rounded">{t.med[lang]}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                 <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">{t.riskNoShow[lang]}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">{t.riskProb[lang]}</p>
                 </div>
                 <span className="px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold rounded">{t.med[lang]}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
