import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { searchPositions as searchPositionsApi, type PositionSearchRequest } from '@/domains/resps/api/positionApi';
import type {
  Position,
  PositionSearchFilter,
  UsePositionLookupReturn
} from '../types/positionLookup.types';

/**
 * 직책조회 커스텀 훅
 * 직책 검색 및 데이터 관리 로직을 캡슐화
 * - positions 테이블에서 실제 데이터 조회
 */
export const usePositionLookup = (): UsePositionLookupReturn => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);

  /**
   * 직책 검색 함수
   * - positions 테이블에서 실제 데이터 조회
   */
  const searchPositions = useCallback(async (filters: PositionSearchFilter) => {
    setLoading(true);
    setError(undefined);

    try {
      // 검색 조건 매핑
      const searchRequest: PositionSearchRequest = {
        keyword: filters.positionName,      // 직책명으로 검색
        hqCode: filters.hqCode,             // 본부코드 (추후 추가 가능)
        isActive: filters.isActive || 'Y',  // 사용여부 (기본값: Y)
        ledgerOrderId: filters.ledgerOrderId // 원장차수ID (추후 추가 가능)
      };

      // 실제 API 호출
      const response = await searchPositionsApi(searchRequest);

      // Backend PositionDto → Frontend Position 매핑
      const mappedPositions: Position[] = response.map(dto => ({
        positionId: dto.positionsId,
        positionName: dto.positionsName,
        hqName: dto.hqName,
        isConcurrent: dto.isConcurrent,
        concurrentDetails: '', // TODO: 겸직사항 추가 필요
        isActive: dto.isActive,
        employeeName: '', // TODO: 직원명 추가 필요
        hqCode: dto.hqCode,
        positionsCd: dto.positionsCd,
        ledgerOrderId: dto.ledgerOrderId
      }));

      setPositions(mappedPositions);
      setTotalCount(mappedPositions.length);

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
