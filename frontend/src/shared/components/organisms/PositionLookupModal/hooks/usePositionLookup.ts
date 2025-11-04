import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import type {
  Position,
  PositionSearchFilter,
  UsePositionLookupReturn
} from '../types/positionLookup.types';

/**
 * 직책조회 커스텀 훅
 * 직책 검색 및 데이터 관리 로직을 캡슐화
 */
export const usePositionLookup = (): UsePositionLookupReturn => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Mock 데이터 (실제 환경에서는 API 호출로 대체)
  const mockPositions: Position[] = [
    {
      positionId: 1,
      positionName: '대표이사',
      hqName: '경영본부',
      isConcurrent: 'N',
      isActive: 'Y'
    },
    {
      positionId: 2,
      positionName: '준법감시인',
      hqName: '경영본부',
      isConcurrent: 'Y',
      concurrentDetails: '내부통제총괄책임자',
      isActive: 'Y'
    },
    {
      positionId: 3,
      positionName: 'IT본부장',
      hqName: 'IT본부',
      isConcurrent: 'N',
      isActive: 'Y'
    },
    {
      positionId: 4,
      positionName: '리스크관리부서장',
      hqName: '리스크관리부',
      isConcurrent: 'Y',
      concurrentDetails: '내부통제담당',
      isActive: 'Y'
    },
    {
      positionId: 5,
      positionName: '영업본부장',
      hqName: '영업본부',
      isConcurrent: 'N',
      isActive: 'Y'
    }
  ];

  /**
   * 직책 검색 함수
   */
  const searchPositions = useCallback(async (filters: PositionSearchFilter) => {
    setLoading(true);
    setError(undefined);

    try {
      // TODO: 실제 API 호출로 교체
      // const response = await positionApi.search(filters);
      // setPositions(response.data);

      await new Promise(resolve => setTimeout(resolve, 300)); // 시뮬레이션

      // 클라이언트 사이드 필터링 (실제 환경에서는 서버에서 처리)
      let filteredPositions = mockPositions;

      if (filters.positionName) {
        filteredPositions = filteredPositions.filter(p =>
          p.positionName.includes(filters.positionName!)
        );
      }

      if (filters.hqName) {
        filteredPositions = filteredPositions.filter(p =>
          p.hqName?.includes(filters.hqName!)
        );
      }

      if (filters.isConcurrent) {
        filteredPositions = filteredPositions.filter(p =>
          p.isConcurrent === filters.isConcurrent
        );
      }

      if (filters.isActive) {
        filteredPositions = filteredPositions.filter(p =>
          p.isActive === filters.isActive
        );
      }

      setPositions(filteredPositions);
      setTotalCount(filteredPositions.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '직책 검색 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error('직책 목록을 불러오는데 실패했습니다.');
      setPositions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 검색 결과 초기화
   */
  const clearResults = useCallback(() => {
    setPositions([]);
    setTotalCount(0);
    setError(undefined);
  }, []);

  return {
    positions,
    loading,
    error,
    searchPositions,
    clearResults,
    totalCount
  };
};
