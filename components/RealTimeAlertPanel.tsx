import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings, AlertTriangle, Info, AlertCircle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { alertService, Alert, AlertRule } from '../services/alertService';

interface RealTimeAlertPanelProps {
  lang: 'ko' | 'en';
}

const RealTimeAlertPanel: React.FC<RealTimeAlertPanelProps> = ({ lang }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const t = {
    alerts: { ko: '실시간 알림', en: 'Real-time Alerts' },
    noAlerts: { ko: '알림이 없습니다', en: 'No alerts' },
    acknowledgeAll: { ko: '모두 확인', en: 'Acknowledge All' },
    settings: { ko: '알림 설정', en: 'Alert Settings' },
    testAlert: { ko: '테스트 알림', en: 'Test Alert' },
    enable: { ko: '활성화', en: 'Enable' },
    disable: { ko: '비활성화', en: 'Disable' },
    threshold: { ko: '임계값', en: 'Threshold' },
    priority: { ko: '우선순위', en: 'Priority' },
    cooldown: { ko: '쿨다운 (분)', en: 'Cooldown (min)' },
    sound: { ko: '알림음', en: 'Sound' },
    
    // Alert types
    exchangeRate: { ko: '환율 변동', en: 'Exchange Rate' },
    oilPrice: { ko: '유가 변동', en: 'Oil Price' },
    weather: { ko: '날씨 경고', en: 'Weather Alert' },
    geopolitical: { ko: '지정학적 리스크', en: 'Geopolitical Risk' },
    
    // Priority levels
    low: { ko: '낮음', en: 'Low' },
    medium: { ko: '보통', en: 'Medium' },
    high: { ko: '높음', en: 'High' },
    critical: { ko: '긴급', en: 'Critical' }
  };

  useEffect(() => {
    // 초기 데이터 로드
    setAlerts(alertService.getAlerts());
    setRules(alertService.getRules());
    updateUnacknowledgedCount();

    // 알림 구독
    const unsubscribe = alertService.subscribe((alert: Alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      updateUnacknowledgedCount();
      
      // 알림음 재생
      if (soundEnabled && alert.priority !== 'low') {
        playNotificationSound(alert.priority);
      }
    });

    return unsubscribe;
  }, [soundEnabled]);

  const updateUnacknowledgedCount = () => {
    const count = alertService.getUnacknowledgedAlerts().length;
    setUnacknowledgedCount(count);
  };

  const playNotificationSound = (priority: string) => {
    try {
      const audio = new Audio();
      switch (priority) {
        case 'critical':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
          break;
        case 'high':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    } catch (error) {
      // Ignore audio errors
    }
  };

  const handleAcknowledge = (alertId: string) => {
    alertService.acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    updateUnacknowledgedCount();
  };

  const handleAcknowledgeAll = () => {
    alertService.acknowledgeAllAlerts();
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
    updateUnacknowledgedCount();
  };

  const handleRuleUpdate = (ruleId: string, updates: Partial<AlertRule>) => {
    alertService.updateRule(ruleId, updates);
    setRules(alertService.getRules());
  };

  const handleTestAlert = (ruleId: string) => {
    alertService.testAlert(ruleId);
  };

  const getAlertIcon = (alert: Alert) => {
    switch (alert.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="relative">
      {/* Alert Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full transition-all ${
          unacknowledgedCount > 0 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-slate-600 hover:bg-slate-700'
        } text-white shadow-lg`}
        title={`${unacknowledgedCount} unacknowledged alerts`}
      >
        <Bell className="w-5 h-5" />
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
          </span>
        )}
      </button>

      {/* Alert Panel */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-[420px] max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                {unacknowledgedCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.alerts[lang]}</h3>
              {unacknowledgedCount > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  {unacknowledgedCount}
                </span>
              )}
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1 rounded transition-colors ${
                  soundEnabled 
                    ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={soundEnabled ? t.disable[lang] : t.enable[lang]}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title={t.settings[lang]}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">{t.settings[lang]}</h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {rules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleRuleUpdate(rule.id, { enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-slate-600 dark:text-slate-400">{rule.name}</span>
                    </div>
                    <button
                      onClick={() => handleTestAlert(rule.id)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                    >
                      {t.testAlert[lang]}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {unacknowledgedCount > 0 && (
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={handleAcknowledgeAll}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <Check className="w-4 h-4 inline mr-2" />
                {t.acknowledgeAll[lang]}
              </button>
            </div>
          )}

          {/* Alerts List */}
          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t.noAlerts[lang]}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 border-l-4 ${getPriorityColor(alert.priority)} ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {alert.title}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              alert.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {t[alert.priority as keyof typeof t][lang]}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
                          title="Acknowledge"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAlertPanel;