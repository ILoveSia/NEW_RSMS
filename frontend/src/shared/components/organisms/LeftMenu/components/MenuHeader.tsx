/**
 * LeftMenu 헤더 컴포넌트 (로고 및 토글 버튼)
 */

import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { MenuOpen, Menu } from '@mui/icons-material';
import { useMenuState } from '../hooks/useMenuState';
import styles from './MenuHeader.module.scss';

interface MenuHeaderProps {
  isCollapsed?: boolean;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  isCollapsed = false
}) => {
  const { toggleSidebar } = useMenuState();

  return (
    <Box className={styles.menuHeader}>
      {/* 로고 영역 */}
      <Box className={styles.logoSection}>
        {!isCollapsed && (
          <Box className={styles.logoContent}>
            <Typography variant="h6" className={styles.logoTitle}>
              RSMS
            </Typography>
            <Typography variant="caption" className={styles.logoSubtitle}>
              책무구조도 관리시스템
            </Typography>
          </Box>
        )}

        {/* 사이드바 토글 버튼 */}
        <Tooltip title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'} placement="right">
          <IconButton
            onClick={toggleSidebar}
            className={styles.toggleButton}
            size="small"
          >
            {isCollapsed ? <Menu /> : <MenuOpen />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};