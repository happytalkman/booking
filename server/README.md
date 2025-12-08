# KMTC 인증 서버

OTP 이메일 인증을 위한 백엔드 서버

## 🚀 빠른 시작

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. 실행
```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

## 📧 Gmail 설정

1. Google 계정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. "메일" 선택
5. 16자리 비밀번호 복사 → `.env`의 `EMAIL_PASSWORD`에 입력

## 🔌 API 엔드포인트

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
OTP 검증

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

### GET /health
서버 상태 확인

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-08T10:00:00.000Z"
}
```

## 🔒 보안 기능

- ✅ OTP 5분 유효시간
- ✅ 5회 시도 제한
- ✅ JWT 토큰 인증
- ✅ 이메일 유효성 검사
- ✅ 자동 역할 할당

## 🎯 역할 자동 할당

| 이메일 도메인 | 역할 |
|-------------|------|
| `@kmtc.com`, `@kmtc.co.kr` | `carrier` (선사) |
| `admin` 포함 | `admin` (관리자) |
| `logistics`, `freight` 포함 | `forwarder` (포워더) |
| 기타 | `shipper` (화주) |

## 🐛 문제 해결

### 이메일이 전송되지 않아요
- Gmail 앱 비밀번호 확인 (일반 비밀번호 X)
- 2단계 인증 활성화 확인
- 방화벽 설정 확인

### 포트가 이미 사용 중이에요
```bash
# 포트 변경
# .env 파일에서 PORT=3002로 변경
```

### 서버가 시작되지 않아요
```bash
# 로그 확인
npm run dev

# 의존성 재설치
rm -rf node_modules
npm install
```

## 📦 의존성

- `express`: 웹 서버
- `cors`: CORS 설정
- `nodemailer`: 이메일 전송
- `dotenv`: 환경 변수 관리

## 🚀 프로덕션 배포

### PM2 사용
```bash
npm install -g pm2
pm2 start index.js --name kmtc-auth
pm2 save
pm2 startup
```

### Docker 사용
```bash
docker build -t kmtc-auth-server .
docker run -p 3001:3001 --env-file .env kmtc-auth-server
```

## 📝 로그

서버 실행 시 콘솔에 다음 정보가 표시됩니다:
- OTP 전송 성공/실패
- 로그인 성공/실패
- 에러 메시지

## 🔗 관련 문서

- [전체 설정 가이드](../AUTH_SETUP_GUIDE.md)
- [프로젝트 README](../README.md)
