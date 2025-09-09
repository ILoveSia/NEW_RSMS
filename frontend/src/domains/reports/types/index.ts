// 보고서 도메인 - 타입 정의

import { BaseEntity, ID, Timestamp } from '@/shared/types/common';
import { RiskLevel, RiskStatus, RiskCategory } from '@/domains/resps/types';

// ===== 보고서 기본 타입 =====

// 보고서 타입
export type ReportType = 
  | 'RISK_SUMMARY'      // 리스크 요약 보고서
  | 'RISK_DETAIL'       // 리스크 상세 보고서  
  | 'RISK_TREND'        // 리스크 트렌드 분석
  | 'COMPLIANCE'        // 컴플라이언스 보고서
  | 'EXECUTIVE_SUMMARY' // 경영진 요약 보고서
  | 'DEPARTMENT'        // 부서별 보고서
  | 'PROJECT'           // 프로젝트별 보고서
  | 'AUDIT'            // 감사 보고서
  | 'PERFORMANCE'       // 성과 분석 보고서
  | 'CUSTOM';           // 커스텀 보고서

// 보고서 상태
export type ReportStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';

// 보고서 형식
export type ReportFormat = 'PDF' | 'EXCEL' | 'HTML' | 'CSV' | 'JSON';

// 보고서 주기
export type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

// ===== 보고서 엔티티 =====

// 보고서 메인 엔티티
export interface Report extends BaseEntity {
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  
  // 생성 정보
  createdBy: ID;
  generatedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // 보고서 설정
  parameters: ReportParameters;
  template?: ReportTemplate;
  
  // 파일 정보
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
  
  // 스케줄링
  isScheduled: boolean;
  scheduleConfig?: ReportSchedule;
  nextRunAt?: Timestamp;
  
  // 공유 설정
  visibility: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC';
  sharedWith: ID[];
  
  // 메타데이터
  tags: string[];
  metadata?: Record<string, any>;
}

// 보고서 매개변수
export interface ReportParameters {
  // 날짜 범위
  dateRange: {
    startDate: Timestamp;
    endDate: Timestamp;
    period?: ReportPeriod;
  };
  
  // 필터링
  filters?: {
    riskLevels?: RiskLevel[];
    riskStatuses?: RiskStatus[];
    riskCategories?: RiskCategory[];
    departments?: string[];
    owners?: ID[];
    projects?: ID[];
    tags?: string[];
  };
  
  // 그룹화 및 정렬
  groupBy?: ('level' | 'status' | 'category' | 'department' | 'owner' | 'project')[];
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  
  // 차트 및 시각화
  includeCharts: boolean;
  chartTypes?: ChartType[];
  
  // 세부 설정
  includeDetails: boolean;
  includeAttachments: boolean;
  includeComments: boolean;
  maxRecords?: number;
  
  // 커스텀 필드
  customFields?: Record<string, any>;
}

// 차트 타입
export type ChartType = 
  | 'BAR' | 'LINE' | 'PIE' | 'DOUGHNUT' 
  | 'AREA' | 'SCATTER' | 'HISTOGRAM'
  | 'HEATMAP' | 'TREEMAP' | 'RADAR';

// ===== 보고서 템플릿 =====

// 보고서 템플릿
export interface ReportTemplate extends BaseEntity {
  name: string;
  description?: string;
  type: ReportType;
  
  // 템플릿 구조
  layout: ReportLayout;
  sections: ReportSection[];
  
  // 스타일링
  theme: ReportTheme;
  customStyles?: string; // CSS
  
  // 설정
  isDefault: boolean;
  isPublic: boolean;
  
  // 메타데이터
  createdBy: ID;
  usageCount: number;
  lastUsedAt?: Timestamp;
  
  tags: string[];
}

// 보고서 레이아웃
export interface ReportLayout {
  pageSize: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  header?: {
    enabled: boolean;
    height: number;
    content: string; // HTML template
  };
  
  footer?: {
    enabled: boolean;
    height: number;
    content: string; // HTML template
  };
}

// 보고서 섹션
export interface ReportSection {
  id: string;
  title: string;
  type: ReportSectionType;
  order: number;
  
  // 설정
  visible: boolean;
  pageBreak: boolean;
  
  // 콘텐츠
  content: ReportSectionContent;
  
  // 조건부 표시
  conditions?: ReportCondition[];
}

// 보고서 섹션 타입
export type ReportSectionType = 
  | 'TITLE'           // 제목 섹션
  | 'SUMMARY'         // 요약 섹션
  | 'TABLE'           // 테이블 섹션
  | 'CHART'           // 차트 섹션
  | 'TEXT'            // 텍스트 섹션
  | 'IMAGE'           // 이미지 섹션
  | 'LIST'            // 목록 섹션
  | 'METRICS'         // 지표 섹션
  | 'CUSTOM';         // 커스텀 섹션

