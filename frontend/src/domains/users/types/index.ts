// 사용자 관리 도메인 - 타입 정의

import { BaseEntity, ID, Timestamp } from '@/shared/types/common';
import { User, UserRoleCode, Role, UserStatus, Permission } from '@/domains/auth/types';

// ===== 확장된 사용자 관리 타입 =====

// 사용자 세부 정보 (관리자 뷰)
export interface UserDetails extends User {
  // 추가 관리 정보
  createdBy?: ID;
  lastModifiedBy?: ID;
  
  // 통계 정보
  loginCount: number;
  riskCount: number;
  reportCount: number;
  
  // 보안 정보
  failedLoginAttempts: number;
  lockedAt?: Timestamp;
  lockedBy?: ID;
  lockReason?: string;
  
  // 조직 정보
  managerId?: ID;
  subordinates?: ID[];
  teamMembers?: ID[];
}

// 사용자 프로필 (본인 뷰)
export interface UserProfile {
  id: ID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  
  // 개인 정보
  profilePicture?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  
  // 환경 설정
  preferredLanguage: 'ko' | 'en';
  timezone: string;
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  timeFormat: '24h' | '12h';
  
  // 알림 설정
  notificationSettings: NotificationSettings;
  
  // 보안 설정
  twoFactorEnabled: boolean;
  lastPasswordChange: Timestamp;
  
  // 활동 정보
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 알림 설정 (확장)
export interface NotificationSettings {
  email: {
    riskAlerts: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
    taskAssignments: boolean;
    mentionNotifications: boolean;
    digestFrequency: 'DAILY' | 'WEEKLY' | 'NEVER';
  };
  push: {
    urgentAlerts: boolean;
    assignedTasks: boolean;
    mentions: boolean;
    systemMaintenance: boolean;
  };
  inApp: {
    realTimeUpdates: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
  };
}

// ===== 팀 및 조직 구조 타입 =====

// 부서/팀
export interface Department extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: ID;
  managerId?: ID;
  
  // 계층 구조
  level: number;
  path: string; // "/engineering/backend"
  
  // 멤버 수
  memberCount: number;
  activeMembers: number;
  
  // 설정
  isActive: boolean;
  costCenter?: string;
  budget?: number;
}

// 팀 멤버
export interface TeamMember {
  userId: ID;
  user: Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'email' | 'profilePicture'>;
  departmentId: ID;
  role: TeamRole;
  joinedAt: Timestamp;
  isActive: boolean;
}

// 팀 역할 (조직 내 역할과 별도)
export type TeamRole = 'MANAGER' | 'LEAD' | 'SENIOR' | 'MEMBER' | 'INTERN';

// ===== 사용자 활동 및 로그 타입 =====

// 사용자 활동 로그
export interface UserActivity extends BaseEntity {
  userId: ID;
  activityType: UserActivityType;
  entity: string; // 'Risk', 'Report', 'User'
  entityId?: ID;
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  description: string;
  
  // 메타데이터
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  duration?: number; // milliseconds
  
  timestamp: Timestamp;
}

// 사용자 활동 타입
export type UserActivityType = 
  | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE'
  | 'RISK_CREATE' | 'RISK_UPDATE' | 'RISK_DELETE' | 'RISK_VIEW'
  | 'REPORT_GENERATE' | 'REPORT_EXPORT' | 'REPORT_SHARE'
  | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE'
  | 'PERMISSION_CHANGE' | 'ROLE_CHANGE'
  | 'SYSTEM_ACCESS' | 'FILE_UPLOAD' | 'FILE_DOWNLOAD';

// 사용자 세션 정보 (확장)
export interface UserSessionDetails {
  sessionId: string;
  userId: ID;
  user: Pick<User, 'id' | 'username' | 'firstName' | 'lastName'>;
  
  // 세션 정보
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  
  // 시간 정보
  createdAt: Timestamp;
  lastAccessedAt: Timestamp;
  expiresAt: Timestamp;
  
  // 상태
  isActive: boolean;
  isCurrent: boolean;
  
  // 통계
  pageViews: number;
  totalDuration: number; // milliseconds
}

// ===== 사용자 검색 및 필터 타입 =====

// 고급 사용자 검색
export interface AdvancedUserSearchParams {
  // 기본 검색
  query?: string;
  searchFields?: ('username' | 'email' | 'firstName' | 'lastName' | 'department' | 'jobTitle')[];
  
  // 필터
  roles?: UserRoleCode[]; // 역할 코드로 필터링
  status?: UserStatus[];
  departments?: string[];
  permissions?: Permission[];
  
  // 날짜 범위
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  lastLoginAfter?: Timestamp;
  lastLoginBefore?: Timestamp;
  
  // 활동 필터
  minLoginCount?: number;
  maxLoginCount?: number;
  hasProfilePicture?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  
  // 정렬
  sortBy?: 'username' | 'email' | 'firstName' | 'lastName' | 'department' | 'createdAt' | 'lastLoginAt' | 'loginCount';
  sortDirection?: 'asc' | 'desc';
  
