// 대시보드 도메인 - 타입 정의

import { BaseEntity, ID, Timestamp } from '@/shared/types/common';
import { RiskLevel, RiskStatus, RiskCategory } from '@/domains/resps/types';
import { UserRole } from '@/domains/auth/types';

// ===== 대시보드 기본 타입 =====

// 대시보드 타입
export type DashboardType = 
  | 'EXECUTIVE'     // 경영진 대시보드
  | 'OPERATIONAL'   // 운영 대시보드
  | 'RISK_MANAGER'  // 리스크 매니저 대시보드
  | 'DEPARTMENT'    // 부서별 대시보드
  | 'PROJECT'       // 프로젝트 대시보드
  | 'PERSONAL'      // 개인 대시보드
  | 'CUSTOM';       // 커스텀 대시보드

// 대시보드 레이아웃
export type DashboardLayout = 
  | 'GRID'          // 그리드 레이아웃
  | 'MASONRY'       // 벽돌 레이아웃
  | 'VERTICAL'      // 세로 레이아웃
  | 'HORIZONTAL'    // 가로 레이아웃
  | 'TABS';         // 탭 레이아웃

// 위젯 타입
export type WidgetType = 
  | 'METRIC'        // 지표 위젯
  | 'CHART'         // 차트 위젯
  | 'TABLE'         // 테이블 위젯
  | 'LIST'          // 리스트 위젯
  | 'PROGRESS'      // 진행률 위젯
  | 'ALERT'         // 알림 위젯
  | 'CALENDAR'      // 캘린더 위젯
  | 'MAP'           // 지도 위젯
  | 'TEXT'          // 텍스트 위젯
  | 'IMAGE'         // 이미지 위젯
  | 'IFRAME'        // 외부 콘텐츠 위젯
  | 'CUSTOM';       // 커스텀 위젯

// ===== 대시보드 엔티티 =====

// 대시보드
export interface Dashboard extends BaseEntity {
  name: string;
  description?: string;
  type: DashboardType;
  layout: DashboardLayout;
  
  // 권한 및 접근 제어
  isPublic: boolean;
  isDefault: boolean;
  visibility: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC';
  
  // 소유자 및 공유
  ownerId: ID;
  sharedWith: ID[];
  allowedRoles: UserRole[];
  
  // 레이아웃 설정
  gridSettings: GridSettings;
  widgets: DashboardWidget[];
  
  // 새로고침 설정
  autoRefresh: boolean;
  refreshInterval?: number; // seconds
  
  // 필터 설정
  globalFilters: DashboardFilter[];
  
  // 메타데이터
  tags: string[];
  lastViewedAt?: Timestamp;
  viewCount: number;
  
  // 테마 설정
  theme: DashboardTheme;
}

// 그리드 설정
export interface GridSettings {
  columns: number;
  rowHeight: number;
  gap: number;
  compact: boolean;
  
  // 반응형 설정
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  
  // 컬럼 수 설정 (breakpoint별)
  cols: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
}

// 대시보드 위젯
export interface DashboardWidget extends BaseEntity {
  dashboardId: ID;
  type: WidgetType;
  title: string;
  description?: string;
  
  // 위치 및 크기
  position: WidgetPosition;
  
  // 데이터 설정
  dataSource: WidgetDataSource;
  
  // 표시 설정
  config: WidgetConfig;
  
  // 새로고침 설정
  autoRefresh: boolean;
  refreshInterval?: number; // seconds
  lastRefreshedAt?: Timestamp;
  
  // 권한
  isVisible: boolean;
  requiredPermissions?: string[];
  
  // 상호작용 설정
  clickable: boolean;
  drilldownEnabled: boolean;
  drilldownConfig?: DrilldownConfig;
}

// 위젯 위치
export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  
  // 최소/최대 크기
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  
  // 이동 및 크기 조정 제한
  static?: boolean;
  resizable?: boolean;
  draggable?: boolean;
}

// 위젯 데이터 소스
export interface WidgetDataSource {
  type: 'API' | 'QUERY' | 'STATIC' | 'COMPUTED';
  
  // API 데이터 소스
  apiEndpoint?: string;
  apiParams?: Record<string, any>;
  
  // 쿼리 데이터 소스
  query?: string;
  queryParams?: Record<string, any>;
  
  // 정적 데이터
  staticData?: any;
  
  // 계산된 데이터
  computedFrom?: string[];
  computeFunction?: string;
  
  // 캐싱 설정
  cacheEnabled: boolean;
  cacheTtl?: number; // seconds
  
  // 필터링
  filters?: WidgetFilter[];
  
  // 집계 설정
  aggregation?: {
    groupBy: string[];
    measures: Array<{
      field: string;
      function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
      alias?: string;
    }>;
  };
}

// 위젯 설정
export interface WidgetConfig {
  // 공통 설정
  showTitle: boolean;
  showDescription: boolean;
  showLastUpdated: boolean;
  
  // 메트릭 위젯 설정
  metric?: MetricWidgetConfig;
  
  // 차트 위젯 설정
  chart?: ChartWidgetConfig;
  
  // 테이블 위젯 설정
  table?: TableWidgetConfig;
  
  // 리스트 위젯 설정
  list?: ListWidgetConfig;
  
  // 진행률 위젯 설정
  progress?: ProgressWidgetConfig;
  
  // 알림 위젯 설정
  alert?: AlertWidgetConfig;
  
  // 스타일 설정
  style?: WidgetStyle;
  
  // 조건부 포맷팅
  conditionalFormatting?: ConditionalFormatRule[];
}

// 메트릭 위젯 설정
export interface MetricWidgetConfig {
  valueField: string;
  format: 'NUMBER' | 'CURRENCY' | 'PERCENTAGE' | 'DURATION';
  precision?: number;
  prefix?: string;
  suffix?: string;
  
  // 비교 값
  compareField?: string;
  compareType?: 'PREVIOUS_PERIOD' | 'TARGET' | 'BASELINE';
  showTrend: boolean;
  
  // 임계값
  thresholds?: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  
  // 스파크라인
  showSparkline: boolean;
  sparklineField?: string;
}

// 차트 위젯 설정
export interface ChartWidgetConfig {
  chartType: 'BAR' | 'LINE' | 'PIE' | 'DOUGHNUT' | 'AREA' | 'SCATTER' | 'HEATMAP';
  
  // 축 설정
  xAxis: {
    field: string;
    title?: string;
    type?: 'CATEGORY' | 'NUMBER' | 'DATE';
  };
  
  yAxis: Array<{
    field: string;
    title?: string;
    type?: 'NUMBER' | 'PERCENTAGE';
    position?: 'LEFT' | 'RIGHT';
  }>;
  
  // 시리즈 설정
  series: Array<{
    name: string;
    field: string;
    type?: 'BAR' | 'LINE' | 'AREA';
    color?: string;
    yAxisIndex?: number;
  }>;
  
  // 범례 및 도구
  legend: {
    show: boolean;
    position: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
  };
  
  tooltip: {
    show: boolean;
    format?: string;
  };
  
  // 줌 및 팬
  zoom: boolean;
  pan: boolean;
  
  // 애니메이션
  animation: boolean;
  animationDuration?: number;
}

// 테이블 위젯 설정
export interface TableWidgetConfig {
  columns: Array<{
    field: string;
    title: string;
    width?: number;
    align?: 'LEFT' | 'CENTER' | 'RIGHT';
    format?: string;
    sortable?: boolean;
  }>;
  
  // 기능 설정
  sortable: boolean;
  filterable: boolean;
  searchable: boolean;
  
  // 페이징
  pagination: {
    enabled: boolean;
    pageSize: number;
    showSizeChanger: boolean;
  };
  
  // 스타일
  striped: boolean;
  bordered: boolean;
  compact: boolean;
  
  // 액션
  showActions: boolean;
  actions?: Array<{
    name: string;
    icon: string;
    action: string;
  }>;
}

// 리스트 위젯 설정
export interface ListWidgetConfig {
  template: string; // HTML template
  groupBy?: string;
  maxItems?: number;
  showMore: boolean;
  
  // 아이템 설정
  itemHeight?: number;
  itemSpacing?: number;
  
