/**
 * HeadquartersComboBox 컴포넌트
 * - 본부명 선택을 위한 콤보박스 컴포넌트 (공통코드 DPRM_CD 조회)
 * - 여러 화면에서 재사용 가능한 공통 컴포넌트
 *
 * @author Claude AI
 * @since 2025-10-20
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Box,
  type SelectChangeEvent,
} from '@mui/material';
import { useHeadquartersForComboBox } from '../../../hooks/useHeadquarters';
import type { HeadquartersComboBoxProps } from './types';

/**
 * HeadquartersComboBox 컴포넌트
 *
 * <p>본부명을 선택하기 위한 콤보박스 컴포넌트입니다.</p>
 *
 * <p>특징:
 * <ul>
 *   <li>common_code_details 테이블의 group_code = 'DPRM_CD' 조회</li>
 *   <li>사용 가능한(isActive=true) 본부명만 표시</li>
 *   <li>정렬순서(sortOrder)로 자동 정렬</li>
 *   <li>로딩/에러 상태 자동 처리</li>
 *   <li>여러 화면에서 재사용 가능</li>
 * </ul>
 * </p>
 *
 * @example
 * ```tsx
 * const [headquarters, setHeadquarters] = useState<string | null>(null);
 *
 * <HeadquartersComboBox
 *   value={headquarters}
 *   onChange={setHeadquarters}
 *   label="본부명"
 *   required
 * />
 * ```
 */
const HeadquartersComboBox: React.FC<HeadquartersComboBoxProps> = ({
  value,
  onChange,
  placeholder = '본부명 선택',
  disabled = false,
  error = false,
  helperText,
  required = false,
  className,
  label = '본부명',
  size = 'small',
  fullWidth = true,
}) => {
  const { data: headquarters, isLoading, isError, error: queryError } = useHeadquartersForComboBox();

  /**
   * 선택 변경 핸들러
   * - 빈 값('')은 null로 변환하여 전달
   */
  const handleChange = (event: SelectChangeEvent<string>): void => {
    const selectedValue = event.target.value;
    onChange(selectedValue === '' ? null : selectedValue);
  };

  /**
   * 로딩 중일 때
   * - CircularProgress와 함께 "데이터 로딩 중..." 표시
   */
  if (isLoading) {
    return (
      <FormControl
        fullWidth={fullWidth}
        size={size}
        disabled
        className={className}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value=""
          label={label}
          displayEmpty
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <span>데이터 로딩 중...</span>
            </Box>
          )}
        />
      </FormControl>
    );
  }

  /**
   * 에러 발생 시
   * - Alert 컴포넌트로 에러 메시지 표시
   */
  if (isError) {
    return (
      <Alert severity="error" className={className}>
        데이터 조회 실패: {queryError?.message || '알 수 없는 오류'}
      </Alert>
    );
  }

  /**
   * 데이터 없을 때
   * - Warning Alert 표시
   */
  if (!headquarters || headquarters.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        본부명 데이터가 없습니다.
      </Alert>
    );
  }

  /**
   * 정상 렌더링
   * - 본부명 리스트를 MenuItem으로 표시
   */
  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={error}
      required={required}
      disabled={disabled}
      className={className}
    >
      <InputLabel id="headquarters-combo-label">
        {label}
      </InputLabel>
      <Select
        labelId="headquarters-combo-label"
        id="headquarters-combo-select"
        value={value || ''}
        onChange={handleChange}
        label={label}
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {headquarters.map((hq) => (
          <MenuItem
            key={hq.detailCode}
            value={hq.detailName}
          >
            {hq.detailName}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default HeadquartersComboBox;
