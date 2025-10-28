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
 * - responsibilities (마스터), positions, responsibility_details, management_obligations
 */
export interface ResponsibilityListDto {
  // responsibilities 테이블
  responsibilityId: number;
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string | null;
  responsibilityCatName: string | null;
  responsibilityCd: string | null;
  responsibilityCdName: string | null;
  responsibilityInfo: string | null;
  responsibilityLegal: string | null;
  expirationDate: string | null;
  responsibilityStatus: string | null;
  responsibilityIsActive: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;

  // positions 테이블
  positionsCd: string | null;
  positionsName: string | null;
  hqCode: string | null;
  hqName: string | null;

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
  obligationIsActive: string | null;
}

// ===============================
// 책무 CRUD API
// ===============================

/**
 * 4테이블 조인 책무 목록 조회
 * GET /api/resps/responsibilities/list-with-join
 * @param params 검색 파라미터 (선택적)
 * @returns 책무 목록 (책무(마스터), 직책, 책무세부, 관리의무 조인)
 */
export const getAllResponsibilitiesWithJoin = async (params?: {
  ledgerOrderId?: string;
  responsibilityInfo?: string;
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

/**
 * 책무 전체 생성 요청 DTO (책무, 책무세부, 관리의무 포함)
 */
export interface CreateResponsibilityWithDetailsRequest {
  // responsibilities 테이블
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityCd: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  isActive: string;

  // responsibility_details 테이블 리스트
  details: ResponsibilityDetailDto[];
}

/**
 * 책무 세부내용 DTO
 */
export interface ResponsibilityDetailDto {
  responsibilityDetailInfo: string;
  isActive: string;
  obligations: ManagementObligationDto[];
}

/**
 * 관리의무 DTO
 */
export interface ManagementObligationDto {
  obligationMajorCatCd: string;
  obligationMiddleCatCd: string;
  obligationCd: string;
  obligationInfo: string;
  orgCode: string;
  isActive: string;
}

/**
 * 책무, 책무세부, 관리의무를 한 번에 생성
 * POST /api/resps/responsibilities/with-details
 */
export const createResponsibilityWithDetails = async (
  request: CreateResponsibilityWithDetailsRequest
): Promise<ResponsibilityDto> => {
  try {
    const response = await axios.post<ResponsibilityDto>(
      `${API_BASE_URL}/with-details`,
      request,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무 전체 생성 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무 전체 생성에 실패했습니다.');
    }
    throw error;
  }
};

// =====================================================================================
// 관리의무 API
// =====================================================================================

/**
 * 관리의무 생성 요청 DTO
 */
export interface CreateManagementObligationRequest {
  responsibilityDetailId: number;
  obligationMajorCatCd: string;
  obligationMiddleCatCd: string;
  obligationCd: string;
  obligationInfo: string;
  orgCode: string;
  isActive: string;
}

/**
 * 관리의무 응답 DTO
 */
export interface ManagementObligationDto {
  managementObligationId: number;
  responsibilityDetailId: number;
  obligationMajorCatCd: string;
  obligationMajorCatName?: string;
  obligationMiddleCatCd: string;
  obligationMiddleCatName?: string;
  obligationCd: string;
  obligationInfo: string;
  orgCode: string;
  orgName?: string;
  isActive: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * 관리의무 생성 API
 * POST /api/resps/management-obligations
 */
export const createManagementObligation = async (
  request: CreateManagementObligationRequest
): Promise<ManagementObligationDto> => {
  try {
    const response = await axios.post<ManagementObligationDto>(
      `${API_BASE_URL.replace('/responsibilities', '')}/management-obligations`,
      request,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 관리의무 생성 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '관리의무 생성에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무세부ID로 관리의무 목록 조회 API
 * GET /api/resps/management-obligations/detail/{responsibilityDetailId}
 */
export const getManagementObligationsByDetailId = async (
  responsibilityDetailId: number
): Promise<ManagementObligationDto[]> => {
  try {
    const response = await axios.get<ManagementObligationDto[]>(
      `${API_BASE_URL.replace('/responsibilities', '')}/management-obligations/detail/${responsibilityDetailId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 관리의무 목록 조회 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '관리의무 목록 조회에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 관리의무 삭제 API
 * DELETE /api/resps/management-obligations/{managementObligationId}
 */
export const deleteManagementObligation = async (
  managementObligationId: number
): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL.replace('/responsibilities', '')}/management-obligations/${managementObligationId}`,
      { withCredentials: true }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 관리의무 삭제 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '관리의무 삭제에 실패했습니다.');
    }
    throw error;
  }
};

// =====================================================================================
// 책무세부 API
// =====================================================================================

/**
 * 책무세부 생성 요청 DTO
 */
export interface CreateResponsibilityDetailRequest {
  responsibilityId: number;
  responsibilityDetailInfo: string;
  isActive: string;
}

/**
 * 책무세부 응답 DTO
 */
export interface ResponsibilityDetailDto {
  responsibilityDetailId: number;
  responsibilityId: number;
  responsibilityDetailInfo: string;
  isActive: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * 책무세부 생성 API
 * POST /api/resps/responsibility-details
 */
export const createResponsibilityDetail = async (
  request: CreateResponsibilityDetailRequest
): Promise<ResponsibilityDetailDto> => {
  try {
    const response = await axios.post<ResponsibilityDetailDto>(
      `${API_BASE_URL.replace('/responsibilities', '')}/responsibility-details`,
      request,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무세부 생성 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무세부 생성에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무ID로 책무세부 목록 조회 API
 * GET /api/resps/responsibility-details/responsibility/{responsibilityId}
 */
export const getResponsibilityDetailsByResponsibilityId = async (
  responsibilityId: number
): Promise<ResponsibilityDetailDto[]> => {
  try {
    const response = await axios.get<ResponsibilityDetailDto[]>(
      `${API_BASE_URL.replace('/responsibilities', '')}/responsibility-details/responsibility/${responsibilityId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무세부 목록 조회 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무세부 목록 조회에 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 책무세부 삭제 API
 * DELETE /api/resps/responsibility-details/{responsibilityDetailId}
 */
export const deleteResponsibilityDetail = async (
  responsibilityDetailId: number
): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL.replace('/responsibilities', '')}/responsibility-details/${responsibilityDetailId}`,
      { withCredentials: true }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[responsibilityApi] 책무세부 삭제 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '책무세부 삭제에 실패했습니다.');
    }
    throw error;
  }
};
