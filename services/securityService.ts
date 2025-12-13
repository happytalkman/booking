// 보안 서비스
// API 키 검증, 토큰 관리, 보안 헤더 등

interface SecurityConfig {
  enableHTTPS: boolean;
  secureCookies: boolean;
  tokenExpiry: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
}

class SecurityService {
  private config: SecurityConfig;
  private loginAttempts: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();

  constructor() {
    this.config = {
      enableHTTPS: import.meta.env.VITE_ENABLE_HTTPS === 'true',
      secureCookies: import.meta.env.VITE_SECURE_COOKIES === 'true',
      tokenExpiry: 8 * 60 * 60 * 1000, // 8시간
      maxLoginAttempts: 5,
      sessionTimeout: 30 * 60 * 1000 // 30분
    };
  }

  // API 키 유효성 검증
  validateApiKey(key: string, service: string): boolean {
    if (!key || key.length < 10) return false;
    
    const invalidKeys = [
      'your_actual_gemini_api_key_here',
      'your_actual_openrouter_api_key_here',
      'PLACEHOLDER_API_KEY',
      'DEMO',
      'demo_key',
      'guest'
    ];

    return !invalidKeys.includes(key);
  }

  // 보안 헤더 생성
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': this.getCSPHeader(),
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // CSP 헤더 생성
  private getCSPHeader(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openrouter.ai https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    return directives.join('; ');
  }

  // 로그인 시도 추적
  trackLoginAttempt(identifier: string, success: boolean): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;

    if (success) {
      this.loginAttempts.delete(identifier);
      return true;
    }

    const newAttempts = attempts + 1;
    this.loginAttempts.set(identifier, newAttempts);

    if (newAttempts >= this.config.maxLoginAttempts) {
      this.blockedIPs.add(identifier);
      console.warn(`🚫 IP ${identifier} blocked due to excessive login attempts`);
      return false;
    }

    return true;
  }

  // IP 차단 확인
  isBlocked(identifier: string): boolean {
    return this.blockedIPs.has(identifier);
  }

  // 토큰 보안 검증
  validateToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      if (!token || token.length < 10) {
        return { valid: false, error: 'Invalid token format' };
      }

      const payload = JSON.parse(atob(token));

      // 필수 필드 확인
      if (!payload.iat || !payload.exp || !payload.email) {
        return { valid: false, error: 'Missing required token fields' };
      }

      // 만료 확인
      if (Date.now() > payload.exp) {
        return { valid: false, error: 'Token expired' };
      }

      // 발급 시간 확인 (미래 토큰 방지)
      if (payload.iat > Date.now()) {
        return { valid: false, error: 'Invalid token timestamp' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Token parsing failed' };
    }
  }

  // 민감한 데이터 마스킹
  maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) return data;

    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'key'];
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        const value = masked[field].toString();
        masked[field] = value.length > 8 
          ? `${value.substring(0, 4)}****${value.substring(value.length - 4)}`
          : '****';
      }
    }

    return masked;
  }

  // 보안 이벤트 로깅
  logSecurityEvent(event: {
    type: 'LOGIN_ATTEMPT' | 'TOKEN_VALIDATION' | 'API_ACCESS' | 'SECURITY_VIOLATION';
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId || 'anonymous',
      ip: event.ip || 'unknown',
      userAgent: event.userAgent || 'unknown',
      details: this.maskSensitiveData(event.details)
    };

    console.log('🔒 Security Event:', logEntry);

    // 실제 환경에서는 보안 로그 서버로 전송
    // await this.sendToSecurityLog(logEntry);
  }

  // 환경별 보안 설정 확인
  validateEnvironmentSecurity(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // HTTPS 확인
    if (!this.config.enableHTTPS && import.meta.env.PROD) {
      issues.push('HTTPS가 비활성화됨');
      recommendations.push('프로덕션에서는 HTTPS를 활성화하세요');
      score -= 20;
    }

    // API 키 확인
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.validateApiKey(geminiKey, 'gemini')) {
      issues.push('Gemini API 키가 설정되지 않음');
      recommendations.push('실제 Gemini API 키를 설정하세요');
      score -= 15;
    }

    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!this.validateApiKey(openRouterKey, 'openrouter')) {
      issues.push('OpenRouter API 키가 설정되지 않음');
      recommendations.push('실제 OpenRouter API 키를 설정하세요');
      score -= 15;
    }

    // 개발 도구 확인
    if (import.meta.env.DEV) {
      issues.push('개발 모드에서 실행 중');
      recommendations.push('프로덕션 빌드를 사용하세요');
      score -= 10;
    }

    return { score, issues, recommendations };
  }

  // 보안 설정 초기화
  initializeSecurity(): void {
    // 보안 헤더 설정 (실제로는 서버에서 처리)
    if (typeof document !== 'undefined') {
      // CSP 메타 태그 추가
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = this.getCSPHeader();
      document.head.appendChild(cspMeta);
    }

    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      this.logSecurityEvent({
        type: 'SECURITY_VIOLATION',
        details: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno
        }
      });
    });

    console.log('🔒 Security service initialized');
  }
}

export const securityService = new SecurityService();

// 보안 데코레이터
export function requireAuth(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const token = localStorage.getItem('auth_token');
    const validation = securityService.validateToken(token || '');

    if (!validation.valid) {
      throw new Error('Authentication required');
    }

    return method.apply(this, args);
  };
}

// 권한 확인 데코레이터
export function requireRole(roles: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const token = localStorage.getItem('auth_token');
      const validation = securityService.validateToken(token || '');

      if (!validation.valid) {
        throw new Error('Authentication required');
      }

      if (!roles.includes(validation.payload.role)) {
        throw new Error('Insufficient permissions');
      }

      return method.apply(this, args);
    };
  };
}

export default securityService;