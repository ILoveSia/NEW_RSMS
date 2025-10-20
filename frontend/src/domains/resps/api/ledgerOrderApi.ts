/**
 * 원장차수 API 서비스
 *
 * @description 원장차수 관리 REST API 통신 모듈
 * - 전체 CRUD API와 콤보박스용 간소화 API 통합
 * - 백엔드 API 실패 시 개발 환경에서는 Mock 데이터 제공
 *
 * @author Claude AI
 * @since 2025-10-16
 */

import axios from 'axios';
import type {
  LedgerOrder,
  CreateLedgerOrderDto,
  UpdateLedgerOrderDto,
  LedgerOrderSearchFilter
} from '../pages/LedgerMgmt/types/ledgerOrder.types';
import type { LedgerOrderComboDto } from '../components/molecules/LedgerOrderComboBox/types';

const API_BASE_URL = '/api/ledger-orders';

// ===============================
// Mock 데이터 (개발 환경용)
// ===============================

const MOCK_LEDGER_ORDERS: LedgerOrderComboDto[] = [
  {
    ledgerOrderId: '20250001',
    ledgerOrderTitle: '2025년 1차 점검이행',
    ledgerOrderStatus: 'PROG',
    displayLabel: '20250001-2025년 1차 점검이행[진행중]'
  },
  {
    ledgerOrderId: '20250002',
    ledgerOrderTitle: '2025년 2차 점검이행',
    ledgerOrderStatus: 'CLSD',
    displayLabel: '20250002-2025년 2차 점검이행'
  },
  {
    ledgerOrderId: '20240004',
    ledgerOrderTitle: '2024년 4차 점검이행',
    ledgerOrderStatus: 'CLSD',
    displayLabel: '20240004-2024년 4차 점검이행'
  },
  {
    ledgerOrderId: '20240003',
    ledgerOrderTitle: '2024년 3차 점검이행',
    ledgerOrderStatus: 'CLSD',
    displayLabel: '20240003-2024년 3차 점검이행'
  }
];

// ===============================
// 콤보박스용 API
// ===============================

/**
 * 콤보박스용 원장차수 조회
 * - PROG, CLSD 상태의 원장차수만 조회
 * - 백엔드 API 실패 시 Mock 데이터 반환 (개발 환경)
 *
 * @returns Promise<LedgerOrderComboDto[]> 원장차수 리스트
 * @throws Error API 호출 실패 시 (운영 환경)
 */
export const getActiveOrdersForComboBox = async (): Promise<LedgerOrderComboDto[]> => {
  try {
    const response = await axios.get<LedgerOrderComboDto[]>(`${API_BASE_URL}/combo`);
    return response.data;
  } catch (error) {
    // API 실패 시 Mock 데이터 반환 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.warn('백엔드 API를 사용할 수 없어 Mock 데이터를 반환합니다.');

      // 실제 API 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));

      return MOCK_LEDGER_ORDERS;
    }

    if (axios.isAxiosError(error)) {
      console.error('원장차수 조회 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '원장차수를 조회하는데 실패했습니다.');
    }
    throw error;
  }
};

// ===============================
// 원장차수 CRUD API
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
