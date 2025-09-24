/**
 * 메뉴관리 도메인 타입 정의
 *
 * @description 메뉴 트리 구조, 권한 관리, 폼 데이터 등의 타입 정의
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

// ===============================
// 기본 메뉴 인터페이스
// ===============================

/**
 * 메뉴 노드 인터페이스 (트리 구조)
 */
export interface MenuNode {
  id: string;
  menuName: string;
  description?: string;
  url?: string;
  parameters?: string;
  order: number;
  depth: number;
  parentId?: string;
  children: MenuNode[];
  systemCode: string;
  menuType: 'folder' | 'page' | 'link';
  isActive: boolean;
  isTestPage: boolean;
  requiresAuth: boolean;
  openInNewWindow: boolean;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * 메뉴 권한 인터페이스
 */
export interface MenuPermission {
  id: string;
  menuId: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  roleCategory: '최고관리자' | '관리자' | '사용자';
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  select: boolean;
  granted: boolean;
  extendedPermissionType?: string;
  extendedPermissionName?: string;
}

// ===============================
// 폼 데이터 인터페이스
// ===============================

/**
 * 메뉴 폼 데이터 인터페이스
 */
export interface MenuFormData {
  menuName: string;
  description: string;
  url: string;
  parameters: string;
  order: number;
  systemCode: string;
  menuType: 'folder' | 'page' | 'link';
  isActive: boolean;
  isTestPage: boolean;
  requiresAuth: boolean;
  openInNewWindow: boolean;
  icon: string;
  parentId?: string;
}

/**
 * 메뉴 검색 필터
 */
export interface MenuFilters {
  searchKeyword: string;
  menuType: string;
  isActive: string;
  requiresAuth: string;
  depth?: number;
  parentId?: string;
}

// ===============================
// UI 상태 인터페이스
// ===============================

/**
 * 메뉴 모달 상태
 */
export interface MenuModalState {
  addModal: boolean;
  editModal: boolean;
  detailModal: boolean;
  selectedMenu: MenuNode | null;
}

/**
 * 트리 상태 관리
 */
export interface TreeState {
  expandedNodes: Set<string>;
  selectedNode: string | null;
  searchResults: string[];
  searchTerm: string;
  draggedNode: MenuNode | null;
  dropTarget: MenuNode | null;
}

/**
 * 권한 테이블 상태
 */
export interface PermissionTableState {
  selectedPermissions: MenuPermission[];
  editingPermission: MenuPermission | null;
  bulkEditMode: boolean;
  conflictWarnings: ConflictWarning[];
}

/**
 * 권한 충돌 경고
 */
export interface ConflictWarning {
  id: string;
  type: 'hierarchy' | 'role_conflict' | 'system_required';
  message: string;
  severity: 'warning' | 'error';
  affectedRoles: string[];
}

// ===============================
// 페이지네이션 및 정렬
// ===============================

/**
 * 메뉴 페이지네이션
 */
export interface MenuPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/**
 * 메뉴 정렬 옵션
 */
export interface MenuSortOptions {
  field: 'order' | 'menuName' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// ===============================
// API 응답 인터페이스
// ===============================

/**
 * 메뉴 API 응답
 */
export interface MenuResponse {
  success: boolean;
  data: MenuNode[];
  message?: string;
  pagination?: MenuPagination;
}

/**
 * 권한 API 응답
 */
export interface PermissionResponse {
  success: boolean;
  data: MenuPermission[];
  message?: string;
}

// ===============================
// 드래그앤드롭 인터페이스
// ===============================

/**
 * 드래그앤드롭 이벤트 데이터
 */
export interface DragDropData {
  sourceNode: MenuNode;
  targetNode: MenuNode;
  position: 'before' | 'after' | 'inside';
  newOrder: number;
  newParentId?: string;
}

/**
 * 드롭 검증 결과
 */
export interface DropValidationResult {
  valid: boolean;
  reason?: string;
  maxDepthExceeded?: boolean;
  circularReference?: boolean;
}

// ===============================
// 상수 및 열거형
// ===============================

/**
 * 메뉴 타입 옵션
 */
export const MENU_TYPE_OPTIONS = [
  { value: 'folder', label: '폴더' },
  { value: 'page', label: '페이지' },
  { value: 'link', label: '링크' }
] as const;

/**
 * 사용 여부 옵션
 */
export const USE_YN_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'Y', label: '사용' },
  { value: 'N', label: '미사용' }
] as const;

/**
 * 권한 필요 여부 옵션
 */
export const AUTH_REQUIRED_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'Y', label: '필요' },
  { value: 'N', label: '불필요' }
] as const;

/**
 * 역할 카테고리별 색상 매핑
 */
export const ROLE_CATEGORY_COLOR_MAP = {
  '최고관리자': '#e53e3e',
  '관리자': '#3182ce',
  '사용자': '#38a169'
} as const;

/**
 * 메뉴 타입별 아이콘 매핑
 */
export const MENU_TYPE_ICON_MAP = {
  'folder': 'FolderOpenIcon',
  'page': 'ArticleIcon',
  'link': 'LinkIcon'
} as const;

// ===============================
// 목업 데이터 (개발용)
// ===============================

/**
 * 목업 메뉴 트리 데이터
 */
