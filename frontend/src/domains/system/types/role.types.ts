/**
 * 역활관리 시스템 TypeScript 타입 정의
 *
 * @description DB 설계서 기반 RBAC 타입 시스템
 * @based_on database/scripts - roles, permissions, role_permissions 테이블
 * @author Claude AI
 * @version 2.0.0
 * @created 2025-09-24
 * @updated 2025-12-04
 */

// ===============================
// 기본 타입 정의
// ===============================

/**
 * 역활 ID 타입 (BIGSERIAL)
 */
export type RoleId = string;

/**
 * 권한 ID 타입 (BIGSERIAL)
 */
export type PermissionId = string;

/**
 * 사용자 ID 타입 (BIGSERIAL)
 */
export type UserId = string;

// ===============================
// 역활 관련 타입 (roles 테이블 기반)
// ===============================

/**
 * 역활 상태 열거형
 * - roles.status 컬럼
 */
export const RoleStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED'
} as const;

export type RoleStatusType = typeof RoleStatus[keyof typeof RoleStatus];

/**
 * 역활 타입 열거형
 * - roles.role_type 컬럼
 */
export const RoleType = {
  SYSTEM: 'SYSTEM',     // 시스템 기본 역활
  CUSTOM: 'CUSTOM'      // 사용자 정의 역활
} as const;

export type RoleTypeType = typeof RoleType[keyof typeof RoleType];

/**
 * 역활 카테고리 열거형
 * - roles.role_category 컬럼
 */
export const RoleCategory = {
  TOP_ADMIN: '최고관리자',
  ADMIN: '관리자',
  USER: '사용자'
} as const;

export type RoleCategoryType = typeof RoleCategory[keyof typeof RoleCategory];

/**
 * 역활 엔티티 인터페이스
 * - roles 테이블 구조 기반
 */
export interface Role {
  id: RoleId;                    // role_id (PK)
  roleCode: string;              // role_code (예: 001, 101, 201)
  roleName: string;              // role_name (예: CEO, 최고관리자/준법감시인)
  description?: string;          // description
  roleType: RoleTypeType;        // role_type (SYSTEM, CUSTOM)
  roleCategory?: RoleCategoryType; // role_category (최고관리자, 관리자, 사용자)
  parentRoleId?: RoleId;         // parent_role_id (계층 구조)
  sortOrder: number;             // sort_order
  status: RoleStatusType;        // status (ACTIVE, INACTIVE, ARCHIVED)
  isSystemRole: boolean;         // is_system_role ('Y', 'N')
  createdAt: string;             // created_at
  updatedAt: string;             // updated_at
  createdBy?: string;            // created_by
  updatedBy?: string;            // updated_by
}

/**
 * 역활 생성 요청 DTO
 * - roles 테이블 필수 컬럼 포함
 */
export interface CreateRoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  roleType: RoleTypeType;
  roleCategory?: RoleCategoryType;  // 역활 카테고리 추가
  parentRoleId?: RoleId;
  sortOrder?: number;
  status?: RoleStatusType;          // 상태 추가
  isSystemRole?: boolean;           // 시스템 역활 여부 추가
}

/**
 * 역활 수정 요청 DTO
 * - roles 테이블 수정 가능 컬럼 포함
 */
export interface UpdateRoleRequest {
  roleName?: string;
  description?: string;
  roleType?: RoleTypeType;
  roleCategory?: RoleCategoryType;  // 역활 카테고리 추가
  parentRoleId?: RoleId;
  sortOrder?: number;
  status?: RoleStatusType;
  isSystemRole?: boolean;           // 시스템 역활 여부 추가
}

// ===============================
// 권한 관련 타입
// ===============================

/**
 * 권한 타입 열거형
 */
export const PermissionType = {
  MENU: 'MENU',           // 메뉴 접근 권한
  API: 'API',             // API 호출 권한
  DATA: 'DATA',           // 데이터 조작 권한
  SYSTEM: 'SYSTEM'        // 시스템 관리 권한
} as const;

export type PermissionTypeType = typeof PermissionType[keyof typeof PermissionType];

/**
 * 권한 액션 열거형
 */
export const PermissionAction = {
  CREATE: 'CREATE',       // 생성
  READ: 'READ',          // 조회
  UPDATE: 'UPDATE',      // 수정
  DELETE: 'DELETE',      // 삭제
  EXECUTE: 'EXECUTE',    // 실행
  APPROVE: 'APPROVE',    // 승인
  REJECT: 'REJECT'       // 반려
} as const;

