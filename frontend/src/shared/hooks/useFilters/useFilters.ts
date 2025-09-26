/**
 * useFilters - 검색 필터 상태 관리 공통 훅
 *
 * @description 모든 업무 페이지에서 사용하는 표준 필터 상태 관리
 * - 동적 필터 키/값 관리
 * - 필터 변경 및 초기화
 * - URL 쿼리 파라미터 연동
 * - 필터 검증 및 정규화
 * - 디바운싱 지원 (실시간 검색)
 * - 필터 프리셋 관리
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   setFilter,
 *   setFilters,
 *   clearFilters,
 *   debouncedFilters,
 *   hasFilters
 * } = useFilters<UserFilters>({
 *   fullName: '',
 *   department: '',
 *   isActive: ''
 * });
 * ```
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 필터 값 타입
export type FilterValue = string | number | boolean | null | undefined;

// 필터 객체 타입
export type FilterObject = Record<string, FilterValue>;

// 필터 검증 함수 타입
export type FilterValidator<T extends FilterObject> = (
  key: keyof T,
  value: FilterValue,
  allFilters: T
) => FilterValue;

// 필터 옵션 타입
export interface FiltersOptions<T extends FilterObject> {
  /** 초기 필터 값 */
  initialFilters?: Partial<T>;
  /** 필터 검증 함수 */
  validator?: FilterValidator<T>;
  /** 디바운싱 지연시간(ms) (기본: 300) */
  debounceMs?: number;
  /** URL 쿼리와 동기화 여부 */
  syncWithUrl?: boolean;
  /** 필터 변경 시 콜백 */
  onFiltersChange?: (filters: T, changedKey?: keyof T) => void;
  /** 디바운스된 필터 변경 시 콜백 */
  onDebouncedFiltersChange?: (filters: T) => void;
}

// 필터 프리셋 타입
export interface FilterPreset<T extends FilterObject> {
  /** 프리셋 ID */
  id: string;
  /** 프리셋 이름 */
  name: string;
  /** 프리셋 필터 값 */
  filters: Partial<T>;
  /** 프리셋 설명 (선택사항) */
  description?: string;
}

// 훅 반환 타입
export interface UseFiltersReturn<T extends FilterObject> {
  /** 현재 필터 상태 */
  filters: T;
  /** 디바운스된 필터 상태 */
  debouncedFilters: T;
  /** 단일 필터 값 설정 */
  setFilter: (key: keyof T, value: FilterValue) => void;
  /** 여러 필터 값 일괄 설정 */
  setFilters: (newFilters: Partial<T>) => void;
  /** 모든 필터 초기화 */
  clearFilters: () => void;
  /** 특정 필터만 초기화 */
  clearFilter: (key: keyof T) => void;
  /** 필터가 설정되어 있는지 확인 */
  hasFilters: boolean;
  /** 특정 필터가 설정되어 있는지 확인 */
  hasFilter: (key: keyof T) => boolean;
  /** 필터를 초기값으로 리셋 */
  resetFilters: () => void;
  /** URL 쿼리로 변환 */
  toQuery: () => Record<string, string>;
  /** URL 쿼리에서 필터 복원 */
  fromQuery: (query: Record<string, string>) => void;
  /** 필터 프리셋 관리 */
  presets: {
    /** 현재 필터를 프리셋으로 저장 */
    save: (id: string, name: string, description?: string) => void;
    /** 프리셋 불러오기 */
    load: (id: string) => void;
    /** 프리셋 삭제 */
    remove: (id: string) => void;
    /** 저장된 프리셋 목록 */
    list: FilterPreset<T>[];
  };
}

/**
 * 디바운싱을 위한 커스텀 훅
 */
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 검색 필터 상태 관리를 위한 커스텀 훅
 */
