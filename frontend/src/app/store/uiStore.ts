/**
 * UI 상태 관리 스토어 (Zustand)
 * 사이드바, 모달, 알림, 테마 등 전역 UI 상태 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ThemeMode, Breakpoint } from '@/shared/types/common';
import type { SupportedLanguage } from '@/app/config/i18n';

// 사이드바 상태
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  activeMenu: string | null;
}

// 모달 상태
export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // milliseconds
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// 로딩 상태
export interface LoadingState {
  global: boolean;
  components: Record<string, boolean>;
}

// UI Store Interface
interface UIStore {
  // State
  theme: ThemeMode;
  language: SupportedLanguage;
  sidebar: SidebarState;
  modal: ModalState;
  notifications: Notification[];
  loading: LoadingState;
  
  // Responsive
  currentBreakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Breadcrumb
  breadcrumb: Array<{ label: string; path?: string }>;
  
  // Page Title
  pageTitle: string;
  
  // Actions - Theme
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Actions - Language
  setLanguage: (language: SupportedLanguage) => void;
  
  // Actions - Sidebar
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  setActiveMenu: (menu: string | null) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  
  // Actions - Modal
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
  setComponentLoading: (component: string, loading: boolean) => void;
  clearComponentLoading: () => void;
  
  // Actions - Responsive
  setCurrentBreakpoint: (breakpoint: Breakpoint) => void;
  
  // Actions - Navigation
  setBreadcrumb: (breadcrumb: Array<{ label: string; path?: string }>) => void;
  setPageTitle: (title: string) => void;
  
  // Actions - Reset
  reset: () => void;
}

// Initial state
const initialState = {
  theme: 'light' as ThemeMode,
  language: 'ko' as SupportedLanguage,
  sidebar: {
    isOpen: true,
    isCollapsed: false,
    activeMenu: null,
  },
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  notifications: [],
  loading: {
    global: false,
    components: {},
  },
  currentBreakpoint: 'lg' as Breakpoint,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  breadcrumb: [],
  pageTitle: 'RSMS',
};

// UI store
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Theme actions
        setTheme: (theme) => 
          set({ theme }, false, 'setTheme'),
        
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          set({ theme: newTheme }, false, 'toggleTheme');
        },
        
        // Language actions
        setLanguage: (language) => 
          set({ language }, false, 'setLanguage'),
        
        // Sidebar actions
        setSidebarOpen: (isOpen) => 
          set(
            (state) => ({ 
              sidebar: { ...state.sidebar, isOpen } 
            }), 
            false, 
            'setSidebarOpen'
          ),
        
        setSidebarCollapsed: (isCollapsed) => 
          set(
            (state) => ({ 
              sidebar: { ...state.sidebar, isCollapsed } 
            }), 
            false, 
            'setSidebarCollapsed'
          ),
        
        setActiveMenu: (activeMenu) => 
          set(
            (state) => ({ 
              sidebar: { ...state.sidebar, activeMenu } 
            }), 
            false, 
            'setActiveMenu'
          ),
        
        toggleSidebar: () => 
          set(
            (state) => ({ 
              sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen } 
            }), 
            false, 
            'toggleSidebar'
          ),
        
        toggleSidebarCollapse: () => 
          set(
            (state) => ({ 
              sidebar: { ...state.sidebar, isCollapsed: !state.sidebar.isCollapsed } 
            }), 
            false, 
            'toggleSidebarCollapse'
          ),
        
        // Modal actions
        openModal: (type, data = null) => 
          set({ 
            modal: { isOpen: true, type, data } 
          }, false, 'openModal'),
        
        closeModal: () => 
          set({ 
            modal: { isOpen: false, type: null, data: null } 
          }, false, 'closeModal'),
        
        // Notification actions
        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random()}`;
          const newNotification: Notification = { id, ...notification };
          
          set(
            (state) => ({ 
              notifications: [...state.notifications, newNotification] 
            }), 
            false, 
            'addNotification'
          );
          
          // 자동 제거 (duration이 지정된 경우)
          if (notification.duration) {
            setTimeout(() => {
              get().removeNotification(id);
            }, notification.duration);
          }
        },
        
        removeNotification: (id) => 
          set(
            (state) => ({ 
              notifications: state.notifications.filter(n => n.id !== id) 
            }), 
            false, 
            'removeNotification'
          ),
        
        clearNotifications: () => 
          set({ notifications: [] }, false, 'clearNotifications'),
        
        // Loading actions
        setGlobalLoading: (global) => 
          set(
            (state) => ({ 
              loading: { ...state.loading, global } 
            }), 
            false, 
            'setGlobalLoading'
          ),
        
        setComponentLoading: (component, loading) => 
          set(
            (state) => ({ 
              loading: { 
                ...state.loading, 
                components: { 
                  ...state.loading.components, 
                  [component]: loading 
                } 
              } 
            }), 
            false, 
            'setComponentLoading'
          ),
        
        clearComponentLoading: () => 
          set(
            (state) => ({ 
              loading: { ...state.loading, components: {} } 
            }), 
            false, 
            'clearComponentLoading'
          ),
        
        // Responsive actions
        setCurrentBreakpoint: (currentBreakpoint) => {
          const isMobile = ['xs', 'sm'].includes(currentBreakpoint);
          const isTablet = currentBreakpoint === 'md';
          const isDesktop = ['lg', 'xl', '2xl'].includes(currentBreakpoint);
          
          set({ 
            currentBreakpoint, 
            isMobile, 
            isTablet, 
            isDesktop 
          }, false, 'setCurrentBreakpoint');
        },
        
        // Navigation actions
        setBreadcrumb: (breadcrumb) => 
          set({ breadcrumb }, false, 'setBreadcrumb'),
        
        setPageTitle: (pageTitle) => {
          set({ pageTitle }, false, 'setPageTitle');
          
          // Update document title
          if (typeof document !== 'undefined') {
            document.title = pageTitle ? `${pageTitle} - RSMS` : 'RSMS';
          }
        },
        
        // Reset action
        reset: () => 
          set(initialState, false, 'reset'),
      }),
      {
        name: 'rsms-ui-store',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          sidebar: {
            isCollapsed: state.sidebar.isCollapsed,
            // isOpen과 activeMenu는 세션별로 초기화
          },
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// 편의 훅들
export const useTheme = () => {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);
  const toggleTheme = useUIStore(state => state.toggleTheme);
  
  return { theme, setTheme, toggleTheme };
};

export const useSidebar = () => {
  const sidebar = useUIStore(state => state.sidebar);
  const setSidebarOpen = useUIStore(state => state.setSidebarOpen);
  const setSidebarCollapsed = useUIStore(state => state.setSidebarCollapsed);
  const setActiveMenu = useUIStore(state => state.setActiveMenu);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const toggleSidebarCollapse = useUIStore(state => state.toggleSidebarCollapse);
  
  return {
    ...sidebar,
    setSidebarOpen,
    setSidebarCollapsed,
    setActiveMenu,
    toggleSidebar,
    toggleSidebarCollapse,
  };
};

export const useNotifications = () => {
  const notifications = useUIStore(state => state.notifications);
  const addNotification = useUIStore(state => state.addNotification);
  const removeNotification = useUIStore(state => state.removeNotification);
  const clearNotifications = useUIStore(state => state.clearNotifications);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export const useLoading = () => {
  const loading = useUIStore(state => state.loading);
  const setGlobalLoading = useUIStore(state => state.setGlobalLoading);
  const setComponentLoading = useUIStore(state => state.setComponentLoading);
  const clearComponentLoading = useUIStore(state => state.clearComponentLoading);
  
  const isComponentLoading = (component: string) => 
    loading.components[component] || false;
  
  return {
    globalLoading: loading.global,
    componentLoading: loading.components,
    isComponentLoading,
    setGlobalLoading,
    setComponentLoading,
    clearComponentLoading,
  };
};