  // 정렬
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// 진행률 위젯 설정
export interface ProgressWidgetConfig {
  valueField: string;
  maxValueField?: string;
  maxValue?: number;
  
  format: 'PERCENTAGE' | 'FRACTION' | 'NUMBER';
  type: 'BAR' | 'CIRCLE' | 'SEMI_CIRCLE';
  
  // 색상 설정
  color?: string;
  trackColor?: string;
  
  // 애니메이션
  animated: boolean;
  
  // 라벨
  showLabel: boolean;
  labelFormat?: string;
}

// 알림 위젯 설정
export interface AlertWidgetConfig {
  alertType: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  
  // 조건 설정
  conditions: Array<{
    field: string;
    operator: 'GT' | 'LT' | 'EQ' | 'NE' | 'GTE' | 'LTE';
    value: any;
    logic?: 'AND' | 'OR';
  }>;
  
  // 액션
  showAction: boolean;
  actionText?: string;
  actionUrl?: string;
  
  // 자동 해제
  autoDismiss: boolean;
  dismissAfter?: number; // seconds
}

// 위젯 스타일
export interface WidgetStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  
  // 헤더 스타일
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerHeight?: number;
  
  // 콘텐츠 스타일
  contentPadding?: number;
  contentBackgroundColor?: string;
  contentTextColor?: string;
  
  // 그림자
  boxShadow?: string;
  
  // 폰트
  fontSize?: number;
  fontWeight?: 'NORMAL' | 'BOLD';
  fontFamily?: string;
}

// 조건부 포맷팅 규칙
export interface ConditionalFormatRule {
  field: string;
  conditions: Array<{
    operator: 'GT' | 'LT' | 'EQ' | 'NE' | 'GTE' | 'LTE' | 'CONTAINS' | 'BETWEEN';
    value: any;
    value2?: any; // for BETWEEN
    logic?: 'AND' | 'OR';
  }>;
  
  // 적용할 스타일
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: 'NORMAL' | 'BOLD';
    icon?: string;
    iconColor?: string;
  };
  
  priority: number;
}

// 드릴다운 설정
export interface DrilldownConfig {
  enabled: boolean;
  type: 'DASHBOARD' | 'REPORT' | 'URL' | 'MODAL';
  
  // 대상 설정
  targetDashboardId?: ID;
  targetReportId?: ID;
  targetUrl?: string;
  
  // 매개변수 매핑
  parameterMapping?: Record<string, string>;
  
  // 모달 설정
  modalSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FULLSCREEN';
}

// ===== 대시보드 필터 =====

// 대시보드 필터
export interface DashboardFilter {
  id: string;
  name: string;
  type: 'SELECT' | 'MULTI_SELECT' | 'DATE_RANGE' | 'NUMBER_RANGE' | 'TEXT' | 'BOOLEAN';
  
  // 필터 대상
  targetWidgets: string[]; // widget IDs
  targetField: string;
  
  // 옵션 설정
  options?: FilterOption[];
  
  // 기본값
  defaultValue?: any;
  currentValue?: any;
  
  // 표시 설정
  visible: boolean;
  required: boolean;
  
  // 동적 옵션
  dynamicOptions?: {
    dataSource: string;
    valueField: string;
    labelField: string;
    sortBy?: string;
  };
}

// 필터 옵션
export interface FilterOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

// 위젯 필터
export interface WidgetFilter {
  field: string;
  operator: 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'BETWEEN';
  value: any;
  value2?: any; // for BETWEEN
  logic?: 'AND' | 'OR';
  
  // 동적 필터
  isDynamic?: boolean;
  dynamicSource?: string; // reference to dashboard filter
}

// ===== 대시보드 테마 =====

// 대시보드 테마
export interface DashboardTheme {
  name: string;
  
  // 색상 팔레트
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    info: string;
    success: string;
  };
  
  // 텍스트 색상
  textColors: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  
  // 타이포그래피
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  
  // 간격
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // 보더 및 그림자
  borders: {
    radius: {
      small: number;
      medium: number;
      large: number;
    };
    width: {
      thin: number;
      medium: number;
      thick: number;
    };
  };
  
  shadows: {
    light: string;
    medium: string;
    heavy: string;
  };
}

