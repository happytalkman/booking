// Enhanced PWA Service with Advanced Mobile Features
export class EnhancedPWAService {
  private static instance: EnhancedPWAService;
  private deferredPrompt: any = null;
  private isOnline = navigator.onLine;
  private offlineQueue: Array<{ url: string; options: RequestInit }> = [];
  private biometricSupported = false;

  static getInstance(): EnhancedPWAService {
    if (!EnhancedPWAService.instance) {
      EnhancedPWAService.instance = new EnhancedPWAService();
    }
    return EnhancedPWAService.instance;
  }

  constructor() {
    this.initializePWA();
    this.setupOfflineHandling();
    this.checkBiometricSupport();
    this.setupBackgroundSync();
  }

  // PWA 초기화
  private async initializePWA() {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/enhanced-sw.js');
        console.log('Enhanced Service Worker registered:', registration);
        
        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // PWA 설치 프롬프트 처리
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    // 온라인/오프라인 상태 모니터링
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // 오프라인 처리 설정
  private setupOfflineHandling() {
    // 중요한 데이터 미리 캐싱
    this.precacheEssentialData();
    
    // 네트워크 요청 인터셉트
    this.interceptNetworkRequests();
  }

  // 필수 데이터 미리 캐싱
  private async precacheEssentialData() {
    const essentialUrls = [
      '/api/bookings/recent',
      '/api/routes/popular',
      '/api/user/profile',
      '/api/notifications/unread'
    ];

    if ('caches' in window) {
      const cache = await caches.open('kmtc-essential-v1');
      
      for (const url of essentialUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (error) {
          console.warn(`Failed to precache ${url}:`, error);
        }
      }
    }
  }

  // 네트워크 요청 인터셉트
  private interceptNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        
        // 성공한 응답을 캐시에 저장
        if (response.ok && init?.method !== 'POST') {
          this.cacheResponse(input.toString(), response.clone());
        }
        
        return response;
      } catch (error) {
        // 오프라인 상태에서 캐시된 데이터 반환
        if (!this.isOnline) {
          const cachedResponse = await this.getCachedResponse(input.toString());
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // POST 요청은 오프라인 큐에 추가
          if (init?.method === 'POST') {
            this.addToOfflineQueue(input.toString(), init);
          }
        }
        
        throw error;
      }
    };
  }

  // 응답 캐싱
  private async cacheResponse(url: string, response: Response) {
    if ('caches' in window) {
      const cache = await caches.open('kmtc-dynamic-v1');
      await cache.put(url, response);
    }
  }

  // 캐시된 응답 가져오기
  private async getCachedResponse(url: string): Promise<Response | null> {
    if ('caches' in window) {
      const cache = await caches.open('kmtc-dynamic-v1');
      return await cache.match(url) || null;
    }
    return null;
  }

  // 오프라인 큐에 추가
  private addToOfflineQueue(url: string, options: RequestInit) {
    this.offlineQueue.push({ url, options });
    localStorage.setItem('kmtc-offline-queue', JSON.stringify(this.offlineQueue));
  }

  // 오프라인 큐 처리
  private async processOfflineQueue() {
    const savedQueue = localStorage.getItem('kmtc-offline-queue');
    if (savedQueue) {
      this.offlineQueue = JSON.parse(savedQueue);
    }

    for (const request of this.offlineQueue) {
      try {
        await fetch(request.url, request.options);
      } catch (error) {
        console.error('Failed to process offline request:', error);
      }
    }

    this.offlineQueue = [];
    localStorage.removeItem('kmtc-offline-queue');
  }

  // 생체 인증 지원 확인
  private async checkBiometricSupport() {
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      try {
        // WebAuthn 지원 확인
        const available = await (navigator.credentials as any).create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: 'KMTC Platform' },
            user: {
              id: new Uint8Array(16),
              name: 'test@kmtc.com',
              displayName: 'Test User'
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required'
            },
            timeout: 60000,
            attestation: 'direct'
          }
        });
        
        this.biometricSupported = !!available;
      } catch (error) {
        this.biometricSupported = false;
      }
    }
  }

  // 백그라운드 동기화 설정
  private setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // 백그라운드 동기화 등록
        return (registration as any).sync.register('background-sync');
      });
    }
  }

  // 푸시 알림 설정
  async setupPushNotifications(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }

    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqI' // VAPID 공개 키
        )
      });

      // 서버에 구독 정보 전송
      await this.sendSubscriptionToServer(subscription);
      return true;
    } catch (error) {
      console.error('Push notification setup failed:', error);
      return false;
    }
  }

  // VAPID 키 변환
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 구독 정보를 서버에 전송
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    });
  }

  // 카메라 액세스 (문서 스캔용)
  async accessCamera(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      return stream;
    } catch (error) {
      console.error('Camera access failed:', error);
      return null;
    }
  }

  // GPS 위치 정보 가져오기
  async getCurrentLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    });
  }

  // 생체 인증 실행
  async authenticateWithBiometrics(): Promise<boolean> {
    if (!this.biometricSupported) {
      return false;
    }

    try {
      const credential = await (navigator.credentials as any).get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'required'
        }
      });

      return !!credential;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  // 디바이스 진동
  vibrate(pattern: number | number[] = 200) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // 배터리 정보 가져오기
  async getBatteryInfo(): Promise<any> {
    if ('getBattery' in navigator) {
      try {
        return await (navigator as any).getBattery();
      } catch (error) {
        console.error('Battery API not supported:', error);
        return null;
      }
    }
    return null;
  }

  // 네트워크 정보 가져오기
  getNetworkInfo(): any {
    if ('connection' in navigator) {
      return (navigator as any).connection;
    }
    return null;
  }

  // PWA 설치 프롬프트 표시
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;

    return outcome === 'accepted';
  }

  // 업데이트 알림 표시
  private showUpdateNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('KMTC 플랫폼 업데이트', {
        body: '새로운 버전이 사용 가능합니다. 페이지를 새로고침하세요.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        actions: [
          {
            action: 'refresh',
            title: '새로고침'
          },
          {
            action: 'dismiss',
            title: '나중에'
          }
        ]
      });
    }
  }

  // 오프라인 상태 확인
  isOffline(): boolean {
    return !this.isOnline;
  }

  // 생체 인증 지원 여부
  isBiometricSupported(): boolean {
    return this.biometricSupported;
  }

  // 앱 설치 가능 여부
  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  // 로컬 스토리지에 데이터 저장 (오프라인용)
  saveOfflineData(key: string, data: any) {
    try {
      localStorage.setItem(`kmtc-offline-${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // 로컬 스토리지에서 데이터 가져오기
  getOfflineData(key: string, maxAge: number = 3600000): any { // 1시간 기본값
    try {
      const stored = localStorage.getItem(`kmtc-offline-${key}`);
      if (!stored) return null;

      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`kmtc-offline-${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  // 백그라운드에서 데이터 동기화
  async syncInBackground() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        try {
          await (registration as any).sync.register('background-data-sync');
        } catch (error) {
          console.error('Background sync registration failed:', error);
        }
      }
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const enhancedPWAService = EnhancedPWAService.getInstance();