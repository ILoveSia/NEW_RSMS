/**
 * 인증 상태 관리 스토어 (Zustand)
 * 사용자 인증, 세션 관리, 권한 체크 등의 기능 제공
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User, PermissionCode, UserRoleCode } from '@/domains/auth/types';
import { clearAppData } from '@/app/utils/initializeApp';

// Auth Store Interface
interface AuthStore {
  // State
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed values (권한 관련)
  permissions: PermissionCode[];
  roleCodes: UserRoleCode[];
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (sessionId: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, sessionId: string) => void;
  logout: () => void;
  reset: () => void;
  
  // Permission & Role helpers
  hasPermission: (permission: PermissionCode) => boolean;
  hasRole: (roleCode: UserRoleCode) => boolean;
  hasRoleLevel: (level: number) => boolean;
  getHighestRoleLevel: () => number;
}

// Role level mapping (낮을수록 높은 권한)
const ROLE_LEVEL_MAP: Record<UserRoleCode, number> = {
  'CEO': 1,
  'ADMIN': 1,
  'EXECUTIVE': 2,
  'MANAGER': 3,
  'EMPLOYEE': 4,
};

// Initial state
const initialState = {
  user: null,
  sessionId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [] as PermissionCode[],
  roleCodes: [] as UserRoleCode[],
};

// Auth store
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Actions
        setUser: (user) => {
          const permissions = user?.permissions?.map(p => p.permissionId) || [];
          const roleCodes = user?.roleCodes || [];
          
          set({ 
            user, 
            permissions, 
            roleCodes 
          }, false, 'setUser');
        },
        
        setSession: (sessionId) => 
          set({ 
            sessionId, 
            isAuthenticated: true 
          }, false, 'setSession'),
        
        clearSession: () => 
          set({ 
            sessionId: null, 
            isAuthenticated: false 
          }, false, 'clearSession'),
        
        setLoading: (isLoading) => 
          set({ isLoading }, false, 'setLoading'),
        
        setError: (error) => 
          set({ error }, false, 'setError'),
        
        login: (user, sessionId) => {
          const permissions = user?.permissions?.map(p => p.permissionId) || [];
          const roleCodes = user?.roleCodes || [];
          
          set({ 
            user, 
            sessionId,
            permissions,
            roleCodes,
            isAuthenticated: true,
            isLoading: false,
            error: null 
          }, false, 'login');
        },
        
        logout: () => {
          // 모든 스토어 데이터 초기화
          clearAppData();

          set({
            user: null,
            sessionId: null,
            permissions: [],
            roleCodes: [],
            isAuthenticated: false,
            isLoading: false,
            error: null
          }, false, 'logout');
        },
        
        reset: () => 
          set(initialState, false, 'reset'),
        
        // Permission & Role helpers
        hasPermission: (permission) => {
          const state = get();
          return state.permissions.includes(permission);
        },
        
        hasRole: (roleCode) => {
          const state = get();
          return state.roleCodes.includes(roleCode);
        },
        
        hasRoleLevel: (level) => {
          const state = get();
          const userLevel = state.getHighestRoleLevel();
          return userLevel > 0 && userLevel <= level;
        },
        
        getHighestRoleLevel: () => {
          const state = get();
          if (!state.roleCodes.length) return 0;
          
          const levels = state.roleCodes
            .map(role => ROLE_LEVEL_MAP[role])
            .filter(level => level !== undefined);
          
          return levels.length > 0 ? Math.min(...levels) : 0;
        },
      }),
      {
        name: 'rsms-auth-store',
        // 보안 강화: 민감한 데이터는 localStorage에 저장하지 않음
        partialize: (state) => ({
          // 최소한의 사용자 정보만 저장 (UI 표시용)
          user: state.user ? {
            userId: state.user.userId,      // 사용자 ID
            username: state.user.username,  // 사용자 아이디 (UI 표시용)
            isAdmin: state.user.isAdmin,    // 관리자 여부 (UI 제어용)
            isExecutive: state.user.isExecutive, // 임원 여부 (UI 제어용)
            authLevel: state.user.authLevel, // 권한 레벨 (UI 제어용)
            // 민감 정보 제외: empNo, email, phoneNumber 등
          } as Partial<User> : null,

          // sessionId 제외 - 실제 인증은 HttpOnly 쿠키(SESSIONID)로 관리
          // sessionId: state.sessionId, ❌ 제거

          isAuthenticated: state.isAuthenticated,

          // permissions, roleCodes는 UI 표시용 캐시
          // 실제 권한 검증은 서버 API에서 매번 수행
          permissions: state.permissions,
          roleCodes: state.roleCodes,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);