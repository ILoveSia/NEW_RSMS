import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import clsx from 'clsx';

import styles from './Button.module.scss';

export interface ButtonProps extends Omit<MuiButtonProps, 'size' | 'variant'> {
  /** 버튼 크기 */
  size?: 'small' | 'medium' | 'large' | 'executive';
  /** 버튼 스타일 변형 */
  variant?: 'contained' | 'outlined' | 'text' | 'ghost' | 'corporate' | 'trading';
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
  /** 권한 레벨 (맨하탄 스타일 적용) */
  authorityLevel?: 'ceo' | 'executive' | 'director' | 'manager' | 'staff';
  /** 확인 필요 여부 (중요한 액션용) */
  confirmationRequired?: boolean;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * Button - 맨하탄 금융센터 스타일 버튼 컴포넌트
 * 
 * Wall Street Digital Excellence 적용
 * 즉시 반응 + 절제된 세련미 + 권한 레벨별 차별화
 * 
 * @example
 * // 기본 사용
 * <Button>클릭</Button>
 * 
 * // Executive Level (C-Suite 전용)
 * <Button 
 *   variant="corporate" 
 *   size="executive" 
 *   authorityLevel="ceo"
 *   confirmationRequired
 * >
 *   중요 결정
 * </Button>
 * 
 * // Trading Floor 스타일
 * <Button variant="trading" size="small">실시간 거래</Button>
 * 
 * // 로딩 상태
 * <Button loading loadingText="처리 중...">처리</Button>
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
  authorityLevel = 'manager',
  confirmationRequired = false,
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

  // 맨하탄 스타일 variant를 Material-UI variant로 매핑
  const getMuiVariant = () => {
    switch (variant) {
      case 'ghost': return 'text';
      case 'corporate': return 'contained';
      case 'trading': return 'outlined';
      default: return variant;
    }
  };

  return (
    <MuiButton
      {...muiProps}
      size={size === 'executive' ? 'large' : size}
      variant={getMuiVariant()}
      disabled={isDisabled}
      fullWidth={fullWidth}
      startIcon={finalStartIcon}
      endIcon={!loading ? endIcon : undefined}
      className={clsx(
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        styles[`authority-${authorityLevel}`],
        {
          [styles.loading]: loading,
          [styles.disabled]: isDisabled,
          [styles.fullWidth]: fullWidth,
          [styles.confirmationRequired]: confirmationRequired,
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