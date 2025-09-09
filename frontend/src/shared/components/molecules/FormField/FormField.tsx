import React from 'react';
import { Box, FormControl, FormLabel, FormHelperText } from '@mui/material';
import clsx from 'clsx';

import { Input, InputProps } from '../../atoms/Input';
import { Typography } from '../../atoms/Typography';
import styles from './FormField.module.scss';

export interface FormFieldProps extends Omit<InputProps, 'label'> {
  /** 필드 라벨 */
  label?: string;
  /** 필수 필드 여부 */
  required?: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 성공 메시지 */
  successMessage?: string;
  /** 필드 설명 */
  description?: string;
  /** 라벨 위치 */
  labelPosition?: 'top' | 'left' | 'inline';
  /** 라벨 너비 (labelPosition이 'left'일 때) */
  labelWidth?: string | number;
  /** 수직 간격 */
  spacing?: 'compact' | 'normal' | 'comfortable';
  /** 커스텀 컨트롤 (Input 대신 다른 컴포넌트 사용) */
  children?: React.ReactNode;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * FormField - 라벨, 입력 필드, 에러 메시지를 조합한 폼 필드 컴포넌트
 * 
 * UI 디자인 적용 시 스타일만 교체하면 됨
 * 
 * @example
 * // 기본 사용
 * <FormField label="이메일" required placeholder="이메일을 입력하세요" />
 * 
 * // 에러 상태
 * <FormField 
 *   label="비밀번호" 
 *   type="password" 
 *   error 
 *   errorMessage="비밀번호는 8자 이상이어야 합니다" 
 * />
 * 
 * // 커스텀 컨트롤
 * <FormField label="선택" description="옵션을 선택하세요">
 *   <Select>
 *     <MenuItem value="option1">옵션 1</MenuItem>
 *   </Select>
 * </FormField>
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  errorMessage,
  helperText,
  successMessage,
  description,
  labelPosition = 'top',
  labelWidth = '120px',
  spacing = 'normal',
  children,
  className,
  'data-testid': dataTestId = 'form-field',
  error,
  success,
  ...inputProps
}) => {
  const fieldId = inputProps.id || `form-field-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = error || !!errorMessage;
  const hasSuccess = success && !hasError;
  
  // 최종 메시지 결정
  const finalMessage = errorMessage || helperText || (hasSuccess ? successMessage : '');
  
  // 라벨 컴포넌트
  const labelElement = label && (
    <FormLabel
      htmlFor={fieldId}
      required={required}
      error={hasError}
      className={clsx(styles.label, {
        [styles.labelRequired]: required,
        [styles.labelError]: hasError,
      })}
      data-testid={`${dataTestId}-label`}
    >
      <Typography variant="body2" weight="medium">
        {label}
        {required && (
          <span className={styles.requiredIndicator} aria-label="필수 입력">
            *
          </span>
        )}
      </Typography>
    </FormLabel>
  );

  // 설명 텍스트
  const descriptionElement = description && (
    <Typography 
      variant="caption" 
      color="text-secondary"
      className={styles.description}
      data-testid={`${dataTestId}-description`}
    >
      {description}
    </Typography>
  );

  // 도움말/에러 메시지
  const messageElement = finalMessage && (
    <FormHelperText
      error={hasError}
      className={clsx(styles.message, {
        [styles.messageError]: hasError,
        [styles.messageSuccess]: hasSuccess,
      })}
      data-testid={`${dataTestId}-message`}
    >
      <Typography 
        variant="caption" 
        color={hasError ? 'error' : hasSuccess ? 'success' : 'text-secondary'}
      >
        {finalMessage}
      </Typography>
    </FormHelperText>
  );

  // 입력 컨트롤 (커스텀이 있으면 사용, 없으면 Input 사용)
  const controlElement = children || (
    <Input
      {...inputProps}
      id={fieldId}
      error={hasError}
      success={hasSuccess}
      data-testid={`${dataTestId}-input`}
    />
  );

  // 레이아웃별 렌더링
  const renderContent = () => {
    switch (labelPosition) {
      case 'left':
        return (
          <Box className={styles.horizontalLayout}>
            <Box 
              className={styles.labelSection}
              style={{ width: labelWidth }}
            >
              {labelElement}
              {descriptionElement}
            </Box>
            <Box className={styles.controlSection}>
              {controlElement}
              {messageElement}
            </Box>
          </Box>
        );
      
      case 'inline':
        return (
          <Box className={styles.inlineLayout}>
            {controlElement}
            {labelElement}
            {descriptionElement}
            {messageElement}
          </Box>
        );
      
      case 'top':
      default:
        return (
          <Box className={styles.verticalLayout}>
            {labelElement}
            {descriptionElement}
            {controlElement}
            {messageElement}
          </Box>
        );
    }
  };

  return (
    <FormControl
      fullWidth
      error={hasError}
      className={clsx(
        styles.formField,
        styles[`spacing-${spacing}`],
        styles[`layout-${labelPosition}`],
        {
          [styles.hasError]: hasError,
          [styles.hasSuccess]: hasSuccess,
          [styles.required]: required,
        },
        className
      )}
      data-testid={dataTestId}
    >
      {renderContent()}
    </FormControl>
  );
};

export default FormField;