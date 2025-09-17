/**
 * 개별 메뉴 아이템 컴포넌트
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { MenuItem as MenuItemType } from '../types/menu.types';
import { useMenuState } from '../hooks/useMenuState';
import styles from './MenuItem.module.scss';

interface MenuItemProps {
  item: MenuItemType;
  level?: number; // 메뉴 깊이 (0: 1차 메뉴, 1: 2차 메뉴)
  isCollapsed?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  level = 0,
  isCollapsed = false
}) => {
  const navigate = useNavigate();
  const { activeMenuItem, setActiveMenu } = useMenuState();

  const isActive = activeMenuItem === item.id;

  // Material-UI 아이콘 동적 로딩
  const IconComponent = item.icon ? (Icons as any)[item.icon] : null;

  const handleClick = () => {
    if (item.path) {
      setActiveMenu(item.id);
      navigate(item.path);
    }
  };

  const indentStyle = {
    paddingLeft: isCollapsed ? 0 : `${16 + (level * 16)}px`
  };

  return (
    <ListItem
      disablePadding
      className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
    >
      <ListItemButton
        onClick={handleClick}
        className={styles.menuButton}
        style={indentStyle}
        disabled={!item.path} // path가 없으면 비활성화
      >
        {/* 아이콘 */}
        {IconComponent && (
          <ListItemIcon className={styles.menuIcon}>
            {item.badge && item.badge > 0 ? (
              <Badge badgeContent={item.badge} color="error">
                <IconComponent />
              </Badge>
            ) : (
              <IconComponent />
            )}
          </ListItemIcon>
        )}

        {/* 메뉴 텍스트 */}
        {!isCollapsed && (
          <ListItemText
            primary={item.title}
            className={styles.menuText}
            primaryTypographyProps={{
              fontSize: level === 0 ? '14px' : '13px',
              fontWeight: level === 0 ? 600 : 400,
              color: isActive ? 'primary.main' : 'text.primary'
            }}
          />
        )}

        {/* 배지 (축소 모드일 때는 아이콘 위에 표시) */}
        {isCollapsed && item.badge && item.badge > 0 && (
          <Badge
            badgeContent={item.badge}
            color="error"
            className={styles.collapsedBadge}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};