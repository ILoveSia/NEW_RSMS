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
 * 책무 정보 (V007 마이그레이션 반영)
 */
export interface ResponsibilityInfo {
  responsibilityCd: string;       // 책무코드 (PK, 업무코드 - 예: "20250001RM0001")
  responsibilityCat: string;      // 책무카테고리
  responsibilityInfo: string;     // 책무내용
  responsibilityDetailInfo: string | null; // 책무세부내용 (responsibility_details 테이블)
  responsibilityLegal: string;    // 책무관련근거
}

/**
 * 책무세부 정보 (V007 마이그레이션 반영)
 */
export interface ResponsibilityDetailInfo {
  responsibilityDetailCd: string; // 책무세부코드 (PK, 업무코드 - 예: "RM0001D0001")
  responsibilityCd: string;       // 책무코드 (FK)
  responsibilityDetailInfo: string; // 책무세부내용
}

/**
 * 관리의무 정보 (V007 마이그레이션 반영)
 */
export interface ManagementObligationInfo {
  obligationCd: string;             // 관리의무코드 (PK, 업무코드 - 예: "RM0001D0001MO0001")
  responsibilityDetailCd: string;   // 책무세부코드 (FK)
  obligationMajorCatCd: string;     // 관리의무 대분류
  obligationInfo: string;           // 관리의무내용
  orgCode: string;                  // 조직코드
}

/**
 * 직책 책무기술서 데이터 (9개 필드)
 */
export interface PositionResponsibilityData {
  isConcurrent: string;                              // 1. 겸직여부 (Y/N)
  positionAssignedDate: string | null;               // 2. 현 직책 부여일
  concurrentPosition: string | null;                 // 3. 겸직사항
  employeeNo: string | null;                         // 3-1. 직원번호 (사번)
  employeeName: string | null;                       // 3-2. 직원명
  departments: string;                               // 4. 소관부서 (콤마 구분, 한줄)
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
    `/responsibility-docs/position/${positionId}/data`
  );
  return response.data;
};

/**
 * 책무기술서 생성 요청 DTO
 */
export interface CreateResponsibilityDocRequest {
  ledgerOrderId: string;              // 원장차수ID
  positionId: number;                 // 직책ID
  arbitraryPosition: {
    positionName: string;             // 임의직책명
    positionTitle: string;            // 직책타이틀
    isDual: boolean;                  // 겸직여부
    employeeName: string;             // 직원명
    employeeNo?: string;              // 직원번호
    userId?: string;                  // 사용자ID (로그인자ID)
    currentPositionDate: string;      // 현 직책 부여일
    dualPositionDetails?: string;     // 겸직사항
    responsibleDepts: string;         // 소관부서
  };
  mainCommittees: Array<{
    committeeName: string;            // 회의체명
    chairperson: string;              // 위원장
    frequency: string;                // 개최주기
    mainAgenda: string;               // 주요안건
  }>;
  responsibilityOverview: string;     // 책무개요
  responsibilityBackground?: string;  // 책무배경
  responsibilityBackgroundDate: string; // 책무배분일
  responsibilities: Array<{
    seq: number;                      // 순번
    responsibility: string;           // 책무
    responsibilityDetail: string;     // 책무세부
    relatedBasis: string;             // 관련근거
  }>;
  managementDuties: Array<{
    seq: number;                      // 순번
    managementDuty: string;           // 관리의무
    managementDutyDetail: string;     // 관리의무세부
    relatedBasis: string;             // 관련근거
  }>;
}

/**
 * 책무기술서 수정 요청 DTO
 */
export interface UpdateResponsibilityDocRequest extends CreateResponsibilityDocRequest {}

/**
 * 주관회의체 응답 DTO
 */
export interface MainCommitteeResponse {
  id: string;
  committeeName: string;
  chairperson: string;
  frequency: string;
  mainAgenda: string;
}

/**
 * 책무기술서 응답 DTO (resp_statement_execs 테이블 전체 컬럼)
 */
export interface ResponsibilityDocResponse {
  // 기본키
  respStmtExecId: string;                       // resp_stmt_exec_id (PK)

  // 외래키
  positionsId: number;                          // positions_id (FK)
  ledgerOrderId: string;                        // ledger_order_id (FK)
  positionName: string;                         // 직책명 (positions 테이블 JOIN)

  // 기본 정보
  userId: string;                               // user_id
  executiveName: string;                        // executive_name
  employeeNo?: string;                          // employee_no
  positionAssignedDate?: string;                // position_assigned_date
  concurrentPosition?: string;                  // concurrent_position
  actingOfficerInfo?: string;                   // acting_officer_info
  remarks?: string;                             // remarks

  // 책무기술서 정보
  responsibilityOverview?: string;              // responsibility_overview
  responsibilityAssignedDate?: string;          // responsibility_assigned_date

  // 상태 정보
  isActive: string;                             // is_active ('Y', 'N')

  // 공통 컬럼
  createdAt: string;                            // created_at
  createdBy: string;                            // created_by
  updatedAt: string;                            // updated_at
  updatedBy: string;                            // updated_by
}

/**
 * 책무기술서 생성
 *
 * @param data 책무기술서 생성 데이터
 * @returns 생성된 책무기술서 정보
 */
export const createResponsibilityDoc = async (
  data: CreateResponsibilityDocRequest
): Promise<ResponsibilityDocResponse> => {
  try {
    const response = await apiClient.post<ResponsibilityDocResponse>(
      '/responsibility-docs',
      data
    );
    return response.data;
  } catch (error) {
    console.error('책무기술서 생성 실패:', error);
    throw error;
  }
};

/**
 * 책무기술서 수정
 *
 * @param id 책무기술서 ID
 * @param data 책무기술서 수정 데이터
 * @returns 수정된 책무기술서 정보
 */
export const updateResponsibilityDoc = async (
  id: string,
  data: UpdateResponsibilityDocRequest
): Promise<ResponsibilityDocResponse> => {
  try {
    const response = await apiClient.put<ResponsibilityDocResponse>(
      `/responsibility-docs/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('책무기술서 수정 실패:', error);
    throw error;
  }
};

/**
 * 책무기술서 삭제
 *
 * @param id 책무기술서 ID
 */
export const deleteResponsibilityDoc = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/responsibility-docs/${id}`);
  } catch (error) {
    console.error('책무기술서 삭제 실패:', error);
    throw error;
  }
};

/**
 * 책무기술서 목록 조회
 *
 * @param params 조회 파라미터
 * @returns 책무기술서 목록
 */
export const getResponsibilityDocs = async (params?: {
  ledgerOrderId?: string;
  positionName?: string;
  status?: string;
  isActive?: boolean;
  approvalStatus?: string;
  page?: number;
  size?: number;
}): Promise<{
  content: ResponsibilityDocResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> => {
  try {
    const response = await apiClient.get('/responsibility-docs', { params });
    return response.data;
  } catch (error) {
    console.error('책무기술서 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 책무기술서 상세 조회
 *
 * @param id 책무기술서 ID
 * @returns 책무기술서 상세 정보
 */
export const getResponsibilityDocById = async (
  id: string
): Promise<ResponsibilityDocResponse> => {
  try {
    const response = await apiClient.get<ResponsibilityDocResponse>(
      `/responsibility-docs/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('책무기술서 상세 조회 실패:', error);
    throw error;
  }
};
