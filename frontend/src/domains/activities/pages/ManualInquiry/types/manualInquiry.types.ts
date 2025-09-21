/**
 * 업무메뉴얼조회 관련 타입 정의
 *
 * 도메인: activities > ManualInquiry
 * 참조: 요구사항정의서 - 03.책무구조도_관리활동_업무메뉴얼조회
 */

// 업무메뉴얼 메인 데이터 인터페이스
export interface ManualInquiry {
  id: string;
  sequence: number;
  departmentName: string; // 부정명 (부서명)
  managementActivityCode: string; // 관리활동코드
  managementActivityName: string; // 관리활동명
  managementActivityDetail: string; // 관리활동상세
  riskAssessmentElement: string; // 위험평가요소
  managementActivityType: string; // 관리활동구분
  startYearMonth: string; // 시작년월 (YYYY-MM)
  endYearMonth: string; // 관리활동종료년월 (YYYY-MM)
  relatedRegulation: string; // 관련규가 (관련규정)
  riskValue: string; // 위험가치 (위험도)
  organizationSystemDescription: boolean; // 조직체계설명여부
  implementationProcedureStatus: string; // 이행절차현안
  ceoRiskAssessment: boolean; // CEO 총괄위험평가여부
  managementRepresentative: string; // 관리담당자대표자
  managementDetail: string; // 관리담당자상세
  managementDuplication: string; // 관리담당자중복
  managementChangeContent: string; // 관리담당자변경내용
  responsibilityDocument: string; // 책무대비서류
  responsibility: string; // 책무
  progress: string; // 진전

  // 메타 정보
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  downloadCount: number;
  fileSize?: string;
  fileType?: string;
  isActive: boolean;
  accessLevel: 'PUBLIC' | 'DEPARTMENT' | 'RESTRICTED';
}

// 검색 필터 인터페이스
export interface ManualInquiryFilters {
  departmentCode: string; // 부서코드 (기본값: "0000")
  searchKeyword: string; // 검색어 (메뉴얼명, 관리활동코드 등)
  managementActivityType: string; // 관리활동구분 필터
  startYearMonth: string; // 시작년월 범위
  endYearMonth: string; // 종료년월 범위
  riskValue: string; // 위험도 필터
  accessLevel: string; // 접근 권한 필터
}

// 폼 데이터 인터페이스 (등록/수정용)
export interface ManualInquiryFormData {
  departmentName: string;
  managementActivityCode: string;
  managementActivityName: string;
  managementActivityDetail: string;
  riskAssessmentElement: string;
  managementActivityType: string;
  startYearMonth: string;
  endYearMonth?: string;
  relatedRegulation?: string;
  riskValue: string;
  managementRepresentative: string;
}

// 모달 상태 인터페이스
export interface ManualInquiryModalState {
  detailModal: boolean;
  addModal: boolean;
  selectedManual: ManualInquiry | null;
}

// 페이지네이션 인터페이스
export interface ManualInquiryPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 통계 정보 인터페이스
export interface ManualInquiryStatistics {
  totalManuals: number; // 총 메뉴얼 수
  departmentCount: number; // 부서별 메뉴얼 조회 건수
  downloadCount: number; // 총 다운로드 수
  systemUptime: number; // 시스템 가동률
  activeManuals: number; // 활성 메뉴얼 수
  monthlyDownloads: number; // 월별 다운로드 수
}

// 관리활동구분 옵션
export interface ActivityTypeOption {
  value: string;
  label: string;
  description?: string;
}

// 부서 옵션
export interface DepartmentOption {
  value: string;
  label: string;
  code: string;
  level: number; // 조직 레벨
  parentCode?: string; // 상위 부서 코드
}

// 위험도 옵션
export interface RiskValueOption {
  value: string;
  label: string;
}

// API 응답 인터페이스
export interface ManualInquiryApiResponse {
  data: ManualInquiry[];
  pagination: ManualInquiryPagination;
  statistics: ManualInquiryStatistics;
  message?: string;
  success: boolean;
}

// 검색 결과 인터페이스
export interface ManualInquirySearchResult {
  manuals: ManualInquiry[];
  totalCount: number;
  searchTime: number; // 검색 소요 시간 (ms)
  filters: ManualInquiryFilters;
}

// 다운로드 이력 인터페이스
export interface ManualDownloadHistory {
  id: string;
  manualId: string;
  manualName: string;
  userId: string;
  userName: string;
  downloadDate: string;
  fileSize: string;
  ipAddress: string;
  userAgent: string;
}

// 컬럼 표시/숨김 설정
export interface ManualColumnSettings {
  [key: string]: {
    visible: boolean;
    width?: number;
    pinned?: 'left' | 'right' | null;
    order: number;
  };
}

// 로딩 상태 인터페이스
export interface ManualInquiryLoadingStates {
  search: boolean;
  excel: boolean;
  download: boolean;
  detail: boolean;
  save: boolean;
  delete: boolean;
}

// 에러 상태 인터페이스
export interface ManualInquiryError {
  type: 'NETWORK' | 'PERMISSION' | 'VALIDATION' | 'SERVER';
  message: string;
  code?: string;
  details?: any;
}

// 업무메뉴얼 상세 정보 (상세 모달용)
export interface ManualInquiryDetail extends ManualInquiry {
  attachments: ManualAttachment[];
  history: ManualInquiryHistory[];
  relatedManuals: ManualInquiry[];
  permissions: ManualPermission[];
}

// 첨부파일 인터페이스
export interface ManualAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  uploadBy: string;
  downloadCount: number;
  isActive: boolean;
}

// 메뉴얼 이력 인터페이스
export interface ManualInquiryHistory {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'DOWNLOAD' | 'VIEW';
  actionDate: string;
  actionBy: string;
  actionByName: string;
  description: string;
  changes?: ManualFieldChange[];
}

// 필드 변경 이력
export interface ManualFieldChange {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}

// 권한 인터페이스
export interface ManualPermission {
  userId: string;
  userName: string;
  permission: 'READ' | 'WRITE' | 'DELETE' | 'DOWNLOAD';
  grantedDate: string;
  grantedBy: string;
}

// 유틸리티 타입들
export type ManualInquiryField = keyof ManualInquiry;
export type ManualInquiryFilterField = keyof ManualInquiryFilters;
export type ManualInquiryFormField = keyof ManualInquiryFormData;

// 정렬 옵션
export interface ManualSortOption {
  field: ManualInquiryField;
  direction: 'asc' | 'desc';
  label: string;
}

// 내보내기 옵션
export interface ManualExportOptions {
  format: 'EXCEL' | 'CSV' | 'PDF';
  includeFields: ManualInquiryField[];
  filters: ManualInquiryFilters;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}