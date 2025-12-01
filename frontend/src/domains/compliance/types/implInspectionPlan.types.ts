/**
 * 이행점검계획 타입 정의
 * - Backend ImplInspectionPlanDto, ImplInspectionItemDto와 매핑
 *
 * @author Claude AI
 * @since 2025-11-27
 */

/**
 * 이행점검계획 DTO
 * - impl_inspection_plans 테이블 응답
 */
export interface ImplInspectionPlanDto {
  /** 이행점검계획ID (PK) */
  implInspectionPlanId: string;
  /** 원장차수ID */
  ledgerOrderId: string;
  /** 이행점검명 */
  implInspectionName: string;
  /** 점검유형코드 (01: 정기점검, 02: 특별점검) */
  inspectionTypeCd: string;
  /** 점검유형명 */
  inspectionTypeName: string;
  /** 이행점검시작일 */
  implInspectionStartDate: string;
  /** 이행점검종료일 */
  implInspectionEndDate: string;
  /** 이행점검상태코드 (01: 계획, 02: 진행중, 03: 완료, 04: 보류) */
  implInspectionStatusCd: string;
  /** 이행점검상태명 */
  implInspectionStatusName: string;
  /** 비고 */
  remarks: string;
  /** 사용여부 */
  isActive: string;
  /** 등록일시 */
  createdAt: string;
  /** 등록자 */
  createdBy: string;
  /** 수정일시 */
  updatedAt: string;
  /** 수정자 */
  updatedBy: string;
  /** 전체 항목 수 (통계) */
  totalItemCount: number;
  /** 완료 항목 수 (통계) */
  completedItemCount: number;
  /** 진행중 항목 수 (통계) */
  inProgressItemCount: number;
}

/**
 * 이행점검항목 DTO
 * - impl_inspection_items 테이블 응답
 */
export interface ImplInspectionItemDto {
  /** 이행점검항목ID (PK) */
  implInspectionItemId: string;
  /** 이행점검계획ID (FK) */
  implInspectionPlanId: string;
  /** 부서장업무메뉴얼CD (FK) */
  manualCd: string;

  // 1단계: 점검 정보
  /** 점검자ID */
  inspectorId: string;
  /** 점검자명 (employees.emp_name) */
  inspectorName?: string;
  /** 점검결과상태코드 (01:미점검, 02:적정, 03:부적정) */
  inspectionStatusCd: string;
  /** 점검결과상태명 */
  inspectionStatusName: string;
  /** 점검결과내용 */
  inspectionResultContent: string;
  /** 점검일자 */
  inspectionDate: string;

  // 2단계: 개선이행 정보
  /** 개선이행상태코드 (01:개선미이행, 02:개선계획, 03:개선완료) */
  improvementStatusCd: string;
  /** 개선이행상태명 */
  improvementStatusName: string;
  /** 개선담당자ID */
  improvementManagerId: string;
  /** 개선담당자명 (employees.emp_name) */
  improvementManagerName?: string;
  /** 개선계획내용 */
  improvementPlanContent: string;
  /** 개선계획수립일자 */
  improvementPlanDate: string;
  /** 개선계획 승인자ID */
  improvementPlanApprovedBy: string;
  /** 개선계획 승인일자 */
  improvementPlanApprovedDate: string;
  /** 개선이행세부내용 */
  improvementDetailContent: string;
  /** 개선이행완료일자 */
  improvementCompletedDate: string;

  // 3단계: 최종점검 정보
  /** 최종점검자ID */
  finalInspectorId?: string;
  /** 최종점검자명 (employees.emp_name) */
  finalInspectorName?: string;
  /** 최종점검결과코드 (01:승인, 02:반려) */
  finalInspectionResultCd: string;
  /** 최종점검결과내용 */
  finalInspectionResultContent: string;
  /** 최종점검일자 */
  finalInspectionDate: string;

  // 부가 정보
  /** 반려 횟수 */
  rejectionCount: number;
  /** 사용여부 */
  isActive: string;
  /** 등록일시 */
  createdAt: string;
  /** 등록자 */
  createdBy: string;
  /** 수정일시 */
  updatedAt: string;
  /** 수정자 */
  updatedBy: string;

  // 관계 테이블 정보
  /** 부서장업무메뉴얼 정보 (책무/책무상세/관리의무 포함) */
  deptManagerManual: {
    manualCd: string;
    respItem: string;
    activityName: string;
    orgCode: string;
    orgName: string;
    obligationCd: string;
    obligationInfo: string;        // 관리의무내용 (management_obligations.obligation_info)
    execCheckFrequencyCd: string;  // 수행점검주기 (점검주기)
    execCheckMethod: string;       // 수행점검항목 (이행점검방법)

    // 수행정보 (dept_manager_manuals 테이블)
    executorId?: string;           // 수행자ID
    executorName?: string;         // 수행자명 (employees.emp_name)
    executionDate?: string;        // 수행일자
    executionStatus?: string;      // 수행상태코드
    executionStatusName?: string;  // 수행상태명
    executionResultCd?: string;    // 수행결과코드
    executionResultName?: string;  // 수행결과명
    executionResultContent?: string; // 수행결과내용

    // 책무상세 정보
    responsibilityDetailCd: string;   // 책무상세코드
    responsibilityDetailInfo: string; // 책무상세내용 (responsibility_details.responsibility_detail_info)

    // 책무 정보
    responsibilityCd: string;    // 책무코드
    responsibilityInfo: string;  // 책무내용 (responsibilities.responsibility_info)
  };

  /** 이행점검계획 정보 (점검자지정 페이지용) */
  implInspectionPlan?: {
    implInspectionPlanId: string;
    ledgerOrderId: string;
    implInspectionName: string;
    inspectionTypeCd: string;
    implInspectionStartDate: string;
    implInspectionEndDate: string;
  };
}

/**
 * 이행점검계획 생성 요청
 */
export interface CreateImplInspectionPlanRequest {
  /** 원장차수ID */
  ledgerOrderId: string;
  /** 이행점검명 */
  implInspectionName: string;
  /** 점검유형코드 (01: 정기점검, 02: 특별점검) */
  inspectionTypeCd: string;
  /** 이행점검시작일 */
  implInspectionStartDate: string;
  /** 이행점검종료일 */
  implInspectionEndDate: string;
  /** 비고 */
  remarks?: string;
  /** 선택된 부서장업무메뉴얼CD 목록 (점검항목 일괄 생성용) */
  manualCds: string[];
}

/**
 * 이행점검계획 수정 요청
 */
export interface UpdateImplInspectionPlanRequest {
  /** 이행점검명 */
  implInspectionName: string;
  /** 점검유형코드 */
  inspectionTypeCd: string;
  /** 이행점검시작일 */
  implInspectionStartDate: string;
  /** 이행점검종료일 */
  implInspectionEndDate: string;
  /** 비고 */
  remarks?: string;
  /** manualCds는 수정 시에는 사용하지 않음 (별도 관리 필요) */
  manualCds?: string[];
}
