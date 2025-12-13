import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, Clock, DollarSign, Shield, Zap, 
  BookOpen, CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  AlertTriangle, Target, Lightbulb, ArrowRight, Star,
  Calendar, MapPin, TrendingDown, Award, X
} from 'lucide-react';
import { intelligentRecommendationEngine } from '../services/intelligentRecommendationEngine';
import { Language } from '../types';

interface SmartRecommendationCenterProps {
  lang: Language;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface SmartRecommendation {
  id: string;
  type: 'booking' | 'route' | 'timing' | 'cost' | 'risk' | 'feature' | 'learning';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  impact: {
    cost: number;
    time: number;
    risk: number;
  };
  reasoning: string[];
  actionItems: any[];
  validUntil: Date;
  category: string;
  tags: string[];
}

const SmartRecommendationCenter: React.FC<SmartRecommendationCenterProps> = ({ 
  lang, 
  isOpen = false, 
  onToggle 
}) => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());

  const t = {
    title: { ko: '스마트 추천 센터', en: 'Smart Recommendation Center' },
    subtitle: { ko: 'AI 기반 개인화된 추천으로 최적의 의사결정을 지원합니다', en: 'AI-powered personalized recommendations for optimal decision making' },
    loading: { ko: '추천 분석 중...', en: 'Analyzing recommendations...' },
    noRecommendations: { ko: '현재 추천 사항이 없습니다', en: 'No recommendations available' },
    
    // Categories
    all: { ko: '전체', en: 'All' },
    booking: { ko: '부킹', en: 'Booking' },
    route: { ko: '항로', en: 'Route' },
    timing: { ko: '타이밍', en: 'Timing' },
    cost: { ko: '비용', en: 'Cost' },
    risk: { ko: '리스크', en: 'Risk' },
    feature: { ko: '기능', en: 'Feature' },
    learning: { ko: '학습', en: 'Learning' },
    
    // Priority
    critical: { ko: '긴급', en: 'Critical' },
    high: { ko: '높음', en: 'High' },
    medium: { ko: '보통', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Actions
    apply: { ko: '적용하기', en: 'Apply' },
    dismiss: { ko: '무시하기', en: 'Dismiss' },
    viewDetails: { ko: '상세보기', en: 'View Details' },
    hideDetails: { ko: '접기', en: 'Hide Details' },
    helpful: { ko: '도움됨', en: 'Helpful' },
    notHelpful: { ko: '도움안됨', en: 'Not Helpful' },
    
    // Impact
    costSaving: { ko: '비용 절감', en: 'Cost Saving' },
    timeSaving: { ko: '시간 절약', en: 'Time Saving' },
    riskReduction: { ko: '리스크 감소', en: 'Risk Reduction' },
    
    // Labels
    confidence: { ko: '신뢰도', en: 'Confidence' },
    validUntil: { ko: '유효기간', en: 'Valid Until' },
    reasoning: { ko: '근거', en: 'Reasoning' },
    actionItems: { ko: '실행 항목', en: 'Action Items' },
    impact: { ko: '예상 효과', en: 'Expected Impact' }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = await intelligentRecommendationEngine.generateRecommendations('user1');
      setRecommendations(recs as SmartRecommendation[]);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return BookOpen;
      case 'route': return MapPin;
      case 'timing': return Clock;
      case 'cost': return DollarSign;
      case 'risk': return Shield;
      case 'feature': return Zap;
      case 'learning': return Lightbulb;
      default: return Target;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'route': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'timing': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'cost': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'risk': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'feature': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      case 'learning': return 'text-teal-600 bg-teal-100 dark:bg-teal-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleApply = async (rec: SmartRecommendation) => {
    setAppliedRecs(prev => new Set([...prev, rec.id]));
    await intelligentRecommendationEngine.recordFeedback('user1', rec.id, 'applied');
  };

  const handleFeedback = async (rec: SmartRecommendation, feedback: 'helpful' | 'not_helpful') => {
    await intelligentRecommendationEngine.recordFeedback('user1', rec.id, feedback);
  };

  const filteredRecommendations = recommendations.filter(rec => 
    selectedCategory === 'all' || rec.type === selectedCategory
  );

  const categories = ['all', ...new Set(recommendations.map(r => r.type))];

  // 컴팩트 버튼 모드
  if (!isOpen) {
    const urgentCount = recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length;
    
    return (
      <button
        onClick={onToggle}
        className="relative p-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300"
        title={t.title[lang]}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">추천</span>
        </div>
        
        {/* 긴급 추천 개수 표시 */}
        {urgentCount > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            {urgentCount}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-6xl w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.title[lang]}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.subtitle[lang]}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadRecommendations}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Target className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t.loading[lang] : '새로고침'}
          </button>
          
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 필터 */}
      {recommendations.length > 0 && (
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {t[category as keyof typeof t]?.[lang] || category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 추천 목록 */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg">
              <Target className="w-5 h-5 animate-spin" />
              <span className="font-medium">{t.loading[lang]}</span>
            </div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">{t.noRecommendations[lang]}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => {
              const TypeIcon = getTypeIcon(rec.type);
              const isExpanded = expandedRec === rec.id;
              const isApplied = appliedRecs.has(rec.id);
              
              return (
                <div
                  key={rec.id}
                  className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 transition-all duration-300 ${
                    isApplied 
                      ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  {/* 메인 카드 */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-3 rounded-lg ${getTypeColor(rec.type)}`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                              {rec.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                              {t[rec.priority as keyof typeof t]?.[lang]}
                            </span>
                            {isApplied && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                적용됨
                              </div>
                            )}
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-400 mb-3">
                            {rec.description}
                          </p>
                          
                          {/* 영향도 표시 */}
                          <div className="flex flex-wrap gap-4 mb-3">
                            {rec.impact.cost !== 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className={`w-4 h-4 ${rec.impact.cost < 0 ? 'text-green-600' : 'text-red-600'}`} />
                                <span className={`text-sm font-medium ${rec.impact.cost < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {rec.impact.cost < 0 ? '-' : '+'}${Math.abs(rec.impact.cost)}
                                </span>
                              </div>
                            )}
                            
                            {rec.impact.time !== 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className={`w-4 h-4 ${rec.impact.time > 0 ? 'text-green-600' : 'text-red-600'}`} />
                                <span className={`text-sm font-medium ${rec.impact.time > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {rec.impact.time > 0 ? '+' : ''}{Math.abs(rec.impact.time)}분
                                </span>
                              </div>
                            )}
                            
                            {rec.impact.risk !== 0 && (
                              <div className="flex items-center gap-1">
                                <Shield className={`w-4 h-4 ${rec.impact.risk < 0 ? 'text-green-600' : 'text-red-600'}`} />
                                <span className={`text-sm font-medium ${rec.impact.risk < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  리스크 {rec.impact.risk < 0 ? '감소' : '증가'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* 신뢰도 및 유효기간 */}
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span>{t.confidence[lang]}: {(rec.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{t.validUntil[lang]}: {new Date(rec.validUntil).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!isApplied && (
                          <button
                            onClick={() => handleApply(rec)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t.apply[lang]}
                          </button>
                        )}
                        
                        <button
                          onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          {isExpanded ? t.hideDetails[lang] : t.viewDetails[lang]}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(rec, 'helpful')}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title={t.helpful[lang]}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(rec, 'not_helpful')}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title={t.notHelpful[lang]}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 상세 정보 (확장 시) */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 근거 */}
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                            {t.reasoning[lang]}
                          </h5>
                          <ul className="space-y-2">
                            {rec.reasoning.map((reason, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 실행 항목 */}
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            {t.actionItems[lang]}
                          </h5>
                          <div className="space-y-2">
                            {rec.actionItems.map((action, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <div className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${
                                  action.completed ? 'bg-green-500' : 'bg-slate-400'
                                }`}></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {action.description}
                                  </p>
                                  {action.deadline && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      마감: {new Date(action.deadline).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 태그 */}
                      {rec.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex flex-wrap gap-2">
                            {rec.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRecommendationCenter;