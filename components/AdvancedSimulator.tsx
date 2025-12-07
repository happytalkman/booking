import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface AdvancedSimulatorProps {
  lang: Language;
}

const AdvancedSimulator: React.FC<AdvancedSimulatorProps> = ({ lang }) => {
  const [oilPrice, setOilPrice] = useState(0); // -50% to +50%
  const [redSeaDuration, setRedSeaDuration] = useState(0); // 0 to 12 months
  const [demandChange, setDemandChange] = useState(0); // -30% to +30%
  const [exchangeRate, setExchangeRate] = useState(0); // -20% to +20%
  const [simulated, setSimulated] = useState(false);

  const t = {
    title: { ko: '복합 시나리오 시뮬레이터', en: 'Multi-Variable Scenario Simulator' },
    subtitle: { ko: '여러 변수를 동시에 조정하여 운임 영향을 예측합니다', en: 'Adjust multiple variables to predict rate impact' },
    oilPrice: { ko: '유가 변동', en: 'Oil Price Change' },
    redSea: { ko: '홍해 사태 지속 기간', en: 'Red Sea Crisis Duration' },
    demand: { ko: '수요 변화', en: 'Demand Change' },
    exchange: { ko: '환율 변동', en: 'Exchange Rate' },
    months: { ko: '개월', en: 'months' },
    simulate: { ko: '시뮬레이션 실행', en: 'Run Simulation' },
    reset: { ko: '초기화', en: 'Reset' },
    results: { ko: '예측 결과', en: 'Prediction Results' },
    baseRate: { ko: '기준 운임', en: 'Base Rate' },
    predictedRate: { ko: '예상 운임', en: 'Predicted Rate' },
    impact: { ko: '영향도', en: 'Impact' },
    confidence: { ko: '신뢰도', en: 'Confidence' },
    breakdown: { ko: '요인별 분석', en: 'Factor Breakdown' },
    timeline: { ko: '시간별 추이', en: 'Timeline Projection' }
  };

  const calculateImpact = () => {
    const baseRate = 2750;
    
    // Calculate individual impacts
    const oilImpact = (oilPrice / 100) * baseRate * 0.3; // Oil affects 30% of rate
    const redSeaImpact = (redSeaDuration / 12) * baseRate * 0.25; // Max 25% increase
    const demandImpact = (demandChange / 100) * baseRate * 0.4; // Demand affects 40%
    const exchangeImpact = (exchangeRate / 100) * baseRate * 0.15; // Exchange affects 15%
    
    const totalImpact = oilImpact + redSeaImpact + demandImpact + exchangeImpact;
    const predictedRate = Math.round(baseRate + totalImpact);
    const impactPercent = ((totalImpact / baseRate) * 100).toFixed(1);
    
    // Calculate confidence based on extreme values
    const extremeness = Math.abs(oilPrice) + Math.abs(demandChange) + Math.abs(exchangeRate) + (redSeaDuration * 5);
    const confidence = Math.max(50, 95 - extremeness / 10);
    
    return {
      baseRate,
      predictedRate,
      totalImpact: Math.round(totalImpact),
      impactPercent,
      confidence: Math.round(confidence),
      factors: [
        { name: t.oilPrice[lang], impact: Math.round(oilImpact), percent: ((oilImpact / totalImpact) * 100).toFixed(0) },
        { name: t.redSea[lang], impact: Math.round(redSeaImpact), percent: ((redSeaImpact / totalImpact) * 100).toFixed(0) },
        { name: t.demand[lang], impact: Math.round(demandImpact), percent: ((demandImpact / totalImpact) * 100).toFixed(0) },
        { name: t.exchange[lang], impact: Math.round(exchangeImpact), percent: ((exchangeImpact / totalImpact) * 100).toFixed(0) }
      ]
    };
  };

  const generateTimeline = () => {
    const result = calculateImpact();
    const data = [];
    const months = 6;
    
    for (let i = 0; i <= months; i++) {
      const progress = i / months;
      const rate = result.baseRate + (result.totalImpact * progress);
      data.push({
        month: `M${i}`,
        rate: Math.round(rate),
        base: result.baseRate
      });
    }
    
    return data;
  };

  const handleSimulate = () => {
    setSimulated(true);
  };

  const handleReset = () => {
    setOilPrice(0);
    setRedSeaDuration(0);
    setDemandChange(0);
    setExchangeRate(0);
    setSimulated(false);
  };

  const result = simulated ? calculateImpact() : null;
  const timeline = simulated ? generateTimeline() : [];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <Sliders className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-bold">{t.title[lang]}</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.subtitle[lang]}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Oil Price */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            {t.oilPrice[lang]}: <span className="text-blue-600">{oilPrice > 0 ? '+' : ''}{oilPrice}%</span>
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={oilPrice}
            onChange={(e) => setOilPrice(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-50%</span>
            <span>0%</span>
            <span>+50%</span>
          </div>
        </div>

        {/* Red Sea Duration */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            {t.redSea[lang]}: <span className="text-red-600">{redSeaDuration} {t.months[lang]}</span>
          </label>
          <input
            type="range"
            min="0"
            max="12"
            value={redSeaDuration}
            onChange={(e) => setRedSeaDuration(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0</span>
            <span>6</span>
            <span>12</span>
          </div>
        </div>

        {/* Demand Change */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            {t.demand[lang]}: <span className="text-green-600">{demandChange > 0 ? '+' : ''}{demandChange}%</span>
          </label>
          <input
            type="range"
            min="-30"
            max="30"
            value={demandChange}
            onChange={(e) => setDemandChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-30%</span>
            <span>0%</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Exchange Rate */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            {t.exchange[lang]}: <span className="text-amber-600">{exchangeRate > 0 ? '+' : ''}{exchangeRate}%</span>
          </label>
          <input
            type="range"
            min="-20"
            max="20"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-20%</span>
            <span>0%</span>
            <span>+20%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSimulate}
          className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {t.simulate[lang]}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          {t.reset[lang]}
        </button>
      </div>

      {/* Results */}
      {simulated && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.baseRate[lang]}</p>
              <p className="text-2xl font-bold">${result.baseRate.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">{t.predictedRate[lang]}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${result.predictedRate.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t.impact[lang]}</p>
              <p className={`text-2xl font-bold flex items-center gap-1 ${result.totalImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {result.totalImpact > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {result.impactPercent}%
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">{t.confidence[lang]}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.confidence}%</p>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div>
            <h4 className="font-bold mb-3">{t.breakdown[lang]}</h4>
            <div className="space-y-2">
              {result.factors.map((factor, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium">{factor.name}</div>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end px-2 text-xs font-bold text-white ${
                        factor.impact > 0 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.abs(Number(factor.percent))}%` }}
                    >
                      {Math.abs(Number(factor.percent))}%
                    </div>
                  </div>
                  <div className="w-24 text-sm font-bold text-right">
                    ${Math.abs(factor.impact).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Chart */}
          <div>
            <h4 className="font-bold mb-3">{t.timeline[lang]}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#9333ea" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  name={lang === 'ko' ? '예상 운임' : 'Predicted Rate'}
                />
                <Line 
                  type="monotone" 
                  dataKey="base" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name={lang === 'ko' ? '기준 운임' : 'Base Rate'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSimulator;
