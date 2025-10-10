/**
 * 코드관리 타입 정의
 *
 * @description 코드관리 화면에서 사용되는 모든 타입을 정의
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

// ===============================
// Base Types & Enums
// ===============================

/**
 * 사용여부 열거형
 */
export type UseYN = 'Y' | 'N';

/**
 * 코드 분류 타입
 */
export type CodeCategoryType = 'SYSTEM' | 'BUSINESS' | 'COMMON';

/**
 * 코드 분류 (구분) 열거형
 */
export type CodeCategory = '시스템 공통' | '미선택' | '책무구조';

/**
 * 코드 분류 라벨 매핑
 */
export const CODE_CATEGORY_LABELS: Record<CodeCategory, string> = {
  '시스템 공통': '시스템 공통',
  '미선택': '미선택',
  '책무구조': '책무구조'
};

// ===============================
// Core Domain Types
// ===============================

/**
 * 코드 그룹 기본 인터페이스 (좌측 그리드)
 */
export interface CodeGroup {
  /** 상태 (저장/수정) */
  status?: '저장' | '수정';

  /** 그룹코드 ID */
  groupCode: string;

  /** 그룹코드명 */
  groupName: string;

  /** 설명 */
  description?: string;

  /** 구분 (시스템 공통/미선택/책무구조) */
  category: CodeCategory;

  /** 카테고리 코드 */
  categoryCode: string;

  /** 시스템 코드 여부 */
  systemCode: boolean;

  /** 수정 가능 여부 */
  editable: boolean;

  /** 정렬 순서 */
  sortOrder: number;

  /** 사용여부 */
  isActive: UseYN;

  /** 생성일시 */
  createdAt: string;

  /** 수정일시 */
  updatedAt: string;

  /** 생성자 */
  createdBy: string;

  /** 수정자 */
  updatedBy: string;
}

/**
 * 코드 상세 인터페이스 (우측 그리드)
 */
export interface CodeDetail {
  /** 상태 (저장/수정) */
  status?: '저장' | '수정';

  /** 그룹코드 */
  groupCode: string;

  /** 상세코드 */
  detailCode: string;

  /** 상세코드명 */
  detailName: string;

  /** 설명 */
  description?: string;

  /** 부모 코드 */
  parentCode?: string;

  /** 레벨 깊이 */
  levelDepth: number;

  /** 정렬 순서 */
  sortOrder: number;

  /** 확장 속성1 */
  extAttr1?: string;

  /** 확장 속성2 */
  extAttr2?: string;

  /** 확장 속성3 */
  extAttr3?: string;

  /** 추가 데이터 (JSON) */
  extraData?: Record<string, any>;

  /** 유효 시작일 */
  validFrom?: string;

  /** 유효 종료일 */
  validUntil?: string;

  /** 사용여부 */
  isActive: UseYN;

  /** 생성일시 */
  createdAt: string;

  /** 수정일시 */
  updatedAt: string;

  /** 생성자 */
  createdBy: string;

  /** 수정자 */
  updatedBy: string;
}

/**
 * 코드 그룹 폼 데이터 인터페이스
 */
export interface CodeGroupFormData {
  /** 그룹코드 */
  groupCode: string;

  /** 그룹코드명 */
  groupName: string;

  /** 설명 */
  description?: string;

  /** 구분 */
  category: CodeCategory;

  /** 정렬 순서 */
  sortOrder: number;

  /** 수정 가능 여부 */
  editable: boolean;

  /** 사용여부 */
  isActive: UseYN;
}

/**
 * 코드 상세 폼 데이터 인터페이스
 */
export interface CodeDetailFormData {
  /** 상세코드 */
  detailCode: string;

  /** 상세코드명 */
  detailName: string;

  /** 설명 */
  description?: string;

  /** 부모 코드 */
  parentCode?: string;

  /** 정렬 순서 */
  sortOrder: number;

  /** 확장 속성1 */
  extAttr1?: string;

  /** 확장 속성2 */
  extAttr2?: string;

  /** 확장 속성3 */
  extAttr3?: string;

  /** 유효 시작일 */
  validFrom?: string;

  /** 유효 종료일 */
  validUntil?: string;

  /** 사용여부 */
  isActive: UseYN;
}

// ===============================
// Filter & Search Types
// ===============================

/**
 * 코드 필터링 인터페이스
 */
export interface CodeFilters {
  /** 그룹코드 검색 */
  groupCode?: string;

  /** 구분 필터 */
  category?: CodeCategory | '';

  /** 검색 키워드 */
  searchKeyword?: string;

  /** 사용여부 */
  isActive?: UseYN | '';

  /** 인덱스 시그니처 (BaseSearchFilter 호환성) */
  [key: string]: string | undefined;
}

// ===============================
// UI State Types
// ===============================

