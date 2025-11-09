/**
 * 점검수행 및 결재 관련 타입 정의
 * 이행점검의 점검수행 및 결재 프로세스 관리
 */

// 점검 대상 정보 타입
export interface InspectionExecution {
  id: string;
  sequenceNumber: number;                    // 순번
  inspectionName: string;                    // 점검명
  obligationInfo: string;                    // 관리의무
  managementActivityName: string;            // 관리활동명
  activityFrequencyCd: string;               // 관리활동수행주기
  orgCode: string;                           // 부점
  inspectionMethod: string;                  // 이행점검방법
  inspector: string;                         // 점검자
  inspectionResult?: string;                 // 점검결과
  inspectionDetail?: string;                 // 점검세부내용
  inspectionStatus: InspectionStatus;        // 상태
  inspectionPeriodId: string;                // 점검 기간 ID
  createdAt: string;
  updatedAt: string;
}

// 점검 상태 타입
export type InspectionStatus =
  | 'NOT_STARTED'     // 미수행
  | 'FIRST_INSPECTION' // 1차점검중
  | 'SECOND_INSPECTION' // 2차점검중
  | 'COMPLETED'       // 완료
  | 'REJECTED';       // 반려

// 점검 결과 타입
export type InspectionResult =
  | 'PASS'           // 적합
  | 'FAIL'           // 부적합
  | 'IMPROVEMENT'    // 보완필요
  | '';              // 미선택

// 점검 수행대상 필터 타입
export type PerformanceTargetFilter =
  | 'ALL'            // 전체
  | 'IN_PROGRESS'    // 진행중
  | 'COMPLETED'      // 완료
  | 'NOT_STARTED';   // 미수행

// 점검 기간 타입
export interface InspectionPeriod {
  id: string;
  periodName: string;                        // 점검명
  startDate: string;                         // 시작일
  endDate: string;                           // 종료일
  description?: string;                      // 설명
  isActive: boolean;
}

// 검색 필터 타입
export interface ExecutionFilters {
  ledgerOrderId?: string;                    // 책무이행차수
  inspectionPeriodId?: string;               // 점검명
  branchCode?: string;                       // 부점코드
}

// 점검 의견 타입
export interface InspectionOpinion {
  id: string;
  executionId: string;
  inspectionType: 'FIRST' | 'SECOND';        // 점검 차수
  result: InspectionResult;                  // 점검 결과
  opinion: string;                           // 점검 의견
  attachments?: string[];                    // 첨부파일
  inspector: string;                         // 점검자
  inspectionDate: string;                    // 점검일시
}

// 관리활동 상세 정보 타입
export interface ManagementActivityDetail {
  // 책무 정보
  responsibilityInfo: string;                // 책무명 (responsibilities.responsibility_info)
  responsibilityDetailInfo: string;          // 책무세부내용 (responsibility_details.responsibility_detail_info)

  // 관리의무 정보
  obligationInfo: string;                    // 관리의무 (management_obligations.obligation_info)

  // 관리활동 정보
  activityTypeCd: string;                    // 관리활동구분코드 (dept_manager_manuals.activity_type_cd)
  activityName: string;                      // 관리활동명 (dept_manager_manuals.activity_name)
  evidenceMaterial: string;                  // 관리활동증빙자료 (dept_manager_manuals.evidence_material)
  implCheckMethod: string;                   // 이행점검방법 (dept_manager_manuals.impl_check_method)
  implCheckDetail: string;                   // 이행점검세부내용 (dept_manager_manuals.impl_check_detail)
}

// 점검정보 타입
export interface InspectionInfo {
  inspectorId: string;                       // 점검자 (impl_inspection_items.inspector_id)
  inspectionStatusCd: string;                // 점검결과 (impl_inspection_items.inspection_status_cd) (01:미점검, 02:적정, 03:부적정)
  inspectionResultContent: string;           // 점검결과내용 (impl_inspection_items.inspection_result_content)
  inspectionDate: string;                    // 점검일자 (impl_inspection_items.inspection_date)
}

