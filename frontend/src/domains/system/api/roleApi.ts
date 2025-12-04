/**
 * 역활 관리 API
 * - roles, permissions, role_permissions 테이블 CRUD API
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author Claude AI
 * @since 2025-12-04
 */

import apiClient from '@/shared/api/apiClient';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleSearchFilter,
  YNFlag
} from '../types/role.types';

// ===============================
// 역활 응답 DTO
// ===============================

/**
 * 역활 응답 DTO (roles 테이블 기반)
 */
export interface RoleDto {
  roleId: number;
  roleCode: string;
  roleName: string;
  description?: string;
  roleType: string;
  roleCategory?: string;
  parentRoleId?: number;
  sortOrder: number;
  status: string;
  isSystemRole: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  detailRoleCount?: number; // role_permissions 조인 결과
}

/**
 * 권한 응답 DTO (permissions 테이블 기반)
 */
export interface PermissionDto {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  description?: string;
  menuId: number;
  sortOrder: number;
  businessPermission: YNFlag;
  mainBusinessPermission: YNFlag;
  executionPermission: YNFlag;
  canView: YNFlag;
  canCreate: YNFlag;
  canUpdate: YNFlag;
  canDelete: YNFlag;
  canSelect: YNFlag;
  extendedPermissionType?: string;
  extendedPermissionName?: string;
  isActive: YNFlag;
  createdAt?: string;
  updatedAt?: string;
}

// ===============================
// 역활 CRUD API
// ===============================

/**
 * 모든 역활 조회
 * - GET /api/system/roles
 * - 상세역활수(detailRoleCount) 포함
 *
 * @returns Promise<RoleDto[]> 역활 리스트
 */
export const getAllRoles = async (): Promise<RoleDto[]> => {
  try {
    const response = await apiClient.get<RoleDto[]>('/system/roles');
    return response.data;
  } catch (error) {
    console.error('역활 목록 조회 실패:', error);
    throw new Error('역활 목록 조회에 실패했습니다.');
  }
};

/**
 * 역활 검색
 * - GET /api/system/roles/search
 *
 * @param searchFilter 검색 조건
 * @returns Promise<RoleDto[]> 검색 결과
 */
