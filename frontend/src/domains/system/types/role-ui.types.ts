/**
 * 역활관리 UI 상태 및 컴포넌트 타입 정의
 *
 * @description UI 컴포넌트, 상태 관리, 폼 처리 타입
 * @based_on PositionMgmt.tsx 표준 템플릿 패턴
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import { ComponentProps, ReactNode } from 'react';
import { GridOptions, ColDef } from 'ag-grid-community';
import {
  Role,
  Permission,
  RoleWithPermissions,
  RoleSearchFilter,
  RoleStatistics,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFormErrors,
  PermissionMatrix,
  RoleId,
  PermissionId,
  UserId,
  RoleStatusType,
  RoleTypeType,
  PermissionTypeType,
  PageResponse
} from './role.types';

// ===============================
// 기본 UI 상태 타입
// ===============================

/**
 * 로딩 상태 타입
 */
export interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  isExporting: boolean;
  loadingMessage?: string;
}

/**
 * 에러 상태 타입
 */
export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorDetails?: string;
  errorCode?: string;
}

/**
 * UI 상태 통합 타입
 */
export interface UIState extends LoadingState, ErrorState {
  isInitialized: boolean;
  lastUpdated?: string;
}

// ===============================
// 다이얼로그 및 모달 타입
// ===============================

/**
 * 다이얼로그 상태 타입
 */
export interface DialogState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'assign' | 'permission' | 'view';
  title: string;
  data?: any;
}

/**
 * 역활 생성/편집 다이얼로그 props
 */
export interface RoleFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  role?: Role;
  parentRoles?: Role[];
  onClose: () => void;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
}

/**
 * 권한 할당 다이얼로그 props
 */
export interface PermissionAssignDialogProps {
  open: boolean;
  role: Role;
  availablePermissions: Permission[];
  assignedPermissions: Permission[];
  onClose: () => void;
  onAssign: (permissionIds: PermissionId[]) => Promise<void>;
  onRevoke: (permissionIds: PermissionId[]) => Promise<void>;
}

/**
 * 삭제 확인 다이얼로그 props
 */
