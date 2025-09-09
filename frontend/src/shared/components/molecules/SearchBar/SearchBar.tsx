import React, { useState, useCallback, useEffect } from 'react';
import { InputAdornment, IconButton, Box } from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import clsx from 'clsx';

import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import styles from './SearchBar.module.scss';

export interface SearchBarProps {
  /** 검색어 값 */
  value?: string;
  /** 기본 검색어 */
  defaultValue?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 검색 이벤트 콜백 */
  onSearch?: (query: string) => void;
  /** 값 변경 이벤트 콜백 */
  onChange?: (value: string) => void;
  /** 디바운스 지연 시간 (ms) */
  debounceMs?: number;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 필터 버튼 표시 여부 */
  showFilter?: boolean;
  /** 필터 클릭 이벤트 */
  onFilterClick?: () => void;
  /** 필터 활성 상태 */
  filterActive?: boolean;
  /** 즉시 검색 여부 (false면 엔터키나 검색 버튼으로만 검색) */
  instantSearch?: boolean;
  /** 최소 검색 글자 수 */
  minLength?: number;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * SearchBar - 검색 기능이 있는 입력 필드 조합 컴포넌트
 * 
 * UI 디자인 적용 시 스타일만 교체하면 됨
 * 
 * @example
 * // 기본 사용
 * <SearchBar onSearch={handleSearch} placeholder="검색어를 입력하세요" />
 * 
 * // 디바운스 + 필터
 * <SearchBar 
 *   debounceMs={300}
 *   showFilter
 *   onFilterClick={handleFilter}
 *   instantSearch
 * />
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  defaultValue = '',
  placeholder = '검색어를 입력하세요',
  onSearch,
  onChange,
  debounceMs = 300,
  loading = false,
  disabled = false,
  size = 'medium',
  showFilter = false,
  onFilterClick,
  filterActive = false,
  instantSearch = true,
  minLength = 1,
  className,
  'data-testid': dataTestId = 'search-bar',
}) => {
  const [searchValue, setSearchValue] = useState(value ?? defaultValue);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // value prop이 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);

  // 디바운스 검색 실행
  const executeSearch = useCallback((query: string) => {
    if (query.length >= minLength) {
      onSearch?.(query);
    } else if (query.length === 0) {
      // 빈 검색어인 경우에도 콜백 호출 (검색 결과 초기화용)
      onSearch?.(query);
    }
  }, [onSearch, minLength]);

  // 입력값 변경 처리
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);

    // 즉시 검색이 활성화된 경우 디바운스 적용
    if (instantSearch && debounceMs > 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        executeSearch(newValue);
      }, debounceMs);

      setDebounceTimer(timer);
    }
  }, [onChange, instantSearch, debounceMs, debounceTimer, executeSearch]);

  // 엔터키 처리
  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      executeSearch(searchValue);
    }
  }, [searchValue, executeSearch, debounceTimer]);

  // 검색 버튼 클릭
  const handleSearchClick = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    executeSearch(searchValue);
  }, [searchValue, executeSearch, debounceTimer]);

  // 클리어 버튼 클릭
  const handleClear = useCallback(() => {
    setSearchValue('');
    onChange?.('');
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    // 즉시 검색인 경우 빈 검색어로 검색 실행
    if (instantSearch) {
      executeSearch('');
    }
  }, [onChange, instantSearch, executeSearch, debounceTimer]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <Box 
      className={clsx(styles.searchBar, styles[`size-${size}`], className)}
      data-testid={dataTestId}
    >
      <Input
        value={searchValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        size={size}
        disabled={disabled}
        className={styles.input}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color={disabled ? 'disabled' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {searchValue && !loading && (
                <IconButton
                  onClick={handleClear}
                  size="small"
                  disabled={disabled}
                  data-testid={`${dataTestId}-clear-button`}
                  aria-label="검색어 지우기"
                >
                  <Clear />
                </IconButton>
              )}
              {!instantSearch && (
                <IconButton
                  onClick={handleSearchClick}
                  disabled={disabled || loading}
                  data-testid={`${dataTestId}-search-button`}
                  aria-label="검색"
                >
                  <Search />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        data-testid={`${dataTestId}-input`}
      />
      
      {showFilter && (
        <Button
          variant="outlined"
          size={size}
          startIcon={<FilterList />}
          onClick={onFilterClick}
          disabled={disabled}
          className={clsx(styles.filterButton, {
            [styles.filterActive]: filterActive,
          })}
          data-testid={`${dataTestId}-filter-button`}
          aria-label="필터"
        >
          필터
        </Button>
      )}
    </Box>
  );
};

export default SearchBar;