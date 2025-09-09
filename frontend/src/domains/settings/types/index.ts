// 설정 관리 도메인 - 타입 정의

import { BaseEntity, ID, Timestamp } from '@/shared/types/common';
import { UserRole, Permission } from '@/domains/auth/types';

// ===== 시스템 설정 타입 =====

// 설정 카테고리
export type SettingCategory = 
  | 'SYSTEM'        // 시스템 설정
  | 'SECURITY'      // 보안 설정
  | 'NOTIFICATION'  // 알림 설정
  | 'EMAIL'         // 이메일 설정
  | 'APPEARANCE'    // 외관 설정
  | 'INTEGRATION'   // 외부 연동 설정
  | 'BACKUP'        // 백업 설정
  | 'AUDIT'         // 감사 설정
  | 'WORKFLOW'      // 워크플로우 설정
  | 'CUSTOM';       // 커스텀 설정

// 설정 타입
export type SettingType = 
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'ENUM'
  | 'JSON'
  | 'PASSWORD'
  | 'EMAIL'
  | 'URL'
  | 'FILE'
  | 'COLOR'
  | 'DATETIME';

// 설정 범위
export type SettingScope = 'GLOBAL' | 'USER' | 'ROLE' | 'DEPARTMENT';

// 시스템 설정 엔티티
export interface SystemSetting extends BaseEntity {
  key: string;
  name: string;
  description?: string;
  category: SettingCategory;
  type: SettingType;
  scope: SettingScope;
  
  // 값
  value: any;
  defaultValue: any;
  
  // 검증 규칙
  validation?: SettingValidation;
  
  // 표시 설정
  isVisible: boolean;
  isEditable: boolean;
  isRequired: boolean;
  
  // 권한 제어
  requiredPermissions: Permission[];
  requiredRoles: UserRole[];
  
  // 그룹화
  group?: string;
  order: number;
  
  // 메타데이터
  tags: string[];
  helpText?: string;
  exampleValue?: string;
  
  // 변경 추적
  lastChangedBy?: ID;
  lastChangedAt?: Timestamp;
  
  // 환경별 설정
  environment?: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
}

// 설정 검증 규칙
export interface SettingValidation {
  // 문자열 검증
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex pattern
  
  // 숫자 검증
  min?: number;
  max?: number;
  step?: number;
  
  // 열거형 옵션
  options?: Array<{
    value: any;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  
  // JSON 스키마 검증
  jsonSchema?: object;
  
  // 커스텀 검증
  customValidator?: string; // function name
  
  // 종속성 검증
  dependencies?: Array<{
    key: string;
    value: any;
    condition: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  }>;
}

// ===== 사용자별 설정 타입 =====

// 사용자 설정
export interface UserSetting extends BaseEntity {
  userId: ID;
  settingKey: string;
  value: any;
  
  // 오버라이드 정보
  isOverridden: boolean;
  overriddenAt?: Timestamp;
  overriddenBy?: ID;
  overrideReason?: string;
}

// 사용자 환경설정
export interface UserPreferences extends BaseEntity {
  userId: ID;
  
  // 언어 및 지역
  language: 'ko' | 'en';
  timezone: string;
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  timeFormat: '12h' | '24h';
  numberFormat: {
    locale: string;
    currency: string;
    decimalPlaces: number;
  };
  
  // 테마 설정
  theme: 'LIGHT' | 'DARK' | 'AUTO';
  colorScheme?: string;
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  
  // 레이아웃 설정
  sidebarCollapsed: boolean;
  density: 'COMFORTABLE' | 'COMPACT' | 'STANDARD';
  
  // 알림 설정
  notifications: UserNotificationPreferences;
  
  // 대시보드 설정
  defaultDashboard?: ID;
  favoriteWidgets: ID[];
  
  // 테이블 설정
  defaultPageSize: number;
  tableSettings: Record<string, TablePreference>;
  
  // 개인화 설정
  shortcuts: KeyboardShortcut[];
  quickFilters: QuickFilter[];
  bookmarks: Bookmark[];
  
  // 접근성 설정
  accessibility: AccessibilitySettings;
}

// 사용자 알림 설정
export interface UserNotificationPreferences {
  email: {
    enabled: boolean;
    riskAlerts: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
    taskAssignments: boolean;
    mentions: boolean;
    reportReady: boolean;
    
    // 발송 시간 제한
    quietHours: {
      enabled: boolean;
      startTime: string; // HH:mm
      endTime: string;   // HH:mm
    };
    
    // 주말 알림
    weekendNotifications: boolean;
  };
  
