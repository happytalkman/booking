import React, { useState, useEffect } from 'react';
import { CheckCircle2 as CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface APIStatus {
  name: string;
  status: 'connected' | 'error' | 'loading';
  lastUpdate: Date;
  source: string;
}

const APIStatusIndicator: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkAPIStatuses();
    const interval = setInterval(checkAPIStatuses, 30000); // 30초마다 체크
    return () => clearInterval(interval);
  }, []);

  const checkAPIStatuses = async () => {
    const statuses: APIStatus[] = [];

    // 환율 API 체크
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      statuses.push({
        name: 'Exchange Rate',
        status: response.ok ? 'connected' : 'error',
        lastUpdate: new Date(),
        source: 'ExchangeRate-API'
      });
    } catch {
      statuses.push({
        name: 'Exchange Rate',
        status: 'error',
        lastUpdate: new Date(),
        source: 'ExchangeRate-API'
      });
    }

    // 날씨 API 체크
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=35.1796&lon=129.0756&appid=${apiKey}&units=metric`);
      statuses.push({
        name: 'Weather',
        status: response.ok ? 'connected' : 'error',
        lastUpdate: new Date(),
        source: 'OpenWeatherMap'
      });
    } catch {
      statuses.push({
        name: 'Weather',
        status: 'error',
        lastUpdate: new Date(),
        source: 'OpenWeatherMap'
      });
    }

    // 유가 API 체크
    try {
      const apiKey = import.meta.env.VITE_ALPHAVANTAGE_API_KEY;
      const response = await fetch(`https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${apiKey}`);
      statuses.push({
        name: 'Oil Prices',
        status: response.ok ? 'connected' : 'error',
        lastUpdate: new Date(),
        source: 'Alpha Vantage'
      });
    } catch {
      statuses.push({
        name: 'Oil Prices',
        status: 'error',
        lastUpdate: new Date(),
        source: 'Alpha Vantage'
      });
    }

    setApiStatuses(statuses);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const connectedCount = apiStatuses.filter(api => api.status === 'connected').length;
  const totalCount = apiStatuses.length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          connectedCount === totalCount 
            ? 'bg-green-600 hover:bg-green-700' 
            : connectedCount > 0 
            ? 'bg-yellow-600 hover:bg-yellow-700'
            : 'bg-red-600 hover:bg-red-700'
        } text-white`}
        title={`API Status: ${connectedCount}/${totalCount} connected`}
      >
        {connectedCount === totalCount ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
      </button>

      {/* Status Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">API Status</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {connectedCount}/{totalCount} Connected
            </span>
          </div>
          
          <div className="space-y-2">
            {apiStatuses.map((api, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(api.status)}
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {api.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {api.source}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {api.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Real-time API monitoring</span>
              <button
                onClick={checkAPIStatuses}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIStatusIndicator;