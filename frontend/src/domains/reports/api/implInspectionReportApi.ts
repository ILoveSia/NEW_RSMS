/**
 * 이행점검결과보고서 API 클라이언트
 * - 이행점검결과보고서 CRUD API 호출
 *
 * @author Claude AI
 * @since 2025-12-03
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 이행점검결과보고서 응답 DTO
 */
export interface ImplInspectionReportResponse {
  /** 이행점검결과보고서ID */
  implInspectionReportId: string;
  /** 원장차수ID */
  ledgerOrderId: string;
  /** 이행점검계획ID */
  implInspectionPlanId: string;
  /** 보고서구분코드 */
  reportTypeCd: string;
  /** 보고서구분명 */
  reportTypeName: string;
  /** 검토내용 */
  reviewContent: string | null;
  /** 검토일자 */
  reviewDate: string | null;
  /** 결과 */
  result: string | null;
  /** 개선조치 */
  improvementAction: string | null;
  /** 비고 */
  remarks: string | null;
  /** 사용여부 */
  isActive: string;
  /** 등록일시 */
  createdAt: string;
  /** 등록자 */
  createdBy: string;
  /** 수정일시 */
  updatedAt: string;
  /** 수정자 */
  updatedBy: string;
  /** 이행점검명 (조인 데이터) */
  implInspectionName?: string;
  /** 점검기간 (조인 데이터) */
  inspectionPeriod?: string;
}

/**
 * 이행점검결과보고서 생성 요청 DTO
 */
export interface CreateReportRequest {
  /** 원장차수ID (필수) */
  ledgerOrderId: string;
  /** 이행점검계획ID (필수) */
  implInspectionPlanId: string;
  /** 보고서구분코드 (필수: 01-CEO, 02-임원) */
  reportTypeCd: string;
  /** 검토내용 */
  reviewContent?: string;
  /** 검토일자 */
  reviewDate?: string;
  /** 결과 */
  result?: string;
  /** 개선조치 */
  improvementAction?: string;
  /** 비고 */
  remarks?: string;
}

/**
 * 이행점검결과보고서 수정 요청 DTO
 */
export interface UpdateReportRequest {
  /** 보고서구분코드 */
  reportTypeCd?: string;
  /** 검토내용 */
  reviewContent?: string;
  /** 검토일자 */
  reviewDate?: string;
  /** 결과 */
  result?: string;
  /** 개선조치 */
  improvementAction?: string;
  /** 비고 */
  remarks?: string;
}

/**
 * 보고서 목록 조회 파라미터
 */
export interface GetReportsParams {
  /** 원장차수ID (선택 - 없으면 전체 조회) */
  ledgerOrderId?: string;
  /** 이행점검계획ID (선택) */
  implInspectionPlanId?: string;
  /** 부서코드 (선택) */
  orgCode?: string;
}

/**
 * 삭제 결과 응답
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
  deletedId?: string;
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

/**
 * 보고서 존재 여부 확인 응답
 */
export interface ExistsResponse {
  implInspectionPlanId: string;
  reportTypeCd: string;
  exists: boolean;
}

// ===============================
// API 함수
// ===============================

/**
 * 보고서 목록 조회
 * GET /api/impl-inspection-reports
 *
 * @param params 조회 파라미터
 * @returns 보고서 목록
 */
export const getImplInspectionReports = async (
  params: GetReportsParams
): Promise<ImplInspectionReportResponse[]> => {
  try {
    // 빈 값 제거
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const response = await apiClient.get<ImplInspectionReportResponse[]>(
      '/impl-inspection-reports',
      { params: cleanedParams }
    );
    return response.data;
  } catch (error) {
    console.error('보고서 목록 조회 실패:', error);
    throw new Error('보고서 목록 조회에 실패했습니다.');
  }
};

/**
 * 보고서 단건 조회
 * GET /api/impl-inspection-reports/{id}
 *
 * @param id 이행점검결과보고서ID
 * @returns 보고서 정보
 */
