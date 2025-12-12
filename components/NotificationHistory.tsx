import React, { useState, useEffect } from 'react';
import { History, Filter, Download, TrendingUp, Bell, Clock, CheckCircle, X, Calendar, BarChart3 } from 'lucide-react';
import { Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface NotificationHistoryItem {
  id: string;
  type: 'rate_drop' | 'competitor' | 'risk' | 'opportunity';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'sent' | 'delivered' | 'read' | 'acted';
  channels: string[];
  actionTaken?: string;
  responseTime?: number; // minutes
}

interface NotificationHistoryProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ lang, isOpen, onClose }) => {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<NotificationHistoryItem[]>([]);
  const [filters, setFilters] = useState({
    dateRange: '7d',
    type: 'all',
    priority: 'all',
    status: 'all'
  });
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [analytics, setAnalytics] = useState({
    totalNotifications: 0,
    responseRate: 0,
    avgResponseTime: 0,
    byType: [] as any[],
    byPriority: [] as any[],
    dailyTrend: [] as any[]
  });

  const t = {
    title: { ko: '알림 히스토리', en: 'Notification History' },
    analytics: { ko: '분석', en: 'Analytics' },
    list: { ko: '목록', en: 'List' },
    
    // Filters
    filters: { ko: '필터', en: 'Filters' },
    dateRange: { ko: '기간', en: 'Date Range' },
    type: { ko: '유형', en: 'Type' },
    priority: { ko: '우선순위', en: 'Priority' },
    status: { ko: '상태', en: 'Status' },
    
    // Date ranges
    '7d': { ko: '최근 7일', en: 'Last 7 days' },
    '30d': { ko: '최근 30일', en: 'Last 30 days' },
    '90d': { ko: '최근 90일', en: 'Last 90 days' },
    'all': { ko: '전체', en: 'All' },
    
    // Types
    rate_drop: { ko: '운임 하락', en: 'Rate Drop' },
    competitor: { ko: '경쟁사', en: 'Competitor' },
    risk: { ko: '리스크', en: 'Risk' },
    opportunity: { ko: '기회', en: 'Opportunity' },
    
    // Priority
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Status
    sent: { ko: '발송됨', en: 'Sent' },
    delivered: { ko: '전달됨', en: 'Delivered' },
    read: { ko: '읽음', en: 'Read' },
    acted: { ko: '조치됨', en: 'Acted' },
    
    // Analytics
    totalNotifications: { ko: '총 알림 수', en: 'Total Notifications' },
    responseRate: { ko: '응답률', en: 'Response Rate' },
    avgResponseTime: { ko: '평균 응답 시간', en: 'Avg Response Time' },
    minutes: { ko: '분', en: 'minutes' },
    
    // Charts
    notificationsByType: { ko: '유형별 알림', en: 'Notifications by Type' },
    notificationsByPriority: { ko: '우선순위별 알림', en: 'Notifications by Priority' },
    dailyTrend: { ko: '일별 추이', en: 'Daily Trend' },
    
    // Actions
    export: { ko: '내보내기', en: 'Export' },
    clearHistory: { ko: '히스토리 삭제', en: 'Clear History' },
    
    // Time
    now: { ko: '방금', en: 'Just now' },
    minutesAgo: { ko: '분 전', en: 'min ago' },
    hoursAgo: { ko: '시간 전', en: 'h ago' },
    daysAgo: { ko: '일 전', en: 'd ago' }
  };

  useEffect(() => {
    // Generate mock history data
    const mockHistory: NotificationHistoryItem[] = [];
    const types: Array<'rate_drop' | 'competitor' | 'risk' | 'opportunity'> = ['rate_drop', 'competitor', 'risk', 'opportunity'];
    const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const statuses: Array<'sent' | 'delivered' | 'read' | 'acted'> = ['sent', 'delivered', 'read', 'acted'];
    
    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      
      mockHistory.push({
        id: `hist_${i}`,
        type,
        title: `${t[type][lang]} 알림 #${i + 1}`,
        message: `${type} 관련 알림 메시지입니다.`,
        timestamp,
        priority,
        status,
        channels: ['push', 'email'].slice(0, Math.floor(Math.random() * 2) + 1),
        actionTaken: status === 'acted' ? '부킹 완료' : undefined,
        responseTime: status === 'acted' ? Math.floor(Math.random() * 120) + 5 : undefined
      });
    }
    
    setHistory(mockHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, [lang]);

  useEffect(() => {
    // Apply filters
    let filtered = [...history];
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => item.timestamp >= cutoff);
    }
    
    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    setFilteredHistory(filtered);
    
    // Calculate analytics
    const total = filtered.length;
    const acted = filtered.filter(item => item.status === 'acted').length;
    const responseRate = total > 0 ? (acted / total) * 100 : 0;
    
    const responseTimes = filtered
      .filter(item => item.responseTime)
      .map(item => item.responseTime!);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    // Group by type
    const byType = Object.entries(
      filtered.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({
      name: t[type as keyof typeof t][lang],
      value: count,
      color: getTypeColor(type)
    }));
    
    // Group by priority
    const byPriority = Object.entries(
      filtered.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([priority, count]) => ({
      name: t[priority as keyof typeof t][lang],
      value: count,
      color: getPriorityColor(priority)
    }));
    
    // Daily trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayNotifications = filtered.filter(item => 
        item.timestamp >= dayStart && item.timestamp < dayEnd
      );
      
