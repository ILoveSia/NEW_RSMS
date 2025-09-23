/**
 * 보고서목록 페이지 관련 TypeScript 타입 정의
 * PositionMgmt.tsx 표준 템플릿 패턴을 따라 정의
 */

// 📊 보고서 데이터 인터페이스
export interface Report {
  id: string;
  sequence: number; // 순번
  department: string; // 부서
  category: string; // 구분 (임원/CEO/부서별)
  inspectionName: string; // 점검명
  inspectionPeriod: string; // 점검기간
  reportNumber: string; // 보고서번호
  status: ReportStatus; // 상태
  author: string; // 작성자
  createdAt: string; // 작성일자
  approver?: string; // 결재자
  approvedAt?: string; // 결재일자
  reviewContent?: string; // 검토내용
  result?: string; // 결과
  improvementAction?: string; // 개선조치
}

// 🔍 보고서 목록 필터 인터페이스
export interface ReportListFilters {
  inspectionYear: string; // 점검연도
  branchName: string; // 부점명
  inspectionStatus: string; // 점검상태
}

// 📈 보고서 목록 통계 데이터 인터페이스
export interface ReportListStats {
  totalReports: number; // 전체 보고서
  draftReports: number; // 작성중
  submittedReports: number; // 제출완료
  approvedReports: number; // 승인완료
  rejectedReports: number; // 반려
  improvementActions: {
    planned: number; // 개선조치 계획
    inProgress: number; // 개선조치 진행중
    completed: number; // 개선조치 완료
  };
}

// 📄 보고서 작성 폼 데이터
export interface ReportFormData {
  inspectionRound: string; // 점검회차
  inspectionPeriod: string; // 점검기간
  reviewContent: string; // 검토내용
  attachments?: File[]; // 첨부파일
  reportType?: 'CEO' | 'EXECUTIVE' | 'DEPARTMENT'; // 보고서 유형
}

// 🔄 페이지 상태 관리 인터페이스 (PositionMgmt 패턴)
export interface ReportListPageState {
  loading: boolean;
  error: string | null;
  lastRefresh: string;
}

// 📊 페이지네이션 인터페이스 (PositionMgmt 패턴)
export interface ReportListPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 인터페이스 (PositionMgmt 패턴)
export interface ReportListModalState {
  ceoReportModal: boolean; // CEO 보고서 작성 모달
  newReportModal: boolean; // 신규 보고서 작성 모달
  improvementModal: boolean; // 개선조치 등록 모달
  detailModal: boolean; // 상세 보기 모달
  selectedReport: Report | null;
}

// ⚙️ 로딩 상태 인터페이스 (성능 최적화용)
export interface ReportListLoadingStates {
  search: boolean;
  excel: boolean;
  ceoReport: boolean;
  newReport: boolean;
  improvement: boolean;
  delete: boolean;
}

// 🎯 액션 타입 정의 (BaseActionBar 호환)
export type ReportListActionType =
  | 'improvement'
  | 'ceoReport'
  | 'newReport'
  | 'excel'
  | 'delete'
  | 'refresh';

// 📋 상태 코드 정의 (요구사항 문서 기준)
export enum ReportStatus {
  DRAFT = 'DRAFT', // 작성중
  SUBMITTED = 'SUBMITTED', // 제출완료
  REVIEWING = 'REVIEWING', // 검토중
  APPROVED = 'APPROVED', // 승인완료
  REJECTED = 'REJECTED', // 반려
  COMPLETED = 'COMPLETED' // 완료
}

export enum ReportCategory {
  EXECUTIVE = 'EXECUTIVE', // 임원보고서
  CEO = 'CEO', // CEO보고서
  DEPARTMENT = 'DEPARTMENT', // 부서보고서
  INTEGRATED = 'INTEGRATED' // 통합보고서
}

export enum ImprovementActionStatus {
  PLANNED = 'PLANNED', // 계획수립
  IN_PROGRESS = 'IN_PROGRESS', // 진행중
  COMPLETED = 'COMPLETED', // 완료
  CANCELLED = 'CANCELLED', // 취소
  POSTPONED = 'POSTPONED' // 연기
}

