/**
 * 책무기술서 API
 * - 직책 선택 시 필요한 데이터를 조회하는 API
 *
 * @author RSMS
 * @since 2025-10-29
 */

import apiClient from '@/shared/api/apiClient';

/**
 * 주관회의체 정보
 */
export interface CommitteeInfo {
  committeesId: number;           // 회의체ID
  committeesTitle: string;        // 회의체명
  committeeFrequency: string;     // 개최주기
  resolutionMatters: string;      // 주요심의 의결사항
  committeesType: string;         // 위원장/위원 구분
}

/**
 * 책무 정보
 */
export interface ResponsibilityInfo {
  responsibilityId: number;       // 책무ID
  responsibilityCat: string;      // 책무카테고리
  responsibilityCd: string;       // 책무코드
  responsibilityInfo: string;     // 책무내용
  responsibilityDetailInfo: string | null; // 책무세부내용 (responsibility_details 테이블)
  responsibilityLegal: string;    // 책무관련근거
}

/**
 * 관리의무 정보
 */
export interface ManagementObligationInfo {
  managementObligationId: number;       // 관리의무ID
  responsibilityId: number;             // 책무ID (연관관계)
  obligationMajorCatCd: string;         // 관리의무 대분류
  obligationMiddleCatCd: string;        // 관리의무 중분류
  obligationCd: string;                 // 관리의무코드
  obligationInfo: string;               // 관리의무내용
  orgCode: string;                      // 조직코드
}

/**
 * 직책 책무기술서 데이터 (7개 필드)
 */
export interface PositionResponsibilityData {
  isConcurrent: string;                              // 1. 겸직여부 (Y/N)
  positionAssignedDate: string | null;               // 2. 현 직책 부여일
  concurrentPosition: string | null;                 // 3. 겸직사항
  departments: string;                               // 4. 소관부점 (콤마 구분, 한줄)
  committees: CommitteeInfo[];                       // 5. 주관회의체 목록
  responsibilities: ResponsibilityInfo[];            // 6. 책무목록
  managementObligations: ManagementObligationInfo[]; // 7. 관리의무 목록
}

/**
 * 직책ID로 책무기술서 관련 전체 데이터 조회
 * - 7개 필드를 한번에 조회
 *
 * @param positionId 직책ID
 * @returns 책무기술서 관련 전체 데이터
 */
export const getPositionResponsibilityData = async (
  positionId: number
): Promise<PositionResponsibilityData> => {
  const response = await apiClient.get<PositionResponsibilityData>(
    `/api/responsibility-docs/position/${positionId}/data`
  );
  return response.data;
};