  // 페이징
  page?: number;
  size?: number;
}

// 사용자 필터 옵션
export interface UserFilterOptions {
  roles: Array<{ value: UserRoleCode; label: string; count: number; role: Role }>; // Role 객체 포함
  statuses: Array<{ value: UserStatus; label: string; count: number }>;
  departments: Array<{ value: string; label: string; count: number }>;
  permissions: Array<{ value: Permission; label: string; count: number }>;
}

// ===== 사용자 통계 및 분석 타입 =====

// 상세 사용자 통계
export interface DetailedUserStatistics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    lockedUsers: number;
    pendingVerification: number;
    newUsersThisMonth: number;
    userGrowthRate: number; // percentage
  };
  
  demographics: {
    byRole: Record<UserRoleCode, number>; // 역할 코드별 통계
    byStatus: Record<UserStatus, number>;
    byDepartment: Array<{ department: string; count: number }>;
    
    averageAge?: number;
    genderDistribution?: Record<string, number>;
  };
  
  activity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    
    loginFrequency: Array<{
      date: string;
      loginCount: number;
      uniqueUsers: number;
    }>;
    
    userEngagement: Array<{
      userId: ID;
      username: string;
      activityScore: number;
      lastActivity: Timestamp;
    }>;
  };
  
  performance: {
    averageSessionDuration: number; // minutes
    averagePageViews: number;
    bounceRate: number; // percentage
    
    topFeatures: Array<{
      feature: string;
      usageCount: number;
      userCount: number;
    }>;
  };
}

// 사용자 활동 요약
export interface UserActivitySummary {
  userId: ID;
  period: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  
  metrics: {
    sessionCount: number;
    totalDuration: number; // minutes
    pageViews: number;
    actionsPerformed: number;
    
    // 기능별 사용량
    risksCreated: number;
    risksUpdated: number;
    reportsGenerated: number;
    commentsPosted: number;
  };
  
  patterns: {
    mostActiveHours: number[]; // hours of day (0-23)
    mostActiveDays: string[]; // days of week
    averageSessionDuration: number; // minutes
    
    topFeatures: Array<{
      feature: string;
      usageCount: number;
    }>;
  };
}

// ===== 사용자 관리 작업 타입 =====

// 벌크 사용자 작업
export interface BulkUserOperation {
  userIds: ID[];
  operation: 'ACTIVATE' | 'DEACTIVATE' | 'LOCK' | 'UNLOCK' | 'DELETE' | 'UPDATE_ROLE' | 'SEND_EMAIL';
  parameters?: {
    roleIds?: ID[]; // UPDATE_ROLE 작업시 할당할 역할 ID들
    emailTemplate?: string; // SEND_EMAIL 작업시 템플릿
    [key: string]: any;
  };
  reason?: string;
}

// 벌크 작업 결과
export interface BulkOperationResult {
  operationId: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  
  successes: Array<{
    userId: ID;
    message: string;
  }>;
  
  failures: Array<{
    userId: ID;
    error: string;
    reason: string;
  }>;
  
  executedAt: Timestamp;
  executedBy: ID;
}

// 사용자 가져오기/내보내기
export interface UserImportRequest {
  file: File;
  skipDuplicates: boolean;
  sendWelcomeEmails: boolean;
  defaultRoleId: ID; // 기본 역할 ID
  mapping: Record<string, string>; // CSV column to field mapping
}

export interface UserImportResult {
  importId: string;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  duplicatesSkipped: number;
  
  errors: Array<{
    row: number;
    field?: string;
    error: string;
    data: Record<string, any>;
  }>;
  
  importedUsers: Array<{
    id: ID;
    username: string;
    email: string;
  }>;
}

// 사용자 내보내기 옵션
export interface UserExportOptions {
  format: 'CSV' | 'EXCEL' | 'JSON';
  fields: string[];
  filters?: AdvancedUserSearchParams;
  includeStatistics: boolean;
  includeActivities: boolean;
}

// ===== API 응답 타입 =====

// 사용자 목록 응답
export interface UsersListResponse {
  users: UserDetails[];
  totalCount: number;
  filteredCount: number;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: UserFilterOptions;
}

// 사용자 대시보드 데이터
export interface UserDashboardData {
  userProfile: UserProfile;
  recentActivities: UserActivity[];
  statistics: {
    risksAssigned: number;
    tasksCompleted: number;
    reportsGenerated: number;
    loginStreak: number;
  };
  notifications: UserNotification[];
  upcomingTasks: TaskSummary[];
}

// 사용자 알림
export interface UserNotification extends BaseEntity {
  userId: ID;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: 'SYSTEM' | 'RISK' | 'TASK' | 'REPORT' | 'SOCIAL';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  
  isRead: boolean;
  readAt?: Timestamp;
  
  metadata?: Record<string, any>;
}

// 작업 요약
export interface TaskSummary {
  id: ID;
  title: string;
  type: 'RISK' | 'REPORT' | 'REVIEW' | 'APPROVAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Timestamp;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  assignedBy: {
    id: ID;
    name: string;
  };
}