// 🎨 테마 및 스타일링 관련 인터페이스
export interface ReportListStyleConfig {
  compactMode: boolean;
  showAllColumns: boolean;
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
}

// 🔄 실시간 업데이트 관련 인터페이스 (향후 WebSocket 연동용)
export interface ReportListRealTimeUpdate {
  type: 'STATUS_CHANGE' | 'NEW_REPORT' | 'APPROVAL_UPDATE' | 'IMPROVEMENT_ACTION';
  reportId: string;
  timestamp: string;
  data: any;
}

// 📊 필터 옵션 정의
export interface ReportListFilterOptions {
  inspectionYears: { value: string; label: string }[];
  branches: { value: string; label: string }[];
  inspectionStatuses: { value: string; label: string }[];
  reportCategories: { value: string; label: string }[];
}

// 🎯 컴포넌트 Props 인터페이스들
export interface ReportListProps {
  className?: string;
  initialFilters?: Partial<ReportListFilters>;
  onReportSelect?: (report: Report) => void;
  onReportStatusChange?: (reportId: string, status: ReportStatus) => void;
}

export interface ReportListGridProps {
  data: Report[];
  loading?: boolean;
  pagination: ReportListPagination;
  selectedRows?: Report[];
  onRowSelect?: (rows: Report[]) => void;
  onRowClick?: (report: Report) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortModel: any) => void;
}

export interface ReportFormModalProps {
  open: boolean;
  onClose: () => void;
  reportType: 'CEO' | 'EXECUTIVE' | 'DEPARTMENT';
  reportData?: Report | null;
  onSubmit: (data: ReportFormData) => void;
  title?: string;
}

export interface ImprovementActionModalProps {
  open: boolean;
  onClose: () => void;
  reportData?: Report | null;
  onSubmit: (data: ImprovementActionFormData) => void;
}

// 📝 개선조치 폼 데이터
export interface ImprovementActionFormData {
  reportId: string;
  actionPlan: string; // 개선조치 계획
  responsible: string; // 담당자
  dueDate: string; // 완료예정일
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // 우선순위
  description: string; // 상세내용
  attachments?: File[]; // 관련 첨부파일
}

// 🚀 API 응답 인터페이스들
export interface ReportListApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ReportListResponse {
  reports: Report[];
  pagination: ReportListPagination;
  stats: ReportListStats;
}

export interface ReportListDataResponse {
  reports: Report[];
  filterOptions: ReportListFilterOptions;
  stats: ReportListStats;
}

// 📅 AG-Grid 컬럼 정의 인터페이스
export interface ReportListColumnDef {
  field: keyof Report;
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
export interface ReportListSearchParams {
  filters: ReportListFilters;
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
export interface ReportListMetrics {
  totalCount: number;
  statusDistribution: Record<ReportStatus, number>;
  categoryDistribution: Record<ReportCategory, number>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    approvalRate: number;
  }>;
  improvementActionMetrics: {
    totalActions: number;
    completionRate: number;
    overdue: number;
  };
}

// 🔧 설정 관련 인터페이스
export interface ReportListSettings {
  defaultPageSize: number;
  autoRefreshInterval: number; // 초 단위
  showPreviewPane: boolean;
  enableNotifications: boolean;
  defaultFilters: Partial<ReportListFilters>;
}

// 📱 반응형 관련 인터페이스
export interface ReportListResponsiveConfig {
  mobileColumnsVisible: (keyof Report)[];
  tabletColumnsVisible: (keyof Report)[];
  desktopColumnsVisible: (keyof Report)[];
}

// 🎪 이벤트 관련 인터페이스
export interface ReportListEvents {
  onReportCreated?: (report: Report) => void;
  onReportUpdated?: (report: Report) => void;
  onReportDeleted?: (reportId: string) => void;
  onReportApproved?: (report: Report) => void;
  onReportRejected?: (report: Report, reason: string) => void;
  onImprovementActionCreated?: (action: ImprovementActionFormData) => void;
  onBulkStatusUpdate?: (reportIds: string[], status: ReportStatus) => void;
}