// 인증/인가 도메인 - 타입 정의

import { BaseEntity, ID, Timestamp } from '@/shared/types/common';

// ===== 역할 관리 타입 (DB 기반) =====

// 역할 엔티티 (DB rsms.roles 테이블)
export interface Role extends BaseEntity {
  roleId: string;        // role_id: 'CEO', 'EXECUTIVE', 'MANAGER', 'EMPLOYEE', 'ADMIN'
  roleName: string;      // role_name: '대표이사', '임원', '부서장', '부서원', '관리자'
  description?: string;  // description: 역할 설명
  active: boolean;       // active: 활성화 상태
  
  // 권한 관계 (조인으로 가져오는 데이터)
  permissions?: Permission[];
}

// 권한 엔티티 (DB rsms.permissions 테이블)
export interface Permission extends BaseEntity {
  permissionId: string;     // permission_id: 'READ_USER', 'WRITE_USER' 등
  permissionName: string;   // permission_name: '사용자 조회', '사용자 생성' 등
  category: PermissionCategory; // category: 권한 카테고리
  description?: string;     // description: 권한 설명
  displayOrder: number;     // display_order: 화면 표시 순서
  active: boolean;          // active: 활성화 상태
}

// 권한 카테고리
export type PermissionCategory = 'USER' | 'RISK' | 'REPORT' | 'ADMIN' | 'SYSTEM';

// 권한 코드 타입 (편의용)
export type PermissionCode = string; // 'READ_USER', 'WRITE_USER', 'DELETE_USER' 등

// 역할-권한 매핑 (DB rsms.role_permissions 테이블)
export interface RolePermission {
  roleId: string;           // role_id
  permissionId: string;     // permission_id
  granted: boolean;         // granted: 권한 부여 여부
  grantedAt: Timestamp;     // granted_at: 권한 부여 일시
  grantedBy: string;        // granted_by: 권한 부여자
}

// 사용자 역할 (DB에서 동적으로 로드)
export type UserRoleCode = string; // 'CEO' | 'EXECUTIVE' | 'MANAGER' | 'EMPLOYEE' | 'ADMIN' 등

// 기본 역할 코드 (초기 데이터용)
export const DEFAULT_ROLE_CODES = {
  CEO: 'CEO',           // 대표이사
  EXECUTIVE: 'EXECUTIVE', // 임원
  MANAGER: 'MANAGER',     // 부서장
  EMPLOYEE: 'EMPLOYEE',   // 부서원
  ADMIN: 'ADMIN'          // 관리자
} as const;

// 역할별 기본 권한 레벨 매핑
export const ROLE_LEVEL_MAP = {
  [DEFAULT_ROLE_CODES.CEO]: 1,       // 최고 권한
  [DEFAULT_ROLE_CODES.EXECUTIVE]: 2,  // 임원 권한
  [DEFAULT_ROLE_CODES.MANAGER]: 3,    // 관리자 권한
  [DEFAULT_ROLE_CODES.EMPLOYEE]: 4,   // 일반 사용자 권한
  [DEFAULT_ROLE_CODES.ADMIN]: 1       // 시스템 관리자 권한
} as const;

// ===== 기본 사용자 및 인증 타입 =====

// 사용자 상태
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING_VERIFICATION';

// 사용자 엔티티 (DB rsms.users 테이블)
export interface User extends BaseEntity {
  userId: string;           // user_id: 사용자 고유 ID
  email: string;            // email: 이메일 (로그인용)
  empNo: string;            // emp_no: 사원번호 (employee 테이블과 연결)
  password?: string;        // password: 비밀번호 (클라이언트에서는 보통 제외)
  role: string;             // role: 기본 역할 (DEFAULT 'EMPLOYEE')
  active: boolean;          // active: 활성화 상태
  
  // Employee 테이블에서 조인으로 가져오는 정보
  empName?: string;         // employee.emp_name
  deptCd?: string;          // employee.dept_cd
  positionCd?: string;      // employee.position_cd
  jobRankCd?: string;       // employee.job_rank_cd
  phoneNo?: string;         // employee.phone_no
  
