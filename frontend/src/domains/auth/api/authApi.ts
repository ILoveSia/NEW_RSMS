/**
 * 인증 API 클라이언트
 * - 로그인, 로그아웃, 세션 관리 API 호출
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import apiClient from '@/shared/api/apiClient';

// authApiClient는 공통 apiClient를 사용
const authApiClient = apiClient;

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
 * POST /auth/login
 */
export const loginApi = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await authApiClient.post<LoginResponse>('/auth/login', request);
  return response.data;
};

/**
 * 로그아웃
 * POST /auth/logout
 */
export const logoutApi = async (): Promise<LogoutResponse> => {
  const response = await authApiClient.post<LogoutResponse>('/auth/logout');
  return response.data;
};

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /auth/me
 */
export const getCurrentUserApi = async (): Promise<CurrentUserResponse> => {
  const response = await authApiClient.get<CurrentUserResponse>('/auth/me');
  return response.data;
};

/**
 * 세션 유효성 확인
 * GET /auth/session
 */
export const checkSessionApi = async (): Promise<SessionCheckResponse> => {
  const response = await authApiClient.get<SessionCheckResponse>('/auth/session');
  return response.data;
};

/**
 * 헬스 체크
 * GET /auth/health
 */
export const authHealthCheckApi = async (): Promise<{ status: string; service: string }> => {
  const response = await authApiClient.get('/auth/health');
  return response.data;
};

export default authApiClient;
