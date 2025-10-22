/**
 * LedgerOrderComboBox 컴포넌트
 *
 * @description 책무이행차수 선택을 위한 콤보박스 컴포넌트 (PROG, CLSD만 조회)
 * @author Claude AI
 * @since 2025-10-16
 */

import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import React from 'react';
import { useLedgerOrdersForComboBox } from '../../../hooks/useLedgerOrders';
import type { LedgerOrderComboBoxProps } from './types';

/**
 * LedgerOrderComboBox 컴포넌트
 *
 * <p>책무이행차수를 선택하기 위한 콤보박스 컴포넌트입니다.</p>
 *
 * <p>특징:
 * <ul>
 *   <li>PROG, CLSD 상태의 책무이행차수만 조회</li>
 *   <li>PROG일 때 "[진행중]" 표시</li>
 *   <li>데이터 없을 때 "원장차수를 생성하세요" 메시지</li>
 *   <li>로딩/에러 상태 자동 처리</li>
 * </ul>
 * </p>
 *
 * @example
 * ```tsx
 * const [ledgerOrderId, setLedgerOrderId] = useState<string | null>(null);
 *
 * <LedgerOrderComboBox
 *   value={ledgerOrderId}
 *   onChange={setLedgerOrderId}
 *   label="책무이행차수"
 *   required
 * />
 * ```
 */
const LedgerOrderComboBox: React.FC<LedgerOrderComboBoxProps> = ({
  value,
  onChange,
  placeholder = '책무이행차수 선택',
  disabled = false,
  error = false,
  helperText,
  required = false,
  className,
  label = '책무이행차수',
  size = 'small',
  fullWidth = true,
}) => {
  const { data: ledgerOrders, isLoading, isError, error: queryError } = useLedgerOrdersForComboBox();

  /**
   * 선택 변경 핸들러
   */
  const handleChange = (event: SelectChangeEvent<string>): void => {
    const selectedValue = event.target.value;
    onChange(selectedValue === '' ? null : selectedValue);
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
   * 데이터 없을 때 (PROG, CLSD 상태의 원장차수가 없음)
   */
  if (!ledgerOrders || ledgerOrders.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        책무이행차수를 생성하세요
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
      <InputLabel id="ledger-order-combo-label">
        {label}
      </InputLabel>
      <Select
        labelId="ledger-order-combo-label"
        id="ledger-order-combo-select"
        value={value || ''}
        onChange={handleChange}
        label={label}
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {ledgerOrders.map((order) => (
          <MenuItem
            key={order.ledgerOrderId}
            value={order.ledgerOrderId}
          >
            {order.displayLabel}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default LedgerOrderComboBox;
