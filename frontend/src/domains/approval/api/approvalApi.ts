/**
 * 결재 API
 * - 결재 요청, 승인, 반려, 회수
 * - 결재함 조회 (기안함, 결재대기함, 결재완료함)
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
 * 결재 이력 DTO
 * - 백엔드 ApprovalHistoryDto와 필드명 일치
 */
export interface ApprovalHistoryDto {
  approvalHistoryId: string;
  approvalId: string;
  stepSequence: number;
  stepName: string;
  stepTypeCd?: string;
  stepTypeName?: string;
  approverId: string;
  approverName: string;
  approverDeptId?: string;
  approverDeptName?: string;
  approverPosition?: string;
  actionCd: string;
  actionName?: string;
  actionDate?: string;
  actionComment?: string;
  isDelegateYn?: string;
  delegateFromId?: string;
  delegateFromName?: string;
  createdAt?: string;
}

/**
 * 결재 문서 응답 DTO
 */
export interface ApprovalDto {
  approvalId: string;
  approvalLineId: string;
  approvalLineName?: string;
  workTypeCd: string;
  workTypeName?: string;
  documentId: string;
  documentNo?: string;
  title: string;
  content?: string;
  approvalStatusCd: string;
  approvalStatusName?: string;
  currentStep: number;
  totalSteps: number;
  requesterId: string;
  requesterName?: string;
  requesterDeptCd?: string;
  requesterDeptName?: string;
  requestedAt: string;
  completedAt?: string;
  createdBy?: string;
  createdAt?: string;
  histories?: ApprovalHistoryDto[];
}

/**
 * 결재 요청 DTO
 * - 백엔드 CreateApprovalRequest와 필드명 일치
 */
export interface CreateApprovalRequest {
  approvalLineId: string;
  workTypeCd: string;
  approvalTypeCd: string;  // 결재유형코드 (PLAN_APPROVAL: 계획승인, COMPLETE_APPROVAL: 완료승인, RESULT_APPROVAL: 결과승인)
  title: string;
  content?: string;
  refDocType: string;   // 참조문서 유형 (MGMT_ACTIVITY, IMPL_INSPECTION_ITEM, IMPROVEMENT 등)
  refDocId: string;     // 참조문서 ID (원본 테이블의 PK)
  isUrgent?: string;    // 긴급여부 (Y/N)
  remarks?: string;     // 비고
}

/**
 * 결재 처리 DTO
 */
export interface ProcessApprovalRequest {
  resultCd: 'APPROVE' | 'REJECT';
  comment?: string;
}

/**
 * 결재함 검색 요청 DTO
 */