  push: {
    enabled: boolean;
    urgentAlerts: boolean;
    assignedTasks: boolean;
    mentions: boolean;
    systemMaintenance: boolean;
    
    // 일정별 설정
    schedule: Array<{
      dayOfWeek: number; // 0=Sunday
      startTime: string;
      endTime: string;
      enabled: boolean;
    }>;
  };
  
  inApp: {
    enabled: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
    showPreviews: boolean;
    autoMarkAsRead: boolean;
    autoMarkAsReadDelay: number; // seconds
  };
}

// 테이블 선호 설정
export interface TablePreference {
  columnOrder: string[];
  columnWidths: Record<string, number>;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, any>;
  visibleColumns: string[];
  pageSize: number;
}

// 키보드 단축키
export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[]; // e.g., ['Ctrl', 'K']
  action: string;
  scope: 'GLOBAL' | 'PAGE' | 'COMPONENT';
  enabled: boolean;
}

// 빠른 필터
export interface QuickFilter {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  scope: 'GLOBAL' | 'RISKS' | 'USERS' | 'REPORTS';
  icon?: string;
  color?: string;
  order: number;
}

// 북마크
export interface Bookmark {
  id: string;
  name: string;
  url: string;
  description?: string;
  tags: string[];
  category?: string;
  icon?: string;
  order: number;
  createdAt: Timestamp;
}

// 접근성 설정
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  textSize: number; // 100% = 1.0
  
  // 색상 조정
  colorBlindnessMode: 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA';
  customColorScheme?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

// ===== 시스템 구성 타입 =====

// 시스템 정보
export interface SystemInfo {
  version: string;
  buildNumber: string;
  buildDate: Timestamp;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  
  // 서버 정보
  serverInfo: {
    hostname: string;
    ipAddress: string;
    operatingSystem: string;
    javaVersion: string;
    memoryUsage: {
      total: number;
      used: number;
      free: number;
      max: number;
    };
    diskSpace: {
      total: number;
      used: number;
      free: number;
    };
  };
  
  // 데이터베이스 정보
  databaseInfo: {
    type: string;
    version: string;
    url: string;
    connectionPoolSize: number;
    activeConnections: number;
  };
  
  // 애플리케이션 통계
  statistics: {
    totalUsers: number;
    activeUsers: number;
    totalRisks: number;
    totalReports: number;
    uptime: number; // milliseconds
    requestCount: number;
    errorCount: number;
  };
  
  timestamp: Timestamp;
}

// 시스템 상태
export interface SystemStatus {
  status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'MAINTENANCE';
  components: Array<{
    name: string;
    status: 'UP' | 'DOWN' | 'DEGRADED';
    responseTime?: number;
    lastChecked: Timestamp;
    details?: Record<string, any>;
  }>;
  
  // 성능 지표
  performance: {
    cpuUsage: number;      // percentage
    memoryUsage: number;   // percentage
    diskUsage: number;     // percentage
    networkLatency: number; // milliseconds
  };
  
  // 최근 이벤트
  recentEvents: Array<{
    timestamp: Timestamp;
    level: 'INFO' | 'WARNING' | 'ERROR';
    message: string;
    component?: string;
    details?: Record<string, any>;
  }>;
  
  lastUpdated: Timestamp;
}

// ===== 감사 및 로깅 설정 =====

// 감사 설정
export interface AuditSettings {
  enabled: boolean;
  
  // 추적 대상
  trackUserActions: boolean;
  trackSystemChanges: boolean;
  trackDataAccess: boolean;
  trackLoginAttempts: boolean;
  trackPermissionChanges: boolean;
  
  // 보존 정책
  retentionPeriod: number; // days
  archiveAfter: number;    // days
  
  // 필터링
  excludedActions: string[];
  excludedUsers: ID[];
  excludedIpRanges: string[];
  
  // 알림
  realTimeAlerts: boolean;
  alertThresholds: {
    failedLogins: number;
    dataExports: number;
    privilegeEscalation: number;
  };
  
  // 내보내기 설정
  autoExport: boolean;
  exportFormat: 'JSON' | 'CSV' | 'XML';
  exportDestination: string;
  exportFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

// 로깅 설정
export interface LoggingSettings {
  // 로그 레벨
  rootLevel: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  packageLevels: Record<string, string>;
  
  // 로그 형식
  pattern: string;
  includeStackTrace: boolean;
  includeLocation: boolean;
  includeMdc: boolean;
  
  // 파일 설정
  fileLogging: {
    enabled: boolean;
    fileName: string;
    maxFileSize: string;
    maxFiles: number;
    compress: boolean;
  };
  
  // 콘솔 설정
  consoleLogging: {
    enabled: boolean;
    colorized: boolean;
  };
  
