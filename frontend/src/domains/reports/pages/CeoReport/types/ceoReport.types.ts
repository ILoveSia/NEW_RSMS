/**
 * CEO이행점검보고서 페이지 관련 TypeScript 타입 정의
 * PositionMgmt.tsx 표준 템플릿 패턴을 따라 정의
 */

// 📊 CEO 총괄관리의무 점검 데이터 인터페이스
export interface CeoOverallDutyInspection {
  id: string;
  order: number; // 순번
  responsibility: string; // 책무
  finalResult: string; // 최종결과
  inspectionResult: {
    written: number; // 점검결과(작성)
    notWritten: number; // 점검결과(부작성)
  };
  nonCompliance: number; // 미이행
  improvementOpinion: {
    completed: number; // 개선의견(완료)
    inProgress: number; // 개선의견(진행중)
  };
}

// 📊 총괄관리의무별 이행 부적정의견/개선의견 현황 인터페이스
export interface CeoComplianceOpinionStatus {
  id: string;
  order: number; // 순번
  responsibility: string; // 책무
  written: number; // 작성
  dutyCount: number; // 관리의무 수
  notWritten: number; // 부작성
  nonCompliance: number; // 미이행
  improvementOpinion: {
    completed: number; // 개선의견(완료)
    inProgress: number; // 개선의견(진행중)
  };
}

// 📈 CEO 대시보드 통계 데이터 인터페이스
export interface CeoDashboardStats {
  totalOverallDuties: number; // 총괄관리의무
  inspectionResults: {
    completed: number; // 점검결과(완료)
    inProgress: number; // 점검결과(진행중)
  };
  nonCompliance: number; // 미이행
  improvementActions: {
    completed: number; // 개선의견(완료)
    inProgress: number; // 개선의견(진행중)
  };
  // 성과 지표
  complianceRate: number; // 컴플라이언스 준수율 (%)
  completionRate: number; // 점검 완료율 (%)
}

// 🔍 CEO 보고서 필터 인터페이스
export interface CeoReportFilters {
  inspectionYear: string; // 점검연도
  inspectionName: string; // 점검명 (표시용)
  branchName: string; // 지점명 (필요시)
  inspectionStatus: string; // 점검상태
  improvementStatus: string; // 개선상태
}

// 📄 CEO 보고서 메타데이터 인터페이스
export interface CeoReportMetadata {
  reportId: string;
  reportTitle: string;
  inspectionYear: string;
  inspectionRound: string; // 점검회차 (예: "1회차")
  inspectionPeriod: {
    startDate: string;
    endDate: string;
  };
  reportStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

// 📝 CEO 신규 보고서 작성 폼 데이터
export interface CeoNewReportFormData {
  inspectionRound: string; // 점검회차
  inspectionPeriod: string; // 점검기간
  inspectionContent: string; // 점검내용
  attachments?: File[]; // 첨부파일
}

// 🔄 CEO 페이지 상태 관리 인터페이스
export interface CeoReportPageState {
  loading: boolean;
  error: string | null;
  lastRefresh: string;
}

// 📊 페이지네이션 인터페이스 (PositionMgmt 패턴)
export interface CeoReportPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 인터페이스 (PositionMgmt 패턴)
export interface CeoReportModalState {
  formModal: boolean; // 신규 보고서 작성 모달
  detailModal: boolean; // 상세 보기 모달
  templateModal: boolean; // 템플릿 다운로드 모달
  selectedReport: CeoReportMetadata | null;
}

// ⚙️ 로딩 상태 인터페이스 (성능 최적화용)
export interface CeoReportLoadingStates {
  search: boolean;
  templateDownload: boolean;
  newReport: boolean;
  refresh: boolean;
  excel?: boolean; // 필요시 추가
}

// 🎯 액션 타입 정의 (BaseActionBar 호환)
export type CeoReportActionType =
  | 'templateDownload'
  | 'newReport'
  | 'refresh'
  | 'excel'
  | 'export';

// 📋 상태 코드 정의 (요구사항 문서 기준)
export enum CeoInspectionStatus {
  DRAFTED = 'DRAFTED', // 작성
  NOT_STARTED = 'NOT_STARTED', // 부작성
  COMPLETED = 'COMPLETED', // 완료
  IN_PROGRESS = 'IN_PROGRESS', // 진행중
  NON_COMPLIANCE = 'NON_COMPLIANCE' // 미이행
}

export enum CeoImprovementStatus {
  COMPLETED = 'COMPLETED', // 완료
  IN_PROGRESS = 'IN_PROGRESS', // 진행중
  PLANNED = 'PLANNED', // 계획
  NOT_REQUIRED = 'NOT_REQUIRED' // 불필요
}

export enum CeoOverallDutyType {
  OVERALL_MGMT = 'OVERALL_MGMT', // 총괄관리
  STRATEGIC_MGMT = 'STRATEGIC_MGMT', // 전략관리
  RISK_MGMT = 'RISK_MGMT', // 리스크관리
  COMPLIANCE_MGMT = 'COMPLIANCE_MGMT' // 컴플라이언스관리
}

// 🎨 테마 및 스타일링 관련 인터페이스
export interface CeoReportStyleConfig {
  compactMode: boolean;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;
}

// 🔄 실시간 업데이트 관련 인터페이스 (향후 WebSocket 연동용)
export interface CeoReportRealTimeUpdate {
  type: 'STATUS_CHANGE' | 'NEW_REPORT' | 'APPROVAL_UPDATE';
  reportId: string;
  timestamp: string;
  data: any;
}

// 📊 집계 현황 요약 정보 (이미지 기준)
export interface CeoSummaryStats {
  totalOverallDuties: number; // 총괄관리의무
  inspectionResults: {
    completed: number; // 완료
    inProgress: number; // 진행중
  };
  nonCompliance: number; // 미이행
  improvementOpinions: {
    completed: number; // 완료
    inProgress: number; // 진행중
  };
}

// 📅 점검 현황 필터 옵션 정의
export interface CeoFilterOptions {
  inspectionYears: { value: string; label: string }[];
  inspectionNames: { value: string; label: string }[];
  branches: { value: string; label: string }[];
  inspectionStatuses: { value: string; label: string }[];
  improvementStatuses: { value: string; label: string }[];
}

// 🎯 컴포넌트 Props 인터페이스들
export interface CeoReportProps {
  className?: string;
  initialFilters?: Partial<CeoReportFilters>;
  onReportSelect?: (report: CeoReportMetadata) => void;
}

export interface CeoSummaryTableProps {
  data: CeoSummaryStats;
  loading?: boolean;
  onRefresh?: () => void;
}

export interface CeoOverallDutyTableProps {
  data: CeoOverallDutyInspection[];
  loading?: boolean;
  onItemClick?: (item: CeoOverallDutyInspection) => void;
}

export interface CeoComplianceTableProps {
  data: CeoComplianceOpinionStatus[];
  loading?: boolean;
  onItemClick?: (item: CeoComplianceOpinionStatus) => void;
}

// 🚀 API 응답 인터페이스들
export interface CeoReportApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface CeoReportListResponse {
  reports: CeoReportMetadata[];
  pagination: CeoReportPagination;
  stats: CeoDashboardStats;
}

export interface CeoInspectionDataResponse {
  summaryStats: CeoSummaryStats;
  overallDutyInspections: CeoOverallDutyInspection[];
  complianceOpinionStatuses: CeoComplianceOpinionStatus[];
  filterOptions: CeoFilterOptions;
}