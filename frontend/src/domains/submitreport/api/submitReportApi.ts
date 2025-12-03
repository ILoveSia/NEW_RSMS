/**
 * 제출보고서 API 클라이언트
 * - 제출보고서 CRUD API 호출
 * - 정부기관(금융감독원 등)에 제출하는 보고서 관리
 *
 * @author Claude AI
 * @since 2025-12-03
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 제출보고서 응답 DTO
 */
export interface SubmitReportResponse {
  /** 보고서ID */
  reportId: number;
  /** 원장차수ID */
  ledgerOrderId: string;
  /** 제출기관코드 */
  submittingAgencyCd: string;
  /** 제출기관명 */
  submittingAgencyName?: string;
  /** 제출보고서구분코드 */
  reportTypeCd: string;
  /** 제출보고서구분명 */
  reportTypeName?: string;
  /** 제출보고서 제목 */
  subReportTitle: string | null;
  /** 제출 대상 임원 사번 */
  targetExecutiveEmpNo: string | null;
  /** 제출 대상 임원명 */
  targetExecutiveName: string | null;
  /** 임원 직책ID */
  positionId: number | null;
  /** 직책명 */
  positionName: string | null;
  /** 제출일 */
  submissionDate: string;
  /** 비고 */
  remarks: string | null;
  /** 생성자 */
  createdBy: string;
  /** 생성일시 */
  createdAt: string;
  /** 수정자 */
  updatedBy: string;
  /** 수정일시 */
  updatedAt: string;
}

/**
 * 제출보고서 생성/수정 요청 DTO
 */
export interface SubmitReportRequest {
  /** 원장차수ID (필수) */
  ledgerOrderId: string;
  /** 제출기관코드 (필수) */
  submittingAgencyCd: string;
  /** 제출보고서구분코드 (필수) */
  reportTypeCd: string;
  /** 제출보고서 제목 */
  subReportTitle?: string;
  /** 제출 대상 임원 사번 */
  targetExecutiveEmpNo?: string;
  /** 제출 대상 임원명 */
  targetExecutiveName?: string;
  /** 임원 직책ID */
  positionId?: number;
  /** 직책명 */
  positionName?: string;
  /** 제출일 */
  submissionDate?: string;
  /** 비고 */
  remarks?: string;
}

/**
 * 제출보고서 검색 파라미터
 */
export interface SubmitReportSearchParams {
  /** 원장차수ID (선택) */
  ledgerOrderId?: string;
  /** 제출기관코드 (선택) */
  submittingAgencyCd?: string;
  /** 제출보고서구분코드 (선택) */
  reportTypeCd?: string;
  /** 제출일 시작 (선택) */
  submissionDateFrom?: string;
  /** 제출일 종료 (선택) */
  submissionDateTo?: string;
}

/**
 * 삭제 결과 응답
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
  deletedId?: number;
  deletedCount?: number;
  requestedCount?: number;
}

/**
 * 보고서 수 조회 응답
 */
export interface CountResponse {
  ledgerOrderId: string;
  count: number;
}

// ===============================
// API 함수
// ===============================

/**
 * 제출보고서 목록 조회 (검색 조건 포함)
 * GET /api/submit-reports
 *
 * @param params 검색 파라미터
 * @returns 제출보고서 목록
 */
export const getSubmitReports = async (
  params: SubmitReportSearchParams = {}
): Promise<SubmitReportResponse[]> => {
  try {
    // 빈 값 제거
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const response = await apiClient.get<SubmitReportResponse[]>(
      '/submit-reports',
      { params: cleanedParams }
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 목록 조회 실패:', error);
    throw new Error('제출보고서 목록 조회에 실패했습니다.');
  }
};

/**
 * 제출보고서 단건 조회
 * GET /api/submit-reports/{id}
 *
 * @param id 보고서ID
 * @returns 제출보고서 정보
 */
export const getSubmitReport = async (
  id: number
): Promise<SubmitReportResponse> => {
  try {
    const response = await apiClient.get<SubmitReportResponse>(
      `/submit-reports/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 조회 실패:', error);
    throw new Error('제출보고서 조회에 실패했습니다.');
  }
};

/**
 * 원장차수별 제출보고서 목록 조회
 * GET /api/submit-reports/by-ledger/{ledgerOrderId}
 *
 * @param ledgerOrderId 원장차수ID
 * @returns 제출보고서 목록
 */
export const getSubmitReportsByLedgerOrderId = async (
  ledgerOrderId: string
): Promise<SubmitReportResponse[]> => {
  try {
    const response = await apiClient.get<SubmitReportResponse[]>(
      `/submit-reports/by-ledger/${ledgerOrderId}`
    );
    return response.data;
  } catch (error) {
    console.error('원장차수별 제출보고서 조회 실패:', error);
    throw new Error('원장차수별 제출보고서 조회에 실패했습니다.');
  }
};

/**
 * 제출보고서 생성
 * POST /api/submit-reports
 *
 * @param request 생성 요청 DTO
 * @returns 생성된 제출보고서 정보
 */
export const createSubmitReport = async (
  request: SubmitReportRequest
): Promise<SubmitReportResponse> => {
  try {
    const response = await apiClient.post<SubmitReportResponse>(
      '/submit-reports',
      request
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 생성 실패:', error);
    throw new Error('제출보고서 생성에 실패했습니다.');
  }
};

/**
 * 제출보고서 수정
 * PUT /api/submit-reports/{id}
 *
 * @param id 보고서ID
 * @param request 수정 요청 DTO
 * @returns 수정된 제출보고서 정보
 */
export const updateSubmitReport = async (
  id: number,
  request: SubmitReportRequest
): Promise<SubmitReportResponse> => {
  try {
    const response = await apiClient.put<SubmitReportResponse>(
      `/submit-reports/${id}`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 수정 실패:', error);
    throw new Error('제출보고서 수정에 실패했습니다.');
  }
};

/**
 * 제출보고서 삭제 (단건)
 * DELETE /api/submit-reports/{id}
 *
 * @param id 보고서ID
 * @returns 삭제 결과
 */
export const deleteSubmitReport = async (
  id: number
): Promise<DeleteResponse> => {
  try {
    const response = await apiClient.delete<DeleteResponse>(
      `/submit-reports/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 삭제 실패:', error);
    throw new Error('제출보고서 삭제에 실패했습니다.');
  }
};

/**
 * 제출보고서 일괄 삭제
 * DELETE /api/submit-reports/batch
 *
 * @param reportIds 삭제할 보고서 ID 목록
 * @returns 삭제 결과
 */
export const deleteSubmitReports = async (
  reportIds: number[]
): Promise<DeleteResponse> => {
  try {
    const response = await apiClient.delete<DeleteResponse>(
      '/submit-reports/batch',
      { data: reportIds }
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 일괄 삭제 실패:', error);
    throw new Error('제출보고서 일괄 삭제에 실패했습니다.');
  }
};

/**
 * 원장차수별 제출보고서 수 조회
 * GET /api/submit-reports/count
 *
 * @param ledgerOrderId 원장차수ID
 * @returns 제출보고서 수
 */
export const getSubmitReportCount = async (
  ledgerOrderId: string
): Promise<CountResponse> => {
  try {
    const response = await apiClient.get<CountResponse>(
      '/submit-reports/count',
      { params: { ledgerOrderId } }
    );
    return response.data;
  } catch (error) {
    console.error('제출보고서 수 조회 실패:', error);
    throw new Error('제출보고서 수 조회에 실패했습니다.');
  }
};