  // 역할 및 권한 (조인으로 가져오는 데이터)
  roles?: Role[];           // user_roles를 통해 조인된 역할들
  permissions?: Permission[]; // role_permissions를 통해 조인된 권한들
  
  // 세션 정보 (선택적으로 포함)
  lastLoginAt?: Timestamp;
  
  // computed fields (프론트엔드에서 계산)
  fullName?: string;        // empName 기반으로 계산
  roleCodes?: UserRoleCode[]; // roles 배열에서 roleId 추출
}

// 사용자-역할 할당 (DB rsms.user_roles 테이블)
export interface UserRole {
  roleId: string;           // role_id: 역할 ID (PRIMARY KEY)
  userId: string;           // user_id: 사용자 ID (PRIMARY KEY)
  assignedAt: Timestamp;    // assigned_at: 역할 할당 시간
  assignedBy?: string;      // assigned_by: 할당한 관리자
  active: boolean;          // active: 할당 활성화 상태
}

// 사용자 세션 (DB rsms.user_sessions 테이블)
export interface UserSession {
  sessionId: string;        // session_id: 세션 고유 ID (PRIMARY KEY)
  userId: string;           // user_id: 사용자 ID (PRIMARY KEY)
  ipAddress: string;        // ip_address: 접속 IP
  userAgent?: string;       // user_agent: 브라우저 정보
  createdAt: Timestamp;     // created_at: 세션 생성 시간
  lastAccessedAt: Timestamp; // last_accessed_at: 마지막 접근 시간
  expiresAt: Timestamp;     // expires_at: 세션 만료 시간
  active: boolean;          // active: 세션 활성화 상태
}

// 알림 설정
export interface NotificationSettings {
  email: {
    riskAlerts: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
  };
  push: {
    urgentAlerts: boolean;
    assignedTasks: boolean;
    mentions: boolean;
  };
}

// ===== 인증 컨텍스트 =====

// 인증 컨텍스트
export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  permissions: PermissionCode[];
  hasPermission: (permission: PermissionCode) => boolean;
  hasRole: (roleCode: UserRoleCode) => boolean;
  hasRoleLevel: (level: number) => boolean; // 특정 레벨 이상의 권한 체크
  getHighestRoleLevel: () => number; // 사용자의 최고 권한 레벨 반환
}

// ===== 로그인/회원가입 요청 타입 =====

// 로그인 요청
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 로그인 응답
export interface LoginResponse {
  user: User;
  sessionId: string;
  expiresAt: Timestamp;
  message: string;
}

// 회원가입 요청
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
}

// 회원가입 응답
export interface RegisterResponse {
  user: Omit<User, 'permissions'>;
  message: string;
  verificationRequired: boolean;
}

// ===== 비밀번호 관리 타입 =====

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// 비밀번호 재설정 요청
export interface ForgotPasswordRequest {
  email: string;
}

// 비밀번호 재설정
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ===== 사용자 관리 타입 =====

// 사용자 생성 요청 (관리자용)
export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // 선택적, 이메일로 초기 비밀번호 설정 가능
  roleIds: string[]; // 역할 ID 배열 (DB 참조)
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  sendWelcomeEmail?: boolean;
}

// 사용자 수정 요청
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  preferredLanguage?: 'ko' | 'en';
  timezone?: string;
  notificationSettings?: NotificationSettings;
}

// 사용자 역할 변경 요청 (관리자용)
export interface UpdateUserRoleRequest {
  userId: ID;
  roleIds: string[]; // 역할 ID 배열
}

// 사용자 상태 변경 요청 (관리자용)
export interface UpdateUserStatusRequest {
  userId: ID;
  status: UserStatus;
  reason?: string;
}

// ===== 프로필 관리 타입 =====

// 프로필 수정 요청
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  profilePicture?: File;
}

// 프로필 사진 업로드 응답
export interface ProfilePictureUploadResponse {
  imageUrl: string;
  thumbnailUrl: string;
}

