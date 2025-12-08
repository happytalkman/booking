# KMTC SHACL 데이터 품질 검증 가이드

## 📋 개요

SHACL (Shapes Constraint Language)은 RDF 데이터의 품질을 검증하는 W3C 표준입니다.
KMTC 부킹 시스템에서는 SHACL을 사용하여 화주, 부킹, 예측, 항로 등 핵심 데이터의 무결성을 보장합니다.

## 🎯 검증 목적

1. **데이터 무결성**: 필수 필드 누락 방지
2. **형식 준수**: 코드 패턴, 날짜 형식 등 표준화
3. **비즈니스 규칙**: 도메인 특화 제약조건 적용
4. **관계 검증**: 엔티티 간 올바른 연결 확인

## 📁 파일 구조

```
ontology/
├── kmtc_booking_ontology.ttl    # OWL2 온톨로지 (도메인 모델)
├── kmtc_booking_shacl.ttl       # SHACL 제약조건 (검증 규칙)
└── SHACL_USAGE_GUIDE.md         # 이 문서

services/
└── shaclValidator.ts            # TypeScript 검증 서비스
```

## 🔍 검증 대상 및 규칙

### 1. 화주 (Shipper)

#### 필수 필드
- `shipperId`: 화주코드 (형식: `SHP` + 3자리 이상 숫자)
- `shipperName`: 화주명 (2~200자)

#### 선택 필드
- `businessType`: 업종 (Electronics, Auto Parts, Chemicals, Textiles, Food, Machinery, Furniture, Other)
- `avgMonthlyVolume`: 월평균물량 (0~100,000 TEU)
- `bookingFrequency`: 부킹빈도 (0~100)
- `churnRisk`: 이탈위험도 (0.0~1.0)
- `customerGrade`: 고객등급 (VIP, GradeA, GradeB, GradeC)

#### 비즈니스 규칙
- **VIP 자동 분류**: 월평균 500 TEU 이상 → VIP 등급
- **이탈 위험 관리**: 이탈위험도 0.7 이상 → 특별 관리 필요

#### 예제 (유효한 데이터)
```typescript
const validShipper = {
  shipperId: 'SHP001',
  shipperName: 'Samsung Electronics',
  businessType: 'Electronics',
  avgMonthlyVolume: 650,
  bookingFrequency: 3.5,
  churnRisk: 0.15,
  customerGrade: 'VIP'
};
```

#### 예제 (무효한 데이터)
```typescript
const invalidShipper = {
  shipperId: 'SHP1',              // ❌ 3자리 미만
  shipperName: 'S',               // ❌ 2자 미만
  avgMonthlyVolume: 150000,       // ❌ 100,000 초과
  churnRisk: 1.5                  // ❌ 1.0 초과
};
```

---

### 2. 부킹 (Booking)

#### 필수 필드
- `bookingId`: 부킹번호 (형식: `BK` + 10자리 숫자)
- `bookingDate`: 부킹일자 (ISO 8601 형식)
- `bookingQty`: 부킹수량 (1~10,000 TEU)
- `containerType`: 컨테이너타입 (20GP, 40GP, 40HC, 45HC, RF)
- `freightRate`: 운임단가 (0 < rate ≤ 50,000 USD)
- `bookingStatus`: 부킹상태 (Confirmed, Pending, Cancelled, Completed, NoShow)
- `shipperId`: 화주 연결 (필수)
- `routeCode`: 항로 연결 (필수)

#### 조건부 필수
- `cancellationReason`: 취소사유 (bookingStatus가 'Cancelled'일 때 필수)

#### 예제 (유효한 데이터)
```typescript
const validBooking = {
  bookingId: 'BK0000000001',
  bookingDate: '2024-12-08T10:30:00Z',
  bookingQty: 50,
  containerType: '40HC',
  freightRate: 2500,
  bookingStatus: 'Confirmed',
  shipperId: 'SHP001',
  routeCode: 'RT001'
};
```

#### 예제 (무효한 데이터)
```typescript
const invalidBooking = {
  bookingId: 'BK123',             // ❌ 10자리 미만
  bookingQty: 0,                  // ❌ 1 미만
  containerType: '30GP',          // ❌ 정의되지 않은 타입
  freightRate: -100,              // ❌ 음수
  bookingStatus: 'Cancelled',     // ⚠️ cancellationReason 누락
};
```

---

