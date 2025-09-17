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
    main: '/app/dashboard',
    analytics: '/app/dashboard/analytics',
    reports: '/app/dashboard/reports',
    alerts: '/app/dashboard/alerts',
  },
  
  // 사용자 관리 (manager)
  users: {
    list: '/app/users',
    detail: '/app/users/:id',
    create: '/app/users/create',
    edit: '/app/users/:id/edit',
    profile: '/app/users/:id/profile',
    roles: '/app/users/:id/roles',
    history: '/app/users/:id/history',
  },

  // 리스크 관리 (auth - 핵심 도메인)
  risks: {
    list: '/app/risks',
    detail: '/app/risks/:id',
    create: '/app/risks/create',
    edit: '/app/risks/:id/edit',
    assessment: '/app/risks/:id/assessment',
    mitigation: '/app/risks/:id/mitigation',
    monitoring: '/app/risks/:id/monitoring',
    history: '/app/risks/:id/history',
    templates: '/app/risks/templates',
    categories: '/app/risks/categories',
  },

  // 책무 관리 (auth - 원장관리)
  resps: {
    // 원장관리
    ledgerOrders: '/app/resps/ledger-orders',
    ledgerOrderDetail: '/app/resps/ledger-orders/:id',
    ledgerOrderCreate: '/app/resps/ledger-orders/create',
    ledgerOrderEdit: '/app/resps/ledger-orders/:id/edit',

    // 직책관리
    positions: '/app/resps/positions',
    positionDetail: '/app/resps/positions/:id',
    positionCreate: '/app/resps/positions/create',
    positionEdit: '/app/resps/positions/:id/edit',

    // 책무관리
    responsibilities: '/app/resps/responsibilities',
    responsibilityDetail: '/app/resps/responsibilities/:id',
    responsibilityCreate: '/app/resps/responsibilities/create',
    responsibilityEdit: '/app/resps/responsibilities/:id/edit',

    // 책무기술서관리
    specifications: '/app/resps/specifications',
    specificationDetail: '/app/resps/specifications/:id',
    specificationCreate: '/app/resps/specifications/create',
    specificationEdit: '/app/resps/specifications/:id/edit',
    specificationGenerate: '/app/resps/specifications/:id/generate',

    // 부서장업무메뉴얼관리
    departmentManuals: '/app/resps/department-manuals',
    departmentManualDetail: '/app/resps/department-manuals/:id',
    departmentManualCreate: '/app/resps/department-manuals/create',
    departmentManualEdit: '/app/resps/department-manuals/:id/edit',
  },

  // 보고서 (auth)
  reports: {
    list: '/app/reports',
    detail: '/app/reports/:id',
    create: '/app/reports/create',
    edit: '/app/reports/:id/edit',
    generate: '/app/reports/:id/generate',
    schedule: '/app/reports/:id/schedule',
    history: '/app/reports/history',
    templates: '/app/reports/templates',
    dashboard: '/app/reports/dashboard',
  },

  // 설정 (admin/manager)
  settings: {
    // 개인 설정 (auth)
    profile: '/app/settings/profile',
    preferences: '/app/settings/preferences',
    notifications: '/app/settings/notifications',
    security: '/app/settings/security',

    // 시스템 설정 (admin)
    system: {
      general: '/app/settings/system/general',
      users: '/app/settings/system/users',
      roles: '/app/settings/system/roles',
      permissions: '/app/settings/system/permissions',
      audit: '/app/settings/system/audit',
      backup: '/app/settings/system/backup',
      integrations: '/app/settings/system/integrations',
    },

    // 리스크 설정 (manager)
    risks: {
      categories: '/app/settings/risks/categories',
      templates: '/app/settings/risks/templates',
      workflows: '/app/settings/risks/workflows',
      thresholds: '/app/settings/risks/thresholds',
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

  // 책무 관리 - 직책관리
  positionDetail: (id: string | number) => `/app/resps/positions/${id}`,
  positionEdit: (id: string | number) => `/app/resps/positions/${id}/edit`,

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
  '/app/dashboard': 'auth',
  '/app/dashboard/*': 'auth',
  '/app/risks': 'auth',
  '/app/risks/*': 'auth',
  '/app/resps': 'auth',
  '/app/resps/*': 'auth',
  '/app/reports': 'auth',
  '/app/reports/*': 'auth',
  '/app/settings/profile': 'auth',
  '/app/settings/preferences': 'auth',
  '/app/settings/notifications': 'auth',
  '/app/settings/security': 'auth',

  // Manager level routes
  '/app/users': 'manager',
  '/app/users/*': 'manager',
  '/app/settings/risks/*': 'manager',

  // Admin level routes
  '/app/settings/system/*': 'admin',
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
  '/app/dashboard': {
    title: '대시보드',
    permission: 'auth',
    breadcrumb: ['대시보드'],
  },
  '/app/users': {
    title: '사용자 관리',
    permission: 'manager',
    breadcrumb: ['사용자 관리'],
  },
  '/app/risks': {
    title: '리스크 관리',
    permission: 'auth',
    breadcrumb: ['리스크 관리'],
  },
  '/app/resps': {
    title: '책무 관리',
    permission: 'auth',
    breadcrumb: ['책무 관리'],
  },
  '/app/reports': {
    title: '보고서',
    permission: 'auth',
    breadcrumb: ['보고서'],
  },
  '/app/settings': {
    title: '설정',
    permission: 'auth',
    breadcrumb: ['설정'],
  },
};