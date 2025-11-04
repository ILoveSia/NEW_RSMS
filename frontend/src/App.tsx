import React, { useEffect, useRef } from 'react';

import AppRouter from './app/router/AppRouter';
import { initializeTheme } from './app/store/themeStore';
import { initPerformanceMonitoring } from './shared/utils/performance';
import { useAuthStore } from './app/store/authStore';
import { getCurrentUserApi } from './domains/auth/api/authApi';

import styles from './App.module.scss';

const App: React.FC = () => {
  const { isAuthenticated, logout, login, setInitializing } = useAuthStore();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 테마 시스템 초기화
    initializeTheme();

    // 성능 모니터링 초기화
    initPerformanceMonitoring();

    // 세션 유효성 검증
    // - 최초 마운트 시에만 실행 (페이지 새로고침 또는 앱 최초 로드)
    // - 로그인 직후 useEffect 재실행 시에는 건너뜀
    const validateSession = async () => {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login') || currentPath === '/' || currentPath.includes('/auth');

      // 조건: 최초 마운트 + 인증됨 + 로그인 페이지 아님
      if (isInitialMount.current && isAuthenticated && !isLoginPage) {
        try {
          console.log('[App] 세션 유효성 검증 시작...');
          setInitializing(true);
          const response = await getCurrentUserApi();

          if (!response.success || !response.userInfo) {
            // 백엔드 세션이 유효하지 않으면 로그아웃
            console.warn('[App] 세션이 만료되었습니다. 다시 로그인해주세요.');
            logout();
          } else {
            // 백엔드 세션이 유효하면 사용자 정보 업데이트
            console.log('[App] 세션 유효 - 사용자 정보 업데이트');
            const user = {
              userId: String(response.userInfo.userId),
              username: response.userInfo.username,
              email: `${response.userInfo.username}@rsms.com`,
              empNo: response.userInfo.empNo,
              password: undefined,
              role: response.userInfo.isAdmin ? 'ADMIN' : 'EMPLOYEE',
              active: true,
              accountStatus: 'ACTIVE' as const,
              empName: response.userInfo.username,
              roles: undefined,
              permissions: response.userInfo.roles.map(role => ({
                permissionId: role,
                permissionName: role,
                category: 'SYSTEM' as const,
                displayOrder: 0,
                active: true,
                id: role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'system',
                updatedBy: 'system',
                version: 1
              })),
              lastLoginAt: new Date().toISOString(),
              fullName: response.userInfo.username,
              roleCodes: response.userInfo.roles,
              isAdmin: response.userInfo.isAdmin,
              isExecutive: response.userInfo.roles.includes('201'),
              authLevel: response.userInfo.isAdmin ? 1 : 4,
              id: String(response.userInfo.userId),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system',
              version: 1
            };

            // 사용자 정보는 업데이트하되 세션 ID는 유지 (쿠키 기반이므로)
            const sessionId = `session-${Date.now()}`;
            login(user, sessionId);
          }
        } catch (error: any) {
          console.error('[App] 세션 검증 실패:', error);

          // 401 Unauthorized 또는 403 Forbidden인 경우 로그아웃 (세션 만료)
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('[App] 인증이 만료되어 로그아웃합니다.');
            logout();
          } else {
            // 다른 에러는 무시 (네트워크 오류 등)
            console.warn('[App] 세션 검증 실패했지만 로그아웃하지 않음 (상태 코드:', error.response?.status, ')');
          }
        } finally {
          setInitializing(false);
        }
      } else {
        // 로그인 페이지이거나 인증되지 않은 경우 초기화 완료
        setInitializing(false);
      }

      // 최초 마운트 플래그 해제
      isInitialMount.current = false;
    };

    validateSession();

    // 개발 환경에서 성능 보고서 생성 단축키 추가
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ctrl + Shift + P로 성능 보고서 출력
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          import('./shared/utils/performance').then(({ generatePerformanceReport }) => {
            console.log(generatePerformanceReport());
          });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAuthenticated, logout, login]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.app}>
      <AppRouter />
    </div>
  );
};

export default App;