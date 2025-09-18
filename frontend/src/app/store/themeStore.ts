/**
 * 확장된 테마 상태 관리 스토어
 * 7가지 브랜드 스타일 테마로 동적 색상 변경
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 테마 타입 정의
export type ThemeType = 'default' | 'netflix' | 'amazon' | 'instagram' | 'manhattan' | 'whatsapp' | 'apple' | 'google';

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
}

// 8가지 테마별 색상 설정
export const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  default: {
    // 기본 스타일 - 차분한 슬레이트 그레이
    headerBackground: '#64748b',
    headerText: '#ffffff',

    menuBackground: '#f1f5f9',
    menuText: '#334155',
    menuHover: '#e2e8f0',
    menuActive: '#3b82f6',

    pageHeaderBackground: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    buttonSecondaryText: '#ffffff'
  },

  netflix: {
    // 넷플릭스 스타일 - 다크 테마
    headerBackground: '#141414',
    headerText: '#ffffff',

    menuBackground: '#141414',
    menuText: '#ffffff',
    menuHover: '#333333',
    menuActive: '#e50914',

    pageHeaderBackground: '#e50914',
    pageHeaderText: '#ffffff',

    buttonPrimary: '#e50914',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#e50914',
    buttonSecondaryText: '#ffffff'
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
    buttonSecondaryText: '#ffffff'
  },

  instagram: {
    // 인스타그램 스타일 - 그라데이션 컨셉
    headerBackground: '#ffffff',
    headerText: '#262626',

    menuBackground: '#fafafa',
    menuText: '#262626',
    menuHover: '#f0f0f0',
    menuActive: '#e1306c',

    pageHeaderBackground: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    buttonSecondaryText: '#ffffff'
  },

  manhattan: {
    // 맨하탄 금융센터 스타일 - 금융 느낌의 다크 블루
    headerBackground: '#0a1428',
    headerText: '#ffffff',

    menuBackground: '#1e293b',
    menuText: '#ffffff',
    menuHover: '#334155',
    menuActive: '#3b82f6',

    pageHeaderBackground: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    buttonSecondaryText: '#ffffff'
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
    buttonSecondaryText: '#ffffff'
  },

  apple: {
    // 애플 스타일 - 미니멀 그레이/블루 액센트
    headerBackground: '#f6f6f6',
    headerText: '#1d1d1f',

    menuBackground: '#ffffff',
    menuText: '#1d1d1f',
    menuHover: '#f5f5f7',
    menuActive: '#007aff',

    pageHeaderBackground: 'linear-gradient(135deg, #007aff 0%, #0051d5 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #007aff 0%, #0051d5 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #007aff 0%, #0051d5 100%)',
    buttonSecondaryText: '#ffffff'
  },

  google: {
    // 구글 스타일 - 클린하고 모던한 스타일
    headerBackground: '#ffffff',
    headerText: '#202124',

    menuBackground: '#f8f9fa',
    menuText: '#202124',
    menuHover: '#e8eaed',
    menuActive: '#4285f4',

    pageHeaderBackground: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #ea4335 100%)',
    pageHeaderText: '#ffffff',

    buttonPrimary: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #ea4335 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #ea4335 100%)',
    buttonSecondaryText: '#ffffff'
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
    description: '차분한 슬레이트 그레이 디자인',
    icon: '🎨'
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
    id: 'instagram',
    name: '인스타그램 스타일',
    description: '밝고 모던한 그라데이션',
    icon: '📷'
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
  },
  {
    id: 'apple',
    name: '애플 스타일',
    description: '미니멀하고 깔끔한 디자인',
    icon: '🍎'
  },
  {
    id: 'google',
    name: '구글 스타일',
    description: '클린하고 모던한 디자인',
    icon: '🔍'
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
      currentTheme: 'amazon', // 아마존을 기본값으로 설정
      colors: THEME_COLORS.amazon,

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
        return THEME_OPTIONS.find(theme => theme.id === currentTheme) || THEME_OPTIONS[1]; // 아마존이 기본값
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 페이지 로드 시 CSS 변수 적용
          updateCSSVariables(state.colors);
        }
      }
    }
  )
);

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

  root.style.setProperty('--theme-page-header-bg', colors.pageHeaderBackground);
  root.style.setProperty('--theme-page-header-text', colors.pageHeaderText);

  root.style.setProperty('--theme-button-primary', colors.buttonPrimary);
  root.style.setProperty('--theme-button-primary-text', colors.buttonPrimaryText);
  root.style.setProperty('--theme-button-secondary', colors.buttonSecondary);
  root.style.setProperty('--theme-button-secondary-text', colors.buttonSecondaryText);
}

// 초기 테마 적용 (앱 시작 시 호출)
export const initializeTheme = () => {
  const store = useThemeStore.getState();
  updateCSSVariables(store.colors);
};