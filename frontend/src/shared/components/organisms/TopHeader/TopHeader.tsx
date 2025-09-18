/**
 * TopHeader 컴포넌트
 * RSMS 상단 헤더 - 브랜딩, 탭 네비게이션, 사용자 정보
 */

import React from 'react';
import { IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Logout, AccountCircle } from '@mui/icons-material';
import { useMenuState } from '@/shared/components/organisms/LeftMenu';
import { TopHeaderProps } from './types/header.types';

import styles from './TopHeader.module.scss';

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTabs = [],
  userProfile = { name: '김철수', role: '관리자', employeeId: 'EMP001' },
  onTabClick,
  onTabClose,
  onUserClick,
  onLogoutClick
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
        <div className={styles.logo}>
          <img
            src="/src/assets/images/itcen.jpg"
            alt="ITCEN ENTEC Logo"
            className={styles.logoImage}
          />
        </div>
        <div className={styles.brandInfo}>
          <div className={styles.title}>
            ITCEN ENTEC
          </div>
          <div className={styles.subtitle}>
            책무구조도 관리시스템
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 영역 */}
      <div className={styles.tabNavigation}>
        {activeTabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.isActive ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
            aria-label={`${tab.title} 탭으로 이동`}
            aria-current={tab.isActive ? 'page' : undefined}
            role="tab"
            tabIndex={0}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabTitle}>{tab.title}</span>
            {tab.badge && (
              <span className={styles.tabBadge}>{tab.badge}</span>
            )}
            <span
              className={styles.closeButton}
              onClick={(e) => handleTabClose(tab.id, e)}
              role="button"
              tabIndex={0}
              aria-label={`${tab.title} 탭 닫기`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // MouseEvent와 유사한 구조로 이벤트 객체 생성
                  const syntheticEvent = {
                    ...e,
                    stopPropagation: e.stopPropagation.bind(e),
                    preventDefault: e.preventDefault.bind(e)
                  } as unknown as React.MouseEvent;
                  handleTabClose(tab.id, syntheticEvent);
                }
              }}
            >
              ✕
            </span>
          </button>
        ))}
      </div>

      {/* 사용자 및 도구 영역 */}
      <div className={styles.userSection}>
        <div className={styles.userProfile} onClick={onUserClick}>
          <AccountCircle className={styles.userAvatar} />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userProfile.name}</span>
            <span className={styles.userEmployeeId}>{userProfile.employeeId}</span>
          </div>
        </div>

        <IconButton
          className={styles.iconButton}
          onClick={onLogoutClick}
          aria-label="로그아웃"
        >
          <Logout />
        </IconButton>
      </div>
    </header>
  );
};