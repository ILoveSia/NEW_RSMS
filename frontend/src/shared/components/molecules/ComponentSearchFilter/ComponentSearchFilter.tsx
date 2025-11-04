/**
 * ComponentSearchFilter
 * - BaseSearchFilter를 래핑한 간편 사용 컴포넌트
 * - 내부 상태를 관리하여 부모 컴포넌트에서 간단히 사용 가능
 */

import React, { useState, useCallback, useEffect } from 'react';
import BaseSearchFilter from '@/shared/components/organisms/BaseSearchFilter';
import type { FilterField, FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// FilterField 타입 재export
export type { FilterField } from '@/shared/components/organisms/BaseSearchFilter';

interface ComponentSearchFilterProps {
  /** 검색 필드 정의 */
  fields: FilterField[];
  /** 검색 버튼 클릭 핸들러 */
  onSearch: () => void;
  /** 필터 값 변경 핸들러 */
  onFilterChange?: (filters: Record<string, any>) => void;
  /** 초기 필터 값 */
  initialValues?: Record<string, any>;
  /** 로딩 상태 */
  loading?: boolean;
  /** 검색 로딩 상태 */
  searchLoading?: boolean;
  /** 초기화 버튼 표시 여부 */
  showClearButton?: boolean;
  /** 초기화 버튼 클릭 핸들러 */
  onClear?: () => void;
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 컴포넌트 검색 필터
 * - 내부 상태를 관리하여 사용이 간편함
 */
const ComponentSearchFilter: React.FC<ComponentSearchFilterProps> = ({
  fields,
  onSearch,
  onFilterChange,
  initialValues = {},
  loading = false,
  searchLoading = false,
  showClearButton = false,
  onClear,
  className
}) => {
  // 내부 상태로 필터 값 관리
  const [filterValues, setFilterValues] = useState<FilterValues>(initialValues);

  // 초기값 변경 시 상태 업데이트
  useEffect(() => {
    setFilterValues(initialValues);
  }, [initialValues]);

  // 필터 값 변경 핸들러
  const handleValuesChange = useCallback((values: Partial<FilterValues>) => {
    setFilterValues(prev => {
      const newValues = { ...prev, ...values };

      // 부모 컴포넌트에 변경 알림
      if (onFilterChange) {
        onFilterChange(newValues);
      }

      return newValues;
    });
  }, [onFilterChange]);

  // 초기화 핸들러
  const handleClear = useCallback(() => {
    const clearedValues: FilterValues = {};
    fields.forEach(field => {
      clearedValues[field.key] = '';
    });
    setFilterValues(clearedValues);

    if (onFilterChange) {
      onFilterChange(clearedValues);
    }

    if (onClear) {
      onClear();
    }
  }, [fields, onFilterChange, onClear]);

  return (
    <BaseSearchFilter
      fields={fields}
      values={filterValues}
      onValuesChange={handleValuesChange}
      onSearch={onSearch}
      onClear={handleClear}
      loading={loading}
      searchLoading={searchLoading}
      className={className}
      showClearButton={showClearButton}
    />
  );
};

export default ComponentSearchFilter;
