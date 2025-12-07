import React, { useState } from 'react';
import { Ship, TrendingUp, TrendingDown, Clock, Target, Award } from 'lucide-react';
import { Language } from '../types';

interface CompetitorBenchmarkProps {
  lang: Language;
}

interface Competitor {
  name: string;
  logo: string;
  rate: number;
  change: number;
  marketShare: number;
  onTimeRate: number;
  leadTime: number;
  rank: number;
}

const CompetitorBenchmark: React.FC<CompetitorBenchmarkProps> = ({ lang }) => {
  const [selectedRoute, setSelectedRoute] = useState('kr-la');

  const t = {
    title: { ko: '경쟁사 벤치마킹', en: 'Competitor Benchmark' },
    subtitle: { ko: '실시간 경쟁사 운임 및 서비스 품질 비교', en: 'Real-time competitor rates and service quality comparison' },
    route: { ko: '항로', en: 'Route' },
    carrier: { ko: '선사', en: 'Carrier' },
    rate: { ko: '운임 ($/FEU)', en: 'Rate ($/FEU)' },
    change: { ko: '변동', en: 'Change' },
    marketShare: { ko: '시장 점유율', en: 'Market Share' },
    onTime: { ko: '정시 도착률', en: 'On-Time Rate' },
    leadTime: { ko: '리드타임', en: 'Lead Time' },
    rank: { ko: '순위', en: 'Rank' },
    days: { ko: '일', en: 'days' },
    ourPosition: { ko: 'KMTC 위치', en: 'KMTC Position' },
    competitive: { ko: '경쟁력 우위', en: 'Competitive' },
    needsImprovement: { ko: '개선 필요', en: 'Needs Improvement' },
    
    routes: {
      'kr-la': { ko: '한국-LA (서안)', en: 'Korea-LA (West)' },
      'kr-ny': { ko: '한국-뉴욕 (동안)', en: 'Korea-NY (East)' },
      'kr-eu': { ko: '한국-유럽', en: 'Korea-Europe' },
      'kr-cn': { ko: '한국-중국', en: 'Korea-China' }
    }
  };

  const competitorData: Record<string, Competitor[]> = {
    'kr-la': [
      { name: 'KMTC', logo: '🇰🇷', rate: 2750, change: -2.1, marketShare: 12.5, onTimeRate: 94.2, leadTime: 14, rank: 2 },
      { name: 'Maersk', logo: '🇩🇰', rate: 2950, change: 5.3, marketShare: 18.3, onTimeRate: 96.1, leadTime: 13, rank: 1 },
      { name: 'MSC', logo: '🇨🇭', rate: 2880, change: 3.2, marketShare: 16.7, onTimeRate: 92.8, leadTime: 15, rank: 3 },
      { name: 'CMA CGM', logo: '🇫🇷', rate: 2920, change: 4.1, marketShare: 14.2, onTimeRate: 93.5, leadTime: 14, rank: 4 },
      { name: 'COSCO', logo: '🇨🇳', rate: 2800, change: 1.8, marketShare: 13.8, onTimeRate: 91.2, leadTime: 16, rank: 5 }
    ],
    'kr-ny': [
      { name: 'KMTC', logo: '🇰🇷', rate: 3420, change: 1.5, marketShare: 10.2, onTimeRate: 93.1, leadTime: 18, rank: 3 },
      { name: 'Maersk', logo: '🇩🇰', rate: 3650, change: 6.2, marketShare: 20.1, onTimeRate: 95.8, leadTime: 17, rank: 1 },
      { name: 'MSC', logo: '🇨🇭', rate: 3580, change: 4.8, marketShare: 17.5, onTimeRate: 94.2, leadTime: 18, rank: 2 },
      { name: 'Hapag-Lloyd', logo: '🇩🇪', rate: 3500, change: 3.5, marketShare: 15.3, onTimeRate: 92.7, leadTime: 19, rank: 4 },
      { name: 'ONE', logo: '🇯🇵', rate: 3480, change: 2.9, marketShare: 12.4, onTimeRate: 91.5, leadTime: 20, rank: 5 }
    ],
    'kr-eu': [
      { name: 'KMTC', logo: '🇰🇷', rate: 4200, change: -1.2, marketShare: 8.5, onTimeRate: 89.3, leadTime: 35, rank: 4 },
      { name: 'Maersk', logo: '🇩🇰', rate: 4500, change: 7.5, marketShare: 22.8, onTimeRate: 94.5, leadTime: 32, rank: 1 },
      { name: 'MSC', logo: '🇨🇭', rate: 4350, change: 5.2, marketShare: 19.2, onTimeRate: 92.1, leadTime: 34, rank: 2 },
      { name: 'CMA CGM', logo: '🇫🇷', rate: 4280, change: 4.1, marketShare: 16.5, onTimeRate: 90.8, leadTime: 36, rank: 3 },
      { name: 'Hapag-Lloyd', logo: '🇩🇪', rate: 4180, change: 2.8, marketShare: 14.2, onTimeRate: 88.9, leadTime: 37, rank: 5 }
    ],
    'kr-cn': [
      { name: 'KMTC', logo: '🇰🇷', rate: 850, change: 0.5, marketShare: 15.8, onTimeRate: 96.5, leadTime: 3, rank: 1 },
      { name: 'COSCO', logo: '🇨🇳', rate: 880, change: 2.1, marketShare: 25.3, onTimeRate: 95.2, leadTime: 3, rank: 2 },
      { name: 'Sinotrans', logo: '🇨🇳', rate: 920, change: 3.5, marketShare: 18.7, onTimeRate: 94.1, leadTime: 4, rank: 3 },
      { name: 'Yang Ming', logo: '🇹🇼', rate: 900, change: 1.8, marketShare: 12.5, onTimeRate: 93.8, leadTime: 4, rank: 4 },
      { name: 'Evergreen', logo: '🇹🇼', rate: 890, change: 1.2, marketShare: 11.2, onTimeRate: 92.5, leadTime: 5, rank: 5 }
    ]
  };

  const competitors = competitorData[selectedRoute] || [];
  const kmtc = competitors.find(c => c.name === 'KMTC');

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 dark:text-yellow-400';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-amber-700 dark:text-amber-500';
    return 'text-slate-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Ship className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold">{t.title[lang]}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
        </div>

        {/* Route Selector */}
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {Object.entries(t.routes).map(([key, value]) => (
            <option key={key} value={key}>{value[lang]}</option>
          ))}
        </select>
      </div>

      {/* KMTC Position Summary */}
      {kmtc && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">{t.ourPosition[lang]}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getRankIcon(kmtc.rank)}</span>
                  <span className={`text-xl font-bold ${getRankColor(kmtc.rank)}`}>
                    {t.rank[lang]} {kmtc.rank}
                  </span>
                </div>
                <div className="h-8 w-px bg-blue-200 dark:bg-blue-700"></div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{t.rate[lang]}</p>
                  <p className="text-lg font-bold">${kmtc.rate.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{t.marketShare[lang]}</p>
                  <p className="text-lg font-bold">{kmtc.marketShare}%</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              {kmtc.rank <= 2 ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-semibold">{t.competitive[lang]}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-semibold">{t.needsImprovement[lang]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.rank[lang]}</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.carrier[lang]}</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.rate[lang]}</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.change[lang]}</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.marketShare[lang]}</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.onTime[lang]}</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t.leadTime[lang]}</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, index) => {
              const isKMTC = comp.name === 'KMTC';
              return (
                <tr 
                  key={index}
                  className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                    isKMTC ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <span className={`text-lg font-bold ${getRankColor(comp.rank)}`}>
                      {getRankIcon(comp.rank)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{comp.logo}</span>
                      <span className={`font-semibold ${isKMTC ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {comp.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-lg font-bold">${comp.rate.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      comp.change > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {comp.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-semibold">{comp.change > 0 ? '+' : ''}{comp.change}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(comp.marketShare / 25) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold w-12">{comp.marketShare}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${
                      comp.onTimeRate >= 95 ? 'text-green-600' : 
                      comp.onTimeRate >= 90 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {comp.onTimeRate}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{comp.leadTime} {t.days[lang]}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitorBenchmark;
