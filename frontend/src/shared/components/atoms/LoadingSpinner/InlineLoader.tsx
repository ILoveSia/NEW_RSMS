/**
 * InlineLoader - 인라인 로딩 표시 컴포넌트
 * 버튼 내부나 작은 영역에서 사용하는 로딩 스피너
 */

import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import clsx from 'clsx';
import styles from './InlineLoader.module.scss';

export interface InlineLoaderProps {
  /** 로딩 중인지 여부 */
  loading: boolean;
  /** 스피너 크기 */
  size?: 'xs' | 'sm' | 'md' | number;
  /** 색상 */
  color?: 'primary' | 'secondary' | 'inherit' | 'white';
  /** 로딩 텍스트 */
  text?: string;
  /** 커스텀 className */
  className?: string;
  /** 자식 컴포넌트 (로딩 중이 아닐 때 표시) */
  children?: React.ReactNode;
  /** 테스트 id */
  'data-testid'?: string;
}

const SPINNER_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
} as const;

/**
 * InlineLoader 컴포넌트
 *
 * @example
 * // 버튼 내 로딩
 * <InlineLoader loading={submitting} size="sm" color="white">
 *   저장
 * </InlineLoader>
 *
 * // 텍스트와 함께
 * <InlineLoader loading={true} text="처리 중..." />
 */
const InlineLoader: React.FC<InlineLoaderProps> = ({
  loading,
  size = 'sm',
  color = 'primary',
  text,
  className,
  children,
  'data-testid': dataTestId = 'inline-loader',
}) => {
  const spinnerSize = typeof size === 'number' ? size : SPINNER_SIZES[size];

  if (loading) {
    return (
      <Box
        className={clsx(styles.container, className)}
        data-testid={dataTestId}
      >
        <CircularProgress
          size={spinnerSize}
          color={color === 'white' ? 'inherit' : color}
          className={clsx({
            [styles.whiteSpinner]: color === 'white',
          })}
          data-testid={`${dataTestId}-spinner`}
        />
        {text && (
          <span
            className={styles.text}
            data-testid={`${dataTestId}-text`}
          >
            {text}
          </span>
        )}
      </Box>
    );
  }

  return <>{children}</>;
};

export default InlineLoader;