// OTP 인증 백엔드 서버
// Node.js + Express + Nodemailer

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// OTP 저장소 (실제로는 Redis 사용 권장)
const otpStore = new Map();

// 사용자 데이터베이스 (실제로는 PostgreSQL/MongoDB 사용)
const users = new Map();

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
  // Gmail 사용 예시
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Gmail 앱 비밀번호
  }
  
  // 또는 SMTP 서버 직접 설정
  // host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  // secure: true,
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASSWORD
  // }
});

// 6자리 OTP 생성
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// JWT 토큰 생성 (간단한 버전)
const generateToken = (user) => {
  const payload = {
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// 이메일 도메인 기반 역할 자동 할당
const determineRole = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain === 'kmtc.com' || domain === 'kmtc.co.kr') {
    return 'carrier';
  } else if (email.includes('admin')) {
    return 'admin';
  } else if (domain?.includes('logistics') || domain?.includes('freight')) {
    return 'forwarder';
  } else {
    return 'shipper';
  }
};

// API: OTP 전송
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '올바른 이메일 주소를 입력해주세요.' 
      });
    }

    // OTP 생성
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5분

    // OTP 저장
    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0
    });

    // 이메일 전송
    const mailOptions = {
      from: `"KMTC 온톨로지 기반 부킹 에이전틱AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'KMTC 로그인 인증번호',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 로그인 인증번호</h1>
              <p>KMTC 온톨로지 기반 부킹 에이전틱AI 플랫폼</p>
            </div>
            <div class="content">
              <p>안녕하세요,</p>
              <p>로그인을 위한 인증번호가 발급되었습니다.</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">인증번호</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">유효시간: 5분</p>
              </div>

              <div class="warning">
                <strong>⚠️ 보안 안내</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>이 인증번호는 5분간 유효합니다.</li>
                  <li>타인에게 절대 공유하지 마세요.</li>
                  <li>요청하지 않은 경우 이 이메일을 무시하세요.</li>
                </ul>
              </div>

              <p>감사합니다.<br><strong>KMTC 온톨로지 기반 부킹 에이전틱AI 팀</strong></p>
            </div>
            <div class="footer">
              <p>이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.</p>
              <p>© 2024 KMTC Booking Optimization Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP 전송 성공: ${email} -> ${otp}`);

    res.json({ 
      success: true, 
      message: '인증번호가 이메일로 전송되었습니다.' 
    });

  } catch (error) {
    console.error('OTP 전송 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '인증번호 전송에 실패했습니다.' 
    });
  }
});

// API: OTP 검증
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const stored = otpStore.get(email);

    // OTP가 존재하지 않음
    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        message: '인증번호를 먼저 요청해주세요.' 
      });
    }

    // 시도 횟수 초과
    if (stored.attempts >= 5) {
      otpStore.delete(email);
      return res.status(429).json({ 
        success: false, 
        message: '인증 시도 횟수를 초과했습니다. 다시 요청해주세요.' 
      });
    }

    // 만료 확인
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: '인증번호가 만료되었습니다. 다시 요청해주세요.' 
      });
    }

    // OTP 불일치
    if (stored.otp !== otp) {
      stored.attempts++;
      return res.status(400).json({ 
        success: false, 
        message: `인증번호가 올바르지 않습니다. (${stored.attempts}/5)` 
      });
    }

    // 인증 성공
    otpStore.delete(email);

    // 사용자 프로필 가져오기 또는 생성
    let user = users.get(email);
    if (!user) {
      user = {
        email,
        name: email.split('@')[0],
        role: determineRole(email),
        company: email.split('@')[1] || 'Unknown',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users.set(email, user);
    } else {
      user.lastLogin = new Date().toISOString();
    }

    // JWT 토큰 생성
    const token = generateToken(user);

    console.log(`✅ 로그인 성공: ${email} (${user.role})`);

    res.json({ 
      success: true, 
      message: '로그인 성공',
      token,
      role: user.role,
      name: user.name
    });

  } catch (error) {
    console.error('OTP 검증 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
});

// API: 토큰 검증
app.post('/api/auth/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    if (Date.now() > payload.exp) {
      return res.status(401).json({ valid: false, message: '토큰이 만료되었습니다.' });
    }

    const user = users.get(payload.email);
    if (!user) {
      return res.status(401).json({ valid: false, message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false, message: '유효하지 않은 토큰입니다.' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 OTP 인증 서버 실행 중`);
  console.log(`📍 포트: ${PORT}`);
  console.log(`📧 이메일: ${process.env.EMAIL_USER || '설정 필요'}`);
  console.log('='.repeat(50));
});

// 정리 작업
process.on('SIGTERM', () => {
  console.log('서버 종료 중...');
  process.exit(0);
});