export type PermissionActionType = typeof PermissionAction[keyof typeof PermissionAction];

/**
 * Y/N 플래그 타입 (DB에서 VARCHAR(1)로 저장)
 */
export type YNFlag = 'Y' | 'N';

/**
 * 확장 권한 유형
 */
export type ExtendedPermissionType = '전체권한' | '제한권한' | '조회권한';

/**
 * 권한 엔티티 인터페이스
 * - permissions 테이블 구조 기반
 */
export interface Permission {
  id: PermissionId;               // permission_id (PK)
  permissionCode: string;         // permission_code (예: A01, A99, U01)
  permissionName: string;         // permission_name (예: 운영관리자, 시스템관리자)
  description?: string;           // description
  menuId: number;                 // menu_id (연결된 메뉴, NOT NULL)
  sortOrder: number;              // sort_order

  // 업무 권한 유형 (permissions 테이블 컬럼, 'Y'/'N' 문자열)
  businessPermission: YNFlag;     // business_permission - 역활유형 (Y: 업무, N: 일반)
  mainBusinessPermission: YNFlag; // main_business_permission - 본점기본
  executionPermission: YNFlag;    // execution_permission - 영업점기본

  // CRUD 권한 ('Y'/'N' 문자열)
  canView: YNFlag;                // can_view - 조회 권한
  canCreate: YNFlag;              // can_create - 생성 권한
  canUpdate: YNFlag;              // can_update - 수정 권한
  canDelete: YNFlag;              // can_delete - 삭제 권한
  canSelect: YNFlag;              // can_select - 선택 권한

  // 확장 권한
  extendedPermissionType?: ExtendedPermissionType; // extended_permission_type
  extendedPermissionName?: string; // extended_permission_name

  isActive: YNFlag;               // is_active ('Y', 'N')
  isDeleted?: YNFlag;             // is_deleted ('Y', 'N')
  createdAt?: string;             // created_at
  updatedAt?: string;             // updated_at
  createdBy?: string;             // created_by
  updatedBy?: string;             // updated_by
}

// ===============================
// 역활-권한 관계 타입
// ===============================

/**
 * 역활 권한 매핑 인터페이스
 */
export interface RolePermission {
  roleId: RoleId;
  permissionId: PermissionId;
  grantedAt: string;             // 권한 부여일시
  grantedBy: UserId;             // 권한 부여자 ID
  expiresAt?: string;            // 권한 만료일시 (선택사항)
}

/**
 * 역활 권한 부여/해제 요청 DTO
 */
export interface RolePermissionRequest {
  roleId: RoleId;
  permissionIds: PermissionId[];
  expiresAt?: string;
}

// ===============================
// 사용자-역활 관계 타입
// ===============================

/**
 * 사용자 역활 매핑 인터페이스
 */
export interface UserRole {
  userId: UserId;
  roleId: RoleId;
  assignedAt: string;            // 역활 할당일시
  assignedBy: UserId;            // 역활 할당자 ID
  expiresAt?: string;            // 역활 만료일시 (선택사항)
}

/**
 * 사용자 역활 할당 요청 DTO
 */
export interface UserRoleAssignRequest {
  userId: UserId;
  roleIds: RoleId[];
  expiresAt?: string;
}

// ===============================
// 조회용 복합 타입
// ===============================

/**
 * 권한이 포함된 역활 상세 정보
 * - RoleMgmt 화면에서 사용하는 확장 타입
 */
export interface RoleWithPermissions extends Role {
  permissions: Permission[];      // 연결된 권한 목록
  userCount?: number;            // 해당 역활을 가진 사용자 수
  childRoles?: Role[];           // 하위 역활 목록 (계층형 구조)
  detailRoleCount?: number;      // 상세역활(권한) 수 - UI 표시용
}

/**
 * 역활이 포함된 사용자 정보
 */
export interface UserWithRoles {
  id: UserId;
  username: string;
  fullName: string;
  email: string;
  roles: Role[];                 // 사용자가 가진 역활 목록
  permissions: Permission[];     // 모든 역활의 통합 권한 목록
}

/**
 * 역활 계층 구조 정보
 */
export interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];     // 하위 역활들
  level: number;                 // 계층 레벨
}

// ===============================
// 검색 및 필터링 타입
// ===============================

/**
 * 역활 검색 필터
 */
