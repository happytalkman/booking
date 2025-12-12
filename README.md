# KMTC 온톨로지 기반 부킹 에이전틱AI 플랫폼

AI 기반 해운 물류 부킹 예측 및 최적화 시스템

## 🚀 주요 기능

### 🔐 1. OTP 이메일 인증 시스템 (NEW!)
- **이메일 기반 로그인**: 비밀번호 없이 OTP로 간편 로그인
- **역할 기반 접근 제어**: 화주/포워더/선사/관리자 자동 역할 부여
- **감사 로그**: 모든 로그인 활동 자동 기록
- **보안**: 5분 유효시간, 5회 시도 제한, JWT 토큰

### 📱 2. 스마트 알림 시스템 (NEW!)
- **개인화된 알림 설정**: 운임 임계값, 선호 항로별 맞춤 알림
- **PWA 푸시 알림**: 오프라인에서도 중요 알림 수신
- **이메일/SMS 통합**: 다채널 알림 지원
- **알림 히스토리 & 분석**: 알림 효과성 추적 및 개선

### 📊 3. 부킹 히스토리 & 분석 대시보드 (NEW!)
- **과거 부킹 패턴 분석**: 계절성, 트렌드, 성과 지표
- **비용 절감 리포트**: AI 추천 vs 수동 부킹 효과 비교
- **ROI 계산기**: 플랫폼 투자 대비 수익률 자동 계산
- **데이터 내보내기**: CSV, PDF 리포트 생성

### 👥 4. 협업 기능 (NEW!)
- **부킹 공유 & 댓글**: 팀원간 부킹 정보 공유 및 토론
- **승인 워크플로우**: 단계별 부킹 승인 프로세스
- **팀 대시보드**: 협업 현황 및 성과 모니터링
- **활동 피드**: 실시간 팀 활동 추적

### 📱 5. PWA (Progressive Web App) (NEW!)
- **앱 설치**: 홈 화면에 네이티브 앱처럼 설치
- **오프라인 모드**: 인터넷 없이도 기본 기능 사용
- **푸시 알림**: 백그라운드에서도 알림 수신
- **빠른 로딩**: 캐싱으로 향상된 성능

### 6. 멀티 LLM AI 시스템
- **OpenRouter 통합**: GPT-4, Claude, Gemini 등 여러 AI 모델 지원
- **자동 폴백**: 모델 장애 시 자동으로 다른 모델로 전환
- **AI 챗봇**: 실시간 부킹 상담 및 추천

### 7. 부킹 예측 및 추천
- **ML 기반 예측**: TensorFlow.js로 30일 운임 예측
- **AI 부킹 추천**: 지금 부킹/대기 권장/모니터링 3가지 액션 제공
- **실시간 알림**: 운임 하락, 경쟁사 변경, 리스크, 기회 알림

### 8. 시나리오 시뮬레이터
- **복합 변수 조정**: 유가, 홍해 리스크, 수요, 환율 동시 시뮬레이션
- **예측 분석**: 각 시나리오별 운임 및 리스크 예측

### 9. 경쟁사 벤치마킹
- **5개 선사 비교**: KMTC, Maersk, MSC, CMA CGM, Hapag-Lloyd
- **실시간 지표**: 운임, 시장점유율, 정시도착률 비교

### 10. 음성 AI 어시스턴트
- **Web Speech API**: 음성 입력 및 출력 지원
- **핸즈프리 작업**: 음성으로 부킹 조회 및 추천 받기

### 11. 데이터 품질 검증 (SHACL)
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

### Backend
- **Node.js** + **Express** (인증 서버)
- **Nodemailer** (이메일 전송)
- **JWT** (토큰 인증)

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
- Gmail 계정 (이메일 인증용)

### 1. 프론트엔드 설치
```bash
# 의존성 설치
npm install

# 환경 변수 설정
# .env.local 파일에 API 키 설정
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_AUTH_API_URL=http://localhost:3001
```

### 2. 백엔드 인증 서버 설치
```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 이메일 설정 입력
```

**Gmail 앱 비밀번호 생성:**
1. Google 계정 → 보안 → 2단계 인증 활성화
2. 앱 비밀번호 생성 → "메일" 선택
3. 16자리 비밀번호를 `.env`의 `EMAIL_PASSWORD`에 입력

### 3. 서버 실행

**터미널 1 - 백엔드 서버:**
```bash
cd server
npm run dev
```

**터미널 2 - 프론트엔드:**
```bash
npm run dev
```

### 4. 로그인
- 브라우저에서 `http://localhost:5173` 접속
- 이메일 주소 입력
- 이메일로 받은 6자리 OTP 입력
- 로그인 완료!

### 5. 프로덕션 빌드
```bash
npm run build
npm run preview
```

📖 **자세한 인증 설정 가이드**: [AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md)

## 📁 프로젝트 구조

```
kmtc-booking-platform/
├── components/          # React 컴포넌트
│   ├── LoginPage.tsx                    # 🔐 OTP 로그인 UI
│   ├── SmartNotificationSettings.tsx   # 📱 스마트 알림 설정
│   ├── NotificationHistory.tsx         # 📊 알림 히스토리 분석
│   ├── BookingHistoryDashboard.tsx     # 📈 부킹 히스토리 대시보드
│   ├── CollaborationPanel.tsx          # 👥 협업 센터
│   ├── PWAInstallPrompt.tsx           # 📱 PWA 설치 프롬프트
│   ├── AIChatAssistant.tsx
│   ├── BookingRecommendation.tsx
│   ├── DataQualityPanel.tsx           # SHACL 검증 UI
│   ├── MLPredictionPanel.tsx
│   └── ...
├── services/           # 비즈니스 로직
│   ├── authService.ts          # 🔐 인증 서비스
│   ├── pwaService.ts           # 📱 PWA 서비스
│   ├── openRouterService.ts
│   ├── mlPrediction.ts
│   ├── shaclValidator.ts       # SHACL 검증 서비스
│   └── mockData.ts
├── server/             # 🔐 백엔드 인증 서버
│   ├── index.js                # Express 서버
│   ├── package.json
│   └── .env.example
├── public/             # 📱 PWA 파일
│   ├── manifest.json           # PWA 매니페스트
│   ├── sw.js                   # 서비스 워커
│   └── icons/                  # PWA 아이콘
├── ontology/           # 시맨틱 웹 파일
│   ├── kmtc_booking_ontology.ttl   # OWL2 온톨로지
│   └── kmtc_booking_shacl.ttl      # SHACL 제약조건
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── BookingAnalysis.tsx
│   └── ...
├── AUTH_SETUP_GUIDE.md # 🔐 인증 설정 가이드
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
- `Ctrl + H`: 홈으로 이동
- `Ctrl + Shift + R`: 데이터 새로고침
- `?`: 단축키 도움말

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
010-4174-0518 이길환
happytalkman@weai.kr
---
