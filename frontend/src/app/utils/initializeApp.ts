/**
 * 애플리케이션 통합 초기화 유틸리티
 * - 로그인 후 필요한 모든 정보를 한 번에 로드
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import { useAuthStore } from '@/app/store/authStore';
import { useMenuStore } from '@/app/store/menuStore';
import { useCodeStore } from '@/app/store/codeStore';
import { useOrganizationStore } from '@/app/store/organizationStore';

/**
 * 로그인 후 필요한 모든 정보 로드
 * - 공통코드
 * - 조직 데이터
 * - 메뉴 계층 구조
 * - 권한 정보 (이미 authStore에 저장됨)
 *
 * @returns Promise<boolean> 성공 여부
 */
export const initializeAppData = async (): Promise<boolean> => {
  console.log('[initializeAppData] 애플리케이션 데이터 초기화 시작...');

  try {
    const { fetchMenus } = useMenuStore.getState();
    const { fetchAllCodes } = useCodeStore.getState();
    const { fetchOrganizations } = useOrganizationStore.getState();

    // 병렬로 데이터 로드 (성능 최적화)
    const results = await Promise.allSettled([
      fetchAllCodes(),         // 공통코드 로드
      fetchOrganizations(),    // 조직 데이터 로드
      fetchMenus(),            // 메뉴 로드
    ]);

    // 결과 확인
    const [codesResult, organizationsResult, menusResult] = results;

    if (codesResult.status === 'rejected') {
      console.error('[initializeAppData] 공통코드 로드 실패:', codesResult.reason);
    } else {
      console.log('[initializeAppData] 공통코드 로드 성공');
    }

    if (organizationsResult.status === 'rejected') {
      console.error('[initializeAppData] 조직 데이터 로드 실패:', organizationsResult.reason);
    } else {
      console.log('[initializeAppData] 조직 데이터 로드 성공');
    }

    if (menusResult.status === 'rejected') {
      console.error('[initializeAppData] 메뉴 로드 실패:', menusResult.reason);
    } else {
      console.log('[initializeAppData] 메뉴 로드 성공');
    }

    // 하나라도 성공하면 true 반환 (부분 성공 허용)
    const success = results.some(result => result.status === 'fulfilled');

    if (success) {
      console.log('[initializeAppData] 애플리케이션 데이터 초기화 완료');
    } else {
      console.error('[initializeAppData] 모든 데이터 로드 실패');
    }

    return success;

  } catch (error) {
    console.error('[initializeAppData] 애플리케이션 데이터 초기화 실패:', error);
    return false;
  }
};

/**
 * 로그아웃 시 모든 스토어 초기화
 */
export const clearAppData = (): void => {
  console.log('[clearAppData] 애플리케이션 데이터 초기화 중...');

  const { reset: resetAuth } = useAuthStore.getState();
  const { reset: resetMenu } = useMenuStore.getState();
  const { reset: resetCode } = useCodeStore.getState();
  const { reset: resetOrganization } = useOrganizationStore.getState();

  resetAuth();
  resetMenu();
  resetCode();
  resetOrganization();

  console.log('[clearAppData] 애플리케이션 데이터 초기화 완료');
};

/**
 * 공통코드 헬퍼 함수 - 편리하게 사용하기 위한 유틸리티
 */
export const getCodeName = (groupCode: string, detailCode: string): string => {
  const { getCodeName } = useCodeStore.getState();
  return getCodeName(groupCode, detailCode);
};

export const getCodeDetails = (groupCode: string) => {
  const { getCodeDetails } = useCodeStore.getState();
  return getCodeDetails(groupCode);
};

export const getCodeDetail = (groupCode: string, detailCode: string) => {
  const { getCodeDetail } = useCodeStore.getState();
  return getCodeDetail(groupCode, detailCode);
};

/**
 * 조직 헬퍼 함수 - 편리하게 사용하기 위한 유틸리티
 */
export const getOrganizationName = (orgCode: string): string => {
  const { getOrganizationByCode } = useOrganizationStore.getState();
  const org = getOrganizationByCode(orgCode);
  return org ? org.orgName : orgCode;
};

export const getOrganizationsByType = (orgType: string) => {
  const { getOrganizationsByType } = useOrganizationStore.getState();
  return getOrganizationsByType(orgType);
};

export const getOrganizationsByHqCode = (hqCode: string) => {
  const { getOrganizationsByHqCode } = useOrganizationStore.getState();
  return getOrganizationsByHqCode(hqCode);
};
