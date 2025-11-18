/**
 * 부서장업무메뉴얼 API 클라이언트
 * - Backend DeptManagerManualController와 통신
 *
 * @author Claude AI
 * @since 2025-01-18
 */

import apiClient from '@/shared/api/apiClient';
import type {
  DeptManagerManualDto,
  CreateDeptManagerManualRequest,
  UpdateDeptManagerManualRequest
} from '../types/deptManagerManual.types';

const BASE_URL = '/resps/dept-manager-manuals';

/**
 * 메뉴얼 생성
 * POST /api/resps/dept-manager-manuals
 */
export const createDeptManagerManual = async (
  request: CreateDeptManagerManualRequest
): Promise<DeptManagerManualDto> => {
  const response = await apiClient.post<DeptManagerManualDto>(BASE_URL, request);
  return response.data;
};

/**
 * 전체 메뉴얼 목록 조회
 * GET /api/resps/dept-manager-manuals
 */
export const getAllDeptManagerManuals = async (): Promise<DeptManagerManualDto[]> => {
  const response = await apiClient.get<DeptManagerManualDto[]>(BASE_URL);
  return response.data;
};

/**
 * 원장차수ID로 메뉴얼 목록 조회
 * GET /api/resps/dept-manager-manuals/ledger-order/{ledgerOrderId}
 */
export const getDeptManagerManualsByLedgerOrderId = async (
  ledgerOrderId: string
): Promise<DeptManagerManualDto[]> => {
  const response = await apiClient.get<DeptManagerManualDto[]>(
    `${BASE_URL}/ledger-order/${ledgerOrderId}`
  );
  return response.data;
};

/**
 * 조직코드로 메뉴얼 목록 조회
 * GET /api/resps/dept-manager-manuals/organization/{orgCode}
 */
export const getDeptManagerManualsByOrgCode = async (
  orgCode: string
): Promise<DeptManagerManualDto[]> => {
  const response = await apiClient.get<DeptManagerManualDto[]>(
    `${BASE_URL}/organization/${orgCode}`
  );
  return response.data;
};

/**
 * 원장차수ID와 조직코드로 메뉴얼 목록 조회 (가장 자주 사용됨)
 * GET /api/resps/dept-manager-manuals/ledger-order/{ledgerOrderId}/organization/{orgCode}
 * - 관계 테이블 정보 포함 (responsibilities, responsibility_details, management_obligations, organizations)
 */
export const getDeptManagerManualsByLedgerOrderIdAndOrgCode = async (
  ledgerOrderId: string,
  orgCode: string
): Promise<DeptManagerManualDto[]> => {
  const response = await apiClient.get<DeptManagerManualDto[]>(
    `${BASE_URL}/ledger-order/${ledgerOrderId}/organization/${orgCode}`
  );
  return response.data;
};

/**
 * 메뉴얼 단일 조회
 * GET /api/resps/dept-manager-manuals/{manualCd}
 */
export const getDeptManagerManual = async (
  manualCd: string
): Promise<DeptManagerManualDto> => {
  const response = await apiClient.get<DeptManagerManualDto>(
    `${BASE_URL}/${manualCd}`
  );
  return response.data;
};

/**
 * 메뉴얼 수정
 * PUT /api/resps/dept-manager-manuals/{manualCd}
 */
export const updateDeptManagerManual = async (
  manualCd: string,
  request: UpdateDeptManagerManualRequest
): Promise<DeptManagerManualDto> => {
  const response = await apiClient.put<DeptManagerManualDto>(
    `${BASE_URL}/${manualCd}`,
    request
  );
  return response.data;
};

/**
 * 메뉴얼 삭제
 * DELETE /api/resps/dept-manager-manuals/{manualCd}
 */
export const deleteDeptManagerManual = async (
  manualCd: string
): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${manualCd}`);
};

/**
 * 메뉴얼 일괄 삭제
 * POST /api/resps/dept-manager-manuals/delete-batch
 */
export const deleteDeptManagerManuals = async (
  manualCds: string[]
): Promise<void> => {
  await apiClient.post(`${BASE_URL}/delete-batch`, manualCds);
};
