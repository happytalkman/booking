# 🔐 OTP 이메일 인증 시스템 설치 가이드

## 📋 개요

KMTC 부킹 최적화 플랫폼에 OTP(One-Time Password) 이메일 인증 시스템이 추가되었습니다.

### 주요 기능
- ✉️ 이메일 기반 OTP 인증 (6자리 숫자)
- 🔒 역할 기반 접근 제어 (RBAC)
- 📊 감사 로그 자동 기록
- 🎨 아름다운 로그인 UI
- ⏱️ 5분 유효시간 + 재전송 기능
- 🛡️ 5회 시도 제한

---

## 🚀 빠른 시작

### 1단계: 백엔드 서버 설치

```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 2단계: 이메일 설정

`.env` 파일을 열고 이메일 설정을 입력하세요:

#### 옵션 A: Gmail 사용 (권장)

```env
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Gmail 앱 비밀번호 생성 방법:**
1. Google 계정 설정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. "메일" 선택 후 16자리 비밀번호 복사

#### 옵션 B: 다른 SMTP 서버

```env
PORT=3001
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### 3단계: 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 또는 프로덕션 모드
npm start
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 4단계: 프론트엔드 실행

새 터미널을 열고:

```bash
# 프로젝트 루트로 이동
cd ..

# 개발 서버 실행
npm run dev
```

---

## 🎯 사용 방법

### 로그인 프로세스

1. **이메일 입력**
   - 로그인 페이지에서 이메일 주소 입력
   - "인증번호 받기" 클릭

2. **OTP 수신**
   - 입력한 이메일로 6자리 인증번호 수신
   - 유효시간: 5분

3. **OTP 입력**
   - 6자리 숫자 입력
   - 자동으로 다음 칸으로 이동
   - "로그인" 클릭

4. **로그인 완료**
   - 역할에 따라 접근 권한 자동 부여
   - 메인 화면으로 이동

### 역할 자동 할당

이메일 도메인에 따라 자동으로 역할이 부여됩니다:

| 이메일 도메인 | 역할 | 권한 |
|-------------|------|------|
| `@kmtc.com`, `@kmtc.co.kr` | `carrier` (선사) | 대부분의 기능 |
| `admin` 포함 | `admin` (관리자) | 모든 기능 |
| `logistics`, `freight` 포함 | `forwarder` (포워더) | 부킹, 시장 분석 |
| 기타 | `shipper` (화주) | 기본 기능 |

### 예시

```
admin@kmtc.com → admin (관리자)
user@kmtc.co.kr → carrier (선사)
john@abc-logistics.com → forwarder (포워더)
customer@company.com → shipper (화주)
```

---

## 🔧 개발 모드

개발 중에는 백엔드 서버 없이도 테스트할 수 있습니다:

1. `services/authService.ts`에서 API 호출 대신 로컬 시뮬레이션 사용
2. OTP가 브라우저 알림으로 표시됨
3. 콘솔에도 OTP 출력

---

## 📁 파일 구조

```
project/
├── components/
│   └── LoginPage.tsx          # 로그인 UI
├── services/
│   └── authService.ts         # 인증 로직
├── server/
│   ├── index.js               # 백엔드 서버
│   ├── package.json           # 서버 의존성
│   └── .env                   # 환경 변수
└── AUTH_SETUP_GUIDE.md        # 이 파일
```

---

## 🔒 보안 기능

### OTP 보안
- ✅ 5분 유효시간
- ✅ 5회 시도 제한
- ✅ 사용 후 자동 삭제
- ✅ 이메일 유효성 검사

### 토큰 보안
- ✅ JWT 기반 인증
- ✅ 24시간 유효기간
- ✅ 로컬 스토리지 저장
- ✅ 자동 만료 확인

### 감사 로그
- ✅ 로그인/로그아웃 기록
- ✅ 타임스탬프 자동 기록
- ✅ User Agent 추적
- ✅ 관리자 전용 조회

---

## 🎨 UI 기능

### 로그인 페이지
- 🌓 다크모드 지원
- 📱 모바일 반응형
- ⌨️ 키보드 네비게이션
- 🎯 자동 포커스 이동
- ⏱️ 재전송 타이머
- ✨ 애니메이션 효과

### 사용자 메뉴
- 👤 프로필 정보 표시
- 🏷️ 역할 배지
- 🚪 로그아웃 버튼
- 📧 이메일 표시

---

## 🐛 문제 해결

### 이메일이 전송되지 않아요

1. **Gmail 앱 비밀번호 확인**
   - 일반 비밀번호가 아닌 앱 비밀번호 사용
   - 2단계 인증 활성화 필요

2. **SMTP 설정 확인**
   - 포트 번호 확인 (587 또는 465)
   - 방화벽 설정 확인

3. **서버 로그 확인**
   ```bash
   cd server
   npm run dev
   ```

### OTP가 만료되었어요

- "인증번호 재전송" 버튼 클릭
- 60초 대기 후 재전송 가능

### 로그인 후 권한이 없어요

- 이메일 도메인 확인
- 관리자에게 역할 변경 요청

---

## 🚀 프로덕션 배포

### 백엔드 배포

```bash
# PM2로 서버 실행
npm install -g pm2
cd server
pm2 start index.js --name kmtc-auth

# 또는 Docker
docker build -t kmtc-auth-server .
docker run -p 3001:3001 --env-file .env kmtc-auth-server
```

### 환경 변수 설정

프로덕션 환경에서는 반드시:
- ✅ 강력한 JWT_SECRET 사용
- ✅ HTTPS 사용
- ✅ CORS 설정 제한
- ✅ Rate Limiting 추가
- ✅ 데이터베이스 연동 (Redis, PostgreSQL)

---

## 📚 API 문서

### POST /api/auth/send-otp

이메일로 OTP 전송

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "인증번호가 이메일로 전송되었습니다."
}
```

### POST /api/auth/verify-otp

OTP 검증 및 로그인

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "token": "eyJhbGc...",
  "role": "shipper",
  "name": "user"
}
```

### POST /api/auth/verify-token

토큰 유효성 검증

**Request:**
```json
{
  "token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "email": "user@example.com",
    "name": "user",
    "role": "shipper",
    "company": "example.com"
  }
}
```

---

## 🎓 추가 개선 사항

### 단기 (1-2주)
- [ ] 비밀번호 로그인 옵션 추가
- [ ] 소셜 로그인 (Google, Microsoft)
- [ ] 이메일 템플릿 커스터마이징

### 중기 (1개월)
- [ ] 2FA (TOTP) 지원
- [ ] 세션 관리 개선
- [ ] 비밀번호 재설정 기능

### 장기 (3개월)
- [ ] SSO (Single Sign-On) 통합
- [ ] Keycloak 연동
- [ ] 생체 인증 지원

---

## 💬 지원

문제가 있거나 질문이 있으시면:
- 📧 이메일: support@kmtc.com
- 💬 Slack: #kmtc-platform
- 📖 문서: https://docs.kmtc.com

---

**구축 완료! 🎉**

이제 안전하고 편리한 OTP 이메일 인증으로 플랫폼을 사용하실 수 있습니다.
