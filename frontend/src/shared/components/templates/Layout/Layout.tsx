import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { LeftMenu, useMenuState } from '@/shared/components/organisms/LeftMenu';
import { TopHeader } from '@/shared/components/organisms/TopHeader';
import { useTabStore } from '@/app/store/tabStore';
import { useAutoTabs } from '@/app/hooks/useAutoTabs';

import styles from './Layout.module.scss';

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isCollapsed } = useMenuState();

  // 탭 상태 관리 (전역 상태 사용)
  const { tabs, closeTab, navigateToTab } = useTabStore();

  // 자동 탭 관리
  useAutoTabs();

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
    closeTab(tabId);
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
        activeTabs={tabs}
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