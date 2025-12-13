import React, { useState, useEffect } from 'react';
import { Zap, Plus, Settings, Play, Pause, AlertTriangle, CheckCircle2 as CheckCircle, Clock, TrendingDown, DollarSign, X, Edit, Trash2, Eye } from 'lucide-react';
import { Language } from '../types';

interface AutoBookingRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    routes: string[];
    rateThreshold: number;
    comparison: 'below' | 'above';
    containerTypes: string[];
    minQuantity: number;
    maxQuantity: number;
    timeWindow?: {
      start: string;
      end: string;
    };
    riskLevel: 'low' | 'medium' | 'high';
  };
  actions: {
    autoExecute: boolean;
    requireApproval: boolean;
    approvers: string[];
    maxAmount: number;
    notifyChannels: string[];
  };
  riskControls: {
    maxDailyBookings: number;
    maxWeeklyAmount: number;
    blackoutDates: string[];
    emergencyStop: boolean;
  };
  createdAt: Date;
  lastTriggered?: Date;
  executionCount: number;
  totalSavings: number;
}

interface AutoBookingExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  bookingDetails: {
    route: string;
    containerType: string;
    quantity: number;
    proposedRate: number;
    marketRate: number;
    estimatedSavings: number;
  };
  approvalFlow: {
    requiredApprovers: string[];
    approvedBy: string[];
    rejectedBy: string[];
    comments: string[];
  };
  executionResult?: {
    bookingNumber?: string;
    finalRate?: number;
    actualSavings?: number;
    error?: string;
  };
  riskAssessment: {
    score: number;
    factors: string[];
    recommendation: 'proceed' | 'caution' | 'stop';
  };
}

interface AutoBookingEngineProps {
  lang: Language;
}

