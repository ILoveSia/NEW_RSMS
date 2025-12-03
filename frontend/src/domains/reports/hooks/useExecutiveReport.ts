/**
 * 임원이행점검보고서 React Query 훅
 *
 * @description 임원이행점검보고서 데이터 조회를 위한 TanStack Query 훅
 * @author Claude AI
 * @since 2025-12-03
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  getExecutiveReport,
  type ExecutiveReportRequest,
  type ExecutiveReportResponse,
} from '../api/executiveReportApi';

/**
 * 임원이행점검보고서 조회 훅
 * - ledgerOrderId가 필수 조건
 * - ledgerOrderId가 없으면 쿼리 비활성화
 *
 * @param params 조회 파라미터
 * @returns TanStack Query 결과 객체
 */
export const useExecutiveReport = (
  params: ExecutiveReportRequest
): UseQueryResult<ExecutiveReportResponse, Error> => {
  return useQuery({
    queryKey: ['executiveReport', params.ledgerOrderId, params.implInspectionPlanId, params.orgCode],
    queryFn: () => getExecutiveReport(params),
    // ledgerOrderId가 있을 때만 쿼리 실행
    enabled: !!params.ledgerOrderId,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
