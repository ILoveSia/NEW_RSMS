import React, { useMemo, useCallback } from 'react';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import styles from './PositionSearchFilter.module.scss';

import type {
  PositionFilters,
  HeadquartersOption,
  StatusOption,
  ActiveOption
} from '../../types/position.types';

interface PositionSearchFilterProps {
  filters: PositionFilters;
  onFiltersChange: (filters: Partial<PositionFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
  loading?: boolean;
  searchLoading?: boolean;
}

const PositionSearchFilter: React.FC<PositionSearchFilterProps> = React.memo(({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  loading = false,
  searchLoading = false
}) => {
  const { t } = useTranslation('resps');

  // 본부구분 옵션 메모이제이션 (번역 변경 시에만 재계산)
  const headquartersOptions: HeadquartersOption[] = useMemo(() => [
    { value: '', label: t('common.all', '전체') },
    { value: '본부부서', label: '본부부서' },
    { value: '지역본부', label: '지역본부' },
    { value: '영업점', label: '영업점' },
    { value: '센터', label: '센터' }
  ], [t]);

  // 상태 옵션 메모이제이션
  const statusOptions: StatusOption[] = useMemo(() => [
    { value: '', label: t('common.all', '전체') },
    { value: '정상', label: '정상' },
    { value: '임시정지', label: '임시정지' },
    { value: '폐지', label: '폐지' }
  ], [t]);

  // 사용여부 옵션 메모이제이션
  const activeOptions: ActiveOption[] = useMemo(() => [
    { value: '', label: t('common.all', '전체') },
    { value: 'Y', label: t('common.active', '사용') },
    { value: 'N', label: t('common.inactive', '미사용') }
  ], [t]);

  // 입력 변경 핸들러 메모이제이션
  const handleInputChange = useCallback((field: keyof PositionFilters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFiltersChange({ [field]: event.target.value });
  }, [onFiltersChange]);

  // 선택 변경 핸들러 메모이제이션
  const handleSelectChange = useCallback((field: keyof PositionFilters) => (
    event: { target: { value: string } }
  ) => {
    onFiltersChange({ [field]: event.target.value });
  }, [onFiltersChange]);

  // 키보드 이벤트 핸들러 메모이제이션
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  return (
    <div className={styles.container}>
      <Grid container spacing={3} alignItems="center">
        {/* 직책명 검색 */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label={t('position.fields.positionName', '직책명')}
            placeholder={t('position.search.positionNamePlaceholder', '직책명을 입력하세요')}
            value={filters.positionName}
            onChange={handleInputChange('positionName')}
            onKeyPress={handleKeyPress}
            disabled={loading}
            size="small"
            variant="outlined"
          />
        </Grid>

        {/* 본부구분 */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('position.fields.headquarters', '본부구분')}</InputLabel>
            <Select
              value={filters.headquarters}
              onChange={handleSelectChange('headquarters')}
              label={t('position.fields.headquarters', '본부구분')}
              disabled={loading}
            >
              {headquartersOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 상태 */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('position.fields.status', '상태')}</InputLabel>
            <Select
              value={filters.status}
              onChange={handleSelectChange('status')}
              label={t('position.fields.status', '상태')}
              disabled={loading}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 사용여부 */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('position.fields.isActive', '사용여부')}</InputLabel>
            <Select
              value={filters.isActive}
              onChange={handleSelectChange('isActive')}
              label={t('position.fields.isActive', '사용여부')}
              disabled={loading}
            >
              {activeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 검색 버튼 */}
        <Grid item xs={12} md={3}>
          <Box className={styles.buttonGroup}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onSearch}
              disabled={loading}
              className={styles.searchButton}
            >
              {t('common.search', '검색')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
});

// React.memo 컴포넌트의 displayName 설정 (디버깅용)
PositionSearchFilter.displayName = 'PositionSearchFilter';

export default PositionSearchFilter;