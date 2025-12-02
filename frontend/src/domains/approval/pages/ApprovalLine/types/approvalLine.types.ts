/**
 * 결재선 관리 타입 정의
 *
 * @description 결재선 관리 화면에서 사용되는 모든 타입을 정의
 * - 백엔드 API DTO와 매핑
 * @author Claude AI
 * @version 2.0.0
 * @created 2025-09-24
 * @updated 2025-12-02
 */

// ===============================
// Base Types & Enums
// ===============================

/**
 * 사용여부 열거형
 */
export type UseYN = 'Y' | 'N';

/**
 * 결재선 업무 구분 (백엔드 workTypeCd)
 */
export type WorkType = 'WRS' | 'IMPL' | 'IMPROVE' | string;

/**
 * 업무 구분 라벨 매핑
 */
export const WORK_TYPE_LABELS: Record<string, string> = {
  WRS: '책무구조도',
  IMPL: '이행점검',
  IMPROVE: '개선이행'
};

// ===============================
// Core Domain Types
// ===============================

/**
 * 결재 유형 코드
 */
export type ApprovalTypeCd = 'DRAFT' | 'REVIEW' | 'APPROVE' | 'FINAL';

/**
 * 결재자 유형 코드
 */
export type ApproverTypeCd = 'USER' | 'POSITION' | 'DEPT';

/**
 * 결재선 단계 인터페이스 (백엔드 ApprovalLineStepDto 매핑)
 */
export interface ApprovalLineStep {
  /** 단계 ID (백엔드: approvalLineStepId) */
  id: string;

  /** 결재선 ID (FK) */
  approvalLineId?: string;

  /** 단계 순서 (1부터 시작) */
  stepOrder: number;

  /** 단계명 (예: 기안, 검토, 승인, 최종승인) */
  stepName: string;

  /** 결재유형 코드 */
  approvalTypeCd: ApprovalTypeCd | string;

  /** 결재유형명 (표시용) */
  approvalTypeName?: string;

  /** 결재자유형 코드 */
  approverTypeCd: ApproverTypeCd | string;

  /** 결재자유형명 (표시용) */
  approverTypeName?: string;

  /** 결재자 ID (사용자/직책/부서 ID) */
  approverId?: string;

  /** 결재자명 (표시용) */
  approverName?: string;

  /** 필수여부 (Y/N) */
  isRequired: UseYN | string;

  /** 비고 */
  remarks?: string;
}

/**
 * 결재선 기본 인터페이스 (백엔드 ApprovalLineDto 매핑)
 */
export interface ApprovalLine {
  /** 결재선 ID (백엔드: approvalLineId) */
  id: string;

  /** 순서 */
  sequence: number;

  /** 결재선명 (백엔드: approvalLineName) */
  name: string;

  /** 업무 구분 코드 (백엔드: workTypeCd) */
  workType: WorkType;

  /** 업무 구분명 (백엔드: workTypeName) */
  workTypeName?: string;

  /** Popup 제목 */
  popupTitle: string;

  /** 수정기능여부 */
  isEditable: UseYN;

  /** 사용여부 */
  isUsed: UseYN;

  /** 비고 */
  remarks?: string;

  /** 결재선 단계 목록 */
  steps?: ApprovalLineStep[];

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
 * 통계 정보 인터페이스
 */
export interface ApprovalLineStatistics {
  /** 전체 개수 */
  total: number;

  /** 사용중 개수 */
  used: number;

  /** 미사용 개수 */
  unused: number;
}

// ===============================
// Options
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
 * 업무 구분 옵션 (백엔드 workTypeCd 매핑)
 */
export const WORK_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'WRS', label: '책무구조도' },
  { value: 'IMPL', label: '이행점검' },
  { value: 'IMPROVE', label: '개선이행' }
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
 * 사용여부별 색상 매핑
 */
export const USE_YN_COLOR_MAP: Record<UseYN, string> = {
  Y: '#10B981', // Green
  N: '#EF4444'  // Red
};

/**
 * 업무 구분별 색상 매핑
 */
export const WORK_TYPE_COLOR_MAP: Record<string, string> = {
  WRS: '#3B82F6',     // Blue
  IMPL: '#10B981',    // Green
  IMPROVE: '#F59E0B'  // Amber
};