// ===== API 요청/응답 타입 =====

// 대시보드 생성 요청
export interface CreateDashboardRequest {
  name: string;
  description?: string;
  type: DashboardType;
  layout: DashboardLayout;
  isPublic?: boolean;
  visibility?: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC';
  sharedWith?: ID[];
  tags?: string[];
  gridSettings?: Partial<GridSettings>;
  theme?: Partial<DashboardTheme>;
}

// 대시보드 수정 요청
export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  visibility?: 'PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC';
  sharedWith?: ID[];
  tags?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  gridSettings?: Partial<GridSettings>;
  globalFilters?: DashboardFilter[];
  theme?: Partial<DashboardTheme>;
}

// 위젯 생성 요청
export interface CreateWidgetRequest {
  dashboardId: ID;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  dataSource: WidgetDataSource;
  config: WidgetConfig;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// 위젯 수정 요청
export interface UpdateWidgetRequest {
  title?: string;
  description?: string;
  position?: Partial<WidgetPosition>;
  dataSource?: Partial<WidgetDataSource>;
  config?: Partial<WidgetConfig>;
  autoRefresh?: boolean;
  refreshInterval?: number;
  isVisible?: boolean;
}

// 대시보드 쿼리 파라미터
export interface DashboardQueryParams {
  search?: string;
  type?: DashboardType[];
  ownerId?: ID[];
  visibility?: ('PRIVATE' | 'TEAM' | 'DEPARTMENT' | 'PUBLIC')[];
  tags?: string[];
  
  // 날짜 필터
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  viewedAfter?: Timestamp;
  
  // 정렬
  sortBy?: 'name' | 'type' | 'createdAt' | 'lastViewedAt' | 'viewCount';
  sortDirection?: 'asc' | 'desc';
}

// ===== 대시보드 통계 및 분석 =====

// 대시보드 통계
export interface DashboardStatistics {
  totalDashboards: number;
  dashboardsByType: Record<DashboardType, number>;
  dashboardsByVisibility: Record<string, number>;
  
  // 사용 통계
  totalViews: number;
  dailyViews: Array<{
    date: string;
    views: number;
    uniqueUsers: number;
  }>;
  
  // 인기 대시보드
  popularDashboards: Array<{
    dashboardId: ID;
    name: string;
    viewCount: number;
    lastViewedAt: Timestamp;
  }>;
  
  // 위젯 통계
  totalWidgets: number;
  widgetsByType: Record<WidgetType, number>;
  averageWidgetsPerDashboard: number;
  
  // 성능 지표
  averageLoadTime: number; // milliseconds
  refreshFailureRate: number; // percentage
}

// 대시보드 사용 분석
export interface DashboardUsageAnalytics {
  dashboardId: ID;
  period: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  
  // 방문 통계
  totalViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number; // minutes
  bounceRate: number; // percentage
  
  // 시간대별 사용 패턴
  hourlyUsage: Array<{
    hour: number;
    views: number;
  }>;
  
  dailyUsage: Array<{
    date: string;
    views: number;
    users: number;
  }>;
  
  // 위젯별 상호작용
  widgetInteractions: Array<{
    widgetId: ID;
    widgetTitle: string;
    views: number;
    clicks: number;
    drilldowns: number;
  }>;
  
  // 필터 사용
  filterUsage: Array<{
    filterId: string;
    filterName: string;
    usageCount: number;
    uniqueValues: string[];
  }>;
  
  // 사용자별 액세스
  userAccess: Array<{
    userId: ID;
    username: string;
    accessCount: number;
    lastAccessAt: Timestamp;
    totalDuration: number; // minutes
  }>;
}

// 대시보드 실시간 데이터
export interface DashboardRealtimeData {
  dashboardId: ID;
  widgets: Array<{
    widgetId: ID;
    data: any;
    lastUpdated: Timestamp;
    status: 'LOADING' | 'SUCCESS' | 'ERROR';
    error?: string;
  }>;
  
  // 시스템 상태
  systemStatus: {
    dataSourcesOnline: number;
    totalDataSources: number;
    averageResponseTime: number;
    errorRate: number;
  };
  
  timestamp: Timestamp;
}