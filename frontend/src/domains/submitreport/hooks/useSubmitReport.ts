/**
 * 제출보고서 React Query 훅
 * - 제출보고서 CRUD를 위한 TanStack Query 훅 제공
 * - 정부기관(금융감독원 등)에 제출하는 보고서 관리
 *
 * @author Claude AI
 * @since 2025-12-03
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  getSubmitReports,
  getSubmitReport,
  getSubmitReportsByLedgerOrderId,
  createSubmitReport,
  updateSubmitReport,
  deleteSubmitReport,
  deleteSubmitReports,
  getSubmitReportCount,
  type SubmitReportResponse,
  type SubmitReportRequest,
  type SubmitReportSearchParams,
  type DeleteResponse,
  type CountResponse,
} from '../api/submitReportApi';

// ===============================
// Query Keys
// ===============================

/** 쿼리 키 상수 */
export const SUBMIT_REPORT_QUERY_KEYS = {
  all: ['submitReports'] as const,
  lists: () => [...SUBMIT_REPORT_QUERY_KEYS.all, 'list'] as const,
  list: (params: SubmitReportSearchParams) => [...SUBMIT_REPORT_QUERY_KEYS.lists(), params] as const,
  byLedger: (ledgerOrderId: string) => [...SUBMIT_REPORT_QUERY_KEYS.all, 'byLedger', ledgerOrderId] as const,
  details: () => [...SUBMIT_REPORT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...SUBMIT_REPORT_QUERY_KEYS.details(), id] as const,
  count: (ledgerOrderId: string) => [...SUBMIT_REPORT_QUERY_KEYS.all, 'count', ledgerOrderId] as const,
};

// ===============================
// 조회 훅 (Queries)
// ===============================

/**
 * 제출보고서 목록 조회 훅
 * - 검색 조건이 없으면 전체 조회
 *
 * @param params 검색 파라미터
 * @returns TanStack Query 결과
 */
export const useSubmitReports = (
  params: SubmitReportSearchParams = {}
): UseQueryResult<SubmitReportResponse[], Error> => {
  return useQuery({
    queryKey: SUBMIT_REPORT_QUERY_KEYS.list(params),
    queryFn: () => getSubmitReports(params),
    enabled: true, // 항상 조회 가능
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 제출보고서 단건 조회 훅
 *
 * @param id 보고서ID
 * @returns TanStack Query 결과
 */
export const useSubmitReport = (
  id: number | undefined
): UseQueryResult<SubmitReportResponse, Error> => {
  return useQuery({
    queryKey: SUBMIT_REPORT_QUERY_KEYS.detail(id || 0),
    queryFn: () => getSubmitReport(id!),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 원장차수별 제출보고서 목록 조회 훅
 *
 * @param ledgerOrderId 원장차수ID
 * @returns TanStack Query 결과
 */
export const useSubmitReportsByLedgerOrderId = (
  ledgerOrderId: string | undefined
): UseQueryResult<SubmitReportResponse[], Error> => {
  return useQuery({
    queryKey: SUBMIT_REPORT_QUERY_KEYS.byLedger(ledgerOrderId || ''),
    queryFn: () => getSubmitReportsByLedgerOrderId(ledgerOrderId!),
    enabled: !!ledgerOrderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 제출보고서 수 조회 훅
 *
 * @param ledgerOrderId 원장차수ID
 * @returns TanStack Query 결과
 */
export const useSubmitReportCount = (
  ledgerOrderId: string | undefined
): UseQueryResult<CountResponse, Error> => {
  return useQuery({
    queryKey: SUBMIT_REPORT_QUERY_KEYS.count(ledgerOrderId || ''),
    queryFn: () => getSubmitReportCount(ledgerOrderId!),
    enabled: !!ledgerOrderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// ===============================
// 변경 훅 (Mutations)
// ===============================

/**
 * 제출보고서 생성 훅
 *
 * @returns UseMutation 결과
 */
export const useCreateSubmitReport = (): UseMutationResult<
  SubmitReportResponse,
  Error,
  SubmitReportRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubmitReport,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: SUBMIT_REPORT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('제출보고서 생성 실패:', error);
    },
  });
};

/**
 * 제출보고서 수정 훅
 *
 * @returns UseMutation 결과
 */
export const useUpdateSubmitReport = (): UseMutationResult<
  SubmitReportResponse,
  Error,
  { id: number; request: SubmitReportRequest }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }) => updateSubmitReport(id, request),
    onSuccess: (data) => {
      // 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: SUBMIT_REPORT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SUBMIT_REPORT_QUERY_KEYS.detail(data.reportId),
      });
    },
    onError: (error) => {
      console.error('제출보고서 수정 실패:', error);
    },
  });
};

/**
 * 제출보고서 삭제 훅 (단건)
 *
 * @returns UseMutation 결과
 */
export const useDeleteSubmitReport = (): UseMutationResult<
  DeleteResponse,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmitReport,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: SUBMIT_REPORT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('제출보고서 삭제 실패:', error);
    },
  });
};

/**
 * 제출보고서 일괄 삭제 훅
 *
 * @returns UseMutation 결과
 */
export const useDeleteSubmitReports = (): UseMutationResult<
  DeleteResponse,
  Error,
  number[]
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmitReports,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: SUBMIT_REPORT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('제출보고서 일괄 삭제 실패:', error);
    },
  });
};
