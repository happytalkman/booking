/**
 * AI Insight Card Component
 * AI 기반 자동 인사이트 생성
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronRight, X, CheckCircle2 as CheckCircle, Loader, ArrowRight, Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { actionService, ActionResult } from '../services/actionService';
import { reportService } from '../services/reportService';
import { Language } from '../types';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: { ko: string; en: string };
}

interface AIInsightCardProps {
  lang?: Language;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ lang = 'ko' }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    // AI 인사이트 생성 시뮬레이션
    setTimeout(() => {
      setInsights([
        {
          id: '1',
          type: 'success',
          title: { 
            ko: '이번 주 매출 15% 증가', 
            en: 'Revenue Up 15% This Week' 
          },
          description: { 
            ko: '한중 항로의 부킹이 급증하면서 전주 대비 매출이 15% 상승했습니다. 주요 원인은 삼성전자의 대량 부킹(+45%)과 LG화학의 정기 계약 갱신입니다.', 
            en: 'Revenue increased 15% week-over-week due to surge in Korea-China route bookings. Main drivers: Samsung Electronics bulk booking (+45%) and LG Chem contract renewal.' 
          },
          impact: 'high',
          actionable: true,
          recommendation: { 
            ko: '현재 추세를 유지하기 위해 VIP 고객 대상 프로모션을 연장하고, 한중 항로 추가 선박 투입을 검토하세요.', 
            en: 'Extend VIP customer promotions and consider deploying additional vessels on Korea-China route to maintain current momentum.' 
          },
        },
        {
          id: '2',
          type: 'warning',
          title: { 
            ko: '다음 달 적재율 하락 예상', 
            en: 'Load Factor Drop Expected' 
          },
          description: { 
            ko: 'AI 모델이 12월 3주차부터 적재율이 평균 8% 하락할 것으로 예측합니다. 계절적 요인과 중국 춘절 준비 기간이 주요 원인입니다.', 
            en: 'AI model predicts 8% average load factor decline starting week 3 of December. Seasonal factors and Chinese New Year preparation period are main causes.' 
          },
          impact: 'high',
          actionable: true,
          recommendation: { 
            ko: '선제적으로 스팟 운임을 5-7% 인하하고, 신규 화주 유치 캠페인을 시작하세요. 예상 손실: $120K, 조치 시 $45K로 감소 가능.', 
            en: 'Proactively reduce spot rates by 5-7% and launch new shipper acquisition campaign. Expected loss: $120K, reducible to $45K with action.' 
          },
        },
        {
          id: '3',
          type: 'opportunity',
          title: { 
            ko: '현대자동차 부킹 패턴 변화 감지', 
            en: 'Hyundai Motor Booking Pattern Change' 
          },
          description: { 
            ko: '현대자동차의 부킹 주기가 14일에서 10일로 단축되었습니다. 이는 생산량 증가 신호일 가능성이 높습니다 (신뢰도 89%).', 
            en: 'Hyundai Motor booking cycle shortened from 14 to 10 days. Likely indicates production volume increase (89% confidence).' 
          },
          impact: 'medium',
          actionable: true,
          recommendation: { 
            ko: '영업팀에 즉시 연락하여 장기 계약 확대 또는 물량 증대 협상을 시작하세요. 예상 추가 매출: $280K/월', 
            en: 'Contact sales team immediately to initiate long-term contract expansion or volume increase negotiation. Expected additional revenue: $280K/month' 
          },
        },
        {
          id: '4',
          type: 'info',
          title: { 
            ko: '경쟁사 운임 인하 트렌드', 
            en: 'Competitor Rate Reduction Trend' 
          },
          description: { 
            ko: 'Maersk와 MSC가 한미 서안 항로 운임을 평균 3.5% 인하했습니다. 시장 점유율 방어를 위한 대응이 필요합니다.', 
            en: 'Maersk and MSC reduced Korea-US West Coast route rates by average 3.5%. Response needed to defend market share.' 
          },
          impact: 'medium',
          actionable: true,
          recommendation: { 
            ko: '동일 수준의 운임 조정 또는 부가 서비스 강화로 대응하세요. 현재 점유율 유지 시 월 $95K 손실 예상.', 
            en: 'Respond with equivalent rate adjustment or enhanced value-added services. Expected monthly loss of $95K if current share maintained.' 
          },
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'opportunity':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[impact as keyof typeof colors];
  };

  /**
   * 조치 실행 핸들러
   */
  const handleExecuteAction = async () => {
    if (!selectedInsight) return;

    setActionLoading(true);
    try {
      const result = await actionService.executeAction(
        selectedInsight.id,
        selectedInsight.type,
        selectedInsight.title
      );
      setActionResult(result);
      
      // 3초 후 자동으로 상세 결과 표시
      setTimeout(() => {
        setShowResultModal(true);
      }, 2000);
    } catch (error) {
      console.error('Action execution failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const t = {
    title: { ko: 'AI 인사이트', en: 'AI Insights' },
    subtitle: { ko: '실시간 자동 분석 및 추천', en: 'Real-time Analysis & Recommendations' },
    found: { ko: '개 발견', en: ' Found' },
    actionable: { ko: '조치 가능', en: 'Actionable' },
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    detailAnalysis: { ko: '상세 분석', en: 'Detailed Analysis' },
    aiRecommendation: { ko: 'AI 추천 조치', en: 'AI Recommendation' },
    startAction: { ko: '조치 시작하기', en: 'Start Action' },
    later: { ko: '나중에', en: 'Later' },
    processing: { ko: '처리 중...', en: 'Processing...' },
    actionComplete: { ko: '조치 완료!', en: 'Action Complete!' },
    viewDetails: { ko: '상세 결과 보기', en: 'View Details' },
    close: { ko: '닫기', en: 'Close' },
    impact: { ko: '영향도', en: 'Impact' },
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.title[lang]}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.title[lang]}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
            {insights.length}{t.found[lang]}
          </span>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)} cursor-pointer hover:shadow-md transition-all group`}
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {insight.title[lang]}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getImpactBadge(insight.impact)}`}>
                      {insight.impact === 'high' ? '높음' : insight.impact === 'medium' ? '중간' : '낮음'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {insight.description[lang]}
                  </p>
                  {insight.actionable && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                      <span>{t.actionable[lang]}</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 border-b border-slate-200 dark:border-slate-700 ${getInsightColor(selectedInsight.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                    {getInsightIcon(selectedInsight.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {selectedInsight.title[lang]}
                    </h2>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getImpactBadge(selectedInsight.impact)}`}>
                      {t.impact[lang]}: {selectedInsight.impact === 'high' ? t.high[lang] : selectedInsight.impact === 'medium' ? t.medium[lang] : t.low[lang]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📋 {t.detailAnalysis[lang]}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedInsight.description[lang]}
                </p>
              </div>

              {/* Recommendation */}
              {selectedInsight.recommendation && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {t.aiRecommendation[lang]}
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                    {selectedInsight.recommendation[lang]}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedInsight.actionable && !actionResult && (
                <div className="flex gap-3">
                  <button 
                    onClick={handleExecuteAction}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        {t.processing[lang]}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t.startAction[lang]}
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setSelectedInsight(null)}
                    disabled={actionLoading}
                    className="px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {t.later[lang]}
                  </button>
                </div>
              )}

              {/* Action Result */}
              {actionResult && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">
                          ✅ {t.actionComplete[lang]}
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {actionResult.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowResultModal(true)}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {t.viewDetails[lang]}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Result Modal */}
      {showResultModal && actionResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500 rounded-xl shadow-sm">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      조치 완료
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      액션 ID: {actionResult.actionId}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(actionResult.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedInsight(null);
                    setActionResult(null);
                  }}
                  className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Success Message */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  {actionResult.message}
                </p>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  다음 단계
                </h3>
                <div className="space-y-2">
                  {actionResult.nextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ontology Updates */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  온톨로지 업데이트
                </h3>
                <div className="space-y-3">
                  {actionResult.ontologyUpdates.map((update, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start justify-between mb-2">
                        <code className="text-xs font-mono text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                          {update.entity}
                        </code>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {update.property}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">이전 값:</span>
                          <p className="font-mono text-slate-700 dark:text-slate-300 mt-1">
                            {JSON.stringify(update.oldValue)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">새 값:</span>
                          <p className="font-mono text-green-700 dark:text-green-300 font-bold mt-1">
                            {JSON.stringify(update.newValue)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        {update.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  생성된 알림 ({actionResult.notifications.length}개)
                </h3>
                <div className="space-y-2">
                  {actionResult.notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-4 rounded-lg border ${
                        notif.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : notif.type === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </h4>
                        {notif.actionRequired && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">
                            조치 필요
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{new Date(notif.timestamp).toLocaleTimeString('ko-KR')}</span>
                        <span>•</span>
                        <span>{notif.relatedEntities.length}개 엔티티 연결</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setSelectedInsight(null);
                  setActionResult(null);
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                닫기
              </button>
              
              {/* Download Options */}
              <div className="flex gap-2">
                <button
                  onClick={() => reportService.generatePDFReport(actionResult, selectedInsight?.title || '')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="PDF로 다운로드 (인쇄)"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => reportService.downloadMarkdownReport(actionResult, selectedInsight?.title || '')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="Markdown으로 다운로드"
                >
                  <FileText className="w-4 h-4" />
                  MD
                </button>
                <button
                  onClick={() => reportService.downloadJSONReport(actionResult, selectedInsight?.title || '')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="JSON으로 다운로드"
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => reportService.downloadCSVReport(actionResult, selectedInsight?.title || '')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="CSV로 다운로드"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
