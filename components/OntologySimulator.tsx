import React, { useState } from 'react';
import { Play, Plus, Trash2, RotateCcw, TrendingUp, TrendingDown, Minus, DollarSign, Clock, Package } from 'lucide-react';
import { Language } from '../types';

interface OntologySimulatorProps {
  lang: Language;
}

interface SimulationChange {
  id: string;
  type: 'add-node' | 'add-relation' | 'remove-node' | 'modify-property';
  description: string;
  details: any;
}

interface SimulationResult {
  scenario: string;
  changes: SimulationChange[];
  impacts: {
    revenue: { current: number; projected: number; change: number };
    volume: { current: number; projected: number; change: number };
    routes: { current: number; projected: number; change: number };
    avgOTP: { current: number; projected: number; change: number };
  };
  risks: string[];
  opportunities: string[];
  roi: {
    investment: number;
    paybackMonths: number;
    npv: number;
  };
}

const OntologySimulator: React.FC<OntologySimulatorProps> = ({ lang }) => {
  const [scenarioName, setScenarioName] = useState('');
  const [changes, setChanges] = useState<SimulationChange[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  const t = {
    title: { ko: '온톨로지 시뮬레이터', en: 'Ontology Simulator' },
    subtitle: { ko: 'What-if 시나리오 분석 및 영향도 예측', en: 'What-if scenario analysis and impact prediction' },
    
    scenarioName: { ko: '시나리오 이름', en: 'Scenario Name' },
    selectScenario: { ko: '사전 정의 시나리오', en: 'Predefined Scenario' },
    customScenario: { ko: '커스텀 시나리오', en: 'Custom Scenario' },
    
    addChange: { ko: '변경 추가', en: 'Add Change' },
    addNode: { ko: '노드 추가', en: 'Add Node' },
    addRelation: { ko: '관계 추가', en: 'Add Relation' },
    removeNode: { ko: '노드 제거', en: 'Remove Node' },
    modifyProperty: { ko: '속성 수정', en: 'Modify Property' },
    
    simulate: { ko: '시뮬레이션 실행', en: 'Run Simulation' },
    simulating: { ko: '시뮬레이션 중...', en: 'Simulating...' },
    reset: { ko: '초기화', en: 'Reset' },
    
    changes: { ko: '변경 사항', en: 'Changes' },
    impacts: { ko: '예상 영향', en: 'Projected Impacts' },
    risks: { ko: '리스크', en: 'Risks' },
    opportunities: { ko: '기회', en: 'Opportunities' },
    roi: { ko: 'ROI 분석', en: 'ROI Analysis' },
    
    current: { ko: '현재', en: 'Current' },
    projected: { ko: '예상', en: 'Projected' },
    change: { ko: '변화', en: 'Change' },
    
    revenue: { ko: '매출', en: 'Revenue' },
    volume: { ko: '물동량', en: 'Volume' },
    routes: { ko: '항로 수', en: 'Routes' },
    avgOTP: { ko: '평균 OTP', en: 'Avg OTP' },
    
    investment: { ko: '투자 금액', en: 'Investment' },
    payback: { ko: '투자 회수', en: 'Payback' },
    npv: { ko: 'NPV', en: 'NPV' },
    months: { ko: '개월', en: 'months' },
    
    noChanges: { ko: '변경 사항이 없습니다', en: 'No changes added' },
    addChangesFirst: { ko: '변경 사항을 추가하세요', en: 'Add changes first' }
  };

  const predefinedScenarios = [
    {
      id: 'new-route-busan-ny',
      name: lang === 'ko' ? '부산-뉴욕 직항로 신설' : 'New Busan-NY Direct Route',
      changes: [
        {
          id: 'change-1',
          type: 'add-node' as const,
          description: lang === 'ko' ? '새 항로: 부산-뉴욕' : 'New Route: Busan-NY',
          details: { nodeType: 'Route', name: 'Busan-NY', freight: 3200, otp: 0.88 }
        },
        {
          id: 'change-2',
          type: 'add-relation' as const,
          description: lang === 'ko' ? 'KMTC → 부산-뉴욕 운영' : 'KMTC → Busan-NY operates',
          details: { from: 'KMTC', to: 'Busan-NY', relation: 'operates' }
        }
      ]
    },
    {
      id: 'expand-china',
      name: lang === 'ko' ? '중국 항로 확대' : 'Expand China Routes',
      changes: [
        {
          id: 'change-1',
          type: 'add-node' as const,
          description: lang === 'ko' ? '새 항로: 부산-칭다오' : 'New Route: Busan-Qingdao',
          details: { nodeType: 'Route', name: 'Busan-Qingdao', freight: 450, otp: 0.93 }
        },
        {
          id: 'change-2',
          type: 'add-node' as const,
          description: lang === 'ko' ? '새 항로: 인천-닝보' : 'New Route: Incheon-Ningbo',
          details: { nodeType: 'Route', name: 'Incheon-Ningbo', freight: 520, otp: 0.91 }
        }
      ]
    },
    {
      id: 'premium-service',
      name: lang === 'ko' ? '프리미엄 서비스 론칭' : 'Launch Premium Service',
      changes: [
        {
          id: 'change-1',
          type: 'modify-property' as const,
          description: lang === 'ko' ? '부산-LA OTP 향상' : 'Improve Busan-LA OTP',
          details: { node: 'Busan-LA', property: 'otp', from: 0.89, to: 0.95 }
        },
        {
          id: 'change-2',
          type: 'modify-property' as const,
          description: lang === 'ko' ? '부산-LA 운임 인상' : 'Increase Busan-LA freight',
          details: { node: 'Busan-LA', property: 'freight', from: 2850, to: 3100 }
        }
      ]
    }
  ];

  const loadScenario = (scenarioId: string) => {
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setScenarioName(scenario.name);
      setChanges(scenario.changes);
      setSelectedScenario(scenarioId);
    }
  };

  const runSimulation = () => {
    if (changes.length === 0) return;

    setIsSimulating(true);

    // 시뮬레이션 로직 (실제로는 복잡한 계산)
    setTimeout(() => {
      let simulationResult: SimulationResult;

      if (selectedScenario === 'new-route-busan-ny') {
        simulationResult = {
          scenario: scenarioName,
          changes,
          impacts: {
            revenue: { current: 120, projected: 136, change: 13.3 },
            volume: { current: 45000, projected: 50000, change: 11.1 },
            routes: { current: 12, projected: 13, change: 8.3 },
            avgOTP: { current: 0.91, projected: 0.90, change: -1.1 }
          },
          risks: lang === 'ko' ? [
            '초기 물동량 확보 불확실성',
            '기존 부산-LA 항로 물동량 8% 감소 예상',
            '뉴욕 항만 혼잡도 증가 시 OTP 저하 가능',
            '경쟁사 대응 가격 인하 가능성'
          ] : [
            'Uncertainty in initial volume acquisition',
            '8% decrease expected in Busan-LA volume',
            'OTP may decrease if NY port congestion increases',
            'Competitors may respond with price cuts'
          ],
          opportunities: lang === 'ko' ? [
            '북미 동부 시장 진출로 시장 다각화',
            '삼성, LG 등 주요 화주 추가 물량 확보 가능',
            '연간 $16M 추가 매출 예상',
            '브랜드 인지도 향상'
          ] : [
            'Market diversification through NA East entry',
            'Additional volume from Samsung, LG possible',
            '$16M additional annual revenue expected',
            'Brand awareness improvement'
          ],
          roi: {
            investment: 25000000,
            paybackMonths: 16,
            npv: 42000000
          }
        };
      } else if (selectedScenario === 'expand-china') {
        simulationResult = {
          scenario: scenarioName,
          changes,
          impacts: {
            revenue: { current: 120, projected: 132, change: 10.0 },
            volume: { current: 45000, projected: 52000, change: 15.6 },
            routes: { current: 12, projected: 14, change: 16.7 },
            avgOTP: { current: 0.91, projected: 0.92, change: 1.1 }
          },
          risks: lang === 'ko' ? [
            '중국 경기 둔화 리스크',
            '환율 변동성',
            '항만 인프라 제약'
          ] : [
            'China economic slowdown risk',
            'FX volatility',
            'Port infrastructure constraints'
          ],
          opportunities: lang === 'ko' ? [
            '중국 시장 점유율 확대',
            '단거리 항로로 높은 회전율',
            '중소 화주 확보 기회'
          ] : [
            'Expand China market share',
            'High turnover with short routes',
            'Opportunity to acquire SME shippers'
          ],
          roi: {
            investment: 15000000,
            paybackMonths: 12,
            npv: 38000000
          }
        };
      } else {
        simulationResult = {
          scenario: scenarioName,
          changes,
          impacts: {
            revenue: { current: 120, projected: 128, change: 6.7 },
            volume: { current: 45000, projected: 43000, change: -4.4 },
            routes: { current: 12, projected: 12, change: 0 },
            avgOTP: { current: 0.91, projected: 0.95, change: 4.4 }
          },
          risks: lang === 'ko' ? [
            '가격 인상으로 인한 물량 이탈',
            '경쟁사 대응 전략'
          ] : [
            'Volume loss due to price increase',
            'Competitor response strategies'
          ],
          opportunities: lang === 'ko' ? [
            '프리미엄 브랜드 포지셔닝',
            '고부가가치 화주 확보',
            '서비스 차별화'
          ] : [
            'Premium brand positioning',
            'Acquire high-value shippers',
            'Service differentiation'
          ],
          roi: {
            investment: 8000000,
            paybackMonths: 10,
            npv: 28000000
          }
        };
      }

      setResult(simulationResult);
      setIsSimulating(false);
    }, 2000);
  };

  const resetSimulation = () => {
    setScenarioName('');
    setChanges([]);
    setResult(null);
    setSelectedScenario('');
  };

  const removeChange = (id: string) => {
    setChanges(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Play className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.title[lang]}
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.subtitle[lang]}
          </p>
        </div>
        <button
          onClick={resetSimulation}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t.reset[lang]}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측: 시나리오 설정 */}
        <div className="space-y-6">
          {/* 시나리오 선택 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t.selectScenario[lang]}
            </h3>
            <select
              value={selectedScenario}
              onChange={(e) => loadScenario(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:text-white mb-4"
            >
              <option value="">{t.customScenario[lang]}</option>
              {predefinedScenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder={t.scenarioName[lang]}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* 변경 사항 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t.changes[lang]} ({changes.length})
            </h3>
            
            {changes.length > 0 ? (
              <div className="space-y-3">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {change.type === 'add-node' && <Plus className="w-4 h-4 text-green-600" />}
                        {change.type === 'add-relation' && <Plus className="w-4 h-4 text-blue-600" />}
                        {change.type === 'remove-node' && <Minus className="w-4 h-4 text-red-600" />}
                        {change.type === 'modify-property' && <TrendingUp className="w-4 h-4 text-orange-600" />}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {change.description}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {JSON.stringify(change.details)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeChange(change.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">{t.noChanges[lang]}</p>
                <p className="text-xs mt-1">{t.addChangesFirst[lang]}</p>
              </div>
            )}
          </div>

          {/* 시뮬레이션 실행 */}
          <button
            onClick={runSimulation}
            disabled={changes.length === 0 || isSimulating}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                {t.simulating[lang]}
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                {t.simulate[lang]}
              </>
            )}
          </button>
        </div>

        {/* 우측: 시뮬레이션 결과 */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* 영향도 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {t.impacts[lang]}
                </h3>
                <div className="space-y-4">
                  {/* 매출 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t.revenue[lang]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.impacts.revenue.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${
                          result.impacts.revenue.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.impacts.revenue.change > 0 ? '+' : ''}{result.impacts.revenue.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span>${result.impacts.revenue.current}M</span>
                      <span>→</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${result.impacts.revenue.projected}M
                      </span>
                    </div>
                  </div>

                  {/* 물동량 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t.volume[lang]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.impacts.volume.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${
                          result.impacts.volume.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.impacts.volume.change > 0 ? '+' : ''}{result.impacts.volume.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span>{result.impacts.volume.current.toLocaleString()} TEU</span>
                      <span>→</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {result.impacts.volume.projected.toLocaleString()} TEU
                      </span>
                    </div>
                  </div>

                  {/* OTP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t.avgOTP[lang]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.impacts.avgOTP.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${
                          result.impacts.avgOTP.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.impacts.avgOTP.change > 0 ? '+' : ''}{result.impacts.avgOTP.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span>{(result.impacts.avgOTP.current * 100).toFixed(0)}%</span>
                      <span>→</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {(result.impacts.avgOTP.projected * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI */}
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4">{t.roi[lang]}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      ${(result.roi.investment / 1000000).toFixed(0)}M
                    </div>
                    <div className="text-sm opacity-90">{t.investment[lang]}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {result.roi.paybackMonths} {t.months[lang]}
                    </div>
                    <div className="text-sm opacity-90">{t.payback[lang]}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${(result.roi.npv / 1000000).toFixed(0)}M
                    </div>
                    <div className="text-sm opacity-90">{t.npv[lang]}</div>
                  </div>
                </div>
              </div>

              {/* 리스크 & 기회 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3">
                    {t.risks[lang]}
                  </h3>
                  <ul className="space-y-2">
                    {result.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-red-600 mt-1">⚠️</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">
                    {t.opportunities[lang]}
                  </h3>
                  <ul className="space-y-2">
                    {result.opportunities.map((opp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-green-600 mt-1">✅</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center h-full flex items-center justify-center">
              <div>
                <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {lang === 'ko' 
                    ? '시나리오를 설정하고 시뮬레이션을 실행하세요'
                    : 'Configure scenario and run simulation'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OntologySimulator;
