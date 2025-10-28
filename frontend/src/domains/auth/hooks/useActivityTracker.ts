/**
 * 사용자 활동 추적 Hook
 * - 마우스, 키보드 활동 감지
 * - 일정 시간 비활성 시 경고 표시
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/app/store/authStore';

interface UseActivityTrackerOptions {
  /**
   * 비활성 경고 시간 (밀리초)
   * @default 1200000 (20분)
   */
  inactivityWarningTime?: number;

  /**
   * 자동 로그아웃 시간 (밀리초)
   * @default 1800000 (30분)
   */
  autoLogoutTime?: number;

  /**
   * 비활성 경고 시 콜백
   */
  onInactivityWarning?: () => void;

  /**
   * 자동 로그아웃 시 콜백
   */
  onAutoLogout?: () => void;

  /**
   * 활동 추적 활성화 여부
   * @default true
   */
  enabled?: boolean;
}

/**
 * 사용자 활동 추적 Hook
 */
export const useActivityTracker = (options: UseActivityTrackerOptions = {}) => {
  const {
    inactivityWarningTime = 20 * 60 * 1000, // 20분
    autoLogoutTime = 30 * 60 * 1000, // 30분
    onInactivityWarning,
    onAutoLogout,
    enabled = true
  } = options;

  const { isAuthenticated, logout } = useAuthStore();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 마지막 활동 시간 업데이트
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  /**
   * 비활성 시간 확인
   */
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const inactiveTime = now - lastActivityRef.current;

    // 자동 로그아웃 시간 초과
    if (inactiveTime >= autoLogoutTime) {
      console.warn('비활성으로 인한 자동 로그아웃');

      if (onAutoLogout) {
        onAutoLogout();
      }

      logout();
      window.location.href = '/login?reason=inactivity';
      return;
    }

    // 비활성 경고 시간 초과
    if (inactiveTime >= inactivityWarningTime && !warningShownRef.current) {
      console.warn('비활성 경고');
      warningShownRef.current = true;

      if (onInactivityWarning) {
        onInactivityWarning();
      }

      // 기본 알림
      const remainingTime = Math.ceil((autoLogoutTime - inactiveTime) / 60000);
      alert(`${remainingTime}분 후 자동 로그아웃됩니다. 화면을 클릭하거나 키를 입력해주세요.`);
    }
  }, [autoLogoutTime, inactivityWarningTime, onAutoLogout, onInactivityWarning, logout]);

  /**
   * 활동 이벤트 리스너 등록
   */
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    // 활동 이벤트 타입들
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // 쓰로틀링을 위한 타이머
    let throttleTimer: NodeJS.Timeout | null = null;

    // 쓰로틀된 활동 업데이트 (1초에 한 번만)
    const throttledUpdateActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          updateActivity();
          throttleTimer = null;
        }, 1000);
      }
    };

    // 이벤트 리스너 등록
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    // 주기적인 비활성 체크 (1분마다)
    checkIntervalRef.current = setInterval(checkInactivity, 60 * 1000);

    // 클린업
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledUpdateActivity);
      });

      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, isAuthenticated, updateActivity, checkInactivity]);

  return {
    updateActivity,
    lastActivity: lastActivityRef.current
  };
};
