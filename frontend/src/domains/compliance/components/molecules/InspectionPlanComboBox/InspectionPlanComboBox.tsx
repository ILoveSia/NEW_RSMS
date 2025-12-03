/**
 * InspectionPlanComboBox 컴포넌트
 *
 * @description 점검명 선택을 위한 콤보박스 컴포넌트
 * - 원장차수ID를 필수 조건으로 impl_inspection_plans 조회
 * - 여러 화면에서 재사용 가능한 공통 컴포넌트
 * @author Claude AI
 * @since 2025-12-03
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
import React, { useEffect } from 'react';
import { useImplInspectionPlansByLedgerOrder } from '../../hooks/useImplInspectionPlans';
import type { InspectionPlanComboBoxProps } from './types';

/**
 * InspectionPlanComboBox 컴포넌트
 *
 * <p>점검명을 선택하기 위한 콤보박스 컴포넌트입니다.</p>
 *
 * <p>특징:
 * <ul>
 *   <li>ledgerOrderId를 필수 조건으로 점검계획 조회</li>
 *   <li>데이터 없을 때 안내 메시지 표시</li>
 *   <li>로딩/에러 상태 자동 처리</li>
 *   <li>"전체" 옵션 표시 가능 (showAllOption)</li>
 * </ul>
 * </p>
 *
 * @example
 * ```tsx
 * const [ledgerOrderId, setLedgerOrderId] = useState<string | null>(null);
 * const [inspectionPlanId, setInspectionPlanId] = useState<string | null>(null);
 *
 * <InspectionPlanComboBox
 *   value={inspectionPlanId}
 *   onChange={setInspectionPlanId}
 *   ledgerOrderId={ledgerOrderId}
 *   label="점검명"
 *   showAllOption
 * />
 * ```
 */
const InspectionPlanComboBox: React.FC<InspectionPlanComboBoxProps> = ({
  value,
  onChange,
  ledgerOrderId,
  placeholder = '점검명 선택',
  disabled = false,
  error = false,
  helperText,
  required = false,
  className,
  label = '점검명',
  size = 'small',
  fullWidth = true,
  showAllOption = false,
}) => {
  // ledgerOrderId가 있을 때만 API 호출
  const {
    data: inspectionPlans,
    isLoading,
    isError,
    error: queryError,
  } = useImplInspectionPlansByLedgerOrder(ledgerOrderId);

  /**
   * ledgerOrderId 변경 시 선택값 초기화
   */
  useEffect(() => {
    if (value && ledgerOrderId) {
      // 현재 선택된 값이 새 ledgerOrderId의 데이터에 없으면 초기화
      const exists = inspectionPlans?.some(
        (plan) => plan.implInspectionPlanId === value
      );
      if (inspectionPlans && !exists) {
        onChange(null);
      }
    }
  }, [ledgerOrderId, inspectionPlans, value, onChange]);

  /**
   * 선택 변경 핸들러
   */
  const handleChange = (event: SelectChangeEvent<string>): void => {
    const selectedValue = event.target.value;
    onChange(selectedValue === '' ? null : selectedValue);
  };

  /**
   * ledgerOrderId가 없을 때 (조건 미선택)
   * - InputLabel에 shrink 속성 추가하여 label이 위로 올라가도록 설정
   */
  if (!ledgerOrderId) {
    return (
      <FormControl
        fullWidth={fullWidth}
        size={size}
        disabled
        className={className}
      >
        <InputLabel shrink>{label}</InputLabel>
        <Select
          value=""
          label={label}
          displayEmpty
          notched
          renderValue={() => (
            <em style={{ color: '#999' }}>원장차수를 먼저 선택하세요</em>
          )}
        >
          <MenuItem value="" disabled>
            <em>원장차수를 먼저 선택하세요</em>
          </MenuItem>
        </Select>
      </FormControl>
    );
  }

  /**
   * 로딩 중일 때
   * - InputLabel에 shrink 속성 추가하여 label이 위로 올라가도록 설정
   */
  if (isLoading) {
    return (
      <FormControl
        fullWidth={fullWidth}
        size={size}
        disabled
        className={className}
      >
        <InputLabel shrink>{label}</InputLabel>
        <Select
          value=""
          label={label}
          displayEmpty
          notched
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
   * - InputLabel에 shrink 속성 추가하여 label이 위로 올라가도록 설정
   */
  if (!inspectionPlans || inspectionPlans.length === 0) {
    return (
      <FormControl
        fullWidth={fullWidth}
        size={size}
        disabled
        className={className}
      >
        <InputLabel shrink>{label}</InputLabel>
        <Select
          value=""
          label={label}
          displayEmpty
          notched
          renderValue={() => (
            <em style={{ color: '#999' }}>등록된 점검계획이 없습니다</em>
          )}
        >
          <MenuItem value="" disabled>
            <em>등록된 점검계획이 없습니다</em>
          </MenuItem>
        </Select>
      </FormControl>
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
      <InputLabel id="inspection-plan-combo-label">{label}</InputLabel>
      <Select
        labelId="inspection-plan-combo-label"
        id="inspection-plan-combo-select"
        value={value || ''}
        onChange={handleChange}
        label={label}
      >
        {/* "전체" 옵션 (선택적) */}
        {showAllOption && (
          <MenuItem value="">
            <em>전체</em>
          </MenuItem>
        )}

        {/* placeholder (전체 옵션 없을 때) */}
        {!showAllOption && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}

        {/* 점검계획 목록 */}
        {inspectionPlans.map((plan) => (
          <MenuItem
            key={plan.implInspectionPlanId}
            value={plan.implInspectionPlanId}
          >
            {plan.implInspectionName}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default InspectionPlanComboBox;
