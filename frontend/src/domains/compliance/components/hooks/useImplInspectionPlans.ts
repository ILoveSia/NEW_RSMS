/**
 * 이행점검계획 React Query 훅
 *
 * @description 이행점검계획 데이터 조회를 위한 TanStack Query 훅
 * @author Claude AI
 * @since 2025-12-03
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getImplInspectionPlansByLedgerOrderId } from '../../api/implInspectionPlanApi';
import type { ImplInspectionPlanDto } from '../../types/implInspectionPlan.types';

/**
 * 원장차수ID별 이행점검계획 조회 훅
 * - InspectionPlanComboBox에서 사용
 * - ledgerOrderId가 null이면 쿼리 비활성화
 *
 * @param ledgerOrderId 원장차수ID (필수 조건)
 * @returns TanStack Query 결과 객체
 */
export const useImplInspectionPlansByLedgerOrder = (
  ledgerOrderId: string | null
): UseQueryResult<ImplInspectionPlanDto[], Error> => {
  return useQuery({
    queryKey: ['implInspectionPlans', 'ledgerOrder', ledgerOrderId],
    queryFn: () => getImplInspectionPlansByLedgerOrderId(ledgerOrderId!),
    // ledgerOrderId가 있을 때만 쿼리 실행
    enabled: !!ledgerOrderId,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
