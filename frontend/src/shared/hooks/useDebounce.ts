import { useState, useEffect } from 'react';

/**
 * useDebounce - 값의 변경을 지연시키는 훅
 * 
 * 검색 입력, API 호출 최적화 등에 사용
 * UI 디자인과 무관한 순수 로직 훅
 * 
 * @param value 디바운스할 값
 * @param delay 지연 시간 (밀리초)
 * @returns 디바운스된 값
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지연 시간 후에 값 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 값이 변경되면 이전 타이머 정리
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebounceCallback - 콜백 함수를 디바운스하는 훅
 * 
 * @param callback 디바운스할 콜백 함수
 * @param delay 지연 시간 (밀리초)
 * @param deps 의존성 배열
 * @returns 디바운스된 콜백 함수
 * 
 * @example
 * const debouncedSearch = useDebounceCallback(
 *   (query: string) => {
 *     searchAPI(query);
 *   },
 *   300,
 *   []
 * );
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [...deps, delay]);

  return debouncedCallback || callback;
}

export default useDebounce;