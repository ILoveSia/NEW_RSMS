/**
 * 내부통제장치관리 관련 TypeScript 타입 정의
 * 분할 레이아웃과 상세 입력 기능을 지원하는 완전한 타입 시스템
 */

// ========================================
// Core Data Types
// ========================================

/**
 * 내부통제장치관리 메인 인터페이스
 * 좌측 목록과 우측 상세 입력 영역 데이터 구조
 */
export interface InternalControlMgmt {
  // 기본 식별 정보
  id: string;
  sequence: number; // 순번

  // 부서 및 관리활동 정보
  departmentName: string; // 부정명 (부서명)
  managementActivityName: string; // 관리활동명

  // 내부통제장치 정보
  internalControlDeviceName: string; // 내부통제장치명
  internalControlDeviceDescription: string; // 내부통제장치설명

  // 날짜 정보
  registrationDate: string; // 등록일자 (YYYY.MM.DD)
  applicationDate: string; // 적용일자 (YYYY.MM.DD)
  expirationDate: string; // 만료일자 (YYYY.MM.DD)

  // 메타데이터
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;

  // 상태 정보
  isActive: boolean; // 사용여부
}

/**
 * 우측 상세 입력 영역 데이터 구조
 * CEO 정보부터 적용일자까지 모든 입력 필드
 */
export interface InternalControlMgmtDetail {
  // CEO 정보
  ceoInfo: string; // CEO 정보

  // 관리활동 정보
  managementActivityName: string; // 관리활동명
  managementActivityDetail: string; // 관리활동상세

  // 내부통제 정보
  internalControl: string; // 내부통제
  internalControlDeviceDescription: string; // 내부통제장치설명

  // 시스템 연결 정보
  unifiedNumber: string; // 통일번호
  url: string; // URL
  applicationDate: string; // 적용일자
}

// ========================================
// Filter and Search Types
// ========================================

/**
 * 검색 필터 인터페이스
 * 상단 검색 영역의 필터 조건들
 */
export interface InternalControlMgmtFilters {
  departmentName: string; // 부정명 필터
  applicationDateFrom: string; // 적용일자 시작일
  applicationDateTo: string; // 적용일자 종료일
  isActive: string; // 사용여부 ('', 'Y', 'N')
}

/**
 * 부정명 옵션 타입
 * 드롭다운에서 사용할 부서명 선택 옵션
 */
export interface DepartmentOption {
  value: string;
  label: string;
}

/**
 * 사용여부 옵션 타입
 */
export interface UsageStatusOption {
  value: string;
  label: string;
}

// ========================================
// Form and Modal Types
// ========================================

/**
 * 상세 입력 폼 데이터 타입
 * 우측 상세 영역 폼 입력값들
 */
export interface InternalControlMgmtFormData {
  ceoInfo: string;
  managementActivityName: string;
  managementActivityDetail: string;
  internalControl: string;
  internalControlDeviceDescription: string;
  unifiedNumber: string;
  url: string;
  applicationDate: string;
}

/**
 * 모달 상태 관리 타입
 * 상세 보기 모달의 열림/닫힘 상태
 */
export interface InternalControlMgmtModalState {
  detailModal: boolean;
  selectedItem: InternalControlMgmt | null;
}

// ========================================
// Grid and Display Types
// ========================================

/**
 * 페이지네이션 타입
 */
export interface InternalControlMgmtPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/**
 * 통계 정보 타입
 * 내부통제장치 현황 통계
 */
export interface InternalControlMgmtStatistics {
  total: number; // 총 건수
  active: number; // 사용 중인 건수
  inactive: number; // 미사용 건수
  expiringSoon: number; // 만료 예정 건수 (7일 이내)
}

/**
 * 정렬 옵션 타입
 */
export interface SortOption {
  field: keyof InternalControlMgmt;
  direction: 'asc' | 'desc';
}

// ========================================
// API Response Types
// ========================================

/**
 * API 응답 기본 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

/**
 * 목록 조회 API 응답 타입
 */
export interface InternalControlMgmtListResponse {
  items: InternalControlMgmt[];
  pagination: InternalControlMgmtPagination;
  statistics: InternalControlMgmtStatistics;
}

/**
 * 상세 조회 API 응답 타입
 */
export interface InternalControlMgmtDetailResponse {
  item: InternalControlMgmt;
  detail: InternalControlMgmtDetail;
}

/**
 * 저장/수정 API 요청 타입
 */
