/**
 * 이행점검계획 API 클라이언트
 * - Backend ImplInspectionPlanController와 통신
 *
 * @author Claude AI
 * @since 2025-11-27
 */

import apiClient from '@/shared/api/apiClient';
import type {
  ImplInspectionPlanDto,
  ImplInspectionItemDto,
  CreateImplInspectionPlanRequest,
  UpdateImplInspectionPlanRequest
} from '../types/implInspectionPlan.types';

const BASE_URL = '/compliance/impl-inspection-plans';

/**
 * 전체 이행점검계획 목록 조회
 * GET /api/compliance/impl-inspection-plans
 */
export const getAllImplInspectionPlans = async (): Promise<ImplInspectionPlanDto[]> => {
  const response = await apiClient.get<ImplInspectionPlanDto[]>(BASE_URL);
  return response.data;
};

/**
 * 원장차수ID로 이행점검계획 목록 조회
 * GET /api/compliance/impl-inspection-plans/ledger-order/{ledgerOrderId}
 */
export const getImplInspectionPlansByLedgerOrderId = async (
  ledgerOrderId: string
): Promise<ImplInspectionPlanDto[]> => {
  const response = await apiClient.get<ImplInspectionPlanDto[]>(
    `${BASE_URL}/ledger-order/${ledgerOrderId}`
  );
  return response.data;
};

/**
 * 이행점검계획 단건 조회
 * GET /api/compliance/impl-inspection-plans/{implInspectionPlanId}
 */
export const getImplInspectionPlan = async (
  implInspectionPlanId: string
): Promise<ImplInspectionPlanDto> => {
  const response = await apiClient.get<ImplInspectionPlanDto>(
    `${BASE_URL}/${implInspectionPlanId}`
  );
  return response.data;
};

/**
 * 이행점검계획 생성 (점검항목 일괄 생성 포함)
 * POST /api/compliance/impl-inspection-plans
 * - request.manualCds에 선택한 부서장업무메뉴얼CD 목록 포함
 * - 1:N 관계로 impl_inspection_items도 자동 생성됨
 */
export const createImplInspectionPlan = async (
  request: CreateImplInspectionPlanRequest
): Promise<ImplInspectionPlanDto> => {
  const response = await apiClient.post<ImplInspectionPlanDto>(BASE_URL, request);
  return response.data;
};

/**
 * 이행점검계획 수정
 * PUT /api/compliance/impl-inspection-plans/{implInspectionPlanId}
 */
export const updateImplInspectionPlan = async (
  implInspectionPlanId: string,
  request: UpdateImplInspectionPlanRequest
): Promise<ImplInspectionPlanDto> => {
  const response = await apiClient.put<ImplInspectionPlanDto>(
    `${BASE_URL}/${implInspectionPlanId}`,
    request
  );
  return response.data;
};

/**
 * 이행점검계획 삭제 (비활성화)
 * DELETE /api/compliance/impl-inspection-plans/{implInspectionPlanId}
 */
export const deleteImplInspectionPlan = async (
  implInspectionPlanId: string
): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${implInspectionPlanId}`);
};

/**
 * 이행점검계획 일괄 삭제
 * DELETE /api/compliance/impl-inspection-plans/batch
 */
export const deleteImplInspectionPlans = async (
  ids: string[]
): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/batch`, { data: { ids } });
};

/**
 * 이행점검계획의 점검항목 목록 조회
 * GET /api/compliance/impl-inspection-plans/{implInspectionPlanId}/items
 */
export const getImplInspectionItems = async (
  implInspectionPlanId: string
): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/${implInspectionPlanId}/items`
  );
  return response.data;
};

/**
 * 전체 이행점검항목 목록 조회 (점검자지정 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/all
 * - impl_inspection_items 테이블 기준
 * - dept_manager_manuals, impl_inspection_plans JOIN
 */
export const getAllImplInspectionItems = async (): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/all`
  );
  return response.data;
};

/**
 * 원장차수ID별 이행점검항목 목록 조회 (점검자지정 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/ledger-order/{ledgerOrderId}
 * - impl_inspection_items 테이블 기준
 * - dept_manager_manuals, impl_inspection_plans JOIN
 */
export const getImplInspectionItemsByLedgerOrderId = async (
  ledgerOrderId: string
): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/ledger-order/${ledgerOrderId}`
  );
  return response.data;
};

/**
 * 점검자 일괄 지정 요청 타입
 */
export interface AssignInspectorBatchRequest {
  /** 점검항목ID 목록 (impl_inspection_items.impl_inspection_item_id) */
  itemIds: string[];
  /** 점검자ID (employees.emp_no) */
  inspectorId: string;
}

/**
 * 점검자 일괄 지정 응답 타입
 */
export interface AssignInspectorBatchResponse {
  success: boolean;
  updatedCount: number;
  message: string;
}

/**
 * 점검자 일괄 지정
 * POST /api/compliance/impl-inspection-plans/items/assign-inspector
 * - impl_inspection_items 테이블의 inspector_id 일괄 업데이트
 * @param request 점검항목ID 목록과 점검자ID
 * @returns 업데이트 결과
 */
export const assignInspectorBatch = async (
  request: AssignInspectorBatchRequest
): Promise<AssignInspectorBatchResponse> => {
  const response = await apiClient.post<AssignInspectorBatchResponse>(
    `${BASE_URL}/items/assign-inspector`,
    request
  );
  return response.data;
};

// ============================================================
// 이행점검수행 페이지용 API (책무/책무상세/관리의무 정보 포함)
// ============================================================

/**
 * 전체 이행점검항목 목록 조회 (이행점검수행 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/execution/all
 * - 책무/책무상세/관리의무 정보 포함
 */
export const getAllItemsForExecution = async (): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/execution/all`
  );
  return response.data;
};

