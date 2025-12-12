import React, { useState, useEffect } from 'react';
import { Bell, X, TrendingDown, AlertTriangle, Ship, DollarSign, Clock, CheckCircle, Settings, History } from 'lucide-react';
import { Language } from '../types';
import SmartNotificationSettings from './SmartNotificationSettings';
import NotificationHistory from './NotificationHistory';

interface Alert {
  id: string;
  type: 'rate_drop' | 'competitor' | 'risk' | 'opportunity';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionable: boolean;
}

interface RealTimeAlertsProps {
  lang: Language;
}

const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({ lang }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const t = {
    title: { ko: '실시간 알림', en: 'Real-Time Alerts' },
    noAlerts: { ko: '새로운 알림이 없습니다', en: 'No new alerts' },
    markAllRead: { ko: '모두 읽음', en: 'Mark All Read' },
    clearAll: { ko: '모두 지우기', en: 'Clear All' },
    settings: { ko: '설정', en: 'Settings' },
    history: { ko: '히스토리', en: 'History' },
    viewDetails: { ko: '상세 보기', en: 'View Details' },
    takeAction: { ko: '조치하기', en: 'Take Action' },
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    now: { ko: '방금', en: 'Just now' },
    minutesAgo: { ko: '분 전', en: 'min ago' },
    hoursAgo: { ko: '시간 전', en: 'h ago' },
    
    // Action Modal
    actionTitle: { ko: '조치 선택', en: 'Select Action' },
    actionSubtitle: { ko: '이 알림에 대해 어떤 조치를 취하시겠습니까?', en: 'What action would you like to take for this alert?' },
    
    // Rate Drop Actions
    bookNow: { ko: '지금 부킹하기', en: 'Book Now' },
    bookNowDesc: { ko: '현재 운임으로 즉시 부킹을 진행합니다', en: 'Proceed with booking at current rate' },
    setAlert: { ko: '추가 하락 알림 설정', en: 'Set Further Drop Alert' },
    setAlertDesc: { ko: '운임이 더 하락하면 알림을 받습니다', en: 'Get notified if rate drops further' },
    
    // Competitor Actions
    adjustPrice: { ko: '가격 조정 검토', en: 'Review Price Adjustment' },
    adjustPriceDesc: { ko: '경쟁력 있는 가격으로 조정을 검토합니다', en: 'Review competitive price adjustment' },
    marketAnalysis: { ko: '시장 분석 요청', en: 'Request Market Analysis' },
    marketAnalysisDesc: { ko: '상세한 시장 분석 리포트를 요청합니다', en: 'Request detailed market analysis report' },
    
    // Risk Actions
    investigate: { ko: '원인 조사', en: 'Investigate Cause' },
    investigateDesc: { ko: '리스크 원인을 상세히 조사합니다', en: 'Investigate risk cause in detail' },
    mitigate: { ko: '완화 조치', en: 'Mitigation Action' },
    mitigateDesc: { ko: '리스크 완화를 위한 조치를 시작합니다', en: 'Start mitigation actions' },
    
    // Opportunity Actions
    bookCapacity: { ko: '선복 확보', en: 'Secure Capacity' },
    bookCapacityDesc: { ko: '여유 선복을 즉시 확보합니다', en: 'Secure available capacity immediately' },
    notifyCustomers: { ko: '고객사 통보', en: 'Notify Customers' },
    notifyCustomersDesc: { ko: '주요 고객사에 기회를 알립니다', en: 'Notify key customers of opportunity' },
    
    cancel: { ko: '취소', en: 'Cancel' },
    confirm: { ko: '확인', en: 'Confirm' },
    
    // Success Messages
    actionSuccess: { ko: '조치가 완료되었습니다', en: 'Action Completed' },
    actionSuccessDesc: { ko: '선택하신 조치가 성공적으로 처리되었습니다.', en: 'Your selected action has been processed successfully.' },
    processing: { ko: '처리 중...', en: 'Processing...' }
  };

  useEffect(() => {
    // Simulate real-time alerts
    const initialAlerts: Alert[] = [
      {
        id: '1',
        type: 'rate_drop',
        title: lang === 'ko' ? '운임 하락 알림' : 'Rate Drop Alert',
        message: lang === 'ko' 
          ? '한국-LA 서안 항로 운임이 설정한 임계값($2,800) 이하로 하락했습니다. 현재: $2,750'
          : 'Korea-LA West Coast rate dropped below your threshold ($2,800). Current: $2,750',
        timestamp: new Date(Date.now() - 5 * 60000),
        priority: 'high',
        read: false,
        actionable: true
      },
      {
        id: '2',
        type: 'competitor',
        title: lang === 'ko' ? '경쟁사 가격 변경' : 'Competitor Price Change',
        message: lang === 'ko'
          ? 'Maersk가 북미 서안 항로 운임을 $150 인상했습니다. 시장 점유율 확대 기회입니다.'
          : 'Maersk increased North America West Coast rate by $150. Market share opportunity.',
        timestamp: new Date(Date.now() - 45 * 60000),
        priority: 'medium',
        read: false,
        actionable: true
      },
      {
        id: '3',
        type: 'risk',
        title: lang === 'ko' ? '리스크 레벨 변화' : 'Risk Level Change',
        message: lang === 'ko'
          ? '한중 항로의 취소율이 급증했습니다 (8.5% → 12.3%). 원인 분석이 필요합니다.'
          : 'Korea-China route cancellation rate spiked (8.5% → 12.3%). Analysis needed.',
        timestamp: new Date(Date.now() - 2 * 3600000),
        priority: 'high',
        read: false,
        actionable: true
      },
      {
        id: '4',
        type: 'opportunity',
        title: lang === 'ko' ? '부킹 기회' : 'Booking Opportunity',
        message: lang === 'ko'
          ? '유럽 항로 선복 여유 발생. 향후 2주간 추가 부킹 가능합니다.'
          : 'Europe route capacity available. Additional bookings possible for next 2 weeks.',
        timestamp: new Date(Date.now() - 4 * 3600000),
        priority: 'medium',
        read: true,
        actionable: false
      }
    ];

    setAlerts(initialAlerts);
    setUnreadCount(initialAlerts.filter(a => !a.read).length);

    // Simulate new alert every 30 seconds
    const interval = setInterval(() => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: ['rate_drop', 'competitor', 'risk', 'opportunity'][Math.floor(Math.random() * 4)] as any,
        title: lang === 'ko' ? '새로운 알림' : 'New Alert',
        message: lang === 'ko' 
          ? '시장 상황이 변경되었습니다. 확인이 필요합니다.'
          : 'Market conditions changed. Review needed.',
        timestamp: new Date(),
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
        read: false,
        actionable: Math.random() > 0.5
      };

      setAlerts(prev => [newAlert, ...prev]);
      setUnreadCount(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [lang]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rate_drop': return DollarSign;
      case 'competitor': return Ship;
      case 'risk': return AlertTriangle;
      case 'opportunity': return TrendingDown;
      default: return Bell;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return t.now[lang];
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${t.minutesAgo[lang]}`;
    const hours = Math.floor(minutes / 60);
    return `${hours}${t.hoursAgo[lang]}`;
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setAlerts([]);
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleTakeAction = (alert: Alert, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAlert(alert);
    setShowActionModal(true);
    markAsRead(alert.id);
  };

  const handleActionConfirm = (actionType: string) => {
    // Simulate action processing
    setActionCompleted(true);
    setTimeout(() => {
      setShowActionModal(false);
      setActionCompleted(false);
      setSelectedAlert(null);
    }, 2000);
  };

  const getActionOptions = (type: string) => {
    switch (type) {
      case 'rate_drop':
        return [
          { id: 'book', title: t.bookNow[lang], desc: t.bookNowDesc[lang], icon: '📦' },
          { id: 'alert', title: t.setAlert[lang], desc: t.setAlertDesc[lang], icon: '🔔' }
        ];
      case 'competitor':
        return [
          { id: 'adjust', title: t.adjustPrice[lang], desc: t.adjustPriceDesc[lang], icon: '💰' },
          { id: 'analysis', title: t.marketAnalysis[lang], desc: t.marketAnalysisDesc[lang], icon: '📊' }
        ];
      case 'risk':
        return [
          { id: 'investigate', title: t.investigate[lang], desc: t.investigateDesc[lang], icon: '🔍' },
          { id: 'mitigate', title: t.mitigate[lang], desc: t.mitigateDesc[lang], icon: '🛡️' }
        ];
      case 'opportunity':
        return [
          { id: 'book', title: t.bookCapacity[lang], desc: t.bookCapacityDesc[lang], icon: '🚢' },
          { id: 'notify', title: t.notifyCustomers[lang], desc: t.notifyCustomersDesc[lang], icon: '📧' }
        ];
      default:
        return [];
    }
  };

  return (
    <>
      {/* Alert Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
        title={t.title[lang]}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Alerts Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="fixed top-20 right-6 w-96 max-h-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg">{t.title[lang]}</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition flex items-center justify-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  {t.settings[lang]}
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition flex items-center justify-center gap-1"
                >
                  <History className="w-3 h-3" />
                  {t.history[lang]}
                </button>
              </div>
              {alerts.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={markAllRead}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                  >
                    {t.markAllRead[lang]}
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex-1 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  >
                    {t.clearAll[lang]}
                  </button>
                </div>
              )}
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">{t.noAlerts[lang]}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {alerts.map(alert => {
                    const Icon = getAlertIcon(alert.type);
                    const colorClass = getAlertColor(alert.priority);

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${
                          !alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 ${colorClass} rounded-lg h-fit`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{alert.title}</h4>
                              {!alert.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {getTimeAgo(alert.timestamp)}
                              </span>
                              {alert.actionable && (
                                <button 
                                  onClick={(e) => handleTakeAction(alert, e)}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {t.takeAction[lang]}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Action Modal */}
      {showActionModal && selectedAlert && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => !actionCompleted && setShowActionModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in">
              {actionCompleted ? (
                // Success State
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{t.actionSuccess[lang]}</h2>
                  <p className="text-slate-600 dark:text-slate-400">{t.actionSuccessDesc[lang]}</p>
                </div>
              ) : (
                // Action Selection
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-xl font-bold mb-1">{t.actionTitle[lang]}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t.actionSubtitle[lang]}</p>
                      </div>
                      <button
                        onClick={() => setShowActionModal(false)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Alert Info */}
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {React.createElement(getAlertIcon(selectedAlert.type), { 
                          className: 'w-4 h-4 text-slate-600 dark:text-slate-400' 
                        })}
                        <h3 className="font-semibold text-sm">{selectedAlert.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{selectedAlert.message}</p>
                    </div>
                  </div>

                  {/* Action Options */}
                  <div className="p-6 space-y-3">
                    {getActionOptions(selectedAlert.type).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleActionConfirm(option.id)}
                        className="w-full p-4 text-left bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {option.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {option.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setShowActionModal(false)}
                      className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                    >
                      {t.cancel[lang]}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Smart Notification Settings Modal */}
      <SmartNotificationSettings 
        lang={lang}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Notification History Modal */}
      <NotificationHistory 
        lang={lang}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
};

export default RealTimeAlerts;
