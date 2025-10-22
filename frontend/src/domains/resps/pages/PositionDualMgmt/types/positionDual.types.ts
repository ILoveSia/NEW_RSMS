/**
 * 직책겸직관리 시스템 타입 정의
 * PositionMgmt.tsx 표준 패턴을 따라 설계됨
 */

// 💼 직책겸직 메인 엔티티
export interface PositionDual {
  id: string;
  seq: number;
  concurrentStatusCode: string; // 겸직현황코드
  positionCode: string; // 직책코드
  positionName: string; // 직책명
  isRepresentative: boolean; // 대표여부 (Y/N)
  hpName: string; // 본부명
  registrationDate: string; // 등록일자
  registrar: string; // 등록자
  registrarPosition: string; // 등록자직책
  modificationDate?: string; // 변경일자
  modifier?: string; // 변경자
  modifierPosition?: string; // 변경자직책
  isActive: boolean; // 사용여부
  startDate?: string; // 시작일자
  endDate?: string; // 종료일자
}

// 🔍 검색 필터 타입
export interface PositionDualFilters {
  ledgerOrderId: string; // 원장차수ID
  positionName: string; // 직책명
  isActive: string; // 사용여부 ('', 'Y', 'N')
  isRepresentative: string; // 대표여부 ('', 'Y', 'N')
  concurrentStatusCode: string; // 겸직현황코드
}

// 📄 페이지네이션 타입
export interface PositionDualPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 타입
export interface PositionDualModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedPositionDual: PositionDual | null;
}

// 📝 폼 데이터 타입 (추가/수정 모달용)
export interface PositionDualFormData {
  concurrentStatusCode: string; // 겸직현황코드
  positions: PositionDualPosition[]; // 겸직 직책 목록
}

// 👥 겸직 직책 타입
export interface PositionDualPosition {
  id?: string;
  positionCode: string; // 직책코드
  positionName: string; // 직책명
  hpName: string; // 본부명
  isRepresentative: boolean; // 대표여부
  isActive: boolean; // 사용여부
}

// 📊 통계 정보 타입
export interface PositionDualStatistics {
  total: number; // 총 겸직 현황 수
  activeCount: number; // 활성 겸직 수
  representativeCount: number; // 대표 직책 수
  inactiveCount: number; // 비활성 겸직 수
}

// 🎨 직책 선택 옵션 타입
export interface PositionOption {
  value: string; // 직책코드
  label: string; // 직책명
  hpName: string; // 본부명
  isAvailable: boolean; // 선택 가능 여부
}

// ⚙️ 컴포넌트 Props 타입들

// BaseSearchFilter용 필터 값 타입
export interface PositionDualFilterValues {
  ledgerOrderId: string;
  positionName: string;
  isActive: string;
  isRepresentative: string;
  concurrentStatusCode: string;
}

// BaseActionBar용 액션 버튼 타입 (기본 제공 타입 활용)
export interface PositionDualActionButton {
  key: string;
  type: 'add' | 'edit' | 'delete' | 'excel' | 'custom';
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  confirmationRequired?: boolean;
}

// 🔄 API 응답 타입들
export interface PositionDualListResponse {
  items: PositionDual[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  statistics: PositionDualStatistics;
}

export interface PositionDualDetailResponse {
  positionDual: PositionDual;
  positions: PositionDualPosition[];
  history: PositionDualHistory[];
}

// 📈 겸직 이력 타입
export interface PositionDualHistory {
  id: string;
  concurrentStatusCode: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  actionDate: string;
  actionUser: string;
  actionUserPosition: string;
  description: string;
  beforeData?: Partial<PositionDual>;
  afterData?: Partial<PositionDual>;
}

// 🎯 겸직 승인 타입
export interface PositionDualApproval {
  id: string;
  concurrentStatusCode: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalDate?: string;
  approver?: string;
  approverPosition?: string;
  approvalComment?: string;
  requestDate: string;
  requester: string;
  requesterPosition: string;
}

// 🔧 유틸리티 타입들

// 겸직현황코드별 그룹화된 데이터 타입
export type GroupedPositionDual = Record<string, PositionDual[]>;

// 직책별 겸직 참여 상태 타입
export interface PositionConcurrencyStatus {
  positionCode: string;
  positionName: string;
  concurrentStatusCodes: string[];
  isRepresentativeInAny: boolean;
  totalConcurrencies: number;
}

// 비즈니스 규칙 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

// 📋 폼 모달 Props 타입
export interface PositionDualFormModalProps {
  open: boolean;
  mode: 'create' | 'detail' | 'edit';
  positionDual?: PositionDual | null;
  onClose: () => void;
  onSave: (data: PositionDualFormData) => void;
  onUpdate: (id: string, data: PositionDualFormData) => void;
  loading?: boolean;
}

// 🎨 테마 관련 타입
export interface PositionDualTheme {
  primaryColor: string;
  secondaryColor: string;
  statusColors: {
    active: string;
    inactive: string;
    representative: string;
    pending: string;
  };
}

// 📱 반응형 브레이크포인트 타입
export type BreakpointSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveConfig {
  hideColumns?: string[];
  compactMode?: boolean;
  mobileLayout?: boolean;
}
