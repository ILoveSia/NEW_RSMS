/**
 * 부서조회팝업 모듈 내보내기
 * 여러 도메인에서 공통으로 사용하는 부서조회 팝업 컴포넌트
 */

// 메인 컴포넌트
export { default as BranchLookupModal } from './BranchLookupModal';

// 훅
export { useBranchLookup } from './hooks/useBranchLookup';

// 타입 정의
export type {
  Branch,
  BranchLookupFilters,
  BranchLookupResult,
  BranchLookupModalProps,
  BranchSelectionState,
  BranchTypeOption,
  BranchLookupApiResponse,
  UseBranchLookupReturn
} from './types/branchLookup.types';