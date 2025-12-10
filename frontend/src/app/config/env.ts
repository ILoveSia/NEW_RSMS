/**
 * 환경 변수 관리
 * 모든 환경 변수는 이 파일을 통해 타입 안전하게 접근
 */

interface AppConfig {
  // 애플리케이션 정보
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENVIRONMENT: 'development' | 'staging' | 'production';
  
  // API 설정
  API_BASE_URL: string;
  API_TIMEOUT: number;
  
  // 인증 설정
  AUTH_SESSION_TIMEOUT: number;
  
  // 피처 플래그
  FEATURES: {
    DARK_MODE: boolean;
    STORYBOOK: boolean;
    ANALYTICS: boolean;
    RISK_ANALYTICS: boolean;
    ADVANCED_REPORTS: boolean;
    DASHBOARD_WIDGETS: boolean;
  };
  
  // 파일 업로드 설정
  UPLOAD: {
    MAX_FILE_SIZE: number;
    MAX_FILES_PER_UPLOAD: number;
    ALLOWED_FILE_TYPES: string;
  };
  
  // 개발 환경 설정
  DEV: {
    ENABLE_MOCK_API: boolean;
    SHOW_DEV_TOOLS: boolean;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  };
  
  // 외부 서비스
  EXTERNAL: {
    SENTRY_DSN?: string;
    GOOGLE_ANALYTICS_ID?: string;
    AG_GRID_LICENSE_KEY?: string;
  };
  
  // 런타임 체크
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  isTest: boolean;
}

// 환경 변수 검증 함수들
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return numValue;
}

// 환경 설정 객체
export const env: AppConfig = {
  // 애플리케이션 정보
  APP_NAME: getEnvVar('VITE_APP_NAME', 'RSMS'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  APP_ENVIRONMENT: getEnvVar('VITE_APP_ENVIRONMENT', 'development') as AppConfig['APP_ENVIRONMENT'],
  
  // API 설정 (개발 환경에서는 Vite 프록시 사용)
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', '/api'),
  API_TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 30000),
  
  // 인증 설정
  AUTH_SESSION_TIMEOUT: getEnvNumber('VITE_AUTH_SESSION_TIMEOUT', 3600000), // 1시간
  
  // 피처 플래그
  FEATURES: {
    DARK_MODE: getEnvBoolean('VITE_FEATURE_DARK_MODE', true),
    STORYBOOK: getEnvBoolean('VITE_FEATURE_STORYBOOK', true),
    ANALYTICS: getEnvBoolean('VITE_FEATURE_ANALYTICS', false),
    RISK_ANALYTICS: getEnvBoolean('VITE_FEATURE_RISK_ANALYTICS', true),
    ADVANCED_REPORTS: getEnvBoolean('VITE_FEATURE_ADVANCED_REPORTS', true),
    DASHBOARD_WIDGETS: getEnvBoolean('VITE_FEATURE_DASHBOARD_WIDGETS', true),
  },
  
  // 파일 업로드 설정
  UPLOAD: {
    MAX_FILE_SIZE: getEnvNumber('VITE_MAX_FILE_SIZE', 10485760), // 10MB
    MAX_FILES_PER_UPLOAD: getEnvNumber('VITE_MAX_FILES_PER_UPLOAD', 5),
    ALLOWED_FILE_TYPES: getEnvVar('VITE_ALLOWED_FILE_TYPES', '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'),
  },
  
  // 개발 환경 설정
  DEV: {
    ENABLE_MOCK_API: getEnvBoolean('VITE_ENABLE_MOCK_API', false),
    SHOW_DEV_TOOLS: getEnvBoolean('VITE_SHOW_DEV_TOOLS', true),
    LOG_LEVEL: (getEnvVar('VITE_LOG_LEVEL', 'debug') as AppConfig['DEV']['LOG_LEVEL']),
  },
  
  // 외부 서비스
  EXTERNAL: {
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    AG_GRID_LICENSE_KEY: import.meta.env.VITE_AG_GRID_LICENSE_KEY,
  },
  
  // 런타임 체크
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isStaging: import.meta.env.MODE === 'staging',
  isTest: import.meta.env.MODE === 'test',
};

// 환경 변수 검증 함수
export const validateEnv = (): void => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn('❌ Missing environment variables:', missingVars);
  }
  
  // 개발 환경에서 설정 정보 출력
  if (env.isDevelopment && env.DEV.LOG_LEVEL === 'debug') {
    console.log('🚀 RSMS Environment Configuration:', {
      environment: env.APP_ENVIRONMENT,
      api: {
        baseUrl: env.API_BASE_URL,
        timeout: env.API_TIMEOUT,
      },
      features: env.FEATURES,
      upload: env.UPLOAD,
    });
  }
};

// 편의 함수들
export const isFeatureEnabled = (feature: keyof AppConfig['FEATURES']): boolean => {
  return env.FEATURES[feature];
};

export const getApiUrl = (endpoint: string): string => {
  return `${env.API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export default env;