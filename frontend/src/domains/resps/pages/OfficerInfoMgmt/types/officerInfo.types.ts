/**
 * 임원정보관리 타입 정의
 * @description PositionMgmt 표준 패턴을 따른 임원정보 관리 타입
 */

// 🏷️ 기본 임원정보 인터페이스
export interface OfficerInfo {
  id: string;
  seq: number;
  positionCode: string;              // 직책코드
  positionName: string;              // 직책명
  officerName?: string;              // 임원명
  officerPosition?: string;          // 직위
  isDualPosition: boolean;           // 겸직여부
  dualPositionDetails?: string;      // 겸직사항
  responsibilityAssignDate?: string; // 책무정보 부여일자

  // 요청 정보
  requestDate?: string;              // 요청일자
  requesterPosition?: string;        // 요청자직책
  requesterName?: string;            // 요청자

  // 승인 정보
  approvalDate?: string;             // 승인일자
  approverPosition?: string;         // 승인자직책
  approverName?: string;             // 승인자

  // 상태 및 메타데이터
  status: OfficerInfoStatus;         // 상태 (테스트/확정/승인대기)
  isActive: boolean;                 // 활성화 여부
  responsibilityChartName?: string;  // 책무구조도명

  // 연관 정보
  meetingBodies?: MeetingBody[];     // 소관부서 회의체
  responsibilities?: ResponsibilityDetail[]; // 책무 상세
  managementObligations?: ManagementObligation[]; // 관리의무

  // 추적 정보
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// 📊 임원정보 상태
export type OfficerInfoStatus = 'test' | 'confirmed' | 'pending' | 'approved' | 'rejected';

// 👥 소관부서 회의체 정보
export interface MeetingBody {
  id: string;
  meetingName: string;               // 회의체명
  chairperson: string;               // 위원장
  frequency: string;                 // 개최주기
  mainAgenda: string;                // 주요심의사항
  seq: number;                       // 순서
}

// 📋 책무 상세 정보
export interface ResponsibilityDetail {
  id: string;
  seq: number;                       // 순번
  responsibility: string;            // 책무
  responsibilityDetails: string;     // 책무세부내용
  legalBasis: string;               // 관련근거
}

// ⚖️ 관리의무 정보
export interface ManagementObligation {
  id: string;
  seq: number;                       // 순번
  obligationContent: string;         // 관리의무 내용
  legalBasis: string;               // 관련근거
}

// 🔍 검색 필터
export interface OfficerInfoFilters {
  positionName?: string;             // 직책명 검색
  status?: OfficerInfoStatus | 'all'; // 상태 필터
  responsibilityChartName?: string;  // 책무구조도명
  hasOfficer?: boolean;              // 임원 배정 여부
}

// 📝 폼 데이터 (등록/수정)
export interface OfficerInfoFormData {
  // 기본 정보
  positionCode: string;
  officerName: string;
  officerPosition?: string;
  isDualPosition: boolean;
  dualPositionDetails?: string;
  responsibilityAssignDate: string;

  // 소관부서 회의체 정보
  meetingBodies: MeetingBodyFormData[];

  // 책무 정보
  responsibilityOverview?: string;   // 책무개요
  responsibilities: ResponsibilityFormData[];

  // 관리의무 정보
  managementObligations: ManagementObligationFormData[];

  // 작업내역
  workNotes?: string;                // 작업내역
  verifierPosition?: string;         // 직위검증자 직책
  verifierName?: string;             // 직위검증자 이름
}

// 📋 폼용 회의체 데이터
export interface MeetingBodyFormData {
  meetingName: string;
  chairperson: string;
  frequency: string;
  mainAgenda: string;
  seq: number;
}

// 📋 폼용 책무 데이터
export interface ResponsibilityFormData {
  responsibility: string;
  responsibilityDetails: string;
  legalBasis: string;
  seq: number;
}

// ⚖️ 폼용 관리의무 데이터
export interface ManagementObligationFormData {
  obligationContent: string;
  legalBasis: string;
  seq: number;
}

// 🎯 모달 상태 관리
export interface OfficerInfoModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  officerInfo?: OfficerInfo;
}

