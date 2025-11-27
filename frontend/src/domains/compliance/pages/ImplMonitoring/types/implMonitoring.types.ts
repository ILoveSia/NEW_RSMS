/**
 * 이행점검계획(ImplMonitoring) 관련 타입 정의
 * 책무구조도 이행점검 기간설정 화면에서 사용
 *
 * Backend 테이블:
 * - impl_inspection_plans: 이행점검계획 (목록 조회)
 * - impl_inspection_items: 이행점검항목 (계획별 점검항목)
 * - dept_manager_manuals: 부서장업무메뉴얼 (점검대상 조회)
 */

// 이행점검계획 기본 데이터 타입 (impl_inspection_plans 테이블)
export interface PeriodSetting {
  id: string;                                 // implInspectionPlanId
  sequence: number;                           // 화면 표시용 순번
  ledgerOrderId: string;                     // 책무이행차수
  inspectionName: string;                    // 점검명 (implInspectionName)
  inspectionType: string;                    // 점검유형 (inspectionTypeCd -> 변환)
  inspectionTypeCd?: string;                 // 점검유형코드 (01:정기점검, 02:특별점검)
  inspectionStartDate: string;               // 점검 수행기간 시작일
  inspectionEndDate: string;                 // 점검 수행기간 종료일
  activityStartDate: string;                 // 활동 대상 기간 시작일 (UI용)
  activityEndDate: string;                   // 활동 대상 기간 종료일 (UI용)
  registrationDate: string;                  // 등록일자 (createdAt에서 변환)
  registrant: string;                        // 등록자 (createdBy)
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';   // 상태 (시행/중단/임시)
  statusCd?: string;                         // 상태코드 (01:계획, 02:진행중, 03:완료, 04:보류)
  statusText: string;                        // 상태 텍스트
  remarks?: string;                          // 비고
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  // 통계 정보
  totalItemCount?: number;                   // 전체 항목 수
  completedItemCount?: number;               // 완료 항목 수
  inProgressItemCount?: number;              // 진행중 항목 수
}

// 검색 필터 타입
export interface PeriodSettingFilters {
  ledgerOrderId?: string;                    // 책무이행차수
  searchPeriodStart?: string;                // 항목기간 시작일
  searchPeriodEnd?: string;                  // 항목기간 종료일
}

// 폼 데이터 타입 (등록/수정용)
export interface PeriodSettingFormData {
  ledgerOrderId: string;                     // 책무이행차수
  inspectionName: string;                    // 점검명
  inspectionTypeCd: string;                  // 점검유형코드 (01:정기점검, 02:특별점검)
  inspectionStartDate: string;               // 점검 수행기간 시작일
  inspectionEndDate: string;                 // 점검 수행기간 종료일
  activityStartDate?: string;                // 활동 대상 기간 시작일 (UI용)
  activityEndDate?: string;                  // 활동 대상 기간 종료일 (UI용)
  remarks?: string;                          // 비고
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';   // 상태
  manualCds: string[];                       // 선택된 점검대상 목록 (impl_inspection_items 생성용)
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