  // 외부 로깅
  externalLogging: {
    enabled: boolean;
    endpoint: string;
    apiKey?: string;
    batchSize: number;
    flushInterval: number; // seconds
  };
  
  // 성능 로깅
  performanceLogging: {
    enabled: boolean;
    slowQueryThreshold: number; // milliseconds
    longRunningTaskThreshold: number; // milliseconds
  };
}

// ===== 통합 설정 타입 =====

// 이메일 설정
export interface EmailSettings {
  enabled: boolean;
  
  // SMTP 설정
  smtp: {
    host: string;
    port: number;
    username: string;
    password: string; // 암호화됨
    encryption: 'NONE' | 'TLS' | 'SSL';
    authEnabled: boolean;
  };
  
  // 발신자 설정
  fromAddress: string;
  fromName: string;
  replyToAddress?: string;
  
  // 템플릿 설정
  templatesPath: string;
  defaultLocale: string;
  
  // 발송 제한
  rateLimit: {
    enabled: boolean;
    maxEmails: number;
    timeWindow: number; // minutes
  };
  
  // 반송 메일 처리
  bounceHandling: {
    enabled: boolean;
    maxBounces: number;
    suspendAfterBounces: boolean;
  };
  
  // 구독 취소
  unsubscribe: {
    enabled: boolean;
    linkText: string;
    landingPageUrl?: string;
  };
}

// 외부 연동 설정
export interface IntegrationSettings {
  // LDAP/AD 연동
  ldap?: {
    enabled: boolean;
    server: string;
    port: number;
    bindDn: string;
    bindPassword: string; // 암호화됨
    baseDn: string;
    userSearchFilter: string;
    groupSearchFilter: string;
    attributeMapping: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      department?: string;
    };
    ssl: boolean;
    timeout: number; // seconds
  };
  
  // SSO 설정
  sso?: {
    enabled: boolean;
    provider: 'SAML' | 'OAuth2' | 'OpenID';
    configuration: Record<string, any>;
    attributeMapping: Record<string, string>;
    defaultRole: UserRole;
  };
  
  // Webhook 설정
  webhooks?: Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    secret?: string;
    headers?: Record<string, string>;
    timeout: number; // seconds
    retryAttempts: number;
  }>;
  
  // API 설정
  api?: {
    rateLimit: {
      enabled: boolean;
      requestsPerMinute: number;
      burstSize: number;
    };
    
    cors: {
      enabled: boolean;
      allowedOrigins: string[];
      allowedMethods: string[];
      allowedHeaders: string[];
      allowCredentials: boolean;
    };
    
    versioning: {
      strategy: 'HEADER' | 'PATH' | 'QUERY';
      defaultVersion: string;
      supportedVersions: string[];
    };
  };
}

// ===== API 요청/응답 타입 =====

// 설정 업데이트 요청
export interface UpdateSettingRequest {
  key: string;
  value: any;
  reason?: string;
}

// 벌크 설정 업데이트
export interface BulkUpdateSettingsRequest {
  updates: Array<{
    key: string;
    value: any;
  }>;
  reason?: string;
}

// 설정 백업/복원
export interface SettingsBackup {
  backupId: string;
  createdAt: Timestamp;
  createdBy: ID;
  description?: string;
  
  settings: SystemSetting[];
  userPreferences?: UserPreferences[];
  
  metadata: {
    version: string;
    environment: string;
    totalSettings: number;
    categories: SettingCategory[];
  };
}

export interface RestoreSettingsRequest {
  backupId: string;
  categories?: SettingCategory[];
  overwriteExisting: boolean;
  skipValidation: boolean;
  reason: string;
}

// 설정 쿼리
export interface SettingsQueryParams {
  category?: SettingCategory[];
  scope?: SettingScope[];
  editable?: boolean;
  visible?: boolean;
  search?: string;
  tags?: string[];
  
  // 사용자별 설정 조회
  userId?: ID;
  includeInherited?: boolean;
  
  // 정렬
  sortBy?: 'key' | 'name' | 'category' | 'order' | 'lastChangedAt';
  sortDirection?: 'asc' | 'desc';
}

// 설정 그룹
export interface SettingGroup {
  name: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  settings: SystemSetting[];
  collapsible: boolean;
  defaultExpanded: boolean;
}

// 설정 변경 이력
export interface SettingChangeHistory extends BaseEntity {
  settingKey: string;
  oldValue: any;
  newValue: any;
  changedBy: ID;
  changedAt: Timestamp;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // 변경 컨텍스트
  changeContext: {
    source: 'UI' | 'API' | 'IMPORT' | 'SYSTEM';
    sessionId?: string;
    requestId?: string;
  };
}