/**
 * 원장차수ID별 이행점검항목 목록 조회 (이행점검수행 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/execution/ledger-order/{ledgerOrderId}
 * - 책무/책무상세/관리의무 정보 포함
 */
export const getItemsByLedgerOrderIdForExecution = async (
  ledgerOrderId: string
): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/execution/ledger-order/${ledgerOrderId}`
  );
  return response.data;
};

/**
 * 이행점검계획ID별 이행점검항목 목록 조회 (이행점검수행 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/execution/plan/{implInspectionPlanId}
 * - 책무/책무상세/관리의무 정보 포함
 */
export const getItemsByPlanIdForExecution = async (
  implInspectionPlanId: string
): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/execution/plan/${implInspectionPlanId}`
  );
  return response.data;
};

/**
 * 점검결과 업데이트 요청 타입
 */
export interface UpdateInspectionResultRequest {
  /** 점검결과상태코드 (01:미점검, 02:적정, 03:부적정) */
  inspectionStatusCd: string;
  /** 점검결과내용 */
  inspectionResultContent: string;
  /** 수행자ID (부적정 시 개선담당자로 설정) */
  executorId?: string;
}

/**
 * 점검결과 업데이트
 * PUT /api/compliance/impl-inspection-plans/items/{itemId}/inspection-result
 * - 점검결과상태코드, 점검결과내용, 점검일자 업데이트
 */
export const updateInspectionResult = async (
  itemId: string,
  request: UpdateInspectionResultRequest
): Promise<ImplInspectionItemDto> => {
  const response = await apiClient.put<ImplInspectionItemDto>(
    `${BASE_URL}/items/${itemId}/inspection-result`,
    request
  );
  return response.data;
};

// ============================================================
// 이행점검개선 페이지용 API (부적정 항목만 조회)
// ============================================================

/**
 * 부적정 항목 전체 조회 (이행점검개선 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/execution/all
 * - inspection_status_cd = '03' (부적정) 항목만 필터링
 * - 책무/책무상세/관리의무 정보 포함
 */
export const getAllItemsForImprovement = async (): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/execution/all`
  );
  // 부적정(03) 항목만 필터링
  return response.data.filter(item => item.inspectionStatusCd === '03');
};

/**
 * 원장차수ID별 부적정 항목 조회 (이행점검개선 페이지용)
 * GET /api/compliance/impl-inspection-plans/items/execution/ledger-order/{ledgerOrderId}
 * - inspection_status_cd = '03' (부적정) 항목만 필터링
 * - 책무/책무상세/관리의무 정보 포함
 */
export const getItemsByLedgerOrderIdForImprovement = async (
  ledgerOrderId: string
): Promise<ImplInspectionItemDto[]> => {
  const response = await apiClient.get<ImplInspectionItemDto[]>(
    `${BASE_URL}/items/execution/ledger-order/${ledgerOrderId}`
  );
  // 부적정(03) 항목만 필터링
  return response.data.filter(item => item.inspectionStatusCd === '03');
};

/**
 * 이행점검항목 단건 조회 (개선이행 모달용)
 * GET /api/compliance/impl-inspection-plans/items/{itemId}
 * - 책무/책무상세/관리의무 정보 포함
 * - Transient 필드 포함 (수행자명, 점검자명, 개선담당자명 등)
 */
export const getImplInspectionItem = async (
  itemId: string
): Promise<ImplInspectionItemDto> => {
  const response = await apiClient.get<ImplInspectionItemDto>(
    `${BASE_URL}/items/${itemId}`
  );
  return response.data;
};

/**
 * 개선이행 업데이트 요청 타입
 * - 개선계획, 개선이행, 최종점검 정보 업데이트
 */
export interface UpdateImprovementRequest {
  /** 개선담당자ID */
  improvementManagerId?: string;
  /** 개선이행상태코드 (01~05) */
  improvementStatusCd?: string;
  /** 개선계획내용 */
  improvementPlanContent?: string;
  /** 개선계획수립일자 (yyyy-MM-dd) */
  improvementPlanDate?: string;
  /** 개선계획 승인자ID */
  improvementApprovedBy?: string;
  /** 개선계획 승인일자 (yyyy-MM-dd) */
  improvementApprovedDate?: string;
  /** 개선이행세부내용 */
  improvementDetailContent?: string;
  /** 개선완료일자 (yyyy-MM-dd) */
  improvementCompletedDate?: string;
  /** 최종점검결과코드 (01:승인, 02:반려) */
  finalInspectionResultCd?: string;
  /** 최종점검결과내용 */
  finalInspectionResultContent?: string;
  /** 최종점검일자 (yyyy-MM-dd) */
  finalInspectionDate?: string;
}

/**
 * 개선이행 업데이트
 * PUT /api/compliance/impl-inspection-plans/items/{itemId}/improvement
 * - 개선계획, 개선이행, 최종점검 정보 업데이트
 * - 개선담당자(improvementManagerId)와 점검자(inspectorId)에 따라 수정 권한 분리
 */
export const updateImprovement = async (
  itemId: string,
  request: UpdateImprovementRequest
): Promise<ImplInspectionItemDto> => {
  const response = await apiClient.put<ImplInspectionItemDto>(
    `${BASE_URL}/items/${itemId}/improvement`,
    request
  );
  return response.data;
};
