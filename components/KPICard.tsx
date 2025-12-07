import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPI } from '../types';

const KPICard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
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

  // Special logic for "lower is better" metrics like Cancellations
  if (kpi.title.includes("Cancellation") || kpi.title.includes("No-Show") || kpi.title.includes("Lead Time")) {
     if (kpi.trend === 'down') trendColor = 'text-green-500';
     if (kpi.trend === 'up') trendColor = 'text-red-500';
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
            {kpi.subValue && <span className="text-sm text-slate-400">{kpi.subValue}</span>}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${kpi.color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`flex items-center text-xs font-semibold ${trendColor} bg-slate-50 px-2 py-0.5 rounded`}>
          <TrendIcon className="w-3 h-3 mr-1" />
          {kpi.trendValue}
        </span>
        <span className="text-xs text-slate-400">{kpi.trendLabel}</span>
      </div>
    </div>
  );
};

export default KPICard;
