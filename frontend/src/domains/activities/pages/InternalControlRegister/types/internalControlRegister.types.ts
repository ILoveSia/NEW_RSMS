/**
 * 내부통제장치등록 관련 타입 정의
 *
 * 도메인: activities > InternalControlRegister
 * 참조: 요구사항정의서 - 04.책무구조도_관리활동_내부통제장치등록
 */

// 내부통제장치 메인 데이터 인터페이스
export interface InternalControlRegister {
  id: string;
  sequence: number;
  businessAreaName: string; // 업무영역명
  businessAreaCode: string; // 업무영역코드
  businessAreaCodeDuplicate: string; // 업무영역코드 (중복 표시)
  utilizationStatus: string; // 활용현황 (외부 시스템 연계 현황)
  utilizationDetail: string; // 활용상세 (상세 내용)
  sortOrder: number; // 정렬순서
  isActive: boolean; // 사용여부

  // 메타 정보
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}

// 검색 필터 인터페이스
export interface InternalControlRegisterFilters {
  businessAreaName: string; // 업무영역명 검색
  businessAreaCode: string; // 업무영역코드 검색
  isActive: string; // 사용여부 필터 ('전체', 'Y', 'N')
}

// 폼 데이터 인터페이스 (등록/수정용)
export interface InternalControlRegisterFormData {
  businessAreaName: string; // 업무영역명 (필수)
  businessAreaCode: string; // 업무영역코드 (필수)
  utilizationStatus: string; // 활용현황 설명
  utilizationDetail: string; // 활용상세 내용
  sortOrder: number; // 정렬순서
  isActive: boolean; // 사용여부 (기본값: true)
}

// 모달 상태 인터페이스
export interface InternalControlRegisterModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedItem: InternalControlRegister | null;
}

// 페이지네이션 인터페이스
export interface InternalControlRegisterPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 통계 정보 인터페이스
export interface InternalControlRegisterStatistics {
  totalItems: number; // 총 내부통제장치 수
  activeItems: number; // 활성 항목 수
  inactiveItems: number; // 비활성 항목 수
  externalSystemCount: number; // 외부통제장치 현황 (예: 1건)
  systemUptime: number; // 시스템 가동률
}

// 업무영역 옵션 인터페이스
export interface BusinessAreaOption {
  value: string;
  label: string;
  code: string;
}

// 사용여부 옵션 인터페이스
export interface UsageStatusOption {
  value: string;
  label: string;
}

// API 응답 인터페이스
export interface InternalControlRegisterApiResponse {
  data: InternalControlRegister[];
  pagination: InternalControlRegisterPagination;
  statistics: InternalControlRegisterStatistics;
  message?: string;
  success: boolean;
}

// 검색 결과 인터페이스
export interface InternalControlRegisterSearchResult {
  items: InternalControlRegister[];
  totalCount: number;
  searchTime: number; // 검색 소요 시간 (ms)
  filters: InternalControlRegisterFilters;
}

// 일괄 처리 작업 타입
export type BatchActionType = 'activate' | 'deactivate' | 'delete';

// 일괄 처리 결과 인터페이스
export interface BatchProcessResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

// 로딩 상태 인터페이스
export interface InternalControlRegisterLoadingStates {
  search: boolean;
  excel: boolean;
  add: boolean;
  save: boolean;
  delete: boolean;
  copy: boolean;
}

// 에러 상태 인터페이스
export interface InternalControlRegisterError {
  type: 'NETWORK' | 'PERMISSION' | 'VALIDATION' | 'SERVER';
  message: string;
  code?: string;
  details?: any;
}

// 내부통제장치 상세 정보 (상세 모달용)
export interface InternalControlRegisterDetail extends InternalControlRegister {
  externalSystems: ExternalSystemInfo[]; // 외부 시스템 연계 정보
  relatedItems: InternalControlRegister[]; // 관련 내부통제장치
  changeHistory: InternalControlRegisterHistory[]; // 변경 이력
}

// 외부 시스템 연계 정보
export interface ExternalSystemInfo {
  id: string;
  systemName: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncDate: string;
  syncStatus: string;
}

// 내부통제장치 이력 인터페이스
export interface InternalControlRegisterHistory {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
  actionDate: string;
  actionBy: string;
  actionByName: string;
  description: string;
  changes?: FieldChange[];
}

// 필드 변경 이력
export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}

// 유틸리티 타입들
export type InternalControlRegisterField = keyof InternalControlRegister;
export type InternalControlRegisterFilterField = keyof InternalControlRegisterFilters;
export type InternalControlRegisterFormField = keyof InternalControlRegisterFormData;

// 정렬 옵션
export interface SortOption {
  field: InternalControlRegisterField;
  direction: 'asc' | 'desc';
  label: string;
}

// 내보내기 옵션
export interface ExportOptions {
  format: 'EXCEL' | 'CSV' | 'PDF';
  includeFields: InternalControlRegisterField[];
  filters: InternalControlRegisterFilters;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}