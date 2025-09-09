import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import styles from './Layout.module.scss';

export const Layout: React.FC = () => {
  return (
    <div className={styles.layout}>
      {/* 헤더 영역 (디자인 완료 후 구현) */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>EMS</h1>
            <span>Entity Management System</span>
          </div>
          
          <nav className={styles.navigation}>
            <a href="/dashboard" className={styles.navItem}>대시보드</a>
            <a href="/entities" className={styles.navItem}>엔티티관리</a>
            <a href="/users" className={styles.navItem}>사용자관리</a>
            <a href="/reports" className={styles.navItem}>보고서</a>
          </nav>
          
          <div className={styles.userArea}>
            <span className={styles.userName}>관리자</span>
            <div className={styles.userMenu}>⚙️</div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className={styles.main}>
        <Box component="div" className={styles.content}>
          <Outlet />
        </Box>
      </main>

      {/* 푸터 영역 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span>© 2024 EMS. All rights reserved.</span>
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
};