/**
 * 직원조회팝업 관련 타입 정의
 * 여러 도메인에서 공통으로 사용하는 직원조회 팝업
 */

// 직원 정보 타입
export interface Employee {
  id: string;
  employeeId: string;           // 직번
  name: string;                 // 직원명
  branchCode: string;           // 부서코드
  branchName: string;           // 부서명
  department: string;           // 직급
  position: string;             // 직책
  status: 'ACTIVE' | 'INACTIVE';// 상태 (재직/퇴직)
  email?: string;               // 이메일
  phone?: string;               // 전화번호
  hireDate?: string;            // 입사일
  retireDate?: string;          // 퇴사일
  specialtyArea?: string;       // 전문영역
  isActive: boolean;            // 활성 상태
  createdAt: string;
  updatedAt: string;
}

// 직원조회 검색 필터 타입
export interface EmployeeLookupFilters {
  name?: string;                // 직원명
  employeeId?: string;          // 직번
  department?: string;          // 직급
  branchCode?: string;          // 부서코드 (추가 필터)
}

// 직원조회 검색 결과 타입
export interface EmployeeLookupResult {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// 직원조회 모달 Props 타입
export interface EmployeeLookupModalProps {
  open: boolean;
  title?: string;               // 모달 제목 (기본: "직원 조회 팝업")
  multiple?: boolean;           // 다중 선택 가능 여부 (기본: false)
  onClose: () => void;
  onSelect: (selected: Employee | Employee[]) => void;
  onConfirm?: (selected: Employee | Employee[]) => void; // 확인 버튼 핸들러
  onCancel?: () => void;        // 취소 버튼 핸들러
  initialFilters?: Partial<EmployeeLookupFilters>;
  excludeEmployeeIds?: string[]; // 제외할 직원 ID 목록
  loading?: boolean;
  showActiveOnly?: boolean;     // 재직자만 표시 여부 (기본: true)
}

// 직원 선택 상태 타입
export interface EmployeeSelectionState {
  selectedEmployees: Employee[];
  filters: EmployeeLookupFilters;
  searchResults: Employee[];
  loading: boolean;
  error?: string;
}

// 직급 옵션 타입
export interface DepartmentOption {
  value: string;
  label: string;
}

// 직원조회 API 응답 타입
export interface EmployeeLookupApiResponse {
  success: boolean;
  data: EmployeeLookupResult;
  message?: string;
  errorCode?: string;
}

// 직원조회 훅 리턴 타입
export interface UseEmployeeLookupReturn {
  employees: Employee[];
  loading: boolean;
  error?: string;
  searchEmployees: (filters: EmployeeLookupFilters) => Promise<void>;
  clearResults: () => void;
  totalCount: number;
}

// 페이지네이션 정보 타입
export interface EmployeePagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}