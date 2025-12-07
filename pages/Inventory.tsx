import React from 'react';
import { Package, RefreshCw, Clock, AlertOctagon, ArrowUpRight, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Language, PortInventory } from '../types';
import KPICard from '../components/KPICard';

interface InventoryProps {
  lang: Language;
}

const Inventory: React.FC<InventoryProps> = ({ lang }) => {
  const t = {
    title: { ko: '재고/물류 관리 대시보드', en: 'Inventory & Logistics Dashboard' },
    subtitle: { ko: '실시간 컨테이너 재고 모니터링 및 회전율/체류시간 효율성 분석', en: 'Real-time container inventory monitoring and efficiency analysis.' },
    
    totalInv: { ko: '총 컨테이너 재고', en: 'Total Inventory' },
    turnover: { ko: '장비 회전율', en: 'Equipment Turnover' },
    dwell: { ko: '평균 체류일', en: 'Avg Dwell Time' },
    shortage: { ko: '재고 부족 경보', en: 'Stock Shortage Alert' },
    
    turnPerYr: { ko: '회전/년', en: 'Turn/Yr' },
    days: { ko: '일', en: 'Days' },
    region: { ko: '지역', en: 'Region' },
    
    stable: { ko: '전월 대비 유지', en: 'Stable vs Last Month' },
    improved: { ko: '효율 개선', en: 'Efficiency Improved' },
    faster: { ko: '단축', en: 'Faster' },
    shortageMsg: { ko: '40HC 부족 심화', en: '40HC Critical Shortage' },
    
    chart1Title: { ko: '주요 항만별 컨테이너 재고 현황', en: 'Container Inventory by Major Ports' },
    chart2Title: { ko: '월별 장비 회전율 추이', en: 'Monthly Equipment Turnover Trend' },
    chart3Title: { ko: '터미널별 평균 체류 시간', en: 'Avg Dwell Time by Terminal' },
    
    detail: { ko: '상세보기', en: 'Details' },
    analyze: { ko: '분석', en: 'Analyze' },
    history: { ko: '이력', en: 'History' }
  };

  const kpis = [
    {
      title: t.totalInv[lang],
      value: '45,200 TEU',
      trend: 'neutral' as const,
      trendValue: '-',
      trendLabel: t.stable[lang],
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: t.turnover[lang],
      value: `4.5 ${t.turnPerYr[lang]}`,
      trend: 'up' as const,
      trendValue: '0.2',
      trendLabel: t.improved[lang],
      icon: RefreshCw,
      color: 'bg-emerald-500'
    },
    {
      title: t.dwell[lang],
      value: `5.8 ${t.days[lang]}`,
      trend: 'down' as const,
      trendValue: '0.4',
      trendLabel: t.faster[lang],
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: t.shortage[lang],
      value: `PUS/VNM ${t.region[lang]}`,
      subValue: t.shortageMsg[lang],
      trend: 'down' as const, // using down color (red) for alert
      trendValue: '!',
      trendLabel: 'Alert',
      icon: AlertOctagon,
      color: 'bg-red-500'
    }
  ];

  const portData: PortInventory[] = [
    { port: 'PUS (Busan)', d20: 4500, d40: 5200, hc40: 3800, rf: 1200 },
    { port: 'INC (Incheon)', d20: 2100, d40: 2800, hc40: 1900, rf: 500 },
    { port: 'SHA (Shanghai)', d20: 5500, d40: 6200, hc40: 4800, rf: 1800 },
    { port: 'SGN (Ho Chi Minh)', d20: 3200, d40: 4100, hc40: 3500, rf: 900 },
    { port: 'JKT (Jakarta)', d20: 1800, d40: 2200, hc40: 1500, rf: 400 },
    { port: 'LCH (Laem Chabang)', d20: 2400, d40: 3100, hc40: 2100, rf: 600 },
  ];

  const turnoverData = [
    { month: 'Jan', rate: 3.8 },
    { month: 'Feb', rate: 3.9 },
    { month: 'Mar', rate: 4.1 },
    { month: 'Apr', rate: 4.2 },
    { month: 'May', rate: 4.4 },
    { month: 'Jun', rate: 4.5 },
  ];

  const dwellData = [
    { terminal: 'PUS-01', days: 4.2 },
    { terminal: 'PUS-02', days: 5.1 },
    { terminal: 'INC-01', days: 3.8 },
    { terminal: 'SHA-03', days: 6.5 },
    { terminal: 'SGN-01', days: 7.2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">{t.title[lang]}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Bar Chart: Inventory by Port */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-blue-500"/> {t.chart1Title[lang]}
              </h3>
              <button className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1">
                 {t.detail[lang]} <ArrowUpRight className="w-3 h-3"/>
              </button>
           </div>
           <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={portData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="port" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="d20" name="20' Dry" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="d40" name="40' Dry" stackId="a" fill="#60a5fa" />
                    <Bar dataKey="hc40" name="40' HC" stackId="a" fill="#93c5fd" />
                    <Bar dataKey="rf" name="Reefer" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Line Chart: Turnover */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{t.chart2Title[lang]}</h3>
              <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                 {t.analyze[lang]}
              </button>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={turnoverData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                    <YAxis domain={[3, 5]} tick={{ fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bar Chart: Dwell Time */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{t.chart3Title[lang]}</h3>
              <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                 {t.history[lang]}
              </button>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart layout="vertical" data={dwellData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="terminal" type="category" width={60} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="days" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;