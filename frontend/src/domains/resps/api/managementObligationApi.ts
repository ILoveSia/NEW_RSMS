/**
 * 관리의무 API 클라이언트
 * - Backend ManagementObligationController와 통신
 *
 * @author Claude AI
 * @since 2025-01-06
 */

import apiClient from '@/shared/api/apiClient';
import type {
  ManagementObligationDto,
  CreateManagementObligationRequest,
  UpdateManagementObligationRequest
} from '../types/managementObligation.types';

const BASE_URL = '/resps/management-obligations';

/**
 * 관리의무 생성
 * POST /api/resps/management-obligations
 */
export const createManagementObligation = async (
  request: CreateManagementObligationRequest
): Promise<ManagementObligationDto> => {
  const response = await apiClient.post<ManagementObligationDto>(BASE_URL, request);
  return response.data;
};

/**
 * 전체 관리의무 목록 조회
 * GET /api/resps/management-obligations
 */
export const getAllManagementObligations = async (): Promise<ManagementObligationDto[]> => {
  const response = await apiClient.get<ManagementObligationDto[]>(BASE_URL);
  return response.data;
};

/**
 * 책무세부코드로 관리의무 목록 조회
 * GET /api/resps/management-obligations/detail/{responsibilityDetailCd}
 */
export const getManagementObligationsByDetailCd = async (
  responsibilityDetailCd: string
): Promise<ManagementObligationDto[]> => {
  const response = await apiClient.get<ManagementObligationDto[]>(
    `${BASE_URL}/detail/${responsibilityDetailCd}`
  );
  return response.data;
};

/**
 * 관리의무 단일 조회
 * GET /api/resps/management-obligations/{obligationCd}
 */
export const getManagementObligation = async (
  obligationCd: string
): Promise<ManagementObligationDto> => {
  const response = await apiClient.get<ManagementObligationDto>(
    `${BASE_URL}/${obligationCd}`
  );
  return response.data;
};

/**
 * 관리의무 수정
 * PUT /api/resps/management-obligations/{obligationCd}
 */
export const updateManagementObligation = async (
  obligationCd: string,
  request: UpdateManagementObligationRequest
): Promise<ManagementObligationDto> => {
  const response = await apiClient.put<ManagementObligationDto>(
    `${BASE_URL}/${obligationCd}`,
    request
  );
  return response.data;
};

/**
 * 관리의무 삭제
 * DELETE /api/resps/management-obligations/{obligationCd}
 */
export const deleteManagementObligation = async (
  obligationCd: string
): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${obligationCd}`);
};

/**
 * 책무세부코드로 모든 관리의무 삭제
 * DELETE /api/resps/management-obligations/detail/{responsibilityDetailCd}
 */
export const deleteManagementObligationsByDetailCd = async (
  responsibilityDetailCd: string
): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/detail/${responsibilityDetailCd}`);
};
