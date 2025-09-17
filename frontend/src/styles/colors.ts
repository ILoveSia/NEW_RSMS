/**
 * RSMS 프로젝트 색상 상수
 * TSX 컴포넌트에서 사용할 색상 변수들
 */

// 🏙️ 맨하탄 금융센터 전용 색상 시스템 (Wall Street Digital Excellence)
export const colors = {
  // Professional Trust - 메인 색상 (블루 그레이 계열)
  primary: '#627d98',
  primary50: '#f0f4f8',
  primary100: '#d9e2ec',
  primary200: '#bcccdc',
  primary300: '#9fb3c8',
  primary400: '#829ab1',
  primary500: '#627d98',   // 메인 색상
  primary600: '#486581',
  primary700: '#334e68',
  primary800: '#243b53',
  primary900: '#102a43',   // 딥 네이비 (Header)
  primaryContrast: '#ffffff',

  // Neutral Elegance - 보조 색상 (그레이 계열)
  secondary: '#71717a',
  secondary50: '#fafafa',
  secondary100: '#f4f4f5',
  secondary200: '#e4e4e7',
  secondary300: '#d4d4d8',
  secondary400: '#a1a1aa',
  secondary500: '#71717a',   // 메인 보조색
  secondary600: '#52525b',
  secondary700: '#3f3f46',
  secondary800: '#27272a',
  secondary900: '#18181b',   // 최고 명도 텍스트
  secondaryContrast: '#ffffff',

  // 기능별 색상
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0284c7',

  // 텍스트 색상
  textPrimary: '#18181b',
  textSecondary: '#71717a',
  textDisabled: '#a1a1aa',
  textInverse: '#ffffff',

  // 배경 색상
  backgroundDefault: '#fafafa',
  backgroundPaper: '#ffffff',
  backgroundNeutral: '#f4f4f5',
  backgroundHover: '#f0f4f8',
  backgroundSelected: '#d9e2ec',

  // 경계선 색상
  borderDefault: '#e4e4e7',
  borderLight: '#f4f4f5',
  borderDark: '#d4d4d8',
  borderFocus: '#627d98',
} as const;

export type ColorKey = keyof typeof colors;