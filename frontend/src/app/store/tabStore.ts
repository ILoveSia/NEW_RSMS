/**
 * 탭 관리 스토어
 * TopHeader의 탭 상태를 전역으로 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  title: string;
  icon: string;
  isActive: boolean;
  path: string;
  badge?: number;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
}

interface TabActions {
  addTab: (tab: Omit<Tab, 'isActive'>) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  navigateToTab: (tabId: string) => void;
  clearAllTabs: () => void;
}

export type TabStore = TabState & TabActions;

// 기본 탭 설정
const DEFAULT_TABS: Tab[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    icon: '📊',
    isActive: true,
    path: '/app/dashboard'
  },
];

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      tabs: DEFAULT_TABS,
      activeTabId: 'dashboard',

      // 탭 추가
      addTab: (newTab) => {
        set(state => {
          const existingTab = state.tabs.find(tab => tab.id === newTab.id);

          if (existingTab) {
            // 이미 존재하는 탭이면 활성화만
            return {
              tabs: state.tabs.map(tab => ({
                ...tab,
                isActive: tab.id === newTab.id
              })),
              activeTabId: newTab.id
            };
          } else {
            // 새 탭 추가
            const newTabs = state.tabs.map(tab => ({ ...tab, isActive: false }));
            newTabs.push({ ...newTab, isActive: true });

            return {
              tabs: newTabs,
              activeTabId: newTab.id
            };
          }
        });
      },

      // 탭 제거
      removeTab: (tabId) => {
        set(state => {
          const newTabs = state.tabs.filter(tab => tab.id !== tabId);

          // 제거된 탭이 활성 탭이었다면 새로운 활성 탭 선택
          let newActiveTabId = state.activeTabId;
          if (state.activeTabId === tabId) {
            if (newTabs.length > 0) {
              // 대시보드 탭이 있으면 대시보드로, 없으면 첫 번째 탭으로
              const dashboardTab = newTabs.find(tab => tab.id === 'dashboard');
              newActiveTabId = dashboardTab ? 'dashboard' : newTabs[0].id;
            } else {
              newActiveTabId = null;
            }
          }

          return {
            tabs: newTabs.map(tab => ({
              ...tab,
              isActive: tab.id === newActiveTabId
            })),
            activeTabId: newActiveTabId
          };
        });
      },

      // 활성 탭 설정
      setActiveTab: (tabId) => {
        set(state => ({
          tabs: state.tabs.map(tab => ({
            ...tab,
            isActive: tab.id === tabId
          })),
          activeTabId: tabId
        }));
      },

      // 탭 닫기
      closeTab: (tabId) => {
        const { removeTab } = get();

        // 대시보드 탭은 닫을 수 없음
        if (tabId === 'dashboard') {
          return;
        }

        removeTab(tabId);
      },

      // 탭으로 이동
      navigateToTab: (tabId) => {
        const { setActiveTab } = get();
        const state = get();
        const tab = state.tabs.find(t => t.id === tabId);

        if (tab) {
          setActiveTab(tabId);
          // 실제 네비게이션은 Layout 컴포넌트에서 처리
        }
      },

      // 모든 탭 정리 (대시보드만 남김)
      clearAllTabs: () => {
        set({
          tabs: DEFAULT_TABS,
          activeTabId: 'dashboard'
        });
      }
    }),
    {
      name: 'rsms-tab-state',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId
      })
    }
  )
);