### 3. 예측 (Prediction)

#### 필수 필드
- `predictedDate`: 예상부킹일 (ISO 8601 형식)
- `confidence`: 신뢰도 (0.0~1.0)
- `modelVersion`: 모델버전 (형식: `v1.0.0`)
- `predictionDate`: 예측생성일 (ISO 8601 형식)
- `shipperId`: 화주 연결 (필수)

#### 선택 필드
- `predictedVolume`: 예상물량 (1~10,000 TEU)

#### 비즈니스 규칙
- **시간 순서**: 예상부킹일 > 예측생성일
- **고신뢰도 예측**: 신뢰도 ≥ 0.85 → 알림 생성 권장

#### 예제 (유효한 데이터)
```typescript
const validPrediction = {
  predictedDate: '2024-12-15T10:00:00Z',
  confidence: 0.92,
  predictedVolume: 45,
  modelVersion: 'v1.2.3',
  predictionDate: '2024-12-08T10:00:00Z',
  shipperId: 'SHP001'
};
```

#### 예제 (무효한 데이터)
```typescript
const invalidPrediction = {
  predictedDate: '2024-12-01T10:00:00Z',  // ❌ 생성일보다 과거
  confidence: 1.5,                         // ❌ 1.0 초과
  modelVersion: '1.2.3',                   // ❌ 'v' 접두사 누락
  predictionDate: '2024-12-08T10:00:00Z'
};
```

---

### 4. 항로 (Route)

#### 필수 필드
- `routeCode`: 항로코드 (형식: `RT` + 3자리 숫자)
- `routeName`: 항로명 (3~100자)
- `originPort`: 출발항 (3자리 대문자 코드, 예: PUS, ICN)
- `destinationPort`: 도착항 (3자리 대문자 코드, 예: LAX, SIN)
- `transitTime`: 운항소요일 (1~90일)
- `baseRate`: 기본운임 (0 < rate ≤ 50,000 USD)

#### 비즈니스 규칙
- **항구 검증**: 출발항 ≠ 도착항

#### 예제 (유효한 데이터)
```typescript
const validRoute = {
  routeCode: 'RT001',
  routeName: 'Korea-LA Express',
  originPort: 'PUS',
  destinationPort: 'LAX',
  transitTime: 14,
  baseRate: 2800
};
```

#### 예제 (무효한 데이터)
```typescript
const invalidRoute = {
  routeCode: 'RT1',               // ❌ 3자리 미만
  routeName: 'KR',                // ❌ 3자 미만
  originPort: 'PUSAN',            // ❌ 3자 초과
  destinationPort: 'PUS',         // ❌ 출발항과 동일
  transitTime: 100,               // ❌ 90일 초과
  baseRate: 0                     // ❌ 0 이하
};
```

---

## 💻 TypeScript 사용법

### 1. 단일 데이터 검증

```typescript
import { shaclValidator } from './services/shaclValidator';

// 화주 검증
const shipperResult = shaclValidator.validateShipper({
  shipperId: 'SHP001',
  shipperName: 'Samsung Electronics',
  avgMonthlyVolume: 650,
  customerGrade: 'VIP'
});

if (shipperResult.isValid) {
  console.log('✅ 검증 통과');
} else {
  console.log('❌ 검증 실패');
  shipperResult.violations.forEach(v => {
    console.log(`${v.severity}: ${v.message}`);
  });
}
```

### 2. 배치 검증

```typescript
const batchResult = shaclValidator.validateBatch({
  shippers: [shipper1, shipper2, shipper3],
  bookings: [booking1, booking2],
  predictions: [prediction1],
  routes: [route1, route2]
});

console.log(`전체 유효성: ${batchResult.overallValid}`);
console.log(`화주 검증: ${batchResult.shippers.length}건`);
console.log(`부킹 검증: ${batchResult.bookings.length}건`);
```

### 3. 검증 결과 구조

```typescript
interface ValidationResult {
  isValid: boolean;              // 전체 유효성
  violations: ValidationViolation[];  // 위반 사항 목록
  summary: {
    totalChecks: number;         // 총 검사 수
    passed: number;              // 통과 수
    failed: number;              // 실패 수
  };
}

interface ValidationViolation {
  severity: 'error' | 'warning' | 'info';  // 심각도
  shape: string;                 // SHACL Shape 이름
  property?: string;             // 위반 속성
  value?: any;                   // 위반 값
  message: string;               // 오류 메시지
}
```

