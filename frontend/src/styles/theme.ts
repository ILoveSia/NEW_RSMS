import { createTheme } from '@mui/material/styles';
import { koKR } from '@mui/material/locale';

// 🏙️ RSMS 맨하탄 금융센터 전용 Material-UI 테마 (Wall Street Digital Excellence)
export const manhattanFinancialTheme = createTheme({
  palette: {
    mode: 'light',
    // Professional Trust - 메인 색상 (블루 그레이 계열)
    primary: {
      50: '#f0f4f8',
      100: '#d9e2ec',
      200: '#bcccdc',
      300: '#9fb3c8',
      400: '#829ab1',
      500: '#627d98',   // 메인 색상
      600: '#486581',
      700: '#334e68',
      800: '#243b53',
      900: '#102a43',
      main: '#627d98',
      light: '#829ab1',
      dark: '#334e68',
      contrastText: '#ffffff',
    },
    // Neutral Elegance - 보조 색상 (그레이 계열)
    secondary: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',   // 메인 보조색
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      main: '#71717a',
      light: '#a1a1aa',
      dark: '#3f3f46',
      contrastText: '#ffffff',
    },
    // 기능별 색상 (채도 대폭 낮춤 - 금융권 특화)
    error: {
      main: '#dc2626',      // 차분한 레드 (오류, 반려)
      light: '#ef4444',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',      // 차분한 오렌지 (경고, 대기)  
      light: '#f59e0b',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0284c7',      // 차분한 블루 (정보, 알림)
      light: '#0ea5e9',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',      // 차분한 그린 (승인, 완료)
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    // 배경 및 표면 색상
    background: {
      default: '#fafafa',   // 앱 전체 배경
      paper: '#ffffff',     // 카드/패널 배경
    },
    // 텍스트 색상 (높은 대비비 확보)
    text: {
      primary: '#18181b',     // 16.68:1 대비비
      secondary: '#71717a',   // 5.74:1 대비비  
      disabled: '#a1a1aa',    // 3.03:1 대비비
    },
    // 구분선 색상
    divider: '#e4e4e7',
    // 액션 색상
    action: {
      hover: '#f0f4f8',
      selected: '#d9e2ec',
      disabled: '#a1a1aa',
      disabledBackground: '#f4f4f5',
    },
  },
  // 타이포그래피 (금융권 전문성 강화)
  typography: {
    fontFamily: [
      'Inter',                // 현대적 가독성
      'Roboto',
      'Noto Sans KR',        // 한국어 지원
      'SF Pro Display',      // macOS 네이티브
      'Segoe UI',            // Windows 네이티브
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ].join(','),
    // 제목 계층 (금융권 문서 표준)
    h1: {
      fontSize: '2rem',         // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.5rem',       // 24px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1.25rem',      // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',     // 18px
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',         // 16px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    // 본문 텍스트 (가독성 최적화)
    body1: {
      fontSize: '0.875rem',     // 14px (금융권 표준)
      lineHeight: 1.5,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.75rem',      // 12px (보조 텍스트)
      lineHeight: 1.4,
      fontWeight: 400,
    },
    // UI 요소
    button: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 500,
      textTransform: 'none',    // 금융권에서는 대문자 변환 지양
      lineHeight: 1.75,
    },
    caption: {
      fontSize: '0.75rem',      // 12px
      lineHeight: 1.4,
      fontWeight: 400,
    },
    overline: {
      fontSize: '0.625rem',     // 10px
      lineHeight: 1.5,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  spacing: 8,                   // 8px 기본 단위 유지
  shape: {
    borderRadius: 6,            // 약간 줄인 radius로 정형화된 느낌
  },
  // 🎨 맨하탄 금융센터 전용 컴포넌트 스타일링 (Wall Street Components)
  components: {
    // Button - 맨하탄 금융가 스타일 (즉시 반응 + 절제된 세련미)
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
          minHeight: 36,
          boxShadow: 'none',
          transition: 'all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Manhattan ease-out
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', // 미묘한 상승감
            transform: 'translateY(-1px)',              // 1px만 상승 (절제)
          },
          '&:active': {
            transform: 'translateY(0)',
            transition: 'all 50ms ease-out',            // 더 빠른 액티브 전환
          },
        },
        contained: {
          backgroundColor: '#627d98',  // 금융권 메인 색상
          '&:hover': {
            backgroundColor: '#486581',
          },
          '&:active': {
            backgroundColor: '#334e68',
          },
          // Executive Level Button (C-Suite 전용)
          '&.executive-button': {
            minHeight: 56,                             // 더 큰 높이
            fontSize: '1rem',
            fontWeight: 600,
            backgroundColor: '#334e68',                // Platinum 색상
            boxShadow: '0 4px 12px rgba(51, 78, 104, 0.25)',
            '&:hover': {
              backgroundColor: '#243b53',
              boxShadow: '0 6px 16px rgba(51, 78, 104, 0.35)',
              transform: 'translateY(-2px)',           // 더 큰 상승
            },
          },
        },
        outlined: {
          borderColor: '#627d98',
          color: '#627d98',
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
            backgroundColor: '#f0f4f8',  // 매우 연한 배경
            borderColor: '#486581',
          },
        },
        text: {
          color: '#627d98',
          '&:hover': {
            backgroundColor: '#f0f4f8',
          },
        },
      },
    },
    // TextField - 명확하고 전문적인 입력 필드
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e4e4e7',    // 금융권 경계선
            },
            '&:hover fieldset': {
              borderColor: '#d4d4d8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#627d98',    // 포커스 시 메인 색상
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#71717a',
            '&.Mui-focused': {
              color: '#627d98',
            },
          },
        },
      },
    },
    // Paper - 미묘한 그림자로 depth 표현
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
        },
        elevation1: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.08)',  // 더 미묘한 그림자
          border: '1px solid #f4f4f5',
        },
        elevation2: {
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
          border: '1px solid #e4e4e7',
        },
        elevation3: {
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.08)',
          border: '1px solid #d4d4d8',
        },
      },
    },
    // Card - 카드 컴포넌트
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
          border: '1px solid #f4f4f5',
          borderRadius: 8,
          backgroundColor: '#ffffff',
        },
      },
    },
    // DataGrid - AG-Grid와 일관된 스타일
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #e4e4e7',
          borderRadius: 6,
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f4f4f5',
            fontSize: '0.875rem',
            color: '#18181b',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f4f4f5',
            borderBottom: '2px solid #e4e4e7',
            color: '#18181b',
            fontWeight: 500,
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: '#f0f4f8',
            },
            '&.Mui-selected': {
              backgroundColor: '#d9e2ec',
            },
          },
        },
      },
    },
    // Tab - 탭 컴포넌트
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minWidth: 'auto',
          color: '#71717a',
          '&.Mui-selected': {
            color: '#627d98',
          },
        },
      },
    },
    // Chip - 칩 컴포넌트
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
          backgroundColor: '#f4f4f5',
          color: '#71717a',
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#d9e2ec',
            color: '#334e68',
          },
        },
      },
    },
    // AppBar - 상단 바 (사용하지 않지만 일관성 위해)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#102a43',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    // Drawer - 사이드 드로어 (모바일용)
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e4e4e7',
          backgroundColor: '#f4f4f5',
          boxShadow: 'none',
        },
      },
    },
  },
}, koKR); // 한국어 로케일 적용

// 기존 테마도 export (하위 호환성)
export const theme = manhattanFinancialTheme;
export const financialTheme = manhattanFinancialTheme;