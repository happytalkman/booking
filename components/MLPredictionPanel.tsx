import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Target, AlertCircle, BarChart3, Settings, Zap, Cloud, DollarSign, Globe, Activity, TestTube } from 'lucide-react';
import { Language } from '../types';
import { mlPredictionService } from '../services/mlPrediction';
import { advancedPredictionService, PredictionResult, PredictionModel, ExternalDataSource } from '../services/advancedPredictionService';

interface MLPredictionPanelProps {
  lang: Language;
}

const MLPredictionPanel: React.FC<MLPredictionPanelProps> = ({ lang }) => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('ensemble_v1');
  const [availableModels, setAvailableModels] = useState<PredictionModel[]>([]);
  const [externalData, setExternalData] = useState<ExternalDataSource | null>(null);
  const [activeTab, setActiveTab] = useState<'prediction' | 'models' | 'external' | 'abtest'>('prediction');
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [accuracyMetrics, setAccuracyMetrics] = useState<any>(null);

  const t = {
    title: { ko: '고급 AI 운임 예측', en: 'Advanced AI Rate Prediction' },
    subtitle: { ko: '다중 변수 머신러닝 기반 예측', en: 'Multi-variable ML-based forecasting' },
    predicted: { ko: '예측 운임', en: 'Predicted Rate' },
    confidence: { ko: '예측 신뢰도', en: 'Confidence' },
    trend: { ko: '예상 추세', en: 'Expected Trend' },
    volatility: { ko: '변동성', en: 'Volatility' },
    rising: { ko: '상승', en: 'Rising' },
    falling: { ko: '하락', en: 'Falling' },
    stable: { ko: '안정', en: 'Stable' },
    factors: { ko: '영향 요인', en: 'Impact Factors' },
    modelAccuracy: { ko: '모델 정확도', en: 'Model Accuracy' },
    loading: { ko: 'AI 모델 로딩 중...', en: 'Loading AI model...' },
    route: { ko: '한국-LA (서안)', en: 'Korea-LA (West)' },
    
    // New translations
    confidenceInterval: { ko: '신뢰 구간', en: 'Confidence Interval' },
    scenarios: { ko: '시나리오 분석', en: 'Scenario Analysis' },
    optimistic: { ko: '낙관적', en: 'Optimistic' },
    realistic: { ko: '현실적', en: 'Realistic' },
    pessimistic: { ko: '비관적', en: 'Pessimistic' },
    externalFactors: { ko: '외부 요인', en: 'External Factors' },
    modelComparison: { ko: '모델 비교', en: 'Model Comparison' },
    abTesting: { ko: 'A/B 테스트', en: 'A/B Testing' },
    dataQuality: { ko: '데이터 품질', en: 'Data Quality' },
    
    // External factors
    weather: { ko: '날씨', en: 'Weather' },
    oilPrice: { ko: '유가', en: 'Oil Price' },
    exchangeRate: { ko: '환율', en: 'Exchange Rate' },
    economic: { ko: '경제 지표', en: 'Economic Indicators' },
    geopolitical: { ko: '지정학적', en: 'Geopolitical' },
    
    // Tabs
    prediction: { ko: '예측', en: 'Prediction' },
    models: { ko: '모델', en: 'Models' },
    external: { ko: '외부 데이터', en: 'External Data' },
    abtest: { ko: 'A/B 테스트', en: 'A/B Test' },
    
    // Model types
    linear: { ko: '선형 회귀', en: 'Linear Regression' },
    neural: { ko: '신경망', en: 'Neural Network' },
    ensemble: { ko: '앙상블', en: 'Ensemble' },
    transformer: { ko: '트랜스포머', en: 'Transformer' },
    
    // Metrics
    accuracy: { ko: '정확도', en: 'Accuracy' },
    precision: { ko: '정밀도', en: 'Precision' },
    recall: { ko: '재현율', en: 'Recall' },
    f1Score: { ko: 'F1 점수', en: 'F1 Score' },
    mape: { ko: 'MAPE', en: 'MAPE' },
    
    // Data quality
    completeness: { ko: '완전성', en: 'Completeness' },
    freshness: { ko: '신선도', en: 'Freshness' },
    reliability: { ko: '신뢰성', en: 'Reliability' }
  };

  useEffect(() => {
    loadPrediction();
    loadModels();
    loadExternalData();
    loadAccuracyMetrics();
  }, [selectedModel]);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const result = await advancedPredictionService.predictWithMultipleVariables('kr-la', 30, selectedModel);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = () => {
    const models = advancedPredictionService.getAvailableModels();
    setAvailableModels(models);
  };

  const loadExternalData = () => {
    const data = advancedPredictionService.getExternalData();
    setExternalData(data);
  };

  const loadAccuracyMetrics = () => {
    const metrics = advancedPredictionService.calculateAccuracyMetrics(selectedModel);
    setAccuracyMetrics(metrics);
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
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400">{t.loading[lang]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const TrendIcon = getTrendIcon(prediction.trend);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold">{t.title[lang]}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
          </div>
          
          {/* Model Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-200 text-sm"
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} (v{model.version})
                </option>
              ))}
            </select>
            
            {accuracyMetrics && (
              <div className="px-3 py-1 bg-purple-900/30 rounded-full">
                <p className="text-xs font-semibold text-purple-300">
                  {t.accuracy[lang]}: {(accuracyMetrics.accuracy * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex space-x-8">
            {(['prediction', 'models', 'external', 'abtest'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {t[tab][lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'prediction' && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
          {/* Main Prediction Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-800/50">
              <p className="text-xs text-purple-400 mb-1">{t.predicted[lang]}</p>
              <p className="text-2xl font-bold text-purple-200">
                ${prediction.predictedRate.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800/50">
              <p className="text-xs text-blue-400 mb-1">{t.confidence[lang]}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-blue-200">
                  {(prediction.confidenceInterval.confidence * 100).toFixed(0)}%
                </p>
                {prediction.confidenceInterval.confidence >= 0.8 && (
                  <Target className="w-5 h-5 text-green-400" />
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">{t.trend[lang]}</p>
              <div className={`flex items-center gap-2 ${getTrendColor(prediction.trend)}`}>
                <TrendIcon className="w-6 h-6" />
                <p className="text-xl font-bold">
                  {t[prediction.trend][lang]}
                </p>
              </div>
            </div>

            <div className="p-4 bg-orange-900/30 rounded-lg border border-orange-800/50">
              <p className="text-xs text-orange-400 mb-1">{t.volatility[lang]}</p>
              <p className="text-2xl font-bold text-orange-200">
                {(prediction.volatility * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Confidence Interval */}
          {showConfidenceInterval && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  {t.confidenceInterval[lang]}
                </h4>
                <button
                  onClick={() => setShowConfidenceInterval(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-400 font-semibold">
                  ${prediction.confidenceInterval.lower.toLocaleString()}
                </span>
                <span className="text-purple-400 font-bold text-lg">
                  ${prediction.predictedRate.toLocaleString()}
                </span>
                <span className="text-green-400 font-semibold">
                  ${prediction.confidenceInterval.upper.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 via-purple-500 to-green-400"></div>
              </div>
            </div>
          )}

          {/* Scenario Analysis */}
          <div className="mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" />
              {t.scenarios[lang]}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-green-900/30 rounded-lg text-center border border-green-800/50">
                <p className="text-xs text-green-400 mb-1">{t.optimistic[lang]}</p>
                <p className="text-lg font-bold text-green-300">
                  ${prediction.scenarios.optimistic.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-lg text-center border border-blue-800/50">
                <p className="text-xs text-blue-400 mb-1">{t.realistic[lang]}</p>
                <p className="text-lg font-bold text-blue-300">
                  ${prediction.scenarios.realistic.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-lg text-center border border-red-800/50">
                <p className="text-xs text-red-400 mb-1">{t.pessimistic[lang]}</p>
                <p className="text-lg font-bold text-red-300">
                  ${prediction.scenarios.pessimistic.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Impact Factors */}
          <div className="mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-600" />
              {t.factors[lang]}
            </h4>
            <div className="space-y-3">
              {prediction.factors.map((factor, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium truncate">{factor.name}</div>
                  <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end px-2 ${
                        factor.direction === 'positive' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, factor.impact * 10)}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        {factor.impact.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-xs text-center">
                    <span className={`px-2 py-1 rounded-full ${
                      factor.direction === 'positive' 
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {factor.direction === 'positive' ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Metrics */}
          <div className="mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-600" />
              Model Performance
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-700/50 rounded-lg text-center border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">{t.accuracy[lang]}</p>
                <p className="text-sm font-bold text-slate-200">{(prediction.modelMetrics.accuracy * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">{t.precision[lang]}</p>
                <p className="text-sm font-bold text-slate-200">{(prediction.modelMetrics.precision * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">{t.recall[lang]}</p>
                <p className="text-sm font-bold text-slate-200">{(prediction.modelMetrics.recall * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">{t.f1Score[lang]}</p>
                <p className="text-sm font-bold text-slate-200">{(prediction.modelMetrics.f1Score * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">{t.mape[lang]}</p>
                <p className="text-sm font-bold text-slate-200">{prediction.modelMetrics.mape.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Data Quality */}
          <div className="mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-600" />
              {t.dataQuality[lang]}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-800/50">
                <p className="text-xs text-blue-400 mb-1">{t.completeness[lang]}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-800 rounded-full h-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${prediction.dataQuality.completeness * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-blue-300">
                    {(prediction.dataQuality.completeness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-900/30 rounded-lg border border-green-800/50">
                <p className="text-xs text-green-400 mb-1">{t.freshness[lang]}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-800 rounded-full h-2">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${prediction.dataQuality.freshness * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-green-300">
                    {(prediction.dataQuality.freshness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-800/50">
                <p className="text-xs text-purple-400 mb-1">{t.reliability[lang]}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-purple-800 rounded-full h-2">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${prediction.dataQuality.reliability * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-purple-300">
                    {(prediction.dataQuality.reliability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-900/30 rounded-lg border border-amber-800/50">
            <p className="text-xs text-amber-300">
              {lang === 'ko' 
                ? '⚠️ AI 예측은 참고용이며, 실제 시장 상황과 다를 수 있습니다. 최종 의사결정 시 전문가와 상담하세요.'
                : '⚠️ AI predictions are for reference only and may differ from actual market conditions. Consult experts for final decisions.'}
            </p>
          </div>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            {t.modelComparison[lang]}
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {availableModels.map(model => (
              <div 
                key={model.id} 
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedModel === model.id 
                    ? 'border-purple-400 bg-purple-900/30' 
                    : 'border-slate-700 hover:border-purple-500'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold">{model.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    model.type === 'transformer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    model.type === 'ensemble' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    model.type === 'neural' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {t[model.type][lang]}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Version {model.version} • Accuracy: {(model.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Last trained: {model.lastTrained.toLocaleDateString()}
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${model.accuracy * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold">{(model.accuracy * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Data Tab */}
      {activeTab === 'external' && externalData && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            {t.externalFactors[lang]}
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <h5 className="font-bold">{t.weather[lang]}</h5>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600 font-medium">{externalData.weather.source}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {externalData.weather.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-semibold">{externalData.weather.temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Storm Risk:</span>
                  <span className="font-semibold text-red-600">{(externalData.weather.stormRisk * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind Speed:</span>
                  <span className="font-semibold">{externalData.weather.windSpeed.toFixed(1)} km/h</span>
                </div>
              </div>
            </div>

            {/* Oil Price */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <h5 className="font-bold">{t.oilPrice[lang]}</h5>
                </div>
                <div className="text-right">
                  <div className="text-xs text-orange-600 font-medium">{externalData.oilPrice.source}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {externalData.oilPrice.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Brent:</span>
                  <span className="font-semibold">${externalData.oilPrice.brent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>WTI:</span>
                  <span className="font-semibold">${externalData.oilPrice.wti.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trend:</span>
                  <span className={`font-semibold ${
                    externalData.oilPrice.trend === 'rising' ? 'text-red-600' :
                    externalData.oilPrice.trend === 'falling' ? 'text-green-600' :
                    'text-slate-600'
                  }`}>
                    {externalData.oilPrice.trend}
                  </span>
                </div>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h5 className="font-bold">{t.exchangeRate[lang]}</h5>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">{externalData.exchangeRate.source}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {externalData.exchangeRate.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>USD/KRW:</span>
                  <span className="font-semibold">₩{externalData.exchangeRate.usdKrw.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EUR/KRW:</span>
                  <span className="font-semibold">₩{externalData.exchangeRate.eurKrw.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volatility:</span>
                  <span className="font-semibold">{(externalData.exchangeRate.volatility * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Economic Indicators */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h5 className="font-bold">{t.economic[lang]}</h5>
                </div>
                <div className="text-right">
                  <div className="text-xs text-purple-600 font-medium">{externalData.economicIndicators.source}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {externalData.economicIndicators.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>GDP Growth:</span>
                  <span className="font-semibold">{externalData.economicIndicators.gdpGrowth.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Inflation:</span>
                  <span className="font-semibold">{externalData.economicIndicators.inflation.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Trade Volume:</span>
                  <span className="font-semibold">{externalData.economicIndicators.tradeVolume.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Geopolitical Risk */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h5 className="font-bold">{t.geopolitical[lang]}</h5>
                </div>
                <div className="text-right">
                  <div className="text-xs text-red-600 font-medium">{externalData.geopolitical.source}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {externalData.geopolitical.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Risk Score:</span>
                    <span className="font-semibold text-red-600">{(externalData.geopolitical.riskScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Active Events:</span>
                    {externalData.geopolitical.events.slice(0, 2).map((event, i) => (
                      <div key={i} className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                        {event}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Regional Risk:</span>
                  <div className="space-y-1">
                    {Object.entries(externalData.geopolitical.regions).map(([region, risk]) => (
                      <div key={region} className="flex justify-between text-xs">
                        <span>{region}:</span>
                        <span className="font-semibold">{(risk * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A/B Testing Tab */}
      {activeTab === 'abtest' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold flex items-center gap-2">
              <TestTube className="w-5 h-5 text-indigo-600" />
              {t.abTesting[lang]}
            </h4>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Start New Test
            </button>
          </div>
          
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>A/B Testing feature coming soon...</p>
            <p className="text-sm mt-2">Compare different models and track their performance over time.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLPredictionPanel;
