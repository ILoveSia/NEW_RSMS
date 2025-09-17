import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { LeftMenu, useMenuState } from '@/shared/components/organisms/LeftMenu';
import { TopHeader, Tab } from '@/shared/components/organisms/TopHeader';

import styles from './Layout.module.scss';

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isCollapsed } = useMenuState();

  // 탭 상태 관리
  const [activeTabs, setActiveTabs] = useState<Tab[]>([
    { id: 'dashboard', title: '대시보드', icon: '📊', isActive: true, path: '/app/dashboard' },
  ]);

  // 사이드바 너비 계산
  const getSidebarWidth = () => {
    if (isMobile) return '60px';
    return isCollapsed ? '60px' : '300px'; // TopHeader와 동일하게 조정
  };

  // TopHeader 이벤트 핸들러
  const handleTabClick = (tabId: string) => {
    const tab = activeTabs.find(t => t.id === tabId);
    if (tab?.path) {
      // 라우터 네비게이션은 향후 구현
      console.log('Navigate to:', tab.path);
    }
  };

  const handleTabClose = (tabId: string) => {
    setActiveTabs(tabs => tabs.filter(tab => tab.id !== tabId));
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleUserClick = () => {
    console.log('User profile clicked');
  };

  return (
    <div className={styles.layout}>
      {/* 상단 헤더 */}
      <TopHeader
        activeTabs={activeTabs}
        userProfile={{ name: '김철수', role: '관리자' }}
        notificationCount={5}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNotificationClick={handleNotificationClick}
        onSettingsClick={handleSettingsClick}
        onUserClick={handleUserClick}
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
    </div>
  );
};