# 🚀 빠른 시작 가이드

KMTC 부킹 최적화 플랫폼을 5분 안에 실행하세요!

## ⚡ 초간단 설치 (3단계)

### 1️⃣ 프론트엔드 설치
```bash
npm install
```

### 2️⃣ 백엔드 서버 설치
```bash
npm run server:install
```

### 3️⃣ 이메일 설정
```bash
cd server
cp .env.example .env
```

`.env` 파일을 열고 Gmail 정보 입력:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Gmail 앱 비밀번호 받기:**
1. [Google 계정 보안](https://myaccount.google.com/security) 접속
2. "2단계 인증" 활성화
3. "앱 비밀번호" 생성 → "메일" 선택
4. 16자리 비밀번호 복사 → `.env`에 붙여넣기

---

## 🎯 실행 (2개 터미널)

### 터미널 1 - 백엔드 서버
```bash
npm run server
```

✅ `🚀 OTP 인증 서버 실행 중` 메시지 확인

### 터미널 2 - 프론트엔드
```bash
npm run dev
```

✅ `http://localhost:5173` 접속

---

## 🔐 로그인 테스트

### 방법 1: 실제 플랫폼에서 테스트
1. 브라우저에서 `http://localhost:5173` 접속
2. 이메일 주소 입력
3. 이메일로 받은 6자리 OTP 입력
4. 로그인 완료! 🎉

### 방법 2: 테스트 페이지 사용
```bash
# 브라우저에서 열기
open test-auth.html
# 또는
start test-auth.html
```

---

## 🎨 역할별 자동 로그인

| 이메일 | 역할 | 권한 |
|--------|------|------|
| `admin@kmtc.com` | 관리자 | 모든 기능 |
| `user@kmtc.co.kr` | 선사 | 대부분 기능 |
| `john@abc-logistics.com` | 포워더 | 부킹, 시장 분석 |
| `customer@company.com` | 화주 | 기본 기능 |

---

## 🐛 문제 해결

### 이메일이 안 와요
- Gmail 앱 비밀번호 확인 (일반 비밀번호 X)
- 스팸 메일함 확인
- 서버 터미널에서 OTP 확인 (콘솔에 출력됨)

### 서버가 안 켜져요
```bash
# 포트 3001이 사용 중인지 확인
netstat -ano | findstr :3001

# 다른 포트 사용
# server/.env에서 PORT=3002로 변경
```

### 로그인 후 권한이 없어요
- 이메일 도메인 확인
- 서버 재시작 후 다시 로그인

---

## 📚 더 알아보기

- 📖 [전체 설정 가이드](./AUTH_SETUP_GUIDE.md)
- 🔧 [백엔드 서버 문서](./server/README.md)
- 📋 [프로젝트 README](./README.md)

---

## ✨ 주요 기능

### 🔐 인증 시스템
- OTP 이메일 인증
- 역할 기반 접근 제어
- 감사 로그 자동 기록

### 🤖 AI 기능
- 멀티 LLM (GPT-4, Claude, Gemini)
- AI 부킹 추천
- 음성 AI 어시스턴트

### 📊 분석 도구
- 실시간 대시보드
- 시나리오 시뮬레이터
- 경쟁사 벤치마킹
- ML 운임 예측

### 🎯 데이터 품질
- OWL2 온톨로지
- SHACL 검증
- 지식 그래프 시각화

---

## 🎉 완료!

이제 KMTC 부킹 최적화 플랫폼을 사용할 준비가 되었습니다!

**다음 단계:**
1. 로그인해서 대시보드 확인
2. AI 챗봇과 대화 (Ctrl+K)
3. 부킹 추천 받기
4. 시나리오 시뮬레이션 실행

**문제가 있나요?**
- 📧 support@kmtc.com
- 💬 GitHub Issues
- 📖 [문서 보기](./AUTH_SETUP_GUIDE.md)
