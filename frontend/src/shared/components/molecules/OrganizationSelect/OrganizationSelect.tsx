/**
 * 조직(부서) 선택 콤보박스 공통 컴포넌트
 *
 * @description 여러 화면에서 재사용 가능한 조직 선택 드롭다운
 * - organizations 테이블 데이터를 콤보박스로 표시
 * - TanStack Query를 사용한 서버 상태 관리
 * - Material-UI Autocomplete 기반
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getActiveOrganizations, type OrganizationApiResponse } from '@/shared/api/organizationApi';

// ===============================
// 타입 정의
// ===============================

/**
 * 조직 옵션 타입
 * - Autocomplete에서 사용할 옵션 형태
 */
export interface OrganizationOption {
  orgCode: string;      // 조직코드
  orgName: string;      // 조직명
  hqCode: string;       // 본부코드
  hqName: string;       // 본부명
  orgType: string;      // 조직유형
  isActive: string;     // 사용여부
  label: string;        // 표시 라벨 (조직명)
}

/**
 * OrganizationSelect Props
 */
export interface OrganizationSelectProps {
  /** 선택된 조직코드 */
  value?: string | null;
  /** 값 변경 콜백 (조직코드 반환) */
  onChange?: (orgCode: string | null) => void;
  /** 선택된 조직 전체 정보 반환 콜백 */
  onOrganizationChange?: (organization: OrganizationOption | null) => void;
  /** 라벨 텍스트 */
  label?: string;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  helperText?: string;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 사이즈 */
  size?: 'small' | 'medium';
  /** 추가 CSS 클래스 */
  className?: string;
  /** 본부만 표시할지 여부 (HQ만 필터링) */
  hqOnly?: boolean;
  /** 특정 본부의 부서만 표시할지 (본부코드) */
  filterByHqCode?: string;
  /** 선택 초기화 버튼 표시 여부 */
  clearable?: boolean;
}

// ===============================
// Query Keys
// ===============================

export const organizationSelectKeys = {
  all: ['organizations', 'select'] as const,
  active: () => [...organizationSelectKeys.all, 'active'] as const,
};

// ===============================
// 컴포넌트
// ===============================

/**
 * 조직(부서) 선택 콤보박스 컴포넌트
 *
 * @example 기본 사용
 * ```tsx
 * <OrganizationSelect
 *   value={selectedOrgCode}
 *   onChange={(orgCode) => setSelectedOrgCode(orgCode)}
 *   label="부서"
 *   placeholder="부서를 선택하세요"
 * />
 * ```
 *
 * @example 전체 조직 정보 받기
 * ```tsx
 * <OrganizationSelect
 *   value={selectedOrgCode}
 *   onOrganizationChange={(org) => {
 *     console.log('선택된 조직:', org?.orgName, org?.hqName);
 *   }}
 * />
 * ```
 *
 * @example 특정 본부의 부서만 표시
 * ```tsx
 * <OrganizationSelect
 *   filterByHqCode="1010"
 *   label="부서"
 * />
 * ```
 */
const OrganizationSelect: React.FC<OrganizationSelectProps> = ({
  value = null,
  onChange,
  onOrganizationChange,
  label = '부서',
  placeholder = '부서를 선택하세요',
  disabled = false,
  required = false,
  error = false,
  helperText,
  fullWidth = true,
  size = 'small',
  className,
  hqOnly = false,
  filterByHqCode,
  clearable = true,
}) => {
  // 선택된 옵션 상태
  const [selectedOption, setSelectedOption] = useState<OrganizationOption | null>(null);

  // 조직 목록 조회 (TanStack Query)
  const {
    data: organizations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: organizationSelectKeys.active(),
    queryFn: async () => {
      const data = await getActiveOrganizations();
      return data.map((org): OrganizationOption => ({
        orgCode: org.orgCode,
        orgName: org.orgName,
        hqCode: org.hqCode,
        hqName: org.hqName,
        orgType: org.orgType,
        isActive: org.isActive,
        label: org.orgName,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    retry: 1,
  });

  // 필터링된 옵션 목록
  const filteredOptions = React.useMemo(() => {
    let options = organizations;

    // 본부만 표시
    if (hqOnly) {
      options = options.filter(org => org.orgType === 'HQ');
    }

    // 특정 본부의 부서만 표시
    if (filterByHqCode) {
      options = options.filter(org => org.hqCode === filterByHqCode);
    }

    return options;
  }, [organizations, hqOnly, filterByHqCode]);

  // value prop이 변경되면 선택된 옵션 업데이트
  useEffect(() => {
    if (value && organizations.length > 0) {
      const found = organizations.find(org => org.orgCode === value);
      setSelectedOption(found || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, organizations]);

  // 선택 변경 핸들러
  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: OrganizationOption | null) => {
      setSelectedOption(newValue);

      // 조직코드만 반환
      if (onChange) {
        onChange(newValue?.orgCode || null);
      }

      // 전체 조직 정보 반환
      if (onOrganizationChange) {
        onOrganizationChange(newValue);
      }
    },
    [onChange, onOrganizationChange]
  );

  // 옵션 라벨 표시
  const getOptionLabel = useCallback((option: OrganizationOption) => {
    return option.orgName || '';
  }, []);

  // 옵션 동일성 비교
  const isOptionEqualToValue = useCallback(
    (option: OrganizationOption, value: OrganizationOption) => {
      return option.orgCode === value.orgCode;
    },
    []
  );

  // 옵션 렌더링 (본부명 포함)
  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: OrganizationOption) => {
      // key prop을 별도로 추출하여 전달
      const { key, ...restProps } = props as React.HTMLAttributes<HTMLLIElement> & { key?: string };
      return (
        <Box component="li" key={option.orgCode} {...restProps}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.orgName}
            </Typography>
            {option.hqName && option.hqName !== option.orgName && (
              <Typography variant="caption" color="text.secondary">
                {option.hqName}
              </Typography>
            )}
          </Box>
        </Box>
      );
    },
    []
  );

  return (
    <Autocomplete
      className={className}
      value={selectedOption}
      onChange={handleChange}
      options={filteredOptions}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderOption}
      loading={isLoading}
      disabled={disabled}
      disableClearable={!clearable}
      fullWidth={fullWidth}
      size={size}
      noOptionsText={isError ? '조직 목록을 불러올 수 없습니다' : '검색 결과가 없습니다'}
      loadingText="조직 목록 로딩 중..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selectedOption ? undefined : placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default OrganizationSelect;
