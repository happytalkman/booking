import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, MapPin, Ship, Anchor, Clock, TrendingUp } from 'lucide-react';

interface SimulationData {
  id: string;
  name: string;
  type: 'route' | 'port' | 'cargo';
  status: 'active' | 'completed' | 'delayed';
  progress: number;
  eta: string;
  position: { lat: number; lng: number };
  speed: number;
  cargo: string;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  duration: number;
  complexity: 'low' | 'medium' | 'high';
  vessels: number;
  routes: number;
}

const ShippingSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario1');
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scenarios: SimulationScenario[] = [
    {
      id: 'scenario1',
      name: '부산-LA 정기 항로',
      description: '태평양 횡단 컨테이너 운송 시뮬레이션',
      duration: 14,
      complexity: 'medium',
      vessels: 3,
      routes: 1
    },
    {
      id: 'scenario2',
      name: '동남아시아 순환 항로',
      description: '싱가포르-방콕-호치민-부산 순환 운송',
      duration: 21,
      complexity: 'high',
      vessels: 5,
      routes: 4
    },
    {
      id: 'scenario3',
      name: '긴급 화물 운송',
      description: '의료용품 긴급 배송 시나리오',
      duration: 7,
      complexity: 'low',
      vessels: 1,
      routes: 1
    }
  ];

  const mockSimulationData: SimulationData[] = [
    {
      id: 'vessel1',
      name: 'KMTC BUSAN',
      type: 'route',
      status: 'active',
      progress: 65,
      eta: '2024-01-15 14:30',
      position: { lat: 35.1796, lng: 129.0756 },
      speed: 18.5,
      cargo: '컨테이너 2,400 TEU'
    },
    {
      id: 'vessel2',
      name: 'KMTC PACIFIC',
      type: 'route',
      status: 'active',
      progress: 32,
      eta: '2024-01-18 09:15',
      position: { lat: 37.5665, lng: 126.9780 },
      speed: 22.1,
      cargo: '컨테이너 3,200 TEU'
    },
    {
      id: 'port1',
      name: '부산항',
      type: 'port',
      status: 'active',
      progress: 85,
      eta: '2024-01-14 16:00',
      position: { lat: 35.1796, lng: 129.0756 },
      speed: 0,
      cargo: '처리 중: 1,800 TEU'
    }
  ];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + speed);
        updateSimulationData();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed]);

  useEffect(() => {
    setSimulationData(mockSimulationData);
  }, [selectedScenario]);

  const updateSimulationData = () => {
    setSimulationData(prev => prev.map(item => ({
      ...item,
      progress: Math.min(100, item.progress + Math.random() * 2),
      speed: item.type === 'route' ? item.speed + (Math.random() - 0.5) * 2 : 0
    })));
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setSimulationData(mockSimulationData);
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}일 ${hours}시간 ${minutes}분`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'delayed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8 rounded-xl shadow-2xl max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          해운 시뮬레이터
        </h2>
        <p className="text-gray-300 text-lg">실시간 해운 운송 시뮬레이션 및 분석 도구</p>
      </div>

      {/* 시나리오 선택 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-blue-300">시뮬레이션 시나리오</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                selectedScenario === scenario.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{scenario.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(scenario.complexity)}`}>
                  {scenario.complexity.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{scenario.description}</p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>기간: {scenario.duration}일</span>
                <span>선박: {scenario.vessels}척</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 제어 패널 */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? '일시정지' : '시작'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-all duration-300"
            >
              <RotateCcw size={20} />
              초기화
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300"
            >
              <Settings size={20} />
              설정
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-blue-400" />
              <span className="text-lg font-mono">{formatTime(currentTime)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-300">속도:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-3">시뮬레이션 설정</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">날씨 조건</label>
                <select className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2">
                  <option>맑음</option>
                  <option>흐림</option>
                  <option>비</option>
                  <option>폭풍</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">해상 상태</label>
                <select className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2">
                  <option>평온</option>
                  <option>보통</option>
                  <option>거침</option>
                  <option>매우 거침</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 시뮬레이션 데이터 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 선박 상태 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Ship className="text-blue-400" size={24} />
            선박 현황
          </h3>
          <div className="space-y-4">
            {simulationData.filter(item => item.type === 'route').map((vessel) => (
              <div key={vessel.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{vessel.name}</h4>
                    <p className="text-gray-300">{vessel.cargo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vessel.status)}`}>
                    {vessel.status === 'active' ? '운항중' : vessel.status === 'completed' ? '완료' : '지연'}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>진행률</span>
                    <span>{vessel.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${vessel.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">속도:</span>
                    <span className="ml-2 font-mono">{vessel.speed.toFixed(1)} knots</span>
                  </div>
                  <div>
                    <span className="text-gray-400">ETA:</span>
                    <span className="ml-2 font-mono">{vessel.eta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 항만 상태 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Anchor className="text-green-400" size={24} />
            항만 현황
          </h3>
          <div className="space-y-4">
            {simulationData.filter(item => item.type === 'port').map((port) => (
              <div key={port.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{port.name}</h4>
                    <p className="text-gray-300">{port.cargo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(port.status)}`}>
                    운영중
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>처리율</span>
                    <span>{port.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${port.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-400">위치:</span>
                  <span className="font-mono">{port.position.lat.toFixed(4)}, {port.position.lng.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 성능 지표 */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-400" size={24} />
          실시간 성능 지표
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {simulationData.filter(item => item.type === 'route').length}
            </div>
            <div className="text-gray-300">활성 선박</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {simulationData.reduce((acc, item) => acc + (item.type === 'route' ? item.progress : 0), 0).toFixed(0)}%
            </div>
            <div className="text-gray-300">평균 진행률</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {simulationData.filter(item => item.type === 'route').reduce((acc, item) => acc + item.speed, 0).toFixed(1)}
            </div>
            <div className="text-gray-300">총 속도 (knots)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-gray-300">경과 시간</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSimulator;