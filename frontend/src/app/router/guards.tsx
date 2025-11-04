/**
 * 라우트 가드 - 권한 기반 접근 제어
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { routes, RoutePermission } from './routes';
import { useAuthStore } from '@/app/store/authStore';

interface RouteGuardProps {
  children: React.ReactNode;
  permission: RoutePermission;
  fallback?: React.ReactNode;
}

/**
 * 권한 기반 라우트 보호 컴포넌트
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  permission, 
  fallback 
}) => {
  const location = useLocation();
  const { isAuthenticated, user, hasRoleLevel } = useAuthStore();

  // Public 라우트는 항상 허용
  if (permission === 'public') {
    return <>{children}</>;
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={routes.auth.login} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 권한 레벨 체크
  const hasPermission = checkPermission(user, permission);
  
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={routes.errors.forbidden} replace />;
  }

  return <>{children}</>;
};

/**
 * 인증된 사용자만 접근 가능한 라우트 가드
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard permission="auth">
      {children}
    </RouteGuard>
  );
};

/**
 * 관리자만 접근 가능한 라우트 가드
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard permission="admin">
      {children}
    </RouteGuard>
  );
};

/**
 * 매니저 이상만 접근 가능한 라우트 가드
 */
export const ManagerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard permission="manager">
      {children}
    </RouteGuard>
  );
};

/**
 * 임원 이상만 접근 가능한 라우트 가드
 */
export const ExecutiveGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard permission="executive">
      {children}
    </RouteGuard>
  );
};

/**
 * 권한 체크 함수
 */
function checkPermission(user: any, permission: RoutePermission): boolean {
  if (!user) return false;

  switch (permission) {
    case 'public':
      return true;
    
    case 'auth':
      return true; // 이미 인증된 사용자
    
    case 'admin':
      // 실제 DB 역할 코드 체크: 002(최고관리자), 103(시스템관리자)
      return user.roleCodes?.some((role: string) =>
        ['ADMIN', '002', '103'].includes(role)
      ) || false;
    
    case 'manager':
      // 실제 DB 역할 코드 포함: 002(최고관리자), 103(시스템관리자), 201(임원), 202(부서장)
      return user.roleCodes?.some((role: string) =>
        ['ADMIN', 'CEO', 'EXECUTIVE', 'MANAGER', '002', '103', '201', '202'].includes(role)
      ) || false;

    case 'executive':
      // 실제 DB 역할 코드 포함: 002(최고관리자), 103(시스템관리자), 201(임원)
      return user.roleCodes?.some((role: string) =>
        ['ADMIN', 'CEO', 'EXECUTIVE', '002', '103', '201'].includes(role)
      ) || false;
    
    default:
      return false;
  }
}

/**
 * 권한 체크 훅
 */
export const usePermission = () => {
  const { user, isAuthenticated } = useAuthStore();

  const hasPermission = (permission: RoutePermission): boolean => {
    if (!isAuthenticated || !user) {
      return permission === 'public';
    }
    
    return checkPermission(user, permission);
  };

  const hasRole = (roleCode: string): boolean => {
    if (!user?.roleCodes) return false;
    return user.roleCodes.includes(roleCode);
  };

  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!user?.roleCodes) return false;
    return roleCodes.some(role => user.roleCodes?.includes(role));
  };

  const getHighestRoleLevel = (): number => {
    if (!user?.roleCodes) return 0;
    
    // 역할별 레벨 (낮을수록 높은 권한)
    const roleLevels: Record<string, number> = {
      'CEO': 1,
      'ADMIN': 1,
      'EXECUTIVE': 2,
      'MANAGER': 3,
      'EMPLOYEE': 4,
    };
    
    const levels = user.roleCodes
      .map(role => roleLevels[role])
      .filter(level => level !== undefined);
    
    return levels.length > 0 ? Math.min(...levels) : 0;
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    getHighestRoleLevel,
    isAdmin: hasRole('ADMIN'),
    isCEO: hasRole('CEO'),
    isExecutive: hasAnyRole(['CEO', 'EXECUTIVE']),
    isManager: hasAnyRole(['CEO', 'EXECUTIVE', 'MANAGER']),
    user,
    isAuthenticated,
  };
};

/**
 * 권한별 컴포넌트 렌더링 헬퍼
 */
interface PermissionCheckProps {
  permission?: RoutePermission;
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({ 
  permission, 
  role, 
  roles, 
  fallback, 
  children 
}) => {
  const { hasPermission, hasRole, hasAnyRole } = usePermission();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (role) {
    hasAccess = hasAccess && hasRole(role);
  }

  if (roles && roles.length > 0) {
    hasAccess = hasAccess && hasAnyRole(roles);
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};