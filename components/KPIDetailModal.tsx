/**
 * KPI Detail Modal Component
 * KPI 드릴다운 상세 분석
 */

import React from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, PieChart, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiTitle: string;
  kpiValue: string;
  kpiIcon: any;
}

export const KPIDetailModal: React.FC<KPIDetailModalProps> = ({
  isOpen,
  onClose,
  kpiTitle,
  kpiValue,
  kpiIcon: Icon,
}) => {
  if (!isOpen) return null;

  // 예측 vs 실제 데이터
  const forecastData = [
    { month: '1월', predicted: 850, actual: 820 },
    { month: '2월', predicted: 900, actual: 920 },
    { month: '3월', predicted: 950, actual: 940 },
    { month: '4월', predicted: 1000, actual: 980 },
    { month: '5월', predicted: 1050, actual: 1080 },
    { month: '6월', predicted: 1100, actual: 1120 },
  ];

  // 구성 요소별 분해
  const breakdownData = [
    { name: '한중 항로', value: 35, color: '#3b82f6' },
    { name: '한미 항로', value: 28, color: '#8b5cf6' },
    { name: '한일 항로', value: 20, color: '#10b981' },
    { name: '동남아 항로', value: 12, color: '#f59e0b' },
    { name: '기타', value: 5, color: '#64748b' },
  ];

  // 이상치 탐지
  const anomalies = [
    { date: '2024-12-05', type: 'spike', message: '한중 항로 부킹 급증 (+45%)', severity: 'info' },
    { date: '2024-12-03', type: 'drop', message: '한일 항로 취소율 증가', severity: 'warning' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpiTitle}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">상세 분석 및 드릴다운</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Value */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">현재 값</p>
                <h3 className="text-4xl font-bold">{kpiValue}</h3>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5%</span>
                </div>
                <p className="text-xs opacity-75">전월 대비</p>
              </div>
            </div>
          </div>

          {/* 예측 vs 실제 비교 */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">예측 vs 실제 비교</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="AI 예측"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="실제 값"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">평균 오차</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">2.3%</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">예측 정확도</p>
                <p className="text-lg font-bold text-green-600">97.7%</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">신뢰 구간</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">±5%</p>
              </div>
            </div>
          </div>

          {/* 구성 요소별 분해 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">항로별 구성</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {breakdownData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 이상치 탐지 */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">이상 패턴 탐지</h3>
              </div>
              <div className="space-y-3">
                {anomalies.map((anomaly, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      anomaly.severity === 'warning' 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {anomaly.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {anomaly.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {anomaly.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    전반적으로 안정적인 추세
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            닫기
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            리포트 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};
