/**
 * 결재선 관리 타입 정의
 *
 * @description 결재선 관리 화면에서 사용되는 모든 타입을 정의
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
 * 결재선 업무 구분
 */
export type WorkType = 'WRS' | 'PMS' | 'RMS' | 'AMS' | 'CMS' | 'ALL';

/**
 * 업무 구분 라벨 매핑
 */
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  WRS: 'WRS-책무구조',
  PMS: 'PMS-프로젝트관리',
  RMS: 'RMS-리스크관리',
  AMS: 'AMS-감사관리',
  CMS: 'CMS-규정관리',
  ALL: '전체'
};

// ===============================
// Core Domain Types
// ===============================

/**
 * 결재선 기본 인터페이스
 */
export interface ApprovalLine {
  /** 결재선 ID */
  id: string;

  /** 순서 */
  sequence: number;

  /** 결재선명 (필수) */
  name: string;

  /** 업무 구분 */
  workType: WorkType;

  /** Popup 제목 */
  popupTitle: string;

  /** URL 정보 */
  url: string;

  /** 설명 */
  description?: string;

  /** 팝업여부 */
  isPopup: UseYN;

  /** 수정기능여부 */
  isEditable: UseYN;

  /** 사용여부 */
  isUsed: UseYN;

  /** 비고 */
  remarks?: string;

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
 * 결재선 폼 데이터 인터페이스
 */
export interface ApprovalLineFormData {
  /** 결재선명 (필수) */
  name: string;

  /** 업무 구분 */
  workType: WorkType;

  /** Popup 제목 */
  popupTitle: string;

  /** URL 정보 */
  url: string;

  /** 설명 */
  description?: string;

  /** 팝업여부 */
  isPopup: UseYN;

  /** 수정기능여부 */
  isEditable: UseYN;

  /** 사용여부 */
  isUsed: UseYN;

  /** 비고 */
  remarks?: string;
}

// ===============================
// Filter & Search Types
// ===============================

/**
 * 결재선 필터링 인터페이스
 */
export interface ApprovalLineFilters {
  /** 업무 구분 */
  workType?: WorkType | '';

  /** 결재선명 검색 */
  searchKeyword?: string;

  /** 사용여부 */
  isUsed?: UseYN | '';

  /** 인덱스 시그니처 (BaseSearchFilter 호환성) */
  [key: string]: string | undefined;
}

// ===============================
// UI State Types
// ===============================

/**
 * 모달 상태 관리 인터페이스
 */
export interface ApprovalLineModalState {
  /** 모달 열림 상태 */
  open: boolean;

  /** 모달 모드 ('create' | 'edit' | 'detail') */
  mode: 'create' | 'edit' | 'detail';

  /** 편집 대상 결재선 데이터 */
  itemData: ApprovalLine | null;
}

/**
 * 페이지네이션 인터페이스
 */
export interface ApprovalLinePagination {
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
export interface ApprovalLineSorting {
  /** 정렬 대상 필드 */
  field: keyof ApprovalLine;

  /** 정렬 방향 */
  direction: 'asc' | 'desc';
}

/**
 * 좌우 분할 레이아웃 상태
 */
export interface SplitLayoutState {
  /** 좌측 선택된 결재선 */
  selectedApprovalLine: ApprovalLine | null;

  /** 좌측 그리드 로딩 상태 */
  leftLoading: boolean;

  /** 우측 상세 로딩 상태 */
  rightLoading: boolean;
}

// ===============================
// API Response Types
// ===============================

/**
 * 결재선 목록 조회 응답
 */
export interface ApprovalLineListResponse {
  /** 결재선 목록 */
  items: ApprovalLine[];

  /** 페이지네이션 정보 */
  pagination: ApprovalLinePagination;

  /** 응답 메시지 */
  message?: string;
}

/**
 * 결재선 상세 조회 응답
 */
export interface ApprovalLineDetailResponse {
  /** 결재선 정보 */
  item: ApprovalLine;

  /** 응답 메시지 */
  message?: string;
}

/**
 * 결재선 생성/수정 응답
 */
export interface ApprovalLineMutationResponse {
  /** 성공 여부 */
  success: boolean;

