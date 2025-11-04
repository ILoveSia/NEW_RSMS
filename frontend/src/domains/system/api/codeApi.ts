/**
 * 공통코드 API 클라이언트
 * - 공통코드 그룹 및 상세 조회
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import apiClient from '@/shared/api/apiClient';

// =====================
// 타입 정의
// =====================

/**
 * 공통코드 상세
 */
export interface CommonCodeDetail {
  detailCode: string;
  detailName: string;
  detailNameEn?: string;
  detailValue?: string;
  parentDetailCode?: string;
  levelDepth: number;
  sortOrder: number;
  description?: string;
  isActive: string;
}

/**
 * 공통코드 그룹
 */
export interface CommonCodeGroup {
  groupCode: string;
  groupName: string;
  groupNameEn?: string;
  category: string;
  categoryCode: string;
  systemCode: boolean;
  editable: boolean;
  sortOrder: number;
  description?: string;
  isActive: string;
  details?: CommonCodeDetail[];
}

/**
 * 공통코드 그룹 목록 응답
 */
export interface CommonCodeGroupsResponse {
  success: boolean;
  message?: string;
  data?: CommonCodeGroup[];
}

// =====================
// API 함수들
// =====================

/**
 * 모든 활성화된 코드 그룹 및 상세 조회
 * GET /api/system/codes/groups/active/with-details
 */
export const getAllActiveCodeGroupsApi = async (): Promise<CommonCodeGroup[]> => {
  const response = await apiClient.get<CommonCodeGroup[]>(
    '/system/codes/groups/active/with-details'
  );
  return response.data;
};

/**
 * 특정 코드 그룹 및 상세 조회
 * GET /api/system/codes/groups/{groupCode}/with-details
 */
export const getCodeGroupWithDetailsApi = async (
  groupCode: string
): Promise<CommonCodeGroup> => {
  const response = await apiClient.get<CommonCodeGroup>(
    `/system/codes/groups/${groupCode}/with-details`
  );
  return response.data;
};

/**
 * 카테고리별 코드 그룹 조회
 * GET /api/system/codes/groups/category/{category}
 */
export const getCodeGroupsByCategoryApi = async (
  category: string
): Promise<CommonCodeGroup[]> => {
  const response = await apiClient.get<CommonCodeGroup[]>(
    `/system/codes/groups/category/${category}`
  );
  return response.data;
};

export default apiClient;
