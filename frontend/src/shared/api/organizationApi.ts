/**
 * 조직(부점) 관련 API
 * - GET /api/organizations/search - 조직 검색 (본부명 포함)
 */

import apiClient from './apiClient';

/**
 * 조직 검색 API 요청 파라미터
 */
export interface OrganizationSearchParams {
  keyword?: string;  // 검색어 (조직코드 또는 조직명)
}

/**
 * 조직 검색 API 응답 데이터
 */
export interface OrganizationApiResponse {
  orgCode: string;      // 조직코드
  hqCode: string;       // 본부코드
  hqName: string;       // 본부명
  orgName: string;      // 조직명
  orgType: string;      // 조직유형
  isActive: string;     // 사용여부
}

/**
 * 조직 검색
 * - 조직코드 또는 조직명으로 검색
 * - 검색어가 없으면 전체 조회
 *
 * @param params 검색 파라미터
 * @returns 조직 목록
 */
export const searchOrganizations = async (
  params: OrganizationSearchParams
): Promise<OrganizationApiResponse[]> => {
  const response = await apiClient.get<OrganizationApiResponse[]>('/organizations/search', {
    params: {
      keyword: params.keyword || ''
    }
  });
  return response.data;
};

/**
 * 활성 조직 목록 조회
 *
 * @returns 활성 조직 목록
 */
export const getActiveOrganizations = async (): Promise<OrganizationApiResponse[]> => {
  const response = await apiClient.get<OrganizationApiResponse[]>('/organizations/active');
  return response.data;
};

/**
 * 본부코드별 조직 목록 조회
 *
 * @param hqCode 본부코드
 * @returns 조직 목록
 */
export const getOrganizationsByHqCode = async (
  hqCode: string
): Promise<OrganizationApiResponse[]> => {
  const response = await apiClient.get<OrganizationApiResponse[]>(`/organizations/by-hq/${hqCode}`);
  return response.data;
};

/**
 * 관리의무 API 응답 데이터
 */
export interface ManagementObligationApiResponse {
  obligationCd: string;      // 관리의무코드
  obligationInfo: string;    // 관리의무내용
}

/**
 * 조직코드별 관리의무 목록 조회
 *
 * @param orgCode 조직코드
 * @returns 관리의무 목록
 */
export const getManagementObligationsByOrgCode = async (
  orgCode: string
): Promise<ManagementObligationApiResponse[]> => {
  const response = await apiClient.get<ManagementObligationApiResponse[]>(
    `/organizations/${orgCode}/management-obligations`
  );
  return response.data;
};
