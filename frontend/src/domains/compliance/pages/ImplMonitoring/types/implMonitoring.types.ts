/**
 * 기간설정(Period Setting) 관련 타입 정의
 * 책무구조도 이행점검 기간설정 화면에서 사용
 */

// 기간설정 기본 데이터 타입
export interface PeriodSetting {
  id: string;
  sequence: number;
  ledgerOrderId: string;                     // 책무이행차수
  inspectionName: string;                    // 점검명
  inspectionType: string;                    // 점검유형
  inspectionStartDate: string;               // 점검 수행기간 시작일
  inspectionEndDate: string;                 // 점검 수행기간 종료일
  activityStartDate: string;                 // 활동 대상 기간 시작일
  activityEndDate: string;                   // 활동 대상 기간 종료일
  registrationDate: string;                  // 등록일자
  registrant: string;                        // 등록자
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';   // 상태 (시행/중단/임시)
  statusText: string;                        // 상태 텍스트
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 검색 필터 타입
export interface PeriodSettingFilters {
  ledgerOrderId?: string;                    // 책무이행차수
  searchPeriodStart?: string;                // 항목기간 시작일
  searchPeriodEnd?: string;                  // 항목기간 종료일
}

// 폼 데이터 타입 (등록/수정용)
export interface PeriodSettingFormData {
  inspectionName: string;                    // 점검명
  inspectionStartDate: string;               // 점검 수행기간 시작일
  inspectionEndDate: string;                 // 점검 수행기간 종료일
  description?: string;                      // 설명 (옵션)
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';   // 상태
}

// 페이지네이션 타입
export interface PeriodSettingPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 모달 상태 타입
export interface PeriodSettingModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedPeriod: PeriodSetting | null;
}

// API 응답 타입
export interface PeriodSettingResponse {
  data: PeriodSetting[];
  pagination: PeriodSettingPagination;
  message?: string;
}

// 상태 옵션 타입
export interface StatusOption {
  value: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  label: string;
  color: 'success' | 'error' | 'warning';
}

// 등록자 권한 옵션 타입
export interface AuthorityOption {
  value: string;
  label: string;
}

// 검색 기간 타입
export interface SearchPeriod {
  startDate: string;
  endDate: string;
}

// 점검 기간 유효성 검증 타입
export interface PeriodValidation {
  isValid: boolean;
  message?: string;
  field?: string;
}

// 컴포넌트별 로딩 상태 타입
export interface PeriodSettingLoadingStates {
  search: boolean;
  excel: boolean;
  delete: boolean;
  save: boolean;
  detail: boolean;
}

// 통계 정보 타입
export interface PeriodSettingStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

// 액션 버튼 상태 타입
export interface PeriodSettingActionState {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  selectedCount: number;
}

// 정렬 옵션 타입
export interface SortOption {
  field: keyof PeriodSetting;
  direction: 'asc' | 'desc';
}

// 데이터 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}