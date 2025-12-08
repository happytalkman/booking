// OTP 인증 서비스
// 백엔드 API와 통신

interface UserProfile {
  email: string;
  name: string;
  role: 'shipper' | 'forwarder' | 'carrier' | 'admin';
  company: string;
  createdAt: string;
  lastLogin: string;
}

// API 기본 URL
const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001';

// 이메일로 OTP 전송
export const sendOTP = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OTP 전송 오류:', error);
    return { 
      success: false, 
      message: '네트워크 오류가 발생했습니다.' 
    };
  }
};

// OTP 검증
export const verifyOTP = async (
  email: string, 
  otp: string
): Promise<{ 
  success: boolean; 
  message: string; 
  token?: string;
  role?: string;
  name?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    // 로그인 성공 시 감사 로그 기록
    if (data.success) {
      logAuditEvent({
        userId: email,
        action: 'LOGIN',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    }

    return data;
  } catch (error) {
    console.error('OTP 검증 오류:', error);
    return { 
      success: false, 
      message: '네트워크 오류가 발생했습니다.' 
    };
  }
};

// 토큰 검증
export const verifyToken = (token: string): { valid: boolean; user?: UserProfile } => {
  try {
    const payload = JSON.parse(atob(token));
    
    // 만료 확인
    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    const user = userProfiles[payload.email];
    if (!user) {
      return { valid: false };
    }

    return { valid: true, user };
  } catch {
    return { valid: false };
  }
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  
  logAuditEvent({
    userId: localStorage.getItem('user_email') || 'unknown',
    action: 'LOGOUT',
    timestamp: new Date().toISOString()
  });
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = (): UserProfile | null => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  const result = verifyToken(token);
  return result.valid ? result.user || null : null;
};

// 권한 확인
export const hasPermission = (
  requiredRole: UserProfile['role'] | UserProfile['role'][]
): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // admin은 모든 권한 보유
  if (user.role === 'admin') return true;
  
  return roles.includes(user.role);
};

// 감사 로그 인터페이스
interface AuditLog {
  userId: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

// 감사 로그 저장소
const auditLogs: AuditLog[] = [];

// 감사 로그 기록
export const logAuditEvent = (log: AuditLog) => {
  auditLogs.push(log);
  console.log('📝 감사 로그:', log);
  
  // 실제로는 백엔드 API로 전송
  // await fetch('/api/audit/log', {
  //   method: 'POST',
  //   body: JSON.stringify(log)
  // });
};

// 감사 로그 조회 (관리자 전용)
export const getAuditLogs = (
  filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }
): AuditLog[] => {
  if (!hasPermission('admin')) {
    throw new Error('권한이 없습니다.');
  }

  let filtered = [...auditLogs];

  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  if (filters?.action) {
    filtered = filtered.filter(log => log.action === filters.action);
  }
  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
  }

  return filtered.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// 역할별 접근 가능한 페이지 정의
export const rolePermissions = {
  admin: ['*'], // 모든 페이지
  carrier: ['dashboard', 'booking', 'inventory', 'market', 'knowledge', 'risk', 'scenarios'],
  forwarder: ['dashboard', 'booking', 'market', 'knowledge', 'scenarios'],
  shipper: ['dashboard', 'booking', 'market', 'scenarios']
};

// 페이지 접근 권한 확인
export const canAccessPage = (page: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  const permissions = rolePermissions[user.role];
  return permissions.includes('*') || permissions.includes(page);
};
