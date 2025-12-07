import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, Legend, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';
import { FunnelStep, Language } from '../types';
import { ArrowRight, TrendingUp, Calendar, Zap } from 'lucide-react';

interface BookingAnalysisProps {
  lang: Language;
}

const BookingAnalysis: React.FC<BookingAnalysisProps> = ({ lang }) => {
  
  const t = {
    title: { ko: '부킹 분석 및 예측', en: 'Booking Analysis & Prediction' },
    subtitle: { ko: '세그먼트, 전환 퍼널, 가격 탄력성 및 부킹 주기 예측', en: 'Segmentation, Conversion Funnels, Elasticity, and Cycle Prediction.' },
    
    // Segmentation
    segTitle: { ko: '세그먼트별 부킹 물량', en: 'Booking Volume by Segment' },
    growth: { ko: '성장 +12.5%', en: 'Growth +12.5%' },
    
    // Lead Time
    leadTimeTitle: { ko: '평균 리드타임 vs 목표', en: 'Avg Lead Time vs Target' },
    target: { ko: '목표: 14일', en: 'Target: 14 Days' },
    avgDays: { ko: '평균 일수', en: 'Avg Days' },
    
    // Cycle Analysis (Screenshot 20)
    cycleTitle: { ko: '부킹 주기 분석 (TIME_NEXT)', en: 'Booking Cycle Analysis (TIME_NEXT)' },
    cycleSub: { ko: '화주별 부킹 주기 패턴 분석 및 예측 알림', en: 'Shipper booking cycle pattern analysis & alerts' },
    avgCycle: { ko: '평균 부킹 주기', en: 'Avg Cycle' },
    cycleVal: { ko: '11.2 일', en: '11.2 Days' },
    cycleTrend: { ko: '0.5일 단축', en: '0.5d faster' },
    weeklyShare: { ko: '주간 패턴 비중', en: 'Weekly Pattern Share' },
    weeklyVal: { ko: '42.5%', en: '42.5%' },
    
    // Prediction (Screenshot 22)
    predTitle: { ko: '미래 부킹 예측', en: 'Future Booking Prediction' },
    predSub: { ko: 'AI 기반 주별 부킹 수요 예측', en: 'AI-based Weekly Demand Forecasting' },
    predAcc: { ko: '예측 정확도', en: 'Accuracy' },
    predAccVal: { ko: '94.2%', en: '94.2%' },
    predVol: { ko: '2주 후 예상', en: 'Forecast (2W)' },
    predVolVal: { ko: '4,850 TEU', en: '4,850 TEU' },
    
    funnelTitle: { ko: '부킹 전환 퍼널', en: 'Booking Conversion Funnel' },
    
    segments: {
      electronics: { ko: '전자', en: 'Electronics' },
      autoParts: { ko: '자동차부품', en: 'Auto Parts' },
      chemicals: { ko: '화학', en: 'Chemicals' },
      retail: { ko: '리테일', en: 'Retail' },
      others: { ko: '기타', en: 'Others' }
    },
    cycleLabels: {
      d1_3: { ko: '1-3일', en: '1-3 Days' },
      d4_6: { ko: '4-6일', en: '4-6 Days' },
      weekly: { ko: '7일 (주간)', en: '7 Days (Weekly)' },
      d8_13: { ko: '8-13일', en: '8-13 Days' },
      biweekly: { ko: '14일 (격주)', en: '14 Days (Bi-weekly)' },
      monthly: { ko: '월간', en: 'Monthly' }
    }
  };

  const segmentData = [
    { name: t.segments.electronics[lang], value: 4358, color: '#3b82f6' }, 
    { name: t.segments.autoParts[lang], value: 3112, color: '#0ea5e9' }, 
    { name: t.segments.chemicals[lang], value: 2490, color: '#10b981' }, 
    { name: t.segments.retail[lang], value: 1867, color: '#8b5cf6' }, 
    { name: t.segments.others[lang], value: 623, color: '#94a3b8' }, 
  ];

  const leadTimeData = [
    { name: t.segments.electronics[lang], time: 9.2, target: 12 },
    { name: t.segments.retail[lang], time: 11.8, target: 12 },
    { name: t.segments.autoParts[lang], time: 15.1, target: 14 },
    { name: t.segments.others[lang], time: 18.0, target: 14 },
    { name: t.segments.chemicals[lang], time: 21.5, target: 15 },
  ];

  const cycleData = [
    { range: t.cycleLabels.d1_3[lang], count: 120 },
    { range: t.cycleLabels.d4_6[lang], count: 150 },
    { range: t.cycleLabels.weekly[lang], count: 850, fill: '#10b981' }, // Highlight Weekly
    { range: t.cycleLabels.d8_13[lang], count: 180 },
    { range: t.cycleLabels.biweekly[lang], count: 560, fill: '#3b82f6' }, // Highlight Bi-weekly
    { range: t.cycleLabels.monthly[lang], count: 320, fill: '#8b5cf6' },
  ];

  const predictionData = [
    { week: 'W44', actual: 3850, predicted: 3800 },
    { week: 'W45', actual: 3920, predicted: 3900 },
    { week: 'W46', actual: 4150, predicted: 4100 },
    { week: 'W47', actual: 4080, predicted: 4120 },
    { week: 'W48', actual: null, predicted: 4350 },
    { week: 'W49', actual: null, predicted: 4600 },
    { week: 'W50', actual: null, predicted: 4950 },
    { week: 'W51', actual: null, predicted: 5200 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">{t.title[lang]}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Segmentation */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">{t.segTitle[lang]}</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded uppercase tracking-wide">{t.growth[lang]}</span>
          </div>
          <div className="h-[250px] flex items-center">
             <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-40 space-y-2">
                {segmentData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{item.value.toLocaleString()}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Chart 2: Lead Time */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">{t.leadTimeTitle[lang]}</h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded uppercase tracking-wide">{t.target[lang]}</span>
          </div>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart
                   layout="vertical"
                   data={leadTimeData}
                   margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#64748b', fontSize: 11 }} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                   <Bar dataKey="time" name={t.avgDays[lang]} radius={[0, 4, 4, 0]} barSize={20}>
                      {leadTimeData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.time > 15 ? '#ef4444' : '#3b82f6'} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* New Chart: Booking Cycle Analysis (Screenshot 20) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                 <h3 className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" /> {t.cycleTitle[lang]}
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.cycleSub[lang]}</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.avgCycle[lang]}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       {t.cycleVal[lang]} <span className="text-xs font-normal text-green-500 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">{t.cycleTrend[lang]}</span>
                    </p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.weeklyShare[lang]}</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{t.weeklyVal[lang]}</p>
                 </div>
              </div>
           </div>
           
           <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={cycleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                       {cycleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill || '#94a3b8'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* New Chart: Future Prediction (Screenshot 22) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                 <h3 className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> {t.predTitle[lang]}
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.predSub[lang]}</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.predAcc[lang]}</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{t.predAccVal[lang]}</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.predVol[lang]}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{t.predVolVal[lang]}</p>
                 </div>
              </div>
           </div>

           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={predictionData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                       <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fill: '#64748b' }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#ef4444" strokeDasharray="5 5" fill="url(#colorPred)" strokeWidth={2} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};

export default BookingAnalysis;
