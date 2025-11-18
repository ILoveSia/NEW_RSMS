/**
 * 부서장업무메뉴얼관리 타입 정의
 * @description PositionMgmt 표준을 따라 부서장업무메뉴얼관리의 모든 타입을 정의
 */

// 🏗️ 기본 엔티티 타입

/**
 * 관리활동 상태 타입
 */
export type ManagementActivityStatus =
  | 'active'      // 사용
  | 'inactive'    // 미사용
  | 'pending'     // 검토중
  | 'approved';   // 승인완료

/**
 * 위험평가등급 타입
 */
export type RiskAssessmentLevel =
  | 'very_high'   // 매우높음
  | 'high'        // 높음
  | 'medium'      // 보통
  | 'low'         // 낮음
  | 'very_low';   // 매우낮음

/**
 * 관리활동구분 타입
 */
export type ManagementActivityType =
  | 'compliance'      // 준법
  | 'risk'           // 리스크
  | 'internal_audit' // 내부감사
  | 'operation'      // 운영
  | 'finance'        // 재무
  | 'hr'             // 인사;

/**
 * 결재여부 타입
 */
export type ApprovalStatus =
  | 'pending'   // 미결재
  | 'approved'  // 결재완료
  | 'rejected'  // 결재반려
  | 'draft';    // 임시저장

/**
 * 부서장업무메뉴얼 메인 엔티티
 */
export interface DeptOpManual {
  /** 고유 ID */
  id: string;

  /** 순번 */
  seq: number;

  // ===============================
  // JOIN 데이터 (책무구조 관련)
  // ===============================
  /** 책무구분 */
  responsibilityCat?: string;

  /** 책무 */
  responsibilityInfo?: string;

  /** 책무상세 */
  responsibilityDetailInfo?: string;

  /** 관리의무 (JOIN) */
  obligationInfo?: string;

  /** 부점명 (JOIN) */
  orgName?: string;

  // ===============================
  // dept_manager_manuals 직접 필드
  // ===============================
  /** 메뉴얼코드 (PK) */
  manualCd?: string;

  /** 원장차수ID (FK) */
  ledgerOrderId?: string;

  /** 관리의무코드 (FK) */
  obligationCd?: string;

  /** 조직코드 (FK) */
  orgCode?: string;

  /** 책무관리항목 */
  respItem?: string;

  /** 관리활동명 */
  activityName?: string;

  /** 점검항목 */
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

  /** 수행일자 */
  executionDate?: string;

  /** 수행상태 */
  executionStatus?: string;

  /** 수행결과코드 */
  executionResultCd?: string;

  /** 수행결과내용 */
  executionResultContent?: string;

  // ===============================
  // 레거시 필드 (호환성 유지)
  // ===============================
  /** 관리의무 */
  managementObligation: string;

  /** 부정명 */
  irregularityName: string;

  /** 관리활동코드 */
  managementActivityCode: string;

  /** 관리활동 */
  managementActivity: string;

  /** 관리활동명 */
  managementActivityName: string;

  /** 관리활동상세 */
  managementActivityDetail: string;

  /** 관리활동구분 */
  managementActivityType: ManagementActivityType;

  /** 위험평가등급 */
  riskAssessmentLevel: RiskAssessmentLevel;

  /** 이행주관담당 */
  implementationManager: string;

  /** 이행주관담당부서 */
  implementationDepartment?: string;

  // ===============================
  // 상태 관리
  // ===============================
  /** 사용여부 */
  isActive: boolean;

  /** 상태 */
  status: ManagementActivityStatus;

  /** 결재여부 */
  approvalStatus: ApprovalStatus;

  // ===============================
  // 감사 필드
  // ===============================
  /** 등록일시 */
  createdAt: string;

  /** 등록자 */
  createdBy: string;

  /** 수정일시 */
  updatedAt?: string;

  /** 수정자 */
  updatedBy?: string;

  /** 승인일시 */
  approvedAt?: string;

  /** 승인자 */
  approvedBy?: string;

  /** 비고 */
  remarks?: string;
}

// 🔍 필터링 관련 타입

/**
 * 검색 필터 타입
 */
export interface DeptOpManualsFilters {
  /** 책무이행차수 */
  ledgerOrder?: string;

  /** 분부명 (관리의무) */
  managementObligation?: string;

  /** 부정명 */
  irregularityName?: string;

  /** 관리활동구분 */
  managementActivityType?: ManagementActivityType | 'all';

  /** 관리활동 */
  managementActivity?: string;

  /** 위험평가등급 */
  riskAssessmentLevel?: RiskAssessmentLevel | 'all';

  /** 사용여부 */
  isActive?: boolean | 'all';

  /** 결재여부 */
  approvalStatus?: ApprovalStatus | 'all';

  /** 이행주관담당 */
  implementationManager?: string;

  /** 등록일자 시작 */
  createdDateFrom?: string;

  /** 등록일자 종료 */
  createdDateTo?: string;
}

// 📊 페이지네이션 타입

/**
 * 페이지네이션 정보
 */
export interface DeptOpManualsPagination {
  /** 현재 페이지 */
  page: number;

  /** 페이지 크기 */
  pageSize: number;

  /** 전체 항목 수 */
  total: number;

  /** 전체 페이지 수 */
  totalPages: number;
}

// 📋 폼 관련 타입

/**
 * 폼 데이터 타입 (등록/수정용)
 */
export interface DeptOpManualsFormData {
  /** 관리의무 */
  managementObligation: string;

  /** 부정명 */
  irregularityName: string;

  /** 관리활동코드 */
  managementActivityCode: string;

  /** 관리활동 */
  managementActivity: string;

  /** 관리활동명 */
  managementActivityName: string;

