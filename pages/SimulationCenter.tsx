import React, { useState } from 'react';
import { Play, BarChart3, Map, Settings, Monitor, Zap, Brain, Target } from 'lucide-react';
import ShippingSimulator from '../components/ShippingSimulator';
import AdvancedVisualization from '../components/AdvancedVisualization';

const SimulationCenter: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'simulator' | 'visualization' | 'dashboard'>('simulator');

  const modules = [
    {
      id: 'simulator' as const,
      name: '해운 시뮬레이터',
      description: '실시간 해운 운송 시뮬레이션',
      icon: Play,
      color: 'from-blue-500 to-cyan-500',
      features: ['실시간 시뮬레이션', '다중 시나리오', '성능 분석', '예측 모델링']
    },
    {
      id: 'visualization' as const,
      name: '고급 시각화',
      description: '다차원 데이터 시각화 도구',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      features: ['인터랙티브 차트', '실시간 업데이트', '다양한 차트 타입', '데이터 내보내기']
    },
    {
      id: 'dashboard' as const,
      name: '통합 대시보드',
      description: '종합 모니터링 및 제어',
      icon: Monitor,
      color: 'from-green-500 to-teal-500',
      features: ['실시간 모니터링', '알림 시스템', '성능 지표', '제어 패널']
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* 상태 개요 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Play size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">3</div>
              <div className="text-blue-200">활성 시뮬레이션</div>
            </div>
          </div>
          <div className="text-sm text-blue-200">전체 시뮬레이션 중 75% 실행 중</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">12</div>
              <div className="text-green-200">활성 차트</div>
            </div>
          </div>
          <div className="text-sm text-green-200">실시간 데이터 시각화 진행 중</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">98.5%</div>
              <div className="text-purple-200">시스템 성능</div>
            </div>
          </div>
          <div className="text-sm text-purple-200">최적 상태로 운영 중</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">AI</div>
              <div className="text-orange-200">분석 엔진</div>
            </div>
          </div>
          <div className="text-sm text-orange-200">머신러닝 모델 활성화</div>
        </div>
      </div>

      {/* 실시간 모니터링 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <Target className="text-blue-400" size={24} />
            시뮬레이션 성능
          </h3>
          <div className="space-y-4">
            {[
              { name: '부산-LA 항로', progress: 78, status: '정상' },
              { name: '동남아 순환', progress: 45, status: '진행중' },
              { name: '긴급 운송', progress: 92, status: '완료 임박' }
            ].map((sim, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{sim.name}</span>
                  <span className="text-sm text-gray-300">{sim.status}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sim.progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-400 mt-1">{sim.progress}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <Map className="text-green-400" size={24} />
            지역별 활동
          </h3>
          <div className="space-y-4">
            {[
              { region: '동북아시아', activity: 85, vessels: 12 },
              { region: '동남아시아', activity: 67, vessels: 8 },
              { region: '북미 서안', activity: 43, vessels: 5 },
              { region: '유럽', activity: 29, vessels: 3 }
            ].map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">{region.region}</div>
                  <div className="text-sm text-gray-400">{region.vessels}척 활동 중</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">{region.activity}%</div>
                  <div className="text-xs text-gray-400">활동률</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 시스템 알림 */}
      <div className="bg-gray-800 p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <Settings className="text-yellow-400" size={24} />
          시스템 알림
        </h3>
        <div className="space-y-3">
          {[
            { type: 'info', message: '새로운 시뮬레이션 시나리오가 추가되었습니다.', time: '5분 전' },
            { type: 'warning', message: '동남아 항로 시뮬레이션에서 지연이 감지되었습니다.', time: '12분 전' },
            { type: 'success', message: '부산-LA 항로 시뮬레이션이 성공적으로 완료되었습니다.', time: '1시간 전' }
          ].map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${
              alert.type === 'info' ? 'bg-blue-900/30 border-blue-500' :
              alert.type === 'warning' ? 'bg-yellow-900/30 border-yellow-500' :
              'bg-green-900/30 border-green-500'
            }`}>
              <div className="flex justify-between items-start">
                <p className="text-white">{alert.message}</p>
                <span className="text-xs text-gray-400">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            시뮬레이션 & 시각화 센터
          </h1>
          <p className="text-xl text-gray-300">
            고급 해운 시뮬레이션과 데이터 시각화를 위한 통합 플랫폼
          </p>
        </div>

        {/* 모듈 선택 */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeModule === module.id
                    ? 'ring-2 ring-white/50 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                onClick={() => setActiveModule(module.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} rounded-xl opacity-90`}></div>
                <div className="relative z-10 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <module.icon size={32} />
                    <div className={`w-4 h-4 rounded-full ${
                      activeModule === module.id ? 'bg-white' : 'bg-white/50'
                    }`}></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{module.name}</h3>
                  <p className="text-white/90 mb-4">{module.description}</p>
                  <div className="space-y-1">
                    {module.features.map((feature, index) => (
                      <div key={index} className="text-sm text-white/80 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8">
          {activeModule === 'simulator' && <ShippingSimulator />}
          {activeModule === 'visualization' && <AdvancedVisualization />}
          {activeModule === 'dashboard' && renderDashboard()}
        </div>
      </div>
    </div>
  );
};

export default SimulationCenter;