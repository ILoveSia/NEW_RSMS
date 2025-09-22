/**
 * 접을 수 있는 메뉴 그룹 컴포넌트
 */

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { MenuItem as MenuItemType } from '../types/menu.types';
import { MenuItem } from './MenuItem';
import { useMenuState } from '../hooks/useMenuState';
import styles from './MenuGroup.module.scss';

interface MenuGroupProps {
  item: MenuItemType;
  isCollapsed?: boolean;
}

export const MenuGroup: React.FC<MenuGroupProps> = ({
  item,
  isCollapsed = false
}) => {
  const { expandedGroups, toggleGroup } = useMenuState();
  const isExpanded = expandedGroups.includes(item.id);

  // Material-UI 아이콘 동적 로딩
  const IconComponent = item.icon ? (Icons as any)[item.icon] : null;

  const handleGroupClick = () => {
    if (!isCollapsed) {
      toggleGroup(item.id);

      // 아코디언 펼칠 때 부드러운 스크롤로 해당 메뉴로 이동
      setTimeout(() => {
        const element = document.getElementById(`menu-group-${item.id}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 150); // 아코디언 애니메이션 완료 후 스크롤
    }
  };

  // 하위 메뉴에 배지가 있는지 확인
  const totalBadgeCount = item.children?.reduce((sum, child) => {
    return sum + (child.badge || 0);
  }, 0) || 0;

  return (
    <div className={`${styles.menuGroup} ${isExpanded ? styles.expanded : ''}`} id={`menu-group-${item.id}`}>
      {/* 그룹 헤더 */}
      <ListItem disablePadding className={styles.groupHeader}>
        <ListItemButton
          onClick={handleGroupClick}
          className={`${styles.groupButton} ${isExpanded ? styles.expanded : ''}`}
          aria-expanded={isExpanded}
          aria-controls={`submenu-${item.id}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleGroupClick();
            }
          }}
        >
          {/* 그룹 아이콘 */}
          {IconComponent && (
            <ListItemIcon className={styles.groupIcon}>
              {totalBadgeCount > 0 ? (
                <Badge badgeContent={totalBadgeCount} color="error">
                  <IconComponent />
                </Badge>
              ) : (
                <IconComponent />
              )}
            </ListItemIcon>
          )}

          {/* 그룹 제목 */}
          {!isCollapsed && (
            <>
              <ListItemText
                primary={item.title}
                className={styles.groupText}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              />
              {/* 확장/축소 아이콘 */}
              {item.children && item.children.length > 0 && (
                <div className={styles.expandIcon}>
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </div>
              )}
            </>
          )}

          {/* 축소 모드일 때 배지 */}
          {isCollapsed && totalBadgeCount > 0 && (
            <Badge
              badgeContent={totalBadgeCount}
              color="error"
              className={styles.collapsedBadge}
            />
          )}
        </ListItemButton>
      </ListItem>

      {/* 하위 메뉴들 */}
      {!isCollapsed && item.children && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            className={styles.subMenuList}
            id={`submenu-${item.id}`}
            role="region"
            aria-labelledby={`menu-group-${item.id}`}
          >
            {item.children.map((childItem) => (
              <MenuItem
                key={childItem.id}
                item={childItem}
                level={1}
                isCollapsed={false}
              />
            ))}
          </List>
        </Collapse>
      )}
    </div>
  );
};