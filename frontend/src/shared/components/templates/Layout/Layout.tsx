import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { LeftMenu, useMenuState } from '@/shared/components/organisms/LeftMenu';
import { TopHeader } from '@/shared/components/organisms/TopHeader';
import { useTabStore } from '@/app/store/tabStore';
import { useAutoTabs } from '@/app/hooks/useAutoTabs';
import { useAuthStore } from '@/app/store/authStore';
import { logoutApi } from '@/domains/auth/api/authApi';
import { useSessionCheck } from '@/domains/auth/hooks/useSessionCheck';
import { useActivityTracker } from '@/domains/auth/hooks/useActivityTracker';

import styles from './Layout.module.scss';

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isCollapsed } = useMenuState();
  const { user, logout } = useAuthStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // 탭 상태 관리 (전역 상태 사용)
  const { tabs, closeTab, navigateToTab } = useTabStore();

  // 자동 탭 관리
  useAutoTabs();

  // 세션 관리: 주기적 세션 유효성 검사 (5분마다)
  useSessionCheck({
    checkInterval: 5 * 60 * 1000,  // 5분
    autoLogout: true,
    showExpiredAlert: true
  });

  // 사용자 활동 추적: 비활성 시 자동 로그아웃 (30분 후)
  useActivityTracker({
    inactivityWarningTime: 20 * 60 * 1000,  // 20분 후 경고
    autoLogoutTime: 30 * 60 * 1000,         // 30분 후 자동 로그아웃
    enabled: true
  });

  // 사이드바 너비 계산
  const getSidebarWidth = () => {
    if (isMobile) return '60px';
    return isCollapsed ? '60px' : '300px'; // TopHeader와 동일하게 조정
  };

  // TopHeader 이벤트 핸들러
  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.path) {
      navigateToTab(tabId);
      navigate(tab.path);
    }
  };

  const handleTabClose = (tabId: string) => {
    const { activeTabId } = useTabStore.getState();

    // 현재 닫으려는 탭이 활성 탭인지 확인
    const isActiveTab = activeTabId === tabId;

    // 탭 닫기 실행
    closeTab(tabId);

    // 닫은 탭이 활성 탭이었다면, 새로운 활성 탭으로 이동
    if (isActiveTab) {
      // 탭 닫기 후의 새로운 상태를 가져옴
      const { tabs: newTabs, activeTabId: newActiveTabId } = useTabStore.getState();

      if (newActiveTabId && newTabs.length > 0) {
        const newActiveTab = newTabs.find(t => t.id === newActiveTabId);
        if (newActiveTab?.path) {
          navigate(newActiveTab.path);
        }
      }
    }
  };

  const handleUserClick = () => {
    console.log('User profile clicked');
    // TODO: 사용자 프로필 페이지로 이동
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // 서버에 로그아웃 요청
      await logoutApi();
    } catch (error) {
      console.error('로그아웃 API 에러:', error);
      // 에러가 발생해도 클라이언트 로그아웃은 진행
    } finally {
      // 클라이언트 상태 초기화
      logout();

      // 로그인 페이지로 이동
      navigate('/login', { replace: true });

      // 다이얼로그 닫기
      setLogoutDialogOpen(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  // 사용자 프로필 정보 (실제 데이터 사용)
  const userProfile = {
    name: user?.fullName || user?.empName || '사용자',
    role: user?.roleCodes?.[0] || '사용자',
    employeeId: user?.empNo || '-'
  };

  return (
    <div className={styles.layout}>
      {/* 상단 헤더 */}
      <TopHeader
        activeTabs={tabs}
        userProfile={userProfile}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onUserClick={handleUserClick}
        onLogoutClick={handleLogoutClick}
      />

      {/* Body: LeftMenu + Content */}
      <div
        className={styles.body}
        style={{
          gridTemplateColumns: `${getSidebarWidth()} 1fr`
        }}
      >
        {/* 좌측 사이드바 메뉴 */}
        <LeftMenu />

        {/* 메인 콘텐츠 영역 */}
        <main className={styles.main}>
          {/* 페이지 콘텐츠 */}
          <Box component="div" className={styles.content}>
            <Outlet />
          </Box>
        </main>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          로그아웃 확인
        </DialogTitle>
        <DialogContent>
          정말 로그아웃 하시겠습니까?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            취소
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" variant="contained" autoFocus>
            로그아웃
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};