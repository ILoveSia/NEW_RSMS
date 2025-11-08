import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { searchOrganizations as searchOrganizationsApi } from '@/shared/api/organizationApi';
import type {
  Organization,
  OrganizationSearchFilters,
  UseOrganizationSearchReturn
} from '../types/organizationSearch.types';

/**
 * 조직조회 커스텀 훅
 * 조직 검색 및 데이터 관리 로직을 캡슐화
 */
export const useOrganizationSearch = (): UseOrganizationSearchReturn => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);

  /**
   * 조직 검색 함수 (실제 API 호출)
   */
  const searchOrganizations = useCallback(async (filters: OrganizationSearchFilters) => {
    setLoading(true);
    setError(undefined);

    try {
      // 실제 API 호출
      const response = await searchOrganizationsApi({
        keyword: filters.name || filters.orgCode || ''
      });

      // Organization 타입으로 매핑
      const mappedOrganizations: Organization[] = response.map((org: any) => ({
        id: org.orgCode,
        orgCode: org.orgCode,
        orgName: org.orgName,
        hqCode: org.hqCode,
        hqName: org.hqName,
        orgType: org.orgType || '',
        status: org.isActive === 'Y' ? 'ACTIVE' : 'INACTIVE',
        isActive: org.isActive === 'Y',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      setOrganizations(mappedOrganizations);
      setTotalCount(mappedOrganizations.length);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '조직 검색 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error('조직 목록을 불러오는데 실패했습니다.');
      setOrganizations([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 검색 결과 초기화
   */
  const clearResults = useCallback(() => {
    setOrganizations([]);
    setTotalCount(0);
    setError(undefined);
  }, []);

  return {
    organizations,
    loading,
    error,
    searchOrganizations,
    clearResults,
    totalCount
  };
};
