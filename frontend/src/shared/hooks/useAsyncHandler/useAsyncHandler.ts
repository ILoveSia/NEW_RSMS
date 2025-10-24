/**
 * useAsyncHandler - 비동기 작업 처리 공통 훅
 *
 * @description 모든 업무 페이지에서 사용하는 표준 비동기 작업 처리
 * - 로딩 상태 관리 (개별/통합)
 * - 토스트 메시지 자동 처리
 * - 에러 핸들링 통합
 * - 취소 토큰 지원
 * - 재시도 메커니즘
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const { execute, loading, cancel } = useAsyncHandler('search');
 *
 * const handleSearch = useCallback(async () => {
 *   await execute(
 *     async () => {
 *       const result = await searchApi(filters);
 *       setData(result);
 *     },
 *     {
 *       loading: '검색 중입니다...',
 *       success: '검색이 완료되었습니다.',
 *       error: '검색에 실패했습니다.'
 *     }
 *   );
 * }, [execute, filters]);
 * ```
 */

import { useCallback, useRef, useState } from 'react';
import toast from '@/shared/utils/toast';

// 메시지 설정 타입
export interface AsyncHandlerMessages {
  /** 로딩 중 메시지 */
  loading: string;
  /** 성공 메시지 */
  success: string;
  /** 에러 메시지 */
  error: string;
  /** 취소 메시지 (선택사항) */
  cancel?: string;
}

// 실행 옵션 타입
export interface AsyncExecuteOptions {
  /** 토스트 메시지 표시 여부 (기본: true) */
  showToast?: boolean;
  /** 에러 발생 시 콘솔 로그 출력 여부 (기본: true) */
  logError?: boolean;
  /** 재시도 횟수 (기본: 0) */
  retryCount?: number;
  /** 재시도 간격(ms) (기본: 1000) */
  retryDelay?: number;
  /** 타임아웃(ms) (기본: 30000) */
  timeout?: number;
}

// 훅 반환 타입
export interface UseAsyncHandlerReturn {
  /** 현재 로딩 상태 */
  loading: boolean;
  /** 에러 상태 */
  error: Error | null;
  /** 비동기 작업 실행 함수 */
  execute: <T = void>(
    asyncFn: (signal?: AbortSignal) => Promise<T>,
    messages: AsyncHandlerMessages,
    options?: AsyncExecuteOptions
  ) => Promise<T | null>;
  /** 현재 작업 취소 함수 */
  cancel: () => void;
  /** 로딩 상태 직접 제어 (고급 사용자용) */
  setLoading: (loading: boolean) => void;
  /** 에러 상태 초기화 */
  clearError: () => void;
}

/**
 * 개별 비동기 작업 처리를 위한 커스텀 훅
 *
 * @param key 작업 식별키 (선택사항, 디버깅용)
 * @returns 비동기 작업 처리 유틸리티
 */
const useAsyncHandler = (key?: string): UseAsyncHandlerReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentToastRef = useRef<string | null>(null);

  // 작업 취소 함수
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;

      // 로딩 토스트가 있으면 닫기만 (메시지 표시 안함)
      if (currentToastRef.current) {
        toast.dismiss(currentToastRef.current);
        currentToastRef.current = null;
      }

      setLoading(false);

      if (key && process.env.NODE_ENV === 'development') {
        console.log(`[useAsyncHandler:${key}] 작업이 취소되었습니다.`);
      }
    }
  }, [key]);

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 재시도 로직을 포함한 실행 함수
  const executeWithRetry = useCallback(async <T>(
    asyncFn: (signal?: AbortSignal) => Promise<T>,
    messages: AsyncHandlerMessages,
    options: AsyncExecuteOptions,
    attempt: number = 1
  ): Promise<T> => {
    const { retryCount = 0, retryDelay = 1000, timeout = 30000 } = options;
    const signal = abortControllerRef.current?.signal;

    try {
      // 타임아웃 설정
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`작업이 ${timeout}ms 후 타임아웃되었습니다.`));
        }, timeout);

        signal?.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('작업이 취소되었습니다.'));
        });
      });

      const result = await Promise.race([
        asyncFn(signal),
        timeoutPromise
      ]);

      return result;
    } catch (error) {
      // 마지막 시도가 아니고 재시도 횟수가 남아있으면 재시도
      if (attempt <= retryCount && !signal?.aborted) {
        if (key && process.env.NODE_ENV === 'development') {
          console.warn(`[useAsyncHandler:${key}] 재시도 ${attempt}/${retryCount}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeWithRetry(asyncFn, messages, options, attempt + 1);
      }

      throw error;
    }
  }, [key]);

  // 메인 실행 함수
  const execute = useCallback(async <T = void>(
    asyncFn: (signal?: AbortSignal) => Promise<T>,
    messages: AsyncHandlerMessages,
    options: AsyncExecuteOptions = {}
  ): Promise<T | null> => {
    const {
      showToast = true,
      logError = true,
      retryCount = 0,
      retryDelay = 1000,
      timeout = 30000
    } = options;

    // 기존 작업이 있으면 취소
    if (abortControllerRef.current) {
      cancel();
    }

    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();

    // 상태 초기화
    setError(null);
    setLoading(true);

    let toastId: string | null = null;

    try {
      // 로딩 토스트 표시
      if (showToast) {
        toastId = toast.loading(messages.loading);
        currentToastRef.current = toastId;
      }

      if (key && process.env.NODE_ENV === 'development') {
        console.log(`[useAsyncHandler:${key}] 작업 시작:`, messages.loading);
      }

      // 비동기 작업 실행 (재시도 포함)
      const result = await executeWithRetry(asyncFn, messages, {
        retryCount,
        retryDelay,
        timeout
      });

      // 성공 처리
      if (showToast && toastId && !abortControllerRef.current?.signal.aborted) {
        toast.update(toastId, 'success', messages.success, { duration: 3000 });
      }

      if (key && process.env.NODE_ENV === 'development') {
        console.log(`[useAsyncHandler:${key}] 작업 완료:`, messages.success);
      }

      return result;

    } catch (error) {
      const err = error as Error;

      // 작업이 취소된 경우
      if (err.name === 'AbortError' || err.message.includes('취소')) {
        if (showToast && toastId) {
          // messages.cancel이 명시적으로 설정된 경우에만 메시지 표시
          if (messages.cancel !== undefined && messages.cancel !== '') {
            toast.update(toastId, 'info', messages.cancel, { duration: 3000 });
          } else {
            toast.dismiss(toastId);
          }
        }
        return null;
      }

      // 에러 처리
      setError(err);

      if (showToast && toastId) {
        const errorMessage = err.message || messages.error;
        toast.update(toastId, 'error', errorMessage, { duration: 5000 });
      }

      if (logError) {
        console.error(`[useAsyncHandler${key ? `:${key}` : ''}] 작업 실패:`, err);
      }

      return null;

    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      currentToastRef.current = null;
    }
  }, [cancel, executeWithRetry, key]);

  return {
    loading,
    error,
    execute,
    cancel,
    setLoading,
    clearError
  };
};

export default useAsyncHandler;