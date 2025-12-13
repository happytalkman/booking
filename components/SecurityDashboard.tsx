import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { securityService } from '../services/securityService';
import { Language } from '../types';

interface SecurityDashboardProps {
  lang: Language;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface SecurityStatus {
  score: number;
  issues: string[];
  recommendations: string[];
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ lang, isOpen = false, onToggle }) => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    score: 0,
    issues: [],
    recommendations: []
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    title: { ko: '보안 상태 대시보드', en: 'Security Status Dashboard' },
    score: { ko: '보안 점수', en: 'Security Score' },
    issues: { ko: '보안 이슈', en: 'Security Issues' },
    recommendations: { ko: '권장사항', en: 'Recommendations' },
    refresh: { ko: '새로고침', en: 'Refresh' },
    showDetails: { ko: '상세 보기', en: 'Show Details' },
    hideDetails: { ko: '상세 숨기기', en: 'Hide Details' },
    excellent: { ko: '우수', en: 'Excellent' },
    good: { ko: '양호', en: 'Good' },
    warning: { ko: '주의', en: 'Warning' },
    critical: { ko: '위험', en: 'Critical' },
    noIssues: { ko: '발견된 보안 이슈가 없습니다.', en: 'No security issues found.' },
    noRecommendations: { ko: '추가 권장사항이 없습니다.', en: 'No additional recommendations.' }
  };

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    setIsLoading(true);
    try {
      // 보안 상태 검사
      const status = securityService.validateEnvironmentSecurity();
      setSecurityStatus(status);
    } catch (error) {
      console.error('Security check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return t.excellent[lang];
    if (score >= 70) return t.good[lang];
    if (score >= 50) return t.warning[lang];
    return t.critical[lang];
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 70) return <Shield className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  // 컴팩트 버튼 모드
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="relative p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title={t.title[lang]}
      >
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${getScoreColor(securityStatus.score)}`} />
          {!isLoading && (
            <span className={`text-sm font-bold ${getScoreColor(securityStatus.score)}`}>
              {securityStatus.score}
            </span>
          )}
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        
        {/* 상태 표시 점 */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          securityStatus.score >= 90 ? 'bg-green-500' :
          securityStatus.score >= 70 ? 'bg-yellow-500' :
          securityStatus.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
        }`}></div>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 max-w-md">
        <div className="flex items-center justify-center h-24">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 max-w-md">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t.title[lang]}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {showDetails ? <EyeOff size={12} /> : <Eye size={12} />}
            {showDetails ? t.hideDetails[lang] : t.showDetails[lang]}
          </button>
          
          <button
            onClick={checkSecurityStatus}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <RefreshCw size={12} />
            {t.refresh[lang]}
          </button>
          
          {onToggle && (
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 보안 점수 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t.score[lang]}
          </span>
          <div className="flex items-center gap-1">
            {getScoreIcon(securityStatus.score)}
            <span className={`text-lg font-bold ${getScoreColor(securityStatus.score)}`}>
              {securityStatus.score}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              securityStatus.score >= 90 ? 'bg-green-500' :
              securityStatus.score >= 70 ? 'bg-yellow-500' :
              securityStatus.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${securityStatus.score}%` }}
          ></div>
        </div>
        
        <div className="text-right mt-1">
          <span className={`text-xs font-medium ${getScoreColor(securityStatus.score)}`}>
            {getScoreLabel(securityStatus.score)}
          </span>
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="space-y-3">
          {/* 보안 이슈 */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              {t.issues[lang]} ({securityStatus.issues.length})
            </h4>
            
            {securityStatus.issues.length > 0 ? (
              <div className="space-y-1">
                {securityStatus.issues.slice(0, 3).map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300">{issue}</span>
                  </div>
                ))}
                {securityStatus.issues.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{securityStatus.issues.length - 3} more issues
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <span className="text-xs text-green-700 dark:text-green-300">
                  {t.noIssues[lang]}
                </span>
              </div>
            )}
          </div>

          {/* 권장사항 */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-blue-500" />
              {t.recommendations[lang]} ({securityStatus.recommendations.length})
            </h4>
            
            {securityStatus.recommendations.length > 0 ? (
              <div className="space-y-1">
                {securityStatus.recommendations.slice(0, 2).map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs"
                  >
                    <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700 dark:text-blue-300">{recommendation}</span>
                  </div>
                ))}
                {securityStatus.recommendations.length > 2 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{securityStatus.recommendations.length - 2} more recommendations
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <span className="text-xs text-green-700 dark:text-green-300">
                  {t.noRecommendations[lang]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;