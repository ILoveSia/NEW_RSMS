import React from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';
import clsx from 'clsx';

import styles from './Typography.module.scss';

export interface TypographyProps extends Omit<MuiTypographyProps, 'variant'> {
  /** 타이포그래피 변형 */
  variant?: 
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'subtitle1' | 'subtitle2'
    | 'body1' | 'body2'
    | 'caption' | 'overline'
    | 'inherit';
  /** 텍스트 색상 */
  color?: 
    | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
    | 'text-primary' | 'text-secondary' | 'text-disabled'
    | 'inherit';
  /** 텍스트 정렬 */
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  /** 글꼴 굵기 */
  weight?: 'light' | 'normal' | 'medium' | 'bold' | number;
  /** 줄 높이 */
  lineHeight?: 'none' | 'tight' | 'normal' | 'relaxed' | number;
  /** 텍스트 생략 */
  truncate?: boolean;
  /** 여러 줄 생략 (줄 수) */
  clamp?: number;
  /** 굵게 표시 */
  bold?: boolean;
  /** 기울임 표시 */
  italic?: boolean;
  /** 밑줄 표시 */
  underline?: boolean;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * Typography - 확장 가능한 타이포그래피 컴포넌트
 * 
 * UI 디자인 시스템 적용 시 폰트, 크기, 색상 등을 교체하면 됨
 * 
 * @example
 * // 제목 사용
 * <Typography variant="h1">메인 제목</Typography>
 * 
 * // 색상과 정렬
 * <Typography variant="body1" color="text-secondary" align="center">
 *   설명 텍스트
 * </Typography>
 * 
 * // 텍스트 생략
 * <Typography truncate>
 *   매우 긴 텍스트가 여기에 들어갑니다...
 * </Typography>
 */
const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'inherit',
  align = 'inherit',
  weight,
  lineHeight,
  truncate = false,
  clamp,
  bold = false,
  italic = false,
  underline = false,
  className,
  'data-testid': dataTestId = 'typography',
  ...muiProps
}) => {
  // Material-UI 색상 매핑
  const getMuiColor = (customColor: string) => {
    switch (customColor) {
      case 'text-primary':
        return 'textPrimary';
      case 'text-secondary':
        return 'textSecondary';
      case 'text-disabled':
        return 'textDisabled';
      default:
        return customColor as MuiTypographyProps['color'];
    }
  };

  const muiColor = getMuiColor(color);

  // 스타일 클래스 구성
  const classNames = clsx(
    styles.typography,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    styles[`align-${align}`],
    {
      [styles.truncate]: truncate,
      [styles[`clamp-${clamp}`]]: clamp,
      [styles.bold]: bold,
      [styles.italic]: italic,
      [styles.underline]: underline,
      [styles[`weight-${weight}`]]: weight && typeof weight === 'string',
      [styles[`lineHeight-${lineHeight}`]]: lineHeight && typeof lineHeight === 'string',
    },
    className
  );

  // 인라인 스타일
  const inlineStyles: React.CSSProperties = {
    ...(typeof weight === 'number' && { fontWeight: weight }),
    ...(typeof lineHeight === 'number' && { lineHeight: lineHeight }),
  };

  return (
    <MuiTypography
      {...muiProps}
      variant={variant}
      color={muiColor}
      align={align}
      className={classNames}
      style={inlineStyles}
      data-testid={dataTestId}
    >
      {children}
    </MuiTypography>
  );
};

export default Typography;