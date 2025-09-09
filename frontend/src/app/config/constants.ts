// Application Constants

// App Information
export const APP_INFO = {
  NAME: 'EMS',
  FULL_NAME: 'Entity Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Enterprise Entity Management System',
  AUTHOR: 'EMS Team',
  COPYRIGHT: `© ${new Date().getFullYear()} EMS. All rights reserved.`,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ems_auth_token',
  REFRESH_TOKEN: 'ems_refresh_token',
  USER_PREFERENCES: 'ems_user_preferences',
  THEME_MODE: 'ems_theme_mode',
  LANGUAGE: 'ems_language',
  SIDEBAR_STATE: 'ems_sidebar_state',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'yyyy-MM-dd',
  DISPLAY_WITH_TIME: 'yyyy-MM-dd HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'yyyy-MM',
  YEAR_ONLY: 'yyyy',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_SIZE: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    ALL: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
  },
} as const;

// Entity Management Constants
export const ENTITY = {
  PRIORITY_LEVELS: ['low', 'medium', 'high', 'critical'] as const,
  COMPLEXITY_LEVELS: ['very-low', 'low', 'medium', 'high', 'very-high'] as const,
  IMPORTANCE_LEVELS: ['minimal', 'minor', 'moderate', 'major', 'critical'] as const,
  STATUS_OPTIONS: ['draft', 'active', 'in-progress', 'completed', 'archived'] as const,
  CATEGORIES: [
    'operational',
    'technical',
    'financial',
    'strategic',
    'compliance',
    'security'
  ] as const,
} as const;

// User Management Constants
export const USER = {
  ROLES: ['admin', 'manager', 'user', 'viewer'] as const,
  STATUS_OPTIONS: ['active', 'inactive', 'pending', 'suspended'] as const,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
} as const;

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  DRAWER_WIDTH: 360,
  
  BREAKPOINTS: {
    XS: 320,
    SM: 768,
    MD: 1024,
    LG: 1280,
    XL: 1440,
    XXL: 1920,
  },
  
  THEME_MODES: ['light', 'dark', 'auto'] as const,
  
  NOTIFICATION_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[+]?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버에서 오류가 발생했습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
  FILE_TOO_LARGE: `파일 크기가 너무 큽니다. (최대 ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB)`,
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
} as const;

// Success Messages  
export const SUCCESS_MESSAGES = {
  SAVED: '성공적으로 저장되었습니다.',
  DELETED: '성공적으로 삭제되었습니다.',
  UPDATED: '성공적으로 업데이트되었습니다.',
  CREATED: '성공적으로 생성되었습니다.',
  UPLOADED: '파일이 성공적으로 업로드되었습니다.',
  EMAIL_SENT: '이메일이 전송되었습니다.',
  PASSWORD_CHANGED: '비밀번호가 변경되었습니다.',
} as const;

// Query Keys (for React Query)
export const QUERY_KEYS = {
  // Users
  USERS: ['users'] as const,
  USER: (id: number) => ['users', id] as const,
  USER_PROFILE: ['users', 'profile'] as const,
  
  // Entities
  ENTITIES: ['entities'] as const,
  ENTITY: (id: number) => ['entities', id] as const,
  ENTITY_ASSESSMENTS: (id: number) => ['entities', id, 'assessments'] as const,
  
  // Reports
  REPORTS: ['reports'] as const,
  REPORT: (id: number) => ['reports', id] as const,
  REPORT_HISTORY: ['reports', 'history'] as const,
  
  // Dashboard
  DASHBOARD_STATS: ['dashboard', 'stats'] as const,
  DASHBOARD_CHARTS: ['dashboard', 'charts'] as const,
  
  // Settings
  SETTINGS: ['settings'] as const,
  SYSTEM_SETTINGS: ['settings', 'system'] as const,
} as const;