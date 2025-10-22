/**
 * Organizations API 서비스
 *
 * @description 조직(본부, 부서, 영업점) 관리 REST API 통신 모듈
 * - 본부코드(hq_code) 조건으로 부서 목록 조회
 * - 백엔드 API 실패 시 개발 환경에서는 Mock 데이터 제공
 *
 * @author Claude AI
 * @since 2025-10-21
 */

import axios from 'axios';

const API_BASE_URL = '/api/organizations';

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
// Mock 데이터 (개발 환경용)
// ===============================

const MOCK_DEPARTMENTS: DepartmentDto[] = [
  {
    orgCode: 'DEPT001',
    orgName: '서울경영전략부',
    hqCode: '1010',
    orgType: 'dept',
    isActive: 'Y'
  },
  {
    orgCode: 'DEPT002',
    orgName: '부산경영전략부',
    hqCode: '1010',
    orgType: 'dept',
    isActive: 'Y'
  },
  {
    orgCode: 'DEPT003',
    orgName: '대구리스크관리부',
    hqCode: '1011',
    orgType: 'dept',
    isActive: 'Y'
  },
  {
    orgCode: 'DEPT004',
    orgName: '인천디지털IT부',
    hqCode: '1017',
    orgType: 'dept',
    isActive: 'Y'
  },
  {
    orgCode: 'BRANCH001',
    orgName: '강남영업점',
    hqCode: '1010',
    orgType: 'branch',
    isActive: 'Y'
  },
  {
    orgCode: 'BRANCH002',
    orgName: '서초영업점',
    hqCode: '1010',
    orgType: 'branch',
    isActive: 'Y'
  },
  {
    orgCode: 'BRANCH003',
    orgName: '분당지점',
    hqCode: '1011',
    orgType: 'branch',
    isActive: 'Y'
  },
  {
    orgCode: 'BRANCH004',
    orgName: '판교출장소',
    hqCode: '1017',
    orgType: 'branch',
    isActive: 'Y'
  }
];

// ===============================
// API 함수
// ===============================

/**
 * 본부코드별 부서 목록 조회
 * - hq_code 조건으로 부서 및 영업점 조회
 * - isActive='Y' 인 데이터만 조회
 * - 백엔드 API 실패 시 Mock 데이터 반환 (개발 환경)
 *
 * @param hqCode 본부코드 (common_code_details의 DPRM_CD 그룹)
 * @returns Promise<DepartmentDto[]> 부서 목록
 * @throws Error API 호출 실패 시 (운영 환경)
 */
export const getDepartmentsByHqCode = async (hqCode: string): Promise<DepartmentDto[]> => {
  try {
    const response = await axios.get<DepartmentDto[]>(`${API_BASE_URL}/by-hq/${hqCode}`);
    return response.data;
  } catch (error) {
    // API 실패 시 Mock 데이터 반환 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`백엔드 API를 사용할 수 없어 Mock 데이터를 반환합니다. (hqCode: ${hqCode})`);

      // 실제 API 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));

      // hqCode 조건으로 필터링
      return MOCK_DEPARTMENTS.filter(dept => dept.hqCode === hqCode);
    }

    if (axios.isAxiosError(error)) {
      console.error('부서 목록 조회 실패:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '부서 목록을 조회하는데 실패했습니다.');
    }
    throw error;
  }
};

/**
 * 모든 조직 조회
 */
export const getAllOrganizations = async (): Promise<Organization[]> => {
  const response = await axios.get<Organization[]>(API_BASE_URL);
  return response.data;
};

/**
 * 조직 단건 조회
 */
export const getOrganization = async (orgCode: string): Promise<Organization> => {
  const response = await axios.get<Organization>(`${API_BASE_URL}/${orgCode}`);
  return response.data;
};

/**
 * 조직 유형별 조회
 */
export const getOrganizationsByType = async (orgType: OrgType): Promise<Organization[]> => {
  const response = await axios.get<Organization[]>(`${API_BASE_URL}/type/${orgType}`);
  return response.data;
};

/**
 * 활성 조직 조회
 */
export const getActiveOrganizations = async (): Promise<Organization[]> => {
  const response = await axios.get<Organization[]>(`${API_BASE_URL}/active`);
  return response.data;
};