// ===== 사용자 쿼리 및 필터 타입 =====

// 사용자 목록 쿼리
export interface UserQueryParams {
  search?: string;
  roleIds?: string[]; // 역할 ID 배열
  status?: UserStatus[];
  department?: string;
  
  // 날짜 필터
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  lastLoginAfter?: Timestamp;
  
  // 정렬
  sortBy?: 'username' | 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
  sortDirection?: 'asc' | 'desc';
}

// 사용자 통계
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  pendingVerification: number;
  
  byRole: Record<UserRoleCode, number>;
  
  loginActivity: Array<{
    date: string;
    loginCount: number;
    uniqueUsers: number;
  }>;
  
  registrationTrend: Array<{
    month: string;
    newUsers: number;
    totalUsers: number;
  }>;
}

// ===== 권한 및 보안 타입 =====

// 권한 체크 결과
export interface PermissionCheck {
  hasPermission: boolean;
  requiredPermissions: PermissionCode[];
  userPermissions: PermissionCode[];
  userRoles: Role[]; // 권한 체크시 사용자의 역할 정보
  reason?: string;
}

// 접근 로그 (DB rsms.access_logs 테이블)
export interface AccessLog extends BaseEntity {
  logId: string;            // log_id: 로그 고유 ID
  userId?: string;          // user_id: 사용자 ID (비로그인시 NULL 가능)
  sessionId?: string;       // session_id: 세션 ID
  action: string;           // action: 액션명 (LOGIN, LOGOUT, CREATE_RISK 등)
  resource: string;         // resource: 접근 리소스 경로
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // method: HTTP 메소드
  ipAddress: string;        // ip_address: 접속 IP
  userAgent?: string;       // user_agent: 브라우저 정보
  statusCode: number;       // status_code: HTTP 응답 코드
  responseTime: number;     // response_time: 응답 시간 (milliseconds)
  requestBody?: string;     // request_body: 요청 본문 (민감정보 제외)
  responseMessage?: string; // response_message: 응답 메시지
}

// ===== 인증 훅 및 상태 타입 =====

// 인증 상태
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  error: string | null;
}

// 로그인 상태
export interface LoginState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// 회원가입 상태
export interface RegisterState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  verificationRequired: boolean;
}

// 비밀번호 재설정 상태
export interface PasswordResetState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  stage: 'request' | 'reset' | 'complete';
}

// ===== 역할 관리 API 타입 =====

// 역할 목록 조회 응답
export interface RolesListResponse {
  roles: Role[];
  totalCount: number;
  activeCount: number;
}

// 역할 생성 요청
export interface CreateRoleRequest {
  roleId: string;
  roleName: string;
  description?: string;
  permissions: PermissionCode[];
}

// 역할 수정 요청
export interface UpdateRoleRequest {
  roleName?: string;
  description?: string;
  permissions?: PermissionCode[];
  active?: boolean;
}

// 역할 권한 매트릭스
export interface RolePermissionMatrix {
  roleCode: UserRoleCode;
  roleName: string;
  permissions: Array<{
    permission: PermissionCode;
    granted: boolean;
    inherited: boolean; // 상위 역할로부터 상속된 권한인지
  }>;
  level: number;
}

// 사용자 역할 할당 요청
export interface AssignUserRoleRequest {
  userId: ID;
  roleIds: string[];
  reason?: string;
  effectiveDate?: Timestamp;
  expiryDate?: Timestamp;
}

// 역할 계층 구조
export interface RoleHierarchy {
  role: Role;
  parentRoles: Role[]; // 상위 역할들
  childRoles: Role[];  // 하위 역할들
  inheritedPermissions: PermissionCode[]; // 상속받은 권한들
}

// ===== API 에러 타입 =====

// 인증 에러 코드
export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_INACTIVE'
  | 'EMAIL_NOT_VERIFIED'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USERNAME_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'TOO_MANY_ATTEMPTS';

// 인증 에러
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
}