/**
 * 직책 API
 * - common_code_details 테이블에서 직책명 데이터를 조회하는 API
 * - group_code = 'RSBT_RSOF_DVCD' 공통코드 조회
 * - positions 테이블 CRUD API
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author Claude AI
 * @since 2025-10-20
 */

import apiClient from '@/shared/api/apiClient';
import type { PositionNameDto } from '../components/molecules/PositionNameComboBox/types';

// ===============================
// 타입 정의
// ===============================

/**
 * 직책 생성 요청 DTO
 */
export interface CreatePositionRequest {
  ledgerOrderId: string;       // 원장차수ID
  positionsCd: string;          // 직책코드
  positionsName: string;        // 직책명
  hqCode: string;               // 본부코드
  hqName: string;               // 본부명
  orgCodes: string[];           // 조직코드 리스트 (positions_details)
  expirationDate?: string;      // 만료일 (선택)
  positionsStatus?: string;     // 상태 (선택)
  isActive?: string;            // 사용여부 (선택)
  isConcurrent?: string;        // 겸직여부 (선택)
}

/**
 * 직책 응답 DTO (positions + positions_details + organizations 조인)
 */
export interface PositionDto {
  positionsId: number;
  ledgerOrderId: string;
  positionsCd: string;
  positionsName: string;
  hqCode: string;
  hqName: string;
  orgCode?: string;             // 부점코드 (단일 값 - 각 행마다)
  orgName?: string;             // 부점명 (단일 값 - 각 행마다)
  orgCodes?: string[];          // positions_details 조인 결과 (조직코드 리스트 - 그룹핑용)
  orgNames?: string[];          // organizations 조인 결과 (조직명/부점명 리스트 - 그룹핑용)
  executiveEmpNo?: string;      // 임원사번
  executiveName?: string;       // 임원성명 (employees 조인)
  expirationDate: string;
  positionsStatus?: string;
  isActive: string;
  isConcurrent: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// ===============================
// 직책명 콤보박스 API
// ===============================

/**
 * 직책명 콤보박스용 데이터 조회
 * - 백엔드 API 호출: GET /api/common-codes?groupCode=RSBT_RSOF_DVCD
 * - 사용 가능한 항목만 필터링 및 정렬
 *
 * @returns Promise<PositionNameDto[]> 직책명 리스트
 */
export const getPositionNamesForComboBox = async (): Promise<PositionNameDto[]> => {
  try {
    const response = await apiClient.get<PositionNameDto[]>(
      '/system/codes/groups/RSBT_RSOF_DVCD/details/active'
    );
    return response.data;
  } catch (error) {
    console.error('직책명 데이터 조회 실패:', error);
    throw new Error('직책명 데이터를 가져오는데 실패했습니다.');
  }
};

// ===============================
// 직책 CRUD API
// ===============================

/**
 * 직책 생성
 * - positions 테이블 + positions_details 테이블 동시 저장
 * - POST /positions
 *
 * @param request 직책 생성 요청
 * @returns Promise<PositionDto> 생성된 직책
 */
export const createPosition = async (request: CreatePositionRequest): Promise<PositionDto> => {
  try {
    const response = await apiClient.post<PositionDto>('/positions', request);
    return response.data;
  } catch (error) {
    console.error('직책 생성 실패:', error);
    throw new Error('직책 생성에 실패했습니다.');
  }
};

/**
 * 모든 직책 조회 (부서 목록 포함)
 * - positions + positions_details 테이블 조인
 * - GET /positions
 *
 * @returns Promise<PositionDto[]> 직책 리스트 (부서 목록 포함)
 */
export const getAllPositions = async (): Promise<PositionDto[]> => {
  try {
    const response = await apiClient.get<PositionDto[]>('/positions');
    return response.data;
  } catch (error) {
    console.error('직책 목록 조회 실패:', error);
    throw new Error('직책 목록 조회에 실패했습니다.');
  }
};

/**
 * 원장차수별 직책 조회
 * - GET /positions/ledger/{ledgerOrderId}
 *
 * @param ledgerOrderId 원장차수ID
 * @returns Promise<PositionDto[]> 직책 리스트
 */
export const getPositionsByLedgerOrderId = async (ledgerOrderId: string): Promise<PositionDto[]> => {
  try {
    const response = await apiClient.get<PositionDto[]>(`/positions/ledger/${ledgerOrderId}`);
    return response.data;
  } catch (error) {
    console.error('원장차수별 직책 조회 실패:', error);
    throw new Error('원장차수별 직책 조회에 실패했습니다.');
  }
};

/**
 * 직책 검색 요청 DTO
 */
export interface PositionSearchRequest {
  keyword?: string;       // 검색 키워드 (직책명)
  hqCode?: string;        // 본부코드
  isActive?: string;      // 사용여부 (Y/N)
  ledgerOrderId?: string; // 원장차수ID
}

/**
 * 직책 검색
 * - GET /positions/search
 * - 키워드, 본부코드, 사용여부, 원장차수로 검색
 *
 * @param searchRequest 검색 조건
 * @returns Promise<PositionDto[]> 검색 결과 리스트
 */
export const searchPositions = async (searchRequest: PositionSearchRequest): Promise<PositionDto[]> => {
  try {
    // 빈 문자열 필터링
    const cleanedParams = Object.fromEntries(
      Object.entries(searchRequest).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    const response = await apiClient.get<PositionDto[]>('/positions/search', {
      params: cleanedParams
    });
    return response.data;
  } catch (error) {
    console.error('직책 검색 실패:', error);
    throw new Error('직책 검색에 실패했습니다.');
  }
};

/**
 * 직책 단건 조회
 */
export const getPosition = async (positionsId: number): Promise<PositionDto> => {
  const response = await apiClient.get<PositionDto>(`/positions/${positionsId}`);
  return response.data;
};

/**
 * 직책 수정
 */
export const updatePosition = async (
  positionsId: number,
  request: Partial<CreatePositionRequest>
): Promise<PositionDto> => {
  const response = await apiClient.put<PositionDto>(`/positions/${positionsId}`, request);
  return response.data;
};

/**
 * 직책 삭제
 */
export const deletePosition = async (positionsId: number): Promise<void> => {
  await apiClient.delete(`/positions/${positionsId}`);
};

/**
 * 직책 복수 삭제
 */
export const deletePositions = async (positionsIds: number[]): Promise<void> => {
  await apiClient.delete('/positions', {
    data: positionsIds,
  });
};

/**
 * 직책별 부점 목록 조회
 * - positions_details + organizations 조인
 * - GET /positions/{positionsId}/departments
 *
 * @param positionsId 직책ID
 * @returns Promise<Array<{org_code: string, org_name: string}>> 부점 목록
 */
export const getPositionDepartments = async (positionsId: number): Promise<Array<{org_code: string; org_name: string}>> => {
  try {
    const response = await apiClient.get(`/positions/${positionsId}/departments`);
    return response.data;
  } catch (error) {
    console.error('부점 목록 조회 실패:', error);
    throw new Error('부점 목록 조회에 실패했습니다.');
  }
};

// ===============================
// 겸직 API
// ===============================

/**
 * 겸직 등록 요청 DTO
 */
export interface CreatePositionConcurrentRequest {
  ledgerOrderId: string;
  positions: Array<{
    positionsCd: string;
    positionsName: string;
    isRepresentative: string;
    hqCode: string;
    hqName: string;
  }>;
}

/**
 * 겸직 응답 DTO
 */
export interface PositionConcurrentDto {
  positionConcurrentId: number;
  ledgerOrderId: string;
  positionsCd: string;
  concurrentGroupCd: string;
  positionsName: string;
  isRepresentative: string;
  hqCode: string;
  hqName: string;
  isActive: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/**
 * 겸직 등록
 * POST /resps/position-concurrents
 */
export const createPositionConcurrents = async (
  request: CreatePositionConcurrentRequest
): Promise<PositionConcurrentDto[]> => {
  try {
    const response = await apiClient.post<PositionConcurrentDto[]>(
      '/resps/position-concurrents',
      request
    );
    return response.data;
  } catch (error) {
    console.error('겸직 등록 실패:', error);
    throw new Error('겸직 등록에 실패했습니다.');
  }
};

/**
 * 원장차수ID로 겸직 목록 조회
 * GET /resps/position-concurrents?ledgerOrderId={ledgerOrderId}
 */
export const getPositionConcurrents = async (
  ledgerOrderId: string
): Promise<PositionConcurrentDto[]> => {
  try {
    const response = await apiClient.get<PositionConcurrentDto[]>(
      '/resps/position-concurrents',
      {
        params: { ledgerOrderId }
      }
    );
    return response.data;
  } catch (error) {
    console.error('겸직 목록 조회 실패:', error);
    throw new Error('겸직 목록 조회에 실패했습니다.');
  }
};

/**
 * 겸직그룹코드로 겸직 목록 조회 (상세조회)
 * GET /resps/position-concurrents/group/{concurrentGroupCd}
 */
export const getPositionConcurrentsByGroup = async (
  concurrentGroupCd: string
): Promise<PositionConcurrentDto[]> => {
  try {
    const response = await apiClient.get<PositionConcurrentDto[]>(
      `/resps/position-concurrents/group/${concurrentGroupCd}`
    );
    return response.data;
  } catch (error) {
    console.error('겸직 그룹 조회 실패:', error);
    throw new Error('겸직 그룹 조회에 실패했습니다.');
  }
};

/**
 * 겸직그룹 삭제
 * DELETE /resps/position-concurrents/group/{concurrentGroupCd}
 */
export const deletePositionConcurrentGroup = async (
  concurrentGroupCd: string
): Promise<void> => {
  try {
    await apiClient.delete(`/resps/position-concurrents/group/${concurrentGroupCd}`);
  } catch (error) {
    console.error('겸직 그룹 삭제 실패:', error);
    throw new Error('겸직 그룹 삭제에 실패했습니다.');
  }
};
