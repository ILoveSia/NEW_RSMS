import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './FinancialLayout.module.scss';

// 금융권 RSMS 전용 레이아웃 컴포넌트
export interface FinancialLayoutProps {
  children?: React.ReactNode;
}

export const FinancialLayout: React.FC<FinancialLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTabs] = useState([
    { id: 'dashboard', title: '대시보드', icon: '📊', isActive: true },
    { id: 'resps', title: '책무관리', icon: '📋', isActive: false },
    { id: 'approval', title: '결재함', icon: '⚙️', isActive: false, badge: 3 }
  ]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.financialLayout}>
      {/* TopHeader - 64px 고정 높이 */}
      <header className={styles.topHeader}>
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
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabTitle}>{tab.title}</span>
              {tab.badge && (
                <span className={styles.tabBadge}>{tab.badge}</span>
              )}
              <button className={styles.closeButton}>✕</button>
            </button>
          ))}
        </div>

        {/* 사용자 및 도구 영역 */}
        <div className={styles.userSection}>
          <button className={styles.notificationButton}>
            🔔
            <span className={styles.notificationBadge}>5</span>
          </button>
          <div className={styles.userProfile}>
            <span className={styles.userName}>김철수</span>
            <span className={styles.userRole}>관리자</span>
          </div>
          <button className={styles.settingsButton}>⚙️</button>
        </div>
      </header>

      {/* Body - TopHeader 아래 전체 */}
      <div className={styles.body}>
        {/* LeftMenu - 280px 기본 너비 */}
        <aside className={`${styles.leftMenu} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.menuHeader}>
            <button
              className={styles.collapseButton}
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
            >
              {sidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>

          <nav className={styles.navigation}>
            {/* 대시보드 */}
            <div className={styles.menuSection}>
              <button className={`${styles.menuItem} ${styles.active}`}>
                <span className={styles.menuIcon}>📊</span>
                {!sidebarCollapsed && <span className={styles.menuTitle}>대시보드</span>}
              </button>
            </div>

            {/* 책무 관리 */}
            <div className={styles.menuSection}>
              <div className={styles.sectionTitle}>
                <span className={styles.menuIcon}>📋</span>
                {!sidebarCollapsed && <span>책무 관리</span>}
              </div>
              {!sidebarCollapsed && (
                <div className={styles.submenu}>
                  <button className={styles.submenuItem} onClick={() => window.location.href = '/app/resps/ledger-orders'}>
                    원장차수관리
                  </button>
                  <button className={styles.submenuItem} onClick={() => window.location.href = '/app/resps/responsibilities'}>
                    책무관리
                  </button>
                  <button className={styles.submenuItem} onClick={() => window.location.href = '/app/resps/specifications'}>
                    기술서관리
                  </button>
                  <button className={styles.submenuItem} onClick={() => window.location.href = '/app/resps/department-manuals'}>
                    부서장메뉴얼
                  </button>
                </div>
              )}
            </div>

            {/* 결재 관리 */}
            <div className={styles.menuSection}>
              <div className={styles.sectionTitle}>
                <span className={styles.menuIcon}>⚙️</span>
                {!sidebarCollapsed && <span>결재 관리</span>}
                {!sidebarCollapsed && <span className={styles.badge}>3</span>}
              </div>
              {!sidebarCollapsed && (
                <div className={styles.submenu}>
                  <button className={styles.submenuItem}>
                    내 결재함
                    <span className={styles.submenuBadge}>3</span>
                  </button>
                  <button className={styles.submenuItem}>결재현황</button>
                  <button className={styles.submenuItem}>결재분석</button>
                </div>
              )}
            </div>

            {/* 점검 관리 */}
            <div className={styles.menuSection}>
              <div className={styles.sectionTitle}>
                <span className={styles.menuIcon}>🔍</span>
                {!sidebarCollapsed && <span>점검 관리</span>}
              </div>
            </div>

            {/* 리포트 */}
            <div className={styles.menuSection}>
              <button className={styles.menuItem}>
                <span className={styles.menuIcon}>📊</span>
                {!sidebarCollapsed && <span className={styles.menuTitle}>리포트</span>}
              </button>
            </div>

            {/* 조직 관리 */}
            <div className={styles.menuSection}>
              <button className={styles.menuItem}>
                <span className={styles.menuIcon}>👥</span>
                {!sidebarCollapsed && <span className={styles.menuTitle}>조직관리</span>}
              </button>
            </div>

            {/* 시스템 설정 */}
            <div className={styles.menuSection}>
              <button className={styles.menuItem}>
                <span className={styles.menuIcon}>🔧</span>
                {!sidebarCollapsed && <span className={styles.menuTitle}>시스템</span>}
              </button>
            </div>
          </nav>
        </aside>

        {/* TabContext - 나머지 공간 전체 */}
        <main className={styles.tabContext}>
          <div className={styles.contentArea}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
