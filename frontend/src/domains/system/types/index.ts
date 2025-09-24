/**
 * 역활관리 시스템 타입 통합 인덱스
 *
 * @description 모든 타입 정의를 중앙에서 관리하는 인덱스 파일
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

// ===============================
// 기본 타입 시스템 (핵심)
// ===============================

export * from './role.types';

// 사용자관리 타입
export * from '../pages/UserMgmt/types/user.types';

// 기본 엔티티 타입
export type {
  Role,
  Permission,
  RolePermission,
  UserRole,
  RoleWithPermissions,
  UserWithRoles,
  RoleHierarchy
} from './role.types';

// ID 타입들
export type {
  RoleId,
  PermissionId,
  UserId
} from './role.types';

// 열거형 타입들
export {
  RoleStatus,
  RoleType,
  PermissionType,
  PermissionAction
} from './role.types';

export type {
  RoleStatusType,
  RoleTypeType,
  PermissionTypeType,
  PermissionActionType
} from './role.types';

// 요청/응답 DTO
export type {
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePermissionRequest,
  UserRoleAssignRequest,
  ApiResponse,
  PageResponse,
  RoleStatistics
} from './role.types';

// 검색 및 필터링
export type {
  RoleSearchFilter,
  PermissionSearchFilter,
  PageInfo
} from './role.types';

// ===============================
// API 서비스 타입 시스템
// ===============================

export * from './role-api.types';

// API 서비스 인터페이스
export type {
  RoleApiService,
  PermissionApiService,
  UserRoleApiService,
  PermissionMatrixApiService,
  RoleAnalyticsApiService,
  RoleManagementApiService
} from './role-api.types';

// API 경로 상수
export { ROLE_API_PATHS } from './role-api.types';

// 요청/응답 타입
export type {
  RoleGetParams,
  PermissionGetParams,
  RolePostBodies,
  RolePutBodies,
  RoleDeleteParams,
  RoleListApiResponse,
  PermissionMatrixApiResponse,
  RoleValidationApiResponse,
  AccessSimulationApiResponse
} from './role-api.types';

// 설정 및 에러 타입
export type {
  RoleApiClientConfig,
  RoleApiRequestOptions,
  RoleApiError,
  RoleApiCacheManager
} from './role-api.types';

export { RoleApiErrorType } from './role-api.types';

// 웹소켓 타입
export type {
  RoleWebSocketEvent,
  RoleWebSocketSubscriptionOptions
} from './role-api.types';

export { RoleWebSocketEventType } from './role-api.types';

// ===============================
// UI 컴포넌트 타입 시스템
// ===============================

export * from './role-ui.types';

// 기본 UI 상태
export type {
  UIState,
  LoadingState,
  ErrorState,
  DialogState
} from './role-ui.types';

// 컴포넌트 Props
export type {
  RoleFormDialogProps,
  PermissionAssignDialogProps,
  DeleteConfirmDialogProps,
  RoleDataGridProps,
  PermissionMatrixGridProps,
  RoleSearchFilterProps,
  RoleFormProps,
  RoleStatsDashboardProps,
  RoleActionBarProps,
  RoleHierarchyTreeProps
} from './role-ui.types';

// 데이터 구조
export type {
  RoleFilterField,
  RoleFormState,
  RoleStatCard,
  RoleChartData,
  ActionButton,
  BulkActionOptions,
  RoleTreeNode,
  PermissionMatrixColumn,
  PermissionMatrixRow,
  RoleGridColumnDef,
  RoleTableColumns
} from './role-ui.types';

// 설정 및 옵션
export type {
  AdvancedSearchOptions,
  RoleCodeValidation,
  RoleKeyboardShortcuts,
  AccessibilityLabels,
  RoleI18nKeys,
  OfflineState,
  CacheOptions,
  PerformanceMetrics,
  PerformanceMonitoringOptions
} from './role-ui.types';

// 테마 상수
export {
  ROLE_STATUS_COLORS,
  ROLE_TYPE_ICONS,
  PERMISSION_TYPE_COLORS
} from './role-ui.types';

// ===============================
// 타입 가드 함수들
// ===============================

/**
 * Role 타입 가드
 */
export const isRole = (obj: any): obj is Role => {
  return obj && typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.roleCode === 'string' &&
         typeof obj.roleName === 'string';
};

/**
 * Permission 타입 가드
 */
export const isPermission = (obj: any): obj is Permission => {
  return obj && typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.permissionCode === 'string' &&
         typeof obj.permissionName === 'string';
};

/**
 * RoleWithPermissions 타입 가드
 */
export const isRoleWithPermissions = (obj: any): obj is RoleWithPermissions => {
  return isRole(obj) && Array.isArray(obj.permissions);
};

/**
 * API 응답 타입 가드
 */
export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj === 'object' &&
         typeof obj.success === 'boolean' &&
         typeof obj.timestamp === 'string';
};

