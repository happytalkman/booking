import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle, CheckCircle2 as CheckCircle, Sparkles, ChevronRight, X } from 'lucide-react';
import { Language } from '../types';

interface Recommendation {
  action: 'book_now' | 'wait' | 'monitor';
  confidence: number;
  route: string;
  currentRate: number;
  predictedRate: number;
  timeframe: string;
  reasoning: string[];
  savings?: number;
}

interface BookingRecommendationProps {
  lang: Language;
}

const BookingRecommendation: React.FC<BookingRecommendationProps> = ({ lang }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedRec, setAppliedRec] = useState<Recommendation | null>(null);

  const t = {
    title: { ko: 'AI 부킹 추천', en: 'AI Booking Recommendations' },
    subtitle: { ko: '최적의 부킹 타이밍을 AI가 분석합니다', en: 'AI analyzes optimal booking timing' },
    bookNow: { ko: '지금 부킹', en: 'Book Now' },
    wait: { ko: '대기 권장', en: 'Wait Recommended' },
    monitor: { ko: '모니터링', en: 'Monitor' },
    confidence: { ko: '신뢰도', en: 'Confidence' },
    currentRate: { ko: '현재 운임', en: 'Current Rate' },
    predicted: { ko: '예상 운임', en: 'Predicted' },
    timeframe: { ko: '기간', en: 'Timeframe' },
    reasoning: { ko: '분석 근거', en: 'Reasoning' },
    potentialSavings: { ko: '예상 절감', en: 'Potential Savings' },
    viewDetails: { ko: '상세 보기', en: 'View Details' },
    applyRecommendation: { ko: '추천 적용', en: 'Apply Recommendation' },
    detailsTitle: { ko: '상세 분석 리포트', en: 'Detailed Analysis Report' },
    marketAnalysis: { ko: '시장 분석', en: 'Market Analysis' },
    riskFactors: { ko: '리스크 요인', en: 'Risk Factors' },
    historicalData: { ko: '과거 데이터', en: 'Historical Data' },
    recommendation: { ko: '추천 사항', en: 'Recommendation' },
    close: { ko: '닫기', en: 'Close' },
    successTitle: { ko: '추천이 적용되었습니다!', en: 'Recommendation Applied!' },
    successMessage: { ko: '부킹 시스템에 추천 사항이 전달되었습니다.', en: 'Recommendation has been sent to booking system.' },
    nextSteps: { ko: '다음 단계', en: 'Next Steps' },
    step1: { ko: '부킹 담당자가 검토합니다', en: 'Booking team will review' },
    step2: { ko: '최적 시점에 부킹을 진행합니다', en: 'Book at optimal timing' },
    step3: { ko: '결과를 이메일로 알려드립니다', en: 'Results will be emailed' },
    confirm: { ko: '확인', en: 'Confirm' }
  };

  useEffect(() => {
    // Simulate AI recommendation generation
    setTimeout(() => {
      setRecommendations([
        {
          action: 'book_now',
          confidence: 92,
          route: lang === 'ko' ? '한국-LA (서안)' : 'Korea-LA (West Coast)',
          currentRate: 2750,
          predictedRate: 2950,
          timeframe: lang === 'ko' ? '향후 2주' : 'Next 2 weeks',
          reasoning: lang === 'ko' 
            ? [
                '성수기 진입으로 운임 상승 예상 (+7.3%)',
                '파나마 운하 대기 시간 증가 추세',
                '경쟁사 3곳이 이미 가격 인상 발표',
                '현재 운임이 3개월 평균 대비 5% 낮음'
              ]
            : [
                'Peak season approaching, rate increase expected (+7.3%)',
                'Panama Canal wait time increasing',
                '3 competitors already announced price hikes',
                'Current rate 5% below 3-month average'
              ],
          savings: 200
        },
        {
          action: 'wait',
          confidence: 78,
          route: lang === 'ko' ? '한국-유럽 (북유럽)' : 'Korea-Europe (North)',
          currentRate: 4200,
          predictedRate: 3950,
          timeframe: lang === 'ko' ? '3-4주 후' : 'In 3-4 weeks',
          reasoning: lang === 'ko'
            ? [
                '홍해 우회 항로 정상화 조짐',
                '계절적 비수기 진입 예정',
                '선복 공급 증가 예상',
                '유가 하락 추세로 BAF 인하 가능성'
              ]
            : [
                'Red Sea route normalization signs',
                'Entering seasonal low season',
                'Vessel capacity increase expected',
                'Oil price decline may reduce BAF'
              ],
          savings: -250
        },
        {
          action: 'monitor',
          confidence: 65,
          route: lang === 'ko' ? '한국-중국' : 'Korea-China',
          currentRate: 850,
          predictedRate: 870,
          timeframe: lang === 'ko' ? '1-2주' : '1-2 weeks',
          reasoning: lang === 'ko'
            ? [
                '시장 변동성이 높은 상태',
                '중국 경기 지표 발표 대기 중',
                '환율 변동 가능성',
                '단기 예측 불확실성 높음'
              ]
            : [
                'High market volatility',
                'Awaiting China economic indicators',
                'Currency fluctuation possible',
                'Short-term prediction uncertainty high'
              ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [lang]);

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'book_now':
        return {
          label: t.bookNow[lang],
          color: 'bg-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-900 dark:text-green-100',
          icon: CheckCircle
        };
      case 'wait':
        return {
          label: t.wait[lang],
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-900 dark:text-blue-100',
          icon: Clock
        };
      case 'monitor':
        return {
          label: t.monitor[lang],
          color: 'bg-amber-500',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-900 dark:text-amber-100',
          icon: AlertCircle
        };
      default:
        return {
          label: '',
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
          <h3 className="text-lg font-bold">{t.title[lang]}</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-bold">{t.title[lang]}</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.subtitle[lang]}</p>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const config = getActionConfig(rec.action);
          const Icon = config.icon;
          const rateChange = rec.predictedRate - rec.currentRate;
          const rateChangePercent = ((rateChange / rec.currentRate) * 100).toFixed(1);

          return (
            <div
              key={index}
              className={`p-5 rounded-xl border-2 ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 ${config.color} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.confidence[lang]}: {rec.confidence}%
                    </span>
                  </div>
                  <h4 className={`text-lg font-bold ${config.textColor}`}>{rec.route}</h4>
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.currentRate[lang]}</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    {rec.currentRate.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {t.predicted[lang]} ({rec.timeframe})
                  </p>
                  <p className={`text-2xl font-bold flex items-center gap-1 ${rateChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {rateChange > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {rec.predictedRate.toLocaleString()}
                    <span className="text-sm">({rateChangePercent > 0 ? '+' : ''}{rateChangePercent}%)</span>
                  </p>
                </div>
              </div>

              {/* Savings */}
              {rec.savings && rec.savings > 0 && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    💰 {t.potentialSavings[lang]}: ${rec.savings}/FEU
                  </p>
                </div>
              )}

              {/* Reasoning */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{t.reasoning[lang]}:</p>
                <ul className="space-y-1">
                  {rec.reasoning.map((reason, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setAppliedRec(rec);
                    setShowSuccessModal(true);
                  }}
                  className={`flex-1 py-2 ${config.color} text-white rounded-lg font-semibold text-sm hover:opacity-90 transition`}
                >
                  {t.applyRecommendation[lang]}
                </button>
                <button 
                  onClick={() => {
                    setSelectedRec(rec);
                    setShowDetailsModal(true);
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  {t.viewDetails[lang]}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRec && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => setShowDetailsModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{t.detailsTitle[lang]}</h2>
                    <p className="text-indigo-100">{selectedRec.route}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Market Analysis */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    {t.marketAnalysis[lang]}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.currentRate[lang]}</p>
                      <p className="text-2xl font-bold">${selectedRec.currentRate.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.predicted[lang]}</p>
                      <p className="text-2xl font-bold">${selectedRec.predictedRate.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.confidence[lang]}</p>
                      <p className="text-2xl font-bold">{selectedRec.confidence}%</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.timeframe[lang]}</p>
                      <p className="text-xl font-bold">{selectedRec.timeframe}</p>
                    </div>
                  </div>
                </div>

                {/* Historical Data */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    {t.historicalData[lang]}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm">{lang === 'ko' ? '3개월 평균' : '3-Month Average'}</span>
                      <span className="font-bold">${(selectedRec.currentRate * 1.05).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm">{lang === 'ko' ? '6개월 평균' : '6-Month Average'}</span>
                      <span className="font-bold">${(selectedRec.currentRate * 1.08).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm">{lang === 'ko' ? '전년 동기' : 'Same Period Last Year'}</span>
                      <span className="font-bold">${(selectedRec.currentRate * 0.92).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-indigo-600" />
                    {t.riskFactors[lang]}
                  </h3>
                  <div className="space-y-2">
                    {selectedRec.action === 'book_now' && (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{lang === 'ko' ? '낮은 리스크: 안정적인 시장 상황' : 'Low Risk: Stable market conditions'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{lang === 'ko' ? '높은 확실성: 명확한 상승 신호' : 'High Certainty: Clear upward signals'}</span>
                        </div>
                      </>
                    )}
                    {selectedRec.action === 'wait' && (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{lang === 'ko' ? '중간 리스크: 시장 변동 가능' : 'Medium Risk: Market fluctuation possible'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{lang === 'ko' ? '대기 가치: 하락 가능성 높음' : 'Wait Value: High probability of decline'}</span>
                        </div>
                      </>
                    )}
                    {selectedRec.action === 'monitor' && (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-sm">{lang === 'ko' ? '높은 불확실성: 추가 정보 필요' : 'High Uncertainty: More data needed'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-sm">{lang === 'ko' ? '주의 필요: 시장 모니터링 권장' : 'Caution: Market monitoring recommended'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Recommendation Summary */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    {t.recommendation[lang]}
                  </h3>
                  <ul className="space-y-2">
                    {selectedRec.reasoning.map((reason, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {t.close[lang]}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && appliedRec && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
              {/* Success Icon */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t.successTitle[lang]}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{t.successMessage[lang]}</p>

                {/* Applied Recommendation */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mb-6 text-left">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{lang === 'ko' ? '적용된 추천' : 'Applied Recommendation'}</p>
                  <p className="font-bold text-lg mb-1">{appliedRec.route}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {getActionConfig(appliedRec.action).label} • ${appliedRec.currentRate.toLocaleString()}
                  </p>
                </div>

                {/* Next Steps */}
                <div className="text-left mb-6">
                  <h3 className="font-bold mb-3">{t.nextSteps[lang]}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">1</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{t.step1[lang]}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{t.step2[lang]}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">3</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{t.step3[lang]}</p>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {t.confirm[lang]}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingRecommendation;
