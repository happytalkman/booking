import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, Info, X, BarChart3, Target } from 'lucide-react';
import { KPI } from '../types';

interface KPICardProps {
  kpi: KPI;
  target?: number;
  actual?: number;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ kpi, target, actual, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = kpi.icon;

  let trendColor = 'text-slate-500';
  let TrendIcon = Minus;

  if (kpi.trend === 'up') {
    trendColor = 'text-green-500';
    TrendIcon = ArrowUpRight;
  } else if (kpi.trend === 'down') {
    trendColor = 'text-red-500';
    TrendIcon = ArrowDownRight;
  }

  // Special logic for "lower is better" metrics
  if (kpi.title.includes("Cancellation") || kpi.title.includes("No-Show") || kpi.title.includes("Lead Time") || kpi.title.includes("취소") || kpi.title.includes("노쇼")) {
     if (kpi.trend === 'down') trendColor = 'text-green-500';
     if (kpi.trend === 'up') trendColor = 'text-red-500';
  }

  // Calculate progress percentage
  const progressPercentage = target && actual ? Math.min((actual / target) * 100, 100) : 0;
  
  // Determine progress color
  const getProgressColor = () => {
    if (progressPercentage >= 90) return 'bg-green-500';
    if (progressPercentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = () => {
    if (progressPercentage >= 90) return 'text-green-600';
    if (progressPercentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-2 right-2 bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-10 w-48">
          클릭하여 상세 분석 보기
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.value}</h3>
            {kpi.subValue && <span className="text-sm text-slate-400 dark:text-slate-500">{kpi.subValue}</span>}
          </div>
          
          {/* Target vs Actual */}
          {target && actual && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">목표 대비</span>
                <span className={`font-bold ${getProgressTextColor()}`}>
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-400 dark:text-slate-500">
                  <Target className="w-3 h-3 inline mr-1" />
                  목표: {target.toLocaleString()}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  실제: {actual.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10 dark:bg-opacity-20`}>
            <Icon className={`w-5 h-5 ${kpi.color.replace('bg-', 'text-')}`} />
          </div>
          
          {/* Info Icon */}
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
          >
            <Info className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
      
      {/* Trend Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex items-center text-xs font-semibold ${trendColor} bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded`}>
            <TrendIcon className="w-3 h-3 mr-1" />
            {kpi.trendValue}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{kpi.trendLabel}</span>
        </div>
        
        {/* Click indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <BarChart3 className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
