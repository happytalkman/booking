<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# KMTC 부킹 최적화 플랫폼

AI 기반 해운 물류 부킹 예측 및 최적화 시스템

## 🚀 주요 기능

### 1. 멀티 LLM AI 시스템
- **OpenRouter 통합**: GPT-4, Claude, Gemini 등 여러 AI 모델 지원
- **자동 폴백**: 모델 장애 시 자동으로 다른 모델로 전환
- **AI 챗봇**: 실시간 부킹 상담 및 추천

### 2. 부킹 예측 및 추천
- **ML 기반 예측**: TensorFlow.js로 30일 운임 예측
- **AI 부킹 추천**: 지금 부킹/대기 권장/모니터링 3가지 액션 제공
- **실시간 알림**: 운임 하락, 경쟁사 변경, 리스크, 기회 알림

### 3. 시나리오 시뮬레이터
- **복합 변수 조정**: 유가, 홍해 리스크, 수요, 환율 동시 시뮬레이션
- **예측 분석**: 각 시나리오별 운임 및 리스크 예측

### 4. 경쟁사 벤치마킹
- **5개 선사 비교**: KMTC, Maersk, MSC, CMA CGM, Hapag-Lloyd
- **실시간 지표**: 운임, 시장점유율, 정시도착률 비교

### 5. 음성 AI 어시스턴트
- **Web Speech API**: 음성 입력 및 출력 지원
- **핸즈프리 작업**: 음성으로 부킹 조회 및 추천 받기

### 6. 데이터 품질 검증 (SHACL)
- **온톨로지 기반**: OWL2 해운 도메인 온톨로지
- **SHACL 제약조건**: W3C 표준 데이터 품질 검증
- **실시간 검증**: 화주, 부킹, 예측, 항로 데이터 무결성 보장

## 🏗️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Recharts** (데이터 시각화)
- **Lucide React** (아이콘)

### AI/ML
- **OpenRouter API** (멀티 LLM)
- **Google Gemini API** (폴백)
- **TensorFlow.js** (운임 예측)
- **Web Speech API** (음성 인식/합성)

### 시맨틱 웹
- **OWL2 온톨로지** (도메인 지식 모델링)
- **SHACL** (데이터 품질 검증)
- **RDF/Turtle** (지식 그래프)

## 📦 설치 및 실행

### Prerequisites
- Node.js 18+
- npm 또는 yarn

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일에 API 키 설정:
```env
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
kmtc-booking-platform/
├── components/          # React 컴포넌트
│   ├── AIChatAssistant.tsx
│   ├── BookingRecommendation.tsx
│   ├── DataQualityPanel.tsx    # SHACL 검증 UI
│   ├── MLPredictionPanel.tsx
│   └── ...
├── services/           # 비즈니스 로직
│   ├── openRouterService.ts
│   ├── mlPrediction.ts
│   ├── shaclValidator.ts       # SHACL 검증 서비스
│   └── mockData.ts
├── ontology/           # 시맨틱 웹 파일
│   ├── kmtc_booking_ontology.ttl   # OWL2 온톨로지
│   └── kmtc_booking_shacl.ttl      # SHACL 제약조건
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── BookingAnalysis.tsx
│   └── ...
└── contexts/           # React Context
    └── AppContext.tsx
```

## 🔍 SHACL 데이터 품질 검증

### 검증 대상
1. **화주 (Shipper)**
   - 화주코드: `SHP` + 3자리 이상 숫자
   - 월평균물량: 0~100,000 TEU
   - 이탈위험도: 0.0~1.0

2. **부킹 (Booking)**
   - 부킹번호: `BK` + 10자리 숫자
   - 부킹수량: 1~10,000 TEU
   - 컨테이너타입: 20GP, 40GP, 40HC, 45HC, RF

3. **예측 (Prediction)**
   - 신뢰도: 0.0~1.0
   - 모델버전: `v1.0.0` 형식
   - 예측일 > 생성일

4. **항로 (Route)**
   - 항로코드: `RT` + 3자리 숫자
   - 출발항/도착항: 3자리 대문자 코드
   - 운항소요일: 1~90일

### 비즈니스 규칙
- VIP 고객: 월평균 500 TEU 이상
- 고신뢰도 예측: 신뢰도 0.85 이상
- 이탈 위험 고객: 이탈위험도 0.7 이상

## 🎯 키보드 단축키

- `Ctrl + K`: AI 챗봇 열기
- `Ctrl + D`: 다크모드 토글
- `Ctrl + B`: 즐겨찾기 패널
- `Ctrl + /`: 단축키 도움말

## 📊 데이터 흐름

```
사용자 입력
    ↓
SHACL 검증 (데이터 품질)
    ↓
온톨로지 추론 (비즈니스 규칙)
    ↓
ML 예측 (TensorFlow.js)
    ↓
AI 추천 (OpenRouter/Gemini)
    ↓
실시간 알림 생성
```

## 🌐 엔터프라이즈 아키텍처

전체 시스템 아키텍처는 `backend-architecture.md` 참조
- 100% 오픈소스 스택
- 마이크로서비스 아키텍처
- 지식 그래프 기반 추론 엔진

## 📝 라이선스

MIT License

## 👥 기여

이슈 및 PR 환영합니다!

---

View your app in AI Studio: https://ai.studio/apps/drive/1ZZ38Dhv7kcIp1CqTgDfVnJJA4FtU2tkN
