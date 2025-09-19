/**
 * 책무관리 타입 정의
 * PositionMgmt.tsx 표준 패턴을 따라 설계됨
 */

// 기본 책무 정보
export interface Responsibility {
  id: string;
  seq: number;
  positionCode: string;
  positionName: string;
  headquarters: string;
  departmentName: string;
  divisionName: string;
  responsibilityCode: string;
  responsibility: string;
  responsibilityDetail: string;
  managementDutyCode: string;
  managementDuty: string;
  registrationDate: string;
  registrar: string;
  registrarPosition: string;
  modificationDate?: string;
  modifier?: string;
  modifierPosition?: string;
  status: 'active' | 'inactive';
  isActive: boolean;
}

// 책무 세부 정보 (상세 팝업용)
export interface ResponsibilityDetail {
  id: string;
  responsibilityCode: string;
  responsibility: string;
  relatedBasis?: string;
  lastModificationDate: string;
  isActive: boolean;
}

// 책무세부내용 정보
export interface ResponsibilityDetailContent {
  id: string;
  responsibilityCode: string;
  responsibilityDetailContent: string;
  lastModificationDate: string;
  isActive: boolean;
}

// 관리의무 정보
export interface ManagementDuty {
  id: string;
  managementDutyCode: string;
  managementDutyCategory: string;
  managementDutySubCategory: string;
  managementDuty: string;
  divisionName: string;
  isActive: boolean;
}

// 직책 기본 정보 (등록/상세 팝업용)
export interface PositionInfo {
  positionCode: string;
  positionName: string;
  headquarters: string;
  departmentName: string;
  divisionName: string;
}

// 검색 필터
export interface ResponsibilityFilters {
  positionName: string;
  departmentName: string;
  divisionName: string;
  responsibilityDetailContent: string;
  managementDuty: string;
  status: string;
}

// 페이지네이션
export interface ResponsibilityPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 모달 상태
export interface ResponsibilityModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedResponsibility: Responsibility | null;
}

// 폼 데이터 (등록용)
export interface ResponsibilityFormData {
  positionCode: string;
  responsibilities: Array<{
    responsibility: string;
    relatedBasis?: string;
  }>;
  responsibilityDetails: Array<{
    responsibilityCode: string;
    responsibilityDetailContent: string;
  }>;
  managementDuties: Array<{
    managementDutyCode: string;
    managementDutyCategory: string;
    managementDutySubCategory: string;
    managementDuty: string;
    divisionName: string;
  }>;
}

// API 응답 타입
export interface ResponsibilityListResponse {
  content: Responsibility[];
  pagination: ResponsibilityPagination;
  statistics: {
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    byHeadquarters: Record<string, number>;
  };
}

// 책무 등록 요청 타입
export interface CreateResponsibilityRequest {
  positionCode: string;
  responsibilities: Array<{
    responsibility: string;
    relatedBasis?: string;
  }>;
  responsibilityDetails: Array<{
    responsibilityCode: string;
    responsibilityDetailContent: string;
  }>;
  managementDuties: Array<{
    managementDutyCode: string;
    managementDutyCategory: string;
    managementDutySubCategory: string;
    managementDuty: string;
    divisionName: string;
  }>;
}

// 책무 수정 요청 타입
export interface UpdateResponsibilityRequest extends CreateResponsibilityRequest {
  id: string;
}

// 검색 요청 타입
export interface ResponsibilitySearchRequest {
  filters: ResponsibilityFilters;
  pagination: {
    page: number;
    size: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}