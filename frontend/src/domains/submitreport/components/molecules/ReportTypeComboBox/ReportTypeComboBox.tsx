/**
 * ReportTypeComboBox 컴포넌트
 * - 제출보고서구분 선택을 위한 콤보박스 컴포넌트 (공통코드 SUB_REPORT_TYCD 조회)
 * - 제출보고서 관련 화면에서 재사용 가능
 *
 * @author Claude AI
 * @since 2025-01-13
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  type SelectChangeEvent,
} from '@mui/material';
import { useCommonCode } from '@/shared/hooks/useCommonCode';
import type { ReportTypeComboBoxProps } from './types';

/**
 * ReportTypeComboBox 컴포넌트
 *
 * <p>제출보고서구분을 선택하기 위한 콤보박스 컴포넌트입니다.</p>
 *
 * <p>특징:
 * <ul>
 *   <li>common_code_details 테이블의 group_code = 'SUB_REPORT_TYCD' 조회</li>
 *   <li>주요 구분: RESP_CHG(책무기재내용 변경), EXEC_CHG(임원 변경), ORG_CHG(조직 변경)</li>
 *   <li>로딩/에러 상태 자동 처리</li>
 *   <li>여러 화면에서 재사용 가능</li>
 * </ul>
 * </p>
 *
 * @example
 * ```tsx
 * const [reportType, setReportType] = useState<string | null>(null);
 *
 * <ReportTypeComboBox
 *   value={reportType}
 *   onChange={setReportType}
 *   label="제출보고서구분"
 *   required
 * />
 * ```
 */
const ReportTypeComboBox: React.FC<ReportTypeComboBoxProps> = ({
  value,
  onChange,
  placeholder = '제출보고서구분 선택',
  disabled = false,
  error = false,
  helperText,
  required = false,
  className,
  label = '제출보고서구분',
  size = 'small',
  fullWidth = true,
}) => {
  /**
   * 공통코드 SUB_REPORT_TYCD 조회
   * - codeStore에서 공통코드 목록 조회
   */
  const { options: reportTypes } = useCommonCode('SUB_REPORT_TYCD');

  /**
   * 선택 변경 핸들러
   * - 빈 값('')은 null로 변환하여 전달
   */
  const handleChange = (event: SelectChangeEvent<string>): void => {
    const selectedValue = event.target.value;
    onChange(selectedValue === '' ? null : selectedValue);
  };

  /**
   * 데이터 없을 때
   */
  if (!reportTypes || reportTypes.length === 0) {
    return (
      <Alert severity="warning" className={className}>
        제출보고서구분 데이터가 없습니다.
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
      <InputLabel id="report-type-combo-label">
        {label}
      </InputLabel>
      <Select
        labelId="report-type-combo-label"
        id="report-type-combo-select"
        value={value || ''}
        onChange={handleChange}
        label={label}
      >
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {reportTypes.map((type) => (
          <MenuItem
            key={type.value}
            value={type.value}
          >
            {type.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ReportTypeComboBox;
