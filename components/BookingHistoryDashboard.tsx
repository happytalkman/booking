import React, { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, DollarSign, Ship, Calendar, Filter, Download, BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react';
import { Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface BookingRecord {
  id: string;
  bookingNumber: string;
  route: string;
  containerType: string;
  quantity: number;
  rate: number;
  bookingDate: Date;
  departureDate: Date;
  arrivalDate?: Date;
  status: 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  shipper: string;
  savings?: number; // Amount saved compared to market rate
  aiRecommended: boolean;
}

interface BookingHistoryDashboardProps {
  lang: Language;
}

const BookingHistoryDashboard: React.FC<BookingHistoryDashboardProps> = ({ lang }) => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingRecord[]>([]);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    route: 'all',
    status: 'all',
    containerType: 'all'
  });
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalVolume: 0,
    totalSavings: 0,
    avgRate: 0,
    aiRecommendationRate: 0,
    monthlyTrend: [] as any[],
    routeDistribution: [] as any[],
    seasonalTrends: [] as any[],
    costAnalysis: [] as any[]
  });

  const t = {
    title: { ko: '부킹 히스토리 & 분석', en: 'Booking History & Analytics' },
    
    // Tabs
    overview: { ko: '개요', en: 'Overview' },
    trends: { ko: '트렌드', en: 'Trends' },
    savings: { ko: '절약 분석', en: 'Savings Analysis' },
    roi: { ko: 'ROI 계산기', en: 'ROI Calculator' },
    
    // Filters
    filters: { ko: '필터', en: 'Filters' },
    dateRange: { ko: '기간', en: 'Date Range' },
    route: { ko: '항로', en: 'Route' },
    status: { ko: '상태', en: 'Status' },
    containerType: { ko: '컨테이너 타입', en: 'Container Type' },
    
    // Date ranges
    '7d': { ko: '최근 7일', en: 'Last 7 days' },
    '30d': { ko: '최근 30일', en: 'Last 30 days' },
    '90d': { ko: '최근 90일', en: 'Last 90 days' },
    '1y': { ko: '최근 1년', en: 'Last year' },
    'all': { ko: '전체', en: 'All' },
    
    // Status
    confirmed: { ko: '확정', en: 'Confirmed' },
    in_transit: { ko: '운송중', en: 'In Transit' },
    delivered: { ko: '배송완료', en: 'Delivered' },
    cancelled: { ko: '취소', en: 'Cancelled' },
    
    // Metrics
    totalBookings: { ko: '총 부킹 수', en: 'Total Bookings' },
    totalVolume: { ko: '총 물량', en: 'Total Volume' },
    totalSavings: { ko: '총 절약액', en: 'Total Savings' },
    avgRate: { ko: '평균 운임', en: 'Average Rate' },
    aiRecommendationRate: { ko: 'AI 추천 적용률', en: 'AI Recommendation Rate' },
    
    // Charts
    monthlyBookingTrend: { ko: '월별 부킹 추이', en: 'Monthly Booking Trend' },
    routeDistribution: { ko: '항로별 분포', en: 'Route Distribution' },
    seasonalTrends: { ko: '계절성 트렌드', en: 'Seasonal Trends' },
    costSavingsAnalysis: { ko: '비용 절약 분석', en: 'Cost Savings Analysis' },
    rateComparison: { ko: '운임 비교', en: 'Rate Comparison' },
    
    // Units
    teu: { ko: 'TEU', en: 'TEU' },
    usd: { ko: 'USD', en: 'USD' },
    
    // Actions
    export: { ko: '내보내기', en: 'Export' },
    generateReport: { ko: '리포트 생성', en: 'Generate Report' },
    
    // ROI Calculator
    roiCalculator: { ko: 'ROI 계산기', en: 'ROI Calculator' },
    platformCost: { ko: '플랫폼 비용', en: 'Platform Cost' },
    monthlyCost: { ko: '월 비용', en: 'Monthly Cost' },
    annualSavings: { ko: '연간 절약액', en: 'Annual Savings' },
    roi: { ko: 'ROI', en: 'ROI' },
    paybackPeriod: { ko: '투자 회수 기간', en: 'Payback Period' },
    months: { ko: '개월', en: 'months' },
    
    // Insights
    insights: { ko: '인사이트', en: 'Insights' },
    topPerformingRoute: { ko: '최고 성과 항로', en: 'Top Performing Route' },
    bestSavingsMonth: { ko: '최대 절약 월', en: 'Best Savings Month' },
    aiRecommendationImpact: { ko: 'AI 추천 효과', en: 'AI Recommendation Impact' }
  };

  const routes = [
    { value: 'kr-la', label: lang === 'ko' ? '한국-LA' : 'Korea-LA' },
    { value: 'kr-ny', label: lang === 'ko' ? '한국-뉴욕' : 'Korea-New York' },
    { value: 'kr-eu', label: lang === 'ko' ? '한국-유럽' : 'Korea-Europe' },
    { value: 'kr-cn', label: lang === 'ko' ? '한국-중국' : 'Korea-China' },
    { value: 'kr-jp', label: lang === 'ko' ? '한국-일본' : 'Korea-Japan' }
  ];

  const containerTypes = ['20GP', '40GP', '40HC', '45HC', 'RF'];

  useEffect(() => {
    // Generate mock booking data
    const mockBookings: BookingRecord[] = [];
    const routeValues = routes.map(r => r.value);
    const statuses: Array<'confirmed' | 'in_transit' | 'delivered' | 'cancelled'> = ['confirmed', 'in_transit', 'delivered', 'cancelled'];
    
    for (let i = 0; i < 200; i++) {
      const bookingDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Last year
      const departureDate = new Date(bookingDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const route = routeValues[Math.floor(Math.random() * routeValues.length)];
      const containerType = containerTypes[Math.floor(Math.random() * containerTypes.length)];
      const quantity = Math.floor(Math.random() * 50) + 1;
      const baseRate = 2000 + Math.random() * 2000; // $2000-4000
      const aiRecommended = Math.random() > 0.6;
      const savings = aiRecommended ? Math.random() * 500 + 50 : 0; // $50-550 savings if AI recommended
      
      mockBookings.push({
        id: `BK${String(i + 1).padStart(6, '0')}`,
        bookingNumber: `KMTC${String(i + 1).padStart(8, '0')}`,
        route,
        containerType,
        quantity,
        rate: baseRate - savings,
        bookingDate,
        departureDate,
        arrivalDate: Math.random() > 0.3 ? new Date(departureDate.getTime() + (Math.random() * 30 + 10) * 24 * 60 * 60 * 1000) : undefined,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        shipper: `Shipper ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
        savings,
        aiRecommended
      });
    }
    
    setBookings(mockBookings.sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime()));
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...bookings];
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = filters.dateRange === '1y' ? 365 : parseInt(filters.dateRange);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(booking => booking.bookingDate >= cutoff);
    }
    
    // Route filter
    if (filters.route !== 'all') {
      filtered = filtered.filter(booking => booking.route === filters.route);
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }
    
    // Container type filter
    if (filters.containerType !== 'all') {
      filtered = filtered.filter(booking => booking.containerType === filters.containerType);
    }
    
    setFilteredBookings(filtered);
    
    // Calculate analytics
    const totalBookings = filtered.length;
    const totalVolume = filtered.reduce((sum, booking) => sum + booking.quantity, 0);
    const totalSavings = filtered.reduce((sum, booking) => sum + (booking.savings || 0), 0);
    const avgRate = totalBookings > 0 ? filtered.reduce((sum, booking) => sum + booking.rate, 0) / totalBookings : 0;
    const aiRecommendedCount = filtered.filter(booking => booking.aiRecommended).length;
    const aiRecommendationRate = totalBookings > 0 ? (aiRecommendedCount / totalBookings) * 100 : 0;
    
    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthBookings = filtered.filter(booking => 
        booking.bookingDate >= monthStart && booking.bookingDate <= monthEnd
      );
      
      monthlyTrend.push({
        month: date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short' }),
        bookings: monthBookings.length,
        volume: monthBookings.reduce((sum, b) => sum + b.quantity, 0),
        savings: monthBookings.reduce((sum, b) => sum + (b.savings || 0), 0),
        avgRate: monthBookings.length > 0 ? monthBookings.reduce((sum, b) => sum + b.rate, 0) / monthBookings.length : 0
      });
    }
    
    // Route distribution
    const routeDistribution = Object.entries(
      filtered.reduce((acc, booking) => {
        const routeLabel = routes.find(r => r.value === booking.route)?.label || booking.route;
        acc[routeLabel] = (acc[routeLabel] || 0) + booking.quantity;
        return acc;
      }, {} as Record<string, number>)
    ).map(([route, volume]) => ({
      name: route,
      value: volume,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
    
    // Seasonal trends (quarterly)
    const seasonalTrends = [
      { quarter: 'Q1', bookings: 0, avgRate: 0, savings: 0 },
      { quarter: 'Q2', bookings: 0, avgRate: 0, savings: 0 },
      { quarter: 'Q3', bookings: 0, avgRate: 0, savings: 0 },
      { quarter: 'Q4', bookings: 0, avgRate: 0, savings: 0 }
    ];
    
    filtered.forEach(booking => {
      const quarter = Math.floor(booking.bookingDate.getMonth() / 3);
      seasonalTrends[quarter].bookings++;
      seasonalTrends[quarter].avgRate += booking.rate;
      seasonalTrends[quarter].savings += booking.savings || 0;
    });
    
    seasonalTrends.forEach(quarter => {
      if (quarter.bookings > 0) {
        quarter.avgRate = quarter.avgRate / quarter.bookings;
      }
    });
    
    // Cost analysis (AI vs Manual)
    const aiBookings = filtered.filter(b => b.aiRecommended);
    const manualBookings = filtered.filter(b => !b.aiRecommended);
    
    const costAnalysis = [
      {
        type: 'AI 추천',
        avgRate: aiBookings.length > 0 ? aiBookings.reduce((sum, b) => sum + b.rate, 0) / aiBookings.length : 0,
        avgSavings: aiBookings.length > 0 ? aiBookings.reduce((sum, b) => sum + (b.savings || 0), 0) / aiBookings.length : 0,
        count: aiBookings.length
      },
      {
        type: '수동 부킹',
        avgRate: manualBookings.length > 0 ? manualBookings.reduce((sum, b) => sum + b.rate, 0) / manualBookings.length : 0,
        avgSavings: 0,
        count: manualBookings.length
      }
    ];
    
    setAnalytics({
      totalBookings,
      totalVolume,
      totalSavings,
      avgRate,
      aiRecommendationRate,
      monthlyTrend,
      routeDistribution,
      seasonalTrends,
      costAnalysis
    });
  }, [bookings, filters, lang]);

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'savings' | 'roi'>('overview');
  const [roiInputs, setRoiInputs] = useState({
    platformCost: 5000, // Monthly platform cost
    currentSavings: analytics.totalSavings
  });

  const calculateROI = () => {
    const annualPlatformCost = roiInputs.platformCost * 12;
    const annualSavings = analytics.totalSavings * 12; // Assuming current savings represent monthly
    const roi = annualPlatformCost > 0 ? ((annualSavings - annualPlatformCost) / annualPlatformCost) * 100 : 0;
    const paybackPeriod = annualSavings > 0 ? annualPlatformCost / (annualSavings / 12) : 0;
    
    return { roi, paybackPeriod, annualSavings };
  };

  const handleExport = () => {
    const csvContent = [
      ['Booking Number', 'Route', 'Container Type', 'Quantity', 'Rate', 'Booking Date', 'Status', 'Savings', 'AI Recommended'],
      ...filteredBookings.map(booking => [
        booking.bookingNumber,
        booking.route,
        booking.containerType,
        booking.quantity.toString(),
        booking.rate.toString(),
        booking.bookingDate.toISOString().split('T')[0],
        booking.status,
        (booking.savings || 0).toString(),
        booking.aiRecommended.toString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">{t.title[lang]}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t.export[lang]}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t.generateReport[lang]}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-semibold">{t.filters[lang]}:</span>
          </div>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="7d">{t['7d'][lang]}</option>
            <option value="30d">{t['30d'][lang]}</option>
            <option value="90d">{t['90d'][lang]}</option>
            <option value="1y">{t['1y'][lang]}</option>
            <option value="all">{t.all[lang]}</option>
          </select>

          <select
            value={filters.route}
            onChange={(e) => setFilters(prev => ({ ...prev, route: e.target.value }))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="all">{t.all[lang]}</option>
            {routes.map(route => (
              <option key={route.value} value={route.value}>{route.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="all">{t.all[lang]}</option>
            <option value="confirmed">{t.confirmed[lang]}</option>
            <option value="in_transit">{t.in_transit[lang]}</option>
            <option value="delivered">{t.delivered[lang]}</option>
            <option value="cancelled">{t.cancelled[lang]}</option>
          </select>

          <select
            value={filters.containerType}
            onChange={(e) => setFilters(prev => ({ ...prev, containerType: e.target.value }))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          >
            <option value="all">{t.all[lang]}</option>
            {containerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-8">
          {(['overview', 'trends', 'savings', 'roi'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {t[tab][lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalBookings[lang]}</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalBookings}</p>
                </div>
                <Ship className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalVolume[lang]}</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.totalVolume.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{t.teu[lang]}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalSavings[lang]}</p>
                  <p className="text-3xl font-bold text-purple-600">${analytics.totalSavings.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.avgRate[lang]}</p>
                  <p className="text-3xl font-bold text-orange-600">${analytics.avgRate.toFixed(0)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.aiRecommendationRate[lang]}</p>
                  <p className="text-3xl font-bold text-indigo-600">{analytics.aiRecommendationRate.toFixed(1)}%</p>
                </div>
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-4">{t.monthlyBookingTrend[lang]}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="bookings" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="volume" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Route Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-4">{t.routeDistribution[lang]}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.routeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.routeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Seasonal Trends */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">{t.seasonalTrends[lang]}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" />
                <Line yAxisId="right" type="monotone" dataKey="avgRate" stroke="#ef4444" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rate Comparison */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">{t.rateComparison[lang]}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgRate" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-6">
          {/* Cost Analysis */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">{t.costSavingsAnalysis[lang]}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.costAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgRate" fill="#3b82f6" />
                <Bar dataKey="avgSavings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
              <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">{t.topPerformingRoute[lang]}</h4>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {analytics.routeDistribution[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {analytics.routeDistribution[0]?.value || 0} TEU
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">{t.bestSavingsMonth[lang]}</h4>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {analytics.monthlyTrend.reduce((max, month) => month.savings > max.savings ? month : max, analytics.monthlyTrend[0] || { month: 'N/A', savings: 0 }).month}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                ${analytics.monthlyTrend.reduce((max, month) => Math.max(max, month.savings), 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
              <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">{t.aiRecommendationImpact[lang]}</h4>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {analytics.aiRecommendationRate.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                ${(analytics.totalSavings * analytics.aiRecommendationRate / 100).toLocaleString()} 절약
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roi' && (
        <div className="space-y-6">
          {/* ROI Calculator */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">{t.roiCalculator[lang]}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.monthlyCost[lang]} (USD)</label>
                  <input
                    type="number"
                    value={roiInputs.platformCost}
                    onChange={(e) => setRoiInputs(prev => ({ ...prev, platformCost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.annualSavings[lang]} (USD)</label>
                  <input
                    type="number"
                    value={calculateROI().annualSavings}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-600"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">{t.roi[lang]}</h4>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                    {calculateROI().roi.toFixed(1)}%
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">{t.paybackPeriod[lang]}</h4>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                    {calculateROI().paybackPeriod.toFixed(1)} {t.months[lang]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryDashboard;