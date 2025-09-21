// ActivityExecution 관련 타입 정의
// 이미지 기반으로 정확한 컬럼 구조 반영

export interface ActivityExecution {
  id: string;
  sequence: number;                    // 순번
  activityName: string;               // 관리활동명
  activityDetail: string;             // 활동상세
  cycle: string;                      // 주기 (분기, 월별, 년별 등)
  isInternalActivity: boolean;        // 내부활동 (체크박스)
  regulation: string;                 // 규율
  responsibilityArea: string;         // 내부활동책임영역
  performer: string;                  // 수행자
  isPerformed: boolean;              // 수행여부 (완료/미완료)
  performanceResult: string;          // 수행결과 (적정/부적정 등)
  cssConst: string;                  // CSS_CONST (Y/N)
  gnrzOblgDvcd: string;              // GNRZ_OBLG_DVCD (02 등)

  // 추가 메타데이터
  executionDate?: string;            // 수행일시
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
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
  checklist: string;
  legalReferences: string;
}

// 필터 타입
export interface ActivityExecutionFilters {
  targetPeriodStart: string;         // 관리활동 대상기간 시작
  targetPeriodEnd: string;           // 관리활동 대상기간 종료
  performanceStatus: string;         // 관리활동 수행여부 (전체/수행완료/미수행)
  departmentCode: string;            // 부서코드
  searchKeyword: string;             // 검색어 (관리활동명, 수행자명 등)
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