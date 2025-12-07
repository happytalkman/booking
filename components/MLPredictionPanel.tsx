import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Target, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { mlPredictionService } from '../services/mlPrediction';

interface MLPredictionPanelProps {
  lang: Language;
}

const MLPredictionPanel: React.FC<MLPredictionPanelProps> = ({ lang }) => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  const t = {
    title: { ko: 'AI 운임 예측', en: 'AI Rate Prediction' },
    subtitle: { ko: '머신러닝 기반 30일 운임 예측', en: 'ML-based 30-day rate forecast' },
    predicted: { ko: '예측 운임', en: 'Predicted Rate' },
    confidence: { ko: '예측 신뢰도', en: 'Confidence' },
    trend: { ko: '예상 추세', en: 'Expected Trend' },
    up: { ko: '상승', en: 'Upward' },
    down: { ko: '하락', en: 'Downward' },
    stable: { ko: '안정', en: 'Stable' },
    factors: { ko: '영향 요인', en: 'Impact Factors' },
    modelAccuracy: { ko: '모델 정확도', en: 'Model Accuracy' },
    loading: { ko: 'AI 모델 로딩 중...', en: 'Loading AI model...' },
    route: { ko: '한국-LA (서안)', en: 'Korea-LA (West)' }
  };

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const result = await mlPredictionService.predictRate('kr-la', 30);
      const info = mlPredictionService.getModelInfo();
      setPrediction(result);
      setModelInfo(info);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600 dark:text-red-400';
      case 'down': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600 dark:text-slate-400">{t.loading[lang]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const TrendIcon = getTrendIcon(prediction.trend);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold">{t.title[lang]}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
        </div>
        
        {/* Model Info Badge */}
        {modelInfo && (
          <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              {t.modelAccuracy[lang]}: {(modelInfo.accuracy * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      {/* Main Prediction */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">{t.predicted[lang]}</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            ${prediction.predictedRate.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">{t.confidence[lang]}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {prediction.confidence}%
            </p>
            {prediction.confidence >= 80 && (
              <Target className="w-5 h-5 text-green-600" />
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t.trend[lang]}</p>
          <div className={`flex items-center gap-2 ${getTrendColor(prediction.trend)}`}>
            <TrendIcon className="w-6 h-6" />
            <p className="text-xl font-bold">
              {t[prediction.trend][lang]}
            </p>
          </div>
        </div>
      </div>

      {/* Impact Factors */}
      <div>
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-600" />
          {t.factors[lang]}
        </h4>
        <div className="space-y-2">
          {prediction.factors.slice(0, 5).map((factor: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-32 text-sm font-medium truncate">{factor.name}</div>
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-end px-2"
                  style={{ width: `${Math.min(100, factor.impact)}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {factor.impact.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {lang === 'ko' 
            ? '⚠️ AI 예측은 참고용이며, 실제 시장 상황과 다를 수 있습니다. 최종 의사결정 시 전문가와 상담하세요.'
            : '⚠️ AI predictions are for reference only and may differ from actual market conditions. Consult experts for final decisions.'}
        </p>
      </div>
    </div>
  );
};

export default MLPredictionPanel;
