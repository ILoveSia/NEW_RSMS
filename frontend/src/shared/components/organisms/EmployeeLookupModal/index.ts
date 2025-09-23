/**
 * 직원조회팝업 모듈 내보내기
 * 여러 도메인에서 공통으로 사용하는 직원조회 팝업 컴포넌트
 */

// 메인 컴포넌트
export { default as EmployeeLookupModal } from './EmployeeLookupModal';

// 훅
export { useEmployeeLookup } from './hooks/useEmployeeLookup';

// 타입 정의
export type {
  Employee,
  EmployeeLookupFilters,
  EmployeeLookupResult,
  EmployeeLookupModalProps,
  EmployeeSelectionState,
  DepartmentOption,
  EmployeeLookupApiResponse,
  UseEmployeeLookupReturn,
  EmployeePagination
} from './types/employeeLookup.types';