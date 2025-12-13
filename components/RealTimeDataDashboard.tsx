import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Wifi, WifiOff,
  DollarSign, Fuel, Anchor, Cloud, Thermometer,
  Wind, Eye, Clock, AlertTriangle, CheckCircle2 as CheckCircle,
  RefreshCw, Globe, Ship, MapPin
} from 'lucide-react';
import { realTimeDataService } from '../services/realTimeDataService';

interface RealTimeDataDashboardProps {
  lang: 'ko' | 'en';
}

const RealTimeDataDashboard: React.FC<RealTimeDataDashboardProps> = ({ lang }) => {
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [oilPrices, setOilPrices] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [portData, setPortData] = useState<any[]>([]);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const text = {
    ko: {
      title: '실시간 데이터 대시보드',
      subtitle: '환율, 유가, 날씨, 항만 정보를 실시간으로 모니터링',
      exchangeRates: '환율 정보',
      oilPrices: '유가 정보',
      weatherData: '날씨 정보',
      portData: '항만 정보',
      shippingRates: '운임 정보',
      connectionStatus: '연결 상태',
      lastUpdate: '마지막 업데이트',
      refresh: '새로고침',
      connected: '연결됨',
      disconnected: '연결 끊김',
      currency: '통화',
      rate: '환율',
      change: '변동',
      type: '유형',
      price: '가격',
      location: '위치',
      temperature: '온도',
      humidity: '습도',
      windSpeed: '풍속',
      condition: '날씨',
      visibility: '가시거리',
      port: '항만',
      congestion: '혼잡도',
      waitingTime: '대기시간',
      availableBerths: '사용가능 선석',
      origin: '출발지',
      destination: '도착지',
      container: '컨테이너',
      carrier: '선사',
      validUntil: '유효기간',
      hours: '시간',
      km: 'km',
      ms: 'm/s',
      celsius: '°C',
      percent: '%',
      usd: 'USD',
      krw: 'KRW'
    },
    en: {
      title: 'Real-Time Data Dashboard',
      subtitle: 'Monitor exchange rates, oil prices, weather, and port information in real-time',
      exchangeRates: 'Exchange Rates',
      oilPrices: 'Oil Prices',
      weatherData: 'Weather Data',
      portData: 'Port Information',
      shippingRates: 'Shipping Rates',
      connectionStatus: 'Connection Status',
      lastUpdate: 'Last Update',
      refresh: 'Refresh',
      connected: 'Connected',
      disconnected: 'Disconnected',
      currency: 'Currency',
      rate: 'Rate',
      change: 'Change',
      type: 'Type',
      price: 'Price',
      location: 'Location',
      temperature: 'Temperature',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      condition: 'Condition',
      visibility: 'Visibility',
      port: 'Port',
      congestion: 'Congestion',
      waitingTime: 'Waiting Time',
      availableBerths: 'Available Berths',
      origin: 'Origin',
      destination: 'Destination',
      container: 'Container',
      carrier: 'Carrier',
      validUntil: 'Valid Until',
      hours: 'hours',
      km: 'km',
      ms: 'm/s',
      celsius: '°C',
      percent: '%',
      usd: 'USD',
      krw: 'KRW'
    }
  };

  const t = text[lang];

  useEffect(() => {
    // 데이터 구독
    realTimeDataService.subscribe('exchange-rates', (data: any) => {
      setExchangeRates(data);
      setLastUpdate(new Date());
    });

    realTimeDataService.subscribe('oil-prices', (data: any) => {
      setOilPrices(data);
      setLastUpdate(new Date());
    });

    realTimeDataService.subscribe('weather-data', (data: any) => {
      setWeatherData(data);
      setLastUpdate(new Date());
    });

    realTimeDataService.subscribe('port-data', (data: any) => {
      setPortData(data);
      setLastUpdate(new Date());
    });

    realTimeDataService.subscribe('shipping-rates', (data: any) => {
      setShippingRates(data);
      setLastUpdate(new Date());
    });

    // 연결 상태 모니터링
    const statusInterval = setInterval(() => {
      setConnectionStatus(realTimeDataService.getConnectionStatus());
    }, 5000);

    // 초기 데이터 로드
    loadInitialData();

    return () => {
      clearInterval(statusInterval);
      // 구독 해제는 실제로는 각 콜백을 저장해서 해제해야 함
    };
  }, []);

  const loadInitialData = async () => {
    try {
      // 캐시된 데이터 먼저 로드
      const cachedExchangeRates = realTimeDataService.getCachedData('exchange-rates');
      const cachedOilPrices = realTimeDataService.getCachedData('oil-prices');
      const cachedWeatherData = realTimeDataService.getCachedData('weather-data');
      const cachedPortData = realTimeDataService.getCachedData('port-data');

      if (cachedExchangeRates) setExchangeRates(cachedExchangeRates);
      if (cachedOilPrices) setOilPrices(cachedOilPrices);
      if (cachedWeatherData) setWeatherData(cachedWeatherData);
      if (cachedPortData) setPortData(cachedPortData);

      // 새로운 데이터 가져오기
      const [rates, prices, shipping] = await Promise.all([
        realTimeDataService.fetchExchangeRates(),
        realTimeDataService.fetchOilPrices(),
        realTimeDataService.fetchShippingRates()
      ]);

      setExchangeRates(rates);
      setOilPrices(prices);
      setShippingRates(shipping);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCongestionColor = (level: number) => {
    if (level > 80) return 'text-red-600 bg-red-100';
    if (level > 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return '☀️';
      case 'cloudy': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      default: return '🌤️';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              {t.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t.lastUpdate}: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* 연결 상태 */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(connectionStatus).map(([service, connected]) => (
            <div key={service} className="flex items-center gap-2">
              {connected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {service}: {connected ? t.connected : t.disconnected}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 환율 정보 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-green-600" />
          {t.exchangeRates}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exchangeRates.map((rate, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {rate.currency}/{t.krw}
                </span>
                {getTrendIcon(rate.change)}
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {rate.rate.toLocaleString()}
              </div>
              <div className={`text-sm ${getChangeColor(rate.change)}`}>
                {rate.change > 0 ? '+' : ''}{rate.change.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유가 정보 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Fuel className="w-6 h-6 text-orange-600" />
          {t.oilPrices}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {oilPrices.map((oil, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800 dark:text-slate-100 uppercase">
                  {oil.type}
                </span>
                {getTrendIcon(oil.change)}
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${oil.price.toFixed(2)}
              </div>
              <div className={`text-sm ${getChangeColor(oil.change)}`}>
                {oil.change > 0 ? '+' : ''}{oil.change.toFixed(2)} ({oil.changePercent.toFixed(2)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 날씨 정보 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Cloud className="w-6 h-6 text-blue-600" />
          {t.weatherData}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherData.map((weather, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {weather.location}
                </span>
                <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>{weather.temperature.toFixed(1)}{t.celsius}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span>{weather.windSpeed.toFixed(1)} {t.ms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>{weather.visibility.toFixed(1)} {t.km}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  습도: {weather.humidity}{t.percent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 항만 정보 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Anchor className="w-6 h-6 text-purple-600" />
          {t.portData}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.port}
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.congestion}
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.waitingTime}
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.availableBerths}
                </th>
              </tr>
            </thead>
            <tbody>
              {portData.map((port, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {port.portName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCongestionColor(port.congestionLevel)}`}>
                      {port.congestionLevel.toFixed(0)}{t.percent}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {port.waitingTime.toFixed(1)} {t.hours}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {port.availableBerths}/{port.totalBerths}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 운임 정보 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Ship className="w-6 h-6 text-indigo-600" />
          {t.shippingRates}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.carrier}
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  항로
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.container}
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  운임
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {t.validUntil}
                </th>
              </tr>
            </thead>
            <tbody>
              {shippingRates.slice(0, 10).map((rate, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-100">
                    {rate.carrier}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {rate.origin} → {rate.destination}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {rate.containerType}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                    ${rate.rate.toLocaleString()} {rate.currency}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(rate.validUntil).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDataDashboard;