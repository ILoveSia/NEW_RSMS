/**
 * CEO 총괄관리의무조회 TypeScript 타입 정의
 * PositionMgmt 표준 패턴을 기반으로 설계
 */

// 🔹 기본 엔티티 타입
export interface CeoMgmtDuty {
  id: string;
  seq: number; // 순번
  executiveManagementDuty: string; // 대표이사총괄관리의무
  dutyCode: string; // 관리의무코드 (R000000012 형식)
  dutyName: string; // 관리의무명
  executives: string[]; // 임원 목록
  departments: string[]; // 부서 목록
  managementActivities: string[]; // 관리활동명 목록
  managementDuties: string[]; // 관리의무 목록
  implementationStatus: string; // 시행여부 (서울, 기타)
  managementActivityList: CeoManagementActivity[]; // 관련 관리활동 상세 목록
  registrationDate: string; // 등록일
  registrar: string; // 등록자
  modificationDate?: string; // 수정일
  modifier?: string; // 수정자
  isActive: boolean; // 사용여부
}

// 🔹 CEO 관리활동 상세 타입
export interface CeoManagementActivity {
  id: string;
  selected: boolean; // 선택 여부
  status: 'active' | 'inactive' | 'pending'; // 상태
  statusIcon: string; // 상태 아이콘 (📄 등)
  executive: string; // 임원
  department: string; // 부서
  activityName: string; // 관리활동명
  activityDetail: string; // 관리활동 상세내용
  registrationDate: string; // 등록일
  registrar: string; // 등록자
  modificationDate?: string; // 수정일
  modifier?: string; // 수정자
  isActive: boolean; // 사용여부
}

// 🔹 검색 필터 타입
export interface CeoMgmtDutyFilters {
  implementationStatus: string; // 시행여부 필터
  dutyName?: string; // 관리의무명 검색
  executive?: string; // 임원 검색
  department?: string; // 부서 검색
}

// 🔹 폼 데이터 타입 (상세 조회/수정용)
export interface CeoMgmtDutyFormData {
  dutyCode: string; // 관리의무코드
  dutyName: string; // 관리의무명
  managementActivities: CeoManagementActivityFormData[]; // 관리활동 목록
}

// 🔹 관리활동 폼 데이터 타입
export interface CeoManagementActivityFormData {
  id?: string;
  executive: string; // 임원
  department: string; // 부서
  activityName: string; // 관리활동명
  activityDetail: string; // 관리활동 상세내용
  status: 'active' | 'inactive' | 'pending'; // 상태
  selected?: boolean; // 선택 여부
}

// 🔹 페이지네이션 타입
export interface CeoMgmtDutyPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🔹 모달 상태 타입
export interface CeoMgmtDutyModalState {
  detailModal: boolean; // 상세 조회 모달
  selectedDuty: CeoMgmtDuty | null; // 선택된 CEO 관리의무
}

// 🔹 통계 정보 타입
export interface CeoMgmtDutyStatistics {
  totalDuties: number; // 총 관리의무 수
  activeDuties: number; // 활성 관리의무 수
  pendingActivities: number; // 대기 중인 관리활동 수
  totalActivities: number; // 총 관리활동 수
  completionRate: number; // 완료율
}

// 🔹 API 응답 타입
export interface CeoMgmtDutyListResponse {
  content: CeoMgmtDuty[];
  pageable: {
    page: number;
    size: number;
    sort: string[];
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CeoMgmtDutyDetailResponse {
  duty: CeoMgmtDuty;
  activities: CeoManagementActivity[];
}

// 🔹 API 요청 타입
export interface CeoMgmtDutySearchRequest {
  implementationStatus?: string;
  dutyName?: string;
  executive?: string;
  department?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface CeoMgmtDutyUpdateRequest {
  dutyName: string;
  managementActivities: CeoManagementActivityFormData[];
}

export interface CeoManagementActivityCreateRequest {
  dutyId: string;
  executive: string;
  department: string;
  activityName: string;
  activityDetail: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface CeoManagementActivityUpdateRequest {
  executive: string;
  department: string;
  activityName: string;
  activityDetail: string;
  status: 'active' | 'inactive' | 'pending';
}

// 🔹 컴포넌트 Props 타입
export interface CeoMgmtDutySearchProps {
  className?: string;
}

export interface CeoMgmtDutyDetailModalProps {
  open: boolean;
  duty: CeoMgmtDuty | null;
  onClose: () => void;
  onUpdate: (id: string, formData: CeoMgmtDutyFormData) => Promise<void>;
  onActivityAdd: (dutyId: string, activity: CeoManagementActivityFormData) => Promise<void>;
  onActivityDelete: (dutyId: string, activityIds: string[]) => Promise<void>;
  loading?: boolean;
}

export interface CeoMgmtDutySearchFilterProps {
  filters: CeoMgmtDutyFilters;
  onFiltersChange: (filters: Partial<CeoMgmtDutyFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
  loading?: boolean;
}

export interface CeoMgmtDutyDataGridProps {
  data: CeoMgmtDuty[];
  loading?: boolean;
  onRowClick?: (duty: CeoMgmtDuty) => void;
  onRowDoubleClick?: (duty: CeoMgmtDuty) => void;
  onSelectionChange?: (selected: CeoMgmtDuty[]) => void;
  height?: string;
}

// 🔹 유틸리티 타입
export type CeoMgmtDutyStatus = 'active' | 'inactive' | 'pending';
export type ImplementationStatus = '서울' | '부산' | '대구' | '인천' | '광주' | '대전' | '울산' | '세종' | '경기' | '강원' | '충북' | '충남' | '전북' | '전남' | '경북' | '경남' | '제주';

// 🔹 오류 타입
export interface CeoMgmtDutyError {
  code: string;
  message: string;
  field?: string;
}

// 🔹 로딩 상태 타입
export interface CeoMgmtDutyLoadingStates {
  search: boolean;
  detail: boolean;
  update: boolean;
  delete: boolean;
  excel: boolean;
}

// 🔹 액션 타입 (Redux/Zustand용)
export type CeoMgmtDutyAction =
  | { type: 'SET_DUTIES'; payload: CeoMgmtDuty[] }
  | { type: 'SET_LOADING'; payload: { key: keyof CeoMgmtDutyLoadingStates; value: boolean } }
  | { type: 'SET_FILTERS'; payload: Partial<CeoMgmtDutyFilters> }
  | { type: 'SET_PAGINATION'; payload: Partial<CeoMgmtDutyPagination> }
  | { type: 'SET_SELECTED_DUTY'; payload: CeoMgmtDuty | null }
  | { type: 'UPDATE_DUTY'; payload: { id: string; duty: Partial<CeoMgmtDuty> } }
  | { type: 'ADD_ACTIVITY'; payload: { dutyId: string; activity: CeoManagementActivity } }
  | { type: 'UPDATE_ACTIVITY'; payload: { dutyId: string; activityId: string; activity: Partial<CeoManagementActivity> } }
  | { type: 'DELETE_ACTIVITIES'; payload: { dutyId: string; activityIds: string[] } };