/**
 * 페이지 응답 타입 가드
 */
export const isPageResponse = <T>(obj: any): obj is PageResponse<T> => {
  return obj && typeof obj === 'object' &&
         Array.isArray(obj.content) &&
         typeof obj.totalElements === 'number' &&
         typeof obj.totalPages === 'number';
};

// ===============================
// 유틸리티 타입들
// ===============================

/**
 * 역활 생성 시 필요한 필드들만 추출
 */
export type RoleCreateFields = Pick<Role, 'roleCode' | 'roleName' | 'description' | 'roleType' | 'parentRoleId' | 'sortOrder'>;

/**
 * 역활 수정 시 변경 가능한 필드들만 추출
 */
export type RoleUpdateFields = Partial<Pick<Role, 'roleName' | 'description' | 'parentRoleId' | 'sortOrder' | 'status'>>;

/**
 * 권한 요약 정보 (UI 표시용)
 */
export type PermissionSummary = Pick<Permission, 'id' | 'permissionName' | 'permissionType' | 'resource'>;

/**
 * 역활 요약 정보 (선택 박스용)
 */
export type RoleSummary = Pick<Role, 'id' | 'roleCode' | 'roleName' | 'roleType' | 'status'>;

/**
 * 사용자 요약 정보
 */
export type UserSummary = {
  id: UserId;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
};

// ===============================
// 통합 타입 집합 (편의성)
// ===============================

/**
 * 핵심 도메인 타입들
 */
export type CoreDomainTypes = {
  Role,
  Permission,
  RolePermission,
  UserRole,
  RoleWithPermissions,
  UserWithRoles,
  RoleHierarchy
};

/**
 * API 관련 타입들
 */
export type ApiTypes = {
  RoleApiService,
  PermissionApiService,
  UserRoleApiService,
  PermissionMatrixApiService,
  RoleAnalyticsApiService,
  RoleManagementApiService,
  RoleApiError,
  RoleWebSocketEvent
};

/**
 * UI 관련 타입들
 */
export type UITypes = {
  RoleFormDialogProps,
  PermissionAssignDialogProps,
  RoleDataGridProps,
  PermissionMatrixGridProps,
  RoleSearchFilterProps,
  RoleActionBarProps,
  RoleHierarchyTreeProps,
  UIState,
  DialogState
};

/**
 * 요청/응답 DTO 타입들
 */
export type DTOTypes = {
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePermissionRequest,
  UserRoleAssignRequest,
  ApiResponse,
  PageResponse,
  RoleStatistics
};

/**
 * 검색/필터링 타입들
 */
export type FilterTypes = {
  RoleSearchFilter,
  PermissionSearchFilter,
  RoleFilterField,
  AdvancedSearchOptions,
  PageInfo
};

// ===============================
// 기본값 상수들
// ===============================

/**
 * 기본 페이징 설정
 */
export const DEFAULT_PAGE_INFO: PageInfo = {
  page: 0,
  size: 20,
  sort: 'roleName',
  direction: 'asc'
};

/**
 * 기본 역활 검색 필터
 */
export const DEFAULT_ROLE_SEARCH_FILTER: RoleSearchFilter = {
  keyword: '',
  status: undefined,
  roleType: undefined,
  isSystemRole: undefined,
  hasPermissions: undefined
};

/**
 * 기본 로딩 상태
 */
export const DEFAULT_LOADING_STATE: LoadingState = {
  isLoading: false,
  isSubmitting: false,
  isDeleting: false,
  isExporting: false
};

/**
 * 기본 에러 상태
 */
export const DEFAULT_ERROR_STATE: ErrorState = {
  hasError: false,
  errorMessage: undefined,
  errorDetails: undefined,
  errorCode: undefined
};

/**
 * 기본 다이얼로그 상태
 */
export const DEFAULT_DIALOG_STATE: DialogState = {
  isOpen: false,
  type: 'create',
  title: '',
  data: undefined
};

// ===============================
// 주요 열거형 배열 (UI 옵션용)
// ===============================

/**
 * 역활 상태 옵션 배열
 */
export const ROLE_STATUS_OPTIONS = Object.entries(RoleStatus).map(([key, value]) => ({
  label: key,
  value: value
}));

/**
 * 역활 타입 옵션 배열
 */
export const ROLE_TYPE_OPTIONS = Object.entries(RoleType).map(([key, value]) => ({
  label: key,
  value: value
}));

/**
 * 권한 타입 옵션 배열
 */
export const PERMISSION_TYPE_OPTIONS = Object.entries(PermissionType).map(([key, value]) => ({
  label: key,
  value: value
}));

/**
 * 권한 액션 옵션 배열
 */
export const PERMISSION_ACTION_OPTIONS = Object.entries(PermissionAction).map(([key, value]) => ({
  label: key,
  value: value
}));