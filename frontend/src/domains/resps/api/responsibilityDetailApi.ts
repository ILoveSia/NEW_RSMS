/**
 * 책무세부 API 함수들
 * - Backend ResponsibilityDetailController와 연동
 * - 책무세부코드는 서버에서 자동 생성됨
 *
 * @author Claude AI
 * @since 2025-11-05
 */

import apiClient from '@/shared/api/apiClient';
import type {
  ResponsibilityDetailDto,
  CreateResponsibilityDetailRequest,
  UpdateResponsibilityDetailRequest
} from '../types/responsibilityDetail.types';

const BASE_URL = '/resps/responsibility-details';

/**
 * 책무코드로 책무세부 목록 조회
 * GET /api/resps/responsibility-details/responsibility/{responsibilityCd}
 *
 * @param responsibilityCd 책무코드
 * @returns 책무세부 DTO 배열
 */
export const getResponsibilityDetailsByResponsibilityCd = async (
  responsibilityCd: string
): Promise<ResponsibilityDetailDto[]> => {
  try {
    const response = await apiClient.get<ResponsibilityDetailDto[]>(
      `${BASE_URL}/responsibility/${responsibilityCd}`
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityDetailApi] 책무세부 목록 조회 실패:', error);
    throw new Error('책무세부 목록 조회에 실패했습니다.');
  }
};

/**
 * 책무세부 생성
 * POST /api/resps/responsibility-details
 * - 책무세부코드는 서버에서 자동 생성됨 (책무코드 suffix + "D" + 순번)
 *
 * @param request 책무세부 생성 요청
 * @returns 생성된 책무세부 DTO
 */
export const createResponsibilityDetail = async (
  request: CreateResponsibilityDetailRequest
): Promise<ResponsibilityDetailDto> => {
  try {
    const response = await apiClient.post<ResponsibilityDetailDto>(
      BASE_URL,
      request
    );
    return response.data;
  } catch (error) {
    console.error('[responsibilityDetailApi] 책무세부 생성 실패:', error);
    throw new Error('책무세부 생성에 실패했습니다.');
  }
};

/**
 * 책무세부 삭제
 * DELETE /api/resps/responsibility-details/{responsibilityDetailCd}
 *
 * @param responsibilityDetailCd 책무세부코드
 */
export const deleteResponsibilityDetail = async (
  responsibilityDetailCd: string
): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${responsibilityDetailCd}`);
  } catch (error) {
    console.error('[responsibilityDetailApi] 책무세부 삭제 실패:', error);
    throw new Error('책무세부 삭제에 실패했습니다.');
  }
};

/**
 * 책무코드로 모든 책무세부 삭제
 * DELETE /api/resps/responsibility-details/responsibility/{responsibilityCd}
 *
 * @param responsibilityCd 책무코드
 */
export const deleteResponsibilityDetailsByResponsibilityCd = async (
  responsibilityCd: string
): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/responsibility/${responsibilityCd}`);
  } catch (error) {
    console.error('[responsibilityDetailApi] 책무의 모든 세부 삭제 실패:', error);
    throw new Error('책무의 모든 세부 삭제에 실패했습니다.');
  }
};
