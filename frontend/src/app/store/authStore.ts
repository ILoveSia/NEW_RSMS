/**
 * 인증 상태 관리 스토어 (Zustand)
 * 사용자 인증, 세션 관리, 권한 체크 등의 기능 제공
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User, PermissionCode, UserRoleCode } from '@/domains/auth/types';

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
        
        logout: () => 
          set({ 
            user: null, 
            sessionId: null,
            permissions: [],
            roleCodes: [],
            isAuthenticated: false,
            isLoading: false,
            error: null 
          }, false, 'logout'),
        
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
        partialize: (state) => ({
          user: state.user,
          sessionId: state.sessionId,
          isAuthenticated: state.isAuthenticated,
          permissions: state.permissions,
          roleCodes: state.roleCodes,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);