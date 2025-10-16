/**
 * 원장차수 API 서비스
 *
 * @description 원장차수 관리 REST API 통신 모듈
 * @author Claude AI
 * @since 2025-10-16
 */

import type {
  LedgerOrder,
  CreateLedgerOrderDto,
  UpdateLedgerOrderDto,
  LedgerOrderSearchFilter
} from '../types/ledgerOrder.types';

const API_BASE_URL = '/api/ledger-orders';

// ===============================
// 원장차수 API
// ===============================

/**
 * 모든 원장차수 조회
 */
export const getAllLedgerOrders = async (): Promise<LedgerOrder[]> => {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('원장차수 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 원장차수 검색
 */
export const searchLedgerOrders = async (
  filters: LedgerOrderSearchFilter
): Promise<LedgerOrder[]> => {
  const params = new URLSearchParams();

  if (filters.searchKeyword) params.append('keyword', filters.searchKeyword);
  if (filters.ledgerOrderStatus) params.append('ledgerOrderStatus', filters.ledgerOrderStatus);
  if (filters.year) params.append('year', filters.year);

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('원장차수 검색에 실패했습니다.');
  }

  return response.json();
};

/**
 * 원장차수 단건 조회
 */
export const getLedgerOrder = async (ledgerOrderId: string): Promise<LedgerOrder> => {
  const response = await fetch(`${API_BASE_URL}/${ledgerOrderId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('원장차수 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 원장상태별 조회
 */
export const getLedgerOrdersByStatus = async (status: string): Promise<LedgerOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/status/${status}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('원장차수 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 년도별 조회
 */
export const getLedgerOrdersByYear = async (year: string): Promise<LedgerOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/year/${year}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('원장차수 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 최근 원장차수 조회
 */
export const getRecentLedgerOrders = async (limit: number = 10): Promise<LedgerOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/recent?limit=${limit}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('최근 원장차수 조회에 실패했습니다.');
  }

  return response.json();
};

/**
 * 원장차수 생성
 */
export const createLedgerOrder = async (
  request: CreateLedgerOrderDto
): Promise<LedgerOrder> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '원장차수 생성에 실패했습니다.');
  }

  return response.json();
};

/**
 * 원장차수 수정
 */
export const updateLedgerOrder = async (
  ledgerOrderId: string,
  request: UpdateLedgerOrderDto
): Promise<LedgerOrder> => {
  const response = await fetch(`${API_BASE_URL}/${ledgerOrderId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '원장차수 수정에 실패했습니다.');
  }

  return response.json();
};

/**
 * 원장차수 삭제
 */
export const deleteLedgerOrder = async (ledgerOrderId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${ledgerOrderId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('원장차수 삭제에 실패했습니다.');
  }
};

/**
 * 원장차수 복수 삭제
 */
export const deleteLedgerOrders = async (ledgerOrderIds: string[]): Promise<void> => {
  const response = await fetch(API_BASE_URL, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ledgerOrderIds),
  });

  if (!response.ok) {
    throw new Error('원장차수 삭제에 실패했습니다.');
  }
};

/**
 * 원장상태 변경
 */
export const changeStatus = async (
  ledgerOrderId: string,
  newStatus: string
): Promise<LedgerOrder> => {
  const response = await fetch(`${API_BASE_URL}/${ledgerOrderId}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ledgerOrderStatus: newStatus }),
  });

  if (!response.ok) {
    throw new Error('원장상태 변경에 실패했습니다.');
  }

  return response.json();
};

/**
 * 상태별 카운트 조회
 */
export const countByStatus = async (status: string): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/count/status/${status}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('상태별 카운트 조회에 실패했습니다.');
  }

  const data = await response.json();
  return data.count;
};

/**
 * 년도별 카운트 조회
 */
export const countByYear = async (year: string): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/count/year/${year}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('년도별 카운트 조회에 실패했습니다.');
  }

  const data = await response.json();
  return data.count;
};

/**
 * 검색 조건별 카운트 조회
 */
export const countBySearchConditions = async (
  filters: LedgerOrderSearchFilter
): Promise<number> => {
  const params = new URLSearchParams();

  if (filters.searchKeyword) params.append('keyword', filters.searchKeyword);
  if (filters.ledgerOrderStatus) params.append('ledgerOrderStatus', filters.ledgerOrderStatus);
  if (filters.year) params.append('year', filters.year);

  const response = await fetch(`${API_BASE_URL}/count/search?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('검색 조건별 카운트 조회에 실패했습니다.');
  }

  const data = await response.json();
  return data.count;
};
