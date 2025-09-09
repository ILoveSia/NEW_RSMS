/**
 * 국제화(i18n) 설정
 * React i18next 기반 다국어 지원 시스템
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import { env } from './env';

// 지원 언어 타입 정의
export type SupportedLanguage = 'ko' | 'en';

// 네임스페이스 타입 정의
export type I18nNamespace = 
  | 'common'           // 공통 번역
  | 'auth'             // 인증/인가
  | 'users'            // 사용자 관리
  | 'risks'            // 리스크 관리
  | 'reports'          // 보고서
  | 'dashboard'        // 대시보드
  | 'settings'         // 설정
  | 'validation'       // 검증 메시지
  | 'errors';          // 에러 메시지

// i18n 초기화
i18n
  // Backend 플러그인 - 번역 파일 로드
  .use(Backend)
  // LanguageDetector 플러그인 - 브라우저 언어 감지
  .use(LanguageDetector)
  // React i18next 플러그인
  .use(initReactI18next)
  .init({
    // 기본 언어 설정
    lng: 'ko',
    fallbackLng: 'en',
    
    // 디버그 모드 (개발 환경에서만)
    debug: env.isDevelopment && env.DEV.LOG_LEVEL === 'debug',
    
    // 보간(interpolation) 설정
    interpolation: {
      escapeValue: false, // React는 이미 XSS 방지됨
    },
    
    // 네임스페이스 설정
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'users',
      'risks',
      'reports',
      'dashboard',
      'settings',
      'validation',
      'errors',
    ],
    
    // Backend 설정 - 번역 파일 경로
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/{{lng}}/{{ns}}.missing.json', // 누락된 번역 저장 경로
    },
    
    // 언어 감지 설정
    detection: {
      // 언어 감지 순서
      order: [
        'localStorage',    // 로컬 스토리지 우선
        'navigator',      // 브라우저 언어 설정
        'htmlTag',        // HTML lang 속성
        'path',           // URL 경로
        'subdomain',      // 서브도메인
      ],
      
      // 로컬 스토리지 키
      lookupLocalStorage: 'i18nextLng',
      
      // 쿠키 설정
      lookupCookie: 'i18next',
      
      // URL 경로 인덱스
      lookupFromPathIndex: 0,
      
      // 서브도메인 인덱스
      lookupFromSubdomainIndex: 0,
      
      // 감지된 언어 캐시
      caches: ['localStorage', 'cookie'],
      
      // 제외할 언어들
      excludeCacheFor: ['cimode'],
    },
    
    // React 설정
    react: {
      // Suspense 사용
      useSuspense: true,
      
      // 바인딩 타입
      bindI18n: 'languageChanged',
      
      // 번역 누락 시 키를 표시할지 여부
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
    
    // 리소스 로드 설정
    load: 'languageOnly', // 지역 코드 무시 (ko-KR → ko)
    
    // 번역 누락 처리
    saveMissing: env.isDevelopment, // 개발 환경에서만 누락 번역 저장
    
    // 키 구분자
    keySeparator: '.',
    nsSeparator: ':',
    
    // 복수형 설정
    pluralSeparator: '_',
    
    // 컨텍스트 설정
    contextSeparator: '_',
    
    // 후처리 설정
    postProcess: env.isDevelopment ? ['missingKeyHandler'] : undefined,
  });

// 언어 변경 함수
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    
    // HTML lang 속성 업데이트
    document.documentElement.lang = language;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('i18nextLng', language);
    
    if (env.isDevelopment) {
      console.log(`🌐 Language changed to: ${language}`);
    }
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// 현재 언어 가져오기
export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage;
};

// 지원 언어 목록
export const supportedLanguages: Record<SupportedLanguage, { name: string; nativeName: string }> = {
  ko: {
    name: 'Korean',
    nativeName: '한국어',
  },
  en: {
    name: 'English',
    nativeName: 'English',
  },
};

// 번역 누락 핸들러 (개발 환경용)
if (env.isDevelopment) {
  i18n.on('missingKey', (lng, namespace, key, defaultValue) => {
    console.warn(`🔍 Missing translation: [${lng}] ${namespace}:${key}`, defaultValue);
  });
}

export default i18n;