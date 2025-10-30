/**
 * 조직 조회 및 변환 Hook
 *
 * @description
 * - rsms-organization-store에서 조직 데이터를 조회하고 UI 컴포넌트에서 사용하기 쉽게 변환
 * - 콤보박스, 셀렉트박스에서 재사용 가능
 * - useCommonCode와 동일한 패턴으로 설계
 *
 * @example
 * // 기본 사용 (SelectBox용)
 * const { options } = useOrganization();
 * <Select>
 *   {options.map(opt => <MenuItem value={opt.value}>{opt.label}</MenuItem>)}
 * </Select>
 *
 * @example
 * // 유형별 조회 (부서만)
 * const { options } = useOrganization({ orgType: 'dept' });
 *
 * @example
 * // 본부별 조회
 * const { options } = useOrganization({ hqCode: '1010' });
 *
 * @example
 * // 조직코드 → 조직명 변환
 * const { getOrgName } = useOrganization();
 * const orgName = getOrgName('DEPT001'); // "서울경영전략부"
 *
 * @example
 * // 전체 옵션 포함
 * const { optionsWithAll } = useOrganization({ allLabel: '전체 조직' });
 *
 * @author Claude AI
 * @since 2025-10-29
 */

import { useMemo } from 'react';
import { useOrganizationStore, type Organization } from '@/app/store/organizationStore';

/**
 * 옵션 타입 (SelectBox, ComboBox 등에서 사용)
 */
export interface OrgOption {
  /** 조직코드 (orgCode) */
  value: string;
  /** 조직명 (orgName) */
  label: string;
  /** 원본 조직 객체 (필요시 사용) */
  org?: Organization;
}

/**
 * useOrganization 필터 옵션
 */
export interface UseOrganizationOptions {
  /** 조직 유형 필터 ('head', 'dept', 'branch') */
  orgType?: string;
  /** 본부코드 필터 */
  hqCode?: string;
  /** "전체" 옵션 라벨 (기본값: '전체') */
  allLabel?: string;
}

/**
 * useOrganization 반환 타입
 */
export interface UseOrganizationReturn {
  /** 원본 조직 목록 (필터 적용됨) */
  organizations: Organization[];
  /** SelectBox/ComboBox용 옵션 목록 */
  options: OrgOption[];
  /** "전체" 옵션이 포함된 옵션 목록 */
  optionsWithAll: OrgOption[];
  /** 조직코드 → 조직명 변환 함수 */
  getOrgName: (orgCode: string) => string;
  /** 조직명 → 조직코드 변환 함수 */
  getOrgCode: (orgName: string) => string;
  /** 특정 조직 존재 여부 확인 */
  hasOrg: (orgCode: string) => boolean;
  /** 조직코드로 조직 객체 조회 */
  getOrganization: (orgCode: string) => Organization | undefined;
}

/**
 * 조직 조회 및 변환 Hook
 *
 * @param filterOptions 필터 옵션
 * @returns 조직 관련 데이터 및 유틸 함수
 */
export const useOrganization = (
  filterOptions: UseOrganizationOptions = {}
): UseOrganizationReturn => {
  const { orgType, hqCode, allLabel = '전체' } = filterOptions;

  // rsms-organization-store에서 데이터 조회
  const allOrganizations = useOrganizationStore((state) => state.organizations);
  const getOrganizationByCode = useOrganizationStore((state) => state.getOrganizationByCode);
  const getOrganizationsByType = useOrganizationStore((state) => state.getOrganizationsByType);
  const getOrganizationsByHqCode = useOrganizationStore((state) => state.getOrganizationsByHqCode);

  // 필터 적용된 조직 목록
  const organizations = useMemo<Organization[]>(() => {
    let filtered = allOrganizations;

    // 조직 유형 필터
    if (orgType) {
      filtered = getOrganizationsByType(orgType);
    }

    // 본부코드 필터
    if (hqCode) {
      filtered = hqCode
        ? filtered.filter(org => org.hqCode === hqCode)
        : filtered;
    }

    return filtered;
  }, [allOrganizations, orgType, hqCode, getOrganizationsByType]);

  // SelectBox/ComboBox용 옵션 목록
  const options = useMemo<OrgOption[]>(() => {
    return organizations.map(org => ({
      value: org.orgCode,
      label: org.orgName,
      org
    }));
  }, [organizations]);

  // "전체" 옵션이 포함된 옵션 목록
  const optionsWithAll = useMemo<OrgOption[]>(() => {
    return [
      { value: '', label: allLabel },
      ...options
    ];
  }, [options, allLabel]);

  // 조직코드 → 조직명 변환
  const getOrgName = useMemo(() => {
    return (orgCode: string): string => {
      const org = getOrganizationByCode(orgCode);
      return org ? org.orgName : orgCode;
    };
  }, [getOrganizationByCode]);

  // 조직명 → 조직코드 변환
  const getOrgCode = useMemo(() => {
    return (orgName: string): string => {
      const org = organizations.find(o => o.orgName === orgName);
      return org ? org.orgCode : orgName;
    };
  }, [organizations]);

  // 특정 조직 존재 여부 확인
  const hasOrg = useMemo(() => {
    return (orgCode: string): boolean => {
      return organizations.some(o => o.orgCode === orgCode);
    };
  }, [organizations]);

  // 조직코드로 조직 객체 조회
  const getOrganization = useMemo(() => {
    return (orgCode: string): Organization | undefined => {
      return getOrganizationByCode(orgCode);
    };
  }, [getOrganizationByCode]);

  return {
    organizations,
    options,
    optionsWithAll,
    getOrgName,
    getOrgCode,
    hasOrg,
    getOrganization
  };
};

/**
 * 본부 목록 조회 전용 Hook
 *
 * @example
 * const { options } = useHeadquarters();
 */
export const useHeadquarters = (allLabel: string = '전체'): UseOrganizationReturn => {
  return useOrganization({ orgType: 'head', allLabel });
};

/**
 * 부서 목록 조회 전용 Hook
 *
 * @example
 * const { options } = useDepartments({ hqCode: '1010' });
 */
export const useDepartments = (
  hqCode?: string,
  allLabel: string = '전체'
): UseOrganizationReturn => {
  return useOrganization({ orgType: 'dept', hqCode, allLabel });
};

/**
 * 영업점 목록 조회 전용 Hook
 *
 * @example
 * const { options } = useBranches({ hqCode: '1010' });
 */
export const useBranches = (
  hqCode?: string,
  allLabel: string = '전체'
): UseOrganizationReturn => {
  return useOrganization({ orgType: 'branch', hqCode, allLabel });
};
