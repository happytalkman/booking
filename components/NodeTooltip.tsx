import React from 'react';
import { Network, Link, Hash, Tag } from 'lucide-react';
import { Language } from '../types';

interface NodeTooltipProps {
  node: any;
  position: { x: number; y: number };
  lang: Language;
  visible: boolean;
}

const NodeTooltip: React.FC<NodeTooltipProps> = ({ node, position, lang, visible }) => {
  if (!visible || !node) return null;

  const t = {
    type: { ko: '타입', en: 'Type' },
    connections: { ko: '연결', en: 'Connections' },
    properties: { ko: '속성', en: 'Properties' },
    id: { ko: 'ID', en: 'ID' }
  };

  const getNodeTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      shipper: 'bg-blue-500',
      route: 'bg-green-500',
      booking: 'bg-purple-500',
      vessel: 'bg-orange-500',
      contract: 'bg-pink-500',
      marketIndex: 'bg-red-500',
      competitor: 'bg-yellow-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: { ko: string; en: string } } = {
      shipper: { ko: '화주', en: 'Shipper' },
      route: { ko: '항로', en: 'Route' },
      booking: { ko: '부킹', en: 'Booking' },
      vessel: { ko: '선박', en: 'Vessel' },
      contract: { ko: '계약', en: 'Contract' },
      marketIndex: { ko: '시장지표', en: 'Market Index' },
      competitor: { ko: '경쟁사', en: 'Competitor' }
    };
    return labels[type]?.[lang] || type;
  };

  // 툴팁 위치 조정 (화면 경계 고려)
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 280), // 툴팁 너비 280px 고려
    y: position.y > window.innerHeight / 2 ? position.y - 120 : position.y + 20
  };

  return (
    <div
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4 max-w-xs">
        {/* 헤더 */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${getNodeTypeColor(node.type)} flex-shrink-0 mt-1`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {node.label || node.id}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getTypeLabel(node.type)}
            </p>
          </div>
        </div>

        {/* 정보 */}
        <div className="space-y-2">
          {/* ID */}
          <div className="flex items-center gap-2">
            <Hash className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {t.id[lang]}: {node.id}
            </span>
          </div>

          {/* 연결 수 */}
          <div className="flex items-center gap-2">
            <Network className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {t.connections[lang]}: {node.connections || 0}
            </span>
          </div>

          {/* 주요 속성 */}
          {node.properties && Object.keys(node.properties).length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.properties[lang]}
                </span>
              </div>
              <div className="space-y-1">
                {Object.entries(node.properties).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 truncate">
                      {key}:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium ml-2 truncate">
                      {String(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(node.properties).length > 3 && (
                  <div className="text-xs text-slate-400 italic">
                    +{Object.keys(node.properties).length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 화살표 */}
        <div 
          className="absolute w-2 h-2 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 transform rotate-45"
          style={{
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            [position.y > window.innerHeight / 2 ? 'bottom' : 'top']: '-4px'
          }}
        />
      </div>
    </div>
  );
};

export default NodeTooltip;