export interface ApprovalSearchRequest {
  workTypeCd?: string;
  approvalStatusCd?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 결재함 건수 DTO
 */
export interface ApprovalBoxCount {
  draft: number;
  pending: number;
  completed: number;
}

// ===============================
// 결재함 조회 API
// ===============================

/**
 * 기안함 조회
 * - GET /api/approvals/draft-box
 */
export const getDraftBox = async (): Promise<ApprovalDto[]> => {
  try {
    const response = await apiClient.get<ApprovalDto[]>('/approvals/draft-box');
    return response.data;
  } catch (error) {
    console.error('기안함 조회 실패:', error);
    throw new Error('기안함 조회에 실패했습니다.');
  }
};

/**
 * 결재대기함 조회
 * - GET /api/approvals/pending-box
 */
export const getPendingBox = async (): Promise<ApprovalDto[]> => {
  try {
    const response = await apiClient.get<ApprovalDto[]>('/approvals/pending-box');
    return response.data;
  } catch (error) {
    console.error('결재대기함 조회 실패:', error);
    throw new Error('결재대기함 조회에 실패했습니다.');
  }
};

/**
 * 결재완료함 조회
 * - GET /api/approvals/completed-box
 */
export const getCompletedBox = async (): Promise<ApprovalDto[]> => {
  try {
    const response = await apiClient.get<ApprovalDto[]>('/approvals/completed-box');
    return response.data;
  } catch (error) {
    console.error('결재완료함 조회 실패:', error);
    throw new Error('결재완료함 조회에 실패했습니다.');
  }
};

/**
 * 기안함 검색
 * - GET /api/approvals/draft-box/search
 */
export const searchDraftBox = async (
  searchRequest: ApprovalSearchRequest
): Promise<ApprovalDto[]> => {
  try {
    const cleanedParams = Object.fromEntries(
      Object.entries(searchRequest).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const response = await apiClient.get<ApprovalDto[]>('/approvals/draft-box/search', {
      params: cleanedParams
    });
    return response.data;
  } catch (error) {
    console.error('기안함 검색 실패:', error);
    throw new Error('기안함 검색에 실패했습니다.');
  }
};

/**
 * 결재대기함 검색
 * - GET /api/approvals/pending-box/search
 */
export const searchPendingBox = async (
  searchRequest: ApprovalSearchRequest
): Promise<ApprovalDto[]> => {
  try {
    const cleanedParams = Object.fromEntries(
      Object.entries(searchRequest).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    const response = await apiClient.get<ApprovalDto[]>('/approvals/pending-box/search', {
      params: cleanedParams
    });
    return response.data;
  } catch (error) {
    console.error('결재대기함 검색 실패:', error);
    throw new Error('결재대기함 검색에 실패했습니다.');
  }
};

/**
 * 결재함 건수 조회
 * - GET /api/approvals/box-count
 */
export const getApprovalBoxCount = async (): Promise<ApprovalBoxCount> => {
  try {
    const response = await apiClient.get<ApprovalBoxCount>('/approvals/box-count');
    return response.data;
  } catch (error) {
    console.error('결재함 건수 조회 실패:', error);
    throw new Error('결재함 건수 조회에 실패했습니다.');
  }
};

// ===============================
// 결재 상세 조회 API
// ===============================

/**
 * 결재 문서 상세 조회
 * - GET /api/approvals/{approvalId}
 */
export const getApproval = async (approvalId: string): Promise<ApprovalDto> => {
  try {
    const response = await apiClient.get<ApprovalDto>(`/approvals/${approvalId}`);
    return response.data;
  } catch (error) {
    console.error('결재 문서 조회 실패:', error);
    throw new Error('결재 문서 조회에 실패했습니다.');
  }
};

// ===============================
// 결재 요청/처리 API
// ===============================

/**
 * 결재 요청 (기안)
 * - POST /api/approvals
 *
 * @param request 결재 요청 정보
 * @returns 생성된 결재 문서
 */
export const createApproval = async (
  request: CreateApprovalRequest
): Promise<ApprovalDto> => {
  try {
    const response = await apiClient.post<ApprovalDto>('/approvals', request);
    return response.data;
  } catch (error) {
    console.error('결재 요청 실패:', error);
    throw new Error('결재 요청에 실패했습니다.');
  }
};

/**
 * 결재 처리 (승인/반려)
 * - POST /api/approvals/{approvalId}/process
 *
 * @param approvalId 결재 문서 ID
 * @param request 처리 정보 (승인/반려, 의견)
 * @returns 처리된 결재 문서
 */
export const processApproval = async (
  approvalId: string,
  request: ProcessApprovalRequest
): Promise<ApprovalDto> => {
  try {
    const response = await apiClient.post<ApprovalDto>(
      `/approvals/${approvalId}/process`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('결재 처리 실패:', error);
    throw new Error('결재 처리에 실패했습니다.');
  }
};

/**
 * 결재 회수
 * - POST /api/approvals/{approvalId}/withdraw
 *
 * @param approvalId 결재 문서 ID
 * @returns 회수된 결재 문서
 */
export const withdrawApproval = async (approvalId: string): Promise<ApprovalDto> => {
  try {
    const response = await apiClient.post<ApprovalDto>(
      `/approvals/${approvalId}/withdraw`
    );
    return response.data;
  } catch (error) {
    console.error('결재 회수 실패:', error);
    throw new Error('결재 회수에 실패했습니다.');
  }
};

/**
 * 결재 일괄 승인
 * - POST /api/approvals/batch-approve
 *
 * @param approvalIds 결재 문서 ID 목록
 * @param comment 승인 의견
 * @returns 처리 결과 (성공/실패 건수)
 */
export const batchApprove = async (
  approvalIds: string[],
  comment?: string
): Promise<{ success: number; fail: number }> => {
  try {
    const response = await apiClient.post<{ success: number; fail: number }>(
      '/approvals/batch-approve',
      approvalIds,
      { params: { comment } }
    );
    return response.data;
  } catch (error) {
    console.error('일괄 승인 실패:', error);
    throw new Error('일괄 승인에 실패했습니다.');
  }
};

/**
 * 결재 일괄 반려
 * - POST /api/approvals/batch-reject
 *
 * @param approvalIds 결재 문서 ID 목록
 * @param comment 반려 사유
 * @returns 처리 결과 (성공/실패 건수)
 */
export const batchReject = async (
  approvalIds: string[],
  comment?: string
): Promise<{ success: number; fail: number }> => {
  try {
    const response = await apiClient.post<{ success: number; fail: number }>(
      '/approvals/batch-reject',
      approvalIds,
      { params: { comment } }
    );
    return response.data;
  } catch (error) {
    console.error('일괄 반려 실패:', error);
    throw new Error('일괄 반려에 실패했습니다.');
  }
};

// ===============================
// 개선이행 전용 결재 요청 API
// ===============================

/**
 * 개선이행 계획승인 요청
 * - 개선이행 문서에 대한 계획 승인 결재 요청
 *
 * @param improvementId 개선이행 ID (impl_inspection_items 테이블의 PK)
 * @param approvalLineId 결재선 ID
 * @param opinion 요청 의견
 * @returns 생성된 결재 문서
 */
export const requestImprovementPlanApproval = async (
  improvementId: string,
  approvalLineId: string,
  opinion?: string
): Promise<ApprovalDto> => {
  const request: CreateApprovalRequest = {
    approvalLineId,
    workTypeCd: 'IMPROVE',
    approvalTypeCd: 'PLAN_APPROVAL',     // 결재유형: 계획승인
    title: `개선이행 계획승인 요청`,
    content: opinion || '',
    refDocType: 'IMPL_INSPECTION_ITEM',  // 참조 테이블: impl_inspection_items
    refDocId: improvementId              // 참조 ID: 이행점검항목ID
  };

  return createApproval(request);
};

/**
 * 개선이행 완료승인 요청
 * - 개선이행 문서에 대한 완료 승인 결재 요청
 *
 * @param improvementId 개선이행 ID (impl_inspection_items 테이블의 PK)
 * @param approvalLineId 결재선 ID
 * @param opinion 요청 의견
 * @returns 생성된 결재 문서
 */
export const requestImprovementCompleteApproval = async (
  improvementId: string,
  approvalLineId: string,
  opinion?: string
): Promise<ApprovalDto> => {
  const request: CreateApprovalRequest = {
    approvalLineId,
    workTypeCd: 'IMPROVE',
    approvalTypeCd: 'COMPLETE_APPROVAL', // 결재유형: 완료승인
    title: `개선이행 완료승인 요청`,
    content: opinion || '',
    refDocType: 'IMPL_INSPECTION_ITEM',  // 참조 테이블: impl_inspection_items
    refDocId: improvementId              // 참조 ID: 이행점검항목ID
  };

  return createApproval(request);
};
