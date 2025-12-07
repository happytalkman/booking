import React from 'react';
import { AlertCircle, TrendingDown, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Language } from '../types';
import AIChatAssistant from '../components/AIChatAssistant';

interface RiskAnalysisProps {
  lang: Language;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ lang }) => {
  
  const t = {
    title: { ko: '리스크 & 취소 분석', en: 'Risk & Cancellation Analysis' },
    subtitle: { ko: '취소율, 노쇼, 이상 징후 모니터링', en: 'Monitor cancellation rates, no-shows, and anomaly detection.' },
    
    riskScore: { ko: '리스크 점수', en: 'Risk Score' },
    highRisk: { ko: '고위험 단계', en: 'High Risk Level' },
    
    cancelRate: { ko: '취소율', en: 'Cancellation Rate' },
    cancelCount: { ko: '1,058 TEU 취소됨', en: '1,058 TEU Cancelled' },
    cancelTrend: { ko: '↑ 0.3% 전월 대비', en: '↑ 0.3% vs Last Month' },
    
    noShowRate: { ko: '노쇼율', en: 'No-Show Rate' },
    noShowCount: { ko: '124 TEU 노쇼', en: '124 TEU No-Show' },
    noShowTrend: { ko: '↓ 0.1% 개선됨', en: '↓ 0.1% Improvement' },
    
    chartTitle: { ko: '월별 취소 추이', en: 'Monthly Cancellation Trend' },
    reasonsTitle: { ko: '주요 취소 사유', en: 'Top Cancellation Reasons' },
    
    actionsTitle: { ko: '권장 조치사항', en: 'Recommended Actions' },
    action1: { 
      ko: '<strong>KR-US-WC</strong> 항로의 오버부킹 비율을 <strong>125%</strong>로 상향 조정하여 취소 급증에 대비하세요.', 
      en: 'Overbooking ratio on <strong>KR-US-WC</strong> should be increased to <strong>125%</strong> to offset cancellation spike.' 
    },
    action2: { 
      ko: '조기 확정을 위해 상위 5개 고위험 화주(전자제품 부문)와 접촉하세요.', 
      en: 'Contact Top 5 High-Risk Accounts for early confirmation (Electronics Segment).' 
    },

    reasons: {
      prodDelay: { ko: '생산 지연 (화주)', en: 'Production Delay (Shipper)' },
      compRate: { ko: '경쟁사 운임 차이', en: 'Competitor Rate Difference' },
      schedule: { ko: '스케줄 변경', en: 'Schedule Change' },
      others: { ko: '기타', en: 'Others' }
    }
  };

  const cancelData = [
    { month: 'Jun', rate: 7.2 },
    { month: 'Jul', rate: 6.8 },
    { month: 'Aug', rate: 8.5 },
    { month: 'Sep', rate: 7.9 },
    { month: 'Oct', rate: 8.1 },
    { month: 'Nov', rate: 8.5 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">{t.title[lang]}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.riskScore[lang]}</p>
              <h3 className="text-4xl font-bold text-red-500 mt-2">72</h3>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-1">{t.highRisk[lang]}</p>
           </div>
           <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-4">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '72%' }}></div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.cancelRate[lang]}</p>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">8.5%</h3>
                 <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t.cancelCount[lang]}</p>
                 <div className="mt-2 text-xs text-red-500 font-medium">{t.cancelTrend[lang]}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-full h-fit">
                 <AlertCircle className="w-6 h-6 text-slate-400 dark:text-slate-300" />
              </div>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.noShowRate[lang]}</p>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1.0%</h3>
                 <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t.noShowCount[lang]}</p>
                 <div className="mt-2 text-xs text-green-500 font-medium">{t.noShowTrend[lang]}</div>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-full h-fit">
                 <ShieldAlert className="w-6 h-6 text-pink-500" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Trend Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-4">{t.chartTitle[lang]}</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cancelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                     <CartesianGrid vertical={false} stroke="#e2e8f0" />
                     <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Area type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Reasons & Actions */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4">{t.reasonsTitle[lang]}</h3>
            <div className="space-y-5 flex-1">
               {[
                  { reason: t.reasons.prodDelay[lang], pct: 42, color: 'bg-blue-500' },
                  { reason: t.reasons.compRate[lang], pct: 28, color: 'bg-indigo-500' },
                  { reason: t.reasons.schedule[lang], pct: 15, color: 'bg-slate-500' },
                  { reason: t.reasons.others[lang], pct: 15, color: 'bg-slate-300' },
               ].map((item, idx) => (
                  <div key={idx}>
                     <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{item.reason}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">{item.pct}%</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
               <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-500"/> {t.actionsTitle[lang]}
               </h4>
               <ul className="space-y-3">
                  <li className="flex gap-3 items-start p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                     <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                     <span className="text-xs text-orange-800 dark:text-orange-200 leading-snug" dangerouslySetInnerHTML={{ __html: t.action1[lang] }}></span>
                  </li>
                  <li className="flex gap-3 items-start p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                     <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                     <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        {t.action2[lang]}
                     </span>
                  </li>
               </ul>
            </div>
         </div>
      </div>
      
      {/* Page-level Chat Assistant */}
      <AIChatAssistant currentContext="risk_analysis" lang={lang} />
    </div>
  );
};

export default RiskAnalysis;