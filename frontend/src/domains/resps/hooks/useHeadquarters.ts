/**
 * 본부명 React Query 훅
 * - 본부명 데이터 조회를 위한 TanStack Query 훅
 * - group_code = 'DPRM_CD' 공통코드 조회
 *
 * @author Claude AI
 * @since 2025-10-20
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getHeadquartersForComboBox } from '../api/headquartersApi';
import type { HeadquartersDto } from '../components/molecules/HeadquartersComboBox/types';

/**
 * 콤보박스용 본부명 조회 훅
 * - 5분간 캐시 유지 (fresh 상태)
 * - 10분간 메모리 캐시 유지
 *
 * @returns TanStack Query 결과 객체
 */
export const useHeadquartersForComboBox = (): UseQueryResult<HeadquartersDto[], Error> => {
  return useQuery({
    queryKey: ['headquarters', 'combo'],
    queryFn: getHeadquartersForComboBox,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
