/**
 * 부점조회팝업 관련 타입 정의
 * 여러 도메인에서 공통으로 사용하는 부점조회 팝업
 */

// 부점 정보 타입
export interface Branch {
  id: string;
  branchCode: string;           // 부점코드
  branchName: string;           // 부점명
  branchType: string;           // 본부종류
  zipCode: string;              // 출장소여부
  managerName: string;          // 폐쇄일자
  isActive: boolean;            // 활성 상태
  address?: string;             // 주소
  phone?: string;               // 전화번호
  fax?: string;                 // 팩스번호
  createdAt: string;
  updatedAt: string;
}

// 부점조회 검색 필터 타입
export interface BranchLookupFilters {
  branchCode?: string;          // 부점코드
  branchName?: string;          // 부점명
  branchType?: string;          // 본부종류 (전체, 본점, 지점, 출장소 등)
  managerName?: string;         // 폐쇄여부
}

// 부점조회 검색 결과 타입
export interface BranchLookupResult {
  content: Branch[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// 부점조회 모달 Props 타입
export interface BranchLookupModalProps {
  open: boolean;
  title?: string;               // 모달 제목 (기본: "부점 조회 팝업")
  multiple?: boolean;           // 다중 선택 가능 여부 (기본: false)
  onClose: () => void;
  onSelect: (selected: Branch | Branch[]) => void;
  initialFilters?: Partial<BranchLookupFilters>;
  excludeBranchIds?: string[];  // 제외할 부점 ID 목록
  loading?: boolean;
}

// 부점 선택 상태 타입
export interface BranchSelectionState {
  selectedBranches: Branch[];
  filters: BranchLookupFilters;
  searchResults: Branch[];
  loading: boolean;
  error?: string;
}

// 본부종류 옵션 타입
export interface BranchTypeOption {
  value: string;
  label: string;
}

// 부점조회 API 응답 타입
export interface BranchLookupApiResponse {
  success: boolean;
  data: BranchLookupResult;
  message?: string;
  errorCode?: string;
}

// 부점조회 훅 리턴 타입
export interface UseBranchLookupReturn {
  branches: Branch[];
  loading: boolean;
  error?: string;
  searchBranches: (filters: BranchLookupFilters) => Promise<void>;
  clearResults: () => void;
  totalCount: number;
}