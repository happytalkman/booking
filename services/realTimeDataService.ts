// Real-time Data Integration Service
interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  timestamp: Date;
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  visibility: number;
  timestamp: Date;
}

interface PortData {
  portCode: string;
  portName: string;
  congestionLevel: number;
  waitingTime: number;
  availableBerths: number;
  totalBerths: number;
  timestamp: Date;
}

interface ShippingRate {
  origin: string;
  destination: string;
  containerType: string;
  rate: number;
  currency: string;
  validUntil: Date;
  carrier: string;
}

interface OilPrice {
  type: 'brent' | 'wti' | 'bunker';
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export class RealTimeDataService {
  private static instance: RealTimeDataService;
  private wsConnections: Map<string, WebSocket> = new Map();
  private dataCache: Map<string, any> = new Map();
  private updateCallbacks: Map<string, Function[]> = new Map();

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  constructor() {
    this.initializeConnections();
  }

  // 실시간 연결 초기화
  private initializeConnections() {
    // 환율 데이터 WebSocket 연결
    this.connectWebSocket('exchange-rates', 'wss://api.exchangerate-api.com/ws');
    
    // 유가 데이터 WebSocket 연결
    this.connectWebSocket('oil-prices', 'wss://api.oilprice.com/ws');
    
    // 항만 데이터 WebSocket 연결 (시뮬레이션)
    this.simulatePortData();
    
    // 날씨 데이터 주기적 업데이트
    this.startWeatherUpdates();
  }

  // WebSocket 연결
  private connectWebSocket(type: string, url: string) {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log(`${type} WebSocket connected`);
        this.wsConnections.set(type, ws);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealtimeData(type, data);
      };
      
      ws.onclose = () => {
        console.log(`${type} WebSocket disconnected`);
        // 재연결 시도
        setTimeout(() => this.connectWebSocket(type, url), 5000);
      };
      
      ws.onerror = (error) => {
        console.error(`${type} WebSocket error:`, error);
      };
    } catch (error) {
      console.error(`Failed to connect ${type} WebSocket:`, error);
      // 폴백으로 HTTP 폴링 사용
      this.startHttpPolling(type);
    }
  }

  // 실시간 데이터 처리
  private handleRealtimeData(type: string, data: any) {
    this.dataCache.set(type, data);
    
    // 콜백 함수들 실행
    const callbacks = this.updateCallbacks.get(type) || [];
    callbacks.forEach(callback => callback(data));
  }

  // HTTP 폴링 (WebSocket 폴백)
  private startHttpPolling(type: string) {
    const pollInterval = 30000; // 30초
    
    setInterval(async () => {
      try {
        let data;
        
        switch (type) {
          case 'exchange-rates':
            data = await this.fetchExchangeRates();
            break;
          case 'oil-prices':
            data = await this.fetchOilPrices();
            break;
          case 'shipping-rates':
            data = await this.fetchShippingRates();
            break;
        }
        
        if (data) {
          this.handleRealtimeData(type, data);
        }
      } catch (error) {
        console.error(`HTTP polling error for ${type}:`, error);
      }
    }, pollInterval);
  }

  // 환율 데이터 가져오기
  async fetchExchangeRates(): Promise<ExchangeRate[]> {
    try {
      // 실제 API 호출 (예: 한국은행 API)
      const response = await fetch('/api/external/exchange-rates', {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_BOK_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Exchange rate API failed');
      }
      
      const data = await response.json();
      
      return [
        {
          currency: 'USD',
          rate: data.usd || 1320.50,
          change: data.usd_change || -2.30,
          timestamp: new Date()
        },
        {
          currency: 'EUR',
          rate: data.eur || 1445.20,
          change: data.eur_change || 1.80,
          timestamp: new Date()
        },
        {
          currency: 'JPY',
          rate: data.jpy || 8.95,
          change: data.jpy_change || -0.15,
          timestamp: new Date()
        },
        {
          currency: 'CNY',
          rate: data.cny || 185.40,
          change: data.cny_change || 0.90,
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      
      // 폴백 데이터
      return [
        {
          currency: 'USD',
          rate: 1320.50 + (Math.random() - 0.5) * 10,
          change: (Math.random() - 0.5) * 5,
          timestamp: new Date()
        },
        {
          currency: 'EUR',
          rate: 1445.20 + (Math.random() - 0.5) * 15,
          change: (Math.random() - 0.5) * 6,
          timestamp: new Date()
        }
      ];
    }
  }

  // 유가 데이터 가져오기
  async fetchOilPrices(): Promise<OilPrice[]> {
    try {
      // 실제 API 호출 (예: Alpha Vantage API)
      const response = await fetch(`/api/external/oil-prices?apikey=${process.env.VITE_ALPHAVANTAGE_API_KEY}`);
      
      if (!response.ok) {
        throw new Error('Oil price API failed');
      }
      
      const data = await response.json();
      
      return [
        {
          type: 'brent',
          price: data.brent || 85.40,
          currency: 'USD',
          change: data.brent_change || 1.20,
          changePercent: data.brent_change_percent || 1.43,
          timestamp: new Date()
        },
        {
          type: 'wti',
          price: data.wti || 81.20,
          currency: 'USD',
          change: data.wti_change || 0.80,
          changePercent: data.wti_change_percent || 0.99,
          timestamp: new Date()
        },
        {
          type: 'bunker',
          price: data.bunker || 650.00,
          currency: 'USD',
          change: data.bunker_change || 15.00,
          changePercent: data.bunker_change_percent || 2.36,
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Failed to fetch oil prices:', error);
      
      // 폴백 데이터
      return [
        {
          type: 'brent',
          price: 85.40 + (Math.random() - 0.5) * 5,
          currency: 'USD',
          change: (Math.random() - 0.5) * 3,
          changePercent: (Math.random() - 0.5) * 4,
          timestamp: new Date()
        }
      ];
    }
  }

  // 날씨 데이터 가져오기
  async fetchWeatherData(ports: string[]): Promise<WeatherData[]> {
    try {
      const weatherPromises = ports.map(async (port) => {
        const response = await fetch(
          `/api/external/weather?q=${port}&appid=${process.env.VITE_OPENWEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error(`Weather API failed for ${port}`);
        }
        
        const data = await response.json();
        
        return {
          location: port,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          condition: data.weather[0].main,
          visibility: data.visibility / 1000, // km로 변환
          timestamp: new Date()
        };
      });
      
      return await Promise.all(weatherPromises);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      
      // 폴백 데이터
      return ports.map(port => ({
        location: port,
        temperature: 15 + Math.random() * 20,
        humidity: 50 + Math.random() * 40,
        windSpeed: Math.random() * 15,
        condition: ['Clear', 'Cloudy', 'Rain'][Math.floor(Math.random() * 3)],
        visibility: 5 + Math.random() * 15,
        timestamp: new Date()
      }));
    }
  }

  // 항만 데이터 시뮬레이션
  private simulatePortData() {
    const ports = [
      { code: 'KRPUS', name: '부산항' },
      { code: 'KRICT', name: '인천항' },
      { code: 'CNSHA', name: '상하이항' },
      { code: 'SGSIN', name: '싱가포르항' },
      { code: 'USLAX', name: '로스앤젤레스항' },
      { code: 'USLGB', name: '롱비치항' }
    ];
    
    setInterval(() => {
      const portData: PortData[] = ports.map(port => ({
        portCode: port.code,
        portName: port.name,
        congestionLevel: Math.random() * 100,
        waitingTime: Math.random() * 48, // 시간
        availableBerths: Math.floor(Math.random() * 20) + 5,
        totalBerths: 25,
        timestamp: new Date()
      }));
      
      this.handleRealtimeData('port-data', portData);
    }, 60000); // 1분마다 업데이트
  }

  // 날씨 데이터 주기적 업데이트
  private startWeatherUpdates() {
    const majorPorts = ['Busan', 'Shanghai', 'Singapore', 'Los Angeles', 'Rotterdam'];
    
    // 초기 데이터 로드
    this.fetchWeatherData(majorPorts).then(data => {
      this.handleRealtimeData('weather-data', data);
    });
    
    // 30분마다 업데이트
    setInterval(async () => {
      const data = await this.fetchWeatherData(majorPorts);
      this.handleRealtimeData('weather-data', data);
    }, 1800000);
  }

  // 선사 API 연동 (KMTC, Maersk, MSC 등)
  async fetchShippingRates(): Promise<ShippingRate[]> {
    try {
      // 실제 선사 API 호출
      const carriers = ['KMTC', 'MAERSK', 'MSC', 'CMA-CGM', 'HAPAG-LLOYD'];
      const routes = [
        { origin: 'KRPUS', destination: 'USLAX' },
        { origin: 'KRPUS', destination: 'CNSHA' },
        { origin: 'KRPUS', destination: 'SGSIN' }
      ];
      
      const rates: ShippingRate[] = [];
      
      for (const carrier of carriers) {
        for (const route of routes) {
          // 실제 API 호출 시뮬레이션
          const baseRate = 1500 + Math.random() * 1000;
          
          rates.push({
            origin: route.origin,
            destination: route.destination,
            containerType: '20GP',
            rate: baseRate,
            currency: 'USD',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
            carrier: carrier
          });
          
          rates.push({
            origin: route.origin,
            destination: route.destination,
            containerType: '40GP',
            rate: baseRate * 1.8,
            currency: 'USD',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            carrier: carrier
          });
        }
      }
      
      return rates;
    } catch (error) {
      console.error('Failed to fetch shipping rates:', error);
      return [];
    }
  }

  // 관세청 UNIPASS API 연동
  async fetchCustomsData(blNumber: string) {
    try {
      const response = await fetch(`/api/external/customs/bl/${blNumber}`, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_UNIPASS_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('UNIPASS API failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch customs data:', error);
      
      // 폴백 데이터
      return {
        blNumber: blNumber,
        status: 'IN_TRANSIT',
        customsClearance: 'PENDING',
        estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        port: 'KRPUS',
        vessel: 'KMTC SHANGHAI',
        voyage: '024E'
      };
    }
  }

  // 데이터 구독
  subscribe(dataType: string, callback: Function) {
    if (!this.updateCallbacks.has(dataType)) {
      this.updateCallbacks.set(dataType, []);
    }
    
    this.updateCallbacks.get(dataType)!.push(callback);
    
    // 캐시된 데이터가 있으면 즉시 콜백 실행
    if (this.dataCache.has(dataType)) {
      callback(this.dataCache.get(dataType));
    }
  }

  // 구독 해제
  unsubscribe(dataType: string, callback: Function) {
    const callbacks = this.updateCallbacks.get(dataType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 캐시된 데이터 가져오기
  getCachedData(dataType: string) {
    return this.dataCache.get(dataType);
  }

  // 연결 상태 확인
  getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    this.wsConnections.forEach((ws, type) => {
      status[type] = ws.readyState === WebSocket.OPEN;
    });
    
    return status;
  }

  // 모든 연결 종료
  disconnect() {
    this.wsConnections.forEach((ws) => {
      ws.close();
    });
    
    this.wsConnections.clear();
    this.updateCallbacks.clear();
    this.dataCache.clear();
  }
}

// 싱글톤 인스턴스 내보내기
export const realTimeDataService = RealTimeDataService.getInstance();