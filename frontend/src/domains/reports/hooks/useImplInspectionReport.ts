/**
 * 이행점검결과보고서 React Query 훅
 * - 보고서 CRUD를 위한 TanStack Query 훅 제공
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
  getImplInspectionReports,
  getImplInspectionReport,
  getImplInspectionReportsByType,
  createImplInspectionReport,
  updateImplInspectionReport,
  deleteImplInspectionReport,
  deleteImplInspectionReports,
  getImplInspectionReportCount,
  checkImplInspectionReportExists,
  type ImplInspectionReportResponse,
  type CreateReportRequest,
  type UpdateReportRequest,
  type GetReportsParams,
  type DeleteResponse,
  type CountResponse,
  type ExistsResponse,
} from '../api/implInspectionReportApi';

// ===============================
// Query Keys
// ===============================

/** 쿼리 키 상수 */
export const REPORT_QUERY_KEYS = {
  all: ['implInspectionReports'] as const,
  lists: () => [...REPORT_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetReportsParams) => [...REPORT_QUERY_KEYS.lists(), params] as const,
  byType: (reportTypeCd: string) => [...REPORT_QUERY_KEYS.all, 'byType', reportTypeCd] as const,
  details: () => [...REPORT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REPORT_QUERY_KEYS.details(), id] as const,
  count: (ledgerOrderId: string) => [...REPORT_QUERY_KEYS.all, 'count', ledgerOrderId] as const,
  exists: (planId: string, typeCd: string) => [...REPORT_QUERY_KEYS.all, 'exists', planId, typeCd] as const,
};

// ===============================
// 조회 훅 (Queries)
// ===============================

/**
 * 보고서 목록 조회 훅
 * - ledgerOrderId가 없으면 전체 조회
 *
 * @param params 조회 파라미터
 * @returns TanStack Query 결과
 */
export const useImplInspectionReports = (
  params: GetReportsParams
): UseQueryResult<ImplInspectionReportResponse[], Error> => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.list(params),
    queryFn: () => getImplInspectionReports(params),
    enabled: true, // ledgerOrderId 없어도 전체 조회 가능
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 보고서 단건 조회 훅
 *
 * @param id 이행점검결과보고서ID
 * @returns TanStack Query 결과
 */
export const useImplInspectionReport = (
  id: string | undefined
): UseQueryResult<ImplInspectionReportResponse, Error> => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.detail(id || ''),
    queryFn: () => getImplInspectionReport(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 보고서구분별 목록 조회 훅
 *
 * @param reportTypeCd 보고서구분코드
 * @returns TanStack Query 결과
 */
export const useImplInspectionReportsByType = (
  reportTypeCd: string | undefined
): UseQueryResult<ImplInspectionReportResponse[], Error> => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.byType(reportTypeCd || ''),
    queryFn: () => getImplInspectionReportsByType(reportTypeCd!),
    enabled: !!reportTypeCd,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 보고서 수 조회 훅
 *
 * @param ledgerOrderId 원장차수ID
 * @returns TanStack Query 결과
 */
export const useImplInspectionReportCount = (
  ledgerOrderId: string | undefined
): UseQueryResult<CountResponse, Error> => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.count(ledgerOrderId || ''),
    queryFn: () => getImplInspectionReportCount(ledgerOrderId!),
    enabled: !!ledgerOrderId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * 보고서 존재 여부 확인 훅
 *
 * @param implInspectionPlanId 이행점검계획ID
 * @param reportTypeCd 보고서구분코드
 * @returns TanStack Query 결과
 */
export const useImplInspectionReportExists = (
  implInspectionPlanId: string | undefined,
  reportTypeCd: string | undefined
): UseQueryResult<ExistsResponse, Error> => {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.exists(implInspectionPlanId || '', reportTypeCd || ''),
    queryFn: () => checkImplInspectionReportExists(implInspectionPlanId!, reportTypeCd!),
    enabled: !!implInspectionPlanId && !!reportTypeCd,
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
 * 보고서 생성 훅
 *
 * @returns UseMutation 결과
 */
export const useCreateImplInspectionReport = (): UseMutationResult<
  ImplInspectionReportResponse,
  Error,
  CreateReportRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createImplInspectionReport,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('보고서 생성 실패:', error);
    },
  });
};

/**
 * 보고서 수정 훅
 *
 * @returns UseMutation 결과
 */
export const useUpdateImplInspectionReport = (): UseMutationResult<
  ImplInspectionReportResponse,
  Error,
  { id: string; request: UpdateReportRequest }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }) => updateImplInspectionReport(id, request),
    onSuccess: (data) => {
      // 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: REPORT_QUERY_KEYS.detail(data.implInspectionReportId),
      });
    },
    onError: (error) => {
      console.error('보고서 수정 실패:', error);
    },
  });
};

/**
 * 보고서 삭제 훅 (단건)
 *
 * @returns UseMutation 결과
 */
export const useDeleteImplInspectionReport = (): UseMutationResult<
  DeleteResponse,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteImplInspectionReport,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('보고서 삭제 실패:', error);
    },
  });
};

/**
 * 보고서 일괄 삭제 훅
 *
 * @returns UseMutation 결과
 */
export const useDeleteImplInspectionReports = (): UseMutationResult<
  DeleteResponse,
  Error,
  string[]
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteImplInspectionReports,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('보고서 일괄 삭제 실패:', error);
    },
  });
};
