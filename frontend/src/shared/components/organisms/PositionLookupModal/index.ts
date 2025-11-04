/**
 * 직책조회팝업 모듈 내보내기
 * 여러 도메인에서 공통으로 사용하는 직책조회 팝업 컴포넌트
 */

// 메인 컴포넌트
export { default as PositionLookupModal } from './PositionLookupModal';
export { default } from './PositionLookupModal';

// 훅
export { usePositionLookup } from './hooks/usePositionLookup';

// 타입 정의
export type {
  Position,
  PositionSearchFilter,
  PositionSelectCallback,
  PositionLookupModalProps,
  PositionLookupResult,
  PositionSelectionState,
  PositionLookupApiResponse,
  UsePositionLookupReturn
} from './types/positionLookup.types';