/**
 * 모달 상태 관리 인터페이스
 */
export interface CodeModalState {
  /** 그룹 모달 열림 상태 */
  groupModal: boolean;

  /** 상세 모달 열림 상태 */
  detailModal: boolean;

  /** 모달 모드 ('create' | 'edit' | 'detail') */
  mode: 'create' | 'edit' | 'detail';

  /** 편집 대상 그룹 데이터 */
  groupData: CodeGroup | null;

  /** 편집 대상 상세 데이터 */
  detailData: CodeDetail | null;
}

/**
 * 페이지네이션 인터페이스
 */
export interface CodePagination {
  /** 현재 페이지 */
  page: number;

  /** 페이지당 항목 수 */
  pageSize: number;

  /** 전체 항목 수 */
  totalCount: number;

  /** 전체 페이지 수 */
  totalPages: number;
}

/**
 * 정렬 정보 인터페이스
 */
export interface CodeSorting {
  /** 정렬 대상 필드 */
  field: keyof CodeGroup | keyof CodeDetail;

  /** 정렬 방향 */
  direction: 'asc' | 'desc';
}

/**
 * 좌우 분할 레이아웃 상태
 */
export interface SplitLayoutState {
  /** 좌측 선택된 코드 그룹 */
  selectedCodeGroup: CodeGroup | null;

  /** 좌측 그리드 로딩 상태 */
  leftLoading: boolean;

  /** 우측 상세 로딩 상태 */
  rightLoading: boolean;
}

// ===============================
// API Response Types
// ===============================

/**
 * 코드 그룹 목록 조회 응답
 */
export interface CodeGroupListResponse {
  /** 코드 그룹 목록 */
  items: CodeGroup[];

  /** 페이지네이션 정보 */
  pagination: CodePagination;

  /** 응답 메시지 */
  message?: string;
}

/**
 * 코드 상세 목록 조회 응답
 */
export interface CodeDetailListResponse {
  /** 코드 상세 목록 */
  items: CodeDetail[];

  /** 페이지네이션 정보 */
  pagination: CodePagination;

  /** 응답 메시지 */
  message?: string;
}

/**
 * 코드 생성/수정 응답
 */
export interface CodeMutationResponse {
  /** 성공 여부 */
  success: boolean;

  /** 코드 정보 */
  item?: CodeGroup | CodeDetail;

  /** 응답 메시지 */
  message: string;
}

// ===============================
// Mock Data & Options
// ===============================

/**
 * 셀렉트 박스 옵션 인터페이스
 */
export interface SelectOption {
  /** 값 */
  value: string;

  /** 라벨 */
  label: string;
}

/**
 * 구분 옵션
 */
export const CATEGORY_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: '시스템 공통', label: '시스템 공통' },
  { value: '미선택', label: '미선택' },
  { value: '책무구조', label: '책무구조' }
];

/**
 * 사용여부 옵션
 */
export const USE_YN_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'Y', label: '사용' },
  { value: 'N', label: '미사용' }
];

/**
 * Mock 코드 그룹 데이터 (공통코드.txt 기반)
 */
