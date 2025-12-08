import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (email: string, role: string) => void;
}

type LoginStep = 'email' | 'otp' | 'success';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // OTP 입력 핸들러
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // 자동으로 다음 입력칸으로 이동
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // 백스페이스 처리
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // 이메일 제출
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // authService 사용
      const { sendOTP } = await import('../services/authService');
      const result = await sendOTP(email);

      if (result.success) {
        setStep('otp');
        setResendTimer(60);
        
        // 타이머 시작
        const interval = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.message || '이메일 전송에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // OTP 검증
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('6자리 인증번호를 모두 입력해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // authService 사용
      const { verifyOTP } = await import('../services/authService');
      const result = await verifyOTP(email, otpCode);

      if (result.success) {
        setStep('success');
        
        // 로컬 스토리지에 인증 정보 저장
        localStorage.setItem('auth_token', result.token!);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_role', result.role!);
        localStorage.setItem('user_name', result.name!);
        
        // 1초 후 메인 화면으로 전환
        setTimeout(() => {
          onLoginSuccess(email, result.role!);
        }, 1000);
      } else {
        setError(result.message || '인증번호가 올바르지 않습니다.');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // OTP 재전송
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setLoading(true);

    try {
      const { sendOTP } = await import('../services/authService');
      const result = await sendOTP(email);

      if (result.success) {
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        
        const interval = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('재전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 & 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            KMTC 부킹 최적화
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'email' && '이메일로 간편하게 로그인하세요'}
            {step === 'otp' && '이메일로 전송된 인증번호를 입력하세요'}
            {step === 'success' && '로그인 성공!'}
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* 이메일 입력 단계 */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    전송 중...
                  </>
                ) : (
                  <>
                    인증번호 받기
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP 입력 단계 */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    인증번호 6자리
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    이메일 변경
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                  <br />
                  으로 인증번호를 전송했습니다.
                </div>

                {/* OTP 입력 칸 */}
                <div className="flex gap-2 justify-center mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ))}
                </div>

                {/* 재전송 버튼 */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {resendTimer}초 후 재전송 가능
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      인증번호 재전송
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    확인 중...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    로그인
                  </>
                )}
              </button>
            </form>
          )}

          {/* 성공 단계 */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                로그인 성공!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                잠시 후 메인 화면으로 이동합니다...
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>이메일로 로그인하면 자동으로 계정이 생성됩니다.</p>
          <p className="mt-2">문제가 있으신가요? <a href="mailto:support@kmtc.com" className="text-blue-600 hover:text-blue-700">고객지원</a></p>
        </div>
      </div>
    </div>
  );
};
