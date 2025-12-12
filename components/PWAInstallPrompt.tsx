import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff, Bell } from 'lucide-react';
import { Language } from '../types';
import { pwaService } from '../services/pwaService';

interface PWAInstallPromptProps {
  lang: Language;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ lang }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  const t = {
    // Install Prompt
    installTitle: { ko: '앱 설치', en: 'Install App' },
    installSubtitle: { ko: 'KMTC 부킹 플랫폼을 홈 화면에 추가하세요', en: 'Add KMTC Booking Platform to your home screen' },
    installBenefits: {
      ko: [
        '오프라인에서도 사용 가능',
        '빠른 로딩 속도',
        '푸시 알림 수신',
        '홈 화면에서 바로 접근'
      ],
      en: [
        'Works offline',
        'Faster loading',
        'Push notifications',
        'Quick access from home screen'
      ]
    },
    install: { ko: '설치하기', en: 'Install' },
    notNow: { ko: '나중에', en: 'Not Now' },
    
    // Status Indicators
    online: { ko: '온라인', en: 'Online' },
    offline: { ko: '오프라인', en: 'Offline' },
    installed: { ko: '설치됨', en: 'Installed' },
    
    // Notifications
    enableNotifications: { ko: '알림 활성화', en: 'Enable Notifications' },
    notificationPrompt: { ko: '중요한 부킹 업데이트를 놓치지 마세요', en: 'Don\'t miss important booking updates' },
    enable: { ko: '활성화', en: 'Enable' },
    
    // Update Banner
    updateAvailable: { ko: '업데이트 사용 가능', en: 'Update Available' },
    updateMessage: { ko: '새로운 기능이 추가되었습니다. 지금 업데이트하세요.', en: 'New features are available. Update now.' },
    update: { ko: '업데이트', en: 'Update' },
    
    // Features
    features: { ko: '주요 기능', en: 'Key Features' },
    offlineAccess: { ko: '오프라인 접근', en: 'Offline Access' },
    pushNotifications: { ko: '푸시 알림', en: 'Push Notifications' },
    fastLoading: { ko: '빠른 로딩', en: 'Fast Loading' },
    nativeExperience: { ko: '네이티브 경험', en: 'Native Experience' }
  };

  useEffect(() => {
    // Check if app can be installed
    const checkInstallability = () => {
      setShowInstallPrompt(pwaService.canInstall() && !pwaService.isInstalled());
      setIsInstalled(pwaService.isInstalled());
    };

    // Check network status
    const updateNetworkStatus = () => {
      setIsOnline(pwaService.isOnline());
    };

    // Check notification permission
    const checkNotificationPermission = () => {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    checkInstallability();
    updateNetworkStatus();
    checkNotificationPermission();

    // Listen for network changes
    pwaService.onNetworkChange(updateNetworkStatus);

    // Listen for PWA update events
    const handleUpdateAvailable = () => {
      setShowUpdateBanner(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await pwaService.showInstallPrompt();
    if (installed) {
      setShowInstallPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleEnableNotifications = async () => {
    const subscription = await pwaService.subscribeToPushNotifications();
    if (subscription) {
      setNotificationPermission('granted');
    }
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Network Status Indicator */}
      <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}>
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        {isOnline ? t.online[lang] : t.offline[lang]}
      </div>

      {/* Install Status Indicator */}
      {isInstalled && (
        <div className="fixed top-16 right-4 z-50 px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          {t.installed[lang]}
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h3 className="font-bold">{t.updateAvailable[lang]}</h3>
              <p className="text-sm opacity-90">{t.updateMessage[lang]}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                {t.update[lang]}
              </button>
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="p-2 hover:bg-blue-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt Modal */}
      {showInstallPrompt && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t.installTitle[lang]}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t.installSubtitle[lang]}</p>
              </div>

              {/* Features */}
              <div className="px-6 pb-6">
                <h3 className="font-bold mb-3">{t.features[lang]}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <WifiOff className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold">{t.offlineAccess[lang]}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold">{t.pushNotifications[lang]}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Monitor className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold">{t.fastLoading[lang]}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold">{t.nativeExperience[lang]}</span>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <div className="px-6 pb-6">
                <ul className="space-y-2">
                  {t.installBenefits[lang].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  {t.notNow[lang]}
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t.install[lang]}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notification Permission Prompt */}
      {isInstalled && notificationPermission === 'default' && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">{t.enableNotifications[lang]}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{t.notificationPrompt[lang]}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleEnableNotifications}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  {t.enable[lang]}
                </button>
                <button
                  onClick={() => setNotificationPermission('denied')}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  {t.notNow[lang]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;