export const MOCK_CODE_GROUPS: CodeGroup[] = [
  // 시스템 공통 (20개)
  {
    groupCode: 'CD_DVCD',
    groupName: '코드 구분코드',
    description: '코드 분류를 위한 구분 코드',
    category: '시스템 공통',
    categoryCode: 'SYSTEM',
    systemCode: true,
    editable: false,
    sortOrder: 1,
    isActive: 'Y',
    createdAt: '2025-09-01 09:00:00',
    updatedAt: '2025-09-20 14:30:00',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    groupCode: 'AUTH_EXT_TYCD',
    groupName: '확장 권한 유형코드',
    description: '확장된 권한 유형을 관리하는 코드',
    category: '시스템 공통',
    categoryCode: 'SYSTEM',
    systemCode: true,
    editable: false,
    sortOrder: 2,
    isActive: 'Y',
    createdAt: '2025-09-01 09:15:00',
    updatedAt: '2025-09-18 16:20:00',
    createdBy: 'admin',
    updatedBy: 'manager'
  },
  {
    groupCode: 'BZWK_KNCD',
    groupName: '업무 종류코드',
    description: '업무 분류를 위한 종류 코드',
    category: '시스템 공통',
    categoryCode: 'SYSTEM',
    systemCode: true,
    editable: false,
    sortOrder: 3,
    isActive: 'Y',
    createdAt: '2025-09-01 10:00:00',
    updatedAt: '2025-09-15 11:45:00',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  // 미선택 (34개 중 일부)
  {
    groupCode: 'ITEM_BZWK_DVCD',
    groupName: '항목업무구분코드',
    description: '항목의 업무 구분',
    category: '미선택',
    categoryCode: 'BUSINESS',
    systemCode: false,
    editable: true,
    sortOrder: 14,
    isActive: 'Y',
    createdAt: '2025-09-02 14:20:00',
    updatedAt: '2025-09-10 09:30:00',
    createdBy: 'manager',
    updatedBy: 'admin'
  },
  {
    groupCode: 'APRVL_TYCD',
    groupName: '결재 거래 유형 코드',
    description: '결재 프로세스의 거래 유형을 관리',
    category: '미선택',
    categoryCode: 'BUSINESS',
    systemCode: false,
    editable: true,
    sortOrder: 16,
    isActive: 'Y',
    createdAt: '2025-09-03 11:10:00',
    updatedAt: '2025-09-12 15:00:00',
    createdBy: 'manager',
    updatedBy: 'manager'
  },
  // 책무구조 (8개 중 일부)
  {
    groupCode: 'DPRM_CD',
    groupName: '책무구조도부서코드',
    description: '책무구조도 관리를 위한 부서 코드',
    category: '책무구조',
    categoryCode: 'BUSINESS',
    systemCode: false,
    editable: true,
    sortOrder: 35,
    isActive: 'Y',
    createdAt: '2025-09-04 16:45:00',
    updatedAt: '2025-09-14 10:20:00',
    createdBy: 'user',
    updatedBy: 'admin'
  },
  {
    groupCode: 'RSBT_OBLG_CD',
    groupName: '책임의무코드',
    description: '책무코드',
    category: '책무구조',
    categoryCode: 'BUSINESS',
    systemCode: false,
    editable: true,
    sortOrder: 36,
    isActive: 'Y',
    createdAt: '2025-09-05 08:30:00',
    updatedAt: '2025-09-16 13:15:00',
    createdBy: 'admin',
    updatedBy: 'manager'
  }
];

/**
 * Mock 코드 상세 데이터 (DPRM_CD 그룹의 상세 코드들)
 */
export const MOCK_CODE_DETAILS: CodeDetail[] = [
  {
    groupCode: 'DPRM_CD',
    detailCode: '0000',
    detailName: '이사회 운영위원회 관련업무 책무',
    description: '이사회운영',
    parentCode: undefined,
    levelDepth: 1,
    sortOrder: 1,
    extAttr1: undefined,
    extAttr2: undefined,
    extAttr3: undefined,
    extraData: undefined,
    validFrom: undefined,
    validUntil: undefined,
    isActive: 'Y',
    createdAt: '2025-09-01 09:00:00',
    updatedAt: '2025-09-20 14:30:00',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    groupCode: 'DPRM_CD',
    detailCode: '1002',
    detailName: '사외이사',
    description: '독립적인 감시 및 견제 책무',
    parentCode: undefined,
    levelDepth: 1,
    sortOrder: 2,
    extAttr1: undefined,
    extAttr2: undefined,
    extAttr3: undefined,
    extraData: undefined,
    validFrom: undefined,
    validUntil: undefined,
    isActive: 'Y',
    createdAt: '2025-09-01 09:15:00',
    updatedAt: '2025-09-18 16:20:00',
    createdBy: 'admin',
    updatedBy: 'manager'
  },
  {
    groupCode: 'DPRM_CD',
    detailCode: '1010',
    detailName: '경영전략본부',
    description: '경영전략 기획 및 관련업무 책무',
    parentCode: undefined,
    levelDepth: 1,
    sortOrder: 3,
    extAttr1: undefined,
    extAttr2: undefined,
    extAttr3: undefined,
    extraData: undefined,
    validFrom: undefined,
    validUntil: undefined,
    isActive: 'Y',
    createdAt: '2025-09-01 10:00:00',
    updatedAt: '2025-09-15 11:45:00',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    groupCode: 'DPRM_CD',
    detailCode: '1011',
    detailName: '리스크관리본부',
    description: '리스크관리 관련업무 책무',
    parentCode: undefined,
    levelDepth: 1,
    sortOrder: 4,
    extAttr1: undefined,
    extAttr2: undefined,
    extAttr3: undefined,
    extraData: undefined,
    validFrom: undefined,
    validUntil: undefined,
    isActive: 'Y',
    createdAt: '2025-09-02 14:20:00',
    updatedAt: '2025-09-10 09:30:00',
    createdBy: 'manager',
    updatedBy: 'admin'
  }
];

/**
 * 사용여부별 색상 매핑
 */
export const USE_YN_COLOR_MAP: Record<UseYN, string> = {
  Y: '#10B981', // Green
  N: '#EF4444'  // Red
};

/**
 * 구분별 색상 매핑
 */
export const CATEGORY_COLOR_MAP: Record<CodeCategory, string> = {
  '시스템 공통': '#3B82F6', // Blue
  '미선택': '#F59E0B',      // Amber
  '책무구조': '#8B5CF6'     // Purple
};