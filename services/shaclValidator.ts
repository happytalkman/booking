/**
 * SHACL Validator Service
 * KMTC 부킹 시스템 데이터 품질 검증
 * 
 * SHACL (Shapes Constraint Language) 기반 데이터 검증
 * - 화주, 부킹, 예측, 항로 등 핵심 엔티티 검증
 * - 비즈니스 규칙 준수 확인
 * - 데이터 무결성 보장
 */

export interface ValidationResult {
  isValid: boolean;
  violations: ValidationViolation[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
  };
}

export interface ValidationViolation {
  severity: 'error' | 'warning' | 'info';
  shape: string;
  property?: string;
  value?: any;
  message: string;
  path?: string;
}

export interface ShipperData {
  shipperId: string;
  shipperName: string;
  businessType?: string;
  avgMonthlyVolume?: number;
  bookingFrequency?: number;
  churnRisk?: number;
  customerGrade?: 'VIP' | 'GradeA' | 'GradeB' | 'GradeC';
}

export interface BookingData {
  bookingId: string;
  bookingDate: string;
  bookingQty: number;
  containerType: string;
  freightRate: number;
  bookingStatus: string;
  shipperId: string;
  routeCode: string;
  cancellationReason?: string;
}

export interface PredictionData {
  predictedDate: string;
  confidence: number;
  predictedVolume?: number;
  modelVersion: string;
  predictionDate: string;
  shipperId: string;
}

export interface RouteData {
  routeCode: string;
  routeName: string;
  originPort: string;
  destinationPort: string;
  transitTime: number;
  baseRate: number;
}

/**
 * SHACL Validator 클래스
 */
export class SHACLValidator {
  
  /**
   * 화주 데이터 검증
   */
  validateShipper(data: ShipperData): ValidationResult {
    const violations: ValidationViolation[] = [];
    
    // 화주코드 검증 (필수, 형식: SHP + 3자리 이상 숫자)
    if (!data.shipperId) {
      violations.push({
        severity: 'error',
        shape: 'ShipperShape',
        property: 'shipperId',
        message: '화주코드는 필수입니다',
      });
    } else if (!/^SHP[0-9]{3,}$/.test(data.shipperId)) {
      violations.push({
        severity: 'error',
        shape: 'ShipperShape',
        property: 'shipperId',
        value: data.shipperId,
        message: "화주코드는 'SHP'로 시작하고 3자리 이상 숫자여야 합니다 (예: SHP001, SHP1234)",
      });
    }
    
    // 화주명 검증 (필수, 2~200자)
    if (!data.shipperName) {
      violations.push({
        severity: 'error',
        shape: 'ShipperShape',
        property: 'shipperName',
        message: '화주명은 필수입니다',
      });
    } else if (data.shipperName.length < 2 || data.shipperName.length > 200) {
      violations.push({
        severity: 'error',
        shape: 'ShipperShape',
        property: 'shipperName',
        value: data.shipperName,
        message: '화주명은 2~200자 사이여야 합니다',
      });
    }
    
    // 업종 검증 (선택, 제한된 값)
    if (data.businessType) {
      const validTypes = ['Electronics', 'Auto Parts', 'Chemicals', 'Textiles', 'Food', 'Machinery', 'Furniture', 'Other'];
      if (!validTypes.includes(data.businessType)) {
        violations.push({
          severity: 'error',
          shape: 'ShipperShape',
          property: 'businessType',
          value: data.businessType,
          message: `업종은 ${validTypes.join(', ')} 중 하나여야 합니다`,
        });
      }
    }
    
    // 월평균물량 검증 (0~100,000 TEU)
    if (data.avgMonthlyVolume !== undefined) {
      if (data.avgMonthlyVolume < 0 || data.avgMonthlyVolume > 100000) {
        violations.push({
          severity: 'error',
          shape: 'ShipperShape',
          property: 'avgMonthlyVolume',
          value: data.avgMonthlyVolume,
          message: '월평균물량은 0~100,000 TEU 사이여야 합니다',
        });
      }
    }
    
    // 부킹빈도 검증 (0~100)
    if (data.bookingFrequency !== undefined) {
      if (data.bookingFrequency < 0 || data.bookingFrequency > 100) {
        violations.push({
          severity: 'error',
          shape: 'ShipperShape',
          property: 'bookingFrequency',
          value: data.bookingFrequency,
          message: '부킹빈도는 0~100 사이여야 합니다',
        });
      }
    }
    
    // 이탈위험도 검증 (0.0~1.0)
    if (data.churnRisk !== undefined) {
      if (data.churnRisk < 0.0 || data.churnRisk > 1.0) {
        violations.push({
          severity: 'error',
          shape: 'ShipperShape',
          property: 'churnRisk',
          value: data.churnRisk,
          message: '이탈위험도는 0.0~1.0 사이여야 합니다',
        });
      }
    }
    
    // 고객등급 검증
    if (data.customerGrade) {
      const validGrades = ['VIP', 'GradeA', 'GradeB', 'GradeC'];
      if (!validGrades.includes(data.customerGrade)) {
        violations.push({
          severity: 'error',
          shape: 'ShipperShape',
          property: 'customerGrade',
          value: data.customerGrade,
          message: '고객등급은 VIP, GradeA, GradeB, GradeC 중 하나여야 합니다',
        });
      }
    }
    
    // VIP 고객 자동 분류 규칙
    if (data.avgMonthlyVolume && data.avgMonthlyVolume >= 500 && data.customerGrade !== 'VIP') {
      violations.push({
        severity: 'warning',
        shape: 'VIPShipperRule',
        message: '월평균 500 TEU 이상인 화주는 VIP 등급이어야 합니다',
      });
    }
    
    // 이탈 위험 고객 규칙
    if (data.churnRisk && data.churnRisk >= 0.7) {
      violations.push({
        severity: 'warning',
        shape: 'ChurnRiskShipperRule',
        message: '이탈위험도 0.7 이상인 화주는 특별 관리가 필요합니다',
      });
    }
    
    return this.buildResult(violations);
  }