// 📄 페이지네이션
export interface OfficerInfoPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 📊 통계 정보
export interface OfficerInfoStatistics {
  totalPositions: number;            // 전체 직책 수
  assignedOfficers: number;          // 임원 배정 완료
  pendingAssignments: number;        // 배정 대기
  pendingApprovals: number;          // 승인 대기
}

// 🎨 UI 상태 관리
export interface OfficerInfoUIState {
  selectedOfficerInfos: OfficerInfo[];
  sortField?: keyof OfficerInfo;
  sortDirection?: 'asc' | 'desc';
  expandedRows?: string[];
}

// 📤 API 요청/응답 타입
export interface CreateOfficerInfoRequest {
  formData: OfficerInfoFormData;
}

export interface UpdateOfficerInfoRequest {
  id: string;
  formData: Partial<OfficerInfoFormData>;
}

export interface OfficerInfoListResponse {
  items: OfficerInfo[];
  pagination: OfficerInfoPagination;
  statistics: OfficerInfoStatistics;
}

// 🔧 유틸리티 타입
export type OfficerInfoSortField = keyof Pick<OfficerInfo,
  | 'seq'
  | 'positionName'
  | 'officerName'
  | 'requestDate'
  | 'approvalDate'
  | 'status'
>;

// 📝 상수 정의
export const OFFICER_INFO_STATUS_LABELS: Record<OfficerInfoStatus, string> = {
  test: '테스트',
  confirmed: '확정',
  pending: '승인대기',
  approved: '승인완료',
  rejected: '승인거부'
};

export const OFFICER_INFO_STATUS_COLORS: Record<OfficerInfoStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  test: 'warning',
  confirmed: 'success',
  pending: 'info',
  approved: 'primary',
  rejected: 'error'
};

// 🎯 비즈니스 규칙 상수
export const OFFICER_INFO_BUSINESS_RULES = {
  MAX_OFFICER_NAME_LENGTH: 50,
  MAX_POSITION_LENGTH: 50,
  MAX_DUAL_POSITION_DETAILS_LENGTH: 1000,
  MAX_RESPONSIBILITY_OVERVIEW_LENGTH: 2000,
  MAX_WORK_NOTES_LENGTH: 1000,
  MIN_MEETING_BODIES: 1,
  MIN_RESPONSIBILITIES: 1,
  MIN_MANAGEMENT_OBLIGATIONS: 1
} as const;

// 📅 날짜 검증 규칙
export const DATE_VALIDATION_RULES = {
  RESPONSIBILITY_ASSIGN_DATE: {
    MIN_DATE: new Date('2020-01-01'),
    MAX_DATE: new Date(), // 현재일까지만 허용
  }
} as const;

// 🔍 검색 옵션
export const SEARCH_OPTIONS = {
  POSITION_NAME_MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS_PER_PAGE: 100
} as const;

// 📋 드롭다운 옵션
export const DUAL_POSITION_OPTIONS = [
  { value: true, label: 'Y' },
  { value: false, label: 'N' }
] as const;

export const MEETING_FREQUENCY_OPTIONS = [
  { value: '월 1회', label: '월 1회' },
  { value: '분기 1회', label: '분기 1회' },
  { value: '반기 1회', label: '반기 1회' },
  { value: '년 1회', label: '년 1회' },
  { value: '수시', label: '수시' },
  { value: '기타', label: '기타' }
] as const;

// 🎭 모드별 설정
export const MODAL_MODES = {
  create: {
    title: '책무기술서 임원 등록',
    submitLabel: '등록',
    readonly: false
  },
  edit: {
    title: '책무기술서 임원 수정',
    submitLabel: '수정',
    readonly: false
  },
  view: {
    title: '책무기술서 상세',
    submitLabel: '확인',
    readonly: true
  }
} as const;