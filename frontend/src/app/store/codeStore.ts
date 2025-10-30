/**
 * 공통코드 상태 관리 스토어 (Zustand)
 * 로그인 시 한 번만 로드하여 전역에서 사용
 *
 * @author RSMS Development Team
 * @since 1.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  getAllActiveCodeGroupsApi,
  getCodeGroupWithDetailsApi,
  CommonCodeGroup,
  CommonCodeDetail,
} from '@/domains/system/api/codeApi';

// Code Store Interface
interface CodeStore {
  // State
  codeGroups: CommonCodeGroup[];
  codeDetails: CommonCodeDetail[]; // 모든 상세코드를 flat하게 저장
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;

  // Actions
  setCodeGroups: (groups: CommonCodeGroup[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAllCodes: () => Promise<void>;
  reset: () => void;

  // Helper functions
  getCodeGroup: (groupCode: string) => CommonCodeGroup | undefined;
  getCodeDetails: (groupCode: string) => CommonCodeDetail[];
  getCodeDetail: (groupCode: string, detailCode: string) => CommonCodeDetail | undefined;
  getCodeName: (groupCode: string, detailCode: string) => string;
  getAllCodeDetails: () => CommonCodeDetail[]; // 모든 상세코드 조회
}

// Initial state
const initialState = {
  codeGroups: [],
  codeDetails: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

// Code store
export const useCodeStore = create<CodeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Actions
        setCodeGroups: (codeGroups) => {
          // 모든 상세코드를 flat하게 추출
          const allCodeDetails: CommonCodeDetail[] = [];
          codeGroups.forEach((group) => {
            if (group.details && group.details.length > 0) {
              allCodeDetails.push(...group.details);
            }
          });

          set(
            {
              codeGroups,
              codeDetails: allCodeDetails,
              lastFetchedAt: new Date().toISOString(),
            },
            false,
            'setCodeGroups'
          );
        },

        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

        setError: (error) => set({ error }, false, 'setError'),

        fetchAllCodes: async () => {
          set({ isLoading: true, error: null }, false, 'fetchAllCodes:start');

          try {
            const codeGroups = await getAllActiveCodeGroupsApi();

            // 모든 상세코드를 flat하게 추출하여 저장
            const allCodeDetails: CommonCodeDetail[] = [];
            codeGroups.forEach((group) => {
              if (group.details && group.details.length > 0) {
                allCodeDetails.push(...group.details);
              }
            });

            console.log('[CodeStore] 공통코드 조회 완료:', {
              그룹수: codeGroups.length,
              상세코드수: allCodeDetails.length
            });

            set(
              {
                codeGroups,
                codeDetails: allCodeDetails,
                isLoading: false,
                error: null,
                lastFetchedAt: new Date().toISOString(),
              },
              false,
              'fetchAllCodes:success'
            );
          } catch (err: any) {
            console.error('공통코드 조회 에러:', err);

            const errorMessage =
              err.response?.data?.message ||
              err.message ||
              '공통코드를 불러오는데 실패했습니다';

            set(
              {
                isLoading: false,
                error: errorMessage,
              },
              false,
              'fetchAllCodes:error'
            );
          }
        },

        reset: () => set(initialState, false, 'reset'),

        // Helper functions
        getCodeGroup: (groupCode: string) => {
          const state = get();
          return state.codeGroups.find((group) => group.groupCode === groupCode);
        },

        getCodeDetails: (groupCode: string) => {
          const state = get();
          const group = state.codeGroups.find((g) => g.groupCode === groupCode);
          return group?.details || [];
        },

        getCodeDetail: (groupCode: string, detailCode: string) => {
          const state = get();
          const group = state.codeGroups.find((g) => g.groupCode === groupCode);
          return group?.details?.find((detail) => detail.detailCode === detailCode);
        },

        getCodeName: (groupCode: string, detailCode: string) => {
          const state = get();
          const detail = state.getCodeDetail(groupCode, detailCode);
          return detail?.detailName || detailCode;
        },

        getAllCodeDetails: () => {
          const state = get();
          return state.codeDetails;
        },
      }),
      {
        name: 'rsms-code-store',
        partialize: (state) => ({
          codeGroups: state.codeGroups,
          codeDetails: state.codeDetails,
          lastFetchedAt: state.lastFetchedAt,
        }),
      }
    ),
    { name: 'CodeStore' }
  )
);
