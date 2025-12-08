/**
 * Data Quality Panel Component
 * SHACL 기반 데이터 품질 검증 대시보드
 */

import React, { useState } from 'react';
import {
  shaclValidator,
  ValidationResult,
  ShipperData,
  BookingData,
  PredictionData,
  RouteData,
} from '../services/shaclValidator';

export const DataQualityPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shipper' | 'booking' | 'prediction' | 'route'>('shipper');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // 샘플 데이터
  const sampleShipper: ShipperData = {
    shipperId: 'SHP001',
    shipperName: 'Samsung Electronics',
    businessType: 'Electronics',
    avgMonthlyVolume: 650,
    bookingFrequency: 3.5,
    churnRisk: 0.15,
    customerGrade: 'VIP',
  };
  
  const sampleBooking: BookingData = {
    bookingId: 'BK0000000001',
    bookingDate: new Date().toISOString(),
    bookingQty: 50,
    containerType: '40HC',
    freightRate: 2500,
    bookingStatus: 'Confirmed',
    shipperId: 'SHP001',
    routeCode: 'RT001',
  };
  
  const samplePrediction: PredictionData = {
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 0.92,
    predictedVolume: 45,
    modelVersion: 'v1.2.3',
    predictionDate: new Date().toISOString(),
    shipperId: 'SHP001',
  };

  const sampleRoute: RouteData = {
    routeCode: 'RT001',
    routeName: 'Korea-LA Express',
    originPort: 'PUS',
    destinationPort: 'LAX',
    transitTime: 14,
    baseRate: 2800,
  };
  
  // 검증 실행
  const runValidation = () => {
    let result: ValidationResult;
    
    switch (activeTab) {
      case 'shipper':
        result = shaclValidator.validateShipper(sampleShipper);
        break;
      case 'booking':
        result = shaclValidator.validateBooking(sampleBooking);
        break;
      case 'prediction':
        result = shaclValidator.validatePrediction(samplePrediction);
        break;
      case 'route':
        result = shaclValidator.validateRoute(sampleRoute);
        break;
    }
    
    setValidationResult(result);
  };
  
  // 심각도별 색상
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            데이터 품질 검증 (SHACL)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            데이터 무결성 및 비즈니스 규칙 준수 검증
          </p>
        </div>
      </div>
      
      {/* 탭 메뉴 */}
      <div className="flex space-x-1 mb-6 mt-6 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
        {[
          { key: 'shipper', label: '화주', icon: '👤' },
          { key: 'booking', label: '부킹', icon: '📦' },
          { key: 'prediction', label: '예측', icon: '🔮' },
          { key: 'route', label: '항로', icon: '🚢' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setValidationResult(null);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="mr-1">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
      
      {/* 샘플 데이터 표시 */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">검증할 샘플 데이터:</h3>
        <pre className="text-xs text-slate-800 dark:text-slate-300 overflow-x-auto font-mono bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-600">
          {JSON.stringify(
            activeTab === 'shipper' ? sampleShipper :
            activeTab === 'booking' ? sampleBooking :
            activeTab === 'prediction' ? samplePrediction :
            sampleRoute,
            null,
            2
          )}
        </pre>
      </div>
      
      {/* 검증 실행 버튼 */}
      <button
        onClick={runValidation}
        className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        <span className="mr-2">🔍</span> SHACL 검증 실행
      </button>

      {/* 검증 결과 */}
      {validationResult && (
        <div className="space-y-4">
          {/* 요약 */}
          <div className={`p-4 rounded-lg border ${
            validationResult.isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {validationResult.isValid ? '✅ 검증 통과' : '❌ 검증 실패'}
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">총 검사:</span> {validationResult.summary.totalChecks} |{' '}
                <span className="font-medium text-green-600 dark:text-green-400">통과:</span> {validationResult.summary.passed} |{' '}
                <span className="font-medium text-red-600 dark:text-red-400">실패:</span> {validationResult.summary.failed}
              </div>
            </div>
            {validationResult.isValid && (
              <p className="text-sm text-green-700 dark:text-green-300">
                모든 SHACL 제약조건을 만족합니다. 데이터 품질이 우수합니다.
              </p>
            )}
          </div>
          
          {/* 위반 사항 목록 */}
          {validationResult.violations.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
                검증 결과 상세:
              </h3>
              <div className="space-y-3">
                {validationResult.violations.map((violation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      violation.severity === 'error' 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                        : violation.severity === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{getSeverityIcon(violation.severity)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wide ${
                            violation.severity === 'error' 
                              ? 'text-red-700 dark:text-red-300' 
                              : violation.severity === 'warning'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-blue-700 dark:text-blue-300'
                          }`}>
                            {violation.severity}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {violation.shape}
                          </span>
                        </div>
                        {violation.property && (
                          <div className="text-sm mb-2">
                            <span className="text-slate-600 dark:text-slate-400">속성:</span>{' '}
                            <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
                              {violation.property}
                            </code>
                          </div>
                        )}
                        {violation.value !== undefined && (
                          <div className="text-sm mb-2">
                            <span className="text-slate-600 dark:text-slate-400">값:</span>{' '}
                            <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
                              {JSON.stringify(violation.value)}
                            </code>
                          </div>
                        )}
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{violation.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* SHACL 규칙 설명 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <span>💡</span> SHACL 제약조건이란?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              SHACL (Shapes Constraint Language)은 RDF 데이터의 품질을 검증하는 W3C 표준입니다.
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                <span>필수 필드 검증 (minCount, maxCount)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                <span>데이터 타입 검증 (datatype)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                <span>값 범위 검증 (minInclusive, maxInclusive)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                <span>패턴 매칭 (pattern, regex)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                <span>관계 검증 (class, node)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                <span>복합 비즈니스 규칙 (SPARQL)</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {/* 온톨로지 파일 정보 */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <span>📁</span> 관련 파일
        </h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-600 dark:text-slate-400">온톨로지:</span>
            <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
              ontology/kmtc_booking_ontology.ttl
            </code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-600 dark:text-slate-400">SHACL 제약조건:</span>
            <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
              ontology/kmtc_booking_shacl.ttl
            </code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-slate-600 dark:text-slate-400">검증 서비스:</span>
            <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
              services/shaclValidator.ts
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
