import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import clsx from 'clsx';

import styles from './LoadingSpinner.module.scss';

export interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: 'small' | 'medium' | 'large' | number;
  /** 색상 테마 */
  color?: 'primary' | 'secondary' | 'inherit';
  /** 중앙 정렬 여부 */
  centered?: boolean;
  /** 전체 화면 오버레이 여부 */
  fullScreen?: boolean;
  /** 로딩 텍스트 */
  text?: string;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

const SPINNER_SIZES = {
  small: 20,
  medium: 40,
  large: 60,
} as const;

/**
 * LoadingSpinner - 로딩 상태를 표시하는 스피너 컴포넌트
 * 
 * @example
 * // 기본 사용
 * <LoadingSpinner />
 * 
 * // 중앙 정렬 + 텍스트
 * <LoadingSpinner centered text="로딩 중..." />
 * 
 * // 전체 화면 오버레이
 * <LoadingSpinner fullScreen text="데이터를 불러오는 중..." />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  centered = false,
  fullScreen = false,
  text,
  className,
  'data-testid': dataTestId = 'loading-spinner',
}) => {
  const spinnerSize = typeof size === 'number' ? size : SPINNER_SIZES[size];

  const spinner = (
    <CircularProgress
      size={spinnerSize}
      color={color}
      data-testid={`${dataTestId}-circular`}
    />
  );

  const content = (
    <Box
      className={clsx(
        styles.container,
        {
          [styles.centered]: centered && !fullScreen,
          [styles.fullScreen]: fullScreen,
        },
        className
      )}
      data-testid={dataTestId}
    >
      <Box className={styles.spinnerWrapper}>
        {spinner}
        {text && (
          <Box 
            className={styles.text}
            data-testid={`${dataTestId}-text`}
          >
            {text}
          </Box>
        )}
      </Box>
    </Box>
  );

  return content;
};

export default LoadingSpinner;