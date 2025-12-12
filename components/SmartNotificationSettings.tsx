import React, { useState, useEffect } from 'react';
import { Settings, Bell, Mail, Smartphone, Save, Plus, X, TrendingDown, Ship, AlertTriangle, Target } from 'lucide-react';
import { Language } from '../types';

interface NotificationRule {
  id: string;
  name: string;
  type: 'rate_threshold' | 'route_alert' | 'competitor_change' | 'risk_level';
  enabled: boolean;
  conditions: {
    routes?: string[];
    threshold?: number;
    comparison?: 'below' | 'above' | 'change';
    percentage?: number;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
  priority: 'high' | 'medium' | 'low';
}

interface SmartNotificationSettingsProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

const SmartNotificationSettings: React.FC<SmartNotificationSettingsProps> = ({ lang, isOpen, onClose }) => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    name: '',
    type: 'rate_threshold',
    enabled: true,
    conditions: {},
    channels: { push: true, email: false, sms: false },
    frequency: 'immediate',
    priority: 'medium'
  });
  const [globalSettings, setGlobalSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
    quietHours: { start: '22:00', end: '08:00' },
    timezone: 'Asia/Seoul'
  });

  const t = {
    title: { ko: '스마트 알림 설정', en: 'Smart Notification Settings' },
    globalSettings: { ko: '전역 설정', en: 'Global Settings' },
    notificationRules: { ko: '알림 규칙', en: 'Notification Rules' },
    addRule: { ko: '규칙 추가', en: 'Add Rule' },
    
    // Global Settings
    pushNotifications: { ko: '푸시 알림', en: 'Push Notifications' },
    emailNotifications: { ko: '이메일 알림', en: 'Email Notifications' },
    smsNotifications: { ko: 'SMS 알림', en: 'SMS Notifications' },
    quietHours: { ko: '방해 금지 시간', en: 'Quiet Hours' },
    timezone: { ko: '시간대', en: 'Timezone' },
    
    // Rule Types
    rateThreshold: { ko: '운임 임계값', en: 'Rate Threshold' },
    routeAlert: { ko: '항로 알림', en: 'Route Alert' },
    competitorChange: { ko: '경쟁사 변경', en: 'Competitor Change' },
    riskLevel: { ko: '리스크 레벨', en: 'Risk Level' },
    
    // Conditions
    routes: { ko: '항로', en: 'Routes' },
    threshold: { ko: '임계값', en: 'Threshold' },
    comparison: { ko: '비교', en: 'Comparison' },
    below: { ko: '이하', en: 'Below' },
    above: { ko: '이상', en: 'Above' },
    change: { ko: '변화', en: 'Change' },
    percentage: { ko: '퍼센트', en: 'Percentage' },
    
    // Channels
    channels: { ko: '알림 채널', en: 'Notification Channels' },
    frequency: { ko: '빈도', en: 'Frequency' },
    priority: { ko: '우선순위', en: 'Priority' },
    
    // Frequency
    immediate: { ko: '즉시', en: 'Immediate' },
    hourly: { ko: '시간별', en: 'Hourly' },
    daily: { ko: '일별', en: 'Daily' },
    
    // Priority
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Actions
    save: { ko: '저장', en: 'Save' },
    cancel: { ko: '취소', en: 'Cancel' },
    delete: { ko: '삭제', en: 'Delete' },
    edit: { ko: '편집', en: 'Edit' },
    
    // Form
    ruleName: { ko: '규칙 이름', en: 'Rule Name' },
    ruleNamePlaceholder: { ko: '예: LA 항로 운임 하락 알림', en: 'e.g., LA Route Rate Drop Alert' },
    selectRoutes: { ko: '항로 선택', en: 'Select Routes' },
    enterThreshold: { ko: '임계값 입력', en: 'Enter Threshold' },
    
    // Success/Error
    saved: { ko: '설정이 저장되었습니다', en: 'Settings saved successfully' },
    error: { ko: '저장 중 오류가 발생했습니다', en: 'Error saving settings' }
  };

  const routes = [
    { value: 'kr-la', label: lang === 'ko' ? '한국-LA' : 'Korea-LA' },
    { value: 'kr-ny', label: lang === 'ko' ? '한국-뉴욕' : 'Korea-New York' },
    { value: 'kr-eu', label: lang === 'ko' ? '한국-유럽' : 'Korea-Europe' },
    { value: 'kr-cn', label: lang === 'ko' ? '한국-중국' : 'Korea-China' },
    { value: 'kr-jp', label: lang === 'ko' ? '한국-일본' : 'Korea-Japan' }
  ];

  useEffect(() => {
    // Load existing rules from localStorage or API
    const savedRules = localStorage.getItem('notificationRules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      // Default rules
      const defaultRules: NotificationRule[] = [
        {
          id: '1',
          name: lang === 'ko' ? 'LA 항로 운임 하락' : 'LA Route Rate Drop',
          type: 'rate_threshold',
          enabled: true,
          conditions: {
            routes: ['kr-la'],
            threshold: 2800,
            comparison: 'below'
          },
          channels: { push: true, email: true, sms: false },
          frequency: 'immediate',
          priority: 'high'
        },
        {
          id: '2',
          name: lang === 'ko' ? '경쟁사 가격 변동' : 'Competitor Price Changes',
          type: 'competitor_change',
          enabled: true,
          conditions: {
            percentage: 5
          },
          channels: { push: true, email: false, sms: false },
          frequency: 'hourly',
          priority: 'medium'
        }
      ];
      setRules(defaultRules);
    }

    // Load global settings
    const savedGlobalSettings = localStorage.getItem('globalNotificationSettings');
    if (savedGlobalSettings) {
      setGlobalSettings(JSON.parse(savedGlobalSettings));
    }
  }, [lang]);

  const handleSaveGlobalSettings = () => {
    localStorage.setItem('globalNotificationSettings', JSON.stringify(globalSettings));
    // Show success message
  };

  const handleAddRule = () => {
    if (!newRule.name) return;

    const rule: NotificationRule = {
      id: Date.now().toString(),
      name: newRule.name,
      type: newRule.type || 'rate_threshold',
      enabled: true,
      conditions: newRule.conditions || {},
      channels: newRule.channels || { push: true, email: false, sms: false },
      frequency: newRule.frequency || 'immediate',
      priority: newRule.priority || 'medium'
    };

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    localStorage.setItem('notificationRules', JSON.stringify(updatedRules));
    
    setNewRule({
      name: '',
      type: 'rate_threshold',
      enabled: true,
      conditions: {},
      channels: { push: true, email: false, sms: false },
      frequency: 'immediate',
      priority: 'medium'
    });
    setShowAddRule(false);
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    setRules(updatedRules);
    localStorage.setItem('notificationRules', JSON.stringify(updatedRules));
  };

  const handleToggleRule = (id: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(updatedRules);
    localStorage.setItem('notificationRules', JSON.stringify(updatedRules));
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'rate_threshold': return TrendingDown;
      case 'route_alert': return Target;
      case 'competitor_change': return Ship;
      case 'risk_level': return AlertTriangle;
      default: return Bell;
    }
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">{t.title[lang]}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-700 p-4">
              <nav className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold">
                  {t.globalSettings[lang]}
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                  {t.notificationRules[lang]}
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Global Settings Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">{t.globalSettings[lang]}</h3>
                  
                  <div className="space-y-4">
                    {/* Notification Channels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold">{t.pushNotifications[lang]}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={globalSettings.pushEnabled}
                              onChange={(e) => setGlobalSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-green-600" />
                            <span className="font-semibold">{t.emailNotifications[lang]}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={globalSettings.emailEnabled}
                              onChange={(e) => setGlobalSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold">{t.smsNotifications[lang]}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={globalSettings.smsEnabled}
                              onChange={(e) => setGlobalSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <h4 className="font-semibold mb-3">{t.quietHours[lang]}</h4>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">시작</label>
                          <input
                            type="time"
                            value={globalSettings.quietHours.start}
                            onChange={(e) => setGlobalSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, start: e.target.value }
                            }))}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">종료</label>
                          <input
                            type="time"
                            value={globalSettings.quietHours.end}
                            onChange={(e) => setGlobalSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, end: e.target.value }
                            }))}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveGlobalSettings}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {t.save[lang]}
                    </button>
                  </div>
                </div>

                {/* Notification Rules Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{t.notificationRules[lang]}</h3>
                    <button
                      onClick={() => setShowAddRule(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t.addRule[lang]}
                    </button>
                  </div>

                  {/* Rules List */}
                  <div className="space-y-3">
                    {rules.map(rule => {
                      const Icon = getRuleIcon(rule.type);
                      return (
                        <div key={rule.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-blue-600" />
                              <div>
                                <h4 className="font-semibold">{rule.name}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {t[rule.type as keyof typeof t][lang]} • {t[rule.priority as keyof typeof t][lang]} • {t[rule.frequency as keyof typeof t][lang]}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rule.enabled}
                                  onChange={() => handleToggleRule(rule.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-60"
            onClick={() => setShowAddRule(false)}
          />
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold">{t.addRule[lang]}</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.ruleName[lang]}</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t.ruleNamePlaceholder[lang]}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>

                {/* Rule Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2">규칙 유형</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="rate_threshold">{t.rateThreshold[lang]}</option>
                    <option value="route_alert">{t.routeAlert[lang]}</option>
                    <option value="competitor_change">{t.competitorChange[lang]}</option>
                    <option value="risk_level">{t.riskLevel[lang]}</option>
                  </select>
                </div>

                {/* Conditions based on type */}
                {newRule.type === 'rate_threshold' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t.routes[lang]}</label>
                      <select
                        multiple
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 h-24"
                      >
                        {routes.map(route => (
                          <option key={route.value} value={route.value}>{route.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t.threshold[lang]} (USD)</label>
                      <input
                        type="number"
                        value={newRule.conditions?.threshold || ''}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, threshold: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Priority & Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">{t.priority[lang]}</label>
                    <select
                      value={newRule.priority}
                      onChange={(e) => setNewRule(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    >
                      <option value="high">{t.high[lang]}</option>
                      <option value="medium">{t.medium[lang]}</option>
                      <option value="low">{t.low[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">{t.frequency[lang]}</label>
                    <select
                      value={newRule.frequency}
                      onChange={(e) => setNewRule(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    >
                      <option value="immediate">{t.immediate[lang]}</option>
                      <option value="hourly">{t.hourly[lang]}</option>
                      <option value="daily">{t.daily[lang]}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddRule(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {t.save[lang]}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SmartNotificationSettings;