// 보고서 섹션 콘텐츠
export interface ReportSectionContent {
  // 텍스트 콘텐츠
  text?: string;
  html?: string;
  
  // 데이터 소스
  dataSource?: string;
  query?: string;
  
  // 차트 설정
  chartConfig?: ChartConfig;
  
  // 테이블 설정
  tableConfig?: TableConfig;
  
  // 커스텀 설정
  customConfig?: Record<string, any>;
}

// 차트 설정
export interface ChartConfig {
  type: ChartType;
  title?: string;
  width: number;
  height: number;
  
  // 데이터 설정
  xAxis: string;
  yAxis: string | string[];
  
  // 스타일 설정
  colors?: string[];
  legend: boolean;
  grid: boolean;
  
  // 추가 옵션
  options?: Record<string, any>;
}

// 테이블 설정
export interface TableConfig {
  columns: TableColumn[];
  
  // 스타일 설정
  striped: boolean;
  bordered: boolean;
  compact: boolean;
  
  // 기능 설정
  sortable: boolean;
  paginated: boolean;
  pageSize?: number;
  
  // 총계/소계
  showTotals: boolean;
  totalFields?: string[];
}

// 테이블 컬럼
export interface TableColumn {
  field: string;
  title: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'CURRENCY' | 'PERCENTAGE';
  width?: number;
  align?: 'LEFT' | 'CENTER' | 'RIGHT';
  format?: string;
  sortable?: boolean;
  aggregation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
}

// 보고서 테마
export interface ReportTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // 폰트 설정
  fontFamily: string;
  fontSize: {
    title: number;
    heading: number;
    body: number;
    caption: number;
  };
  
  // 간격 설정
  spacing: {
    section: number;
    paragraph: number;
    line: number;
  };
}

// 보고서 조건
export interface ReportCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IN' | 'NOT_IN';
  value: any;
  logic?: 'AND' | 'OR';
}

// ===== 보고서 스케줄링 =====

// 보고서 스케줄
export interface ReportSchedule extends BaseEntity {
  reportId: ID;
  name: string;
  description?: string;
  
  // 스케줄 설정
  frequency: ReportPeriod;
  cronExpression?: string; // for custom scheduling
  
  // 실행 시간
  executionTime: {
    hour: number;
    minute: number;
    timezone: string;
  };
  
  // 날짜 설정
  startDate: Timestamp;
  endDate?: Timestamp;
  
  // 매개변수 오버라이드
  parameterOverrides?: Partial<ReportParameters>;
  
  // 배포 설정
  distribution: ReportDistribution;
  
  // 상태
  isActive: boolean;
  lastRunAt?: Timestamp;
  nextRunAt?: Timestamp;
  failureCount: number;
  
  // 생성 정보
  createdBy: ID;
}

// 보고서 배포 설정
export interface ReportDistribution {
  // 이메일 배포
  email?: {
    enabled: boolean;
    recipients: string[];
    ccRecipients?: string[];
    bccRecipients?: string[];
    subject: string;
    body?: string;
    attachReport: boolean;
    embedCharts: boolean;
  };
  
  // 파일 시스템 저장
  fileSystem?: {
    enabled: boolean;
    path: string;
    filename: string; // template with variables
    overwriteExisting: boolean;
  };
  
  // 외부 시스템 연동
  webhook?: {
    enabled: boolean;
    url: string;
    method: 'POST' | 'PUT';
    headers?: Record<string, string>;
    includeReportData: boolean;
  };
  
  // 내부 공유
  internalShare?: {
    enabled: boolean;
    departments: string[];
    users: ID[];
    teams: ID[];
    notifyRecipients: boolean;
  };
}

// ===== 보고서 실행 및 이력 =====

// 보고서 실행
export interface ReportExecution extends BaseEntity {
  reportId: ID;
  scheduleId?: ID;
  
  // 실행 정보
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration?: number; // milliseconds
  
  // 실행 결과
  recordCount?: number;
  fileSize?: number;
  filePath?: string;
  
  // 오류 정보
  error?: string;
  errorDetails?: string;
  stackTrace?: string;
  
  // 실행 매개변수
  parameters: ReportParameters;
  
  // 메타데이터
  executedBy?: ID; // null for scheduled reports
  trigger: 'MANUAL' | 'SCHEDULED' | 'API';
  
  // 성능 지표
  performanceMetrics?: {
    queryTime: number;
    renderTime: number;
    exportTime: number;
    memoryUsage: number;
  };
}

// 보고서 활동 로그
export interface ReportActivity extends BaseEntity {
  reportId: ID;
  activityType: ReportActivityType;
  description: string;
  
