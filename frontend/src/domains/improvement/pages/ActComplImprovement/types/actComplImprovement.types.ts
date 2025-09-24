/**
 * 관리활동/이행점검 개선이행 페이지 관련 TypeScript 타입 정의
 * PositionMgmt.tsx 표준 템플릿 패턴을 따라 정의
 */

// 📊 개선이행 데이터 인터페이스
export interface ActComplImprovement {
  id: string;
  sequence: number; // 순번
  category: ImprovementCategory; // 구분 (관리활동/이행점검)
  departmentName: string; // 부품명
  categoryDetail?: string; // 구분상세
  activityName: string; // 관리활동명
  requestDate: string; // 개선요청일자
  requester: string; // 개선요청자
  improvementDate?: string; // 개선일자
  status: ImprovementStatus; // 진행상태
  result?: string; // 개선결과

  // 추가 필드들
  branchCode?: string; // 부점코드
  round?: string; // 회차
  priority?: ImprovementPriority; // 우선순위
  description?: string; // 상세설명
  requesterPosition?: string; // 요청자 직책
  completionRate?: number; // 진행률
  dueDate?: string; // 완료예정일
  verificationDate?: string; // 검증일자
  verifier?: string; // 검증자
  attachments?: File[]; // 첨부파일
}

// 🔍 개선이행 목록 필터 인터페이스
export interface ActComplImprovementFilters {
  branchCode: string; // 부점코드
  category: string; // 구분
  requestDateFrom: string; // 개선요청일자 시작
  requestDateTo: string; // 개선요청일자 종료
  round: string; // 회차
  status: string; // 진행상태
}

// 📈 개선이행 목록 통계 데이터 인터페이스
export interface ActComplImprovementStats {
  totalItems: number; // 전체 개선이행
  requestedItems: number; // 요청
  planningItems: number; // 계획수립
  approvedItems: number; // 승인완료
  inProgressItems: number; // 진행중
  completedItems: number; // 완료
  verifiedItems: number; // 검증완료
  closedItems: number; // 종료
  delayedItems: number; // 지연 항목
  averageCompletionDays: number; // 평균 완료 소요일
}

// 📄 개선이행 등록/수정 폼 데이터
export interface ActComplImprovementFormData {
  category: ImprovementCategory; // 구분
  branchCode: string; // 부점코드
  departmentName: string; // 부품명
  categoryDetail?: string; // 구분상세
  activityName: string; // 관리활동명
  requestDate: string; // 개선요청일자
  requester: string; // 개선요청자
  priority: ImprovementPriority; // 우선순위
  description: string; // 상세설명
  dueDate: string; // 완료예정일
  attachments?: File[]; // 첨부파일
}

// 📝 개선계획 수립 폼 데이터
export interface ImprovementPlanFormData {
  improvementId: string; // 개선이행 ID
  planTitle: string; // 계획 제목
  planDescription: string; // 계획 설명
  actionItems: string[]; // 조치 항목들
  responsible: string; // 담당자
  dueDate: string; // 완료예정일
  resources: string; // 필요 자원
  expectedOutcome: string; // 기대 효과
  attachments?: File[]; // 관련 첨부파일
}

// 📈 진행상황 업데이트 폼 데이터
export interface ProgressUpdateFormData {
  improvementId: string; // 개선이행 ID
  completionRate: number; // 진행률 (0-100)
  progressDescription: string; // 진행 상황 설명
  issues?: string; // 이슈 사항
  nextSteps: string; // 다음 단계
  updateDate: string; // 업데이트 일자
  attachments?: File[]; // 진행 증빙 자료
}

// ✅ 완료결과 등록 폼 데이터
export interface CompletionResultFormData {
  improvementId: string; // 개선이행 ID
  completionDate: string; // 완료일자
  resultDescription: string; // 결과 설명
  achievedOutcome: string; // 달성 성과
  verification: string; // 검증 방법
  effectiveness: EffectivenessRating; // 효과성 평가
  recommendations?: string; // 권고사항
  attachments?: File[]; // 완료 증빙 자료
}

