/**
 * 역활관리 API 서비스 타입 정의
 *
 * @description RESTful API 엔드포인트 및 서비스 계층 타입
 * @based_on role.types.ts 기본 타입 시스템
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import {
  Role,
  Permission,
  RoleWithPermissions,
  UserWithRoles,
  RoleHierarchy,
  RoleSearchFilter,
  PermissionSearchFilter,
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePermissionRequest,
  UserRoleAssignRequest,
  PageInfo,
  PageResponse,
  ApiResponse,
  RoleStatistics,
  PermissionMatrix,
  RoleId,
  PermissionId,
  UserId
} from './role.types';

// ===============================
// API 엔드포인트 경로 상수
// ===============================

/**
 * 역활관리 API 엔드포인트 경로
 */
export const ROLE_API_PATHS = {
  // 역활 관리
  ROLES: '/api/roles',
  ROLE_DETAIL: (id: RoleId) => `/api/roles/${id}`,
  ROLE_PERMISSIONS: (id: RoleId) => `/api/roles/${id}/permissions`,
  ROLE_USERS: (id: RoleId) => `/api/roles/${id}/users`,
  ROLE_HIERARCHY: '/api/roles/hierarchy',
  ROLE_STATISTICS: '/api/roles/statistics',

  // 권한 관리
  PERMISSIONS: '/api/permissions',
  PERMISSION_DETAIL: (id: PermissionId) => `/api/permissions/${id}`,
  PERMISSION_BY_RESOURCE: '/api/permissions/by-resource',

  // 사용자-역활 관리
  USER_ROLES: (userId: UserId) => `/api/users/${userId}/roles`,
  ASSIGN_ROLE: '/api/user-roles/assign',
  REVOKE_ROLE: '/api/user-roles/revoke',
  BULK_ASSIGN_ROLES: '/api/user-roles/bulk-assign',

  // 권한 매트릭스
  PERMISSION_MATRIX: '/api/roles/permission-matrix',
  UPDATE_PERMISSION_MATRIX: '/api/roles/permission-matrix/update',

  // 검증 및 체크
  VALIDATE_ROLE_CODE: '/api/roles/validate-code',
  CHECK_ROLE_PERMISSIONS: '/api/roles/check-permissions',
  SIMULATE_ROLE_ACCESS: '/api/roles/simulate-access'
} as const;

// ===============================
// HTTP 메소드별 요청 타입
// ===============================

/**
 * GET 요청 파라미터 타입
 */
export interface RoleGetParams extends Partial<RoleSearchFilter>, Partial<PageInfo> {
  includePermissions?: boolean;   // 권한 정보 포함 여부
  includeUserCount?: boolean;     // 사용자 수 포함 여부
  includeHierarchy?: boolean;     // 계층 정보 포함 여부
}

/**
 * 권한 GET 요청 파라미터 타입
 */
export interface PermissionGetParams extends Partial<PermissionSearchFilter>, Partial<PageInfo> {
  includeRoles?: boolean;         // 역활 정보 포함 여부
}

/**
 * POST 요청 본문 타입 집합
 */
export interface RolePostBodies {
  createRole: CreateRoleRequest;
  assignPermissions: RolePermissionRequest;
  assignUserRole: UserRoleAssignRequest;
  bulkAssignRoles: {
    userIds: UserId[];
    roleIds: RoleId[];
    expiresAt?: string;
  };
  validateRoleCode: {
    roleCode: string;
    excludeId?: RoleId;
  };
  simulateAccess: {
    roleIds: RoleId[];
    resource: string;
    action: string;
  };
}

/**
 * PUT 요청 본문 타입
 */
export interface RolePutBodies {
  updateRole: UpdateRoleRequest;
  updatePermissionMatrix: {
    roleId: RoleId;
    permissionMatrix: Record<PermissionId, boolean>;
  };
}

/**
 * DELETE 요청 파라미터 타입
 */
export interface RoleDeleteParams {
  revokePermissions: {
    roleId: RoleId;
    permissionIds: PermissionId[];
  };
  revokeUserRole: {
    userId: UserId;
    roleIds: RoleId[];
  };
}

// ===============================
// API 응답 확장 타입
// ===============================

