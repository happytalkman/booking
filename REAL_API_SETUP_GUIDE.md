# 실제 API 연동 설정 가이드

## 🔑 필요한 API 키들

### 1. 한국은행 Open API (환율 데이터)
- **사이트**: https://ecos.bok.or.kr/
- **신청 방법**: 
  1. 한국은행 경제통계시스템 회원가입
  2. Open API 신청
  3. API 키 발급 (무료)
- **환경변수**: `VITE_BOK_API_KEY`
- **사용 데이터**: USD/KRW, EUR/KRW, JPY/KRW 환율

### 2. OpenWeatherMap API (날씨 데이터)
- **사이트**: https://openweathermap.org/api
- **신청 방법**:
  1. 회원가입
  2. API 키 발급 (무료 플랜 사용 가능)
- **환경변수**: `VITE_OPENWEATHER_API_KEY`
- **사용 데이터**: 부산항 기준 날씨 정보

### 3. Alpha Vantage API (유가 데이터)
- **사이트**: https://www.alphavantage.co/
- **신청 방법**:
  1. 회원가입
  2. 무료 API 키 발급
- **환경변수**: `VITE_ALPHAVANTAGE_API_KEY`
- **사용 데이터**: Brent, WTI 유가

### 4. OECD Statistics API (경제 지표)
- **사이트**: https://data.oecd.org/
- **신청 방법**:
  1. OECD 데이터 포털 접근
  2. API 키 신청 (무료)
- **환경변수**: `VITE_OECD_API_KEY`
- **사용 데이터**: GDP 성장률, 인플레이션, 금리

### 5. Reuters Risk Intelligence API (지정학적 리스크)
- **사이트**: https://www.refinitiv.com/
- **신청 방법**:
  1. Refinitiv 계정 생성
  2. Risk Intelligence API 구독 (유료)
- **환경변수**: `VITE_REUTERS_API_KEY`
- **사용 데이터**: 지정학적 리스크 점수, 이벤트

## 🛠️ 설정 방법

### 1. 환경 변수 설정
`.env.local` 파일에 발급받은 API 키들을 설정:

```bash
# 한국은행 Open API
VITE_BOK_API_KEY=your_actual_bok_api_key

# OpenWeatherMap API
VITE_OPENWEATHER_API_KEY=your_actual_openweather_api_key

# Alpha Vantage API
VITE_ALPHAVANTAGE_API_KEY=your_actual_alphavantage_api_key

# OECD Statistics API
VITE_OECD_API_KEY=your_actual_oecd_api_key

# Reuters Risk Intelligence API
VITE_REUTERS_API_KEY=your_actual_reuters_api_key
```

### 2. API 호출 활성화
`services/realDataService.ts`에서 주석 처리된 실제 API 호출 코드를 활성화:

```typescript
// 현재 (시뮬레이션):
// const response = await fetch(`https://ecos.bok.or.kr/api/...`);

// 실제 API 사용시:
const response = await fetch(`https://ecos.bok.or.kr/api/StatisticSearch/${process.env.VITE_BOK_API_KEY}/json/kr/1/10/731Y001/D/${today}/${today}/0000001`);
```

## 📊 현재 상태

### ✅ 구현 완료
- 실제 API 서비스 구조 (`realDataService.ts`)
- 캐싱 시스템 (5분 캐시)
- 에러 처리 및 Fallback 데이터
- 실제 환율 범위 반영 (USD/KRW: ~1470원)
- 실제 유가 범위 반영 (Brent: ~$72)
- 실제 경제 지표 반영 (GDP: ~2.8%, 인플레이션: ~3.2%)

### 🔄 현재 동작 방식
1. **API 키가 없는 경우**: 실제 데이터에 가까운 시뮬레이션 사용
2. **API 키가 있는 경우**: 실제 API 호출 후 데이터 사용
3. **API 실패시**: Fallback 데이터 사용

### 📈 데이터 업데이트 주기
- **환율**: 5분마다 업데이트
- **날씨**: 5분마다 업데이트  
- **유가**: 5분마다 업데이트
- **경제지표**: 5분마다 업데이트
- **지정학적 리스크**: 5분마다 업데이트

## 🚀 실제 API 연동 후 기대 효과

### 1. 정확한 데이터
- 실제 USD/KRW 환율 (현재 ~1470원)
- 실제 유가 정보 (Brent ~$72)
- 실제 날씨 데이터 (부산항 기준)

### 2. 실시간 업데이트
- 5분마다 최신 데이터 자동 갱신
- 캐싱으로 API 호출 최적화
- 에러 발생시 자동 Fallback

### 3. 신뢰성 향상
- 공식 API 출처 표시
- 실제 업데이트 시간 표시
- 데이터 품질 보장

## 💡 추천 우선순위

1. **한국은행 Open API** (환율) - 무료, 공식 데이터
2. **OpenWeatherMap API** (날씨) - 무료 플랜 충분
3. **Alpha Vantage API** (유가) - 무료 플랜 사용 가능
4. **OECD Statistics API** (경제지표) - 무료
5. **Reuters API** (지정학적 리스크) - 유료이므로 마지막

## 🔧 테스트 방법

1. API 키 설정 후 서버 재시작
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. 실제 API 호출 여부 확인
4. 데이터 정확성 검증

현재는 실제 API 키 없이도 실제 데이터에 가까운 시뮬레이션으로 동작합니다!