// 개선이행정보 타입
export interface ImprovementInfo {
  improvementManagerId: string;              // 개선담당자 (impl_inspection_items.improvement_manager_id)
  improvementStatusCd: string;               // 개선이행상태 (impl_inspection_items.improvement_status_cd) (01:개선미이행, 02:진행중, 03:완료)
  improvementPlanContent: string;            // 개선계획내용 (impl_inspection_items.improvement_plan_content)
  improvementPlanDate: string;               // 개선계획수립일자 (impl_inspection_items.improvement_plan_date)
  improvementDetailContent: string;          // 개선이행세부내용 (impl_inspection_items.improvement_detail_content)
  improvementCompletedDate: string;          // 개선완료일자 (impl_inspection_items.improvement_completed_date)
}

// 최종점검정보 타입
export interface FinalInspectionInfo {
  finalInspectorId: string;                  // 최종점검자 (impl_inspection_items.final_inspector_id)
  finalInspectionResultCd: string;           // 최종점검결과 (impl_inspection_items.final_inspection_result_cd) (01:승인, 02:반려)
  finalInspectionResultContent: string;      // 최종점검결과내용 (impl_inspection_items.final_inspection_result_content)
  finalInspectionDate: string;               // 최종점검일자 (impl_inspection_items.final_inspection_date)
}

// 점검 수행 폼 데이터 타입
export interface InspectionPerformanceFormData {
  managementActivityWritten: boolean;        // 수행자의 관리활동 작성여부
  inspectionOpinion: string;                 // 점검 의견
  inspectionResult: InspectionResult;        // 점검 결과
  attachments?: File[];                      // 첨부파일
}

// 검사활동 결과 폼 데이터 타입
export interface InspectionReviewFormData {
  inspectionWritten: boolean;                // 점검자의 이행점검 작성여부
  finalOpinion: string;                      // 최종 의견
  finalResult: InspectionResult;             // 최종 결과
  attachments?: File[];                      // 첨부파일
}

// 모달 상태 타입
export interface ExecutionModalState {
  detailModal: boolean;
  selectedExecution: InspectionExecution | null;
}

// 페이지네이션 타입
export interface ExecutionPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 점검 수행대상 옵션 타입
export interface PerformanceTargetOption {
  value: PerformanceTargetFilter;
  label: string;
}

// API 응답 타입
export interface ExecutionApiResponse {
  success: boolean;
  data: {
    content: InspectionExecution[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  };
  message?: string;
  errorCode?: string;
}

// 점검 상세 정보 API 응답 타입
export interface ExecutionDetailApiResponse {
  success: boolean;
  data: {
    execution: InspectionExecution;
    managementActivity: ManagementActivityDetail;
    firstInspection?: InspectionOpinion;
    secondInspection?: InspectionOpinion;
  };
  message?: string;
  errorCode?: string;
}

// 점검 수행 API 요청 타입
export interface PerformInspectionRequest {
  executionId: string;
  inspectionType: 'FIRST' | 'SECOND';
  result: InspectionResult;
  opinion: string;
  attachments?: string[];
}

// 일괄 결재 처리 요청 타입
export interface BulkApprovalRequest {
  executionIds: string[];
  approvalType: 'APPROVE' | 'REJECT';
  opinion: string;
}

// 점검 통계 타입
export interface ExecutionStatistics {
  total: number;                             // 총 점검대상
  inProgress: number;                        // 진행중
  completed: number;                         // 완료
  notStarted: number;                        // 미수행
  rejected: number;                          // 반려
  systemUptime: number;                      // 시스템 가동률
}

// 점검 상태 표시 타입
export interface InspectionStatusDisplay {
  status: InspectionStatus;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  backgroundColor: string;
  textColor: string;
}

// 크로스체크 결과 타입
export interface CrossCheckResult {
  executionId: string;
  firstResult: InspectionResult;
  secondResult: InspectionResult;
  isMatch: boolean;
  discrepancyReason?: string;
  needsReview: boolean;
}