export interface DeleteConfirmDialogProps {
  open: boolean;
  role: Role;
  hasUsers: boolean;
  hasChildRoles: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

// ===============================
// 테이블 및 그리드 타입
// ===============================

/**
 * AG-Grid 컬럼 정의 (역활 목록용)
 */
export type RoleGridColumnDef = ColDef<RoleWithPermissions>;

/**
 * 역활 테이블 컬럼 설정
 */
export interface RoleTableColumns {
  roleCode: RoleGridColumnDef;
  roleName: RoleGridColumnDef;
  roleType: RoleGridColumnDef;
  status: RoleGridColumnDef;
  permissionCount: RoleGridColumnDef;
  userCount: RoleGridColumnDef;
  createdAt: RoleGridColumnDef;
  actions: RoleGridColumnDef;
}

/**
 * 권한 매트릭스 컬럼 정의
 */
export interface PermissionMatrixColumn {
  permissionId: PermissionId;
  permissionName: string;
  permissionType: PermissionTypeType;
  resource: string;
}

/**
 * 권한 매트릭스 행 정의
 */
export interface PermissionMatrixRow {
  roleId: RoleId;
  roleName: string;
  roleType: RoleTypeType;
  permissions: Record<PermissionId, boolean>;
}

/**
 * 역활 데이터 그리드 props
 */
export interface RoleDataGridProps {
  data: RoleWithPermissions[];
  loading: boolean;
  selectedRoles: RoleId[];
  onSelectionChange: (selectedIds: RoleId[]) => void;
  onRowClick: (role: RoleWithPermissions) => void;
  onEditRole: (role: RoleWithPermissions) => void;
  onDeleteRole: (role: RoleWithPermissions) => void;
  onAssignPermissions: (role: RoleWithPermissions) => void;
  gridOptions?: Partial<GridOptions>;
}

/**
 * 권한 매트릭스 그리드 props
 */
export interface PermissionMatrixGridProps {
  roles: Role[];
  permissions: Permission[];
  matrix: PermissionMatrix[];
  loading: boolean;
  readOnly?: boolean;
  onPermissionToggle: (roleId: RoleId, permissionId: PermissionId, granted: boolean) => void;
  onBulkAssign: (roleIds: RoleId[], permissionIds: PermissionId[], granted: boolean) => void;
}

// ===============================
// 검색 및 필터링 UI 타입
// ===============================

/**
 * 검색 필터 필드 타입
 */
export interface RoleFilterField {
  key: keyof RoleSearchFilter;
  type: 'text' | 'select' | 'multiSelect' | 'date' | 'dateRange' | 'boolean';
  label: string;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

/**
 * 역활 검색 필터 컴포넌트 props
 */
export interface RoleSearchFilterProps {
  filters: RoleSearchFilter;
  onFiltersChange: (filters: RoleSearchFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
  fields?: RoleFilterField[];
}

/**
 * 고급 검색 옵션
 */
export interface AdvancedSearchOptions {
  searchInPermissions: boolean;
  searchInDescription: boolean;
  includeInactiveRoles: boolean;
  dateRangeType: 'created' | 'updated' | 'lastAccessed';
  sortBy: 'name' | 'created' | 'updated' | 'userCount';
  sortDirection: 'asc' | 'desc';
}

// ===============================
// 폼 관련 타입
// ===============================

/**
 * 역활 폼 상태
 */
export interface RoleFormState {
  data: CreateRoleRequest | UpdateRoleRequest;
  errors: RoleFormErrors;
  touched: Record<keyof (CreateRoleRequest | UpdateRoleRequest), boolean>;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * 역활 폼 컴포넌트 props
 */
export interface RoleFormProps {
  initialData?: Partial<CreateRoleRequest | UpdateRoleRequest>;
  parentRoles?: Role[];
  mode: 'create' | 'edit';
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  errors?: RoleFormErrors;
}

/**
 * 역활 코드 검증 결과
 */
export interface RoleCodeValidation {
  isChecking: boolean;
  isAvailable: boolean | null;
  message?: string;
}

// ===============================
// 통계 및 대시보드 타입
// ===============================

/**
 * 역활 통계 카드 데이터
 */
export interface RoleStatCard {
  id: string;
  title: string;
  value: number;
  icon: ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}

/**
 * 역활 통계 대시보드 props
 */
export interface RoleStatsDashboardProps {
  statistics: RoleStatistics;
  cards: RoleStatCard[];
  loading: boolean;
  onRefresh: () => void;
}

/**
 * 차트 데이터 타입
 */
export interface RoleChartData {
  rolesByType: Array<{ type: string; count: number; color: string }>;
  rolesByStatus: Array<{ status: string; count: number; color: string }>;
  permissionDistribution: Array<{ range: string; count: number }>;
  userRoleAssignments: Array<{ month: string; assignments: number; revocations: number }>;
}

// ===============================
// 액션 바 및 도구 모음 타입
// ===============================

/**
 * 액션 버튼 타입
 */
export interface ActionButton {
  id: string;
  label: string;
  icon?: ReactNode;
  variant: 'contained' | 'outlined' | 'text';
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  permissions?: string[];
}

/**
 * 역활 관리 액션 바 props
 */
export interface RoleActionBarProps {
  selectedCount: number;
  totalCount: number;
  onExportExcel: () => void;
  onCreateRole: () => void;
  onDeleteSelected: () => void;
  onBulkAssignPermissions: () => void;
  onRefresh: () => void;
  loading?: boolean;
  actions?: ActionButton[];
}

/**
 * 대량 작업 옵션
 */
export interface BulkActionOptions {
  action: 'delete' | 'activate' | 'deactivate' | 'assignPermissions' | 'revokePermissions';
  roleIds: RoleId[];
  permissionIds?: PermissionId[];
  confirmation: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  };
}

// ===============================
// 트리 및 계층 구조 타입
// ===============================

/**
 * 역활 계층 트리 노드
 */
export interface RoleTreeNode {
  role: Role;
  children: RoleTreeNode[];
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  path: string[];
}

/**
 * 역활 계층 트리 컴포넌트 props
 */
export interface RoleHierarchyTreeProps {
  roles: Role[];
  selectedRoleId?: RoleId;
  onRoleSelect: (role: Role) => void;
  onRoleMove: (roleId: RoleId, newParentId?: RoleId) => Promise<void>;
  allowDragDrop?: boolean;
  showPermissionCount?: boolean;
  showUserCount?: boolean;
}

// ===============================
// 테마 및 스타일링 타입
// ===============================

/**
 * 역활 상태별 색상 매핑
 */
export const ROLE_STATUS_COLORS: Record<RoleStatusType, string> = {
  ACTIVE: '#4caf50',
  INACTIVE: '#f44336',
  PENDING: '#ff9800',
  ARCHIVED: '#9e9e9e'
} as const;

/**
 * 역활 타입별 아이콘 매핑
 */
export const ROLE_TYPE_ICONS: Record<RoleTypeType, string> = {
  SYSTEM: 'SettingsApplications',
  CUSTOM: 'PersonOutline',
  INHERITED: 'AccountTree'
} as const;

/**
 * 권한 타입별 색상 매핑
 */
export const PERMISSION_TYPE_COLORS: Record<PermissionTypeType, string> = {
  MENU: '#2196f3',
  API: '#9c27b0',
  DATA: '#ff5722',
  SYSTEM: '#607d8b'
} as const;

// ===============================
// 접근성 및 키보드 네비게이션 타입
// ===============================

/**
 * 키보드 단축키 매핑
 */
export interface RoleKeyboardShortcuts {
  createRole: string;          // Ctrl+N
  editRole: string;            // Enter
  deleteRole: string;          // Delete
  search: string;              // Ctrl+F
  refresh: string;             // F5
  selectAll: string;           // Ctrl+A
  export: string;              // Ctrl+E
  bulkAssign: string;          // Ctrl+B
}

/**
 * 접근성 레이블
 */
export interface AccessibilityLabels {
  roleTable: string;
  permissionMatrix: string;
  searchForm: string;
  actionButtons: Record<string, string>;
  statusIndicators: Record<RoleStatusType, string>;
  screenReaderAnnouncements: {
    roleCreated: string;
    roleUpdated: string;
    roleDeleted: string;
    permissionAssigned: string;
    permissionRevoked: string;
  };
}

// ===============================
// 국제화(i18n) 타입
// ===============================

/**
 * 역활관리 번역 키 타입
 */
export interface RoleI18nKeys {
  // 제목 및 헤더
  pageTitle: string;
  pageDescription: string;