// 🔄 페이지 상태 관리 인터페이스 (PositionMgmt 패턴)
export interface ActComplImprovementPageState {
  loading: boolean;
  error: string | null;
  lastRefresh: string;
}

// 📊 페이지네이션 인터페이스 (PositionMgmt 패턴)
export interface ActComplImprovementPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 인터페이스 (PositionMgmt 패턴)
export interface ActComplImprovementModalState {
  addModal: boolean; // 신규 등록 모달
  detailModal: boolean; // 상세 보기 모달
  planModal: boolean; // 개선계획 수립 모달
  progressModal: boolean; // 진행상황 업데이트 모달
  completionModal: boolean; // 완료결과 등록 모달
  selectedItem: ActComplImprovement | null;
}

// ⚙️ 로딩 상태 인터페이스 (성능 최적화용)
export interface ActComplImprovementLoadingStates {
  search: boolean;
  excel: boolean;
  add: boolean;
  update: boolean;
  delete: boolean;
  plan: boolean;
  progress: boolean;
  completion: boolean;
}

// 🎯 액션 타입 정의 (BaseActionBar 호환)
export type ActComplImprovementActionType =
  | 'add'
  | 'plan'
  | 'progress'
  | 'completion'
  | 'excel'
  | 'delete'
  | 'refresh';

// 📋 상태 코드 정의 (요구사항 문서 기준)
export enum ImprovementStatus {
  REQUESTED = 'REQUESTED', // 요청
  PLANNING = 'PLANNING', // 계획수립
  APPROVED = 'APPROVED', // 승인완료
  IN_PROGRESS = 'IN_PROGRESS', // 진행중
  COMPLETED = 'COMPLETED', // 완료
  VERIFIED = 'VERIFIED', // 검증완료
  CLOSED = 'CLOSED' // 종료
}

export enum ImprovementCategory {
  MGMT_ACTIVITY = 'MGMT_ACTIVITY', // 관리활동
  IMPL_INSPECTION = 'IMPL_INSPECTION', // 이행점검
  BOTH = 'BOTH' // 통합
}

export enum ImprovementPriority {
  URGENT = 'URGENT', // 긴급
  HIGH = 'HIGH', // 높음
  MEDIUM = 'MEDIUM', // 보통
  LOW = 'LOW' // 낮음
}

export enum EffectivenessRating {
  EXCELLENT = 'EXCELLENT', // 우수
  GOOD = 'GOOD', // 양호
  FAIR = 'FAIR', // 보통
  POOR = 'POOR' // 미흡
}

// 🎨 테마 및 스타일링 관련 인터페이스
export interface ActComplImprovementStyleConfig {
  compactMode: boolean;
  showAllColumns: boolean;
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
}

// 🔄 실시간 업데이트 관련 인터페이스 (향후 WebSocket 연동용)
export interface ActComplImprovementRealTimeUpdate {
  type: 'STATUS_CHANGE' | 'NEW_ITEM' | 'PLAN_UPDATE' | 'PROGRESS_UPDATE' | 'COMPLETION';
  itemId: string;
  timestamp: string;
  data: any;
}

// 📊 필터 옵션 정의
export interface ActComplImprovementFilterOptions {
  departments: { value: string; label: string }[];
  hackerLabs: { value: string; label: string }[];
  categories: { value: string; label: string }[];
  rounds: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
}

// 🎯 컴포넌트 Props 인터페이스들
export interface ActComplImprovementProps {
  className?: string;
  initialFilters?: Partial<ActComplImprovementFilters>;
  onItemSelect?: (item: ActComplImprovement) => void;
  onStatusChange?: (itemId: string, status: ImprovementStatus) => void;
}

