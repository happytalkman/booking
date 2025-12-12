import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Brain, Zap, Target, Calendar, Filter, Download, RefreshCw, X, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  routePerformance: {
    route: string;
    volume: number;
    revenue: number;
    profitMargin: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  predictiveInsights: {
    nextWeekBookings: number;
    nextWeekRevenue: number;
    riskFactors: string[];
    opportunities: string[];
    confidence: number;
  };
  marketIntelligence: {
    competitorRates: { carrier: string; rate: number; change: number }[];
    demandForecast: { period: string; demand: number; confidence: number }[];
  };
}

interface AdvancedAnalyticsDashboardProps {
  lang: 'ko' | 'en';
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'predictions' | 'market'>('overview');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    title: { ko: '고급 분석 대시보드', en: 'Advanced Analytics Dashboard' },
    overview: { ko: '개요', en: 'Overview' },
    routes: { ko: '항로 분석', en: 'Route Analysis' },
    predictions: { ko: '예측 분석', en: 'Predictions' },
    market: { ko: '시장 정보', en: 'Market Intelligence' },
    totalBookings: { ko: '총 부킹', en: 'Total Bookings' },
    totalRevenue: { ko: '총 매출', en: 'Total Revenue' },
    close: { ko: '닫기', en: 'Close' }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockData: AnalyticsData = {
        routePerformance: [
          { route: 'Korea-LA', volume: 1250, revenue: 3750000, profitMargin: 18.5, trend: 'up' },
          { route: 'Korea-NY', volume: 980, revenue: 3200000, profitMargin: 15.2, trend: 'stable' },
          { route: 'Korea-Europe', volume: 750, revenue: 2850000, profitMargin: 22.1, trend: 'up' },
          { route: 'Korea-China', volume: 2100, revenue: 4200000, profitMargin: 12.8, trend: 'down' }
        ],
        predictiveInsights: {
          nextWeekBookings: 1850,
          nextWeekRevenue: 5200000,
          riskFactors: ['유가 상승', '환율 변동', '항만 혼잡'],
          opportunities: ['LA 수요 증가', '유럽 프리미엄', '신규 고객'],
          confidence: 0.87
        },
        marketIntelligence: {
          competitorRates: [
            { carrier: 'MSC', rate: 2850, change: 2.5 },
            { carrier: 'COSCO', rate: 2720, change: -1.2 }
          ],
          demandForecast: [
            { period: 'Q1 2025', demand: 85, confidence: 0.92 },
            { period: 'Q2 2025', demand: 92, confidence: 0.88 }
          ]
        }
      };
      
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all shadow-sm bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"
        title={t.title[lang]}
      >
        <BarChart3 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[700px] max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t.title[lang]}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">AI 기반 비즈니스 인텔리전스</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border-b border-slate-200 dark:border-slate-700 px-6">
            <div className="flex space-x-8">
              {(['overview', 'routes', 'predictions', 'market'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t[tab][lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : data && (
              <div className="space-y-4">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-sm text-blue-600">{t.totalBookings[lang]}</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {data.routePerformance.reduce((sum, r) => sum + r.volume, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-sm text-green-600">{t.totalRevenue[lang]}</p>
                      <p className="text-2xl font-bold text-green-800">
                        ${(data.routePerformance.reduce((sum, r) => sum + r.revenue, 0) / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'routes' && (
                  <div className="space-y-3">
                    {data.routePerformance.map((route, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h5 className="font-medium mb-2">{route.route}</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Volume:</span>
                            <span className="ml-2 font-bold">{route.volume.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Revenue:</span>
                            <span className="ml-2 font-bold">${(route.revenue/1000000).toFixed(1)}M</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Margin:</span>
                            <span className="ml-2 font-bold">{route.profitMargin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;