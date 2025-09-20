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
  useMediaQuery
} from '@mui/material';
import { MenuHeader } from './components/MenuHeader';
import { MenuGroup } from './components/MenuGroup';
import { MenuItem } from './components/MenuItem';
import { useMenuState } from './hooks/useMenuState';
import { useActiveMenu } from './hooks/useActiveMenu';
import { MENU_DATA, filterMenuByPermission } from './data/menuData';
import { useAuthStore } from '@/app/store/authStore'; // 인증 스토어 (가정)
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

  // 사용자 권한 정보 (실제로는 useAuthStore에서 가져옴)
  // const { user } = useAuthStore();
  // 임시로 관리자 권한으로 설정
  const userRoles = ['USER', 'MANAGER', 'ADMIN', 'EXECUTIVE'];

  // 권한에 따른 메뉴 필터링
  const filteredMenuData = filterMenuByPermission(MENU_DATA, userRoles);

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