/**
 * 책무 API
 * - responsibilities 테이블 CRUD API
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author Claude AI
 * @since 2025-09-24
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 책무 생성 요청 DTO
 * - responsibilityCd는 서버에서 자동 생성되므로 제외
 */
export interface CreateResponsibilityRequest {
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  expirationDate?: string;
  responsibilityStatus?: string;
  isActive?: string;  // 기본값: 'Y'
}

/**
 * 책무 수정 요청 DTO
 */
export interface UpdateResponsibilityRequest {
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  expirationDate?: string;
  responsibilityStatus?: string;
  isActive?: string;
}

/**
 * 책무 응답 DTO
 * - PK: responsibilityCd (String, 자동생성)
 */
export interface ResponsibilityDto {
  responsibilityCd: string;          // PK (코드, 자동생성)
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityCatName?: string;
  responsibilityCdName?: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  expirationDate?: string;
  responsibilityStatus?: string;
  isActive: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

/**
 * 2테이블 조인 책무 목록 응답 DTO
 * - responsibilities (마스터), positions
 */
export interface ResponsibilityListDto {
  // responsibilities 테이블
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string | null;
  responsibilityCatName: string | null;
  responsibilityCd: string | null;
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
}

// ===============================
// 책무 CRUD API
// ===============================

/**
 * 2테이블 조인 책무 목록 조회
 * GET /resps/responsibilities/list-with-join
 * @param params 검색 파라미터 (선택적)
 * @returns 책무 목록 (책무(마스터), 직책 조인)
 */
export const getAllResponsibilitiesWithJoin = async (params?: {
  ledgerOrderId?: string;
  responsibilityInfo?: string;
  responsibilityCd?: string;
}): Promise<ResponsibilityListDto[]> => {
  try {
    const response = await apiClient.get<ResponsibilityListDto[]>(
      '/resps/responsibilities/list-with-join',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 목록 조회 실패 (2테이블 조인):', error);
    throw new Error('책무 목록 조회에 실패했습니다.');
  }
};

/**
 * 원장차수ID와 직책ID로 책무 목록 조회
 * GET /resps/responsibilities/responsibilities?ledgerOrderId={ledgerOrderId}&positionsId={positionsId}
 */
export const getResponsibilities = async (
  ledgerOrderId: string,
  positionsId: number
): Promise<ResponsibilityDto[]> => {
  try {
    const response = await apiClient.get<ResponsibilityDto[]>('/resps/responsibilities/responsibilities', {
      params: { ledgerOrderId, positionsId }
    });
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 목록 조회 실패:', error);
    throw new Error('책무 목록 조회에 실패했습니다.');
  }
};

/**
 * 책무 단건 조회
 * GET /resps/responsibilities/{responsibilityCd}
 */
export const getResponsibility = async (
  responsibilityCd: string
): Promise<ResponsibilityDto> => {
  try {
    const response = await apiClient.get<ResponsibilityDto>(
      `/resps/responsibilities/${responsibilityCd}`
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 단건 조회 실패:', error);
    throw new Error('책무 조회에 실패했습니다.');
  }
};

/**
 * 책무 생성 (코드 자동생성)
 * POST /resps/responsibilities
 */
export const createResponsibility = async (
  request: CreateResponsibilityRequest
): Promise<ResponsibilityDto> => {
  try {
    const response = await apiClient.post<ResponsibilityDto>(
      '/resps/responsibilities',
      request
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 생성 실패:', error);
    throw new Error('책무 생성에 실패했습니다.');
  }
};

/**
 * 책무 수정
 * PUT /resps/responsibilities/{responsibilityCd}
 */
export const updateResponsibility = async (
  responsibilityCd: string,
  request: UpdateResponsibilityRequest
): Promise<ResponsibilityDto> => {
  try {
    const response = await apiClient.put<ResponsibilityDto>(
      `/resps/responsibilities/${responsibilityCd}`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 수정 실패:', error);
    throw new Error('책무 수정에 실패했습니다.');
  }
};

/**
 * 책무 삭제
 * DELETE /resps/responsibilities/{responsibilityCd}
 */
export const deleteResponsibility = async (
  responsibilityCd: string
): Promise<void> => {
  try {
    await apiClient.delete(`/resps/responsibilities/${responsibilityCd}`);
  } catch (error) {
    console.error('[responsibilityApi] 책무 삭제 실패:', error);
    throw new Error('책무 삭제에 실패했습니다.');
  }
};

/**
 * 원장차수ID와 직책ID로 모든 책무 저장 (기존 삭제 후 신규 저장)
 * POST /resps/responsibilities/responsibilities/save-all
 */
export const saveAllResponsibilities = async (
  ledgerOrderId: string,
  positionsId: number,
  requests: CreateResponsibilityRequest[]
): Promise<ResponsibilityDto[]> => {
  try {
    const response = await apiClient.post<ResponsibilityDto[]>(
      '/resps/responsibilities/responsibilities/save-all',
      requests,
      {
        params: { ledgerOrderId, positionsId }
      }
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 전체 저장 실패:', error);
    throw new Error('책무 저장에 실패했습니다.');
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
  obligationCd: string;
  obligationInfo: string;
  orgCode: string;
  isActive: string;
}

/**
 * 책무, 책무세부, 관리의무를 한 번에 생성
 * POST /resps/responsibilities/responsibilities/with-details
 */
export const createResponsibilityWithDetails = async (
  request: CreateResponsibilityWithDetailsRequest
): Promise<ResponsibilityDto> => {
  try {
    const response = await apiClient.post<ResponsibilityDto>(
      '/resps/responsibilities/responsibilities/with-details',
      request
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무 전체 생성 실패:', error);
    throw new Error('책무 전체 생성에 실패했습니다.');
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
 * POST /resps/responsibilities/management-obligations
 */
export const createManagementObligation = async (
  request: CreateManagementObligationRequest
): Promise<ManagementObligationDto> => {
  try {
    const response = await apiClient.post<ManagementObligationDto>(
      '/resps/responsibilities/management-obligations',
      request
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 관리의무 생성 실패:', error);
    throw new Error('관리의무 생성에 실패했습니다.');
  }
};

/**
 * 책무세부ID로 관리의무 목록 조회 API
 * GET /resps/responsibilities/management-obligations/detail/{responsibilityDetailId}
 */
export const getManagementObligationsByDetailId = async (
  responsibilityDetailId: number
): Promise<ManagementObligationDto[]> => {
  try {
    const response = await apiClient.get<ManagementObligationDto[]>(
      `/resps/responsibilities/management-obligations/detail/${responsibilityDetailId}`
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 관리의무 목록 조회 실패:', error);
    throw new Error('관리의무 목록 조회에 실패했습니다.');
  }
};

/**
 * 관리의무 삭제 API
 * DELETE /resps/responsibilities/management-obligations/{managementObligationId}
 */
export const deleteManagementObligation = async (
  managementObligationId: number
): Promise<void> => {
  try {
    await apiClient.delete(
      `/resps/responsibilities/management-obligations/${managementObligationId}`
    );
  } catch (error) {
    console.error('[responsibilityApi] 관리의무 삭제 실패:', error);
    throw new Error('관리의무 삭제에 실패했습니다.');
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
 * POST /resps/responsibilities/responsibility-details
 */
export const createResponsibilityDetail = async (
  request: CreateResponsibilityDetailRequest
): Promise<ResponsibilityDetailDto> => {
  try {
    const response = await apiClient.post<ResponsibilityDetailDto>(
      '/resps/responsibilities/responsibility-details',
      request
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무세부 생성 실패:', error);
    throw new Error('책무세부 생성에 실패했습니다.');
  }
};

/**
 * 책무ID로 책무세부 목록 조회 API
 * GET /resps/responsibilities/responsibility-details/responsibility/{responsibilityId}
 */
export const getResponsibilityDetailsByResponsibilityId = async (
  responsibilityId: number
): Promise<ResponsibilityDetailDto[]> => {
  try {
    const response = await apiClient.get<ResponsibilityDetailDto[]>(
      `/resps/responsibilities/responsibility-details/responsibility/${responsibilityId}`
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 책무세부 목록 조회 실패:', error);
    throw new Error('책무세부 목록 조회에 실패했습니다.');
  }
};

/**
 * 책무세부 삭제 API
 * DELETE /resps/responsibilities/responsibility-details/{responsibilityDetailId}
 */
export const deleteResponsibilityDetail = async (
  responsibilityDetailId: number
): Promise<void> => {
  try {
    await apiClient.delete(
      `/resps/responsibilities/responsibility-details/${responsibilityDetailId}`
    );
  } catch (error) {
    console.error('[responsibilityApi] 책무세부 삭제 실패:', error);
    throw new Error('책무세부 삭제에 실패했습니다.');
  }
};

// ===============================
// 엑셀 업로드 API
// ===============================

/**
 * 엑셀 업로드 응답 DTO
 */
export interface ExcelUploadResponse {
  successCount: number;    // 성공 건수
  failCount: number;        // 실패 건수
  totalCount: number;       // 전체 건수
  errors?: string[];        // 에러 메시지 목록
}

/**
 * 책무 엑셀 업로드 API
 * POST /resps/responsibilities/excel/upload
 *
 * 엑셀 양식:
 * - 원장차수 (ledgerOrderId)
 * - 직책코드 (positionsCd)
 * - 책무카테고리코드 (responsibilityCat)
 * - 책무내용 (responsibilityInfo)
 * - 책무관련근거 (responsibilityLegal)
 * - 사용여부 (isActive)
 */
export const uploadResponsibilityExcel = async (
  file: File
): Promise<ExcelUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ExcelUploadResponse>(
      '/resps/responsibilities/excel/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('[responsibilityApi] 엑셀 업로드 실패:', error);
    throw new Error('엑셀 업로드에 실패했습니다.');
  }
};
