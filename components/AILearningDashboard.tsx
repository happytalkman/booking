import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Target, Zap, BarChart3, Clock, CheckCircle2 as CheckCircle, AlertCircle, X } from 'lucide-react';
import { aiLearningService, ModelComparison, OnlineLearningMetrics, SeasonalPattern } from '../services/aiLearningService';

interface AILearningDashboardProps {
  lang: 'ko' | 'en';
}

const AILearningDashboard: React.FC<AILearningDashboardProps> = ({ lang }) => {
  const [models, setModels] = useState<ModelComparison[]>([]);
  const [metrics, setMetrics] = useState<OnlineLearningMetrics | null>(null);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [bestModel, setBestModel] = useState<ModelComparison | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const t = {
    title: { ko: 'AI 학습 현황', en: 'AI Learning Status' },
    onlineLearning: { ko: '온라인 학습', en: 'Online Learning' },
    modelComparison: { ko: '모델 비교', en: 'Model Comparison' },
    seasonalPatterns: { ko: '계절성 패턴', en: 'Seasonal Patterns' },
    bestModel: { ko: '최고 성능 모델', en: 'Best Model' },
    accuracy: { ko: '정확도', en: 'Accuracy' },
    speed: { ko: '속도', en: 'Speed' },
    memory: { ko: '메모리', en: 'Memory' },
    active: { ko: '활성', en: 'Active' },
    inactive: { ko: '비활성', en: 'Inactive' },
    totalPredictions: { ko: '총 예측 수', en: 'Total Predictions' },
    correctPredictions: { ko: '정확한 예측', en: 'Correct Predictions' },
    learningRate: { ko: '학습률', en: 'Learning Rate' },
    trend: { ko: '성능 추세', en: 'Performance Trend' },
    improving: { ko: '개선 중', en: 'Improving' },
    stable: { ko: '안정', en: 'Stable' },
    declining: { ko: '하락', en: 'Declining' },
    lastUpdate: { ko: '마지막 업데이트', en: 'Last Update' },
    confidence: { ko: '신뢰도', en: 'Confidence' },
    month: { ko: '월', en: 'Month' },
    factor: { ko: '계수', en: 'Factor' },
    close: { ko: '닫기', en: 'Close' }
  };

  const monthNames = {
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const updateData = () => {
    setModels(aiLearningService.getModelComparisons());
    setMetrics(aiLearningService.getOnlineLearningMetrics());
    setSeasonalPatterns(aiLearningService.getSeasonalPatterns());
    setBestModel(aiLearningService.getBestModel());
    
    // 실시간 업데이트 시뮬레이션
    aiLearningService.simulateRealTimeUpdate();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (accuracy >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="relative">
      {/* AI Learning Status Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-lg transition-all shadow-sm ${
          bestModel && bestModel.accuracy >= 0.9
            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'
            : bestModel && bestModel.accuracy >= 0.8
            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
        }`}
        title={`AI Learning: ${bestModel ? (bestModel.accuracy * 100).toFixed(1) : '0'}% accuracy`}
      >
        <Brain className="w-5 h-5" />
      </button>

      {/* AI Learning Dashboard */}
      {isVisible && (
        <div className="absolute top-12 right-0 w-[520px] max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t.title[lang]}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {lang === 'ko' ? '실시간 AI 모델 성능 모니터링 & 최적화' : 'Real-time AI Model Performance Monitoring & Optimization'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-2"
                title={t.close[lang]}
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Best Model Highlight */}
            {bestModel && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full -mr-10 -mt-10 opacity-20"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">{t.bestModel[lang]}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      {bestModel.name}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getAccuracyColor(bestModel.accuracy)} transition-all duration-500`}>
                      {(bestModel.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{t.accuracy[lang]}</div>
                    <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1 mt-1">
                      <div 
                        className="bg-green-600 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${bestModel.accuracy * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {bestModel.speed.toFixed(1)}ms
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{t.speed[lang]}</div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.max(0, 100 - bestModel.speed / 10)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {bestModel.memoryUsage.toFixed(0)}MB
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{t.memory[lang]}</div>
                    <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1 mt-1">
                      <div 
                        className="bg-purple-600 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.max(0, 100 - bestModel.memoryUsage / 5)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Online Learning Metrics */}
            {metrics && (
              <div>
                <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  {t.onlineLearning[lang]}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-blue-600 dark:text-blue-400">{t.totalPredictions[lang]}</div>
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {metrics.totalPredictions.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-green-600 dark:text-green-400">{t.correctPredictions[lang]}</div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {metrics.correctPredictions.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {((metrics.correctPredictions / metrics.totalPredictions) * 100).toFixed(1)}% {t.accuracy[lang]}
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-purple-600 dark:text-purple-400">{t.learningRate[lang]}</div>
                      <Target className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      {(metrics.learningRate * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{t.trend[lang]}</div>
                      {getTrendIcon(metrics.performanceTrend)}
                    </div>
                    <div className={`text-lg font-bold ${getTrendColor(metrics.performanceTrend)}`}>
                      {t[metrics.performanceTrend as keyof typeof t][lang]}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {t.lastUpdate[lang]}: {metrics.lastModelUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Model Comparison */}
            {models.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  {t.modelComparison[lang]}
                </h4>
                <div className="space-y-3">
                  {models.slice(0, 3).map((model, index) => (
                    <div key={model.modelId} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            model.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{model.name}</span>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                              #1
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          model.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                        }`}>
                          {model.isActive ? t.active[lang] : t.inactive[lang]}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">{t.accuracy[lang]}</div>
                          <div className={`font-bold ${getAccuracyColor(model.accuracy)}`}>
                            {(model.accuracy * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">{t.speed[lang]}</div>
                          <div className="font-bold text-blue-600 dark:text-blue-400">
                            {model.speed.toFixed(1)}ms
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">{t.memory[lang]}</div>
                          <div className="font-bold text-purple-600 dark:text-purple-400">
                            {model.memoryUsage.toFixed(0)}MB
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seasonal Patterns */}
            {seasonalPatterns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  {t.seasonalPatterns[lang]}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {seasonalPatterns.slice(0, 4).map((pattern, index) => (
                    <div key={index} className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          {monthNames[lang][pattern.month - 1]}
                        </span>
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {t.confidence[lang]}: {(pattern.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                        {pattern.seasonalFactor.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningDashboard;