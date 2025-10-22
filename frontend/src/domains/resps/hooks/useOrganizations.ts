/**
 * useOrganizations Hook
 *
 * @description 조직 데이터 조회를 위한 React Query Hook
 * - TanStack Query를 사용한 서버 상태 관리
 * - 본부코드별 부서 목록 조회
 *
 * @author Claude AI
 * @since 2025-10-21
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getDepartmentsByHqCode, type DepartmentDto } from '../api/organizationsApi';

// ===============================
// Query Keys
// ===============================

export const organizationsKeys = {
  all: ['organizations'] as const,
  departments: (hqCode: string) => ['organizations', 'departments', hqCode] as const,
};

// ===============================
// Hook: 본부코드별 부서 목록 조회
// ===============================

/**
 * 본부코드별 부서 목록 조회 Hook
 *
 * <p>특정 본부코드에 속한 부서 및 영업점 목록을 조회합니다.</p>
 *
 * <p>특징:
 * <ul>
 *   <li>hqCode가 있을 때만 API 호출 (enabled 조건)</li>
 *   <li>5분간 캐시 유지 (staleTime: 5 * 60 * 1000)</li>
 *   <li>로딩/에러/데이터 상태 자동 관리</li>
 * </ul>
 * </p>
 *
 * @param hqCode 본부코드 (null이면 API 호출 안함)
 * @returns UseQueryResult<DepartmentDto[]> 부서 목록 쿼리 결과
 *
 * @example
 * ```tsx
 * const { data: departments, isLoading, isError } = useDepartmentsByHqCode('1010');
 * ```
 */
export const useDepartmentsByHqCode = (
  hqCode: string | null
): UseQueryResult<DepartmentDto[], Error> => {
  return useQuery({
    queryKey: organizationsKeys.departments(hqCode || ''),
    queryFn: () => getDepartmentsByHqCode(hqCode!),
    enabled: !!hqCode, // hqCode가 있을 때만 API 호출
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지 (이전 cacheTime)
    retry: 1, // 실패 시 1번만 재시도
  });
};
