/**
 * 책무 API
 * - responsibilities 테이블 CRUD API
 *
 * @author Claude AI
 * @since 2025-09-24
 */

import axios from 'axios';

const API_BASE_URL = '/api/resps/responsibilities';

// ===============================
// 타입 정의
// ===============================

/**
 * 책무 생성 요청 DTO
 */
export interface CreateResponsibilityRequest {
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityCd: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  isActive: string;
}

/**
 * 책무 수정 요청 DTO
 */
export interface UpdateResponsibilityRequest {
  responsibilityInfo: string;
  responsibilityLegal: string;
  isActive: string;
}

/**
 * 책무 응답 DTO
 */
export interface ResponsibilityDto {
  responsibilityId: number;
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityCatName: string;
  responsibilityCd: string;
  responsibilityCdName: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  expirationDate: string;
  responsibilityStatus?: string;
  isActive: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/**
 * 4테이블 조인 책무 목록 응답 DTO
 */
export interface ResponsibilityListDto {
  // positions 테이블
  positionsId: number;
  ledgerOrderId: string;
  positionsCd: string;
  positionsName: string;
  hqCode: string;
  hqName: string;

  // responsibilities 테이블
  responsibilityId: number | null;
  responsibilityCat: string | null;
  responsibilityCatName: string | null;
  responsibilityCd: string | null;
  responsibilityCdName: string | null;
  responsibilityInfo: string | null;
  responsibilityLegal: string | null;
  responsibilityIsActive: string | null;

  // responsibility_details 테이블
  responsibilityDetailId: number | null;
  responsibilityDetailInfo: string | null;
  detailIsActive: string | null;

  // management_obligations 테이블
  managementObligationId: number | null;
  obligationMajorCatCd: string | null;
  obligationMajorCatName: string | null;
  obligationMiddleCatCd: string | null;
  obligationMiddleCatName: string | null;
  obligationCd: string | null;
  obligationInfo: string | null;
  orgCode: string | null;
  orgName: string | null;
  obligationIsActive: string | null;
}

// ===============================
// 책무 CRUD API
// ===============================

/**
 * 4테이블 조인 책무 목록 조회
 * GET /api/resps/responsibilities/list-with-join
 * @param params 검색 파라미터 (선택적)
 * @returns 책무 목록 (직책, 책무, 책무세부, 관리의무 조인)
 */
export const getAllResponsibilitiesWithJoin = async (params?: {
  ledgerOrderId?: string;
  positionsName?: string;
  responsibilityCd?: string;
}): Promise<ResponsibilityListDto[]> => {
  try {
    const response = await axios.get<ResponsibilityListDto[]>(
      `${API_BASE_URL}/list-with-join`,
      {
        params,
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 목록 조회 실패 (4테이블 조인):', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 목록 조회에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 원장차수ID와 직책ID로 책무 목록 조회
 * GET /api/resps/responsibilities?ledgerOrderId={ledgerOrderId}&positionsId={positionsId}
 */
export const getResponsibilities = async (
  ledgerOrderId: string,
  positionsId: number
): Promise<ResponsibilityDto[]> => {
  try {
    const response = await axios.get<ResponsibilityDto[]>(API_BASE_URL, {
      params: { ledgerOrderId, positionsId },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 목록 조회 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 목록 조회에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무 단건 조회
 * GET /api/resps/responsibilities/{responsibilityId}
 */
export const getResponsibility = async (
  responsibilityId: number
): Promise<ResponsibilityDto> => {
  try {
    const response = await axios.get<ResponsibilityDto>(
      `${API_BASE_URL}/${responsibilityId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 단건 조회 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 조회에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무 생성
 * POST /api/resps/responsibilities
 */
export const createResponsibility = async (
  request: CreateResponsibilityRequest
): Promise<ResponsibilityDto> => {
  try {
    const response = await axios.post<ResponsibilityDto>(
      API_BASE_URL,
      request,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 생성 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 생성에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무 수정
 * PUT /api/resps/responsibilities/{responsibilityId}
 */
export const updateResponsibility = async (
  responsibilityId: number,
  request: UpdateResponsibilityRequest
): Promise<ResponsibilityDto> => {
  try {
    const response = await axios.put<ResponsibilityDto>(
      `${API_BASE_URL}/${responsibilityId}`,
      request,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 수정 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 수정에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무 삭제
 * DELETE /api/resps/responsibilities/{responsibilityId}
 */
export const deleteResponsibility = async (
  responsibilityId: number
): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${responsibilityId}`, {
      withCredentials: true
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 삭제 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 삭제에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 원장차수ID와 직책ID로 모든 책무 저장 (기존 삭제 후 신규 저장)
 * POST /api/resps/responsibilities/save-all
 */
export const saveAllResponsibilities = async (
  ledgerOrderId: string,
  positionsId: number,
  requests: CreateResponsibilityRequest[]
): Promise<ResponsibilityDto[]> => {
  try {
    const response = await axios.post<ResponsibilityDto[]>(
      `${API_BASE_URL}/save-all`,
      requests,
      {
        params: { ledgerOrderId, positionsId },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 전체 저장 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 저장에 실패했습니다.');
    }
    throw error;
  }
};
