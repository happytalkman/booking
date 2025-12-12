// PWA Service for managing Progressive Web App features
export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;

  private constructor() {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  // Initialize Service Worker
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        this.swRegistration = registration;
        console.log('PWA: Service Worker registered successfully');

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('PWA: Message from service worker:', event.data);
        });

      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  // Setup install prompt
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('PWA: Install prompt ready');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.deferredPrompt = null;
    });
  }

  // Check if app can be installed
  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  // Show install prompt
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error showing install prompt:', error);
      return false;
    }
  }

  // Check if app is installed
  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('PWA: Notification permission:', permission);
    return permission;
  }

  // Subscribe to push notifications
  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('PWA: Service Worker not registered');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('PWA: Notification permission not granted');
        return null;
      }

      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || 'your-vapid-public-key';
        
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });

        console.log('PWA: Push subscription created');
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('PWA: Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      if (response.ok) {
        console.log('PWA: Subscription sent to server');
      } else {
        console.error('PWA: Failed to send subscription to server');
      }
    } catch (error) {
      console.error('PWA: Error sending subscription to server:', error);
    }
  }

  // Show local notification
  public async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('PWA: Cannot show notification - permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'kmtc-notification',
      requireInteraction: false,
      ...options
    };

    if (this.swRegistration) {
      await this.swRegistration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Register background sync
  public async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      console.warn('PWA: Background sync not supported');
      return;
    }

    try {
      await this.swRegistration.sync.register(tag);
      console.log('PWA: Background sync registered:', tag);
    } catch (error) {
      console.error('PWA: Failed to register background sync:', error);
    }
  }

  // Check network status
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Listen for network changes
  public onNetworkChange(callback: (isOnline: boolean) => void): void {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }

  // Cache important data for offline use
  public async cacheData(key: string, data: any): Promise<void> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('kmtc-data-cache');
        const response = new Response(JSON.stringify(data));
        await cache.put(key, response);
        console.log('PWA: Data cached:', key);
      } else {
        // Fallback to localStorage
        localStorage.setItem(`cache_${key}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('PWA: Failed to cache data:', error);
    }
  }

  // Retrieve cached data
  public async getCachedData(key: string): Promise<any> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('kmtc-data-cache');
        const response = await cache.match(key);
        if (response) {
          return await response.json();
        }
      } else {
        // Fallback to localStorage
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      return null;
    } catch (error) {
      console.error('PWA: Failed to retrieve cached data:', error);
      return null;
    }
  }

  // Update service worker
  public async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      await this.swRegistration.update();
      console.log('PWA: Service Worker update check completed');
    } catch (error) {
      console.error('PWA: Failed to update Service Worker:', error);
    }
  }

  // Show update available notification
  private showUpdateAvailable(): void {
    // This could show a toast or modal to inform user about update
    console.log('PWA: App update available');
    
    // You can dispatch a custom event here
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  // Utility function to convert VAPID key
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

  // Get app info
  public getAppInfo(): { version: string; isInstalled: boolean; isOnline: boolean } {
    return {
      version: '1.0.0',
      isInstalled: this.isInstalled(),
      isOnline: this.isOnline()
    };
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();