      dailyTrend.push({
        date: date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }),
        notifications: dayNotifications.length,
        acted: dayNotifications.filter(item => item.status === 'acted').length
      });
    }
    
    setAnalytics({
      totalNotifications: total,
      responseRate,
      avgResponseTime,
      byType,
      byPriority,
      dailyTrend
    });
  }, [history, filters, lang]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rate_drop': return '#10b981';
      case 'competitor': return '#3b82f6';
      case 'risk': return '#ef4444';
      case 'opportunity': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return Clock;
      case 'delivered': return CheckCircle;
      case 'read': return Bell;
      case 'acted': return TrendingUp;
      default: return Clock;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return t.now[lang];
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t.minutesAgo[lang]}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}${t.hoursAgo[lang]}`;
    const days = Math.floor(hours / 24);
    return `${days}${t.daysAgo[lang]}`;
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'Title', 'Priority', 'Status', 'Channels', 'Response Time'],
      ...filteredHistory.map(item => [
        item.timestamp.toISOString(),
        item.type,
        item.title,
        item.priority,
        item.status,
        item.channels.join(';'),
        item.responseTime?.toString() || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">{t.title[lang]}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t.export[lang]}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-6 py-3 font-semibold border-b-2 transition ${
                  activeTab === 'list'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.list[lang]}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 font-semibold border-b-2 transition ${
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.analytics[lang]}
              </button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-200px)]">
            {/* Filters Sidebar */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold">{t.filters[lang]}</h3>
              </div>
              
              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.dateRange[lang]}</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="7d">{t['7d'][lang]}</option>
                    <option value="30d">{t['30d'][lang]}</option>
                    <option value="90d">{t['90d'][lang]}</option>
                    <option value="all">{t.all[lang]}</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.type[lang]}</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="all">{t.all[lang]}</option>
                    <option value="rate_drop">{t.rate_drop[lang]}</option>
                    <option value="competitor">{t.competitor[lang]}</option>
                    <option value="risk">{t.risk[lang]}</option>
                    <option value="opportunity">{t.opportunity[lang]}</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.priority[lang]}</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="all">{t.all[lang]}</option>
                    <option value="high">{t.high[lang]}</option>
                    <option value="medium">{t.medium[lang]}</option>
                    <option value="low">{t.low[lang]}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.status[lang]}</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="all">{t.all[lang]}</option>
                    <option value="sent">{t.sent[lang]}</option>
                    <option value="delivered">{t.delivered[lang]}</option>
                    <option value="read">{t.read[lang]}</option>
                    <option value="acted">{t.acted[lang]}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'list' ? (
                /* History List */
                <div className="p-6">
                  <div className="space-y-3">
                    {filteredHistory.map(item => {
                      const StatusIcon = getStatusIcon(item.status);
                      return (
                        <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`} style={{ backgroundColor: getPriorityColor(item.priority) }}></div>
                                <h4 className="font-semibold">{item.title}</h4>
                                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                                  {t[item.type as keyof typeof t][lang]}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.message}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>{getTimeAgo(item.timestamp)}</span>
                                <span>채널: {item.channels.join(', ')}</span>
                                {item.responseTime && (
                                  <span>응답: {item.responseTime}{t.minutes[lang]}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-5 h-5 ${
                                item.status === 'acted' ? 'text-green-600' :
                                item.status === 'read' ? 'text-blue-600' :
                                item.status === 'delivered' ? 'text-yellow-600' :
                                'text-slate-400'
                              }`} />
                              <span className="text-xs font-semibold">{t[item.status as keyof typeof t][lang]}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Analytics */
                <div className="p-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">{t.totalNotifications[lang]}</p>
                          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{analytics.totalNotifications}</p>
                        </div>
                        <Bell className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{t.responseRate[lang]}</p>
                          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{analytics.responseRate.toFixed(1)}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">{t.avgResponseTime[lang]}</p>
                          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{analytics.avgResponseTime.toFixed(0)}<span className="text-lg">{t.minutes[lang]}</span></p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Daily Trend */}
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600">
                      <h3 className="text-lg font-bold mb-4">{t.dailyTrend[lang]}</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analytics.dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="notifications" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="acted" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* By Type */}
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600">
                      <h3 className="text-lg font-bold mb-4">{t.notificationsByType[lang]}</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics.byType}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {analytics.byType.map((entry, index) => (
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationHistory;