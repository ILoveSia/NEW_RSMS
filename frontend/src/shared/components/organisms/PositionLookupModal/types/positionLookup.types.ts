/**
 * 직책조회팝업 관련 타입 정의
 * 여러 도메인에서 공통으로 사용하는 직책조회 팝업
 */

import { Position, PositionSearchFilter, PositionSelectCallback } from '@/shared/types/position';

/**
 * 직책조회 모달 Props 타입
 */
export interface PositionLookupModalProps {
  open: boolean;                              // 다이얼로그 열림 상태
  onClose: () => void;                        // 다이얼로그 닫기 콜백
  onSelect: PositionSelectCallback;           // 직책 선택 콜백
  title?: string;                             // 다이얼로그 제목 (기본: "직책 조회 팝업")
  singleSelection?: boolean;                  // 단일 선택 모드 (기본: true)
  initialFilter?: PositionSearchFilter;       // 초기 검색 필터
}

/**
 * 직책 검색 결과 타입
 */
export interface PositionLookupResult {
  content: Position[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

/**
 * 직책 선택 상태 타입
 */
export interface PositionSelectionState {
  selectedPositions: Position[];
  filters: PositionSearchFilter;
  searchResults: Position[];
  loading: boolean;
  error?: string;
}

/**
 * 직책조회 API 응답 타입
 */
export interface PositionLookupApiResponse {
  success: boolean;
  data: PositionLookupResult;
  message?: string;
  errorCode?: string;
}

/**
 * 직책조회 훅 리턴 타입
 */
export interface UsePositionLookupReturn {
  positions: Position[];
  loading: boolean;
  error?: string;
  searchPositions: (filters: PositionSearchFilter) => Promise<void>;
  clearResults: () => void;
  totalCount: number;
}

// Re-export from shared types for convenience
export type {
  Position,
  PositionSearchFilter,
  PositionSelectCallback
} from '@/shared/types/position';
