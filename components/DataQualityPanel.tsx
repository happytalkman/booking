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
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📊 데이터 품질 검증 (SHACL)
        </h2>
        <p className="text-gray-600">
          KMTC 부킹 시스템의 데이터 무결성 및 비즈니스 규칙 준수를 검증합니다
        </p>
      </div>
      
      {/* 탭 메뉴 */}
      <div className="flex space-x-2 mb-6 border-b">
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
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      
      {/* 샘플 데이터 표시 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">검증할 샘플 데이터:</h3>
        <pre className="text-sm text-gray-800 overflow-x-auto">
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
        className="w-full mb-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        🔍 SHACL 검증 실행
      </button>

      {/* 검증 결과 */}
      {validationResult && (
        <div className="space-y-4">
          {/* 요약 */}
          <div className={`p-4 rounded-lg ${
            validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                {validationResult.isValid ? '✅ 검증 통과' : '❌ 검증 실패'}
              </h3>
              <div className="text-sm">
                <span className="font-medium">총 검사:</span> {validationResult.summary.totalChecks} |{' '}
                <span className="font-medium text-green-600">통과:</span> {validationResult.summary.passed} |{' '}
                <span className="font-medium text-red-600">실패:</span> {validationResult.summary.failed}
              </div>
            </div>
            {validationResult.isValid && (
              <p className="text-green-700">
                모든 SHACL 제약조건을 만족합니다. 데이터 품질이 우수합니다.
              </p>
            )}
          </div>
          
          {/* 위반 사항 목록 */}
          {validationResult.violations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                검증 결과 상세:
              </h3>
              <div className="space-y-2">
                {validationResult.violations.map((violation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{getSeverityIcon(violation.severity)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm uppercase">
                            {violation.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {violation.shape}
                          </span>
                        </div>
                        {violation.property && (
                          <div className="text-sm font-medium mb-1">
                            속성: <code className="bg-white px-2 py-0.5 rounded">{violation.property}</code>
                          </div>
                        )}
                        {violation.value !== undefined && (
                          <div className="text-sm mb-1">
                            값: <code className="bg-white px-2 py-0.5 rounded">{JSON.stringify(violation.value)}</code>
                          </div>
                        )}
                        <p className="text-sm mt-2">{violation.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* SHACL 규칙 설명 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 SHACL 제약조건이란?</h3>
            <p className="text-sm text-blue-700 mb-2">
              SHACL (Shapes Constraint Language)은 RDF 데이터의 품질을 검증하는 W3C 표준입니다.
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>필수 필드 검증 (minCount, maxCount)</li>
              <li>데이터 타입 검증 (datatype)</li>
              <li>값 범위 검증 (minInclusive, maxInclusive)</li>
              <li>패턴 매칭 (pattern, regex)</li>
              <li>관계 검증 (class, node)</li>
              <li>복합 비즈니스 규칙 (SPARQL)</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* 온톨로지 파일 정보 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">📁 관련 파일</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">온톨로지:</span>{' '}
            <code className="bg-white px-2 py-0.5 rounded">ontology/kmtc_booking_ontology.ttl</code>
          </div>
          <div>
            <span className="font-medium">SHACL 제약조건:</span>{' '}
            <code className="bg-white px-2 py-0.5 rounded">ontology/kmtc_booking_shacl.ttl</code>
          </div>
          <div>
            <span className="font-medium">검증 서비스:</span>{' '}
            <code className="bg-white px-2 py-0.5 rounded">services/shaclValidator.ts</code>
          </div>
        </div>
      </div>
    </div>
  );
};
