/**
 * TopHeader 컴포넌트
 * RSMS 상단 헤더 - 브랜딩, 탭 네비게이션, 사용자 정보
 */

import React from 'react';
import { IconButton, Badge, useTheme, useMediaQuery } from '@mui/material';
import { Notifications, Settings, AccountCircle } from '@mui/icons-material';
import { useMenuState } from '@/shared/components/organisms/LeftMenu';
import { TopHeaderProps } from './types/header.types';

import styles from './TopHeader.module.scss';

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTabs = [],
  userProfile = { name: '김철수', role: '관리자' },
  notificationCount = 5,
  onTabClick,
  onTabClose,
  onNotificationClick,
  onSettingsClick,
  onUserClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isCollapsed } = useMenuState();

  // 사이드바 너비에 따른 그리드 열 계산
  const getSidebarWidth = () => {
    if (isMobile) return '60px'; // 모바일에서는 최소 너비
    return isCollapsed ? '60px' : '300px'; // 브랜딩 영역을 위해 조금 더 넓게
  };

  const handleTabClick = (tabId: string) => {
    if (onTabClick) {
      onTabClick(tabId);
    }
  };

  const handleTabClose = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onTabClose) {
      onTabClose(tabId);
    }
  };

  return (
    <header
      className={styles.topHeader}
      style={{
        gridTemplateColumns: `${getSidebarWidth()} 1fr auto`
      }}
    >
      {/* 브랜딩 영역 */}
      <div className={styles.brandSection}>
        <div className={styles.logo}>🏢</div>
        <div className={styles.brandInfo}>
          <div className={styles.title}>ITCEN ENTEC</div>
          <div className={styles.subtitle}>책무구조도 관리시스템</div>
        </div>
      </div>

      {/* 탭 네비게이션 영역 */}
      <div className={styles.tabNavigation}>
        {activeTabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.isActive ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabTitle}>{tab.title}</span>
            {tab.badge && (
              <span className={styles.tabBadge}>{tab.badge}</span>
            )}
            <button
              className={styles.closeButton}
              onClick={(e) => handleTabClose(tab.id, e)}
              aria-label={`${tab.title} 탭 닫기`}
            >
              ✕
            </button>
          </button>
        ))}
      </div>

      {/* 사용자 및 도구 영역 */}
      <div className={styles.userSection}>
        <IconButton
          className={styles.iconButton}
          onClick={onNotificationClick}
          aria-label="알림"
        >
          <Badge badgeContent={notificationCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        <div className={styles.userProfile} onClick={onUserClick}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userProfile.name}</span>
            <span className={styles.userRole}>{userProfile.role}</span>
          </div>
          <AccountCircle className={styles.userAvatar} />
        </div>

        <IconButton
          className={styles.iconButton}
          onClick={onSettingsClick}
          aria-label="설정"
        >
          <Settings />
        </IconButton>
      </div>
    </header>
  );
};