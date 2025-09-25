/**
 * 확장된 테마 상태 관리 스토어
 * 7가지 브랜드 스타일 테마로 동적 색상 변경
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 테마 타입 정의
export type ThemeType = 'default' | 'netflix' | 'amazon' | 'manhattan' | 'whatsapp';

// 테마별 색상 정의
export interface ThemeColors {
  // TopHeader 색상
  headerBackground: string;
  headerText: string;

  // LeftMenu 색상
  menuBackground: string;
  menuText: string;
  menuHover: string;
  menuActive: string;

  // PageHeader 색상
  pageHeaderBackground: string;
  pageHeaderText: string;

  // Button 색상
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;

  // Card 색상
  cardBackground: string;
  cardBorder: string;
}

// 5가지 테마별 색상 설정
export const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  default: {
    // 기본 스타일 - 모던 딥 네이비 + 사이버 아쿠아 (구 아이티센 스타일)
    headerBackground: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    headerText: '#ffffff',

    menuBackground: '#374151', // 헤더와 조화로운 차콜 그레이
    menuText: '#f9fafb',
    menuHover: '#4b5563',
    menuActive: '#06b6d4', // 사이버 아쿠아 액센트

    pageHeaderBackground: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    buttonSecondaryText: '#ffffff',

    cardBackground: '#ffffff',
    cardBorder: '#e0f2fe'
  },

  netflix: {
    // 넷플릭스 스타일 - 다크 테마 (개선: 카드 구분 가능)
    headerBackground: '#141414',
    headerText: '#ffffff',

    menuBackground: '#141414',
    menuText: '#ffffff',
    menuHover: '#333333',
    menuActive: '#e50914',

    pageHeaderBackground: 'linear-gradient(135deg, #e50914 0%, #b7070f 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #e50914 0%, #b7070f 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #e50914 0%, #b7070f 100%)',
    buttonSecondaryText: '#ffffff',

    cardBackground: '#2a2a2a',
    cardBorder: '#404040'
  },

  amazon: {
    // 아마존 스타일 - 오렌지 액센트 (기본값)
    headerBackground: '#232f3e',
    headerText: '#ffffff',

    menuBackground: '#37475a',
    menuText: '#ffffff',
    menuHover: '#485769',
    menuActive: '#ff9900',

    pageHeaderBackground: 'linear-gradient(135deg, #ff9900 0%, #ff6b00 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #ff9900 0%, #ff6b00 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #ff9900 0%, #ff6b00 100%)',
    buttonSecondaryText: '#ffffff',

    cardBackground: '#ffffff',
    cardBorder: '#ddd'
  },


  manhattan: {
    // 맨하탄 금융센터 스타일 - 프리미엄 금융 그라데이션 (전면 리디자인)
    headerBackground: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    headerText: '#ffffff',

    menuBackground: '#1e293b', // 확실한 어두운 차콜 (단색으로 안전하게)
    menuText: '#ffffff',
    menuHover: '#374151',
    menuActive: '#0ea5e9', // 골드 블루 액센트

    pageHeaderBackground: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
    buttonSecondaryText: '#ffffff',

    cardBackground: '#ffffff',
    cardBorder: '#e0f2fe'
  },

  whatsapp: {
    // WhatsApp 스타일 - 그린 테마
    headerBackground: '#075e54',
    headerText: '#ffffff',

    menuBackground: '#128c7e',
    menuText: '#ffffff',
    menuHover: '#25d366',
    menuActive: '#dcf8c6',

    pageHeaderBackground: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
    buttonSecondaryText: '#ffffff',

    cardBackground: '#ffffff',
    cardBorder: '#d1fae5'
  }
};

// 테마 정보
export interface ThemeInfo {
  id: ThemeType;
  name: string;
  description: string;
  icon: string;
}

export const THEME_OPTIONS: ThemeInfo[] = [
  {
    id: 'default',
    name: '기본 스타일',
    description: '모던 딥 네이비 + 사이버 아쿠아',
    icon: '💻'
  },
  {
    id: 'netflix',
    name: '넷플릭스 스타일',
    description: '다크하고 모던한 스타일',
    icon: '🎬'
  },
  {
    id: 'amazon',
    name: '아마존 스타일',
    description: '프로페셔널한 오렌지 액센트',
    icon: '📦'
  },
  {
    id: 'manhattan',
    name: '맨하탄 금융센터 스타일',
    description: '금융 전문가 느낌의 블루',
    icon: '🏢'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp 스타일',
    description: '친근한 그린 톤',
    icon: '💬'
  }
];

// 스토어 상태 타입
interface ThemeStore {
  currentTheme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  getThemeInfo: () => ThemeInfo;
}

// Zustand 스토어 생성
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'default', // 기본 스타일을 기본값으로 설정
      colors: THEME_COLORS.default,

      setTheme: (theme: ThemeType) => {
        const colors = THEME_COLORS[theme];
        set({
          currentTheme: theme,
          colors
        });

        // CSS 변수 업데이트
        updateCSSVariables(colors);
      },

      getThemeInfo: () => {
        const currentTheme = get().currentTheme;
        return THEME_OPTIONS.find(theme => theme.id === currentTheme) || THEME_OPTIONS[0]; // 기본 스타일이 기본값
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 저장된 테마가 유효한지 확인
          const validThemes: ThemeType[] = ['default', 'netflix', 'amazon', 'manhattan', 'whatsapp'];
          if (!validThemes.includes(state.currentTheme)) {
            // 유효하지 않은 테마면 기본값으로 리셋
            state.currentTheme = 'default';
            state.colors = THEME_COLORS.default;
          }
          // 페이지 로드 시 CSS 변수 적용
          updateCSSVariables(state.colors);
        }
      }
    }
  )
);

// HEX 색상을 RGB로 변환하는 함수
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '0, 0, 0';
}

// CSS 변수 업데이트 함수
function updateCSSVariables(colors: ThemeColors) {
  const root = document.documentElement;

  // CSS 변수 설정 (4개 영역: TopHeader, LeftMenu, PageHeader, Button)
  root.style.setProperty('--theme-header-bg', colors.headerBackground);
  root.style.setProperty('--theme-header-text', colors.headerText);

  root.style.setProperty('--theme-menu-bg', colors.menuBackground);
  root.style.setProperty('--theme-menu-text', colors.menuText);
  root.style.setProperty('--theme-menu-hover', colors.menuHover);
  root.style.setProperty('--theme-menu-active', colors.menuActive);
  root.style.setProperty('--theme-menu-active-rgb', hexToRgb(colors.menuActive));

  root.style.setProperty('--theme-page-header-bg', colors.pageHeaderBackground);
  root.style.setProperty('--theme-page-header-text', colors.pageHeaderText);

  root.style.setProperty('--theme-button-primary', colors.buttonPrimary);
  root.style.setProperty('--theme-button-primary-text', colors.buttonPrimaryText);
  root.style.setProperty('--theme-button-secondary', colors.buttonSecondary);
  root.style.setProperty('--theme-button-secondary-text', colors.buttonSecondaryText);

  root.style.setProperty('--theme-card-bg', colors.cardBackground);
  root.style.setProperty('--theme-card-border', colors.cardBorder);
}

// 초기 테마 적용 (앱 시작 시 호출)
export const initializeTheme = () => {
  const store = useThemeStore.getState();
  updateCSSVariables(store.colors);
};