  /** 관리활동상세 */
  managementActivityDetail: string;

  /** 관리활동구분 */
  managementActivityType: ManagementActivityType;

  /** 위험평가등급 */
  riskAssessmentLevel: RiskAssessmentLevel;

  /** 이행주관담당 */
  implementationManager: string;

  /** 이행주관담당부서 */
  implementationDepartment?: string;

  /** 사용여부 */
  isActive: boolean;

  /** 비고 */
  remarks?: string;
}

/**
 * 폼 검증 에러 타입
 */
export interface DeptOpManualsFormErrors {
  managementObligation?: string;
  irregularityName?: string;
  managementActivityCode?: string;
  managementActivity?: string;
  managementActivityName?: string;
  managementActivityDetail?: string;
  managementActivityType?: string;
  riskAssessmentLevel?: string;
  implementationManager?: string;
  implementationDepartment?: string;
}

// 🎯 모달 관련 타입

/**
 * 모달 모드 타입
 */
export type DeptOpManualsModalMode = 'create' | 'edit' | 'view';

/**
 * 모달 상태 타입
 */
export interface DeptOpManualsModalState {
  /** 모달 열림 여부 */
  isOpen: boolean;

  /** 모달 모드 */
  mode: DeptOpManualsModalMode;

  /** 선택된 부서장업무메뉴얼 (수정/상세 시) */
  selectedItem?: DeptOpManual;
}

// 📊 통계 및 상태 정보 타입

/**
 * 통계 정보 타입
 */
export interface DeptOpManualsStatistics {
  /** 전체 관리활동 수 */
  totalActivities: number;

  /** 활성 관리활동 수 */
  activeActivities: number;

  /** 비활성 관리활동 수 */
  inactiveActivities: number;

  /** 승인 대기 수 */
  pendingApprovals: number;

  /** 고위험 관리활동 수 (매우높음, 높음) */
  highRiskActivities: number;

  /** 최근 등록 수 (7일 이내) */
  recentlyCreated: number;
}

// 🔧 API 관련 타입

/**
 * API 응답 타입
 */
export interface DeptOpManualsApiResponse<T = any> {
  /** 성공 여부 */
  success: boolean;

  /** 응답 데이터 */
  data: T;

  /** 응답 메시지 */
  message?: string;

  /** 에러 코드 */
  errorCode?: string;

  /** 페이지네이션 정보 (목록 조회 시) */
  pagination?: DeptOpManualsPagination;
}

/**
 * 목록 조회 요청 파라미터
 */
export interface DeptOpManualsListRequest {
  /** 필터 조건 */
  filters?: DeptOpManualsFilters;

  /** 페이지네이션 */
  pagination: Pick<DeptOpManualsPagination, 'page' | 'pageSize'>;

  /** 정렬 조건 */
  sort?: {
    field: keyof DeptOpManual;
    direction: 'asc' | 'desc';
  };
}

/**
 * 등록 요청 타입
 */
export interface CreateDeptOpManualsRequest {
  data: DeptOpManualsFormData;
}

/**
 * 수정 요청 타입
 */
export interface UpdateDeptOpManualsRequest {
  id: string;
  data: Partial<DeptOpManualsFormData>;
}

/**
 * 삭제 요청 타입
 */
export interface DeleteDeptOpManualsRequest {
  ids: string[];
}

/**
 * 승인 요청 타입
 */
export interface ApproveDeptOpManualsRequest {
  ids: string[];
  approvalStatus: ApprovalStatus;
  comments?: string;
}

// 🎨 UI 컴포넌트 관련 타입

/**
 * 액션 버튼 타입
 */
export interface DeptOpManualsActionButton {
  key: string;
  label: string;
  variant: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

/**
 * 상태 표시 정보 타입
 */
export interface DeptOpManualsStatusInfo {
  /** 전체 개수 */
  total: number;

  /** 선택된 개수 */
  selected: number;

  /** 상태 메시지 */
  statusMessage: string;
}

// 📚 선택 옵션 관련 타입

/**
 * 관리활동구분 옵션
 */
export interface ManagementActivityTypeOption {
  value: ManagementActivityType;
  label: string;
  description?: string;
}

/**
 * 위험평가등급 옵션
 */
export interface RiskAssessmentLevelOption {
  value: RiskAssessmentLevel;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
  priority: number;
}

/**
 * 관리의무 옵션
 */
export interface ManagementObligationOption {
  value: string;
  label: string;
  category?: string;
}

// 🔄 상태 변경 관련 타입

/**
 * 벌크 액션 타입
 */
export type BulkActionType =
  | 'activate'     // 활성화
  | 'deactivate'   // 비활성화
  | 'delete'       // 삭제
  | 'approve'      // 승인
  | 'reject'       // 반려
  | 'export';      // 엑셀 내보내기

/**
 * 벌크 액션 요청 타입
 */
export interface BulkActionRequest {
  /** 액션 타입 */
  action: BulkActionType;

  /** 대상 ID 목록 */
  targetIds: string[];

  /** 추가 파라미터 */
  params?: Record<string, any>;
}

// 🎯 이벤트 핸들러 타입

/**
 * 이벤트 핸들러 타입들
 */
export interface DeptOpManualsEventHandlers {
  onRowClick: (item: DeptOpManual) => void;
  onRowDoubleClick: (item: DeptOpManual) => void;
  onSelectionChange: (selectedItems: DeptOpManual[]) => void;
  onFiltersChange: (filters: Partial<DeptOpManualsFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort: (field: keyof DeptOpManual, direction: 'asc' | 'desc') => void;
  onExcelDownload: () => void;
  onBulkAction: (action: BulkActionType, targetIds: string[]) => void;
}