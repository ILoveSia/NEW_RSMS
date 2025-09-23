import { useState, useCallback } from 'react';
import type {
  Branch,
  BranchLookupFilters,
  BranchLookupResult,
  UseBranchLookupReturn
} from '../types/branchLookup.types';

/**
 * 부점조회 커스텀 훅
 * 부점 검색 및 데이터 관리 로직을 캡슐화
 */
export const useBranchLookup = (): UseBranchLookupReturn => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Mock 데이터 (실제 환경에서는 API 호출로 대체)
  const mockBranches: Branch[] = [
    {
      id: 'BRANCH_001',
      branchCode: '0001',
      branchName: '본점',
      branchType: '본점',
      zipCode: '04000',
      managerName: '미폐쇄',
      isActive: true,
      address: '서울특별시 중구 명동1가',
      phone: '02-1234-5678',
      fax: '02-1234-5679',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 'BRANCH_002',
      branchCode: '0002',
      branchName: '강남지점',
      branchType: '지점',
      zipCode: '06000',
      managerName: '미폐쇄',
      isActive: true,
      address: '서울특별시 강남구 역삼동',
      phone: '02-2345-6789',
      fax: '02-2345-6780',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    },
    {
      id: 'BRANCH_003',
      branchCode: '0003',
      branchName: '부산지점',
      branchType: '지점',
      zipCode: '48000',
      managerName: '미폐쇄',
      isActive: true,
      address: '부산광역시 해운대구 우동',
      phone: '051-3456-7890',
      fax: '051-3456-7891',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03'
    },
    {
      id: 'BRANCH_004',
      branchCode: '0004',
      branchName: '대구출장소',
      branchType: '출장소',
      zipCode: '41000',
      managerName: '미폐쇄',
      isActive: true,
      address: '대구광역시 중구 동성로',
      phone: '053-4567-8901',
      fax: '053-4567-8902',
      createdAt: '2024-01-04',
      updatedAt: '2024-01-04'
    },
    {
      id: 'BRANCH_005',
      branchCode: '0005',
      branchName: '인천지점',
      branchType: '지점',
      zipCode: '21000',
      managerName: '폐쇄',
      isActive: false,
      address: '인천광역시 남동구 구월동',
      phone: '032-5678-9012',
      fax: '032-5678-9013',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05'
    }
  ];

  /**
   * 부점 검색 함수
   */
  const searchBranches = useCallback(async (filters: BranchLookupFilters) => {
    setLoading(true);
    setError(undefined);

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션

      // 클라이언트 사이드 필터링 (실제 환경에서는 서버에서 처리)
      let filteredBranches = mockBranches;

      if (filters.branchCode) {
        filteredBranches = filteredBranches.filter(branch =>
          branch.branchCode.toLowerCase().includes(filters.branchCode!.toLowerCase())
        );
      }

      if (filters.branchName) {
        filteredBranches = filteredBranches.filter(branch =>
          branch.branchName.toLowerCase().includes(filters.branchName!.toLowerCase())
        );
      }

      if (filters.branchType && filters.branchType !== '전체') {
        filteredBranches = filteredBranches.filter(branch =>
          branch.branchType === filters.branchType
        );
      }

      if (filters.managerName && filters.managerName !== '전체') {
        const isActive = filters.managerName === '미폐쇄';
        filteredBranches = filteredBranches.filter(branch =>
          branch.isActive === isActive
        );
      }

      setBranches(filteredBranches);
      setTotalCount(filteredBranches.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '부점 검색 중 오류가 발생했습니다.';
      setError(errorMessage);
      setBranches([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 검색 결과 초기화
   */
  const clearResults = useCallback(() => {
    setBranches([]);
    setTotalCount(0);
    setError(undefined);
  }, []);

  return {
    branches,
    loading,
    error,
    searchBranches,
    clearResults,
    totalCount
  };
};