import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import clsx from 'clsx';

import styles from './Button.module.scss';

export interface ButtonProps extends Omit<MuiButtonProps, 'size' | 'variant'> {
  /** 버튼 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 버튼 스타일 변형 */
  variant?: 'contained' | 'outlined' | 'text' | 'ghost';
  /** 로딩 상태 */
  loading?: boolean;
  /** 로딩 중 표시 텍스트 */
  loadingText?: string;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 아이콘 (좌측) */
  startIcon?: React.ReactNode;
  /** 아이콘 (우측) */
  endIcon?: React.ReactNode;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * Button - 확장 가능한 버튼 컴포넌트
 * 
 * UI 디자인 시스템 적용 시 스타일만 교체하면 됨
 * 
 * @example
 * // 기본 사용
 * <Button>클릭</Button>
 * 
 * // 로딩 상태
 * <Button loading loadingText="저장 중...">저장</Button>
 * 
 * // 아이콘 포함
 * <Button startIcon={<AddIcon />}>추가</Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  variant = 'contained',
  loading = false,
  loadingText,
  fullWidth = false,
  startIcon,
  endIcon,
  disabled,
  className,
  'data-testid': dataTestId = 'button',
  ...muiProps
}) => {
  const isDisabled = disabled || loading;
  
  // 로딩 중일 때 아이콘 처리
  const finalStartIcon = loading ? (
    <CircularProgress 
      size={16} 
      color="inherit"
      data-testid={`${dataTestId}-loading-spinner`}
    />
  ) : startIcon;

  // 로딩 중일 때 텍스트 처리
  const displayText = loading && loadingText ? loadingText : children;

  // variant가 'ghost'인 경우 Material-UI의 'text'로 매핑
  const muiVariant = variant === 'ghost' ? 'text' : variant;

  return (
    <MuiButton
      {...muiProps}
      size={size}
      variant={muiVariant}
      disabled={isDisabled}
      fullWidth={fullWidth}
      startIcon={finalStartIcon}
      endIcon={!loading ? endIcon : undefined}
      className={clsx(
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        {
          [styles.loading]: loading,
          [styles.disabled]: isDisabled,
          [styles.fullWidth]: fullWidth,
        },
        className
      )}
      data-testid={dataTestId}
    >
      {displayText}
    </MuiButton>
  );
};

export default Button;