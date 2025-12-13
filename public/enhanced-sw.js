// Enhanced Service Worker for KMTC Platform
const CACHE_NAME = 'kmtc-v2.0.0';
const OFFLINE_CACHE = 'kmtc-offline-v1';
const DYNAMIC_CACHE = 'kmtc-dynamic-v1';

// 캐시할 정적 자원들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// 캐시할 API 엔드포인트들
const API_CACHE_PATTERNS = [
  /\/api\/bookings\/recent/,
  /\/api\/routes\/popular/,
  /\/api\/user\/profile/,
  /\/api\/notifications/
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Enhanced Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // 정적 자원 캐싱
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // 오프라인 페이지 캐싱
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      // 즉시 활성화
      return self.skipWaiting();
    })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Enhanced Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // 이전 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== OFFLINE_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // 모든 클라이언트 제어
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 자원 처리
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // 기본 네트워크 우선 전략
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// API 요청 처리 (캐시 우선 + 네트워크 업데이트)
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // 네트워크에서 최신 데이터 가져오기
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // GET 요청만 캐싱
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // 네트워크 실패 시 캐시에서 반환
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // 오프라인 표시 헤더 추가
      const response = cachedResponse.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    
    // 캐시도 없으면 오프라인 응답
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 정적 자원 처리 (캐시 우선)
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // HTML 요청이고 캐시에 없으면 오프라인 페이지 반환
    if (request.destination === 'document') {
      const offlineCache = await caches.open(OFFLINE_CACHE);
      return offlineCache.match('/offline.html');
    }
    
    throw error;
  }
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'background-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// 백그라운드 동기화 실행
async function doBackgroundSync() {
  try {
    // 오프라인 큐에서 대기 중인 요청들 처리
    const offlineQueue = await getOfflineQueue();
    
    for (const request of offlineQueue) {
      try {
        await fetch(request.url, request.options);
        console.log('Offline request synced:', request.url);
      } catch (error) {
        console.error('Failed to sync offline request:', error);
      }
    }
    
    // 큐 비우기
    await clearOfflineQueue();
    
    // 클라이언트에 동기화 완료 알림
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        data: { synced: offlineQueue.length }
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// 오프라인 데이터 동기화
async function syncOfflineData() {
  try {
    // 중요한 데이터 미리 가져오기
    const essentialEndpoints = [
      '/api/bookings/recent',
      '/api/routes/popular',
      '/api/notifications/unread',
      '/api/user/profile'
    ];
    
    const cache = await caches.open(DYNAMIC_CACHE);
    
    for (const endpoint of essentialEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.warn(`Failed to sync ${endpoint}:`, error);
      }
    }
    
    console.log('Background data sync completed');
  } catch (error) {
    console.error('Background data sync failed:', error);
  }
}

// 오프라인 큐 가져오기
async function getOfflineQueue() {
  // IndexedDB나 다른 저장소에서 큐 가져오기
  // 여기서는 간단히 빈 배열 반환
  return [];
}

// 오프라인 큐 비우기
async function clearOfflineQueue() {
  // IndexedDB나 다른 저장소의 큐 비우기
  console.log('Offline queue cleared');
}

// 푸시 알림 수신
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'KMTC 알림',
    body: '새로운 알림이 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'kmtc-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: '보기',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: '닫기',
        icon: '/icons/close-icon.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }
  
  // 기본 동작 또는 'view' 액션
  const urlToOpen = notificationData.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 새 창 열기
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // 분석을 위한 이벤트 추적
  event.waitUntil(
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(() => {
      // 실패해도 무시 (분석 데이터)
    })
  );
});

// 메시지 수신 (클라이언트에서 온 메시지)
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
      
    case 'FORCE_UPDATE':
      event.waitUntil(forceUpdate());
      break;
  }
});

// 모든 캐시 지우기
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('All caches cleared');
}

// 강제 업데이트
async function forceUpdate() {
  await clearAllCaches();
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(STATIC_ASSETS);
  console.log('Force update completed');
}

// 주기적 백그라운드 동기화 (실험적 기능)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'background-data-refresh') {
      event.waitUntil(syncOfflineData());
    }
  });
}

console.log('Enhanced Service Worker loaded successfully');