/**
 * 역활 목록 조회 확장 응답
 */
export interface RoleListApiResponse extends ApiResponse<PageResponse<RoleWithPermissions>> {
  metadata?: {
    totalActiveRoles: number;
    totalInactiveRoles: number;
    averagePermissionsPerRole: number;
    lastUpdated: string;
  };
}

/**
 * 권한 매트릭스 API 응답
 */
export interface PermissionMatrixApiResponse extends ApiResponse<{
  roles: Role[];
  permissions: Permission[];
  matrix: PermissionMatrix[];
}> {}

/**
 * 역활 검증 API 응답
 */
export interface RoleValidationApiResponse extends ApiResponse<{
  isValid: boolean;
  conflicts?: string[];
  suggestions?: string[];
}> {}

/**
 * 접근 시뮬레이션 API 응답
 */
export interface AccessSimulationApiResponse extends ApiResponse<{
  hasAccess: boolean;
  grantingRoles: Role[];
  requiredPermissions: Permission[];
  explanation: string;
}> {}

// ===============================
// API 서비스 인터페이스 정의
// ===============================

/**
 * 역활 관리 API 서비스 인터페이스
 */
export interface RoleApiService {
  // 역활 CRUD
  getRoles(params?: RoleGetParams): Promise<RoleListApiResponse>;
  getRoleById(id: RoleId): Promise<ApiResponse<RoleWithPermissions>>;
  createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>>;
  updateRole(id: RoleId, data: UpdateRoleRequest): Promise<ApiResponse<Role>>;
  deleteRole(id: RoleId): Promise<ApiResponse<void>>;

  // 역활 계층 관리
  getRoleHierarchy(): Promise<ApiResponse<RoleHierarchy[]>>;
  moveRoleInHierarchy(roleId: RoleId, newParentId?: RoleId): Promise<ApiResponse<void>>;

  // 역활-권한 관리
  getRolePermissions(roleId: RoleId): Promise<ApiResponse<Permission[]>>;
  assignPermissionsToRole(roleId: RoleId, permissionIds: PermissionId[]): Promise<ApiResponse<void>>;
  revokePermissionsFromRole(roleId: RoleId, permissionIds: PermissionId[]): Promise<ApiResponse<void>>;

  // 통계 및 분석
  getRoleStatistics(): Promise<ApiResponse<RoleStatistics>>;

  // 검증
  validateRoleCode(roleCode: string, excludeId?: RoleId): Promise<RoleValidationApiResponse>;
}

/**
 * 권한 관리 API 서비스 인터페이스
 */
export interface PermissionApiService {
  // 권한 CRUD
  getPermissions(params?: PermissionGetParams): Promise<ApiResponse<PageResponse<Permission>>>;
  getPermissionById(id: PermissionId): Promise<ApiResponse<Permission>>;
  getPermissionsByResource(resource: string): Promise<ApiResponse<Permission[]>>;

  // 권한 분석
  getUnusedPermissions(): Promise<ApiResponse<Permission[]>>;
  getPermissionUsageReport(): Promise<ApiResponse<Record<PermissionId, number>>>;
}

/**
 * 사용자-역활 관리 API 서비스 인터페이스
 */
export interface UserRoleApiService {
  // 사용자 역활 관리
  getUserRoles(userId: UserId): Promise<ApiResponse<Role[]>>;
  assignRoleToUser(userId: UserId, roleIds: RoleId[]): Promise<ApiResponse<void>>;
  revokeRoleFromUser(userId: UserId, roleIds: RoleId[]): Promise<ApiResponse<void>>;

  // 대량 역활 할당
  bulkAssignRoles(userIds: UserId[], roleIds: RoleId[]): Promise<ApiResponse<void>>;

  // 사용자 권한 조회
  getUserEffectivePermissions(userId: UserId): Promise<ApiResponse<Permission[]>>;
}

/**
 * 권한 매트릭스 API 서비스 인터페이스
 */
export interface PermissionMatrixApiService {
  // 권한 매트릭스 조회
  getPermissionMatrix(
    roleIds?: RoleId[],
    permissionIds?: PermissionId[]
  ): Promise<PermissionMatrixApiResponse>;