  // 액션
  actions: {
    create: string;
    edit: string;
    delete: string;
    assign: string;
    revoke: string;
    export: string;
    import: string;
    refresh: string;
    search: string;
    reset: string;
    save: string;
    cancel: string;
    confirm: string;
  };

  // 필드 라벨
  fields: {
    roleCode: string;
    roleName: string;
    description: string;
    roleType: string;
    status: string;
    parentRole: string;
    permissions: string;
    userCount: string;
    createdAt: string;
    updatedAt: string;
  };

  // 상태 및 타입
  roleTypes: Record<RoleTypeType, string>;
  roleStatuses: Record<RoleStatusType, string>;

  // 메시지
  messages: {
    success: {
      created: string;
      updated: string;
      deleted: string;
      permissionAssigned: string;
      permissionRevoked: string;
    };
    error: {
      loadFailed: string;
      createFailed: string;
      updateFailed: string;
      deleteFailed: string;
      permissionFailed: string;
    };
    confirmation: {
      deleteRole: string;
      deleteMultipleRoles: string;
      revokePermission: string;
    };
  };

  // 검증 메시지
  validation: {
    required: string;
    minLength: string;
    maxLength: string;
    duplicate: string;
    invalid: string;
  };
}

// ===============================
// 프로그레시브 웹 앱(PWA) 타입
// ===============================

/**
 * 오프라인 상태 관리
 */
export interface OfflineState {
  isOffline: boolean;
  pendingActions: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: string;
  }>;
  lastSyncAt?: string;
}

/**
 * 캐시 관리 옵션
 */
export interface CacheOptions {
  ttl: number;                 // Time to live in seconds
  maxSize: number;             // Maximum cache size
  enableBackground: boolean;   // Background refresh
  compressData: boolean;       // Data compression
}

// ===============================
// 성능 모니터링 타입
// ===============================

/**
 * 성능 메트릭
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  apiResponseTime: number;
  userInteractionDelay: number;
}

/**
 * 성능 모니터링 옵션
 */
export interface PerformanceMonitoringOptions {
  enabled: boolean;
  sampleRate: number;
  thresholds: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  };
}

// ===============================
// 내보내기 타입 집합
// ===============================

/**
 * 역활관리 UI 모든 타입
 */
export type RoleUITypes = {
  // 기본 상태
  UIState,
  LoadingState,
  ErrorState,
  DialogState,

  // 컴포넌트 Props
  RoleFormDialogProps,
  PermissionAssignDialogProps,
  DeleteConfirmDialogProps,
  RoleDataGridProps,
  PermissionMatrixGridProps,
  RoleSearchFilterProps,
  RoleFormProps,
  RoleStatsDashboardProps,
  RoleActionBarProps,
  RoleHierarchyTreeProps,

  // 데이터 구조
  RoleFilterField,
  RoleFormState,
  RoleStatCard,
  RoleChartData,
  ActionButton,
  BulkActionOptions,
  RoleTreeNode,
  PermissionMatrixColumn,
  PermissionMatrixRow,

  // 설정 및 옵션
  AdvancedSearchOptions,
  RoleCodeValidation,
  RoleKeyboardShortcuts,
  AccessibilityLabels,
  RoleI18nKeys,
  OfflineState,
  CacheOptions,
  PerformanceMetrics,
  PerformanceMonitoringOptions
};