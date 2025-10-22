/**
 * PositionNameComboBox 컴포넌트
 *
 * @description 직책명 선택을 위한 콤보박스 컴포넌트 (공통코드 RSBT_RSOF_DVCD 조회)
 * @author Claude AI
 * @since 2025-10-17
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
import { usePositionNamesForComboBox } from '../../../hooks/usePositionNames';
import type { PositionNameComboBoxProps } from './types';

/**
 * PositionNameComboBox 컴포넌트
 *
 * <p>직책명을 선택하기 위한 콤보박스 컴포넌트입니다.</p>
 *
 * <p>특징:
 * <ul>
 *   <li>common_code_details 테이블의 group_code = 'RSBT_RSOF_DVCD' 조회</li>
 *   <li>사용 가능한(isActive=true) 직책명만 표시</li>
 *   <li>정렬순서(sortOrder)로 자동 정렬</li>
 *   <li>로딩/에러 상태 자동 처리</li>
 * </ul>
 * </p>
 *
 * @example
 * ```tsx
 * const [positionName, setPositionName] = useState<string | null>(null);
 *
 * <PositionNameComboBox
 *   value={positionName}
 *   onChange={setPositionName}
 *   label="직책명"
 *   required
 * />
 * ```
 */
const PositionNameComboBox: React.FC<PositionNameComboBoxProps> = ({
  value,
  onChange,
  placeholder = '직책명 선택',
  disabled = false,
  error = false,
  helperText,
  required = false,
  className,
  label = '직책명',
  size = 'small',
  fullWidth = true,
}) => {
  const { data: positionNames, isLoading, isError, error: queryError } = usePositionNamesForComboBox();

  /**
   * 선택 변경 핸들러
   * - 직책명(detailName)과 직책코드(detailCode)를 함께 반환
   */
  const handleChange = (event: SelectChangeEvent<string>): void => {
    const selectedValue = event.target.value;

    if (selectedValue === '') {
      onChange(null, null);
      return;
    }

    // 선택된 직책의 코드 찾기
    const selectedPosition = positionNames?.find(p => p.detailName === selectedValue);
    onChange(selectedValue, selectedPosition?.detailCode || null);
  };

  /**
   * 로딩 중일 때
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
   */
  if (!positionNames || positionNames.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        직책명 데이터가 없습니다.
      </Alert>
    );
  }

  /**
   * 정상 렌더링
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
      <InputLabel id="position-name-combo-label">
        {label}
      </InputLabel>
      <Select
        labelId="position-name-combo-label"
        id="position-name-combo-select"
        value={value || ''}
        onChange={handleChange}
        label={label}
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {positionNames.map((position) => (
          <MenuItem
            key={position.detailCode}
            value={position.detailName}
          >
            {position.detailName}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default PositionNameComboBox;
