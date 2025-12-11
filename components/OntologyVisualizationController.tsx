import React, { useState } from 'react';
import { 
  Layers, Filter, ZoomIn, ZoomOut, Maximize2, Download, 
  Grid, Circle, GitBranch, Target, Eye, EyeOff, Sliders 
} from 'lucide-react';
import { Language } from '../types';

interface OntologyVisualizationControllerProps {
  lang: Language;
  onLayoutChange?: (layout: LayoutType) => void;
  onFilterChange?: (filters: FilterOptions) => void;
  onZoomChange?: (zoom: number) => void;
  onExport?: (format: ExportFormat) => void;
}

type LayoutType = 'force' | 'radial' | 'hierarchical' | 'circular' | 'grid';
type ExportFormat = 'png' | 'svg' | 'json';

interface FilterOptions {
  nodeTypes: string[];
  relationTypes: string[];
  minConnections: number;
  maxConnections: number;
  showLabels: boolean;
  nodeSize: 'small' | 'medium' | 'large';
}

const OntologyVisualizationController: React.FC<OntologyVisualizationControllerProps> = ({
  lang,
  onLayoutChange,
  onFilterChange,
  onZoomChange,
  onExport
}) => {
  const [layout, setLayout] = useState<LayoutType>('force');
  const [zoom, setZoom] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    nodeTypes: ['shipper', 'route', 'booking', 'vessel', 'contract', 'marketIndex', 'competitor'],
    relationTypes: ['uses', 'has', 'on', 'operates', 'governedBy', 'affects', 'competesWith'],
    minConnections: 0,
    maxConnections: 100,
    showLabels: true,
    nodeSize: 'medium'
  });

  const t = {
    title: { ko: '시각화 컨트롤', en: 'Visualization Control' },
    layout: { ko: '레이아웃', en: 'Layout' },
    filters: { ko: '필터', en: 'Filters' },
    zoom: { ko: '줌', en: 'Zoom' },
    export: { ko: '내보내기', en: 'Export' },
    reset: { ko: '초기화', en: 'Reset' },
    
    // Layouts
    force: { ko: 'Force (힘 기반)', en: 'Force Directed' },
    radial: { ko: 'Radial (방사형)', en: 'Radial' },
    hierarchical: { ko: 'Hierarchical (계층)', en: 'Hierarchical' },
    circular: { ko: 'Circular (원형)', en: 'Circular' },
    grid: { ko: 'Grid (격자)', en: 'Grid' },
    
    // Filters
    nodeTypes: { ko: '노드 타입', en: 'Node Types' },
    relationTypes: { ko: '관계 타입', en: 'Relation Types' },
    connections: { ko: '연결 수', en: 'Connections' },
    showLabels: { ko: '라벨 표시', en: 'Show Labels' },
    nodeSize: { ko: '노드 크기', en: 'Node Size' },
    
    small: { ko: '작게', en: 'Small' },
    medium: { ko: '보통', en: 'Medium' },
    large: { ko: '크게', en: 'Large' },
    
    // Export
    exportPNG: { ko: 'PNG 이미지', en: 'PNG Image' },
    exportSVG: { ko: 'SVG 벡터', en: 'SVG Vector' },
    exportJSON: { ko: 'JSON 데이터', en: 'JSON Data' },
    
    applyFilters: { ko: '필터 적용', en: 'Apply Filters' }
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50);
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleZoomReset = () => {
    setZoom(100);
    if (onZoomChange) onZoomChange(100);
  };

  const handleExport = (format: ExportFormat) => {
    if (onExport) onExport(format);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const toggleNodeType = (type: string) => {
    const newTypes = filters.nodeTypes.includes(type)
      ? filters.nodeTypes.filter(t => t !== type)
      : [...filters.nodeTypes, type];
    handleFilterChange('nodeTypes', newTypes);
  };

  const layouts = [
    { id: 'force' as LayoutType, icon: Circle, label: t.force[lang] },
    { id: 'radial' as LayoutType, icon: Target, label: t.radial[lang] },
    { id: 'hierarchical' as LayoutType, icon: GitBranch, label: t.hierarchical[lang] },
    { id: 'circular' as LayoutType, icon: Circle, label: t.circular[lang] },
    { id: 'grid' as LayoutType, icon: Grid, label: t.grid[lang] }
  ];

  const nodeTypes = [
    { id: 'shipper', label: { ko: '화주', en: 'Shipper' }, color: 'bg-blue-500' },
    { id: 'route', label: { ko: '항로', en: 'Route' }, color: 'bg-green-500' },
    { id: 'booking', label: { ko: '부킹', en: 'Booking' }, color: 'bg-purple-500' },
    { id: 'vessel', label: { ko: '선박', en: 'Vessel' }, color: 'bg-orange-500' },
    { id: 'contract', label: { ko: '계약', en: 'Contract' }, color: 'bg-pink-500' },
    { id: 'marketIndex', label: { ko: '시장지표', en: 'Market Index' }, color: 'bg-red-500' },
    { id: 'competitor', label: { ko: '경쟁사', en: 'Competitor' }, color: 'bg-yellow-500' }
  ];

  return (
    <div className="fixed top-24 right-6 z-40 space-y-3">
      {/* 레이아웃 선택 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {t.layout[lang]}
          </span>
        </div>
        <div className="space-y-2">
          {layouts.map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => handleLayoutChange(l.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  layout === l.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 줌 컨트롤 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Maximize2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {t.zoom[lang]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {zoom}%
            </span>
          </div>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
        <button
          onClick={handleZoomReset}
          className="w-full mt-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
        >
          {t.reset[lang]}
        </button>
      </div>

      {/* 필터 토글 */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {t.filters[lang]}
          </span>
        </div>
        <Sliders className="w-4 h-4 text-slate-400" />
      </button>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
          {/* 노드 타입 필터 */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t.nodeTypes[lang]}
            </h4>
            <div className="space-y-2">
              {nodeTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.nodeTypes.includes(type.id)}
                    onChange={() => toggleNodeType(type.id)}
                    className="rounded"
                  />
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {type.label[lang]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 연결 수 필터 */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t.connections[lang]}
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Min: {filters.minConnections}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.minConnections}
                  onChange={(e) => handleFilterChange('minConnections', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Max: {filters.maxConnections}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.maxConnections}
                  onChange={(e) => handleFilterChange('maxConnections', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* 노드 크기 */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {t.nodeSize[lang]}
            </h4>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFilterChange('nodeSize', size)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                    filters.nodeSize === size
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t[size][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* 라벨 표시 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showLabels}
              onChange={(e) => handleFilterChange('showLabels', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {t.showLabels[lang]}
            </span>
          </label>
        </div>
      )}

      {/* 내보내기 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {t.export[lang]}
          </span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleExport('png')}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
          >
            {t.exportPNG[lang]}
          </button>
          <button
            onClick={() => handleExport('svg')}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
          >
            {t.exportSVG[lang]}
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
          >
            {t.exportJSON[lang]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OntologyVisualizationController;
