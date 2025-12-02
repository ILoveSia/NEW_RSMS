/**
 * 결재선 관리 API
 * - 결재선 CRUD API
 * - 결재선 단계 관리
 * - 공통 apiClient 사용 (401 에러 시 자동 로그아웃)
 *
 * @author Claude AI
 * @since 2025-12-02
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 결재선 단계 응답 DTO
 */
export interface ApprovalLineStepDto {
  approvalLineStepId: number;
  approvalLineId: string;
  stepOrder: number;
  stepName: string;
  approvalTypeCd: string;
  approvalTypeName?: string;
  approverTypeCd: string;
  approverTypeName?: string;
  approverId?: string;
  approverName?: string;
  isRequired: string;
  remarks?: string;
  createdBy?: string;
  createdAt?: string;
}

/**
 * 결재선 응답 DTO
 */
export interface ApprovalLineDto {
  approvalLineId: string;
  approvalLineName: string;
  workTypeCd: string;
  workTypeName?: string;
  popupTitle: string;
  sequence: number;
  isUsed: string;
  isEditable: string;
  remarks?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  steps?: ApprovalLineStepDto[];
}

/**
 * 결재선 단계 생성 요청 DTO
 */
export interface CreateApprovalLineStepRequest {
  stepOrder: number;
  stepName: string;
  approvalTypeCd: string;
  approverTypeCd: string;
  approverId?: string;
  approverName?: string;
  isRequired: string;
  remarks?: string;
}

/**
 * 결재선 생성 요청 DTO
 */
export interface CreateApprovalLineRequest {
  approvalLineName: string;
  workTypeCd: string;
  popupTitle?: string;
  isEditable?: string;
  remarks?: string;
  steps?: CreateApprovalLineStepRequest[];
}

/**
 * 결재선 수정 요청 DTO
 */
export interface UpdateApprovalLineRequest {
  approvalLineName?: string;
  popupTitle?: string;
  isEditable?: string;
  remarks?: string;
  steps?: CreateApprovalLineStepRequest[];
}

/**
 * 결재선 검색 요청 DTO
 */
export interface ApprovalLineSearchRequest {
  workTypeCd?: string;
  isUsed?: string;
  keyword?: string;
}

/**
 * 결재선 통계 DTO
 */
export interface ApprovalLineStatistics {
  total: number;
  used: number;
  unused: number;
}

// ===============================
// 결재선 CRUD API
// ===============================

/**
 * 전체 결재선 목록 조회
 * - GET /api/approval-lines
 */
export const getAllApprovalLines = async (): Promise<ApprovalLineDto[]> => {
  try {
    const response = await apiClient.get<ApprovalLineDto[]>('/approval-lines');
    return response.data;
  } catch (error) {
    console.error('결재선 목록 조회 실패:', error);
    throw new Error('결재선 목록 조회에 실패했습니다.');
  }
};

/**
 * 결재선 검색
 * - GET /api/approval-lines/search
 */
export const searchApprovalLines = async (
  searchRequest: ApprovalLineSearchRequest
): Promise<ApprovalLineDto[]> => {
  try {
    // 빈 문자열 필터링
    const cleanedParams = Object.fromEntries(
      Object.entries(searchRequest).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const response = await apiClient.get<ApprovalLineDto[]>('/approval-lines/search', {
      params: cleanedParams
    });
    return response.data;
  } catch (error) {
    console.error('결재선 검색 실패:', error);
    throw new Error('결재선 검색에 실패했습니다.');
  }
};

/**
 * 결재선 단건 조회
 * - GET /api/approval-lines/{approvalLineId}
 */
export const getApprovalLine = async (approvalLineId: string): Promise<ApprovalLineDto> => {
  try {
    const response = await apiClient.get<ApprovalLineDto>(`/approval-lines/${approvalLineId}`);
    return response.data;
  } catch (error) {
    console.error('결재선 조회 실패:', error);
    throw new Error('결재선 조회에 실패했습니다.');
  }
};

/**
 * 업무구분별 사용중인 결재선 목록 조회
 * - GET /api/approval-lines/work-type/{workTypeCd}
 */
export const getActiveApprovalLinesByWorkType = async (
  workTypeCd: string
): Promise<ApprovalLineDto[]> => {
  try {
    const response = await apiClient.get<ApprovalLineDto[]>(
      `/approval-lines/work-type/${workTypeCd}`
    );
    return response.data;
  } catch (error) {
    console.error('업무구분별 결재선 조회 실패:', error);
    throw new Error('업무구분별 결재선 조회에 실패했습니다.');
  }
};

/**
 * 결재선 생성
 * - POST /api/approval-lines
 */
export const createApprovalLine = async (
  request: CreateApprovalLineRequest
): Promise<ApprovalLineDto> => {
  try {
    const response = await apiClient.post<ApprovalLineDto>('/approval-lines', request);
    return response.data;
  } catch (error) {
    console.error('결재선 생성 실패:', error);
    throw new Error('결재선 생성에 실패했습니다.');
  }
};

/**
 * 결재선 수정
 * - PUT /api/approval-lines/{approvalLineId}
 */
export const updateApprovalLine = async (
  approvalLineId: string,
  request: UpdateApprovalLineRequest
): Promise<ApprovalLineDto> => {
  try {
    const response = await apiClient.put<ApprovalLineDto>(
      `/approval-lines/${approvalLineId}`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('결재선 수정 실패:', error);
    throw new Error('결재선 수정에 실패했습니다.');
  }
};

/**
 * 결재선 삭제
 * - DELETE /api/approval-lines/{approvalLineId}
 */
export const deleteApprovalLine = async (approvalLineId: string): Promise<void> => {
  try {
    await apiClient.delete(`/approval-lines/${approvalLineId}`);
  } catch (error) {
    console.error('결재선 삭제 실패:', error);
    throw new Error('결재선 삭제에 실패했습니다.');
  }
};

/**
 * 결재선 복수 삭제
 * - DELETE /api/approval-lines
 */
export const deleteApprovalLines = async (approvalLineIds: string[]): Promise<void> => {
  try {
    await apiClient.delete('/approval-lines', {
      data: approvalLineIds
    });
  } catch (error) {
    console.error('결재선 복수 삭제 실패:', error);
    throw new Error('결재선 복수 삭제에 실패했습니다.');
  }
};

/**
 * 결재선 사용여부 토글
 * - PATCH /api/approval-lines/{approvalLineId}/toggle-active
 */
export const toggleApprovalLineActive = async (
  approvalLineId: string
): Promise<ApprovalLineDto> => {
  try {
    const response = await apiClient.patch<ApprovalLineDto>(
      `/approval-lines/${approvalLineId}/toggle-active`
    );
    return response.data;
  } catch (error) {
    console.error('결재선 사용여부 토글 실패:', error);
    throw new Error('결재선 사용여부 토글에 실패했습니다.');
  }
};

/**
 * 결재선 통계 조회
 * - GET /api/approval-lines/statistics
 */
export const getApprovalLineStatistics = async (): Promise<ApprovalLineStatistics> => {
  try {
    const response = await apiClient.get<ApprovalLineStatistics>('/approval-lines/statistics');
    return response.data;
  } catch (error) {
    console.error('결재선 통계 조회 실패:', error);
    throw new Error('결재선 통계 조회에 실패했습니다.');
  }
};
