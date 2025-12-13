import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, MapPin, Fingerprint, Wifi, WifiOff, 
  Battery, Signal, Download, Smartphone, 
  Scan, Navigation, Shield, Zap, Bell
} from 'lucide-react';
import { enhancedPWAService } from '../services/enhancedPWAService';

interface MobileEnhancedFeaturesProps {
  lang: 'ko' | 'en';
}

const MobileEnhancedFeatures: React.FC<MobileEnhancedFeaturesProps> = ({ lang }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const text = {
    ko: {
      title: '모바일 고급 기능',
      subtitle: '오프라인 모드, 생체 인증, GPS, 카메라 스캔 등',
      offlineMode: '오프라인 모드',
      online: '온라인',
      offline: '오프라인',
      location: '현재 위치',
      getLocation: '위치 가져오기',
      battery: '배터리 정보',
      network: '네트워크 정보',
      biometric: '생체 인증',
      authenticate: '인증하기',
      camera: '카메라 스캔',
      startScan: '스캔 시작',
      stopScan: '스캔 중지',
      capture: '캡처',
      installApp: '앱 설치',
      pushNotifications: '푸시 알림',
      enablePush: '알림 활성화',
      disablePush: '알림 비활성화',
      deviceInfo: '디바이스 정보',
      connectionType: '연결 타입',
      effectiveType: '유효 타입',
      downlink: '다운링크',
      rtt: 'RTT',
      level: '레벨',
      charging: '충전 중',
      chargingTime: '충전 시간',
      dischargingTime: '방전 시간',
      latitude: '위도',
      longitude: '경도',
      accuracy: '정확도',
      notSupported: '지원되지 않음',
      meters: '미터',
      minutes: '분',
      mbps: 'Mbps',
      ms: 'ms'
    },
    en: {
      title: 'Mobile Enhanced Features',
      subtitle: 'Offline mode, Biometric auth, GPS, Camera scan, etc.',
      offlineMode: 'Offline Mode',
      online: 'Online',
      offline: 'Offline',
      location: 'Current Location',
      getLocation: 'Get Location',
      battery: 'Battery Info',
      network: 'Network Info',
      biometric: 'Biometric Auth',
      authenticate: 'Authenticate',
      camera: 'Camera Scan',
      startScan: 'Start Scan',
      stopScan: 'Stop Scan',
      capture: 'Capture',
      installApp: 'Install App',
      pushNotifications: 'Push Notifications',
      enablePush: 'Enable Notifications',
      disablePush: 'Disable Notifications',
      deviceInfo: 'Device Info',
      connectionType: 'Connection Type',
      effectiveType: 'Effective Type',
      downlink: 'Downlink',
      rtt: 'RTT',
      level: 'Level',
      charging: 'Charging',
      chargingTime: 'Charging Time',
      dischargingTime: 'Discharging Time',
      latitude: 'Latitude',
      longitude: 'Longitude',
      accuracy: 'Accuracy',
      notSupported: 'Not Supported',
      meters: 'meters',
      minutes: 'minutes',
      mbps: 'Mbps',
      ms: 'ms'
    }
  };

  const t = text[lang];

  useEffect(() => {
    // 온라인/오프라인 상태 모니터링
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 초기 상태 확인
    checkInitialStates();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // 카메라 스트림 정리
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkInitialStates = async () => {
    // 생체 인증 지원 확인
    setBiometricSupported(enhancedPWAService.isBiometricSupported());
    
    // PWA 설치 가능 확인
    setCanInstallPWA(enhancedPWAService.canInstall());
    
    // 배터리 정보 가져오기
    const battery = await enhancedPWAService.getBatteryInfo();
    setBatteryInfo(battery);
    
    // 네트워크 정보 가져오기
    const network = enhancedPWAService.getNetworkInfo();
    setNetworkInfo(network);
  };

  // 위치 정보 가져오기
  const handleGetLocation = async () => {
    const position = await enhancedPWAService.getCurrentLocation();
    setLocation(position);
    
    if (position) {
      enhancedPWAService.vibrate([100, 50, 100]); // 성공 진동
    }
  };

  // 생체 인증
  const handleBiometricAuth = async () => {
    const success = await enhancedPWAService.authenticateWithBiometrics();
    
    if (success) {
      enhancedPWAService.vibrate(200); // 성공 진동
      alert(lang === 'ko' ? '인증 성공!' : 'Authentication successful!');
    } else {
      enhancedPWAService.vibrate([100, 100, 100]); // 실패 진동
      alert(lang === 'ko' ? '인증 실패' : 'Authentication failed');
    }
  };

  // 카메라 스캔 시작
  const startCameraScanning = async () => {
    const stream = await enhancedPWAService.accessCamera();
    
    if (stream && videoRef.current) {
      setCameraStream(stream);
      videoRef.current.srcObject = stream;
      setIsScanning(true);
    }
  };

  // 카메라 스캔 중지
  const stopCameraScanning = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsScanning(false);
    }
  };

  // 이미지 캡처
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        
        // 캡처된 이미지를 Blob으로 변환
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scan-${Date.now()}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/jpeg', 0.9);
        
        enhancedPWAService.vibrate(100); // 캡처 진동
      }
    }
  };

  // PWA 설치
  const handleInstallPWA = async () => {
    const installed = await enhancedPWAService.showInstallPrompt();
    
    if (installed) {
      setCanInstallPWA(false);
      alert(lang === 'ko' ? '앱이 설치되었습니다!' : 'App installed successfully!');
    }
  };

  // 푸시 알림 설정
  const handlePushNotifications = async () => {
    if (!pushEnabled) {
      const enabled = await enhancedPWAService.setupPushNotifications();
      setPushEnabled(enabled);
      
      if (enabled) {
        alert(lang === 'ko' ? '푸시 알림이 활성화되었습니다!' : 'Push notifications enabled!');
      }
    } else {
      setPushEnabled(false);
      alert(lang === 'ko' ? '푸시 알림이 비활성화되었습니다.' : 'Push notifications disabled.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
          <Smartphone className="w-8 h-8 text-blue-600" />
          {t.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{t.subtitle}</p>
      </div>

      {/* 상태 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 온라인 상태 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-500" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-500" />
            )}
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {t.offlineMode}
            </h3>
          </div>
          <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? t.online : t.offline}
          </p>
        </div>

        {/* 배터리 정보 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Battery className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {t.battery}
            </h3>
          </div>
          {batteryInfo ? (
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <div>{t.level}: {Math.round(batteryInfo.level * 100)}%</div>
              <div>{batteryInfo.charging ? t.charging : '방전 중'}</div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t.notSupported}</p>
          )}
        </div>

        {/* 네트워크 정보 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Signal className="w-6 h-6 text-purple-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {t.network}
            </h3>
          </div>
          {networkInfo ? (
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <div>{t.effectiveType}: {networkInfo.effectiveType}</div>
              <div>{t.downlink}: {networkInfo.downlink} {t.mbps}</div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t.notSupported}</p>
          )}
        </div>

        {/* 위치 정보 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-red-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {t.location}
            </h3>
          </div>
          {location ? (
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <div>{t.latitude}: {location.coords.latitude.toFixed(6)}</div>
              <div>{t.longitude}: {location.coords.longitude.toFixed(6)}</div>
              <div>{t.accuracy}: {Math.round(location.coords.accuracy)} {t.meters}</div>
            </div>
          ) : (
            <button
              onClick={handleGetLocation}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {t.getLocation}
            </button>
          )}
        </div>
      </div>

      {/* 기능 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 생체 인증 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t.biometric}
            </h3>
          </div>
          
          {biometricSupported ? (
            <button
              onClick={handleBiometricAuth}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Shield className="w-5 h-5" />
              {t.authenticate}
            </button>
          ) : (
            <p className="text-slate-500 text-center">{t.notSupported}</p>
          )}
        </div>

        {/* PWA 설치 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t.installApp}
            </h3>
          </div>
          
          {canInstallPWA ? (
            <button
              onClick={handleInstallPWA}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Smartphone className="w-5 h-5" />
              {t.installApp}
            </button>
          ) : (
            <p className="text-slate-500 text-center">이미 설치됨</p>
          )}
        </div>

        {/* 푸시 알림 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t.pushNotifications}
            </h3>
          </div>
          
          <button
            onClick={handlePushNotifications}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              pushEnabled 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Zap className="w-5 h-5" />
            {pushEnabled ? t.disablePush : t.enablePush}
          </button>
        </div>
      </div>

      {/* 카메라 스캔 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-8 h-8 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t.camera}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            {!isScanning ? (
              <button
                onClick={startCameraScanning}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Scan className="w-5 h-5" />
                {t.startScan}
              </button>
            ) : (
              <>
                <button
                  onClick={stopCameraScanning}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  {t.stopScan}
                </button>
                <button
                  onClick={captureImage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  {t.capture}
                </button>
              </>
            )}
          </div>
          
          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg border border-slate-300 dark:border-slate-600"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileEnhancedFeatures;