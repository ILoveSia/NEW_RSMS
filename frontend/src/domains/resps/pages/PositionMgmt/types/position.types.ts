/**
 * 직책관리 타입 정의
 */

// 직책 기본 정보
export interface Position {
  id: string;
  positionName: string;      // 직책명
  headquarters: string;      // 본부구분
  departmentName: string;    // 부서명
  divisionName: string;      // 부정명
  registrationDate: string;  // 등록일자
  registrar: string;         // 등록자
  registrarPosition: string; // 등록자직책
  modificationDate: string;  // 변경일자
  modifier: string;          // 변경자
  modifierPosition: string;  // 변경자직책
  status: string;            // 상태
  isActive: boolean;         // 사용여부
  approvalStatus: string;    // 결재여부
  dual: string;              // 겸직여부
}

// 직책 생성/수정 DTO
export interface PositionFormData {
  positionName: string;
  headquarters: string;
  departmentName: string;
  divisionName: string;
}

// 검색 필터
export interface PositionFilters {
  ledgerOrderId: string;     // 원장차수 필터
  positionName: string;      // 직책명 검색
  isActive: string;          // 사용여부 필터
}

// 페이징 정보
export interface PositionPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// API 응답 타입
export interface PositionListResponse {
  content: Position[];
  pagination: PositionPagination;
}

// 모달 상태
export interface PositionModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedPosition: Position | null;
}

// 본부구분 옵션
export interface HeadquartersOption {
  value: string;
  label: string;
}

// 상태 옵션
export interface StatusOption {
  value: string;
  label: string;
}

// 사용여부 옵션
export interface ActiveOption {
  value: string;
  label: string;
}
