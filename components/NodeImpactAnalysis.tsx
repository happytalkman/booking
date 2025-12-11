import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Network, Users, GitBranch, Target } from 'lucide-react';
import { Language } from '../types';

interface NodeImpactAnalysisProps {
  lang: Language;
  graphData?: any;
}

interface ImpactResult {
  nodeName: string;
  nodeType: string;
  directConnections: number;
  indirectImpact: number;
  affectedPaths: number;
  importance: number;
  impactAreas: {
    area: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }[];
  recommendations: string[];
}

const NodeImpactAnalysis: React.FC<NodeImpactAnalysisProps> = ({ lang, graphData }) => {
  const [selectedNode, setSelectedNode] = useState('');
  const [impactResult, setImpactResult] = useState<ImpactResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const t = {
    title: { ko: '노드 영향도 분석', en: 'Node Impact Analysis' },
    selectNode: { ko: '분석할 노드 선택', en: 'Select Node to Analyze' },
    analyze: { ko: '영향도 분석', en: 'Analyze Impact' },
    analyzing: { ko: '분석 중...', en: 'Analyzing...' },
    directConnections: { ko: '직접 연결', en: 'Direct Connections' },
    indirectImpact: { ko: '간접 영향', en: 'Indirect Impact' },
    affectedPaths: { ko: '영향 받는 경로', en: 'Affected Paths' },
    importance: { ko: '중요도', en: 'Importance' },
    impactAreas: { ko: '영향 영역', en: 'Impact Areas' },
    recommendations: { ko: '권장 사항', en: 'Recommendations' },
    removalImpact: { ko: '제거 시 영향', en: 'Removal Impact' },
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    nodes: { ko: '개 노드', en: 'nodes' },
    paths: { ko: '개 경로', en: 'paths' },
    placeholder: { ko: '노드를 선택하세요', en: 'Select a node' }
  };

  const sampleNodes = [
    { id: 'market-price', label: 'Market Price', type: 'marketIndex' },
    { id: 'kmtc', label: 'KMTC', type: 'competitor' },
    { id: 'samsung', label: '삼성전자', type: 'shipper' },
    { id: 'busan-la', label: '부산-LA', type: 'route' },
    { id: 'booking-001', label: '부킹-001', type: 'booking' },
    { id: 'contract-a', label: '계약-A', type: 'contract' }
  ];

  const analyzeImpact = () => {
    if (!selectedNode) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      let result: ImpactResult;

      if (selectedNode === 'market-price') {
        result = {
          nodeName: 'Market Price',
          nodeType: 'marketIndex',
          directConnections: 23,
          indirectImpact: 41,
          affectedPaths: 156,
          importance: 9.5,
          impactAreas: [
            {
              area: lang === 'ko' ? '운임 예측' : 'Freight Prediction',
              severity: 'high',
              description: lang === 'ko' 
                ? 'ML 예측 모델의 핵심 입력 변수로 사용됨. 제거 시 예측 불가능'
                : 'Core input variable for ML prediction models. Prediction impossible if removed'
            },
            {
              area: lang === 'ko' ? '부킹 추천' : 'Booking Recommendation',
              severity: 'high',
              description: lang === 'ko'
                ? '부킹 추천 시스템의 기준 가격. 제거 시 추천 시스템 작동 불가'
                : 'Reference price for booking recommendation. System inoperable if removed'
            },
            {
              area: lang === 'ko' ? '경쟁 분석' : 'Competitive Analysis',
              severity: 'medium',
              description: lang === 'ko'
                ? '경쟁사 가격 비교의 기준점. 제거 시 벤치마킹 제한'
                : 'Benchmark for competitor pricing. Benchmarking limited if removed'
            }
          ],
          recommendations: lang === 'ko' ? [
            '실시간 모니터링 시스템 구축 필수',
            '백업 데이터 소스 확보',
            '이상 탐지 알고리즘 적용',
            '데이터 품질 검증 자동화',
            '장애 발생 시 대체 로직 준비'
          ] : [
            'Build real-time monitoring system',
            'Secure backup data sources',
            'Apply anomaly detection algorithms',
            'Automate data quality validation',
            'Prepare fallback logic for failures'
          ]
        };
      } else if (selectedNode === 'kmtc') {
        result = {
          nodeName: 'KMTC',
          nodeType: 'competitor',
          directConnections: 18,
          indirectImpact: 32,
          affectedPaths: 89,
          importance: 8.2,
          impactAreas: [
            {
              area: lang === 'ko' ? '항로 운영' : 'Route Operations',
              severity: 'high',
              description: lang === 'ko'
                ? '12개 주요 항로 운영. 제거 시 물류 네트워크 마비'
                : 'Operates 12 major routes. Network paralysis if removed'
            },
            {
              area: lang === 'ko' ? '화주 관계' : 'Shipper Relations',
              severity: 'high',
              description: lang === 'ko'
                ? '8개 주요 화주와 계약 관계. 제거 시 매출 손실'
                : 'Contracts with 8 major shippers. Revenue loss if removed'
            },
            {
              area: lang === 'ko' ? '시장 점유율' : 'Market Share',
              severity: 'medium',
              description: lang === 'ko'
                ? '아시아-북미 항로 15% 점유. 제거 시 경쟁력 약화'
                : '15% share in Asia-NA routes. Competitiveness weakened if removed'
            }
          ],
          recommendations: lang === 'ko' ? [
            '핵심 항로 백업 계획 수립',
            '대체 운송사 사전 확보',
            '화주 관계 다각화',
            '리스크 분산 전략 실행'
          ] : [
            'Establish backup plans for key routes',
            'Secure alternative carriers',
            'Diversify shipper relationships',
            'Execute risk distribution strategy'
          ]
        };
      } else {
        result = {
          nodeName: sampleNodes.find(n => n.id === selectedNode)?.label || selectedNode,
          nodeType: sampleNodes.find(n => n.id === selectedNode)?.type || 'unknown',
          directConnections: 8,
          indirectImpact: 15,
          affectedPaths: 42,
          importance: 6.5,
          impactAreas: [
            {
              area: lang === 'ko' ? '일반 영향' : 'General Impact',
              severity: 'medium',
              description: lang === 'ko'
                ? '중간 수준의 네트워크 영향'
                : 'Medium level network impact'
            }
          ],
          recommendations: lang === 'ko' ? [
            '정기적인 모니터링 권장',
            '연결 상태 확인'
          ] : [
            'Regular monitoring recommended',
            'Check connection status'
          ]
        };
      }

      setImpactResult(result);
      setIsAnalyzing(false);
    }, 1000);
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
    return {
      high: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
      medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
      low: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
    }[severity];
  };

  const getImportanceColor = (importance: number): string => {
    if (importance >= 9) return 'text-red-600 dark:text-red-400';
    if (importance >= 7) return 'text-orange-600 dark:text-orange-400';
    if (importance >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.title[lang]}
        </h2>
      </div>

      {/* 노드 선택 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {t.selectNode[lang]}
        </label>
        <div className="flex gap-3">
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="">{t.placeholder[lang]}</option>
            {sampleNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.label} ({node.type})
              </option>
            ))}
          </select>
          <button
            onClick={analyzeImpact}
            disabled={!selectedNode || isAnalyzing}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {t.analyzing[lang]}
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                {t.analyze[lang]}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 분석 결과 */}
      {impactResult && (
        <div className="space-y-6">
          {/* 주요 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {impactResult.directConnections}
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t.directConnections[lang]}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {impactResult.indirectImpact}
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t.indirectImpact[lang]}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <GitBranch className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {impactResult.affectedPaths}
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t.affectedPaths[lang]}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <div className={`text-3xl font-bold ${getImportanceColor(impactResult.importance)}`}>
                  {impactResult.importance.toFixed(1)}
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t.importance[lang]} / 10
              </div>
            </div>
          </div>

          {/* 영향 영역 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              {t.removalImpact[lang]}
            </h3>
            <div className="space-y-4">
              {impactResult.impactAreas.map((area, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(area.severity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{area.area}</h4>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-900">
                      {t[area.severity][lang]}
                    </span>
                  </div>
                  <p className="text-sm">{area.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 권장 사항 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t.recommendations[lang]}
            </h3>
            <ul className="space-y-3">
              {impactResult.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeImpactAnalysis;
