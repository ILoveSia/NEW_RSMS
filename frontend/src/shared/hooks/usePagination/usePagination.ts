/**
 * usePagination - 페이지네이션 상태 관리 공통 훅
 *
 * @description 모든 업무 페이지에서 사용하는 표준 페이지네이션 관리
 * - 페이지, 사이즈, 총 개수 상태 관리
 * - 페이지 이동 및 사이즈 변경 핸들러
 * - 페이지 정보 계산 (시작/끝 인덱스, 페이지 범위 등)
 * - URL 쿼리 파라미터 연동 지원
 * - 서버사이드/클라이언트사이드 페이징 지원
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const {
 *   pagination,
 *   goToPage,
 *   changePageSize,
 *   reset,
 *   info
 * } = usePagination({
 *   initialPage: 1,
 *   initialSize: 20,
 *   total: 150
 * });
 * ```
 */

import { useCallback, useMemo, useState } from 'react';

// 페이지네이션 상태 타입
export interface PaginationState {
  /** 현재 페이지 (1-based) */
  page: number;
  /** 페이지 크기 */
  size: number;
  /** 총 아이템 수 */
  total: number;
  /** 총 페이지 수 */
  totalPages: number;
}

// 페이지네이션 설정 타입
export interface PaginationOptions {
  /** 초기 페이지 (기본: 1) */
  initialPage?: number;
  /** 초기 페이지 크기 (기본: 20) */
  initialSize?: number;
  /** 총 아이템 수 (기본: 0) */
  total?: number;
  /** 페이지 크기 옵션 목록 */
  sizeOptions?: number[];
  /** 최대 페이지 크기 */
  maxSize?: number;
  /** URL 쿼리 파라미터와 동기화 여부 */
  syncWithUrl?: boolean;
  /** 페이지 변경 시 콜백 */
  onPageChange?: (page: number, size: number) => void;
  /** 페이지 크기 변경 시 콜백 */
  onSizeChange?: (page: number, size: number) => void;
}

// 페이지네이션 정보 타입
export interface PaginationInfo {
  /** 현재 페이지의 첫 번째 아이템 인덱스 (0-based) */
  startIndex: number;
  /** 현재 페이지의 마지막 아이템 인덱스 (0-based) */
  endIndex: number;
  /** 현재 페이지의 첫 번째 아이템 번호 (1-based, UI 표시용) */
  startItem: number;
  /** 현재 페이지의 마지막 아이템 번호 (1-based, UI 표시용) */
  endItem: number;
  /** 이전 페이지 존재 여부 */
  hasPrevious: boolean;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 첫 페이지 여부 */
  isFirst: boolean;
  /** 마지막 페이지 여부 */
  isLast: boolean;
  /** 페이지 범위 (페이지 네비게이션용) */
  pageRange: number[];
  /** 비어있는 상태 여부 */
  isEmpty: boolean;
}

// 훅 반환 타입
export interface UsePaginationReturn {
  /** 현재 페이지네이션 상태 */
  pagination: PaginationState;
  /** 페이지네이션 정보 */
  info: PaginationInfo;
  /** 특정 페이지로 이동 */
  goToPage: (page: number) => void;
  /** 이전 페이지로 이동 */
  goToPrevious: () => void;
  /** 다음 페이지로 이동 */
  goToNext: () => void;
  /** 첫 페이지로 이동 */
  goToFirst: () => void;
  /** 마지막 페이지로 이동 */
  goToLast: () => void;
  /** 페이지 크기 변경 */
  changePageSize: (size: number) => void;
  /** 총 아이템 수 업데이트 */
  updateTotal: (total: number) => void;
  /** 페이지네이션 초기화 */
  reset: (options?: Partial<PaginationOptions>) => void;
  /** 현재 설정으로 URL 쿼리 생성 */
  toQuery: () => Record<string, string>;
  /** URL 쿼리에서 설정 복원 */
  fromQuery: (query: Record<string, string>) => void;
}

/**
 * 페이지네이션 상태 관리를 위한 커스텀 훅
 */
const usePagination = (options: PaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialSize = 20,
    total = 0,
    sizeOptions = [10, 20, 50, 100],
    maxSize = 1000,
    onPageChange,
    onSizeChange
  } = options;

  // 상태 관리
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [size, setSize] = useState(Math.min(maxSize, Math.max(1, initialSize)));
  const [totalItems, setTotalItems] = useState(Math.max(0, total));

  // 페이지네이션 상태 계산
  const pagination = useMemo<PaginationState>(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / size));
    const currentPage = Math.min(page, totalPages);

    return {
      page: currentPage,
      size,
      total: totalItems,
      totalPages
    };
  }, [page, size, totalItems]);

  // 페이지네이션 정보 계산
  const info = useMemo<PaginationInfo>(() => {
    const { page: currentPage, size: pageSize, total: totalCount, totalPages } = pagination;

    // 인덱스 계산 (0-based)
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalCount - 1);

    // 아이템 번호 계산 (1-based, UI 표시용)
    const startItem = totalCount > 0 ? startIndex + 1 : 0;
    const endItem = totalCount > 0 ? endIndex + 1 : 0;

    // 페이지 상태
    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    // 페이지 범위 계산 (페이지 네비게이션용, 최대 10개)
    const maxPageButtons = 10;
    const half = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // 끝에서 시작 조정
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    const pageRange = [];
    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }

    return {
      startIndex,
      endIndex,
      startItem,
      endItem,
      hasPrevious,
      hasNext,
      isFirst,
      isLast,
      pageRange,
      isEmpty: totalCount === 0
    };
  }, [pagination]);

  // 페이지 이동 핸들러들
  const goToPage = useCallback((targetPage: number) => {
    const newPage = Math.max(1, Math.min(pagination.totalPages, targetPage));
    if (newPage !== page) {
      setPage(newPage);
      onPageChange?.(newPage, size);
    }
  }, [page, size, pagination.totalPages, onPageChange]);

  const goToPrevious = useCallback(() => {
    if (info.hasPrevious) {
      goToPage(pagination.page - 1);
    }
  }, [info.hasPrevious, pagination.page, goToPage]);

  const goToNext = useCallback(() => {
    if (info.hasNext) {
      goToPage(pagination.page + 1);
    }
  }, [info.hasNext, pagination.page, goToPage]);

  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLast = useCallback(() => {
    goToPage(pagination.totalPages);
  }, [pagination.totalPages, goToPage]);

  // 페이지 크기 변경
  const changePageSize = useCallback((newSize: number) => {
    const validSize = Math.min(maxSize, Math.max(1, newSize));
    if (validSize !== size) {
      setSize(validSize);

      // 현재 시작 아이템을 기준으로 새로운 페이지 계산
      const currentStartItem = (pagination.page - 1) * size + 1;
      const newPage = Math.ceil(currentStartItem / validSize);
      setPage(newPage);

      onSizeChange?.(newPage, validSize);
    }
  }, [size, maxSize, pagination.page, onSizeChange]);

  // 총 아이템 수 업데이트
  const updateTotal = useCallback((newTotal: number) => {
    const validTotal = Math.max(0, newTotal);
    if (validTotal !== totalItems) {
      setTotalItems(validTotal);

      // 현재 페이지가 새 총 페이지 수를 초과하면 조정
      const newTotalPages = Math.max(1, Math.ceil(validTotal / size));
      if (page > newTotalPages) {
        setPage(newTotalPages);
        onPageChange?.(newTotalPages, size);
      }
    }
  }, [totalItems, size, page, onPageChange]);

  // 페이지네이션 초기화
  const reset = useCallback((resetOptions: Partial<PaginationOptions> = {}) => {
    const newPage = Math.max(1, resetOptions.initialPage || initialPage);
    const newSize = Math.min(maxSize, Math.max(1, resetOptions.initialSize || initialSize));
    const newTotal = Math.max(0, resetOptions.total || 0);

    setPage(newPage);
    setSize(newSize);
    setTotalItems(newTotal);

    onPageChange?.(newPage, newSize);
  }, [initialPage, initialSize, maxSize, onPageChange]);

  // URL 쿼리 변환
  const toQuery = useCallback((): Record<string, string> => {
    return {
      page: pagination.page.toString(),
      size: pagination.size.toString()
    };
  }, [pagination]);

  const fromQuery = useCallback((query: Record<string, string>) => {
    const queryPage = parseInt(query.page) || initialPage;
    const querySize = parseInt(query.size) || initialSize;

    const newPage = Math.max(1, queryPage);
    const newSize = Math.min(maxSize, Math.max(1, querySize));

    setPage(newPage);
    setSize(newSize);
  }, [initialPage, initialSize, maxSize]);

  return {
    pagination,
    info,
    goToPage,
    goToPrevious,
    goToNext,
    goToFirst,
    goToLast,
    changePageSize,
    updateTotal,
    reset,
    toQuery,
    fromQuery
  };
};

export default usePagination;