/**
 * 공통 API 클라이언트
 * - 모든 API 요청에서 사용하는 공통 axios 인스턴스
 * - 인증 에러(401) 발생 시 자동 로그아웃 처리
 * - 세션 쿠키 자동 전송
 *
 * @author Claude AI
 * @since 2025-10-29
 */

import axios, { type AxiosInstance } from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

/**
 * 공통 API 클라이언트 인스턴스
 * - 모든 도메인 API에서 이 인스턴스를 사용해야 함
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키 전송을 위해 필수
});

/**
 * 요청 인터셉터
 * - 세션 ID를 헤더에 추가 (선택적)
 */
apiClient.interceptors.request.use(
  (config) => {
    // LocalStorage에서 세션 ID 가져오기 (선택적)
    const authStore = localStorage.getItem('rsms-auth-store');
    if (authStore) {
      try {
        const { state } = JSON.parse(authStore);
        if (state?.sessionId) {
          config.headers['X-Auth-Token'] = state.sessionId;
        }
      } catch (e) {
        console.error('[apiClient] 세션 ID 파싱 실패:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 401/403 에러 발생 시 자동 로그아웃 및 로그인 페이지 리다이렉트
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 Unauthorized 또는 403 Forbidden: 인증 실패 또는 세션 만료
    // Spring Security에서 세션이 없을 때 403을 반환하는 경우가 있음
    if (status === 401 || status === 403) {
      console.error(`[apiClient] ${status === 401 ? '인증 실패' : '접근 거부'} - 세션이 만료되었습니다`);

      // localStorage 초기화
      localStorage.removeItem('rsms-auth-store');

      // 현재 경로가 로그인 페이지가 아닐 때만 리다이렉트
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
        // 로그인 페이지로 리다이렉트
        console.log('[apiClient] 로그인 페이지로 리다이렉트');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
