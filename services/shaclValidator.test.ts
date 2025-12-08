/**
 * SHACL Validator 테스트
 * 데이터 품질 검증 로직 단위 테스트
 */

import { shaclValidator, ShipperData, BookingData, PredictionData, RouteData } from './shaclValidator';

// 테스트 실행 함수
function runTests() {
  console.log('🧪 SHACL Validator 테스트 시작\n');
  
  let passed = 0;
  let failed = 0;
  
  // 테스트 1: 유효한 화주 데이터
  console.log('📋 테스트 1: 유효한 화주 데이터');
  const validShipper: ShipperData = {
    shipperId: 'SHP001',
    shipperName: 'Samsung Electronics',
    businessType: 'Electronics',
    avgMonthlyVolume: 650,
    bookingFrequency: 3.5,
    churnRisk: 0.15,
    customerGrade: 'VIP',
  };
  const result1 = shaclValidator.validateShipper(validShipper);
  if (result1.isValid) {
    console.log('✅ 통과\n');
    passed++;
  } else {
    console.log('❌ 실패:', result1.violations[0]?.message, '\n');
    failed++;
  }
  
  // 테스트 2: 무효한 화주코드
  console.log('📋 테스트 2: 무효한 화주코드 (SHP1)');
  const invalidShipper: ShipperData = {
    shipperId: 'SHP1',
    shipperName: 'Test Company',
  };
  const result2 = shaclValidator.validateShipper(invalidShipper);
  if (!result2.isValid && result2.violations.some(v => v.property === 'shipperId')) {
    console.log('✅ 통과 (예상대로 실패)\n');
    passed++;
  } else {
    console.log('❌ 실패: 화주코드 검증이 작동하지 않음\n');
    failed++;
  }
  
  // 테스트 3: VIP 자동 분류 규칙
  console.log('📋 테스트 3: VIP 자동 분류 규칙');
  const vipShipper: ShipperData = {
    shipperId: 'SHP002',
    shipperName: 'LG Electronics',
    avgMonthlyVolume: 600,
    customerGrade: 'GradeA', // VIP여야 하는데 GradeA
  };
  const result3 = shaclValidator.validateShipper(vipShipper);
  if (result3.violations.some(v => v.shape === 'VIPShipperRule')) {
    console.log('✅ 통과 (VIP 규칙 경고 발생)\n');
    passed++;
  } else {
    console.log('❌ 실패: VIP 규칙이 작동하지 않음\n');
    failed++;
  }
  
  // 테스트 4: 유효한 부킹 데이터
  console.log('📋 테스트 4: 유효한 부킹 데이터');
  const validBooking: BookingData = {
    bookingId: 'BK0000000001',
    bookingDate: new Date().toISOString(),
    bookingQty: 50,
    containerType: '40HC',
    freightRate: 2500,
    bookingStatus: 'Confirmed',
    shipperId: 'SHP001',
    routeCode: 'RT001',
  };
  const result4 = shaclValidator.validateBooking(validBooking);
  if (result4.isValid) {
    console.log('✅ 통과\n');
    passed++;
  } else {
    console.log('❌ 실패:', result4.violations[0]?.message, '\n');
    failed++;
  }
  
  // 테스트 5: 취소 부킹 - 취소사유 누락
  console.log('📋 테스트 5: 취소 부킹 - 취소사유 누락');
  const cancelledBooking: BookingData = {
    bookingId: 'BK0000000002',
    bookingDate: new Date().toISOString(),
    bookingQty: 30,
    containerType: '20GP',
    freightRate: 1500,
    bookingStatus: 'Cancelled',
    shipperId: 'SHP001',
    routeCode: 'RT001',
    // cancellationReason 누락
  };
  const result5 = shaclValidator.validateBooking(cancelledBooking);
  if (!result5.isValid && result5.violations.some(v => v.property === 'cancellationReason')) {
    console.log('✅ 통과 (예상대로 실패)\n');
    passed++;
  } else {
    console.log('❌ 실패: 취소사유 검증이 작동하지 않음\n');
    failed++;
  }
  
  // 테스트 6: 유효한 예측 데이터
  console.log('📋 테스트 6: 유효한 예측 데이터');
  const validPrediction: PredictionData = {
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    confidence: 0.92,
    predictedVolume: 45,
    modelVersion: 'v1.2.3',
    predictionDate: new Date().toISOString(),
    shipperId: 'SHP001',
  };
  const result6 = shaclValidator.validatePrediction(validPrediction);
  if (result6.isValid) {
    console.log('✅ 통과\n');
    passed++;
  } else {
    console.log('❌ 실패:', result6.violations[0]?.message, '\n');
    failed++;
  }
  
  // 테스트 7: 예측일이 생성일보다 과거
  console.log('📋 테스트 7: 예측일이 생성일보다 과거');
  const invalidPrediction: PredictionData = {
    predictedDate: '2024-01-01T10:00:00Z',
    confidence: 0.85,
    modelVersion: 'v1.0.0',
    predictionDate: new Date().toISOString(),
    shipperId: 'SHP001',
  };
  const result7 = shaclValidator.validatePrediction(invalidPrediction);
  if (!result7.isValid) {
    console.log('✅ 통과 (예상대로 실패)\n');
    passed++;
  } else {
    console.log('❌ 실패: 날짜 순서 검증이 작동하지 않음\n');
    failed++;
  }
  
  // 테스트 8: 유효한 항로 데이터
  console.log('📋 테스트 8: 유효한 항로 데이터');
  const validRoute: RouteData = {
    routeCode: 'RT001',
    routeName: 'Korea-LA Express',
    originPort: 'PUS',
    destinationPort: 'LAX',
    transitTime: 14,
    baseRate: 2800,
  };
  const result8 = shaclValidator.validateRoute(validRoute);
  if (result8.isValid) {
    console.log('✅ 통과\n');
    passed++;
  } else {
    console.log('❌ 실패:', result8.violations[0]?.message, '\n');
    failed++;
  }
  
  // 테스트 9: 출발항과 도착항이 동일
  console.log('📋 테스트 9: 출발항과 도착항이 동일');
  const invalidRoute: RouteData = {
    routeCode: 'RT002',
    routeName: 'Invalid Route',
    originPort: 'PUS',
    destinationPort: 'PUS',
    transitTime: 1,
    baseRate: 1000,
  };
  const result9 = shaclValidator.validateRoute(invalidRoute);
  if (!result9.isValid) {
    console.log('✅ 통과 (예상대로 실패)\n');
    passed++;
  } else {
    console.log('❌ 실패: 항구 검증이 작동하지 않음\n');
    failed++;
  }
  
  // 테스트 10: 배치 검증
  console.log('📋 테스트 10: 배치 검증');
  const batchResult = shaclValidator.validateBatch({
    shippers: [validShipper],
    bookings: [validBooking],
    predictions: [validPrediction],
    routes: [validRoute],
  });
  if (batchResult.overallValid) {
    console.log('✅ 통과\n');
    passed++;
  } else {
    console.log('❌ 실패: 배치 검증 오류\n');
    failed++;
  }
  
  // 결과 요약
  console.log('═══════════════════════════════════');
  console.log(`📊 테스트 결과: ${passed}/${passed + failed} 통과`);
  console.log(`✅ 통과: ${passed}`);
  console.log(`❌ 실패: ${failed}`);
  console.log('═══════════════════════════════════\n');
  
  if (failed === 0) {
    console.log('🎉 모든 테스트 통과!');
  } else {
    console.log('⚠️  일부 테스트 실패');
  }
}

// 테스트 실행
if (typeof window === 'undefined') {
  // Node.js 환경
  runTests();
} else {
  // 브라우저 환경
  console.log('브라우저 콘솔에서 runSHACLTests() 함수를 호출하세요.');
  (window as any).runSHACLTests = runTests;
}

export { runTests };