  // 사용자 정보
  performedBy: ID;
  performedAt: Timestamp;
  
  // 추가 정보
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// 보고서 활동 타입
export type ReportActivityType = 
  | 'CREATED' | 'UPDATED' | 'DELETED'
  | 'GENERATED' | 'DOWNLOADED' | 'SHARED'
  | 'SCHEDULED' | 'UNSCHEDULED'
  | 'TEMPLATE_APPLIED' | 'PARAMETERS_CHANGED'
  | 'EXPORTED' | 'ARCHIVED';

// ===== API 요청/응답 타입 =====

// 보고서 생성 요청
export interface CreateReportRequest {
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  parameters: ReportParameters;
  templateId?: ID;
  visibility?: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC';
  tags?: string[];
}

// 보고서 수정 요청
export interface UpdateReportRequest {
  title?: string;
  description?: string;
  parameters?: Partial<ReportParameters>;
  visibility?: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC';
  sharedWith?: ID[];
  tags?: string[];
}

// 보고서 실행 요청
export interface ExecuteReportRequest {
  reportId: ID;
  parameters?: Partial<ReportParameters>;
  format?: ReportFormat;
  async?: boolean; // true for background execution
}

// 보고서 목록 쿼리
export interface ReportQueryParams {
  search?: string;
  type?: ReportType[];
  status?: ReportStatus[];
  format?: ReportFormat[];
  createdBy?: ID[];
  
  // 날짜 필터
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  generatedAfter?: Timestamp;
  generatedBefore?: Timestamp;
  
  // 기타 필터
  tags?: string[];
  isScheduled?: boolean;
  visibility?: ('PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC')[];
  
  // 정렬
  sortBy?: 'title' | 'type' | 'status' | 'createdAt' | 'generatedAt' | 'downloadCount';
  sortDirection?: 'asc' | 'desc';
}

// 보고서 통계
export interface ReportStatistics {
  totalReports: number;
  reportsByType: Record<ReportType, number>;
  reportsByStatus: Record<ReportStatus, number>;
  reportsByFormat: Record<ReportFormat, number>;
  
  // 활동 통계
  totalExecutions: number;
  totalDownloads: number;
  averageGenerationTime: number; // milliseconds
  
  // 트렌드 데이터
  creationTrend: Array<{
    date: string;
    count: number;
  }>;
  
  executionTrend: Array<{
    date: string;
    count: number;
    successRate: number;
  }>;
  
  // 인기 보고서
  popularReports: Array<{
    reportId: ID;
    title: string;
    executionCount: number;
    downloadCount: number;
  }>;
}

// 보고서 대시보드 데이터
export interface ReportDashboardData {
  summary: {
    totalReports: number;
    scheduledReports: number;
    recentExecutions: number;
    failedExecutions: number;
  };
  
  recentReports: Report[];
  upcomingScheduled: Array<{
    reportId: ID;
    title: string;
    nextRunAt: Timestamp;
    frequency: ReportPeriod;
  }>;
  
  executionHistory: ReportExecution[];
  popularTemplates: ReportTemplate[];
}

// ===== 보고서 내보내기 및 공유 =====

// 보고서 내보내기 옵션
export interface ReportExportOptions {
  format: ReportFormat;
  includeCharts: boolean;
  includeAttachments: boolean;
  
  // PDF 특정 옵션
  pdf?: {
    pageSize: 'A4' | 'A3' | 'LETTER';
    orientation: 'PORTRAIT' | 'LANDSCAPE';
    quality: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  
  // Excel 특정 옵션
  excel?: {
    includeFormulas: boolean;
    separateSheets: boolean;
    includeCharts: boolean;
  };
}

// 보고서 공유
export interface ShareReportRequest {
  reportId: ID;
  shareWith: {
    users?: ID[];
    departments?: string[];
    teams?: ID[];
    external?: string[]; // email addresses
  };
  message?: string;
  expiresAt?: Timestamp;
  allowDownload: boolean;
  allowForward: boolean;
}

// 보고서 공유 링크
export interface ReportShareLink extends BaseEntity {
  reportId: ID;
  token: string;
  
  // 접근 제어
  allowedUsers?: ID[];
  allowedEmails?: string[];
  maxAccessCount?: number;
  currentAccessCount: number;
  
  // 유효성
  expiresAt?: Timestamp;
  isActive: boolean;
  
  // 권한
  allowDownload: boolean;
  allowForward: boolean;
  requireAuth: boolean;
  
  // 생성 정보
  createdBy: ID;
  
  // 사용 통계
  lastAccessedAt?: Timestamp;
  accessLog: Array<{
    accessedAt: Timestamp;
    ipAddress: string;
    userAgent: string;
    userId?: ID;
  }>;
}