export const searchRoles = async (searchFilter: RoleSearchFilter): Promise<RoleDto[]> => {
  try {
    // 빈 값 필터링
    const cleanedParams = Object.fromEntries(
      Object.entries(searchFilter).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    const response = await apiClient.get<RoleDto[]>('/system/roles/search', {
      params: cleanedParams
    });
    return response.data;
  } catch (error) {
    console.error('역활 검색 실패:', error);
    throw new Error('역활 검색에 실패했습니다.');
  }
};

/**
 * 역활 단건 조회
 * - GET /api/system/roles/{roleId}
 *
 * @param roleId 역활ID
 * @returns Promise<RoleDto> 역활 상세
 */
export const getRole = async (roleId: number): Promise<RoleDto> => {
  try {
    const response = await apiClient.get<RoleDto>(`/system/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('역활 조회 실패:', error);
    throw new Error('역활 조회에 실패했습니다.');
  }
};

/**
 * 역활 생성
 * - POST /api/system/roles
 *
 * @param request 역활 생성 요청
 * @returns Promise<RoleDto> 생성된 역활
 */
export const createRole = async (request: CreateRoleRequest): Promise<RoleDto> => {
  try {
    const response = await apiClient.post<RoleDto>('/system/roles', request);
    return response.data;
  } catch (error) {
    console.error('역활 생성 실패:', error);
    throw new Error('역활 생성에 실패했습니다.');
  }
};

/**
 * 역활 수정
 * - PUT /api/system/roles/{roleId}
 *
 * @param roleId 역활ID
 * @param request 역활 수정 요청
 * @returns Promise<RoleDto> 수정된 역활
 */
export const updateRole = async (roleId: number, request: UpdateRoleRequest): Promise<RoleDto> => {
  try {
    const response = await apiClient.put<RoleDto>(`/system/roles/${roleId}`, request);
    return response.data;
  } catch (error) {
    console.error('역활 수정 실패:', error);
    throw new Error('역활 수정에 실패했습니다.');
  }
};

/**
 * 역활 삭제
 * - DELETE /api/system/roles/{roleId}
 *
 * @param roleId 역활ID
 */
export const deleteRole = async (roleId: number): Promise<void> => {
  try {
    await apiClient.delete(`/system/roles/${roleId}`);
  } catch (error) {
    console.error('역활 삭제 실패:', error);
    throw new Error('역활 삭제에 실패했습니다.');
  }
};

/**
 * 역활 복수 삭제
 * - DELETE /api/system/roles
 *
 * @param roleIds 역활ID 리스트
 */
export const deleteRoles = async (roleIds: number[]): Promise<void> => {
  try {
    await apiClient.delete('/system/roles', {
      data: roleIds
    });
  } catch (error) {
    console.error('역활 복수 삭제 실패:', error);
    throw new Error('역활 복수 삭제에 실패했습니다.');
  }
};

// ===============================
// 권한 API
// ===============================

/**
 * 모든 권한 조회
 * - GET /api/system/permissions
 *
 * @returns Promise<PermissionDto[]> 권한 리스트
 */
export const getAllPermissions = async (): Promise<PermissionDto[]> => {
  try {
    const response = await apiClient.get<PermissionDto[]>('/system/permissions');
    return response.data;
  } catch (error) {
    console.error('권한 목록 조회 실패:', error);
    throw new Error('권한 목록 조회에 실패했습니다.');
  }
};

/**
 * 역활별 권한 조회
 * - GET /api/system/roles/{roleId}/permissions
 * - role_permissions 조인으로 해당 역활의 권한 목록 조회
 *
 * @param roleId 역활ID
 * @returns Promise<PermissionDto[]> 권한 리스트
 */
export const getPermissionsByRoleId = async (roleId: number): Promise<PermissionDto[]> => {
  try {
    const response = await apiClient.get<PermissionDto[]>(`/system/roles/${roleId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('역활별 권한 조회 실패:', error);
    throw new Error('역활별 권한 조회에 실패했습니다.');
  }
};

/**
 * 역활에 권한 할당
 * - POST /api/system/roles/{roleId}/permissions
 *
 * @param roleId 역활ID
 * @param permissionIds 권한ID 리스트
 */
export const assignPermissionsToRole = async (roleId: number, permissionIds: number[]): Promise<void> => {
  try {
    await apiClient.post(`/system/roles/${roleId}/permissions`, {
      permissionIds
    });
  } catch (error) {
    console.error('권한 할당 실패:', error);
    throw new Error('권한 할당에 실패했습니다.');
  }
};

/**
 * 역활에서 권한 해제
 * - DELETE /api/system/roles/{roleId}/permissions
 *
 * @param roleId 역활ID
 * @param permissionIds 권한ID 리스트
 */
export const removePermissionsFromRole = async (roleId: number, permissionIds: number[]): Promise<void> => {
  try {
    await apiClient.delete(`/system/roles/${roleId}/permissions`, {
      data: { permissionIds }
    });
  } catch (error) {
    console.error('권한 해제 실패:', error);
    throw new Error('권한 해제에 실패했습니다.');
  }
};

/**
 * 역활의 권한 전체 갱신
 * - PUT /api/system/roles/{roleId}/permissions
 * - 기존 권한을 모두 삭제하고 새로운 권한으로 대체
 *
 * @param roleId 역활ID
 * @param permissionIds 권한ID 리스트
 */
export const updateRolePermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
  try {
    await apiClient.put(`/system/roles/${roleId}/permissions`, {
      permissionIds
    });
  } catch (error) {
    console.error('권한 갱신 실패:', error);
    throw new Error('권한 갱신에 실패했습니다.');
  }
};

// ===============================
// 권한 CRUD API
// ===============================

/**
 * 권한 생성
 * - POST /api/system/permissions
 *
 * @param request 권한 생성 요청
 * @returns Promise<PermissionDto> 생성된 권한
 */
export const createPermission = async (request: Partial<PermissionDto>): Promise<PermissionDto> => {
  try {
    const response = await apiClient.post<PermissionDto>('/system/permissions', request);
    return response.data;
  } catch (error) {
    console.error('권한 생성 실패:', error);
    throw new Error('권한 생성에 실패했습니다.');
  }
};

/**
 * 권한 수정
 * - PUT /api/system/permissions/{permissionId}
 *
 * @param permissionId 권한ID
 * @param request 권한 수정 요청
 * @returns Promise<PermissionDto> 수정된 권한
 */
export const updatePermission = async (permissionId: number, request: Partial<PermissionDto>): Promise<PermissionDto> => {
  try {
    const response = await apiClient.put<PermissionDto>(`/system/permissions/${permissionId}`, request);
    return response.data;
  } catch (error) {
    console.error('권한 수정 실패:', error);
    throw new Error('권한 수정에 실패했습니다.');
  }
};

/**
 * 권한 삭제
 * - DELETE /api/system/permissions/{permissionId}
 *
 * @param permissionId 권한ID
 */
export const deletePermission = async (permissionId: number): Promise<void> => {
  try {
    await apiClient.delete(`/system/permissions/${permissionId}`);
  } catch (error) {
    console.error('권한 삭제 실패:', error);
    throw new Error('권한 삭제에 실패했습니다.');
  }
};

/**
 * 권한 복수 삭제
 * - DELETE /api/system/permissions
 *
 * @param permissionIds 권한ID 리스트
 */
export const deletePermissions = async (permissionIds: number[]): Promise<void> => {
  try {
    await apiClient.delete('/system/permissions', {
      data: permissionIds
    });
  } catch (error) {
    console.error('권한 복수 삭제 실패:', error);
    throw new Error('권한 복수 삭제에 실패했습니다.');
  }
};