  /** 결재선 정보 */
  item?: ApprovalLine;

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
 * 업무 구분 옵션
 */
export const WORK_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'WRS', label: 'WRS-책무구조' },
  { value: 'PMS', label: 'PMS-프로젝트관리' },
  { value: 'RMS', label: 'RMS-리스크관리' },
  { value: 'AMS', label: 'AMS-감사관리' },
  { value: 'CMS', label: 'CMS-규정관리' }
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
 * Mock 결재선 데이터
 */
export const MOCK_APPROVAL_LINES: ApprovalLine[] = [
  {
    id: '1',
    sequence: 1,
    name: 'W01-특수기능사용권 결재',
    workType: 'WRS',
    popupTitle: '특수기능사용권 승인 결재',
    url: 'WRS/POP_APRVL_ListDat_For...',
    description: '특수기능사용권 승인을 위한 결재선',
    isPopup: 'Y',
    isEditable: 'Y',
    isUsed: 'Y',
    remarks: '시스템 핵심 기능',
    createdAt: '2025-09-01 09:00:00',
    updatedAt: '2025-09-20 14:30:00',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '2',
    sequence: 2,
    name: 'W05-권한부여 결재',
    workType: 'WRS',
    popupTitle: '권한부여 결재',
    url: 'WRS/POP_APRVL_ListDat_For...',
    description: '시스템 권한부여를 위한 결재선',
    isPopup: 'Y',
    isEditable: 'Y',
    isUsed: 'Y',
    remarks: '권한 관리',
    createdAt: '2025-09-01 09:15:00',
    updatedAt: '2025-09-18 16:20:00',
    createdBy: 'admin',
    updatedBy: 'manager'
  },
  {
    id: '3',
    sequence: 3,
    name: 'W02-이용권한 결재',
    workType: 'WRS',
    popupTitle: '이용권한 결재',
    url: 'WRS/POP_APRVL_ListDat_For...',
    description: '시스템 이용권한 승인 결재선',
    isPopup: 'Y',
    isEditable: 'Y',
    isUsed: 'Y',
    remarks: '일반 사용자 권한',
    createdAt: '2025-09-01 10:00:00',
    updatedAt: '2025-09-15 11:45:00',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '4',
    sequence: 4,
    name: 'AP01-준법업무시현재',
    workType: 'AMS',
    popupTitle: '준법업무 시현 결재',
    url: 'AMS/POP_APRVL_ListDat_For...',
    description: '준법업무 시현을 위한 결재선',
    isPopup: 'Y',
    isEditable: 'Y',
    isUsed: 'N',
    remarks: '미사용',
    createdAt: '2025-09-02 14:20:00',
    updatedAt: '2025-09-10 09:30:00',
    createdBy: 'manager',
    updatedBy: 'admin'
  },
  {
    id: '5',
    sequence: 5,
    name: 'AP05-부원담당자',
    workType: 'AMS',
    popupTitle: '부원담당자 지정 결재',
    url: 'AMS/POP_APRVL_ListDat_For...',
    description: '부원담당자 지정을 위한 결재선',
    isPopup: 'Y',
    isEditable: 'N',
    isUsed: 'N',
    remarks: '미사용',
    createdAt: '2025-09-03 11:10:00',
    updatedAt: '2025-09-12 15:00:00',
    createdBy: 'manager',
    updatedBy: 'manager'
  },
  {
    id: '6',
    sequence: 6,
    name: 'AP18-조치자',
    workType: 'AMS',
    popupTitle: '조치자 지정 결재',
    url: 'AMS/POP_APRVL_ListDat_For...',
    description: '조치자 지정을 위한 결재선',
    isPopup: 'N',
    isEditable: 'Y',
    isUsed: 'N',
    remarks: '미사용',
    createdAt: '2025-09-04 16:45:00',
    updatedAt: '2025-09-14 10:20:00',
    createdBy: 'user',
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
 * 업무 구분별 색상 매핑
 */
export const WORK_TYPE_COLOR_MAP: Record<WorkType, string> = {
  WRS: '#3B82F6', // Blue
  PMS: '#10B981', // Green
  RMS: '#F59E0B', // Amber
  AMS: '#EF4444', // Red
  CMS: '#8B5CF6', // Purple
  ALL: '#6B7280'  // Gray
};