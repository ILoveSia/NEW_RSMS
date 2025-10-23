/**
 * 회의체관리(Deliberative Management) 타입 정의
 * PositionMgmt.tsx 표준을 기반으로 설계
 */

// 회의체 기본 정보
export interface Deliberative {
  id: string;
  seq: number; // 순번
  name: string; // 회의체명
  holdingPeriod: string; // 개최주기 (월/분기/반기/년)
  chairperson: string; // 위원장
  members: string; // 위원 (다수명 문자열 표시)
  mainAgenda: string; // 주요심의사항
  registrationDate: string; // 등록일자
  registrar: string; // 등록자
  registrarPosition: string; // 등록자직책
  modifier?: string; // 수정자
  modificationDate?: string; // 수정일자
  isActive: boolean; // 사용여부
}

// 회의체 위원 정보
export interface DeliberativeMember {
  id: string;
  deliberativeId: string; // 회의체 ID
  seq: number; // 순번
  type: 'chairman' | 'member'; // 구분 (위원장/위원)
  name: string; // 성명
  position: string; // 직책
  organization?: string; // 소속
}

// 회의체 폼 데이터 (등록/수정용)
export interface DeliberativeFormData {
  name: string; // 회의체명
  holdingPeriod: string; // 개최주기
  mainAgenda: string; // 주요심의사항
  isActive: boolean; // 사용여부
  members: DeliberativeMember[]; // 위원정보
}

// 회의체 검색 필터
export interface DeliberativeFilters {
  name: string; // 회의체명
  chairperson: string; // 위원장명
  isActive: string; // 사용여부 ('', 'Y', 'N')
  holdingPeriod: string; // 개최주기
}

// 회의체 페이지네이션
export interface DeliberativePagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 회의체 모달 상태
export interface DeliberativeModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedDeliberative: Deliberative | null;
}

// 개최주기 옵션
export interface HoldingPeriodOption {
  value: string;
  label: string;
}

// 위원 타입 옵션
export interface MemberTypeOption {
  value: 'chairman' | 'member';
  label: string;
}

// 회의체 통계 정보
export interface DeliberativeStats {
  total: number;
  activeCount: number;
  inactiveCount: number;
  monthlyCount: number; // 월별 회의체 수
  quarterlyCount: number; // 분기별 회의체 수
}

// API 응답 타입
export interface DeliberativeListResponse {
  data: Deliberative[];
  pagination: DeliberativePagination;
  stats: DeliberativeStats;
}

export interface DeliberativeDetailResponse {
  data: Deliberative;
  members: DeliberativeMember[];
}

// 유효성 검증 에러 타입
export interface DeliberativeValidationError {
  field: string;
  message: string;
}

// 위원 추가/수정 폼 데이터
export interface MemberFormData {
  type: 'chairman' | 'member';
  name: string;
  position: string;
  organization?: string;
}

// 회의체 액션 타입
export type DeliberativeAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'addMember'
  | 'removeMember'
  | 'reorder';

// 정렬 옵션
export interface DeliberativeSortOption {
  field: keyof Deliberative;
  direction: 'asc' | 'desc';
}

// 회의체 모달 Props (PositionDualFormModal 패턴)
export interface DeliberativeFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  deliberative: Deliberative | null;
  onClose: () => void;
  onSave: (formData: DeliberativeFormData) => void;
  onUpdate: (id: string, formData: DeliberativeFormData) => void;
  loading?: boolean;
}