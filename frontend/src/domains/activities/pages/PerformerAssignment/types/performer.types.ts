/**
 * 수행자지정 타입 정의
 * PositionMgmt 표준 구조 참고
 */

// 수행자 지정 기본 정보
export interface PerformerAssignment {
  id: string;
  sequence: number;                    // 순번
  order: number;                       // 순서 (관리활동별 우선순위)
  activityName: string;               // 관리활동명
  activityDetail: string;             // 활동상세내용
  cycle: string;                      // 주기 (분기별 등)
  isInternalActivity: boolean;        // 내부활동여부
  regulation: string;                 // 규율 (구속수준별)
  responsibleDepartment: string;      // 내부활동책임영역 (부서)
  isPerformed: boolean;               // 수행여부
  performer: string;                  // 수행자 정보
  cssConst: string;                   // CSS_CONST (제약조건)
  gnrzOblgDvcd: string;              // GNRZ_OBLG_DVCD (일반의무구분코드)
  endYn: string;                      // END_YN (종료여부)

  // 시스템 정보
  assignmentDate: string;             // 지정일자
  assigner: string;                   // 지정자
  assignerPosition: string;           // 지정자직책
  modificationDate: string;           // 변경일자
  modifier: string;                   // 변경자
  modifierPosition: string;           // 변경자직책
  status: string;                     // 상태
  isActive: boolean;                  // 사용여부
}

// 수행자 지정/변경 폼 데이터
export interface PerformerFormData {
  activityId: string;                 // 관리활동 ID
  activityName: string;               // 관리활동명
  performerUserId: string;            // 수행자 사용자ID
  performerName: string;              // 수행자명
  performerDepartment: string;        // 수행자 부서
  performerPosition: string;          // 수행자 직책
  performPeriodStart: string;         // 수행기간 시작
  performPeriodEnd: string;           // 수행기간 종료
  performRole: string;                // 수행역할/책임 구분
  assignmentReason?: string;          // 지정 사유 (변경 시)
}

// 검색 필터
export interface PerformerFilters {
  targetPeriodStart: string;          // 관리활동 대상기간 시작
  targetPeriodEnd: string;            // 관리활동 대상기간 종료
  assignmentStatus: string;           // 수행자 지정 할당여부 (전체/할당/미할당)
  departmentCode: string;             // 부서코드
  searchKeyword: string;              // 검색어 (관리활동명, 수행자명 등)
}

// 페이징 정보
export interface PerformerPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// API 응답 타입
export interface PerformerListResponse {
  content: PerformerAssignment[];
  pagination: PerformerPagination;
}

// 모달 상태
export interface PerformerModalState {
  assignModal: boolean;               // 수행자 지정 모달
  changeModal: boolean;               // 수행자 변경 모달
  detailModal: boolean;               // 수행자 상세 모달
  selectedPerformer: PerformerAssignment | null;
}

// 할당 상태 옵션
export interface AssignmentStatusOption {
  value: string;
  label: string;
}

// 부서 옵션 (자동완성용)
export interface DepartmentOption {
  value: string;
  label: string;
  code: string;
}

// 사용자 옵션 (수행자 선택용)
export interface UserOption {
  userId: string;
  userName: string;
  departmentName: string;
  positionName: string;
  email: string;
}

// 관리활동 옵션
export interface ActivityOption {
  activityId: string;
  activityName: string;
  activityDetail: string;
  cycle: string;
  responsibleDepartment: string;
}

// 수행역할 옵션
export interface PerformRoleOption {
  value: string;
  label: string;
}