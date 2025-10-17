/**
 * 원장차수 API 서비스
 *
 * @description 원장차수 관련 API 호출 서비스
 * @author Claude AI
 * @since 2025-10-16
 */

import axios from 'axios';
import type { LedgerOrderComboDto } from '../components/molecules/LedgerOrderComboBox/types';

const API_BASE_URL = '/api/ledger-orders';

// Mock 데이터 (백엔드 API가 없을 때 대비)
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

/**
 * 콤보박스용 원장차수 조회 (PROG, CLSD만)
 *
 * @returns PROG, CLSD 상태의 원장차수 목록
 * @throws Error API 호출 실패 시
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
