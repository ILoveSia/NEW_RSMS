/**
 * 점검수행 및 결재 관련 타입 정의
 * 이행점검의 점검수행 및 결재 프로세스 관리
 */

// 점검 대상 정보 타입
export interface InspectionExecution {
  id: string;
  sequenceNumber: number;                    // 순번
  managementActivityName: string;            // 관리활동명
  managementActivitySession: string;         // 관리활동차시
  managementActivityDetail: string;          // 관리활동상세
  internalExternal: string;                  // 내부/외제
  classification: string;                    // 구분
  internalExternalLimitInfo?: string;        // 내부/외제제한정보
  performer: string;                         // 수행자
  performanceTarget?: string;                // 수행대상
  performanceResult?: string;                // 수행결과
  inspector: string;                         // 점검자
  inspectionTarget?: string;                 // 점검대상
  firstInspectionResult?: string;            // 1차 점검결과
  secondInspectionResult?: string;           // 2차 점검결과
  inspectionStatus: InspectionStatus;        // 점검 상태
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
  inspectionPeriodId: string;                // 점검명
  performanceTarget: PerformanceTargetFilter; // 이행점검 수행대상
  branchCode: string;                        // 부점코드
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
  activityCode: string;                      // 활동코드
  activityName: string;                      // 관리활동명
  method1: string;                           // 방법1
  method2?: string;                          // 방법2
  inspectionRelated: string;                 // 이행점검관련
  internalExternalClassification: string;    // 내부/외제차시 구분
  relatedRegulations: string;                // 관련 내규
  keyGuide: string;                          // 중점 가이드
  keyPrinciple: string;                      // 중점 원칙
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