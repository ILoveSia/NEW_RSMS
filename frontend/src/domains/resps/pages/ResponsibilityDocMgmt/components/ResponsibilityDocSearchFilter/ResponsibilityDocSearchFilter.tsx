import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import type { ResponsibilityDocFilters } from '../../types/responsibilityDoc.types';
import styles from './ResponsibilityDocSearchFilter.module.scss';

interface ResponsibilityDocSearchFilterProps {
  filters: ResponsibilityDocFilters;
  onFiltersChange: (filters: ResponsibilityDocFilters) => void;
  onSearch: () => void;
  loading?: boolean;
  className?: string;
}

const ResponsibilityDocSearchFilter: React.FC<ResponsibilityDocSearchFilterProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
  className
}) => {
  const { t } = useTranslation('resps');

  // 필터 필드 정의
  const filterFields: FilterField[] = [
    {
      key: 'positionName',
      label: '직책명',
      type: 'text',
      placeholder: '직책명을 입력하세요',
      gridSize: { xs: 12, md: 6, lg: 3 }
    },
    {
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { value: '', label: '전체' },
        { value: 'draft', label: '임시저장' },
        { value: 'pending', label: '대기' },
        { value: 'approved', label: '승인' },
        { value: 'rejected', label: '반려' }
      ],
      gridSize: { xs: 12, md: 6, lg: 3 }
    },
    {
      key: 'approvalStatus',
      label: '승인상태',
      type: 'select',
      options: [
        { value: '', label: '전체' },
        { value: 'pending', label: '대기' },
        { value: 'approved', label: '승인' },
        { value: 'rejected', label: '반려' }
      ],
      gridSize: { xs: 12, md: 6, lg: 3 }
    },
    {
      key: 'isActive',
      label: '사용여부',
      type: 'select',
      options: [
        { value: '', label: '전체' },
        { value: 'true', label: '사용' },
        { value: 'false', label: '미사용' }
      ],
      gridSize: { xs: 12, md: 6, lg: 3 }
    }
  ];

  // 필터 값 변경 핸들러
  const handleFiltersChange = (newFilters: Partial<FilterValues>) => {
    onFiltersChange(newFilters as Partial<ResponsibilityDocFilters>);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <BaseSearchFilter
        fields={filterFields}
        values={filters as FilterValues}
        onValuesChange={handleFiltersChange}
        onSearch={onSearch}
        loading={loading}
        showClearButton={true}
      />
    </div>
  );
};

export default ResponsibilityDocSearchFilter;