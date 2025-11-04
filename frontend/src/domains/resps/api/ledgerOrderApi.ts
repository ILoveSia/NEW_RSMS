/**
 * 책무이행차수 API 서비스
 *
 * @description 책무이행(원장)차수 관리 REST API 통신 모듈
 * - 전체 CRUD API와 콤보박스용 간소화 API 통합
 *
 * @author Claude AI
 * @since 2025-10-16
 */

import apiClient from '@/shared/api/apiClient';
import type { LedgerOrderComboDto } from '../components/molecules/LedgerOrderComboBox/types';
import type {
  CreateLedgerOrderDto,
  LedgerOrder,
  LedgerOrderSearchFilter,
  UpdateLedgerOrderDto
} from '../pages/LedgerMgmt/types/ledgerOrder.types';

// ===============================
// 콤보박스용 API
// ===============================

/**
 * 콤보박스용 원장차수 조회
 * - PROG, CLSD 상태의 원장차수만 조회
 *
 * @returns Promise<LedgerOrderComboDto[]> 원장차수 리스트
 * @throws Error API 호출 실패 시
 */
export const getActiveOrdersForComboBox = async (): Promise<LedgerOrderComboDto[]> => {
  try {
    const response = await apiClient.get<LedgerOrderComboDto[]>('/ledger-orders/combo');
    return response.data;
  } catch (error: unknown) {
    console.error('원장차수 조회 실패:', error);
    throw new Error('원장차수를 조회하는데 실패했습니다.');
  }
};

// ===============================
// 원장차수 CRUD API
// ===============================

/**
 * 모든 원장차수 조회
 */
export const getAllLedgerOrders = async (): Promise<LedgerOrder[]> => {
  const response = await apiClient.get<LedgerOrder[]>('/ledger-orders');
  return response.data;
};

/**
 * 원장차수 검색
 */
export const searchLedgerOrders = async (
  filters: LedgerOrderSearchFilter
): Promise<LedgerOrder[]> => {
  const params: Record<string, string> = {};
  if (filters.searchKeyword) params.keyword = filters.searchKeyword;
  if (filters.ledgerOrderStatus) params.ledgerOrderStatus = filters.ledgerOrderStatus;
  if (filters.year) params.year = filters.year;

  const response = await apiClient.get<LedgerOrder[]>('/ledger-orders/search', { params });
  return response.data;
};

/**
 * 원장차수 단건 조회
 */
export const getLedgerOrder = async (ledgerOrderId: string): Promise<LedgerOrder> => {
  const response = await apiClient.get<LedgerOrder>(`/ledger-orders/${ledgerOrderId}`);
  return response.data;
};

/**
 * 원장상태별 조회
 */
export const getLedgerOrdersByStatus = async (status: string): Promise<LedgerOrder[]> => {
  const response = await apiClient.get<LedgerOrder[]>(`/ledger-orders/status/${status}`);
  return response.data;
};

/**
 * 년도별 조회
 */
export const getLedgerOrdersByYear = async (year: string): Promise<LedgerOrder[]> => {
  const response = await apiClient.get<LedgerOrder[]>(`/ledger-orders/year/${year}`);
  return response.data;
};

/**
 * 최근 원장차수 조회
 */
export const getRecentLedgerOrders = async (limit: number = 10): Promise<LedgerOrder[]> => {
  const response = await apiClient.get<LedgerOrder[]>('/ledger-orders/recent', {
    params: { limit }
  });
  return response.data;
};

/**
 * 원장차수 생성
 */
export const createLedgerOrder = async (
  request: CreateLedgerOrderDto
): Promise<LedgerOrder> => {
  const response = await apiClient.post<LedgerOrder>('/ledger-orders', request);
  return response.data;
};

/**
 * 원장차수 수정
 */
export const updateLedgerOrder = async (
  ledgerOrderId: string,
  request: UpdateLedgerOrderDto
): Promise<LedgerOrder> => {
  const response = await apiClient.put<LedgerOrder>(`/ledger-orders/${ledgerOrderId}`, request);
  return response.data;
};

/**
 * 원장차수 삭제
 */
export const deleteLedgerOrder = async (ledgerOrderId: string): Promise<void> => {
  await apiClient.delete(`/ledger-orders/${ledgerOrderId}`);
};

/**
 * 원장차수 복수 삭제
 */
export const deleteLedgerOrders = async (ledgerOrderIds: string[]): Promise<void> => {
  await apiClient.delete('/ledger-orders', { data: ledgerOrderIds });
};

/**
 * 원장상태 변경
 */
export const changeStatus = async (
  ledgerOrderId: string,
  newStatus: string
): Promise<LedgerOrder> => {
  const response = await apiClient.patch<LedgerOrder>(
    `/ledger-orders/${ledgerOrderId}/status`,
    { ledgerOrderStatus: newStatus }
  );
  return response.data;
};

/**
 * 상태별 카운트 조회
 */
export const countByStatus = async (status: string): Promise<number> => {
  const response = await apiClient.get<{ count: number }>(`/ledger-orders/count/status/${status}`);
  return response.data.count;
};

/**
 * 년도별 카운트 조회
 */
export const countByYear = async (year: string): Promise<number> => {
  const response = await apiClient.get<{ count: number }>(`/ledger-orders/count/year/${year}`);
  return response.data.count;
};

/**
 * 검색 조건별 카운트 조회
 */
export const countBySearchConditions = async (
  filters: LedgerOrderSearchFilter
): Promise<number> => {
  const params: Record<string, string> = {};
  if (filters.searchKeyword) params.keyword = filters.searchKeyword;
  if (filters.ledgerOrderStatus) params.ledgerOrderStatus = filters.ledgerOrderStatus;
  if (filters.year) params.year = filters.year;

  const response = await apiClient.get<{ count: number }>('/ledger-orders/count/search', { params });
  return response.data.count;
};