  /**
   * 부킹 데이터 검증
   */
  validateBooking(data: BookingData): ValidationResult {
    const violations: ValidationViolation[] = [];
    
    // 부킹번호 검증 (필수, 형식: BK + 10자리 숫자)
    if (!data.bookingId) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'bookingId',
        message: '부킹번호는 필수입니다',
      });
    } else if (!/^BK[0-9]{10}$/.test(data.bookingId)) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'bookingId',
        value: data.bookingId,
        message: "부킹번호는 'BK'로 시작하고 10자리 숫자여야 합니다 (예: BK0000000001)",
      });
    }
    
    // 부킹일자 검증 (필수)
    if (!data.bookingDate) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'bookingDate',
        message: '부킹일자는 필수입니다',
      });
    } else {
      const date = new Date(data.bookingDate);
      if (isNaN(date.getTime())) {
        violations.push({
          severity: 'error',
          shape: 'BookingShape',
          property: 'bookingDate',
          value: data.bookingDate,
          message: '부킹일자 형식이 올바르지 않습니다',
        });
      }
    }
    
    // 부킹수량 검증 (1~10,000 TEU)
    if (!data.bookingQty) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'bookingQty',
        message: '부킹수량은 필수입니다',
      });
    } else if (data.bookingQty < 1 || data.bookingQty > 10000) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'bookingQty',
        value: data.bookingQty,
        message: '부킹수량은 1~10,000 TEU 사이여야 합니다',
      });
    }
    
    // 컨테이너타입 검증 (필수, 제한된 값)
    if (!data.containerType) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'containerType',
        message: '컨테이너타입은 필수입니다',
      });
    } else {
      const validTypes = ['20GP', '40GP', '40HC', '45HC', 'RF'];
      if (!validTypes.includes(data.containerType)) {
        violations.push({
          severity: 'error',
          shape: 'BookingShape',
          property: 'containerType',
          value: data.containerType,
          message: `컨테이너타입은 ${validTypes.join(', ')} 중 하나여야 합니다`,
        });
      }
    }
    
    // 운임단가 검증 (0 < rate <= 50,000)
    if (!data.freightRate) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'freightRate',
        message: '운임단가는 필수입니다',
      });
    } else if (data.freightRate <= 0 || data.freightRate > 50000) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'freightRate',
        value: data.freightRate,
        message: '운임단가는 0보다 크고 50,000 USD 이하여야 합니다',
      });
    }
    
    // 부킹상태 검증 (필수, 제한된 값)
    if (!data.bookingStatus) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'bookingStatus',
        message: '부킹상태는 필수입니다',
      });
    } else {
      const validStatuses = ['Confirmed', 'Pending', 'Cancelled', 'Completed', 'NoShow'];
      if (!validStatuses.includes(data.bookingStatus)) {
        violations.push({
          severity: 'error',
          shape: 'BookingShape',
          property: 'bookingStatus',
          value: data.bookingStatus,
          message: `부킹상태는 ${validStatuses.join(', ')} 중 하나여야 합니다`,
        });
      }
    }
    
    // 화주 연결 검증
    if (!data.shipperId) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'shipperId',
        message: '부킹은 화주와 연결되어야 합니다',
      });
    }
    
    // 항로 연결 검증
    if (!data.routeCode) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'routeCode',
        message: '부킹은 항로와 연결되어야 합니다',
      });
    }
    
    // 취소사유 검증 (취소 상태일 때만 필수)
    if (data.bookingStatus === 'Cancelled' && !data.cancellationReason) {
      violations.push({
        severity: 'error',
        shape: 'BookingShape',
        property: 'cancellationReason',
        message: '부킹이 취소 상태일 때는 취소사유가 필수입니다',
      });
    }
    
    return this.buildResult(violations);
  }

  /**
   * 예측 데이터 검증
   */
  validatePrediction(data: PredictionData): ValidationResult {
    const violations: ValidationViolation[] = [];
    
    // 예상부킹일 검증 (필수)
    if (!data.predictedDate) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'predictedDate',
        message: '예상부킹일은 필수입니다',
      });
    } else {
      const date = new Date(data.predictedDate);
      if (isNaN(date.getTime())) {
        violations.push({
          severity: 'error',
          shape: 'PredictionShape',
          property: 'predictedDate',
          value: data.predictedDate,
          message: '예상부킹일 형식이 올바르지 않습니다',
        });
      }
    }
    
    // 신뢰도 검증 (필수, 0.0~1.0)
    if (data.confidence === undefined || data.confidence === null) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'confidence',
        message: '신뢰도는 필수입니다',
      });
    } else if (data.confidence < 0.0 || data.confidence > 1.0) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'confidence',
        value: data.confidence,
        message: '신뢰도는 0.0~1.0 사이여야 합니다',
      });
    }
    
    // 예상물량 검증 (선택, 1~10,000 TEU)
    if (data.predictedVolume !== undefined) {
      if (data.predictedVolume < 1 || data.predictedVolume > 10000) {
        violations.push({
          severity: 'error',
          shape: 'PredictionShape',
          property: 'predictedVolume',
          value: data.predictedVolume,
          message: '예상물량은 1~10,000 TEU 사이여야 합니다',
        });
      }
    }
    
    // 모델버전 검증 (필수, 형식: v1.0.0)
    if (!data.modelVersion) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'modelVersion',
        message: '모델버전은 필수입니다',
      });
    } else if (!/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(data.modelVersion)) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'modelVersion',
        value: data.modelVersion,
        message: "모델버전은 'v1.0.0' 형식이어야 합니다",
      });
    }
    
    // 예측생성일 검증 (필수)
    if (!data.predictionDate) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'predictionDate',
        message: '예측생성일은 필수입니다',
      });
    } else {
      const date = new Date(data.predictionDate);
      if (isNaN(date.getTime())) {
        violations.push({
          severity: 'error',
          shape: 'PredictionShape',
          property: 'predictionDate',
          value: data.predictionDate,
          message: '예측생성일 형식이 올바르지 않습니다',
        });
      }
    }
    
    // 화주 연결 검증
    if (!data.shipperId) {
      violations.push({
        severity: 'error',
        shape: 'PredictionShape',
        property: 'shipperId',
        message: '예측은 화주와 연결되어야 합니다',
      });
    }
    
    // 예측일이 생성일보다 미래인지 검증
    if (data.predictedDate && data.predictionDate) {
      const predicted = new Date(data.predictedDate);
      const created = new Date(data.predictionDate);
      if (!isNaN(predicted.getTime()) && !isNaN(created.getTime())) {
        if (predicted <= created) {
          violations.push({
            severity: 'error',
            shape: 'PredictionShape',
            message: '예상부킹일은 예측생성일보다 미래여야 합니다',
          });
        }
      }
    }
    
    // 고신뢰도 예측 규칙
    if (data.confidence >= 0.85) {
      violations.push({
        severity: 'info',
        shape: 'HighConfidencePredictionRule',
        message: '신뢰도 0.85 이상인 고신뢰도 예측입니다. 알림 생성을 권장합니다',
      });
    }
    
    return this.buildResult(violations);
  }

  /**
   * 항로 데이터 검증
   */
  validateRoute(data: RouteData): ValidationResult {
    const violations: ValidationViolation[] = [];
    
    // 항로코드 검증 (필수, 형식: RT + 3자리 숫자)
    if (!data.routeCode) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'routeCode',
        message: '항로코드는 필수입니다',
      });
    } else if (!/^RT[0-9]{3}$/.test(data.routeCode)) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'routeCode',
        value: data.routeCode,
        message: "항로코드는 'RT'로 시작하고 3자리 숫자여야 합니다 (예: RT001)",
      });
    }
    
    // 항로명 검증 (필수, 3~100자)
    if (!data.routeName) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'routeName',
        message: '항로명은 필수입니다',
      });
    } else if (data.routeName.length < 3 || data.routeName.length > 100) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'routeName',
        value: data.routeName,
        message: '항로명은 3~100자 사이여야 합니다',
      });
    }
    
    // 출발항 검증 (필수, 3자리 대문자 코드)
    if (!data.originPort) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'originPort',
        message: '출발항은 필수입니다',
      });
    } else if (!/^[A-Z]{3}$/.test(data.originPort)) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'originPort',
        value: data.originPort,
        message: '출발항은 3자리 대문자 코드여야 합니다 (예: ICN, PUS)',
      });
    }
    
    // 도착항 검증 (필수, 3자리 대문자 코드)
    if (!data.destinationPort) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'destinationPort',
        message: '도착항은 필수입니다',
      });
    } else if (!/^[A-Z]{3}$/.test(data.destinationPort)) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'destinationPort',
        value: data.destinationPort,
        message: '도착항은 3자리 대문자 코드여야 합니다 (예: LAX, SIN)',
      });
    }
    
    // 출발항과 도착항이 다른지 검증
    if (data.originPort && data.destinationPort && data.originPort === data.destinationPort) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        message: '출발항과 도착항은 달라야 합니다',
      });
    }
    
    // 운항소요일 검증 (필수, 1~90일)
    if (!data.transitTime) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'transitTime',
        message: '운항소요일은 필수입니다',
      });
    } else if (data.transitTime < 1 || data.transitTime > 90) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'transitTime',
        value: data.transitTime,
        message: '운항소요일은 1~90일 사이여야 합니다',
      });
    }
    
    // 기본운임 검증 (필수, 0 < rate <= 50,000)
    if (!data.baseRate) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'baseRate',
        message: '기본운임은 필수입니다',
      });
    } else if (data.baseRate <= 0 || data.baseRate > 50000) {
      violations.push({
        severity: 'error',
        shape: 'RouteShape',
        property: 'baseRate',
        value: data.baseRate,
        message: '기본운임은 0보다 크고 50,000 USD 이하여야 합니다',
      });
    }
    
    return this.buildResult(violations);
  }
  
  /**
   * 검증 결과 빌드
   */
  private buildResult(violations: ValidationViolation[]): ValidationResult {
    const errors = violations.filter(v => v.severity === 'error');
    const warnings = violations.filter(v => v.severity === 'warning');
    const infos = violations.filter(v => v.severity === 'info');
    
    return {
      isValid: errors.length === 0,
      violations,
      summary: {
        totalChecks: violations.length,
        passed: infos.length,
        failed: errors.length + warnings.length,
      },
    };
  }
  
  /**
   * 배치 검증 (여러 데이터 동시 검증)
   */
  validateBatch(data: {
    shippers?: ShipperData[];
    bookings?: BookingData[];
    predictions?: PredictionData[];
    routes?: RouteData[];
  }): {
    shippers: ValidationResult[];
    bookings: ValidationResult[];
    predictions: ValidationResult[];
    routes: ValidationResult[];
    overallValid: boolean;
  } {
    const results = {
      shippers: (data.shippers || []).map(s => this.validateShipper(s)),
      bookings: (data.bookings || []).map(b => this.validateBooking(b)),
      predictions: (data.predictions || []).map(p => this.validatePrediction(p)),
      routes: (data.routes || []).map(r => this.validateRoute(r)),
      overallValid: true,
    };
    
    // 전체 유효성 확인
    results.overallValid = [
      ...results.shippers,
      ...results.bookings,
      ...results.predictions,
      ...results.routes,
    ].every(r => r.isValid);
    
    return results;
  }
}

// 싱글톤 인스턴스
export const shaclValidator = new SHACLValidator();
