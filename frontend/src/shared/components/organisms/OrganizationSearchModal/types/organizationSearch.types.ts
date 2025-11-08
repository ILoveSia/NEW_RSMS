/**
 * 조직(부점)조회팝업 관련 타입 정의
 * 여러 도메인에서 공통으로 사용하는 조직조회 팝업
 */

// 조직 정보 타입
export interface Organization {
  id: string;
  orgCode: string;              // 조직코드
  hqCode?: string;              // 본부코드
  hqName?: string;              // 본부명
  orgName: string;              // 조직명
  orgType?: string;             // 조직유형 (부점/본점/지점 등)
  parentOrgCode?: string;       // 상위조직코드
  parentOrgName?: string;       // 상위조직명
  level?: number;               // 조직레벨
  sortOrder?: number;           // 정렬순서
  status: 'ACTIVE' | 'INACTIVE';// 상태
  isActive: boolean;            // 사용여부
  description?: string;         // 설명
  managerName?: string;         // 담당자명
  managerPhone?: string;        // 담당자전화번호
  createdAt: string;
  updatedAt: string;
}

// 조직조회 검색 필터 타입
export interface OrganizationSearchFilters {
  name?: string;                // 조직명
  orgCode?: string;             // 조직코드
  orgType?: string;             // 조직유형
  parentOrgCode?: string;       // 상위조직코드
}

// 조직조회 검색 결과 타입
export interface OrganizationSearchResult {
  content: Organization[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// 조직조회 모달 Props 타입
export interface OrganizationSearchModalProps {
  open: boolean;
  title?: string;               // 모달 제목 (기본: "부점 조회")
  multiple?: boolean;           // 다중 선택 가능 여부 (기본: false)
  onClose: () => void;
  onSelect: (selected: Organization | Organization[]) => void;
  onConfirm?: (selected: Organization | Organization[]) => void; // 확인 버튼 핸들러
  onCancel?: () => void;        // 취소 버튼 핸들러
  initialFilters?: Partial<OrganizationSearchFilters>;
  excludeOrgCodes?: string[];   // 제외할 조직코드 목록
  loading?: boolean;
  showActiveOnly?: boolean;     // 사용 중인 조직만 표시 여부 (기본: true)
}

// 조직 선택 상태 타입
export interface OrganizationSelectionState {
  selectedOrganizations: Organization[];
  filters: OrganizationSearchFilters;
  searchResults: Organization[];
  loading: boolean;
  error?: string;
}

// 조직유형 옵션 타입
export interface OrgTypeOption {
  value: string;
  label: string;
}

// 조직조회 API 응답 타입
export interface OrganizationSearchApiResponse {
  success: boolean;
  data: OrganizationSearchResult;
  message?: string;
  errorCode?: string;
}

// 조직조회 훅 리턴 타입
export interface UseOrganizationSearchReturn {
  organizations: Organization[];
  loading: boolean;
  error?: string;
  searchOrganizations: (filters: OrganizationSearchFilters) => Promise<void>;
  clearResults: () => void;
  totalCount: number;
}

// 페이지네이션 정보 타입
export interface OrganizationPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