const AutoBookingEngine: React.FC<AutoBookingEngineProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'analytics'>('rules');
  const [rules, setRules] = useState<AutoBookingRule[]>([]);
  const [executions, setExecutions] = useState<AutoBookingExecution[]>([]);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutoBookingRule | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<AutoBookingExecution | null>(null);
  const [systemStatus, setSystemStatus] = useState<'running' | 'paused' | 'maintenance'>('running');

  const t = {
    title: { ko: '자동 부킹 엔진', en: 'Auto Booking Engine' },
    
    // Tabs
    rules: { ko: '부킹 규칙', en: 'Booking Rules' },
    executions: { ko: '실행 이력', en: 'Executions' },
    analytics: { ko: '분석', en: 'Analytics' },
    
    // System Status
    systemStatus: { ko: '시스템 상태', en: 'System Status' },
    running: { ko: '실행중', en: 'Running' },
    paused: { ko: '일시정지', en: 'Paused' },
    maintenance: { ko: '점검중', en: 'Maintenance' },
    
    // Rules
    createRule: { ko: '규칙 생성', en: 'Create Rule' },
    ruleName: { ko: '규칙 이름', en: 'Rule Name' },
    conditions: { ko: '조건', en: 'Conditions' },
    actions: { ko: '실행 동작', en: 'Actions' },
    riskControls: { ko: '리스크 제어', en: 'Risk Controls' },
    
    // Conditions
    routes: { ko: '항로', en: 'Routes' },
    rateThreshold: { ko: '운임 임계값', en: 'Rate Threshold' },
    containerTypes: { ko: '컨테이너 타입', en: 'Container Types' },
    quantity: { ko: '수량', en: 'Quantity' },
    timeWindow: { ko: '시간 범위', en: 'Time Window' },
    riskLevel: { ko: '리스크 레벨', en: 'Risk Level' },
    
    // Actions
    autoExecute: { ko: '자동 실행', en: 'Auto Execute' },
    requireApproval: { ko: '승인 필요', en: 'Require Approval' },
    approvers: { ko: '승인자', en: 'Approvers' },
    maxAmount: { ko: '최대 금액', en: 'Max Amount' },
    
    // Risk Controls
    maxDailyBookings: { ko: '일일 최대 부킹', en: 'Max Daily Bookings' },
    maxWeeklyAmount: { ko: '주간 최대 금액', en: 'Max Weekly Amount' },
    emergencyStop: { ko: '긴급 정지', en: 'Emergency Stop' },
    
    // Execution Status
    pending: { ko: '대기중', en: 'Pending' },
    approved: { ko: '승인됨', en: 'Approved' },
    rejected: { ko: '거부됨', en: 'Rejected' },
    executed: { ko: '실행됨', en: 'Executed' },
    failed: { ko: '실패', en: 'Failed' },
    
    // Risk Assessment
    low: { ko: '낮음', en: 'Low' },
    medium: { ko: '중간', en: 'Medium' },
    high: { ko: '높음', en: 'High' },
    proceed: { ko: '진행', en: 'Proceed' },
    caution: { ko: '주의', en: 'Caution' },
    stop: { ko: '중지', en: 'Stop' },
    
    // Actions
    enable: { ko: '활성화', en: 'Enable' },
    disable: { ko: '비활성화', en: 'Disable' },
    edit: { ko: '편집', en: 'Edit' },
    delete: { ko: '삭제', en: 'Delete' },
    approve: { ko: '승인', en: 'Approve' },
    reject: { ko: '거부', en: 'Reject' },
    view: { ko: '보기', en: 'View' },
    
    // Analytics
    totalRules: { ko: '총 규칙 수', en: 'Total Rules' },
    activeRules: { ko: '활성 규칙', en: 'Active Rules' },
    totalExecutions: { ko: '총 실행 수', en: 'Total Executions' },
    successRate: { ko: '성공률', en: 'Success Rate' },
    totalSavings: { ko: '총 절약액', en: 'Total Savings' },
    avgSavings: { ko: '평균 절약액', en: 'Average Savings' }
  };

  const routes = [
    { value: 'kr-la', label: lang === 'ko' ? '한국-LA' : 'Korea-LA' },
    { value: 'kr-ny', label: lang === 'ko' ? '한국-뉴욕' : 'Korea-New York' },
    { value: 'kr-eu', label: lang === 'ko' ? '한국-유럽' : 'Korea-Europe' },
    { value: 'kr-cn', label: lang === 'ko' ? '한국-중국' : 'Korea-China' },
    { value: 'kr-jp', label: lang === 'ko' ? '한국-일본' : 'Korea-Japan' }
  ];

  const containerTypes = ['20GP', '40GP', '40HC', '45HC', 'RF'];

  useEffect(() => {
    // Initialize with mock data
    const mockRules: AutoBookingRule[] = [
      {
        id: 'rule-1',
        name: lang === 'ko' ? 'LA 항로 운임 하락 자동 부킹' : 'LA Route Rate Drop Auto Booking',
        enabled: true,
        conditions: {
          routes: ['kr-la'],
          rateThreshold: 2800,
          comparison: 'below',
          containerTypes: ['40HC'],
          minQuantity: 10,
          maxQuantity: 50,
          riskLevel: 'low'
        },
        actions: {
          autoExecute: false,
          requireApproval: true,
          approvers: ['manager@kmtc.com', 'director@kmtc.com'],
          maxAmount: 100000,
          notifyChannels: ['email', 'slack']
        },
        riskControls: {
          maxDailyBookings: 3,
          maxWeeklyAmount: 500000,
          blackoutDates: [],
          emergencyStop: false
        },
        createdAt: new Date('2024-12-01'),
        lastTriggered: new Date('2024-12-10'),
        executionCount: 5,
        totalSavings: 7500
      },
      {
        id: 'rule-2',
        name: lang === 'ko' ? '유럽 항로 대량 부킹 기회' : 'Europe Route Bulk Booking Opportunity',
        enabled: false,
        conditions: {
          routes: ['kr-eu'],
          rateThreshold: 3200,
          comparison: 'below',
          containerTypes: ['40GP', '40HC'],
          minQuantity: 20,
          maxQuantity: 100,
          riskLevel: 'medium'
        },
        actions: {
          autoExecute: false,
          requireApproval: true,
          approvers: ['director@kmtc.com'],
          maxAmount: 200000,
          notifyChannels: ['email']
        },
        riskControls: {
          maxDailyBookings: 2,
          maxWeeklyAmount: 800000,
          blackoutDates: ['2024-12-25', '2024-01-01'],
          emergencyStop: false
        },
        createdAt: new Date('2024-11-15'),
        executionCount: 2,
        totalSavings: 12000
      }
    ];

    const mockExecutions: AutoBookingExecution[] = [
      {
        id: 'exec-1',
        ruleId: 'rule-1',
        ruleName: mockRules[0].name,
        triggeredAt: new Date('2024-12-11T10:30:00'),
        status: 'pending',
        bookingDetails: {
          route: 'kr-la',
          containerType: '40HC',
          quantity: 25,
          proposedRate: 2750,
          marketRate: 2850,
          estimatedSavings: 2500
        },
        approvalFlow: {
          requiredApprovers: ['manager@kmtc.com', 'director@kmtc.com'],
          approvedBy: [],
          rejectedBy: [],
          comments: []
        },
        riskAssessment: {
          score: 0.3,
          factors: ['Low market volatility', 'Stable route', 'Good carrier reliability'],
          recommendation: 'proceed'
        }
      },
      {
        id: 'exec-2',
        ruleId: 'rule-1',
        ruleName: mockRules[0].name,
        triggeredAt: new Date('2024-12-10T14:15:00'),
        status: 'executed',
        bookingDetails: {
          route: 'kr-la',
          containerType: '40HC',
          quantity: 30,
          proposedRate: 2720,
          marketRate: 2820,
          estimatedSavings: 3000
        },
        approvalFlow: {
          requiredApprovers: ['manager@kmtc.com'],
          approvedBy: ['manager@kmtc.com'],
          rejectedBy: [],
          comments: ['Good opportunity, approved for execution']
        },
        executionResult: {
          bookingNumber: 'KMTC20241210001',
          finalRate: 2720,
          actualSavings: 3000
        },
        riskAssessment: {
          score: 0.2,
          factors: ['Excellent market conditions', 'High confidence prediction'],
          recommendation: 'proceed'
        }
      }
    ];

    setRules(mockRules);
    setExecutions(mockExecutions);
  }, [lang]);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleApproveExecution = (executionId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? { 
            ...exec, 
            status: 'approved',
            approvalFlow: {
              ...exec.approvalFlow,
              approvedBy: [...exec.approvalFlow.approvedBy, 'current-user@kmtc.com']
            }
          }
        : exec
    ));
  };

  const handleRejectExecution = (executionId: string, reason: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? { 
            ...exec, 
            status: 'rejected',
            approvalFlow: {
              ...exec.approvalFlow,
              rejectedBy: [...exec.approvalFlow.rejectedBy, 'current-user@kmtc.com'],
              comments: [...exec.approvalFlow.comments, reason]
            }
          }
        : exec
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'executed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'failed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const calculateAnalytics = () => {
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.enabled).length;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(exec => exec.status === 'executed').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    const totalSavings = rules.reduce((sum, rule) => sum + rule.totalSavings, 0);
    const avgSavings = totalRules > 0 ? totalSavings / totalRules : 0;

    return {
      totalRules,
      activeRules,
      totalExecutions,
      successRate,
      totalSavings,
      avgSavings
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.title[lang]}</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {lang === 'ko' ? '조건 기반 자동 부킹 및 승인 워크플로우' : 'Condition-based auto booking with approval workflow'}
            </p>
          </div>
        </div>
        
        {/* System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{t.systemStatus[lang]}:</span>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
              systemStatus === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              systemStatus === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {systemStatus === 'running' && <Play className="w-3 h-3" />}
              {systemStatus === 'paused' && <Pause className="w-3 h-3" />}
              {systemStatus === 'maintenance' && <Settings className="w-3 h-3" />}
              {t[systemStatus][lang]}
            </div>
          </div>
          
          <button
            onClick={() => setSystemStatus(systemStatus === 'running' ? 'paused' : 'running')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              systemStatus === 'running' 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {systemStatus === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalRules[lang]}</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.totalRules}</p>
            </div>
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.activeRules[lang]}</p>
              <p className="text-2xl font-bold text-green-600">{analytics.activeRules}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalExecutions[lang]}</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.totalExecutions}</p>
            </div>
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.successRate[lang]}</p>
              <p className="text-2xl font-bold text-indigo-600">{analytics.successRate.toFixed(1)}%</p>
            </div>
            <TrendingDown className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalSavings[lang]}</p>
              <p className="text-2xl font-bold text-green-600">${analytics.totalSavings.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.avgSavings[lang]}</p>
              <p className="text-2xl font-bold text-orange-600">${analytics.avgSavings.toFixed(0)}</p>
            </div>
            <TrendingDown className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-8">
          {(['rules', 'executions', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {t[tab][lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Create Rule Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateRule(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.createRule[lang]}
            </button>
          </div>

          {/* Rules List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rules.map(rule => (
              <div key={rule.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{rule.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>Routes: {rule.conditions.routes.join(', ')}</span>
                      <span>•</span>
                      <span>${rule.conditions.rateThreshold} {rule.conditions.comparison}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Risk Level:</span>
                    <span className={`font-semibold ${getRiskColor(rule.conditions.riskLevel)}`}>
                      {t[rule.conditions.riskLevel as keyof typeof t][lang]}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Auto Execute:</span>
                    <span className={rule.actions.autoExecute ? 'text-green-600' : 'text-yellow-600'}>
                      {rule.actions.autoExecute ? 'Yes' : 'Approval Required'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Executions:</span>
                    <span className="font-semibold">{rule.executionCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total Savings:</span>
                    <span className="font-semibold text-green-600">${rule.totalSavings.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    title={t.view[lang]}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="p-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition"
                    title={t.edit[lang]}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title={t.delete[lang]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="space-y-4">
          {executions.map(execution => (
            <div key={execution.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{execution.ruleName}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Triggered: {execution.triggeredAt.toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(execution.status)}`}>
                  {t[execution.status as keyof typeof t][lang]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Route</p>
                  <p className="font-semibold">{execution.bookingDetails.route}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quantity</p>
                  <p className="font-semibold">{execution.bookingDetails.quantity} TEU</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Proposed Rate</p>
                  <p className="font-semibold text-green-600">${execution.bookingDetails.proposedRate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Est. Savings</p>
                  <p className="font-semibold text-green-600">${execution.bookingDetails.estimatedSavings}</p>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Risk Assessment</span>
                  <span className={`text-sm font-semibold ${getRiskColor(execution.riskAssessment.recommendation)}`}>
                    {t[execution.riskAssessment.recommendation as keyof typeof t][lang]}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Score: {(execution.riskAssessment.score * 100).toFixed(0)}% • {execution.riskAssessment.factors.join(', ')}
                </div>
              </div>

              {/* Actions */}
              {execution.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleRejectExecution(execution.id, 'Risk too high')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    {t.reject[lang]}
                  </button>
                  <button
                    onClick={() => handleApproveExecution(execution.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {t.approve[lang]}
                  </button>
                </div>
              )}

              {execution.executionResult && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Execution Result</span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Booking: {execution.executionResult.bookingNumber} • 
                    Final Rate: ${execution.executionResult.finalRate} • 
                    Actual Savings: ${execution.executionResult.actualSavings}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoBookingEngine;