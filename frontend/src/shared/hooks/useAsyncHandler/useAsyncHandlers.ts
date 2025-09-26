/**
 * useAsyncHandlers - 다중 비동기 작업 처리 공통 훅
 *
 * @description 여러 개의 비동기 작업을 개별 로딩 상태와 함께 관리
 * - 개별 로딩 상태 관리 (search, excel, delete 등)
 * - 전역 로딩 상태 계산
 * - 각 작업별 독립적 에러 핸들링
 * - 모든 작업 일괄 취소 지원
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const { handlers, loading, cancel } = useAsyncHandlers({
 *   search: { key: 'search' },
 *   excel: { key: 'excel' },
 *   delete: { key: 'delete' }
 * });
 *
 * const handleSearch = useCallback(async () => {
 *   await handlers.search.execute(
 *     async () => { ... },
 *     { loading: '검색 중...', success: '완료', error: '실패' }
 *   );
 * }, [handlers.search]);
 * ```
 */

import { useMemo } from 'react';
import useAsyncHandler, { UseAsyncHandlerReturn } from './useAsyncHandler';

// 핸들러 설정 타입
export interface AsyncHandlerConfig {
  /** 작업 식별키 */
  key: string;
}

// 핸들러 딕셔너리 타입
export type AsyncHandlersConfig = Record<string, AsyncHandlerConfig>;

// 훅 반환 타입
export interface UseAsyncHandlersReturn<T extends AsyncHandlersConfig> {
  /** 각 작업별 핸들러 */
  handlers: Record<keyof T, UseAsyncHandlerReturn>;
  /** 개별 로딩 상태 (loadingStates와 호환) */
  loadingStates: Record<keyof T, boolean>;
  /** 전체 로딩 상태 (하나라도 로딩 중이면 true) */
  loading: boolean;
  /** 에러 상태 객체 */
  errors: Record<keyof T, Error | null>;
  /** 에러가 있는 작업이 있는지 여부 */
  hasErrors: boolean;
  /** 모든 작업 취소 */
  cancelAll: () => void;
  /** 모든 에러 초기화 */
  clearAllErrors: () => void;
  /** 특정 작업의 로딩 상태 확인 */
  isLoading: (key: keyof T) => boolean;
  /** 특정 작업의 에러 상태 확인 */
  hasError: (key: keyof T) => boolean;
}

/**
 * 다중 비동기 작업 처리를 위한 커스텀 훅
 *
 * @param config 각 작업별 설정
 * @returns 다중 비동기 작업 처리 유틸리티
 */
const useAsyncHandlers = <T extends AsyncHandlersConfig>(
  config: T
): UseAsyncHandlersReturn<T> => {
  // 각 키별로 개별 useAsyncHandler 생성
  const handlers = useMemo(() => {
    const result: Record<keyof T, UseAsyncHandlerReturn> = {} as any;

    for (const [handlerKey, handlerConfig] of Object.entries(config)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result[handlerKey as keyof T] = useAsyncHandler(handlerConfig.key);
    }

    return result;
  }, [config]);

  // 계산된 값들
  const computed = useMemo(() => {
    const handlerEntries = Object.entries(handlers) as Array<[keyof T, UseAsyncHandlerReturn]>;

    // 개별 로딩 상태
    const loadingStates = {} as Record<keyof T, boolean>;
    handlerEntries.forEach(([key, handler]) => {
      loadingStates[key] = handler.loading;
    });

    // 전체 로딩 상태
    const loading = handlerEntries.some(([, handler]) => handler.loading);

    // 에러 상태
    const errors = {} as Record<keyof T, Error | null>;
    handlerEntries.forEach(([key, handler]) => {
      errors[key] = handler.error;
    });

    // 에러 존재 여부
    const hasErrors = handlerEntries.some(([, handler]) => handler.error !== null);

    // 모든 작업 취소
    const cancelAll = () => {
      handlerEntries.forEach(([, handler]) => handler.cancel());
    };

    // 모든 에러 초기화
    const clearAllErrors = () => {
      handlerEntries.forEach(([, handler]) => handler.clearError());
    };

    // 특정 작업의 로딩 상태 확인
    const isLoading = (key: keyof T): boolean => {
      return handlers[key]?.loading || false;
    };

    // 특정 작업의 에러 상태 확인
    const hasError = (key: keyof T): boolean => {
      return handlers[key]?.error !== null;
    };

    return {
      loadingStates,
      loading,
      errors,
      hasErrors,
      cancelAll,
      clearAllErrors,
      isLoading,
      hasError
    };
  }, [handlers]);

  return {
    handlers,
    ...computed
  };
};

export default useAsyncHandlers;