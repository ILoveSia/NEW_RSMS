/**
 * 관리활동 수행 타입 정의
 * @description dept_manager_manuals 테이블 기반 관리활동 수행 정보
 */

/**
 * 관리활동 수행 엔티티
 */
export interface ActivityExecution {
  /** 고유 ID (manual_cd) */
  id: string;

  /** 순번 */
  seq: number;

  // ===============================
  // dept_manager_manuals 테이블 필드
  // ===============================
  /** 메뉴얼코드 (PK) */
  manualCd?: string;

  /** 원장차수ID (FK) */
  ledgerOrderId?: string;

  /** 관리의무코드 (FK) */
  obligationCd?: string;

  /** 조직코드 (FK) - 부서 */
  orgCode?: string;

  /** 부서명 */
  orgName?: string;

  /** 책무관리항목 */
  respItem?: string;

  /** 관리활동명 */
  activityName?: string;

  /** 점검항목 - 수행점검항목으로 표시 */
  execCheckMethod?: string;

  /** 점검세부내용 */
  execCheckDetail?: string;

  /** 점검주기 */
  execCheckFrequencyCd?: string;

  // ===============================
  // 수행 정보
  // ===============================
  /** 수행자ID */
  executorId?: string;

  /** 수행자명 (employees 테이블 조인) */
  executorName?: string;

  /** 수행일자 */
  executionDate?: string;

  /** 수행상태 (수행여부) */
  executionStatus?: string;

  /** 수행결과코드 */
  executionResultCd?: string;

  /** 수행결과내용 */
  executionResultContent?: string;

  // ===============================
  // 메타데이터
  // ===============================
  /** 사용여부 */
  isActive?: boolean;

  /** 등록일시 */
  createdAt?: string;

  /** 등록자 */
  createdBy?: string;

  /** 수정일시 */
  updatedAt?: string;

  /** 수정자 */
  updatedBy?: string;
}

// 관리활동 수행 상세 정보 (모달에서 사용)
export interface ActivityExecutionDetail {
  // 기본 정보 (좌측 파란색 영역)
  departmentCode: string;            // 부서코드
  activityName: string;              // 관리활동명
  activityCycle: string;             // 관리활동주기

  // 수행 상세 정보 (우측 입력 폼)
  activityOpinion: string;           // 관리활동 의견
  complianceCheck: string;           // 이행점검관련
  internalControlType: string;       // 내부통제지적 구분
  relatedRegulations: string;        // 관련 내규
  controlGuide: string;             // 통제 가이드
  controlIssues: string;            // 통제 현안
  controlIndicators: string;        // 통제 지표

  // 법령 정보 (하단 영역)
  checklist: string;                // 체크리스트
  legalReferences: string;          // 법령 참고사항
}

// 폼 데이터 타입 (이미지 기반 수정)
export interface ActivityExecutionFormData {
  // 상단 영역 필드
  activityResult: string;            // 관리활동 결과 작성
  performanceAssessment: string;     // 관리활동의 적절히 수행여부
  activityOpinion: string;           // 관리활동 의견

  // 하단 체크리스트 필드
  checklist: string;                 // 체크리스트
  checklistConfirmed: string;        // 체크리스트 점검여부 (Y/N)
  complianceCheck: string;
  internalControlType: string;
  relatedRegulations: string;
  controlGuide: string;
  controlIssues: string;
  controlIndicators: string;
  legalReferences: string;
}

// 필터 타입
export interface ActivityExecutionFilters {
  ledgerOrderId: string;             // 책무이행차수
  targetPeriodStart: string;         // 관리활동 대상기간 시작
  targetPeriodEnd: string;           // 관리활동 대상기간 종료
  performanceStatus: string;         // 관리활동 수행여부 (전체/수행완료/미수행)
  departmentCode: string;            // 부서코드
}

// 페이지네이션 타입
export interface ActivityExecutionPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 모달 상태 타입
export interface ActivityExecutionModalState {
  executionModal: boolean;           // 수행 등록/수정 모달
  approvalModal: boolean;            // 승인 요청 모달
  detailModal: boolean;              // 상세 조회 모달
  selectedActivity: ActivityExecution | null;
}

// 결재선 관련 타입 (이미지 정확 매칭)
export interface ApprovalRequest {
  id: string;
  activityId: string;
  sequence: number;                  // 순번
  stepName: string;                  // 결재단계명
  regulation: string;                // 구분 (기안, 부결 등)
  approvalDate?: string;             // 결재일시
  department: string;                // 부서
  isRejected: boolean;               // 부결 여부
  positionTitle: string;             // 직위명칭
  positionName: string;              // 직위명
  opinion?: string;                  // 의견
  approver: string;                  // 결재자
  approverId: string;                // 결재자 ID
  status: 'pending' | 'approved' | 'rejected';
}

// 결재요청내용 타입 (승인 요청 모달 상단 - 이미지 정확 매칭)
export interface ApprovalTargetActivity {
  sequence: number;                      // 순번
  activityName: string;                  // 관리활동명
  internalControlName: string;           // 내부통제명
  internalControlCheckName: string;      // 내부통제점검명
  performer: string;                     // 수행자
  isPerformed: boolean;                  // 수행여부
  performanceResult: string;             // 수행결과
}

// 검색 필드 옵션
export interface PerformanceStatusOption {
  value: string;
  label: string;
}

// 상태별 통계
export interface ActivityExecutionStatistics {
  total: number;                     // 총 관리활동 수
  completed: number;                 // 수행완료 수
  pending: number;                   // 미수행 수
  systemUptime: number;              // 시스템 가동률
}

// 로딩 상태
export interface ActivityExecutionLoadingStates {
  search: boolean;
  excel: boolean;
  modify: boolean;
  approval: boolean;
}