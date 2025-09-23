// 반려관리(RejectionMgmt) TypeScript 타입 정의

/**
 * 반려 정보 기본 인터페이스
 */
export interface Rejection {
  id: string;
  /** 순번 */
  sequence: number;
  /** 구분 */
  category: string;
  /** 구분상세 */
  categoryDetail: string;
  /** 부품명 */
  partName: string;
  /** 내용 */
  content: string;
  /** 요청일자 */
  requestDate: string;
  /** 요청자명 */
  requesterName: string;
  /** 요청자 */
  requester: string;
  /** 반려일자 */
  rejectionDate: string;
  /** 반려자명 */
  rejectorName: string;
  /** 반려자 */
  rejector: string;
  /** 반려의견 */
  rejectionComment: string;
  /** 상태 (처리중, 반려, 완료 등) */
  status: string;
  /** 재처리 가능 여부 */
  canReprocess: boolean;
  /** 부품코드 */
  partCode: string;
}

/**
 * 반려 검색 필터 인터페이스
 */
export interface RejectionFilters {
  /** 구분 */
  category: string;
  /** 부품코드 */
  partCode: string;
  /** 요청일자 시작 */
  requestDateFrom: string;
  /** 요청일자 종료 */
  requestDateTo: string;
}

/**
 * 반려 폼 데이터 인터페이스 (등록/수정용)
 */
export interface RejectionFormData {
  /** 구분 */
  category: string;
  /** 구분상세 */
  categoryDetail: string;
  /** 부품코드 */
  partCode: string;
  /** 부품명 */
  partName: string;
  /** 내용 */
  content: string;
  /** 요청일자 */
  requestDate: string;
  /** 요청자 */
  requester: string;
  /** 반려의견 */
  rejectionComment: string;
}

/**
 * 반려 모달 상태 인터페이스
 */
export interface RejectionModalState {
  /** 상세보기 모달 */
  detailModal: boolean;
  /** 재처리요청 모달 */
  reprocessModal: boolean;
  /** 선택된 반려 정보 */
  selectedRejection: Rejection | null;
}

/**
 * 반려 페이징 인터페이스
 */
export interface RejectionPagination {
  /** 현재 페이지 */
  page: number;
  /** 페이지 크기 */
  size: number;
  /** 총 개수 */
  total: number;
  /** 총 페이지 수 */
  totalPages: number;
}

/**
 * 구분 옵션 인터페이스
 */
export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * 부품 정보 인터페이스 (부품조회팝업용)
 */
export interface PartInfo {
  /** 부품코드 */
  partCode: string;
  /** 부품명 */
  partName: string;
  /** 부품 상세 정보 */
  partDescription?: string;
  /** 부품 상태 */
  partStatus: string;
}

/**
 * 재처리 요청 데이터 인터페이스
 */
export interface ReprocessRequestData {
  /** 반려 ID */
  rejectionId: string;
  /** 재처리 사유 */
  reprocessReason: string;
  /** 수정된 내용 */
  modifiedContent?: string;
  /** 요청자 */
  requester: string;
}

/**
 * 반려 통계 정보 인터페이스
 */
export interface RejectionStatistics {
  /** 총 반려 건수 */
  totalRejections: number;
  /** 처리중 건수 */
  processingCount: number;
  /** 완료 건수 */
  completedCount: number;
  /** 재처리 대기 건수 */
  pendingReprocessCount: number;
}

/**
 * 엑셀 다운로드 요청 인터페이스
 */
export interface ExcelDownloadRequest {
  /** 검색 필터 */
  filters: RejectionFilters;
  /** 선택된 ID 목록 (전체 다운로드인 경우 빈 배열) */
  selectedIds: string[];
  /** 다운로드 타입 */
  downloadType: 'all' | 'filtered' | 'selected';
}