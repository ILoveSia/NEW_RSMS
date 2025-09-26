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
  dashboardLayout: boolean; // 대시보드 레이아웃 사용 여부
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
 * 목업 메뉴 트리 데이터 - RSMS 시스템 전체 메뉴 구조
 */
export const MOCK_MENU_TREE: MenuNode[] = [
  // 01. 대시보드
  {
    id: '01',
    menuName: '대시보드',
    description: '시스템 대시보드',
    url: '',
    parameters: '',
    order: 1,
    depth: 1,
    children: [
      {
        id: '0101',
        menuName: '대시보드',
        description: '메인 대시보드 화면',
        url: '/app/dashboard',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '01',
        children: [],
        systemCode: 'DASHBOARD_MAIN',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: true,
        icon: 'DashboardIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'DASHBOARD',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
    dashboardLayout: false,
    icon: 'DashboardIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 02. 책무구조도 원장 관리
  {
    id: '02',
    menuName: '책무구조도 원장 관리',
    description: '책무구조도 원장 관리 메인',
    url: '',
    parameters: '',
    order: 2,
    depth: 1,
    children: [
      {
        id: '0201',
        menuName: '직책관리',
        description: '조직 직책 관리',
        url: '/app/resps/positionmgmt',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'POSITION_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'PersonIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0202',
        menuName: '직책겸직관리',
        description: '직책 겸직 관리',
        url: '/app/resps/positiondualmgmt',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'POSITION_DUAL_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'GroupWorkIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0203',
        menuName: '회의체관리',
        description: '회의체 관리',
        url: '/app/resps/committmgmt',
        parameters: '',
        order: 3,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'COMMITTEE_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'GroupsIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0204',
        menuName: '책무관리',
        description: '책무 관리',
        url: '/app/resps/respmgmt',
        parameters: '',
        order: 4,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'RESPONSIBILITY_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'AssignmentIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0205',
        menuName: '책무기술서관리',
        description: '책무 기술서 관리',
        url: '/app/resps/respdocmgmt',
        parameters: '',
        order: 5,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'RESP_DOCUMENT_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'DescriptionIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0206',
        menuName: '이사회이력관리',
        description: '이사회 이력 관리',
        url: '/app/resps/boardhistmgmt',
        parameters: '',
        order: 6,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'BOARD_HISTORY_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'HistoryIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0207',
        menuName: '임원정보관리',
        description: '임원 정보 관리',
        url: '/app/resps/executivemgmt',
        parameters: '',
        order: 7,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'EXECUTIVE_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'PersonIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0208',
        menuName: '부서장업무메뉴얼관리',
        description: '부서장 업무 메뉴얼 관리',
        url: '/app/resps/deptmanualmgmt',
        parameters: '',
        order: 8,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'DEPT_MANUAL_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'MenuBookIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0209',
        menuName: 'CEO총괄관리의무조회',
        description: 'CEO 총괄관리의무 조회',
        url: '/app/resps/ceodutyinquiry',
        parameters: '',
        order: 9,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'CEO_DUTY_INQUIRY',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'SearchIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0210',
        menuName: '직책/책무 이력',
        description: '직책/책무 이력 관리',
        url: '/app/resps/resphistory',
        parameters: '',
        order: 10,
        depth: 2,
        parentId: '02',
        children: [],
        systemCode: 'RESP_HISTORY',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'HistoryIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'RESP_LEDGER_MGMT',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
    icon: 'AccountTreeIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 03. 책무구조도 관리 활동
  {
    id: '03',
    menuName: '책무구조도 관리 활동',
    description: '책무구조도 관리 활동',
    url: '',
    parameters: '',
    order: 3,
    depth: 1,
    children: [
      {
        id: '0301',
        menuName: '수행자지정',
        description: '관리활동 수행자 지정',
        url: '/app/activities/performerassign',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '03',
        children: [],
        systemCode: 'PERFORMER_ASSIGN',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'AssignmentIndIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0302',
        menuName: '관리활동 수행',
        description: '관리활동 수행',
        url: '/app/activities/perform',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '03',
        children: [],
        systemCode: 'ACTIVITY_PERFORM',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'PlayArrowIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0303',
        menuName: '업무메뉴얼조회',
        description: '업무 메뉴얼 조회',
        url: '/app/activities/manualinquiry',
        parameters: '',
        order: 3,
        depth: 2,
        parentId: '03',
        children: [],
        systemCode: 'MANUAL_INQUIRY',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'FindInPageIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0304',
        menuName: '내부통제장치등록',
        description: '내부통제장치 등록',
        url: '/app/activities/controlregister',
        parameters: '',
        order: 4,
        depth: 2,
        parentId: '03',
        children: [],
        systemCode: 'CONTROL_REGISTER',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'AddBoxIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0305',
        menuName: '내부통제장치관리',
        description: '내부통제장치 관리',
        url: '/app/activities/controlmgmt',
        parameters: '',
        order: 5,
        depth: 2,
        parentId: '03',
        children: [],
        systemCode: 'CONTROL_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'SettingsIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'RESP_ACTIVITIES',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
    icon: 'FactCheckIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 04. 이행점검 관리
  {
    id: '04',
    menuName: '이행점검 관리',
    description: '이행점검 관리',
    url: '',
    parameters: '',
    order: 4,
    depth: 1,
    children: [
      {
        id: '0401',
        menuName: '기간설정',
        description: '점검 기간 설정',
        url: '/app/inspection/periodsetting',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '04',
        children: [],
        systemCode: 'PERIOD_SETTING',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'DateRangeIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0402',
        menuName: '점검자지정',
        description: '점검자 지정',
        url: '/app/inspection/inspectorassign',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '04',
        children: [],
        systemCode: 'INSPECTOR_ASSIGN',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'PersonAddIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0403',
        menuName: '점검수행 및 결재',
        description: '점검 수행 및 결재',
        url: '/app/inspection/performapproval',
        parameters: '',
        order: 3,
        depth: 2,
        parentId: '04',
        children: [],
        systemCode: 'INSPECTION_PERFORM_APPROVAL',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'RuleIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0404',
        menuName: '반려관리',
        description: '반려 관리',
        url: '/app/inspection/rejectionmgmt',
        parameters: '',
        order: 4,
        depth: 2,
        parentId: '04',
        children: [],
        systemCode: 'REJECTION_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'ThumbDownIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'INSPECTION_MGMT',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
    icon: 'FactCheckIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 05. 이행점검보고서
  {
    id: '05',
    menuName: '이행점검보고서',
    description: '이행점검보고서',
    url: '',
    parameters: '',
    order: 5,
    depth: 1,
    children: [
      {
        id: '0501',
        menuName: '임원이행점검보고서',
        description: '임원 이행점검 보고서',
        url: '/app/reports/executivereport',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '05',
        children: [],
        systemCode: 'EXECUTIVE_INSPECTION_REPORT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'AssessmentIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0502',
        menuName: 'CEO이행점검보고서',
        description: 'CEO 이행점검 보고서',
        url: '/app/reports/ceoreport',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '05',
        children: [],
        systemCode: 'CEO_INSPECTION_REPORT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'AssessmentIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0503',
        menuName: '보고서목록',
        description: '보고서 목록',
        url: '/app/reports/reportlist',
        parameters: '',
        order: 3,
        depth: 2,
        parentId: '05',
        children: [],
        systemCode: 'REPORT_LIST',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'ListIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'INSPECTION_REPORTS',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
    icon: 'SummarizeIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 06. 개선이행
  {
    id: '06',
    menuName: '개선이행',
    description: '개선이행',
    url: '',
    parameters: '',
    order: 6,
    depth: 1,
    children: [
      {
        id: '0601',
        menuName: '관리활동/이행점검/개선이행',
        description: '관리활동/이행점검/개선이행',
        url: '/app/improvement/comprehensive',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '06',
        children: [],
        systemCode: 'COMPREHENSIVE_IMPROVEMENT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'TrendingUpIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0602',
        menuName: '이행점검 보고서 개선이행',
        description: '이행점검 보고서 개선이행',
        url: '/app/improvement/reportimprove',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '06',
        children: [],
        systemCode: 'REPORT_IMPROVEMENT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'AutoFixHighIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'IMPROVEMENT',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
    icon: 'TrendingUpIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 07. 결재관리
  {
    id: '07',
    menuName: '결재관리',
    description: '결재관리',
    url: '',
    parameters: '',
    order: 7,
    depth: 1,
    children: [
      {
        id: '0701',
        menuName: '결재함',
        description: '결재함',
        url: '/app/approval/approvalbox',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '07',
        children: [],
        systemCode: 'APPROVAL_BOX',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'MarkunreadMailboxIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0702',
        menuName: '결재선관리',
        description: '결재선 관리',
        url: '/app/approval/approvallinemgmt',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '07',
        children: [],
        systemCode: 'APPROVAL_LINE_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'TimelineIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'APPROVAL_MGMT',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
    icon: 'ApprovalIcon',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: '관리자',
    updatedBy: '관리자'
  },

  // 08. 시스템 관리
  {
    id: '08',
    menuName: '시스템 관리',
    description: '시스템 관리',
    url: '',
    parameters: '',
    order: 8,
    depth: 1,
    children: [
      {
        id: '0801',
        menuName: '사용자관리',
        description: '사용자 관리',
        url: '/app/settings/system/user-mgmt',
        parameters: '',
        order: 1,
        depth: 2,
        parentId: '08',
        children: [],
        systemCode: 'USER_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'PersonIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0802',
        menuName: '메뉴관리',
        description: '시스템 메뉴 관리',
        url: '/app/settings/system/menu-mgmt',
        parameters: '',
        order: 2,
        depth: 2,
        parentId: '08',
        children: [],
        systemCode: 'MENU_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'MenuIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0803',
        menuName: '접근로그',
        description: '시스템 접근 로그',
        url: '/app/settings/system/access-log',
        parameters: '',
        order: 3,
        depth: 2,
        parentId: '08',
        children: [],
        systemCode: 'ACCESS_LOG',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'HistoryIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      },
      {
        id: '0804',
        menuName: '코드관리',
        description: '시스템 공통코드 관리',
        url: '/app/settings/system/code-mgmt',
        parameters: '',
        order: 4,
        depth: 2,
        parentId: '08',
        children: [],
        systemCode: 'CODE_MGMT',
        menuType: 'page',
        isActive: true,
        isTestPage: false,
        requiresAuth: true,
        openInNewWindow: false,
        dashboardLayout: false,
        icon: 'CodeIcon',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        createdBy: '관리자',
        updatedBy: '관리자'
      }
    ],
    systemCode: 'SYSTEM_MGMT',
    menuType: 'folder',
    isActive: true,
    isTestPage: false,
    requiresAuth: true,
    openInNewWindow: false,
        dashboardLayout: false,
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
    menuId: '0802', // 메뉴관리
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
    menuId: '0802',
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
    menuId: '0802',
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
  },
  // 추가 메뉴들의 권한 예시 데이터
  {
    id: '4',
    menuId: '0201', // 직책관리
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
    id: '5',
    menuId: '0201', // 직책관리
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
    id: '6',
    menuId: '0101', // 대시보드
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