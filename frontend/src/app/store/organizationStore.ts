/**
 * 조직 데이터 전역 상태 관리 Store (Zustand)
 *
 * @description
 * - 로그인 시 모든 활성 조직 데이터를 한 번에 로드
 * - 세션 동안 조직 데이터 캐싱 (API 호출 최소화)
 * - persist 미들웨어로 브라우저 새로고침 시에도 데이터 유지
 *
 * @author Claude AI
 * @since 2025-10-29
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getActiveOrganizations,
  type Organization
} from '@/domains/resps/api/organizationsApi';

/**
 * 조직 Store 상태 타입
 */
interface OrganizationStore {
  // 상태
  organizations: Organization[];           // 모든 활성 조직 목록
  isLoading: boolean;                      // 로딩 상태
  error: string | null;                    // 에러 메시지
  lastFetchedAt: string | null;           // 마지막 조회 시간

  // 액션
  fetchOrganizations: () => Promise<void>;                     // 조직 목록 조회
  getOrganizationByCode: (orgCode: string) => Organization | undefined;  // 단건 조회
  getOrganizationsByType: (orgType: string) => Organization[]; // 유형별 조회
  getOrganizationsByHqCode: (hqCode: string) => Organization[]; // 본부별 조회
  reset: () => void;                                           // 상태 초기화
}

/**
 * 초기 상태
 */
const initialState = {
  organizations: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null
};

/**
 * 조직 Store 생성
 */
export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * 활성 조직 목록 조회 (로그인 시 호출)
       */
      fetchOrganizations: async () => {
        console.log('[organizationStore] 조직 목록 조회 시작...');
        set({ isLoading: true, error: null });

        try {
          const organizations = await getActiveOrganizations();
          console.log(`[organizationStore] 조직 목록 조회 성공: ${organizations.length}개`);

          set({
            organizations,
            isLoading: false,
            error: null,
            lastFetchedAt: new Date().toISOString()
          });
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || '조직 목록 조회 실패';
          console.error('[organizationStore] 조직 목록 조회 실패:', errorMessage);

          set({
            organizations: [],
            isLoading: false,
            error: errorMessage,
            lastFetchedAt: null
          });
        }
      },

      /**
       * 조직코드로 단건 조회
       * @param orgCode 조직코드
       * @returns Organization | undefined
       */
      getOrganizationByCode: (orgCode: string) => {
        const { organizations } = get();
        return organizations.find(org => org.orgCode === orgCode);
      },

      /**
       * 조직 유형별 조회
       * @param orgType 조직유형 ('head', 'dept', 'branch')
       * @returns Organization[]
       */
      getOrganizationsByType: (orgType: string) => {
        const { organizations } = get();
        return organizations.filter(org => org.orgType === orgType);
      },

      /**
       * 본부코드별 조직 조회
       * @param hqCode 본부코드
       * @returns Organization[]
       */
      getOrganizationsByHqCode: (hqCode: string) => {
        const { organizations } = get();
        return organizations.filter(org => org.hqCode === hqCode);
      },

      /**
       * 상태 초기화 (로그아웃 시 호출)
       */
      reset: () => {
        console.log('[organizationStore] 상태 초기화');
        set(initialState);
      }
    }),
    {
      name: 'rsms-organization-store',  // localStorage 키
      partialize: (state) => ({
        organizations: state.organizations,
        lastFetchedAt: state.lastFetchedAt
      })
    }
  )
);

/**
 * 조직명 조회 헬퍼 함수
 * @param orgCode 조직코드
 * @returns 조직명 또는 orgCode (없으면 원본 반환)
 */
export const getOrganizationName = (orgCode: string): string => {
  const { getOrganizationByCode } = useOrganizationStore.getState();
  const org = getOrganizationByCode(orgCode);
  return org ? org.orgName : orgCode;
};

/**
 * 본부명 조회 헬퍼 함수 (본부 타입 조직 중에서 검색)
 * @param hqCode 본부코드
 * @returns 본부명 또는 hqCode (없으면 원본 반환)
 */
export const getHeadquarterName = (hqCode: string): string => {
  const { organizations } = useOrganizationStore.getState();
  const hq = organizations.find(org => org.orgCode === hqCode && org.orgType === 'head');
  return hq ? hq.orgName : hqCode;
};
