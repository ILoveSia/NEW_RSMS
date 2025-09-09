import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage - localStorage와 동기화되는 상태 훅
 * 
 * 사용자 설정, 테마, 캐시 데이터 등 유지해야 할 상태 관리
 * UI 디자인과 무관한 순수 로직 훅
 * 
 * @param key localStorage 키
 * @param initialValue 초기값
 * @returns [value, setValue, removeValue]
 * 
 * @example
 * // 기본 사용
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * 
 * // 복합 객체 저장
 * const [userSettings, setUserSettings] = useLocalStorage('userSettings', {
 *   language: 'ko',
 *   notifications: true
 * });
 * 
 * // 값 제거
 * const [data, setData, removeData] = useLocalStorage('tempData', null);
 * const handleClear = () => removeData();
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  // localStorage에서 값을 읽어오는 함수
  const readValue = useCallback((): T => {
    // SSR 환경에서는 localStorage 사용 불가
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      // JSON 파싱 시도
      try {
        return JSON.parse(item);
      } catch {
        // JSON 파싱 실패 시 문자열 그대로 반환
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // 상태 초기화
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값을 설정하는 함수
  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      // SSR 환경에서는 localStorage 사용 불가
      if (typeof window === 'undefined') {
        console.warn('localStorage is not available in this environment');
        return;
      }

      try {
        // 함수형 업데이트 지원
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // 상태 업데이트
        setStoredValue(valueToStore);
        
        // localStorage에 저장
        if (valueToStore === undefined || valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          const serializedValue = typeof valueToStore === 'string' 
            ? valueToStore 
            : JSON.stringify(valueToStore);
          
          window.localStorage.setItem(key, serializedValue);
        }

        // storage 이벤트 발생 (다른 탭과 동기화)
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 값을 제거하는 함수
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn('localStorage is not available in this environment');
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // storage 이벤트 리스너 (다른 탭에서의 변경사항 감지)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e instanceof StorageEvent && e.key && e.key !== key) {
        return;
      }
      
      setStoredValue(readValue());
    };

    // localStorage 변경 감지
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useSessionStorage - sessionStorage와 동기화되는 상태 훅
 * 
 * 임시 상태, 페이지 세션 데이터 등 탭이 닫히면 사라져야 할 데이터 관리
 * 
 * @param key sessionStorage 키
 * @param initialValue 초기값
 * @returns [value, setValue, removeValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (valueToStore === undefined || valueToStore === null) {
          window.sessionStorage.removeItem(key);
        } else {
          const serializedValue = typeof valueToStore === 'string' 
            ? valueToStore 
            : JSON.stringify(valueToStore);
          
          window.sessionStorage.setItem(key, serializedValue);
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;