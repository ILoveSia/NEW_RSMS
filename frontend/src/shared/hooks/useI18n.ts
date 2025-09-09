/**
 * 다국어 지원을 위한 커스텀 훅
 * React i18next 래퍼 훅으로 타입 안전성과 편의성 제공
 */

import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { 
  I18nNamespace, 
  SupportedLanguage, 
  changeLanguage, 
  getCurrentLanguage,
  supportedLanguages 
} from '@/app/config/i18n';

// 네임스페이스별 타입 정의를 위한 인터페이스
interface UseI18nReturn {
  t: TFunction;
  language: SupportedLanguage;
  languages: typeof supportedLanguages;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
  ready: boolean;
}

/**
 * 기본 다국어 훅
 * @param namespace - 사용할 네임스페이스 (기본값: 'common')
 * @returns 다국어 관련 함수 및 상태
 */
export const useI18n = (namespace: I18nNamespace = 'common'): UseI18nReturn => {
  const { t, i18n, ready } = useTranslation(namespace);

  return {
    t,
    language: getCurrentLanguage(),
    languages: supportedLanguages,
    changeLanguage,
    isLoading: !ready,
    ready,
  };
};

/**
 * 공통 번역 훅 (common 네임스페이스 전용)
 */
export const useCommonTranslation = () => {
  return useI18n('common');
};

/**
 * 인증 관련 번역 훅
 */
export const useAuthTranslation = () => {
  return useI18n('auth');
};

/**
 * 사용자 관리 번역 훅
 */
export const useUsersTranslation = () => {
  return useI18n('users');
};

/**
 * 리스크 관리 번역 훅
 */
export const useRisksTranslation = () => {
  return useI18n('risks');
};

/**
 * 보고서 번역 훅
 */
export const useReportsTranslation = () => {
  return useI18n('reports');
};

/**
 * 대시보드 번역 훅
 */
export const useDashboardTranslation = () => {
  return useI18n('dashboard');
};

/**
 * 설정 번역 훅
 */
export const useSettingsTranslation = () => {
  return useI18n('settings');
};

/**
 * 검증 메시지 번역 훅
 */
export const useValidationTranslation = () => {
  return useI18n('validation');
};

/**
 * 에러 메시지 번역 훅
 */
export const useErrorsTranslation = () => {
  return useI18n('errors');
};

/**
 * 다중 네임스페이스 번역 훅
 * 여러 네임스페이스를 동시에 사용할 때 유용
 * @param namespaces - 사용할 네임스페이스 배열
 */
export const useMultipleTranslation = (namespaces: I18nNamespace[]) => {
  const { t, i18n, ready } = useTranslation(namespaces);

  return {
    t,
    language: getCurrentLanguage(),
    languages: supportedLanguages,
    changeLanguage,
    isLoading: !ready,
    ready,
  };
};

/**
 * 언어 변경 상태 관리 훅
 */
export const useLanguageSelector = () => {
  const { language, languages, changeLanguage } = useI18n();

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    try {
      await changeLanguage(newLanguage);
      // 페이지 새로고침이 필요한 경우
      // window.location.reload();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return {
    currentLanguage: language,
    availableLanguages: Object.entries(languages).map(([code, info]) => ({
      code: code as SupportedLanguage,
      ...info,
    })),
    changeLanguage: handleLanguageChange,
  };
};

/**
 * 번역 키 존재 여부 확인 훅
 * @param key - 확인할 번역 키
 * @param namespace - 네임스페이스 (기본값: 'common')
 */
export const useTranslationExists = (key: string, namespace: I18nNamespace = 'common') => {
  const { i18n } = useTranslation(namespace);
  
  return i18n.exists(key);
};

/**
 * 번역 로딩 상태 확인 훅
 */
export const useTranslationReady = (namespace?: I18nNamespace) => {
  const { ready } = useTranslation(namespace);
  return ready;
};

export default useI18n;