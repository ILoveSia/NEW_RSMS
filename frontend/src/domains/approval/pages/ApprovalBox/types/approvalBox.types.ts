/**
 * 홈 > 결재함 관련 TypeScript 타입 정의
 * PositionMgmt.tsx 표준 템플릿 패턴을 따라 정의
 */

// 📊 결재 데이터 인터페이스
export interface Approval {
  id: string;
  sequence: number; // 순번
  approvalId: string; // 결재ID
  workType: string; // 업무종류
  content: string; // 내용
  approvalStatus: ApprovalStatus; // 결재상태
  approvalSchedule: string; // 결재일정

  // 기안자 정보
  drafter: string; // 기안자
  drafterPosition?: string; // 기안자 직책
  draftDate: string; // 기안일

  // 요청자 정보
  requester?: string; // 요청자
  requesterPosition?: string; // 요청자 직책
  requestDate?: string; // 요청일

  // 결재자 정보
  approver?: string; // 결재자
  approverPosition?: string; // 결재자 직책
  approveDate?: string; // 결재일

  // 대기자 정보
  waiter?: string; // 대기자
  waiterPosition?: string; // 대기자 직책

  // 추가 필드들
  departmentCode?: string; // 부서코드
  department?: string; // 부서명
  priority?: ApprovalPriority; // 우선순위
  description?: string; // 상세설명
  attachments?: File[]; // 첨부파일
  comments?: string; // 의견

  // 결재선 정보
  approvalLine?: ApprovalLineItem[]; // 결재선
  currentStep?: number; // 현재 단계
  totalSteps?: number; // 총 단계

  // 감사 정보
  createdAt?: string; // 생성일시
  createdBy?: string; // 생성자
  updatedAt?: string; // 수정일시
  updatedBy?: string; // 수정자
}

// 🔍 결재함 목록 필터 인터페이스
export interface ApprovalBoxFilters {
  startDate: string; // 시작일
  endDate: string; // 종료일
  workType: string; // 업무종류
  department: string; // 부서
  approvalStatus: string; // 결재상태 (전체, 대기, 진행중, 완료)
  keyword?: string; // 키워드 검색
}

// 📈 결재함 목록 통계 데이터 인터페이스
export interface ApprovalBoxStats {
  totalItems: number; // 전체 건수
  waitingItems: number; // 대기 건수 (0/70 형태에서 분자)
  waitingTotal: number; // 대기 총 건수 (0/70 형태에서 분모)
  progressItems: number; // 진행중 건수
  completedItems: number; // 완료 건수
  allItems: number; // 전체 탭 건수
}

// 📄 결재 등록/수정 폼 데이터
export interface ApprovalFormData {
  workType: string; // 업무종류
  content: string; // 내용
  department: string; // 부서
  priority: ApprovalPriority; // 우선순위
  description: string; // 상세설명
  dueDate: string; // 완료예정일
  approvalLine: ApprovalLineItem[]; // 결재선
  attachments?: File[]; // 첨부파일
}

// 📝 결재선 아이템 인터페이스
export interface ApprovalLineItem {
  id: string;
  sequence: number; // 순번
  stepName: string; // 결재단계명
  type: ApprovalLineType; // 구분 (기안, 결재, 합의, 참조 등)
  department?: string; // 부서
  employeeId?: string; // 직원번호
  employeeName: string; // 직원명
  position?: string; // 직책
  approveDate?: string; // 결재일시
  status: ApprovalLineStatus; // 상태
  comments?: string; // 의견
  isRequired: boolean; // 필수여부
}

// 📋 페이지네이션 인터페이스
export interface ApprovalBoxPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 인터페이스
export interface ApprovalBoxModalState {
  addModal: boolean;
  detailModal: boolean;
  approveModal: boolean; // 결재 처리 모달
  rejectModal: boolean; // 반려 처리 모달
  withdrawModal: boolean; // 회수 처리 모달
  selectedItem: Approval | null;
}

// 📊 결재 상태 열거형
export type ApprovalStatus =
  | 'DRAFT' // 기안
  | 'WITHDRAWN' // 회수완료
  | 'PROGRESS' // 진행중
  | 'APPROVED' // 완료
  | 'REJECTED' // 반려
  | 'PENDING'; // 대기

// 🔄 결재선 타입
export type ApprovalLineType =
  | 'DRAFT' // 기안
  | 'APPROVE' // 결재
  | 'AGREEMENT' // 합의
  | 'REFERENCE' // 참조
  | 'FINAL'; // 최종승인

// 📊 결재선 상태
export type ApprovalLineStatus =
  | 'WAITING' // 대기
  | 'APPROVED' // 승인
  | 'REJECTED' // 반려
  | 'PENDING' // 보류
  | 'SKIPPED'; // 건너뜀

// ⭐ 우선순위
export type ApprovalPriority = 'HIGH' | 'MEDIUM' | 'LOW';

// 📊 결재 목록 조회 응답 인터페이스
export interface ApprovalBoxListResponse {
  content: Approval[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 📊 결재 상세 조회 응답 인터페이스
export interface ApprovalDetailResponse {
  approval: Approval;
  approvalRequestContent: ApprovalRequestContent[]; // 결재요청내용
  approvalLine: ApprovalLineItem[]; // 결재선
}

// 📋 결재요청내용 인터페이스
export interface ApprovalRequestContent {
  id: string;
  sequence: number; // 순번
  managerName: string; // 관리위원명
  internalControl: string; // 내부통제
  internalControlManager: string; // 내부통제위원명
  performer: string; // 수행자
  performanceStatus: 'Y' | 'N'; // 수행여부
  performanceResult?: string; // 수행결과
  notes?: string; // 비고
}

// 드롭다운 옵션 타입들
export interface SelectOption {
  value: string;
  label: string;
}

// 업무종류 옵션
export const WORK_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'RESP_MGMT', label: '책무구조' },
  { value: 'POSITION_MGMT', label: '직책관리' },
  { value: 'INTERNAL_CONTROL', label: '내부통제' },
  { value: 'AUDIT', label: '감사' },
  { value: 'COMPLIANCE', label: '준법감시' },
  { value: 'RISK_MGMT', label: '리스크관리' },
  { value: 'OTHER', label: '기타' }
];

// 결재상태 옵션
export const APPROVAL_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'PROGRESS', label: '진행중' },
  { value: 'APPROVED', label: '완료' }
];

// 부서 옵션 (실제로는 API에서 동적 로딩)
export const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: '0000', label: '본부' },
  { value: '1000', label: '경영진단본부' },
  { value: '2000', label: '총합기획부' },
  { value: '3000', label: '영업본부' },
  { value: '4000', label: '리스크관리부' }
];

// 상태별 색상 매핑
export const APPROVAL_STATUS_COLOR_MAP: Record<ApprovalStatus, string> = {
  DRAFT: '#6B7280',      // Gray
  WITHDRAWN: '#EF4444',  // Red
  PROGRESS: '#3B82F6',   // Blue
  APPROVED: '#10B981',   // Green
  REJECTED: '#EF4444',   // Red
  PENDING: '#F59E0B'     // Amber
};

// 우선순위별 색상 매핑
export const PRIORITY_COLOR_MAP: Record<ApprovalPriority, string> = {
  HIGH: '#EF4444',       // Red
  MEDIUM: '#F59E0B',     // Amber
  LOW: '#10B981'         // Green
};