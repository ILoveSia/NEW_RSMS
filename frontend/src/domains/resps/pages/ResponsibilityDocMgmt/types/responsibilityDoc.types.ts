/**
 * 책무기술서관리 타입 정의
 */

// 기본 엔티티 인터페이스
export interface ResponsibilityDoc {
  id: string;
  seq: number;
  positionName: string;
  requestDate: string;
  requestorPosition: string;
  requestor: string;
  approvalDate?: string;
  approverPosition?: string;
  approver?: string;
  isChanged: boolean;
  isActive: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  registrar: string;
  registrarPosition: string;
  modificationDate: string;
  modifier: string;
  modifierPosition: string;
}

// 임의 직책 정보
export interface ArbitraryPositionInfo {
  positionName: string;
  positionTitle: string;
  isDual: boolean;
  employeeName: string;
  currentPositionDate: string;
  dualPositionDetails?: string;
  responsibleDepts: string;
}

// 주관협의체 정보
export interface MainCommitteeInfo {
  id: string;
  committeeName: string;
  chairperson: string;
  frequency: string;
  mainAgenda: string;
}

// 책무 정보
export interface ResponsibilityInfo {
  id: string;
  seq: number;
  responsibility: string;
  responsibilityDetail: string;
  relatedBasis: string;
}

// 관리의무 정보
export interface ManagementDutyInfo {
  id: string;
  seq: number;
  managementDuty: string;
  managementDutyDetail: string;
  relatedBasis: string;
}

// 폼 데이터 인터페이스
export interface ResponsibilityDocFormData {
  arbitraryPosition: ArbitraryPositionInfo;
  mainCommittees: MainCommitteeInfo[];
  responsibilityOverview: string;
  responsibilityBackground: string;
  responsibilityBackgroundDate: string;
  responsibilities: ResponsibilityInfo[];
  managementDuties: ManagementDutyInfo[];
}

// 필터 인터페이스
export interface ResponsibilityDocFilters {
  positionName: string;
  status: string;
  isActive: string;
  approvalStatus: string;
}

// 페이지네이션 인터페이스
export interface ResponsibilityDocPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 모달 상태 인터페이스
export interface ResponsibilityDocModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedDoc: ResponsibilityDoc | null;
}

// 검색 필터 옵션
export interface ResponsibilityDocFilterOptions {
  statusOptions: Array<{ value: string; label: string }>;
  approvalStatusOptions: Array<{ value: string; label: string }>;
  isActiveOptions: Array<{ value: string; label: string }>;
}

// API 관련 인터페이스
export interface ResponsibilityDocListRequest {
  filters: ResponsibilityDocFilters;
  pagination: ResponsibilityDocPagination;
}

export interface ResponsibilityDocListResponse {
  data: ResponsibilityDoc[];
  pagination: ResponsibilityDocPagination;
}

export interface ResponsibilityDocCreateRequest {
  formData: ResponsibilityDocFormData;
}

export interface ResponsibilityDocUpdateRequest {
  id: string;
  formData: ResponsibilityDocFormData;
}

// 통계 정보
export interface ResponsibilityDocStatistics {
  total: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  activeCount: number;
  inactiveCount: number;
}

// 컴포넌트 Props 인터페이스
export interface ResponsibilityDocMgmtProps {
  className?: string;
}

export interface ResponsibilityDocFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  doc?: ResponsibilityDoc | null;
  onClose: () => void;
  onSave: (formData: ResponsibilityDocFormData) => void;
  onUpdate?: (id: string, formData: ResponsibilityDocFormData) => void;
  loading?: boolean;
}

// 에러 처리
export interface ResponsibilityDocError {
  code: string;
  message: string;
  field?: string;
}

// 로딩 상태
export interface ResponsibilityDocLoadingStates {
  search: boolean;
  excel: boolean;
  delete: boolean;
  save: boolean;
  create: boolean;
  update: boolean;
}