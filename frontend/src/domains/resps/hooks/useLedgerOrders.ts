/**
 * 원장차수 React Query 훅
 *
 * @description 원장차수 데이터 조회를 위한 TanStack Query 훅
 * @author Claude AI
 * @since 2025-10-16
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getActiveOrdersForComboBox } from '../services/ledgerOrderService';
import type { LedgerOrderComboDto } from '../components/molecules/LedgerOrderComboBox/types';

/**
 * 콤보박스용 원장차수 조회 훅
 *
 * @returns TanStack Query 결과 객체
 */
export const useLedgerOrdersForComboBox = (): UseQueryResult<LedgerOrderComboDto[], Error> => {
  return useQuery({
    queryKey: ['ledgerOrders', 'combo'],
    queryFn: getActiveOrdersForComboBox,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
