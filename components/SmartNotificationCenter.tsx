import React, { useState, useEffect } from 'react';
import { Bell, Settings, Zap, Brain, TrendingUp, AlertTriangle, CheckCircle, X, Plus, Trash2, Edit } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  type: 'rate_change' | 'booking_opportunity' | 'risk_alert' | 'ai_insight' | 'market_trend';
  enabled: boolean;
  conditions: {
    threshold?: number;
    comparison?: 'above' | 'below' | 'change';
    routes?: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  channels: ('email' | 'sms' | 'push' | 'slack')[];
  schedule: {
    immediate: boolean;
    digest: boolean;
    digestTime?: string;
    quietHours?: { start: string; end: string };
  };
  aiEnhanced: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

interface SmartNotificationCenterProps {
  lang: 'ko' | 'en';
}

const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const t = {
    title: { ko: '스마트 알림 센터', en: 'Smart Notification Center' },
    subtitle: { ko: 'AI 기반 맞춤형 알림 관리', en: 'AI-powered Personalized Notification Management' },
    createRule: { ko: '규칙 생성', en: 'Create Rule' },
    editRule: { ko: '규칙 편집', en: 'Edit Rule' },
    deleteRule: { ko: '규칙 삭제', en: 'Delete Rule' },
    
    // Rule Types
    rateChange: { ko: '운임 변동', en: 'Rate Change' },
    bookingOpportunity: { ko: '부킹 기회', en: 'Booking Opportunity' },
    riskAlert: { ko: '리스크 경고', en: 'Risk Alert' },
    aiInsight: { ko: 'AI 인사이트', en: 'AI Insight' },
    marketTrend: { ko: '시장 동향', en: 'Market Trend' },
    
    // Channels
    email: { ko: '이메일', en: 'Email' },
    sms: { ko: 'SMS', en: 'SMS' },
    push: { ko: '푸시', en: 'Push' },
    slack: { ko: 'Slack', en: 'Slack' },
    
    // Priority
    low: { ko: '낮음', en: 'Low' },
    medium: { ko: '보통', en: 'Medium' },
    high: { ko: '높음', en: 'High' },
    critical: { ko: '긴급', en: 'Critical' },
    
    // Settings
    immediate: { ko: '즉시 알림', en: 'Immediate' },
    digest: { ko: '요약 알림', en: 'Digest' },
    quietHours: { ko: '방해 금지 시간', en: 'Quiet Hours' },
    aiEnhanced: { ko: 'AI 향상', en: 'AI Enhanced' },
    
    // Actions
    enable: { ko: '활성화', en: 'Enable' },
    disable: { ko: '비활성화', en: 'Disable' },
    save: { ko: '저장', en: 'Save' },
    cancel: { ko: '취소', en: 'Cancel' },
    close: { ko: '닫기', en: 'Close' },
    
    // AI Insights
    aiInsightsTitle: { ko: 'AI 추천 알림 설정', en: 'AI Recommended Settings' },
    optimizeSettings: { ko: '설정 최적화', en: 'Optimize Settings' }
  };

  useEffect(() => {
    // Initialize with mock data
    const mockRules: NotificationRule[] = [
      {
        id: 'rule-1',
        name: lang === 'ko' ? 'LA 항로 운임 급변 알림' : 'LA Route Rate Alert',
        type: 'rate_change',
        enabled: true,
        conditions: {
          threshold: 5,
          comparison: 'change',
          routes: ['kr-la'],
          priority: 'high'
        },
        channels: ['email', 'push'],
        schedule: {
          immediate: true,
          digest: false,
          quietHours: { start: '22:00', end: '08:00' }
        },
        aiEnhanced: true,
        createdAt: new Date('2024-12-01'),
        lastTriggered: new Date('2024-12-10')
      },
      {
        id: 'rule-2',
        name: lang === 'ko' ? 'AI 부킹 기회 알림' : 'AI Booking Opportunity Alert',
        type: 'booking_opportunity',
        enabled: true,
        conditions: {
          priority: 'medium'
        },
        channels: ['push', 'slack'],
        schedule: {
          immediate: true,
          digest: true,
          digestTime: '09:00'
        },
        aiEnhanced: true,
        createdAt: new Date('2024-11-15')
      }
    ];

    const mockInsights = [
      lang === 'ko' 
        ? '최근 7일간 LA 항로 운임이 15% 상승했습니다. 알림 임계값을 3%로 낮추는 것을 권장합니다.'
        : 'LA route rates increased 15% in the last 7 days. Consider lowering alert threshold to 3%.',
      lang === 'ko'
        ? '오전 9-11시에 가장 많은 부킹 기회가 발생합니다. 이 시간대 알림을 활성화하세요.'
        : 'Most booking opportunities occur between 9-11 AM. Enable notifications for this time window.',
      lang === 'ko'
        ? 'AI가 감지한 패턴: 금요일 오후에 운임 변동이 가장 큽니다.'
        : 'AI detected pattern: Largest rate fluctuations occur on Friday afternoons.'
    ];

    setRules(mockRules);
    setAiInsights(mockInsights);
  }, [lang]);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_change': return <TrendingUp className="w-4 h-4" />;
      case 'booking_opportunity': return <Zap className="w-4 h-4" />;
      case 'risk_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'ai_insight': return <Brain className="w-4 h-4" />;
      case 'market_trend': return <TrendingUp className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rate_change': return 'text-blue-600 dark:text-blue-400';
      case 'booking_opportunity': return 'text-green-600 dark:text-green-400';
      case 'risk_alert': return 'text-red-600 dark:text-red-400';
      case 'ai_insight': return 'text-purple-600 dark:text-purple-400';
      case 'market_trend': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="relative">
      {/* Smart Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all shadow-sm bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
        title={t.title[lang]}
      >
        <div className="relative">
          <Settings className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
        </div>
      </button>

      {/* Smart Notification Center Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-[600px] max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t.title[lang]}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.subtitle[lang]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateRule(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {t.createRule[lang]}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={t.close[lang]}
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">{t.aiInsightsTitle[lang]}</h4>
              </div>
              <div className="space-y-2">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-purple-700 dark:text-purple-300">{insight}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                {t.optimizeSettings[lang]}
              </button>
            </div>

            {/* Notification Rules */}
            <div>
              <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">알림 규칙</h4>
              <div className="space-y-3">
                {rules.map(rule => (
                  <div key={rule.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(rule.type)} bg-opacity-10`}>
                          {getTypeIcon(rule.type)}
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-800 dark:text-slate-200">{rule.name}</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t[rule.type as keyof typeof t][lang]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rule.aiEnhanced && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                            <Brain className="w-3 h-3" />
                            AI
                          </div>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => handleToggleRule(rule.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">우선순위:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.conditions.priority)}`}>
                          {t[rule.conditions.priority as keyof typeof t][lang]}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">채널:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">
                          {rule.channels.map(channel => t[channel as keyof typeof t][lang]).join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">즉시 알림:</span>
                        <span className={`ml-2 ${rule.schedule.immediate ? 'text-green-600' : 'text-gray-600'}`}>
                          {rule.schedule.immediate ? '활성' : '비활성'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">마지막 실행:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">
                          {rule.lastTriggered ? rule.lastTriggered.toLocaleDateString() : '없음'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <button
                        onClick={() => setSelectedRule(rule)}
                        className="p-1 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                        title={t.editRule[lang]}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                        title={t.deleteRule[lang]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">활성 규칙</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {rules.filter(r => r.enabled).length}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">총 규칙</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{rules.length}</p>
                  </div>
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">AI 향상</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {rules.filter(r => r.aiEnhanced).length}
                    </p>
                  </div>
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartNotificationCenter;