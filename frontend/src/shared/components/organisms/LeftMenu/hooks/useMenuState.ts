/**
 * LeftMenu 상태 관리 Hook
 * Zustand를 사용한 메뉴 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeftMenuStore } from '../types/menu.types';

export const useMenuState = create<LeftMenuStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isCollapsed: false,
      expandedGroups: [], // 대시보드는 단일 메뉴이므로 확장 불필요
      activeMenuItem: 'dashboard', // 기본적으로 대시보드가 활성

      // 사이드바 토글
      toggleSidebar: () => {
        set(state => ({ isCollapsed: !state.isCollapsed }));
      },

      // 메뉴 그룹 토글
      toggleGroup: (groupId: string) => {
        set(state => {
          const isExpanded = state.expandedGroups.includes(groupId);
          const newExpandedGroups = isExpanded
            ? state.expandedGroups.filter(id => id !== groupId)
            : [...state.expandedGroups, groupId];

          return { expandedGroups: newExpandedGroups };
        });
      },

      // 활성 메뉴 설정
      setActiveMenu: (menuId: string) => {
        set({ activeMenuItem: menuId });
      }
    }),
    {
      name: 'rsms-left-menu-state', // localStorage 키
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        expandedGroups: state.expandedGroups
      }) // activeMenuItem는 세션마다 초기화
    }
  )
);