/**
 * 직책명 React Query 훅
 *
 * @description 직책명 데이터 조회를 위한 TanStack Query 훅
 * @author Claude AI
 * @since 2025-10-17
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getPositionNamesForComboBox } from '../api/positionApi';
import type { PositionNameDto } from '../components/molecules/PositionNameComboBox/types';

/**
 * 콤보박스용 직책명 조회 훅
 *
 * @description group_code = 'RSBT_RSOF_DVCD' 공통코드 조회
 * @returns TanStack Query 결과 객체
 */
export const usePositionNamesForComboBox = (): UseQueryResult<PositionNameDto[], Error> => {
  return useQuery({
    queryKey: ['positionNames', 'combo'],
    queryFn: getPositionNamesForComboBox,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000,   // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
