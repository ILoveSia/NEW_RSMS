import React, { forwardRef } from 'react';
import { 
  TextField, 
  TextFieldProps, 
  InputAdornment, 
  IconButton,
  FormHelperText 
} from '@mui/material';
import { Visibility, VisibilityOff, Clear } from '@mui/icons-material';
import clsx from 'clsx';

import styles from './Input.module.scss';

export interface InputProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  /** 입력 필드 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 스타일 변형 */
  variant?: 'outlined' | 'filled' | 'standard';
  /** 클리어 버튼 표시 여부 */
  clearable?: boolean;
  /** 패스워드 토글 버튼 표시 여부 */
  showPasswordToggle?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 성공 상태 */
  success?: boolean;
  /** 성공 메시지 */
  successMessage?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * Input - 확장 가능한 입력 필드 컴포넌트
 * 
 * UI 디자인 시스템 적용 시 스타일만 교체하면 됨
 * 
 * @example
 * // 기본 사용
 * <Input placeholder="이메일을 입력하세요" />
 * 
 * // 에러 상태
 * <Input error errorMessage="필수 입력 항목입니다" />
 * 
 * // 패스워드 필드
 * <Input type="password" showPasswordToggle />
 * 
 * // 클리어 가능한 검색 필드
 * <Input placeholder="검색..." clearable />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'medium',
  variant = 'outlined',
  clearable = false,
  showPasswordToggle = false,
  error = false,
  errorMessage,
  helperText,
  success = false,
  successMessage,
  loading = false,
  className,
  'data-testid': dataTestId = 'input',
  value,
  type: initialType = 'text',
  onChange,
  onClear,
  ...textFieldProps
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [internalType, setInternalType] = React.useState(initialType);

  // 패스워드 타입이고 토글이 활성화된 경우
  const isPasswordField = initialType === 'password' && showPasswordToggle;

  React.useEffect(() => {
    if (isPasswordField) {
      setInternalType(showPassword ? 'text' : 'password');
    } else {
      setInternalType(initialType);
    }
  }, [initialType, isPasswordField, showPassword]);

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleClear = () => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    if (onClear) {
      onClear();
    }
  };

  const hasValue = value !== undefined && value !== null && value !== '';
  const showClearButton = clearable && hasValue && !loading;
  
  // 최종 에러 상태 및 메시지
  const finalError = error;
  const finalHelperText = errorMessage || helperText || (success ? successMessage : '');

  // InputProps 구성
  const inputProps = {
    ...textFieldProps.InputProps,
    endAdornment: (
      <>
        {showClearButton && (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClear}
              size={size}
              data-testid={`${dataTestId}-clear-button`}
              aria-label="입력 내용 지우기"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        )}
        {isPasswordField && (
          <InputAdornment position="end">
            <IconButton
              onClick={handlePasswordToggle}
              size={size}
              data-testid={`${dataTestId}-password-toggle`}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )}
        {textFieldProps.InputProps?.endAdornment}
      </>
    ),
  };

  return (
    <TextField
      {...textFieldProps}
      ref={ref}
      type={internalType}
      size={size}
      variant={variant}
      value={value}
      onChange={onChange}
      error={finalError}
      helperText={finalHelperText}
      InputProps={inputProps}
      className={clsx(
        styles.input,
        styles[`size-${size}`],
        styles[`variant-${variant}`],
        {
          [styles.error]: finalError,
          [styles.success]: success && !finalError,
          [styles.loading]: loading,
          [styles.clearable]: clearable,
        },
        className
      )}
      data-testid={dataTestId}
    />
  );
});

Input.displayName = 'Input';

export default Input;