export interface RoleSearchFilter {
  keyword?: string;              // 검색 키워드
  roleType?: RoleTypeType;       // 역활 타입 필터
  status?: RoleStatusType;       // 상태 필터
  parentRoleId?: RoleId;         // 부모 역활 ID 필터
  isSystemRole?: boolean;        // 시스템 역활 여부 필터
  hasPermissions?: boolean;      // 권한 보유 여부 필터
  createdAfter?: string;         // 생성일 이후 필터
  createdBefore?: string;        // 생성일 이전 필터
}

/**
 * 권한 검색 필터
 */
export interface PermissionSearchFilter {
  keyword?: string;              // 검색 키워드
  permissionType?: PermissionTypeType; // 권한 타입 필터
  resource?: string;             // 리소스 필터
  actions?: PermissionActionType[]; // 액션 필터
  isSystemPermission?: boolean;  // 시스템 권한 여부 필터
}

/**
 * 페이징 정보 타입
 */
export interface PageInfo {
  page: number;                  // 현재 페이지 (0부터 시작)
  size: number;                  // 페이지 크기
  sort?: string;                 // 정렬 기준
  direction?: 'asc' | 'desc';    // 정렬 방향
}

/**
 * 페이징 응답 타입
 */
export interface PageResponse<T> {
  content: T[];                  // 데이터 목록
  totalElements: number;         // 전체 요소 수
  totalPages: number;            // 전체 페이지 수
  currentPage: number;           // 현재 페이지
  size: number;                  // 페이지 크기
  first: boolean;                // 첫 페이지 여부
  last: boolean;                 // 마지막 페이지 여부
}

// ===============================
// API 응답 타입
// ===============================

/**
 * API 기본 응답 타입
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

/**
 * 역활 목록 조회 응답
 */
export type RoleListResponse = ApiResponse<PageResponse<RoleWithPermissions>>;

/**
 * 역활 상세 조회 응답
 */
export type RoleDetailResponse = ApiResponse<RoleWithPermissions>;

/**
 * 권한 목록 조회 응답
 */
export type PermissionListResponse = ApiResponse<PageResponse<Permission>>;

/**
 * 역활 통계 정보
 */
export interface RoleStatistics {
  totalRoles: number;            // 전체 역활 수
  activeRoles: number;           // 활성 역활 수
  systemRoles: number;           // 시스템 역활 수
  customRoles: number;           // 사용자 정의 역활 수
  rolesWithoutPermissions: number; // 권한이 없는 역활 수
}

/**
 * 역활 통계 응답
 */
export type RoleStatisticsResponse = ApiResponse<RoleStatistics>;

// ===============================
// 폼 검증 타입
// ===============================

/**
 * 역활 생성 폼 검증 스키마
 */
export interface RoleFormValidation {
  roleCode: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
  };
  roleName: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  description: {
    maxLength: number;
  };
}

/**
 * 역활 폼 에러 타입
 */
export interface RoleFormErrors {
  roleCode?: string;
  roleName?: string;
  description?: string;
  roleType?: string;
  parentRoleId?: string;
  sortOrder?: string;
}

// ===============================
// 권한 체크 유틸리티 타입
// ===============================

/**
 * 권한 체크 결과 타입
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  requiredPermissions: string[];
  userPermissions: string[];
  missingPermissions: string[];
}

/**
 * 권한 매트릭스 타입 (UI 테이블용)
 */
export interface PermissionMatrix {
  roleId: RoleId;
  roleName: string;
  permissions: Record<PermissionId, boolean>; // 권한 ID별 보유 여부
}

// ===============================
// 내보내기 타입 집합
// ===============================

/**
 * 역활관리 시스템 모든 타입
 */
export type RoleManagementTypes = {
  // 기본 엔티티
  Role,
  Permission,
  RolePermission,
  UserRole,

  // 상세 정보 포함 타입
  RoleWithPermissions,
  UserWithRoles,
  RoleHierarchy,

  // 검색 및 필터
  RoleSearchFilter,
  PermissionSearchFilter,
  PageInfo,
  PageResponse,

  // API 응답
  ApiResponse,
  RoleListResponse,
  RoleDetailResponse,
  PermissionListResponse,
  RoleStatisticsResponse,

  // 요청 DTO
  CreateRoleRequest,
  UpdateRoleRequest,
  RolePermissionRequest,
  UserRoleAssignRequest,

  // 기타
  RoleStatistics,
  RoleFormValidation,
  RoleFormErrors,
  PermissionCheckResult,
  PermissionMatrix
};