export const MOCK_MENU_TREE: MenuNode[] = [
  {
    id: '1',
    menuName: '홈',
    description: '메인 홈 화면',
    url: '/app/dashboard',
    parameters: '',
    order: 1,
    depth: 1,
    children: [],
    systemCode: 'HOME_MAIN',
    menuType: 'page',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
    icon: 'HomeIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },
  {
    id: '2',
    menuName: '책무구조도',
    description: '책무구조도 관리 메인',
    url: '',
    parameters: '',
    order: 2,
    depth: 1,
    children: [
      {
        id: '21',
        menuName: '원장관리',
        description: '책무구조도 원장 관리',
        url: '',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '2',
        children: [
          {
            id: '211',
            menuName: '직책관리',
            description: '조직 직책 관리',
            url: '/app/resps/positionmgmt',
            parameters: '',
            order: 1,
            depth: 3,
            parentId: '21',
            children: [],
            systemCode: 'POSITION_MGMT',
            menuType: 'page',
            isActive: true,
            isTestPage: false,
            requiresAuth: true,
            openInNewWindow: false,
            icon: 'PersonIcon',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            createdBy: '관리자',
            updatedBy: '관리자'
          },
          {
            id: '212',
            menuName: '직책겸직관리',
            description: '직책 겸직 관리',
            url: '/app/resps/positiondualmgmt',
            parameters: '',
            order: 2,
            depth: 3,
            parentId: '21',
            children: [],
            systemCode: 'POSITION_DUAL_MGMT',
            menuType: 'page',
            isActive: true,
            isTestPage: false,
            requiresAuth: true,
            openInNewWindow: false,
            icon: 'GroupIcon',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            createdBy: '관리자',
            updatedBy: '관리자'
          }
        ],
        systemCode: 'LEDGER_MGMT',
        menuType: 'folder',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        icon: 'FolderOpenIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'RESP_STRUCTURE',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
    icon: 'AccountTreeIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },
  {
    id: '3',
    menuName: '관리자',
    description: '시스템 관리 메뉴',
    url: '',
    parameters: '',
    order: 3,
    depth: 1,
    children: [
      {
        id: '31',
        menuName: '공통관리',
        description: '시스템 공통 관리',
        url: '',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '3',
        children: [
          {
            id: '311',
            menuName: '코드관리',
            description: '시스템 공통코드 관리',
            url: '/app/settings/system/code-mgmt',
            parameters: '',
            order: 1,
            depth: 3,
            parentId: '31',
            children: [],
            systemCode: 'CODE_MGMT',
            menuType: 'page',
            isActive: true,
            isTestPage: false,
            requiresAuth: true,
            openInNewWindow: false,
            icon: 'CodeIcon',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            createdBy: '관리자',
            updatedBy: '관리자'
          },
          {
            id: '312',
            menuName: '메뉴관리',
            description: '시스템 메뉴 관리',
            url: '/app/settings/system/menu-mgmt',
            parameters: '',
            order: 2,
            depth: 3,
            parentId: '31',
            children: [],
            systemCode: 'MENU_MGMT',
            menuType: 'page',
            isActive: true,
            isTestPage: false,
            requiresAuth: true,
            openInNewWindow: false,
            icon: 'MenuIcon',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            createdBy: '관리자',
            updatedBy: '관리자'
          }
        ],
        systemCode: 'COMMON_MGMT',
        menuType: 'folder',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        icon: 'SettingsIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'ADMIN',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
    icon: 'AdminPanelSettingsIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  }
];

/**
 * 목업 권한 데이터
 */
export const MOCK_PERMISSIONS: MenuPermission[] = [
  {
    id: '1',
    menuId: '312', // 메뉴관리
    roleId: '002',
    roleName: '최고관리자/준법감시인',
    roleCode: '002-준법감시',
    roleCategory: '최고관리자',
    view: true,
    create: true,
    update: true,
    delete: true,
    select: true,
    granted: true,
    extendedPermissionType: '전체권한',
    extendedPermissionName: '시스템 전체 권한'
  },
  {
    id: '2',
    menuId: '312',
    roleId: '101',
    roleName: '관리자/준법감시자',
    roleCode: '101-준법관리자',
    roleCategory: '관리자',
    view: true,
    create: true,
    update: true,
    delete: false,
    select: true,
    granted: true,
    extendedPermissionType: '제한권한',
    extendedPermissionName: '삭제 권한 제외'
  },
  {
    id: '3',
    menuId: '312',
    roleId: '801',
    roleName: '사용자/기본 사용자',
    roleCode: '801-일반',
    roleCategory: '사용자',
    view: true,
    create: false,
    update: false,
    delete: false,
    select: true,
    granted: true,
    extendedPermissionType: '조회권한',
    extendedPermissionName: '조회만 가능'
  }
];

// ===============================
// 유틸리티 타입
// ===============================

/**
 * 부분 메뉴 업데이트 타입
 */
export type MenuUpdate = Partial<Omit<MenuNode, 'id' | 'children'>>;

/**
 * 권한 업데이트 타입
 */
export type PermissionUpdate = Partial<Omit<MenuPermission, 'id' | 'menuId' | 'roleId'>>;

/**
 * 메뉴 생성 타입
 */
export type MenuCreate = Omit<MenuNode, 'id' | 'children' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;