---

## 🎨 UI 컴포넌트 사용

### DataQualityPanel 컴포넌트

Dashboard에 이미 통합되어 있습니다:

```typescript
import { DataQualityPanel } from '../components/DataQualityPanel';

function MyPage() {
  return (
    <div>
      <DataQualityPanel />
    </div>
  );
}
```

### 기능
- 4가지 탭: 화주, 부킹, 예측, 항로
- 샘플 데이터 표시
- 실시간 검증 실행
- 위반 사항 시각화 (심각도별 색상)
- SHACL 규칙 설명

---

## 🔧 SHACL 제약조건 커스터마이징

### 새로운 제약조건 추가

`ontology/kmtc_booking_shacl.ttl` 파일 수정:

```turtle
# 새로운 Shape 추가
kso:MyNewShape a sh:NodeShape ;
    sh:targetClass kso:MyClass ;
    sh:property [
        sh:path kso:myProperty ;
        sh:minCount 1 ;
        sh:datatype xsd:string ;
        sh:pattern "^[A-Z]{3}$" ;
        sh:message "3자리 대문자여야 합니다" ;
    ] .
```

### TypeScript 검증 로직 추가

`services/shaclValidator.ts` 파일에 메서드 추가:

```typescript
validateMyData(data: MyData): ValidationResult {
  const violations: ValidationViolation[] = [];
  
  // 검증 로직 구현
  if (!data.myProperty) {
    violations.push({
      severity: 'error',
      shape: 'MyNewShape',
      property: 'myProperty',
      message: '필수 항목입니다'
    });
  }
  
  return this.buildResult(violations);
}
```

---

## 📊 검증 통계

### 현재 구현된 제약조건

| Shape | 제약조건 수 | 비즈니스 규칙 |
|-------|------------|--------------|
| ShipperShape | 7 | 2 |
| BookingShape | 9 | 1 |
| PredictionShape | 6 | 2 |
| RouteShape | 7 | 1 |
| AlertShape | 4 | 0 |
| CompetitorShape | 3 | 0 |
| RiskShape | 3 | 0 |
| ContractShape | 4 | 1 |
| VesselShape | 3 | 0 |

**총 46개 제약조건 + 7개 비즈니스 규칙**

---

## 🚀 성능 최적화

### 1. 배치 검증 사용
여러 데이터를 한 번에 검증하여 오버헤드 감소

### 2. 조건부 검증
필요한 Shape만 선택적으로 검증

### 3. 캐싱
검증 결과를 캐싱하여 중복 검증 방지

```typescript
const cache = new Map<string, ValidationResult>();

function validateWithCache(id: string, data: any) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const result = shaclValidator.validateShipper(data);
  cache.set(id, result);
  return result;
}
```

---

## 🔗 관련 문서

- [OWL2 온톨로지](./kmtc_booking_ontology.ttl)
- [SHACL 제약조건](./kmtc_booking_shacl.ttl)
- [W3C SHACL 표준](https://www.w3.org/TR/shacl/)
- [엔터프라이즈 아키텍처](../backend-architecture.md)

---

## 💡 베스트 프랙티스

1. **데이터 입력 시점에 검증**: 사용자 입력 즉시 검증하여 빠른 피드백
2. **서버 사이드 검증**: 클라이언트 검증 + 서버 검증 이중화
3. **명확한 오류 메시지**: 사용자가 이해하기 쉬운 한글 메시지
4. **로깅**: 검증 실패 이력을 로그로 저장하여 데이터 품질 추적
5. **점진적 적용**: 경고(warning)로 시작하여 점차 오류(error)로 강화

---

## 🐛 트러블슈팅

### Q: 검증이 너무 엄격해요
A: `severity`를 'error'에서 'warning'으로 변경하거나, 제약조건 범위를 완화하세요.

### Q: 날짜 형식 오류가 발생해요
A: ISO 8601 형식(`YYYY-MM-DDTHH:mm:ssZ`)을 사용하세요.

### Q: 커스텀 비즈니스 규칙을 추가하고 싶어요
A: `shaclValidator.ts`에 새로운 검증 메서드를 추가하거나, SHACL 파일에 SPARQL 쿼리를 작성하세요.

---

**작성일**: 2024-12-08  
**버전**: 1.0.0  
**작성자**: KMTC AI Team
