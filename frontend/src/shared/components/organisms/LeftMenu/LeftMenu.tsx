/**
 * RSMS LeftMenu 메인 컴포넌트
 * 사이드바 네비게이션 메뉴
 */

import React, { useEffect } from 'react';
import {
  Drawer,
  List,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import { MenuHeader } from './components/MenuHeader';
import { MenuGroup } from './components/MenuGroup';
import { MenuItem } from './components/MenuItem';
import { useMenuState } from './hooks/useMenuState';
import { useActiveMenu } from './hooks/useActiveMenu';
import { MENU_DATA, filterMenuByPermission } from './data/menuData';
import { useAuthStore } from '@/app/store/authStore';
import { useMenuStore } from '@/app/store/menuStore';
import styles from './LeftMenu.module.scss';

interface LeftMenuProps {
  className?: string;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({ className }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isCollapsed, toggleSidebar } = useMenuState();

  // 활성 메뉴 감지
  useActiveMenu();

  // 인증 및 메뉴 스토어
  const { isAuthenticated } = useAuthStore();
  const { menus, isLoading, error, fetchMenus } = useMenuStore();

  // 메뉴 데이터 로드 (로그인 시 한 번만)
  useEffect(() => {
    if (isAuthenticated && menus.length === 0 && !isLoading && !error) {
      console.log('LeftMenu: 메뉴 데이터 로드 시작');
      fetchMenus();
    }
  }, [isAuthenticated, menus.length, isLoading, error, fetchMenus]);

  // Real 데이터가 있으면 사용, 없으면 Fallback (MENU_DATA)
  const menuData = menus.length > 0 ? menus : MENU_DATA;

  console.log('LeftMenu: menuData', {
    isAuthenticated,
    menusLength: menus.length,
    isLoading,
    error,
    usingRealData: menus.length > 0
  });

  // 사용자 권한 정보 (임시로 모든 권한 허용)
  const userRoles = ['USER', 'MANAGER', 'ADMIN', 'EXECUTIVE'];

  // 권한에 따른 메뉴 필터링
  const filteredMenuData = filterMenuByPermission(menuData, userRoles);

  // 모바일에서는 자동으로 축소 모드로 변경
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      // 모바일에서는 드로어 형태로 변경하되, 상태는 유지
    }
  }, [isMobile]);

  const drawerWidth = isCollapsed ? 60 : 300;

  const drawerContent = (
    <Box className={styles.drawerContent}>
      {/* 메뉴 헤더 */}
      <MenuHeader isCollapsed={isCollapsed} />

      {/* 로딩 상태 */}
      {isLoading && isAuthenticated && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
            {error}
            <br />
            <small>기본 메뉴를 표시합니다.</small>
          </Alert>
        </Box>
      )}

      {/* 메뉴 리스트 */}
      <Box className={styles.menuContainer}>
        <List component="nav" className={styles.menuList}>
          {filteredMenuData.map((item) => {
            // 하위 메뉴가 있으면 MenuGroup, 없으면 단일 MenuItem
            if (item.children && item.children.length > 0) {
              return (
                <MenuGroup
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              );
            } else {
              return (
                <MenuItem
                  key={item.id}
                  item={item}
                  level={0}
                  isCollapsed={isCollapsed}
                />
              );
            }
          })}
        </List>
      </Box>

      {/* 하단 여백 */}
      <Box className={styles.drawerFooter} />
    </Box>
  );

  // 모바일에서는 임시 드로어, 데스크톱에서는 고정 드로어
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={!isCollapsed}
        onClose={toggleSidebar}
        className={`${styles.leftMenu} ${styles.mobileDrawer} ${className || ''}`}
        classes={{
          paper: styles.drawerPaper
        }}
        ModalProps={{
          keepMounted: true // 성능 최적화
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      className={`${styles.leftMenu} ${isCollapsed ? styles.collapsed : styles.expanded} ${className || ''}`}
      classes={{
        paper: styles.drawerPaper
      }}
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};