import React, { useState } from 'react';
import { Briefcase, ChevronRight, CheckCircle2, AlertTriangle, Calendar, UserX, TrendingUp, Ship, ArrowRight, Bell, ClipboardCheck, BarChart2 } from 'lucide-react';
import { Language, ScenarioDef } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ScenariosProps {
  lang: Language;
}

const Scenarios: React.FC<ScenariosProps> = ({ lang }) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const t = {
    title: { ko: '실무 시나리오 시뮬레이션', en: 'Workflow Scenario Simulation' },
    subtitle: { ko: '실제 업무 환경에서의 AI 기반 의사결정 프로세스를 단계별로 체험합니다.', en: 'Step-by-step simulation of AI-based decision making in real workflows.' },
    start: { ko: '시나리오 시작', en: 'Start Scenario' },
    reset: { ko: '다시 하기', en: 'Restart' },
    next: { ko: '다음 단계', en: 'Next Step' },
    complete: { ko: '시나리오 완료', en: 'Complete' },
    back: { ko: '목록으로', en: 'Back to List' },
    
    // Scenario Titles & Descs
    s1Title: { ko: '부킹일 예측', en: 'Booking Date Prediction' },
    s1Desc: { ko: '지식 그래프 TIME_NEXT 관계를 활용하여 화주의 다음 발주 시점을 예측하고 선제 영업 기회를 포착합니다.', en: 'Predict next booking date using Knowledge Graph TIME_NEXT relations to capture proactive sales opportunities.' },
    
    s2Title: { ko: '이탈 조기 탐지', en: 'Churn Detection' },
    s2Desc: { ko: '부킹 주기 패턴 이상 징후를 감지하여 고위험군을 식별하고 방어 제안을 실행합니다.', en: 'Identify high-risk accounts by detecting cycle pattern anomalies and execute retention offers.' },
    
    s3Title: { ko: '영업 추천 (Offer)', en: 'Sales Recommendation' },
    s3Desc: { ko: '시황 호조 및 리드타임 개선 시점에 맞춰 최적의 운임과 스페이스를 자동 제안합니다.', en: 'Automatically recommend optimal rates and space during favorable market conditions.' },
    
    s4Title: { ko: '선복 최적화', en: 'Space Optimization' },
    s4Desc: { ko: '항로별 부킹 패턴과 외부 시황 지표를 연동하여 선복 운영 효율을 극대화합니다.', en: 'Maximize fleet efficiency by correlating route booking patterns with external market indices.' },
  };

  // Sample Data for Charts
  const cycleData = [
    { name: 'Prev 1', days: 14 },
    { name: 'Prev 2', days: 15 },
    { name: 'Prev 3', days: 14 },
    { name: 'Prev 4', days: 13 },
    { name: 'Current', days: 21, fill: '#ef4444' }, // Abnormally long
  ];

  const bookingTrend = [
    { name: 'W40', val: 100 },
    { name: 'W41', val: 120 },
    { name: 'W42', val: 110 },
    { name: 'W43', val: 40 }, // Drop
    { name: 'W44', val: 20 }, // Drop
  ];

  const scenarios: ScenarioDef[] = [
    {
      id: 'prediction',
      title: t.s1Title[lang],
      description: t.s1Desc[lang],
      color: 'bg-blue-500',
      icon: Calendar,
      steps: [
        {
          stepNumber: 1,
          title: lang === 'ko' ? '주기 패턴 분석' : 'Cycle Pattern Analysis',
          description: lang === 'ko' ? 'TIME_NEXT 관계를 추적하여 과거 부킹 이력을 분석하고 주간/월간 패턴을 식별합니다.' : 'Analyze historical booking logs and identify weekly/monthly patterns using TIME_NEXT relations.',
          icon: BarChart2,
          content: (
            <div className="h-48 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{name: 'Regular', val: 85}, {name: 'Irregular', val: 15}]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" tick={{fontSize: 12}} />
                     <Tooltip />
                     <Bar dataKey="val" fill="#3b82f6" barSize={50} />
                  </BarChart>
               </ResponsiveContainer>
               <p className="text-xs text-center mt-2 text-slate-500">화주 A의 부킹 패턴: 85% 정기성 (주간 패턴)</p>
            </div>
          )
        },
        {
          stepNumber: 2,
          title: lang === 'ko' ? 'D-Day 예측' : 'D-Day Prediction',
          description: lang === 'ko' ? '다음 부킹 예상일을 산출하고 신뢰도 구간을 계산합니다.' : 'Calculate expected booking date and confidence interval.',
          icon: Calendar,
          content: (
            <div className="flex flex-col items-center justify-center h-48 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
               <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">D-3</div>
               <p className="text-sm font-medium mt-2 text-slate-700 dark:text-slate-300">예상 부킹일: 2024-12-10</p>
               <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">신뢰도 92%</div>
            </div>
          )
        },
        {
          stepNumber: 3,
          title: lang === 'ko' ? '자동 알림 (Push)' : 'Auto Alert',
          description: lang === 'ko' ? 'T-3일 시점에 긴급 알림을 발송하고 이탈 위험 신호를 감지합니다.' : 'Send urgent alert at T-3 days and detect churn risk signals.',
          icon: Bell,
          content: (
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
               <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full"><Bell className="w-4 h-4 text-blue-600"/></div>
                  <div>
                     <h4 className="font-bold text-sm">Booking Reminder</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">화주 [Samsung Elec]의 예상 부킹일이 3일 남았습니다. 현재 오더 접수가 확인되지 않았습니다.</p>
                  </div>
               </div>
            </div>
          )
        },
        {
          stepNumber: 4,
          title: lang === 'ko' ? '영업 과제 생성' : 'Generate Sales Task',
          description: lang === 'ko' ? '담당자 To-Do를 등록하고 맞춤형 제안 가이드를 제공합니다.' : 'Register To-Do for manager and provide custom proposal guide.',
          icon: ClipboardCheck,
          actionItems: [
             lang === 'ko' ? '영업 담당자에게 콜백 요청 생성' : 'Create Callback Request for Sales Rep',
             lang === 'ko' ? '지난번 동일 조건 운임 제안서 초안 생성' : 'Draft Rate Proposal with previous terms'
          ]
        }
      ]
    },
    {
      id: 'churn',
      title: t.s2Title[lang],
      description: t.s2Desc[lang],
      color: 'bg-red-500',
      icon: UserX,
      steps: [
        {
          stepNumber: 1,
          title: lang === 'ko' ? '징후 탐지' : 'Sign Detection',
          description: lang === 'ko' ? '평균 주기 대비 경과일을 비교하고 물량 급감을 감지합니다.' : 'Compare elapsed time vs avg cycle and detect volume drop.',
          icon: AlertTriangle,
          content: (
            <div className="h-48 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bookingTrend}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" tick={{fontSize: 12}} />
                     <Tooltip />
                     <Line type="monotone" dataKey="val" stroke="#ef4444" strokeWidth={3} />
                  </LineChart>
               </ResponsiveContainer>
               <p className="text-xs text-center mt-2 text-red-500 font-bold">최근 2주간 물량 80% 급감</p>
            </div>
          )
        },
        {
          stepNumber: 2,
          title: lang === 'ko' ? '고위험군 식별' : 'Identify High Risk',
          description: lang === 'ko' ? '이탈 확률 스코어링 및 Priority 등급 분류' : 'Churn probability scoring and priority classification.',
          icon: UserX,
          content: (
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center border border-red-100">
                   <div className="text-2xl font-bold text-red-600">88점</div>
                   <div className="text-xs text-red-500">Churn Score</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center border border-orange-100">
                   <div className="text-2xl font-bold text-orange-600">High</div>
                   <div className="text-xs text-orange-500">Risk Level</div>
                </div>
             </div>
          )
        },
        {
          stepNumber: 3,
          title: lang === 'ko' ? '우선 콜리스트' : 'Priority Call List',
          description: lang === 'ko' ? '이탈 방지 스크립트 추천 및 알림 발송' : 'Recommend retention script and send alerts.',
          icon: ClipboardCheck,
          content: (
             <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded text-sm text-slate-700 dark:text-slate-300 font-mono">
                "최근 경쟁사 A의 운임 인하 프로모션이 있었습니다. 이에 대응하는 당사의 스팟성 운임 할인을 제안해 보세요."
             </div>
          )
        },
        {
          stepNumber: 4,
          title: lang === 'ko' ? '선제적 제안' : 'Proactive Offer',
          description: lang === 'ko' ? '맞춤형 프로모션 제공 및 리드타임 단축 지원' : 'Provide custom promotion and lead-time support.',
          icon: CheckCircle2,
          actionItems: [
             lang === 'ko' ? '운임 5% 할인 쿠폰 발행' : 'Issue 5% Discount Coupon',
             lang === 'ko' ? '우선 선적(Priority Loading) 권한 부여' : 'Grant Priority Loading Status'
          ]
        }
      ]
    },
    {
      id: 'sales',
      title: t.s3Title[lang],
      description: t.s3Desc[lang],
      color: 'bg-indigo-500',
      icon: TrendingUp,
      steps: [
         { stepNumber: 1, title: '감지/트리거', description: '부킹 예정 시점 도래 및 시황 호전 신호', icon: Bell },
         { stepNumber: 2, title: '추천 생성', description: '제안 운임 자동 산출 및 골든 타임 선정', icon: Briefcase },
         { stepNumber: 3, title: '알림 및 실행', description: 'CRM 내 기회 생성 및 제안서 초안 제공', icon: CheckCircle2 }
      ]
    },
    {
        id: 'optimization',
        title: t.s4Title[lang],
        description: t.s4Desc[lang],
        color: 'bg-emerald-500',
        icon: Ship,
        steps: [
           { stepNumber: 1, title: '데이터 입력', description: '항로별 부킹 패턴 및 경쟁사 운임 동향', icon: BarChart2 },
           { stepNumber: 2, title: '분석 및 모델링', description: '수요 예측 알고리즘 및 수익성 비교', icon: TrendingUp },
           { stepNumber: 3, title: '전략 도출', description: '최적 선복 배분 및 권장 운임 가이드', icon: Briefcase },
           { stepNumber: 4, title: '실적 피드백', description: '예측 정확도 평가 및 모델 보정', icon: CheckCircle2 }
        ]
      }
  ];

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const handleNext = () => {
    if (activeScenario && currentStep < activeScenario.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
           <Briefcase className="w-7 h-7 text-blue-600" /> {t.title[lang]}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
      </div>

      {!activeScenario ? (
        // Scenario List View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <div 
                key={scenario.id}
                onClick={() => { setActiveScenarioId(scenario.id); setCurrentStep(0); }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-600 group"
              >
                <div className="flex items-start justify-between mb-4">
                   <div className={`p-3 rounded-xl ${scenario.color} bg-opacity-10`}>
                      <Icon className={`w-8 h-8 ${scenario.color.replace('bg-', 'text-')}`} />
                   </div>
                   <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                   {scenario.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                   {scenario.steps.length} Steps
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Wizard View
        <div className="mt-4">
           {/* Header / Back */}
           <button 
             onClick={() => setActiveScenarioId(null)}
             className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
           >
              <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> {t.back[lang]}
           </button>

           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
              
              {/* Sidebar Steps */}
              <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                 <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{activeScenario.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activeScenario.description}</p>
                 </div>
                 
                 <div className="space-y-6 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
                    
                    {activeScenario.steps.map((step, index) => {
                       const isActive = index === currentStep;
                       const isCompleted = index < currentStep;
                       
                       return (
                          <div key={index} className="relative z-10 flex items-start gap-4">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                                isActive ? 'bg-blue-600 border-blue-600 text-white scale-110' : 
                                isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                             }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5"/> : index + 1}
                             </div>
                             <div className={`pt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                <h4 className={`font-bold text-sm ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{step.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{step.description}</p>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 flex flex-col">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                       <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wide">
                          Step {currentStep + 1}
                       </span>
                       <h2 className="text-2xl font-bold">{activeScenario.steps[currentStep].title}</h2>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
                       {activeScenario.steps[currentStep].description}
                    </p>

                    {/* Step Content / Visualization */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 min-h-[200px] flex flex-col justify-center">
                       {activeScenario.steps[currentStep].content || (
                          <div className="flex flex-col items-center justify-center text-slate-400 py-10">
                             <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                                {React.createElement(activeScenario.steps[currentStep].icon, { className: "w-8 h-8" })}
                             </div>
                             <p>Visualization for {activeScenario.steps[currentStep].title}</p>
                          </div>
                       )}
                    </div>

                    {/* Action Items */}
                    {activeScenario.steps[currentStep].actionItems && (
                       <div className="space-y-3">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Action Items</h4>
                          {activeScenario.steps[currentStep].actionItems?.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>

                 {/* Navigation Buttons */}
                 <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between mt-auto">
                    <button 
                       onClick={handleReset}
                       className="px-6 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-medium text-sm"
                    >
                       {t.reset[lang]}
                    </button>
                    <button 
                       onClick={handleNext}
                       disabled={currentStep === activeScenario.steps.length - 1}
                       className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30 transition font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {currentStep === activeScenario.steps.length - 1 ? (
                          <>
                             <CheckCircle2 className="w-4 h-4" /> {t.complete[lang]}
                          </>
                       ) : (
                          <>
                             {t.next[lang]} <ArrowRight className="w-4 h-4" />
                          </>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Scenarios;