export interface InternalControlMgmtSaveRequest {
  basic: Omit<InternalControlMgmt, 'id' | 'sequence' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
  detail: InternalControlMgmtDetail;
}

// ========================================
// Component Props Types
// ========================================

/**
 * 메인 컴포넌트 Props 타입
 */
export interface InternalControlMgmtProps {
  className?: string;
}

/**
 * 좌측 목록 컴포넌트 Props 타입
 */
export interface InternalControlMgmtListProps {
  data: InternalControlMgmt[];
  loading: boolean;
  selectedItems: InternalControlMgmt[];
  onSelectionChange: (selected: InternalControlMgmt[]) => void;
  onRowClick: (item: InternalControlMgmt) => void;
  onRowDoubleClick: (item: InternalControlMgmt) => void;
  pagination: InternalControlMgmtPagination;
  onPageChange: (page: number) => void;
}

/**
 * 우측 상세 입력 컴포넌트 Props 타입
 */
export interface InternalControlMgmtDetailPanelProps {
  selectedItem: InternalControlMgmt | null;
  detail: InternalControlMgmtDetail | null;
  loading: boolean;
  onSave: (data: InternalControlMgmtFormData) => void;
  onClear: () => void;
}

/**
 * 상세 모달 컴포넌트 Props 타입
 */
export interface InternalControlMgmtDetailModalProps {
  open: boolean;
  item: InternalControlMgmt | null;
  onClose: () => void;
  loading?: boolean;
}

// ========================================
// Event Handler Types
// ========================================

/**
 * 이벤트 핸들러 타입들
 */
export type InternalControlMgmtEventHandlers = {
  onSearch: (filters: InternalControlMgmtFilters) => void;
  onAdd: () => void;
  onSave: (data: InternalControlMgmtFormData) => void;
  onCopy: () => void;
  onDetailView: (item: InternalControlMgmt) => void;
  onSelectionChange: (selected: InternalControlMgmt[]) => void;
  onRowClick: (item: InternalControlMgmt) => void;
  onRowDoubleClick: (item: InternalControlMgmt) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: Partial<InternalControlMgmtFilters>) => void;
  onClearFilters: () => void;
};

// ========================================
// Utility Types
// ========================================

/**
 * 로딩 상태 관리 타입
 */
export interface LoadingStates {
  search: boolean;
  save: boolean;
  detail: boolean;
  copy: boolean;
}

/**
 * 에러 상태 관리 타입
 */
export interface ErrorStates {
  search?: string;
  save?: string;
  detail?: string;
  copy?: string;
}

/**
 * 컴포넌트 상태 통합 타입
 */
export interface InternalControlMgmtState {
  items: InternalControlMgmt[];
  selectedItems: InternalControlMgmt[];
  selectedDetail: InternalControlMgmtDetail | null;
  filters: InternalControlMgmtFilters;
  pagination: InternalControlMgmtPagination;
  statistics: InternalControlMgmtStatistics;
  modalState: InternalControlMgmtModalState;
  loadingStates: LoadingStates;
  errorStates: ErrorStates;
}

// ========================================
// Default Values
// ========================================

/**
 * 기본값 상수들
 */
export const DEFAULT_FILTERS: InternalControlMgmtFilters = {
  departmentName: '',
  applicationDateFrom: '',
  applicationDateTo: '',
  isActive: 'Y' // 기본값: 사용
};

export const DEFAULT_PAGINATION: InternalControlMgmtPagination = {
  page: 1,
  size: 20,
  total: 0,
  totalPages: 0
};

export const DEFAULT_FORM_DATA: InternalControlMgmtFormData = {
  ceoInfo: '',
  managementActivityName: '',
  managementActivityDetail: '',
  internalControl: '',
  internalControlDeviceDescription: '',
  unifiedNumber: '',
  url: '',
  applicationDate: ''
};

/**
 * 사용여부 옵션 상수
 */
export const USAGE_STATUS_OPTIONS: UsageStatusOption[] = [
  { value: '', label: '전체' },
  { value: 'Y', label: '사용' },
  { value: 'N', label: '미사용' }
];

/**
 * 부정명 옵션 상수 (실제로는 API에서 동적으로 로드)
 */
export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { value: '', label: '전체' },
  { value: 'dept1', label: '경영관리부' },
  { value: 'dept2', label: '리스크관리부' },
  { value: 'dept3', label: '준법감시부' },
  { value: 'dept4', label: '내부통제부' }
];