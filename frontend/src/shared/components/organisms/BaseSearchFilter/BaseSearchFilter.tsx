import { SearchButton, CancelButton } from '@/shared/components/atoms/ActionButtons';
import {
  Box,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BaseSearchFilter.module.scss';

// endAdornment 타입 정의
export interface EndAdornment {
  type: 'button' | 'icon';
  icon: string;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
}

// 필터 필드 타입 정의
export interface FilterField {
  key: string;
  type: 'text' | 'select';
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  endAdornment?: EndAdornment;
}

// 필터 값 타입
export interface FilterValues {
  [key: string]: string;
}

interface BaseSearchFilterProps {
  fields: FilterField[];
  values: FilterValues;
  onValuesChange: (values: Partial<FilterValues>) => void;
  onSearch: () => void;
  onClear?: () => void;
  loading?: boolean;
  searchLoading?: boolean;
  className?: string;
  showClearButton?: boolean;
}

const BaseSearchFilter: React.FC<BaseSearchFilterProps> = React.memo(({
  fields,
  values,
  onValuesChange,
  onSearch,
  onClear,
  loading = false,
  searchLoading = false,
  className,
  showClearButton = false
}) => {
  const { t } = useTranslation('common');

  // 입력 변경 핸들러
  const handleInputChange = useCallback((fieldKey: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onValuesChange({ [fieldKey]: event.target.value });
  }, [onValuesChange]);

  // 선택 변경 핸들러
  const handleSelectChange = useCallback((fieldKey: string) => (
    event: { target: { value: string } }
  ) => {
    onValuesChange({ [fieldKey]: event.target.value });
  }, [onValuesChange]);

  // 키보드 이벤트 핸들러
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  // 초기화 핸들러
  const handleClear = useCallback(() => {
    const clearedValues: FilterValues = {};
    fields.forEach(field => {
      clearedValues[field.key] = '';
    });
    onValuesChange(clearedValues);
    onClear?.();
  }, [fields, onValuesChange, onClear]);

  // 필드 렌더링
  const renderField = (field: FilterField) => {
    const gridSize = field.gridSize || { xs: 12, sm: 6, md: 3 };

    return (
      <Grid item {...gridSize} key={field.key}>
        {field.type === 'text' ? (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            value={values[field.key] || ''}
            onChange={handleInputChange(field.key)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            size="small"
            variant="outlined"
            InputProps={field.endAdornment ? {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={field.endAdornment.tooltip || ''}>
                    <IconButton
                      onClick={field.endAdornment.onClick}
                      disabled={field.endAdornment.disabled || loading}
                      size="small"
                      edge="end"
                    >
                      {field.endAdornment.icon === 'Search' && <SearchIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            } : undefined}
          />
        ) : (
          <FormControl fullWidth size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={values[field.key] || ''}
              onChange={handleSelectChange(field.key)}
              label={field.label}
              disabled={loading}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Grid>
    );
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Grid container spacing={3} alignItems="center" justifyContent="space-between">
        {/* 필터 필드들 */}
        <Grid container item xs={12} md={showClearButton ? 10 : 9} spacing={3}>
          {fields.map(renderField)}
        </Grid>

        {/* 검색 버튼 영역 */}
        <Grid item xs={12} md={showClearButton ? 2 : 3}>
          <Box className={styles.buttonGroup}>
            <SearchButton
              onClick={onSearch}
              disabled={loading || searchLoading}
              loading={searchLoading}
              className={styles.searchButton}
            />
            {showClearButton && onClear && (
              <CancelButton
                onClick={handleClear}
                disabled={loading}
                label={t('clear', '초기화')}
                className={styles.clearButton}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
});

BaseSearchFilter.displayName = 'BaseSearchFilter';

export default BaseSearchFilter;