/**
 * RSMS 애플리케이션 라우트 설정
 * Domain-Driven Design 구조를 반영한 라우트 구성
 */

// 라우트 권한 레벨 타입
export type RoutePermission = 
  | 'public'      // 누구나 접근 가능
  | 'auth'        // 로그인 사용자만 접근 가능
  | 'admin'       // 관리자만 접근 가능
  | 'manager'     // 관리자 + 부서장 이상
  | 'executive';  // 임원 이상

// 라우트 설정
export const routes = {
  // 메인
  home: '/',
  
  // 인증 관련 (public)
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password/:token',
    changePassword: '/auth/change-password',
    profile: '/auth/profile',
  },
  
  // 대시보드 (auth)
  dashboard: {
    main: '/dashboard',
    analytics: '/dashboard/analytics',
    reports: '/dashboard/reports',
    alerts: '/dashboard/alerts',
  },
  
  // 사용자 관리 (manager)
  users: {
    list: '/users',
    detail: '/users/:id',
    create: '/users/create',
    edit: '/users/:id/edit',
    profile: '/users/:id/profile',
    roles: '/users/:id/roles',
    history: '/users/:id/history',
  },
  
  // 리스크 관리 (auth - 핵심 도메인)
  risks: {
    list: '/risks',
    detail: '/risks/:id',
    create: '/risks/create',
    edit: '/risks/:id/edit',
    assessment: '/risks/:id/assessment',
    mitigation: '/risks/:id/mitigation',
    monitoring: '/risks/:id/monitoring',
    history: '/risks/:id/history',
    templates: '/risks/templates',
    categories: '/risks/categories',
  },
  
  // 보고서 (auth)
  reports: {
    list: '/reports',
    detail: '/reports/:id',
    create: '/reports/create',
    edit: '/reports/:id/edit',
    generate: '/reports/:id/generate',
    schedule: '/reports/:id/schedule',
    history: '/reports/history',
    templates: '/reports/templates',
    dashboard: '/reports/dashboard',
  },
  
  // 설정 (admin/manager)
  settings: {
    // 개인 설정 (auth)
    profile: '/settings/profile',
    preferences: '/settings/preferences',
    notifications: '/settings/notifications',
    security: '/settings/security',
    
    // 시스템 설정 (admin)
    system: {
      general: '/settings/system/general',
      users: '/settings/system/users',
      roles: '/settings/system/roles',
      permissions: '/settings/system/permissions',
      audit: '/settings/system/audit',
      backup: '/settings/system/backup',
      integrations: '/settings/system/integrations',
    },
    
    // 리스크 설정 (manager)
    risks: {
      categories: '/settings/risks/categories',
      templates: '/settings/risks/templates',
      workflows: '/settings/risks/workflows',
      thresholds: '/settings/risks/thresholds',
    },
  },
  
  // 에러 페이지 (public)
  errors: {
    notFound: '/404',
    forbidden: '/403',
    serverError: '/500',
    maintenance: '/maintenance',
  },
} as const;

// 라우트 경로 생성 헬퍼 함수들
export const createRoute = {
  // 사용자 관리
  userDetail: (id: string | number) => `/users/${id}`,
  userEdit: (id: string | number) => `/users/${id}/edit`,
  userProfile: (id: string | number) => `/users/${id}/profile`,
  userRoles: (id: string | number) => `/users/${id}/roles`,
  userHistory: (id: string | number) => `/users/${id}/history`,
  
  // 리스크 관리
  riskDetail: (id: string | number) => `/risks/${id}`,
  riskEdit: (id: string | number) => `/risks/${id}/edit`,
  riskAssessment: (id: string | number) => `/risks/${id}/assessment`,
  riskMitigation: (id: string | number) => `/risks/${id}/mitigation`,
  riskMonitoring: (id: string | number) => `/risks/${id}/monitoring`,
  riskHistory: (id: string | number) => `/risks/${id}/history`,
  
  // 보고서
  reportDetail: (id: string | number) => `/reports/${id}`,
  reportEdit: (id: string | number) => `/reports/${id}/edit`,
  reportGenerate: (id: string | number) => `/reports/${id}/generate`,
  reportSchedule: (id: string | number) => `/reports/${id}/schedule`,
  
  // 인증
  resetPassword: (token: string) => `/auth/reset-password/${token}`,
};

// 라우트 권한 매핑
export const routePermissions: Record<string, RoutePermission> = {
  // Public routes
  '/': 'public',
  '/auth/*': 'public',
  '/404': 'public',
  '/403': 'public',
  '/500': 'public',
  '/maintenance': 'public',
  
  // Auth required routes
  '/dashboard': 'auth',
  '/dashboard/*': 'auth',
  '/risks': 'auth',
  '/risks/*': 'auth',
  '/reports': 'auth',
  '/reports/*': 'auth',
  '/settings/profile': 'auth',
  '/settings/preferences': 'auth',
  '/settings/notifications': 'auth',
  '/settings/security': 'auth',
  
  // Manager level routes
  '/users': 'manager',
  '/users/*': 'manager',
  '/settings/risks/*': 'manager',
  
  // Admin level routes
  '/settings/system/*': 'admin',
};

// 라우트 메타데이터
export interface RouteMetadata {
  title: string;
  description?: string;
  permission: RoutePermission;
  breadcrumb?: string[];
  hideInNavigation?: boolean;
}

export const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'RSMS',
    permission: 'public',
  },
  '/dashboard': {
    title: '대시보드',
    permission: 'auth',
    breadcrumb: ['대시보드'],
  },
  '/users': {
    title: '사용자 관리',
    permission: 'manager',
    breadcrumb: ['사용자 관리'],
  },
  '/risks': {
    title: '리스크 관리',
    permission: 'auth',
    breadcrumb: ['리스크 관리'],
  },
  '/reports': {
    title: '보고서',
    permission: 'auth',
    breadcrumb: ['보고서'],
  },
  '/settings': {
    title: '설정',
    permission: 'auth',
    breadcrumb: ['설정'],
  },
};