export const getImplInspectionReport = async (
  id: string
): Promise<ImplInspectionReportResponse> => {
  try {
    const response = await apiClient.get<ImplInspectionReportResponse>(
      `/impl-inspection-reports/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('보고서 조회 실패:', error);
    throw new Error('보고서 조회에 실패했습니다.');
  }
};

/**
 * 보고서구분별 목록 조회
 * GET /api/impl-inspection-reports/by-type/{reportTypeCd}
 *
 * @param reportTypeCd 보고서구분코드 (01: CEO, 02: 임원)
 * @returns 보고서 목록
 */
export const getImplInspectionReportsByType = async (
  reportTypeCd: string
): Promise<ImplInspectionReportResponse[]> => {
  try {
    const response = await apiClient.get<ImplInspectionReportResponse[]>(
      `/impl-inspection-reports/by-type/${reportTypeCd}`
    );
    return response.data;
  } catch (error) {
    console.error('보고서구분별 조회 실패:', error);
    throw new Error('보고서구분별 조회에 실패했습니다.');
  }
};

/**
 * 보고서 생성
 * POST /api/impl-inspection-reports
 *
 * @param request 생성 요청 DTO
 * @returns 생성된 보고서 정보
 */
export const createImplInspectionReport = async (
  request: CreateReportRequest
): Promise<ImplInspectionReportResponse> => {
  try {
    const response = await apiClient.post<ImplInspectionReportResponse>(
      '/impl-inspection-reports',
      request
    );
    return response.data;
  } catch (error) {
    console.error('보고서 생성 실패:', error);
    throw new Error('보고서 생성에 실패했습니다.');
  }
};

/**
 * 보고서 수정
 * PUT /api/impl-inspection-reports/{id}
 *
 * @param id 이행점검결과보고서ID
 * @param request 수정 요청 DTO
 * @returns 수정된 보고서 정보
 */
export const updateImplInspectionReport = async (
  id: string,
  request: UpdateReportRequest
): Promise<ImplInspectionReportResponse> => {
  try {
    const response = await apiClient.put<ImplInspectionReportResponse>(
      `/impl-inspection-reports/${id}`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('보고서 수정 실패:', error);
    throw new Error('보고서 수정에 실패했습니다.');
  }
};

/**
 * 보고서 삭제 (단건)
 * DELETE /api/impl-inspection-reports/{id}
 *
 * @param id 이행점검결과보고서ID
 * @returns 삭제 결과
 */
export const deleteImplInspectionReport = async (
  id: string
): Promise<DeleteResponse> => {
  try {
    const response = await apiClient.delete<DeleteResponse>(
      `/impl-inspection-reports/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('보고서 삭제 실패:', error);
    throw new Error('보고서 삭제에 실패했습니다.');
  }
};

/**
 * 보고서 일괄 삭제
 * DELETE /api/impl-inspection-reports/batch
 *
 * @param reportIds 삭제할 보고서 ID 목록
 * @returns 삭제 결과
 */
export const deleteImplInspectionReports = async (
  reportIds: string[]
): Promise<DeleteResponse> => {
  try {
    const response = await apiClient.delete<DeleteResponse>(
      '/impl-inspection-reports/batch',
      { data: reportIds }
    );
    return response.data;
  } catch (error) {
    console.error('보고서 일괄 삭제 실패:', error);
    throw new Error('보고서 일괄 삭제에 실패했습니다.');
  }
};

/**
 * 원장차수별 보고서 수 조회
 * GET /api/impl-inspection-reports/count
 *
 * @param ledgerOrderId 원장차수ID
 * @returns 보고서 수
 */
export const getImplInspectionReportCount = async (
  ledgerOrderId: string
): Promise<CountResponse> => {
  try {
    const response = await apiClient.get<CountResponse>(
      '/impl-inspection-reports/count',
      { params: { ledgerOrderId } }
    );
    return response.data;
  } catch (error) {
    console.error('보고서 수 조회 실패:', error);
    throw new Error('보고서 수 조회에 실패했습니다.');
  }
};

/**
 * 보고서 존재 여부 확인
 * GET /api/impl-inspection-reports/exists
 *
 * @param implInspectionPlanId 이행점검계획ID
 * @param reportTypeCd 보고서구분코드
 * @returns 존재 여부
 */
export const checkImplInspectionReportExists = async (
  implInspectionPlanId: string,
  reportTypeCd: string
): Promise<ExistsResponse> => {
  try {
    const response = await apiClient.get<ExistsResponse>(
      '/impl-inspection-reports/exists',
      { params: { implInspectionPlanId, reportTypeCd } }
    );
    return response.data;
  } catch (error) {
    console.error('보고서 존재 여부 확인 실패:', error);
    throw new Error('보고서 존재 여부 확인에 실패했습니다.');
  }
};
