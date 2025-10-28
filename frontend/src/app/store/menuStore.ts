/**
 * 메뉴 상태 관리 스토어 (Zustand)
 * LeftMenu용 메뉴 계층 구조 관리
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getMenuHierarchyApi, MenuItem as ApiMenuItem } from '@/domains/auth/api/menuApi';

// Frontend MenuItem 타입 (기존 menuData.ts 타입과 호환)
export interface MenuItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  permission?: string;
  children?: MenuItem[];
  // API에서 추가로 오는 필드들
  menuType?: 'folder' | 'page';
  depth?: number;
  systemCode?: string;
  requiresAuth?: boolean;
}

// Menu Store Interface
interface MenuStore {
  // State
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;

  // Actions
  setMenus: (menus: MenuItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchMenus: () => Promise<void>;
  reset: () => void;
}

// API MenuItem을 Frontend MenuItem으로 변환
const convertApiMenuToMenuItem = (apiMenu: ApiMenuItem): MenuItem => {
  return {
    id: apiMenu.menuCode,
    title: apiMenu.menuName,
    path: apiMenu.url || undefined,
    icon: apiMenu.icon || undefined,
    permission: apiMenu.requiresAuth ? 'auth' : undefined,
    menuType: apiMenu.menuType,
    depth: apiMenu.depth,
    systemCode: apiMenu.systemCode,
    requiresAuth: apiMenu.requiresAuth,
    children: apiMenu.children?.map(convertApiMenuToMenuItem)
  };
};

// Initial state
const initialState = {
  menus: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

// Menu store
export const useMenuStore = create<MenuStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Actions
      setMenus: (menus) =>
        set(
          {
            menus,
            lastFetchedAt: new Date().toISOString(),
          },
          false,
          'setMenus'
        ),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      fetchMenus: async () => {
        set({ isLoading: true, error: null }, false, 'fetchMenus:start');

        try {
          const response = await getMenuHierarchyApi();

          if (response.success && response.menus) {
            // API MenuItem을 Frontend MenuItem으로 변환
            const convertedMenus = response.menus.map(convertApiMenuToMenuItem);

            set(
              {
                menus: convertedMenus,
                isLoading: false,
                error: null,
                lastFetchedAt: new Date().toISOString(),
              },
              false,
              'fetchMenus:success'
            );
          } else {
            throw new Error('메뉴 조회 실패');
          }
        } catch (err: any) {
          console.error('메뉴 조회 에러:', err);

          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            '메뉴를 불러오는데 실패했습니다';

          set(
            {
              isLoading: false,
              error: errorMessage,
            },
            false,
            'fetchMenus:error'
          );

          // 에러 시 빈 배열 반환 (fallback)
          set({ menus: [] }, false, 'fetchMenus:fallback');
        }
      },

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'MenuStore' }
  )
);
