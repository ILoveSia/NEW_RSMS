import React, { useCallback } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import styles from './DatePicker.module.scss';

export interface DatePickerProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  min?: string;
  max?: string;
  className?: string;
  dateType?: 'date' | 'month' | 'year';
}

/**
 * 공통 DatePicker 컴포넌트
 * HTML5 date/month input을 Material-UI TextField로 래핑하여 일관된 스타일 제공
 * dateType: 'date' (기본) - 년/월/일, 'month' - 년/월, 'year' - 년도만 (현재는 month 사용)
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder,
  disabled = false,
  error = false,
  helperText,
  min,
  max,
  className,
  dateType = 'date',
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  ...props
}) => {

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange?.(newValue);
  }, [onChange]);

  // dateType에 따라 input type 결정
  // 'year'는 HTML5에 없으므로 'month'를 사용하되, format을 조정
  const inputType = dateType === 'year' ? 'month' : dateType;

  return (
    <TextField
      type={inputType}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      helperText={helperText}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      className={`${styles.datePicker} ${className || ''}`}
      inputProps={{
        min,
        max,
        ...props.inputProps
      }}
      InputLabelProps={{
        shrink: true,
        ...props.InputLabelProps
      }}
      {...props}
    />
  );
};

export default DatePicker;