  // 권한 매트릭스 업데이트
  updatePermissionMatrix(
    updates: Array<{
      roleId: RoleId;
      permissionId: PermissionId;
      granted: boolean;
    }>
  ): Promise<ApiResponse<void>>;

  // 권한 매트릭스 내보내기
  exportPermissionMatrix(format: 'json' | 'csv' | 'excel'): Promise<ApiResponse<Blob>>;
}

/**
 * 역활 분석 API 서비스 인터페이스
 */
export interface RoleAnalyticsApiService {
  // 접근 시뮬레이션
  simulateUserAccess(
    roleIds: RoleId[],
    resource: string,
    action: string
  ): Promise<AccessSimulationApiResponse>;

  // 역활 사용량 분석
  getRoleUsageAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{
    roleUsage: Record<RoleId, number>;
    permissionUsage: Record<PermissionId, number>;
    accessPatterns: Array<{
      resource: string;
      accessCount: number;
      uniqueUsers: number;
    }>;
  }>>;

  // 보안 감사 리포트
  getSecurityAuditReport(): Promise<ApiResponse<{
    orphanedRoles: Role[];           // 사용자가 없는 역활
    overprivilegedRoles: Role[];     // 과도한 권한을 가진 역활
    underutilizedPermissions: Permission[]; // 사용되지 않는 권한
    duplicateRoles: Role[][];        // 중복 권한을 가진 역활들
    recommendations: string[];       // 개선 권장사항
  }>>;
}

// ===============================
// 통합 API 서비스 타입
// ===============================

/**
 * 역활관리 시스템 통합 API 서비스
 */
export interface RoleManagementApiService
  extends RoleApiService,
          PermissionApiService,
          UserRoleApiService,
          PermissionMatrixApiService,
          RoleAnalyticsApiService {

  // 시스템 초기화
  initializeRoleSystem(): Promise<ApiResponse<void>>;

  // 기본 역활 생성
  createDefaultRoles(): Promise<ApiResponse<Role[]>>;

  // 시스템 상태 체크
  checkSystemHealth(): Promise<ApiResponse<{
    rolesCount: number;
    permissionsCount: number;
    userRoleAssignments: number;
    lastSyncAt: string;
    issues: string[];
  }>>;
}

// ===============================
// API 클라이언트 설정 타입
// ===============================

/**
 * API 클라이언트 설정
 */
export interface RoleApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTimeout: number;
  enableLogging: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * API 요청 옵션
 */
export interface RoleApiRequestOptions {
  skipCache?: boolean;
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

// ===============================
// 에러 타입 정의
// ===============================

/**
 * API 에러 타입
 */
export enum RoleApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * API 에러 인터페이스
 */
export interface RoleApiError extends Error {
  type: RoleApiErrorType;
  status?: number;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ===============================
// 웹소켓 실시간 업데이트 타입
// ===============================

/**
 * 웹소켓 이벤트 타입
 */
export enum RoleWebSocketEventType {
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DELETED = 'ROLE_DELETED',
  PERMISSION_ASSIGNED = 'PERMISSION_ASSIGNED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  USER_ROLE_REVOKED = 'USER_ROLE_REVOKED',
  MATRIX_UPDATED = 'MATRIX_UPDATED'
}

/**
 * 웹소켓 이벤트 데이터
 */
export interface RoleWebSocketEvent {
  type: RoleWebSocketEventType;
  data: any;
  timestamp: string;
  userId: string;
  sessionId: string;
}

/**
 * 웹소켓 구독 옵션
 */
export interface RoleWebSocketSubscriptionOptions {
  roleIds?: RoleId[];
  permissionIds?: PermissionId[];
  userIds?: UserId[];
  eventTypes?: RoleWebSocketEventType[];
}

// ===============================
// 캐시 관리 타입
// ===============================

/**
 * 캐시 키 생성 함수 타입
 */
export type CacheKeyGenerator = (
  endpoint: string,
  params?: Record<string, any>
) => string;

/**
 * 캐시 관리자 인터페이스
 */
export interface RoleApiCacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<number>;
  invalidateRole(roleId: RoleId): Promise<void>;
  invalidatePermission(permissionId: PermissionId): Promise<void>;
  invalidateUser(userId: UserId): Promise<void>;
}