/**
 * RSMS LeftMenu 타입 정의
 */

export type MenuPermission = 'public' | 'auth' | 'manager' | 'admin' | 'executive';

export interface MenuItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  permission?: MenuPermission;
  badge?: number; // 알림 카운트 (결재함 등)
  isExpanded?: boolean; // 메뉴 그룹 확장 상태
}

export interface MenuState {
  isCollapsed: boolean; // 사이드바 축소 여부
  expandedGroups: string[]; // 확장된 메뉴 그룹들
  activeMenuItem: string; // 현재 활성 메뉴
}

export interface MenuActions {
  toggleSidebar: () => void;
  toggleGroup: (groupId: string) => void;
  setActiveMenu: (menuId: string) => void;
  expandGroup: (groupId: string) => void;
}

export type LeftMenuStore = MenuState & MenuActions;