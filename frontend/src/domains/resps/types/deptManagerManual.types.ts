/**
 * 부서장업무메뉴얼 타입 정의
 * - Backend DeptManagerManualDto와 매핑
 *
 * @author Claude AI
 * @since 2025-01-18
 */

/**
 * 부서장업무메뉴얼 DTO (Backend 응답)
 * - 관계 테이블 정보 포함 (responsibilities, responsibility_details, management_obligations, organizations)
 */
export interface DeptManagerManualDto {
  // ===============================
  // 기본 정보
  // ===============================
  manualCd: string;                 // 메뉴얼코드 (PK)
  ledgerOrderId: string;            // 원장차수ID (FK)
  obligationCd: string;             // 관리의무코드 (FK)
  orgCode: string;                  // 조직코드 (FK)

  // ===============================
  // 관리활동 기본정보
  // ===============================
  respItem: string;                 // 책무관리항목
  activityName: string;             // 관리활동명

  // ===============================
  // 수행 정보
  // ===============================
  executorId?: string;              // 수행자ID
  executionDate?: string;           // 수행일자 (ISO Date string)
  executionStatus?: string;         // 수행상태 (01:미수행, 02:수행완료)
  executionStatusName?: string;     // 수행상태명
  executionResultCd?: string;       // 수행결과코드 (01:적정, 02:부적정)
  executionResultName?: string;     // 수행결과명
  executionResultContent?: string;  // 수행결과내용

  // ===============================
  // 수행점검 정보
  // ===============================
  execCheckMethod?: string;         // 점검항목
  execCheckDetail?: string;         // 점검세부내용
  execCheckFrequencyCd?: string;    // 점검주기 (FLFL_ISPC_FRCD)
  execCheckFrequencyName?: string;  // 점검주기명

  // ===============================
  // 상태 관리
  // ===============================
  isActive: string;                 // 사용여부 (Y/N)
  status?: string;                  // 상태 (active/inactive)

  // ===============================
  // 감사 필드
  // ===============================
  createdAt?: string;               // 생성일시
  createdBy?: string;               // 생성자
  updatedAt?: string;               // 수정일시
  updatedBy?: string;               // 수정자
  approvedAt?: string;              // 승인일시
  approvedBy?: string;              // 승인자
  remarks?: string;                 // 비고

  // ===============================
  // 관계 테이블 정보 (JOIN)
  // ===============================
  responsibilityCat?: string;       // 책무구분 (responsibilities.responsibility_cat)
  responsibilityInfo?: string;      // 책무 (responsibilities.responsibility_info)
  responsibilityDetailInfo?: string;// 책무상세 (responsibility_details.responsibility_detail_info)
  obligationInfo?: string;          // 관리의무 (management_obligations.obligation_info)
  orgName?: string;                 // 부점명 (organizations.org_name)
}

/**
 * 부서장업무메뉴얼 생성 요청
 */
export interface CreateDeptManagerManualRequest {
  // ===============================
  // 기본 정보 (필수)
  // ===============================
  ledgerOrderId: string;            // 원장차수ID (필수)
  obligationCd: string;             // 관리의무코드 (필수)
  orgCode: string;                  // 조직코드 (필수)

  // ===============================
  // 관리활동 기본정보 (필수)
  // ===============================
  respItem: string;                 // 책무관리항목(필수)
  activityName: string;             // 관리활동명 (필수)

  // ===============================
  // 수행 정보 (선택)
  // ===============================
  executorId?: string;              // 수행자ID
  executionDate?: string;           // 수행일자 (ISO Date string)
  executionStatus?: string;         // 수행상태 (기본값: "01")
  executionResultCd?: string;       // 수행결과코드
  executionResultContent?: string;  // 수행결과내용

  // ===============================
  // 수행점검 정보 (선택)
  // ===============================
  execCheckMethod?: string;         // 점검항목
  execCheckDetail?: string;         // 점검세부내용
  execCheckFrequencyCd?: string;    // 점검주기

  // ===============================
  // 상태 관리 (선택)
  // ===============================
  isActive?: string;                // 사용여부 (기본값: "Y")
  status?: string;                  // 상태 (기본값: "active")
  remarks?: string;                 // 비고
}

/**
 * 부서장업무메뉴얼 수정 요청
 * - PK(manualCd), FK(ledgerOrderId, obligationCd, orgCode)는 수정 불가
 */
export interface UpdateDeptManagerManualRequest {
  // ===============================
  // 관리활동 기본정보 (수정 가능)
  // ===============================
  respItem: string;                 // 책무관리항목
  activityName: string;             // 관리활동명

  // ===============================
  // 수행 정보 (수정 가능)
  // ===============================
  executorId?: string;              // 수행자ID
  executionDate?: string;           // 수행일자 (ISO Date string)
  executionStatus?: string;         // 수행상태
  executionResultCd?: string;       // 수행결과코드
  executionResultContent?: string;  // 수행결과내용

  // ===============================
  // 수행점검 정보 (수정 가능)
  // ===============================
  execCheckMethod?: string;         // 점검항목
  execCheckDetail?: string;         // 점검세부내용
  execCheckFrequencyCd?: string;    // 점검주기

  // ===============================
  // 상태 관리 (수정 가능)
  // ===============================
  isActive: string;                 // 사용여부
  status?: string;                  // 상태
  remarks?: string;                 // 비고
}
