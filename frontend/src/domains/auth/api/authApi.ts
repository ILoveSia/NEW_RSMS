/**
 * 인증 API 클라이언트
 * - 로그인, 로그아웃, 세션 관리 API 호출
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키 전송을 위해 필수
});

// 요청 인터셉터: 세션 ID를 헤더에 추가
authApiClient.interceptors.request.use(
  (config) => {
    // LocalStorage에서 세션 ID 가져오기
    const authStore = localStorage.getItem('rsms-auth-store');
    if (authStore) {
      try {
        const { state } = JSON.parse(authStore);
        if (state?.sessionId) {
          config.headers['X-Auth-Token'] = state.sessionId;
        }
      } catch (e) {
        console.error('세션 ID 파싱 실패:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃 처리
      console.error('인증 실패 - 세션이 만료되었습니다');
      // authStore.logout() 호출은 컴포넌트에서 처리
    }
    return Promise.reject(error);
  }
);

// =====================
// 타입 정의
// =====================

/**
 * 로그인 요청
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  userInfo?: UserInfo;
}

/**
 * 사용자 정보
 */
export interface UserInfo {
  userId: number;
  username: string;
  empNo: string;
  isAdmin: boolean;
  isExecutive: boolean;
  authLevel: number;
  roles: string[];
  needsPasswordChange: boolean;
  timezone: string;
  language: string;
}

/**
 * 로그아웃 응답
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * 현재 사용자 응답
 */
export interface CurrentUserResponse {
  success: boolean;
  message?: string;
  userInfo?: UserInfo;
}

/**
 * 세션 확인 응답
 */
export interface SessionCheckResponse {
  valid: boolean;
  message: string;
}

// =====================
// API 함수들
// =====================

/**
 * 로그인
 * POST /api/auth/login
 */
export const loginApi = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await authApiClient.post<LoginResponse>('/api/auth/login', request);
  return response.data;
};

/**
 * 로그아웃
 * POST /api/auth/logout
 */
export const logoutApi = async (): Promise<LogoutResponse> => {
  const response = await authApiClient.post<LogoutResponse>('/api/auth/logout');
  return response.data;
};

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /api/auth/me
 */
export const getCurrentUserApi = async (): Promise<CurrentUserResponse> => {
  const response = await authApiClient.get<CurrentUserResponse>('/api/auth/me');
  return response.data;
};

/**
 * 세션 유효성 확인
 * GET /api/auth/session
 */
export const checkSessionApi = async (): Promise<SessionCheckResponse> => {
  const response = await authApiClient.get<SessionCheckResponse>('/api/auth/session');
  return response.data;
};

/**
 * 헬스 체크
 * GET /api/auth/health
 */
export const authHealthCheckApi = async (): Promise<{ status: string; service: string }> => {
  const response = await authApiClient.get('/api/auth/health');
  return response.data;
};

export default authApiClient;
