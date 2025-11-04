/**
 * Organizations API 서비스
 *
 * @description 조직(본부, 부서, 영업점) 관리 REST API 통신 모듈
 * - 본부코드(hq_code) 조건으로 부서 목록 조회
 *
 * @author Claude AI
 * @since 2025-10-21
 */

import apiClient from '@/shared/api/apiClient';

// ===============================
// 타입 정의
// ===============================

/**
 * 조직 타입
 * - head: 본부
 * - dept: 부서
 * - branch: 영업점/지점
 */
export type OrgType = 'head' | 'dept' | 'branch';

/**
 * 조직 엔티티 (Organizations 테이블)
 */
export interface Organization {
  orgCode: string;              // 조직코드 (PK)
  hqCode: string;               // 본부코드 (FK)
  orgType: OrgType;             // 조직유형
  orgName: string;              // 조직명
  isActive: string;             // 사용여부 ('Y', 'N')
  isBranchOffice: string;       // 출장소여부 ('Y', 'N')
  isClosed: string;             // 폐쇄여부 ('Y', 'N')
  closedDate?: string;          // 폐쇄일자
  createdBy: string;            // 생성자
  createdAt: string;            // 생성일시
  updatedBy: string;            // 수정자
  updatedAt: string;            // 수정일시
}

/**
 * 부서 목록 조회용 DTO (간소화)
 */
export interface DepartmentDto {
  orgCode: string;              // 조직코드
  orgName: string;              // 조직명
  hqCode: string;               // 본부코드
  orgType: OrgType;             // 조직유형
  isActive: string;             // 사용여부
}

// ===============================
// API 함수
// ===============================

/**
 * 본부코드별 부서 목록 조회
 * - hq_code 조건으로 부서 및 영업점 조회
 * - isActive='Y' 인 데이터만 조회
 *
 * @param hqCode 본부코드 (common_code_details의 DPRM_CD 그룹)
 * @returns Promise<DepartmentDto[]> 부서 목록
 * @throws Error API 호출 실패 시
 */
export const getDepartmentsByHqCode = async (hqCode: string): Promise<DepartmentDto[]> => {
  try {
    const response = await apiClient.get<DepartmentDto[]>(`/organizations/by-hq/${hqCode}`);
    return response.data;
  } catch (error: unknown) {
    console.error('부서 목록 조회 실패:', error);
    throw new Error('부서 목록을 조회하는데 실패했습니다.');
  }
};

/**
 * 모든 조직 조회
 */
export const getAllOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/organizations');
  return response.data;
};

/**
 * 조직 단건 조회
 */
export const getOrganization = async (orgCode: string): Promise<Organization> => {
  const response = await apiClient.get<Organization>(`/organizations/${orgCode}`);
  return response.data;
};

/**
 * 조직 유형별 조회
 */
export const getOrganizationsByType = async (orgType: OrgType): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>(`/organizations/type/${orgType}`);
  return response.data;
};

/**
 * 활성 조직 조회
 */
export const getActiveOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/organizations/active');
  return response.data;
};