export interface ActComplImprovementGridProps {
  data: ActComplImprovement[];
  loading?: boolean;
  pagination: ActComplImprovementPagination;
  selectedRows?: ActComplImprovement[];
  onRowSelect?: (rows: ActComplImprovement[]) => void;
  onRowClick?: (item: ActComplImprovement) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortModel: any) => void;
}

export interface ImprovementDetailModalProps {
  open: boolean;
  onClose: () => void;
  itemData?: ActComplImprovement | null;
  onUpdate?: (data: ActComplImprovementFormData) => void;
  title?: string;
}

export interface ImprovementPlanModalProps {
  open: boolean;
  onClose: () => void;
  itemData?: ActComplImprovement | null;
  onSubmit: (data: ImprovementPlanFormData) => void;
}

export interface ProgressUpdateModalProps {
  open: boolean;
  onClose: () => void;
  itemData?: ActComplImprovement | null;
  onSubmit: (data: ProgressUpdateFormData) => void;
}

export interface CompletionResultModalProps {
  open: boolean;
  onClose: () => void;
  itemData?: ActComplImprovement | null;
  onSubmit: (data: CompletionResultFormData) => void;
}

// 🚀 API 응답 인터페이스들
export interface ActComplImprovementApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ActComplImprovementListResponse {
  items: ActComplImprovement[];
  pagination: ActComplImprovementPagination;
  stats: ActComplImprovementStats;
}

export interface ActComplImprovementDataResponse {
  items: ActComplImprovement[];
  filterOptions: ActComplImprovementFilterOptions;
  stats: ActComplImprovementStats;
}

// 📅 AG-Grid 컬럼 정의 인터페이스
export interface ActComplImprovementColumnDef {
  field: keyof ActComplImprovement;
  headerName: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  sortable?: boolean;
  filter?: boolean;
  resizable?: boolean;
  cellRenderer?: string;
  cellStyle?: any;
  valueFormatter?: (params: any) => string;
  valueGetter?: (params: any) => any;
}

// 🔍 검색 및 정렬 관련 인터페이스
export interface ActComplImprovementSearchParams {
  filters: ActComplImprovementFilters;
  pagination: {
    page: number;
    size: number;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
}

// 📊 대시보드 메트릭 인터페이스
export interface ActComplImprovementMetrics {
  totalCount: number;
  statusDistribution: Record<ImprovementStatus, number>;
  categoryDistribution: Record<ImprovementCategory, number>;
  priorityDistribution: Record<ImprovementPriority, number>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    completionRate: number;
  }>;
  effectivenessMetrics: {
    averageCompletionDays: number;
    onTimeCompletionRate: number;
    delayedItems: number;
    effectivenessRating: Record<EffectivenessRating, number>;
  };
}

// 🔧 설정 관련 인터페이스
export interface ActComplImprovementSettings {
  defaultPageSize: number;
  autoRefreshInterval: number; // 초 단위
  showPreviewPane: boolean;
  enableNotifications: boolean;
  defaultFilters: Partial<ActComplImprovementFilters>;
}

// 📱 반응형 관련 인터페이스
export interface ActComplImprovementResponsiveConfig {
  mobileColumnsVisible: (keyof ActComplImprovement)[];
  tabletColumnsVisible: (keyof ActComplImprovement)[];
  desktopColumnsVisible: (keyof ActComplImprovement)[];
}

// 🎪 이벤트 관련 인터페이스
export interface ActComplImprovementEvents {
  onItemCreated?: (item: ActComplImprovement) => void;
  onItemUpdated?: (item: ActComplImprovement) => void;
  onItemDeleted?: (itemId: string) => void;
  onStatusChanged?: (item: ActComplImprovement) => void;
  onPlanCreated?: (plan: ImprovementPlanFormData) => void;
  onProgressUpdated?: (progress: ProgressUpdateFormData) => void;
  onCompletionRegistered?: (completion: CompletionResultFormData) => void;
  onBulkStatusUpdate?: (itemIds: string[], status: ImprovementStatus) => void;
}