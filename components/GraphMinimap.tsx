import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Move } from 'lucide-react';
import { Language } from '../types';

interface GraphMinimapProps {
  lang: Language;
  nodes: any[];
  links: any[];
  currentViewport: {
    x: number;
    y: number;
    scale: number;
  };
  onViewportChange: (viewport: { x: number; y: number; scale: number }) => void;
}

const GraphMinimap: React.FC<GraphMinimapProps> = ({
  lang,
  nodes,
  links,
  currentViewport,
  onViewportChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const t = {
    title: { ko: '미니맵', en: 'Minimap' },
    expand: { ko: '확대', en: 'Expand' },
    collapse: { ko: '축소', en: 'Collapse' }
  };

  const minimapSize = isExpanded ? 200 : 120;

  useEffect(() => {
    drawMinimap();
  }, [nodes, links, currentViewport, minimapSize]);

  const drawMinimap = () => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = minimapSize;
    canvas.height = minimapSize;

    // 배경 클리어
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--slate-900') || '#0f172a';
    ctx.fillRect(0, 0, minimapSize, minimapSize);

    // 노드 위치 정규화
    const xExtent = d3.extent(nodes, d => d.x) as [number, number];
    const yExtent = d3.extent(nodes, d => d.y) as [number, number];
    
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([10, minimapSize - 10]);
    
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([10, minimapSize - 10]);

    // 링크 그리기
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.5;
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source.id || n.id === link.source);
      const target = nodes.find(n => n.id === link.target.id || n.id === link.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(xScale(source.x), yScale(source.y));
        ctx.lineTo(xScale(target.x), yScale(target.y));
        ctx.stroke();
      }
    });

    // 노드 그리기
    nodes.forEach(node => {
      const x = xScale(node.x);
      const y = yScale(node.y);
      const radius = Math.max(1, Math.min(3, (node.connections || 1) * 0.5));

      // 노드 타입별 색상
      const colors: { [key: string]: string } = {
        shipper: '#3b82f6',
        route: '#10b981',
        booking: '#8b5cf6',
        vessel: '#f97316',
        contract: '#ec4899',
        marketIndex: '#ef4444',
        competitor: '#eab308'
      };

      ctx.fillStyle = colors[node.type] || '#6b7280';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 현재 뷰포트 표시
    const viewportWidth = minimapSize / currentViewport.scale * 0.3;
    const viewportHeight = minimapSize / currentViewport.scale * 0.3;
    const viewportX = (minimapSize - viewportWidth) / 2 - currentViewport.x * 0.1;
    const viewportY = (minimapSize - viewportHeight) / 2 - currentViewport.y * 0.1;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      Math.max(0, Math.min(viewportX, minimapSize - viewportWidth)),
      Math.max(0, Math.min(viewportY, minimapSize - viewportHeight)),
      Math.min(viewportWidth, minimapSize),
      Math.min(viewportHeight, minimapSize)
    );
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 클릭 위치를 그래프 좌표로 변환
    const graphX = (x - minimapSize / 2) * currentViewport.scale * 10;
    const graphY = (y - minimapSize / 2) * currentViewport.scale * 10;

    onViewportChange({
      x: -graphX,
      y: -graphY,
      scale: currentViewport.scale
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleCanvasClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleCanvasClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {t.title[lang]}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title={isExpanded ? t.collapse[lang] : t.expand[lang]}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* 미니맵 캔버스 */}
        <div className="p-3">
          <canvas
            ref={canvasRef}
            width={minimapSize}
            height={minimapSize}
            className="border border-slate-200 dark:border-slate-600 rounded cursor-pointer hover:border-blue-400 transition-colors"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              width: minimapSize,
              height: minimapSize
            }}
          />
          
          {/* 범례 */}
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
            {lang === 'ko' ? '클릭하여 이동' : 'Click to navigate'}
          </div>
        </div>

        {/* 확장된 상태에서 추가 정보 */}
        {isExpanded && (
          <div className="border-t border-slate-100 dark:border-slate-700 p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="font-bold text-slate-900 dark:text-white">
                  {nodes.length}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {lang === 'ko' ? '노드' : 'Nodes'}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="font-bold text-slate-900 dark:text-white">
                  {Math.round(currentViewport.scale * 100)}%
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {lang === 'ko' ? '줌' : 'Zoom'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphMinimap;