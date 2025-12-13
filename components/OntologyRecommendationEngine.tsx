import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Link, AlertCircle, CheckCircle2 as CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Language } from '../types';

interface OntologyRecommendationEngineProps {
  lang: Language;
  graphData?: any;
}

interface Recommendation {
  id: string;
  type: 'missing-relation' | 'new-entity' | 'optimization' | 'data-quality';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  reasoning: string[];
  action: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const OntologyRecommendationEngine: React.FC<OntologyRecommendationEngineProps> = ({ 
  lang, 
  graphData 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const t = {
    title: { ko: 'AI 온톨로지 추천', en: 'AI Ontology Recommendations' },
    subtitle: { ko: '지능형 분석으로 온톨로지 개선 제안', en: 'Intelligent analysis for ontology improvement' },
    analyze: { ko: '분석 시작', en: 'Start Analysis' },
    analyzing: { ko: '분석 중...', en: 'Analyzing...' },
    
    // Types
    missingRelation: { ko: '누락된 관계', en: 'Missing Relation' },
    newEntity: { ko: '새로운 엔티티', en: 'New Entity' },
    optimization: { ko: '구조 최적화', en: 'Optimization' },
    dataQuality: { ko: '데이터 품질', en: 'Data Quality' },
    
    // Impact
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Status
    pending: { ko: '대기', en: 'Pending' },
    accepted: { ko: '승인됨', en: 'Accepted' },
    rejected: { ko: '거부됨', en: 'Rejected' },
    
    confidence: { ko: '신뢰도', en: 'Confidence' },
    impact: { ko: '영향도', en: 'Impact' },
    reasoning: { ko: '근거', en: 'Reasoning' },
    action: { ko: '권장 조치', en: 'Recommended Action' },
    
    accept: { ko: '승인', en: 'Accept' },
    reject: { ko: '거부', en: 'Reject' },
    
    filterAll: { ko: '전체', en: 'All' },
    filterHigh: { ko: '높은 영향도', en: 'High Impact' },
    filterMedium: { ko: '중간 영향도', en: 'Medium Impact' },
    filterLow: { ko: '낮은 영향도', en: 'Low Impact' },
    
    noRecommendations: { ko: '추천 사항이 없습니다', en: 'No recommendations' },
    runAnalysis: { ko: '분석을 실행하여 추천을 받으세요', en: 'Run analysis to get recommendations' }
  };

  const analyzeOntology = () => {
    setIsAnalyzing(true);

    // 시뮬레이션: 실제로는 ML 모델 또는 규칙 기반 엔진 사용
    setTimeout(() => {
      const newRecommendations: Recommendation[] = [
        {
          id: 'rec-001',
          type: 'missing-relation',
          title: lang === 'ko' ? '삼성전자 → 부산-뉴욕 항로 관계 누락' : 'Samsung → Busan-NY Route Missing',
          description: lang === 'ko'
            ? '삼성전자가 부산-뉴욕 항로를 사용할 가능성이 높지만 관계가 정의되지 않았습니다.'
            : 'Samsung likely uses Busan-NY route but the relationship is not defined.',
          confidence: 87,
          impact: 'high',
          reasoning: lang === 'ko' ? [
            '유사 화주(LG전자, SK하이닉스) 80%가 이 항로 사용',
            '삼성전자의 북미 동부 수출량 증가 추세',
            '과거 스팟 부킹 데이터에서 3회 확인'
          ] : [
            '80% of similar shippers (LG, SK Hynix) use this route',
            'Samsung\'s NA East export volume increasing',
            'Confirmed 3 times in historical spot bookings'
          ],
          action: lang === 'ko'
            ? 'SPARQL: INSERT { :Samsung :uses :BusanNY }'
            : 'SPARQL: INSERT { :Samsung :uses :BusanNY }',
          status: 'pending'
        },
        {
          id: 'rec-002',
          type: 'new-entity',
          title: lang === 'ko' ? '"부산항" 엔티티 추가 권장' : 'Add "Busan Port" Entity',
          description: lang === 'ko'
            ? '12개 항로가 부산을 언급하지만 Port 엔티티가 없어 지리적 분석이 제한됩니다.'
            : '12 routes mention Busan but no Port entity exists, limiting geographic analysis.',
          confidence: 92,
          impact: 'high',
          reasoning: lang === 'ko' ? [
            '12개 항로의 출발지 또는 도착지로 "부산" 언급',
            'Port 엔티티를 통한 허브 분석 가능',
            '항만 혼잡도, 리드타임 등 속성 추가 가능'
          ] : [
            '12 routes mention "Busan" as origin or destination',
            'Hub analysis possible through Port entity',
            'Can add attributes like congestion, lead time'
          ],
          action: lang === 'ko'
            ? '새 엔티티: Port:Busan (속성: location, capacity, congestion)'
            : 'New Entity: Port:Busan (props: location, capacity, congestion)',
          status: 'pending'
        },
        {
          id: 'rec-003',
          type: 'optimization',
          title: lang === 'ko' ? '계약 노드를 관계로 통합' : 'Merge Contract Nodes into Relations',
          description: lang === 'ko'
            ? '계약 노드를 화주-항로 관계의 속성으로 변경하면 구조가 단순해집니다.'
            : 'Converting Contract nodes to Shipper-Route relation properties simplifies structure.',
          confidence: 75,
          impact: 'medium',
          reasoning: lang === 'ko' ? [
            '계약은 화주와 항로 간의 관계를 나타내는 메타데이터',
            '현재 구조에서 3-hop 쿼리가 2-hop으로 단축',
            '복잡도 15% 감소, 쿼리 성능 20% 향상 예상'
          ] : [
            'Contracts are metadata representing Shipper-Route relations',
            '3-hop queries reduced to 2-hop',
            '15% complexity reduction, 20% query performance gain expected'
          ],
          action: lang === 'ko'
            ? '리팩토링: Contract 노드 → :uses 관계의 속성으로 변경'
            : 'Refactor: Contract nodes → properties of :uses relation',
          status: 'pending'
        },
        {
          id: 'rec-004',
          type: 'missing-relation',
          title: lang === 'ko' ? 'KMTC → 인천-도쿄 항로 운영 관계 추가' : 'Add KMTC → Incheon-Tokyo Operation',
          description: lang === 'ko'
            ? 'KMTC가 인천-도쿄 항로를 운영하지만 온톨로지에 반영되지 않았습니다.'
            : 'KMTC operates Incheon-Tokyo route but not reflected in ontology.',
          confidence: 95,
          impact: 'high',
          reasoning: lang === 'ko' ? [
            '공식 웹사이트에서 운항 스케줄 확인',
            '주 2회 운항 중',
            '경쟁사 분석에 필수적인 정보'
          ] : [
            'Confirmed on official website schedule',
            'Operating twice weekly',
            'Essential for competitor analysis'
          ],
          action: lang === 'ko'
            ? 'SPARQL: INSERT { :KMTC :operates :IncheonTokyo }'
            : 'SPARQL: INSERT { :KMTC :operates :IncheonTokyo }',
          status: 'pending'
        },
        {
          id: 'rec-005',
          type: 'data-quality',
          title: lang === 'ko' ? '중복 노드 발견: "Market Price" vs "MarketPrice"' : 'Duplicate Nodes: "Market Price" vs "MarketPrice"',
          description: lang === 'ko'
            ? '동일한 개념을 나타내는 노드가 2개 존재하여 데이터 일관성이 저하됩니다.'
            : 'Two nodes representing the same concept exist, reducing data consistency.',
          confidence: 98,
          impact: 'high',
          reasoning: lang === 'ko' ? [
            '두 노드의 속성이 99% 일치',
            '연결된 관계가 중복됨',
            '쿼리 결과에 혼란 야기'
          ] : [
            '99% property match between nodes',
            'Duplicate relationships',
            'Causes confusion in query results'
          ],
          action: lang === 'ko'
            ? '병합: "MarketPrice" → "Market Price"로 통합 및 관계 재연결'
            : 'Merge: Consolidate "MarketPrice" → "Market Price" and reconnect relations',
          status: 'pending'
        },
        {
          id: 'rec-006',
          type: 'new-entity',
          title: lang === 'ko' ? '"리스크 이벤트" 엔티티 클래스 추가' : 'Add "Risk Event" Entity Class',
          description: lang === 'ko'
            ? '홍해 리스크, 유가 변동 등을 별도 엔티티로 관리하면 리스크 분석이 강화됩니다.'
            : 'Managing Red Sea risk, oil price changes as separate entities enhances risk analysis.',
          confidence: 82,
          impact: 'medium',
          reasoning: lang === 'ko' ? [
            '현재 리스크가 항로 속성으로만 존재',
            '시계열 리스크 추적 불가',
            '리스크 간 상관관계 분석 필요'
          ] : [
            'Risks currently exist only as route properties',
            'Cannot track risk over time',
            'Need to analyze risk correlations'
          ],
          action: lang === 'ko'
            ? '새 클래스: RiskEvent (속성: type, severity, startDate, endDate, affectedRoutes)'
            : 'New Class: RiskEvent (props: type, severity, startDate, endDate, affectedRoutes)',
          status: 'pending'
        },
        {
          id: 'rec-007',
          type: 'optimization',
          title: lang === 'ko' ? '고아 노드 3개 발견' : '3 Orphan Nodes Detected',
          description: lang === 'ko'
            ? '어떤 노드와도 연결되지 않은 노드가 3개 있어 제거를 권장합니다.'
            : '3 nodes not connected to any other nodes, recommend removal.',
          confidence: 100,
          impact: 'low',
          reasoning: lang === 'ko' ? [
            '노드: Vessel-005, Booking-999, OldContract-2023',
            '6개월 이상 연결 없음',
            '저장 공간 낭비 및 쿼리 성능 저하'
          ] : [
            'Nodes: Vessel-005, Booking-999, OldContract-2023',
            'No connections for 6+ months',
            'Wasting storage and degrading query performance'
          ],
          action: lang === 'ko'
            ? '삭제: 고아 노드 3개 제거'
            : 'Delete: Remove 3 orphan nodes',
          status: 'pending'
        }
      ];

      setRecommendations(newRecommendations);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleAccept = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec => rec.id === id ? { ...rec, status: 'accepted' as const } : rec)
    );
  };

  const handleReject = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec => rec.id === id ? { ...rec, status: 'rejected' as const } : rec)
    );
  };

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'missing-relation': return Link;
      case 'new-entity': return Sparkles;
      case 'optimization': return TrendingUp;
      case 'data-quality': return AlertCircle;
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'missing-relation': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'new-entity': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'optimization': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'data-quality': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    }
  };

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    return rec.impact === filter;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.title[lang]}
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.subtitle[lang]}
          </p>
        </div>
        <button
          onClick={analyzeOntology}
          disabled={isAnalyzing}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              {t.analyzing[lang]}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t.analyze[lang]}
            </>
          )}
        </button>
      </div>

      {/* 필터 */}
      {recommendations.length > 0 && (
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {t[f === 'all' ? 'filterAll' : `filter${f.charAt(0).toUpperCase() + f.slice(1)}` as keyof typeof t][lang]}
            </button>
          ))}
        </div>
      )}

      {/* 추천 목록 */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => {
            const TypeIcon = getTypeIcon(rec.type);
            return (
              <div
                key={rec.id}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-2 transition-all ${
                  rec.status === 'accepted'
                    ? 'border-green-500 dark:border-green-600'
                    : rec.status === 'rejected'
                    ? 'border-red-500 dark:border-red-600 opacity-50'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-3 rounded-lg ${getTypeColor(rec.type)}`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  {rec.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(rec.id)}
                        className="p-2 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                        title={t.accept[lang]}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        onClick={() => handleReject(rec.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        title={t.reject[lang]}
                      >
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {t.confidence[lang]}:
                    </span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {t.impact[lang]}:
                    </span>
                    <span className={`text-sm font-bold ${getImpactColor(rec.impact)}`}>
                      {t[rec.impact][lang]}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {t.reasoning[lang]}
                  </h4>
                  <ul className="space-y-1">
                    {rec.reasoning.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.action[lang]}
                  </h4>
                  <code className="text-xs text-slate-900 dark:text-white font-mono">
                    {rec.action}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <Lightbulb className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            {t.noRecommendations[lang]}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {t.runAnalysis[lang]}
          </p>
        </div>
      )}
    </div>
  );
};

export default OntologyRecommendationEngine;
