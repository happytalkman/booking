import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, PieChart, LineChart, Map, Globe, Layers, Filter, Download, Maximize2, RefreshCw } from 'lucide-react';

interface ChartData {
  id: string;
  name: string;
  value: number;
  category: string;
  trend: number[];
  color: string;
}

interface VisualizationConfig {
  type: 'bar' | 'pie' | 'line' | 'map' | 'network' | 'heatmap';
  title: string;
  data: ChartData[];
  options: {
    showLegend: boolean;
    showGrid: boolean;
    animated: boolean;
    responsive: boolean;
  };
}

const AdvancedVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('charts');
  const [selectedChart, setSelectedChart] = useState<string>('bar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '30days',
    region: 'all',
    category: 'all'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const mockChartData: ChartData[] = [
    {
      id: '1',
      name: '부산항',
      value: 2400,
      category: 'port',
      trend: [2100, 2200, 2300, 2400, 2350, 2400],
      color: '#3B82F6'
    },
    {
      id: '2',
      name: '인천항',
      value: 1800,
      category: 'port',
      trend: [1600, 1650, 1700, 1750, 1800, 1780],
      color: '#10B981'
    },
    {
      id: '3',
      name: '울산항',
      value: 1200,
      category: 'port',
      trend: [1100, 1150, 1180, 1200, 1190, 1200],
      color: '#F59E0B'
    },
    {
      id: '4',
      name: '광양항',
      value: 900,
      category: 'port',
      trend: [850, 870, 880, 890, 900, 895],
      color: '#EF4444'
    }
  ];

  const visualizationConfigs: VisualizationConfig[] = [
    {
      type: 'bar',
      title: '항만별 컨테이너 처리량',
      data: mockChartData,
      options: {
        showLegend: true,
        showGrid: true,
        animated: true,
        responsive: true
      }
    },
    {
      type: 'pie',
      title: '지역별 화물 분포',
      data: mockChartData,
      options: {
        showLegend: true,
        showGrid: false,
        animated: true,
        responsive: true
      }
    },
    {
      type: 'line',
      title: '월별 운송량 추이',
      data: mockChartData,
      options: {
        showLegend: true,
        showGrid: true,
        animated: true,
        responsive: true
      }
    }
  ];

  useEffect(() => {
    if (selectedChart === 'network') {
      drawNetworkVisualization();
    } else if (selectedChart === 'heatmap') {
      drawHeatmapVisualization();
    }
  }, [selectedChart]);

  const drawNetworkVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 배경 클리어
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 노드 데이터
    const nodes = [
      { id: 'busan', x: 200, y: 150, radius: 30, label: '부산항', connections: ['incheon', 'ulsan'] },
      { id: 'incheon', x: 150, y: 100, radius: 25, label: '인천항', connections: ['busan', 'gwangyang'] },
      { id: 'ulsan', x: 250, y: 200, radius: 20, label: '울산항', connections: ['busan', 'gwangyang'] },
      { id: 'gwangyang', x: 180, y: 250, radius: 18, label: '광양항', connections: ['incheon', 'ulsan'] }
    ];

    // 연결선 그리기
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        const connNode = nodes.find(n => n.id === connId);
        if (connNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connNode.x, connNode.y);
          ctx.stroke();
        }
      });
    });

    // 노드 그리기
    nodes.forEach(node => {
      // 노드 원
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();

      // 노드 테두리
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 라벨
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + node.radius + 20);
    });
  };

  const drawHeatmapVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cellSize = 40;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // 히트맵 데이터 생성
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const intensity = Math.random();
        const hue = (1 - intensity) * 240; // 파란색에서 빨간색으로
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // 차트 내보내기 로직
    console.log('Exporting chart...');
  };

  const renderBarChart = (data: ChartData[]) => (
    <div className="h-80 flex items-end justify-around p-4 bg-gray-800 rounded-lg">
      {data.map((item, index) => (
        <div key={item.id} className="flex flex-col items-center">
          <div
            className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-1000 ease-out"
            style={{
              height: `${(item.value / Math.max(...data.map(d => d.value))) * 250}px`,
              backgroundColor: item.color
            }}
          ></div>
          <div className="mt-2 text-sm text-center">
            <div className="font-semibold text-white">{item.name}</div>
            <div className="text-gray-300">{item.value.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = (data: ChartData[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="h-80 flex items-center justify-center bg-gray-800 rounded-lg">
        <div className="relative">
          <svg width="300" height="300" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const x1 = 150 + 120 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 150 + 120 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 150 + 120 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 150 + 120 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = `M 150 150 L ${x1} ${y1} A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              currentAngle += angle;
              
              return (
                <path
                  key={item.id}
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total.toLocaleString()}</div>
              <div className="text-gray-300">총 처리량</div>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-2">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-white">{item.name}</span>
              <span className="text-gray-300">({((item.value / total) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLineChart = (data: ChartData[]) => (
    <div className="h-80 bg-gray-800 rounded-lg p-4">
      <svg width="100%" height="100%" className="overflow-visible">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {data.map((item, itemIndex) => {
          const points = item.trend.map((value, index) => ({
            x: (index / (item.trend.length - 1)) * 100,
            y: 100 - ((value - Math.min(...item.trend)) / (Math.max(...item.trend) - Math.min(...item.trend))) * 80
          }));
          
          const pathData = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
          
          return (
            <g key={item.id}>
              <path
                d={pathData}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                className="transition-all duration-300"
              />
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={item.color}
                  className="transition-all duration-300 hover:r-6"
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div className={`bg-gray-900 text-white rounded-xl shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-8 max-w-7xl mx-auto'
    }`}>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              고급 시각화 도구
            </h2>
            <p className="text-gray-300 text-lg">다차원 데이터 분석 및 인터랙티브 시각화</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 ${
                isLoading ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={handleExport}
              className="p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300"
            >
              <Download size={20} />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-300"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'charts', label: '차트', icon: BarChart3 },
            { id: 'maps', label: '지도', icon: Map },
            { id: 'network', label: '네트워크', icon: Globe },
            { id: 'advanced', label: '고급', icon: Layers }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 필터 패널 */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold">데이터 필터</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">기간</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="7days">최근 7일</option>
              <option value="30days">최근 30일</option>
              <option value="90days">최근 90일</option>
              <option value="1year">최근 1년</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">지역</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="all">전체</option>
              <option value="asia">아시아</option>
              <option value="europe">유럽</option>
              <option value="america">아메리카</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="all">전체</option>
              <option value="port">항만</option>
              <option value="vessel">선박</option>
              <option value="cargo">화물</option>
            </select>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="space-y-8">
        {activeTab === 'charts' && (
          <div>
            <div className="flex gap-4 mb-6">
              {[
                { id: 'bar', label: '막대 차트', icon: BarChart3 },
                { id: 'pie', label: '원형 차트', icon: PieChart },
                { id: 'line', label: '선형 차트', icon: LineChart }
              ].map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    selectedChart === chart.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <chart.icon size={18} />
                  {chart.label}
                </button>
              ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                {visualizationConfigs.find(config => config.type === selectedChart)?.title}
              </h3>
              
              {selectedChart === 'bar' && renderBarChart(mockChartData)}
              {selectedChart === 'pie' && renderPieChart(mockChartData)}
              {selectedChart === 'line' && renderLineChart(mockChartData)}
            </div>
          </div>
        )}

        {activeTab === 'maps' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">지리적 데이터 시각화</h3>
            <div ref={mapRef} className="h-96 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map size={64} className="text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">지도 시각화 준비 중...</p>
                <p className="text-sm text-gray-500 mt-2">실제 구현 시 Leaflet 또는 Google Maps API 사용</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">네트워크 시각화</h3>
            <div className="flex gap-4 mb-4">
              {[
                { id: 'network', label: '네트워크 그래프' },
                { id: 'heatmap', label: '히트맵' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedChart(type.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    selectedChart === type.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-gray-700 rounded-lg"
            />
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">실시간 데이터 스트림</h3>
              <div className="space-y-4">
                {mockChartData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{item.value.toLocaleString()}</span>
                      <div className="w-16 h-8 bg-gray-600 rounded overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-transparent to-blue-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">통계 요약</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-blue-400">
                    {mockChartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-300">총합</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-green-400">
                    {(mockChartData.reduce((sum, item) => sum + item.value, 0) / mockChartData.length).toFixed(0)}
                  </div>
                  <div className="text-gray-300">평균</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.max(...mockChartData.map(item => item.value)).toLocaleString()}
                  </div>
                  <div className="text-gray-300">최대값</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-red-400">
                    {Math.min(...mockChartData.map(item => item.value)).toLocaleString()}
                  </div>
                  <div className="text-gray-300">최소값</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedVisualization;