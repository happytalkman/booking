import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Language } from '../types';

interface HistoricalComparisonProps {
  lang: Language;
}

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({ lang }) => {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m');
  const [selectedRoute, setSelectedRoute] = useState('kr-la');

  const t = {
    title: { ko: '과거 데이터 비교', en: 'Historical Comparison' },
    subtitle: { ko: '운임 추세 및 계절성 패턴 분석', en: 'Rate trends and seasonal pattern analysis' },
    route: { ko: '항로', en: 'Route' },
    timeRange: { ko: '기간', en: 'Time Range' },
    currentRate: { ko: '현재 운임', en: 'Current Rate' },
    avgRate: { ko: '평균 운임', en: 'Average Rate' },
    vsLastYear: { ko: '전년 동기 대비', en: 'vs Last Year' },
    trend: { ko: '추세', en: 'Trend' },
    seasonality: { ko: '계절성', en: 'Seasonality' },
    insights: { ko: '인사이트', en: 'Insights' },
    
    routes: {
      'kr-la': { ko: '한국-LA (서안)', en: 'Korea-LA (West)' },
      'kr-ny': { ko: '한국-뉴욕 (동안)', en: 'Korea-NY (East)' },
      'kr-eu': { ko: '한국-유럽', en: 'Korea-Europe' },
      'kr-cn': { ko: '한국-중국', en: 'Korea-China' }
    },
    
    ranges: {
      '3m': { ko: '3개월', en: '3 Months' },
      '6m': { ko: '6개월', en: '6 Months' },
      '1y': { ko: '1년', en: '1 Year' }
    }
  };

  // Generate historical data
  const generateData = () => {
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    const data = [];
    const baseRate = selectedRoute === 'kr-la' ? 2750 : 
                     selectedRoute === 'kr-ny' ? 3420 :
                     selectedRoute === 'kr-eu' ? 4200 : 850;

    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short' });
      
      // Add seasonality and trend
      const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.1 + 1;
      const trendFactor = 1 + (months - i) * 0.01;
      const randomFactor = 0.95 + Math.random() * 0.1;
      
      const currentYear = Math.round(baseRate * seasonalFactor * trendFactor * randomFactor);
      const lastYear = Math.round(baseRate * seasonalFactor * 0.95 * randomFactor);
      const average = Math.round((currentYear + lastYear) / 2);

      data.push({
        month,
        current: currentYear,
        lastYear,
        average,
        forecast: i === 0 ? Math.round(currentYear * 1.05) : null
      });
    }

    return data;
  };

  const data = generateData();
  const currentRate = data[data.length - 1].current;
  const avgRate = Math.round(data.reduce((sum, d) => sum + d.average, 0) / data.length);
  const lastYearRate = data[data.length - 1].lastYear;
  const vsLastYear = ((currentRate - lastYearRate) / lastYearRate * 100).toFixed(1);
  const trend = parseFloat(vsLastYear) > 0 ? 'up' : 'down';

  const insights = lang === 'ko' ? [
    `현재 운임은 ${timeRange === '3m' ? '3개월' : timeRange === '6m' ? '6개월' : '1년'} 평균 대비 ${((currentRate - avgRate) / avgRate * 100).toFixed(1)}% ${currentRate > avgRate ? '높습니다' : '낮습니다'}`,
    `전년 동기 대비 ${Math.abs(parseFloat(vsLastYear))}% ${parseFloat(vsLastYear) > 0 ? '상승' : '하락'}했습니다`,
    `${trend === 'up' ? '상승' : '하락'} 추세가 지속되고 있습니다`,
    `계절적으로 ${new Date().getMonth() >= 8 && new Date().getMonth() <= 11 ? '성수기' : '비수기'}입니다`
  ] : [
    `Current rate is ${((currentRate - avgRate) / avgRate * 100).toFixed(1)}% ${currentRate > avgRate ? 'above' : 'below'} ${timeRange === '3m' ? '3-month' : timeRange === '6m' ? '6-month' : '1-year'} average`,
    `${Math.abs(parseFloat(vsLastYear))}% ${parseFloat(vsLastYear) > 0 ? 'increase' : 'decrease'} vs last year`,
    `${trend === 'up' ? 'Upward' : 'Downward'} trend continues`,
    `Seasonally in ${new Date().getMonth() >= 8 && new Date().getMonth() <= 11 ? 'peak' : 'low'} season`
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold">{t.title[lang]}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Route Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {t.route[lang]}
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {Object.entries(t.routes).map(([key, value]) => (
              <option key={key} value={key}>{value[lang]}</option>
            ))}
          </select>
        </div>

        {/* Time Range Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {t.timeRange[lang]}
          </label>
          <div className="flex gap-2">
            {(['3m', '6m', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {t.ranges[range][lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">{t.currentRate[lang]}</p>
          <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">${currentRate.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">{t.avgRate[lang]}</p>
          <p className="text-2xl font-bold">${avgRate.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">{t.vsLastYear[lang]}</p>
          <p className={`text-2xl font-bold flex items-center gap-1 ${parseFloat(vsLastYear) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            <TrendingUp className={`w-5 h-5 ${parseFloat(vsLastYear) < 0 ? 'rotate-180' : ''}`} />
            {vsLastYear}%
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">{t.trend[lang]}</p>
          <p className={`text-2xl font-bold ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
            {trend === 'up' ? '📈' : '📉'} {trend === 'up' ? (lang === 'ko' ? '상승' : 'Up') : (lang === 'ko' ? '하락' : 'Down')}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLastYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area 
              type="monotone" 
              dataKey="current" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCurrent)"
              name={lang === 'ko' ? '현재 연도' : 'Current Year'}
            />
            <Area 
              type="monotone" 
              dataKey="lastYear" 
              stroke="#94a3b8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorLastYear)"
              name={lang === 'ko' ? '전년도' : 'Last Year'}
            />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name={lang === 'ko' ? '평균' : 'Average'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t.insights[lang]}
        </h4>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="text-sm text-indigo-800 dark:text-indigo-200 flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoricalComparison;