const useFilters = <T extends FilterObject>(
  defaultFilters: T,
  options: FiltersOptions<T> = {}
): UseFiltersReturn<T> => {
  const {
    initialFilters = {},
    validator,
    debounceMs = 300,
    onFiltersChange,
    onDebouncedFiltersChange
  } = options;

  // 초기 필터 값 계산
  const initialValues = useMemo(() => ({
    ...defaultFilters,
    ...initialFilters
  }), [defaultFilters, initialFilters]);

  // 필터 상태
  const [filters, setFiltersState] = useState<T>(initialValues);

  // 프리셋 상태 (localStorage에 저장)
  const [presetList, setPresetList] = useState<FilterPreset<T>[]>([]);
  const presetStorageKey = 'filters-presets';

  // 디바운스된 필터
  const debouncedFilters = useDebounce(filters, debounceMs);

  // 이전 필터 참조 (변경 감지용)
  const previousFiltersRef = useRef<T>(filters);

  // 프리셋 로딩 (컴포넌트 마운트 시)
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem(presetStorageKey);
      if (savedPresets) {
        setPresetList(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.warn('필터 프리셋 로딩 실패:', error);
    }
  }, []);

  // 프리셋 저장
  const savePresets = useCallback((presets: FilterPreset<T>[]) => {
    try {
      localStorage.setItem(presetStorageKey, JSON.stringify(presets));
      setPresetList(presets);
    } catch (error) {
      console.warn('필터 프리셋 저장 실패:', error);
    }
  }, []);

  // 필터 검증 및 정규화
  const validateAndNormalize = useCallback((key: keyof T, value: FilterValue, allFilters: T): FilterValue => {
    if (validator) {
      return validator(key, value, allFilters);
    }

    // 기본 정규화
    if (typeof value === 'string') {
      return value.trim();
    }

    return value;
  }, [validator]);

  // 단일 필터 설정
  const setFilter = useCallback((key: keyof T, value: FilterValue) => {
    setFiltersState(prevFilters => {
      const normalizedValue = validateAndNormalize(key, value, prevFilters);
      const newFilters = { ...prevFilters, [key]: normalizedValue };

      onFiltersChange?.(newFilters, key);
      return newFilters;
    });
  }, [validateAndNormalize, onFiltersChange]);

  // 여러 필터 일괄 설정
  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState(prevFilters => {
      const updatedFilters = { ...prevFilters };

      Object.entries(newFilters).forEach(([key, value]) => {
        const normalizedValue = validateAndNormalize(key as keyof T, value as FilterValue, updatedFilters);
        updatedFilters[key as keyof T] = normalizedValue as T[keyof T];
      });

      onFiltersChange?.(updatedFilters);
      return updatedFilters;
    });
  }, [validateAndNormalize, onFiltersChange]);

  // 모든 필터 초기화
  const clearFilters = useCallback(() => {
    const clearedFilters = { ...defaultFilters };
    setFiltersState(clearedFilters);
    onFiltersChange?.(clearedFilters);
  }, [defaultFilters, onFiltersChange]);

  // 특정 필터 초기화
  const clearFilter = useCallback((key: keyof T) => {
    setFilter(key, defaultFilters[key]);
  }, [defaultFilters, setFilter]);

  // 초기값으로 리셋
  const resetFilters = useCallback(() => {
    setFiltersState(initialValues);
    onFiltersChange?.(initialValues);
  }, [initialValues, onFiltersChange]);

  // 필터 존재 여부 계산
  const hasFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T];
      return value !== defaultValue && value !== '' && value !== null && value !== undefined;
    });
  }, [filters, defaultFilters]);

  // 특정 필터 존재 여부 확인
  const hasFilter = useCallback((key: keyof T): boolean => {
    const value = filters[key];
    const defaultValue = defaultFilters[key];
    return value !== defaultValue && value !== '' && value !== null && value !== undefined;
  }, [filters, defaultFilters]);

  // URL 쿼리 변환
  const toQuery = useCallback((): Record<string, string> => {
    const query: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query[key] = String(value);
      }
    });

    return query;
  }, [filters]);

  // URL 쿼리에서 복원
  const fromQuery = useCallback((query: Record<string, string>) => {
    const newFilters = { ...defaultFilters };

    Object.entries(query).forEach(([key, value]) => {
      if (key in defaultFilters) {
        const typedKey = key as keyof T;
        const defaultValue = defaultFilters[typedKey];

        // 타입에 따른 변환
        if (typeof defaultValue === 'boolean') {
          newFilters[typedKey] = (value === 'true') as T[keyof T];
        } else if (typeof defaultValue === 'number') {
          const numValue = Number(value);
          newFilters[typedKey] = (isNaN(numValue) ? defaultValue : numValue) as T[keyof T];
        } else {
          newFilters[typedKey] = value as T[keyof T];
        }
      }
    });

    setFiltersState(newFilters);
    onFiltersChange?.(newFilters);
  }, [defaultFilters, onFiltersChange]);

  // 프리셋 관리
  const presets = useMemo(() => ({
    save: (id: string, name: string, description?: string) => {
      const newPreset: FilterPreset<T> = {
        id,
        name,
        description,
        filters: { ...filters }
      };

      const updatedPresets = [...presetList.filter(p => p.id !== id), newPreset];
      savePresets(updatedPresets);
    },

    load: (id: string) => {
      const preset = presetList.find(p => p.id === id);
      if (preset) {
        setFilters(preset.filters);
      }
    },

    remove: (id: string) => {
      const updatedPresets = presetList.filter(p => p.id !== id);
      savePresets(updatedPresets);
    },

    list: presetList
  }), [filters, presetList, savePresets, setFilters]);

  // 디바운스된 필터 변경 감지
  useEffect(() => {
    if (debouncedFilters !== previousFiltersRef.current) {
      onDebouncedFiltersChange?.(debouncedFilters);
      previousFiltersRef.current = debouncedFilters;
    }
  }, [debouncedFilters, onDebouncedFiltersChange]);

  return {
    filters,
    debouncedFilters,
    setFilter,
    setFilters,
    clearFilters,
    clearFilter,
    hasFilters,
    hasFilter,
    resetFilters,
    toQuery,
    fromQuery,
    presets
  };
};

export default useFilters;