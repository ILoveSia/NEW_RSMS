/**
 * 사용자 관리 API
 * - users, user_roles 테이블 CRUD API
 * - employees 테이블 조인으로 부서/직책 정보 포함
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 사용자 응답 DTO
// ===============================

/**
 * 사용자 역할 DTO
 * - user_roles + roles 테이블 조인 결과
 */
export interface UserRoleDto {
  userRoleId?: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  roleCategory?: string;
  assignedAt?: string;
  assignedBy?: string;
  isActive: boolean;
}

/**
 * 사용자 응답 DTO
 * - users 테이블 + employees 조인 결과
 */
export interface UserDto {
  userId: number;
  username: string;
  empNo?: string;
  empName?: string;        // employees 조인
  empNameEn?: string;      // employees 조인
  orgCode?: string;        // employees 조인
  orgName?: string;        // organizations 조인 (TODO)
  positionCode?: string;   // employees 조인
  positionName?: string;   // positions 조인 (TODO)
  jobGrade?: string;       // employees 조인
  email?: string;          // employees 조인
  accountStatus: string;   // ACTIVE, LOCKED, SUSPENDED, RESIGNED
  passwordChangeRequired: boolean;
  lastLoginAt?: string;
  failedLoginCount: number;
  isAdmin: boolean;
  isExecutive: boolean;
  authLevel: number;
  isLoginBlocked: boolean;
  timezone?: string;
  language?: string;
  isActive: boolean;
  roles: UserRoleDto[];
  roleCount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 사용자 생성 요청 DTO
 */
export interface CreateUserRequest {
  username: string;
  password: string;
  empNo?: string;
  accountStatus?: string;
  isAdmin?: string;         // 'Y' | 'N'
  isExecutive?: string;     // 'Y' | 'N'
  authLevel?: number;
  isLoginBlocked?: string;  // 'Y' | 'N'
  timezone?: string;
  language?: string;
  isActive?: string;        // 'Y' | 'N'
  roleIds?: number[];
}

/**
 * 사용자 수정 요청 DTO
 */
export interface UpdateUserRequest {
  username?: string;
  newPassword?: string;     // null이면 비밀번호 변경 안함
  empNo?: string;
  accountStatus?: string;
  passwordChangeRequired?: string;  // 'Y' | 'N'
  isAdmin?: string;         // 'Y' | 'N'
  isExecutive?: string;     // 'Y' | 'N'
  authLevel?: number;
  isLoginBlocked?: string;  // 'Y' | 'N'
  timezone?: string;
  language?: string;
  isActive?: string;        // 'Y' | 'N'
  roleIds?: number[];       // null이면 역할 변경 안함
}

/**
 * 사용자 복수 삭제 응답
 */
export interface DeleteUsersResponse {
  successCount: number;
  failCount: number;
  totalRequested: number;
}

// ===============================
// 사용자 CRUD API
// ===============================

/**
 * 모든 사용자 조회
 * - GET /api/system/users
 * - employees 조인으로 이름, 부서, 직책 포함
 *
 * @returns Promise<UserDto[]> 사용자 리스트
 */
export const getAllUsers = async (): Promise<UserDto[]> => {
  try {
    const response = await apiClient.get<UserDto[]>('/system/users');
    return response.data;
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    throw new Error('사용자 목록 조회에 실패했습니다.');
  }
};

/**
 * 사용자 검색
 * - GET /api/system/users/search
 * - 사용자명 또는 직원번호로 검색
 *
 * @param keyword 검색어
 * @returns Promise<UserDto[]> 검색 결과
 */
export const searchUsers = async (keyword: string): Promise<UserDto[]> => {
  try {
    const response = await apiClient.get<UserDto[]>('/system/users/search', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    throw new Error('사용자 검색에 실패했습니다.');
  }
};

/**
 * 사용자 단건 조회
 * - GET /api/system/users/{userId}
 *
 * @param userId 사용자ID
 * @returns Promise<UserDto> 사용자 상세
 */
export const getUser = async (userId: number): Promise<UserDto> => {
  try {
    const response = await apiClient.get<UserDto>(`/system/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    throw new Error('사용자 조회에 실패했습니다.');
  }
};

/**
 * 사용자 생성
 * - POST /api/system/users
 * - 역할 할당 포함
 *
 * @param request 사용자 생성 요청
 * @returns Promise<UserDto> 생성된 사용자
 */
export const createUser = async (request: CreateUserRequest): Promise<UserDto> => {
  try {
    const response = await apiClient.post<UserDto>('/system/users', request);
    return response.data;
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    throw new Error('사용자 생성에 실패했습니다.');
  }
};

/**
 * 사용자 수정
 * - PUT /api/system/users/{userId}
 * - 비밀번호 변경 및 역할 재할당 포함
 *
 * @param userId 사용자ID
 * @param request 사용자 수정 요청
 * @returns Promise<UserDto> 수정된 사용자
 */
export const updateUser = async (userId: number, request: UpdateUserRequest): Promise<UserDto> => {
  try {
    const response = await apiClient.put<UserDto>(`/system/users/${userId}`, request);
    return response.data;
  } catch (error) {
    console.error('사용자 수정 실패:', error);
    throw new Error('사용자 수정에 실패했습니다.');
  }
};

/**
 * 사용자 삭제 (논리적 삭제)
 * - DELETE /api/system/users/{userId}
 *
 * @param userId 사용자ID
 */
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await apiClient.delete(`/system/users/${userId}`);
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    throw new Error('사용자 삭제에 실패했습니다.');
  }
};

/**
 * 사용자 복수 삭제
 * - DELETE /api/system/users
 *
 * @param userIds 사용자ID 리스트
 * @returns Promise<DeleteUsersResponse> 삭제 결과
 */
export const deleteUsers = async (userIds: number[]): Promise<DeleteUsersResponse> => {
  try {
    const response = await apiClient.delete<DeleteUsersResponse>('/system/users', {
      data: userIds
    });
    return response.data;
  } catch (error) {
    console.error('사용자 복수 삭제 실패:', error);
    throw new Error('사용자 복수 삭제에 실패했습니다.');
  }
};

// ===============================
// 역할 관리 API
// ===============================

/**
 * 활성 역할 목록 조회 (드롭다운용)
 * - GET /api/system/users/roles
 * - 사용자 등록/수정 폼의 역할 선택용
 *
 * @returns Promise<UserRoleDto[]> 역할 리스트
 */
export const getActiveRoles = async (): Promise<UserRoleDto[]> => {
  try {
    const response = await apiClient.get<UserRoleDto[]>('/system/users/roles');
    return response.data;
  } catch (error) {
    console.error('역할 목록 조회 실패:', error);
    throw new Error('역할 목록 조회에 실패했습니다.');
  }
};
