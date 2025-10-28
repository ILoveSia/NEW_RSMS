/**
 * 세션 자동 갱신 및 만료 처리 Hook
 * - 주기적으로 세션 유효성 확인
 * - 세션 만료 시 자동 로그아웃 및 알림
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/authStore';
import { checkSessionApi } from '@/domains/auth/api/authApi';

interface UseSessionCheckOptions {
  /**
   * 세션 체크 간격 (밀리초)
   * @default 300000 (5분)
   */
  checkInterval?: number;

  /**
   * 세션 만료 시 자동 로그아웃 여부
   * @default true
   */
  autoLogout?: boolean;

  /**
   * 세션 만료 알림 표시 여부
   * @default true
   */
  showExpiredAlert?: boolean;

  /**
   * 세션 만료 시 콜백
   */
  onSessionExpired?: () => void;
}

/**
 * 세션 자동 갱신 및 만료 처리 Hook
 */
export const useSessionCheck = (options: UseSessionCheckOptions = {}) => {
  const {
    checkInterval = 5 * 60 * 1000, // 5분
    autoLogout = true,
    showExpiredAlert = true,
    onSessionExpired
  } = options;

  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  /**
   * 세션 유효성 확인
   */
  const checkSession = useCallback(async () => {
    // 이미 체크 중이거나 인증되지 않은 경우 건너뛰기
    if (isCheckingRef.current || !isAuthenticated) {
      return;
    }

    isCheckingRef.current = true;

    try {
      const response = await checkSessionApi();

      if (!response.valid) {
        console.warn('세션이 만료되었습니다');
        handleSessionExpired();
      } else {
        console.log('세션 유효성 확인 완료');
      }
    } catch (error: any) {
      console.error('세션 체크 에러:', error);

      // 401 Unauthorized 에러인 경우 세션 만료로 처리
      if (error.response?.status === 401) {
        handleSessionExpired();
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [isAuthenticated]);

  /**
   * 세션 만료 처리
   */
  const handleSessionExpired = useCallback(() => {
    // 사용자 정의 콜백 실행
    if (onSessionExpired) {
      onSessionExpired();
    }

    // 알림 표시
    if (showExpiredAlert) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 자동 로그아웃
    if (autoLogout) {
      logout();
      navigate('/login', {
        replace: true,
        state: { sessionExpired: true }
      });
    }
  }, [autoLogout, showExpiredAlert, onSessionExpired, logout, navigate]);

  /**
   * 주기적인 세션 체크 시작
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // 초기 세션 체크 (1초 후)
    const initialTimeout = setTimeout(() => {
      checkSession();
    }, 1000);

    // 주기적인 세션 체크
    intervalRef.current = setInterval(() => {
      checkSession();
    }, checkInterval);

    // 클린업
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, checkInterval, checkSession]);

  return {
    checkSession,
    handleSessionExpired
  };
};
