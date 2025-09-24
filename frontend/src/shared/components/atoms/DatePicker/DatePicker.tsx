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
}

/**
 * 공통 DatePicker 컴포넌트
 * HTML5 date input을 Material-UI TextField로 래핑하여 일관된 스타일 제공
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
  size = 'small',
  variant = 'outlined',
  fullWidth = true,
  ...props
}) => {

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange?.(newValue);
  }, [onChange]);

  return (
    <TextField
      type="date"
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