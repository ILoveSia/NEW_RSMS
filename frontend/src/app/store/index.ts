/**
 * 스토어 루트 인덱스
 * 모든 Zustand 스토어를 중앙 관리
 */

// 스토어 Export
export { useAuthStore } from './authStore';
export { useUIStore, useTheme, useSidebar, useNotifications, useLoading } from './uiStore';

// 타입 Export
export type { SidebarState, ModalState, Notification, LoadingState } from './uiStore';

// 스토어 초기화 함수 (필요시 사용)
export const initializeStores = () => {
  // 앱 시작 시 필요한 스토어 초기화 로직
  console.log('🏪 Stores initialized');
};

// 스토어 리셋 함수 (개발용)
export const resetAllStores = () => {
  const { reset: resetAuth } = useAuthStore.getState();
  const { reset: resetUI } = useUIStore.getState();
  
  resetAuth();
  resetUI();
  
  console.log('🔄 All stores reset');
};