// 전역 상태 관리 타입 정의
// Zustand + TanStack Query 기반 상태 관리

import { Role, User, UserRoleCode } from '@/domains/auth/types';
import { DashboardTheme } from '@/domains/dashboard/types';
import { NotificationSettings, UserProfile } from '@/domains/users/types';

// ===== 전역 상태 인터페이스 =====

// 루트 스토어 타입
export interface RootState {
  auth: AuthState;
  ui: UIState;
  app: AppState;
  preferences: PreferencesState;
}

// ===== 인증 상태 =====

// 인증 상태
export interface AuthState {
  // 사용자 정보
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;

  // 권한 정보
  permissions: string[];
  roles: Role[]; // DB에서 로드된 역할 객체들
  roleCodes: UserRoleCode[]; // 역할 코드 배열 (편의용)

  // 에러 상태
  error: string | null;

  // 액션 메서드
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;

  // 권한 체크 헬퍼
  hasPermission: (permission: string) => boolean;
  hasRole: (roleCode: UserRoleCode) => boolean;
  hasRoleLevel: (level: number) => boolean; // 특정 레벨 이상의 권한 체크
  hasAnyRole: (roleCodes: UserRoleCode[]) => boolean;
  hasAllRoles: (roleCodes: UserRoleCode[]) => boolean;
  getHighestRoleLevel: () => number; // 사용자의 최고 권한 레벨 반환
  getRoleByCode: (roleCode: UserRoleCode) => Role | undefined; // 역할 코드로 Role 객체 조회
}

// ===== UI 상태 =====

// UI 상태
export interface UIState {
  // 레이아웃 상태
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // 테마 설정
  theme: 'light' | 'dark' | 'auto';
  customTheme?: DashboardTheme;

  // 로딩 상태
  loading: LoadingState;

  // 모달 상태
  modals: ModalState;

  // 알림 상태
  notifications: NotificationState[];

  // 브레드크럼
  breadcrumbs: BreadcrumbItem[];

  // 페이지 타이틀
  pageTitle: string;

  // 액션 메서드
  toggleSidebar: () => void;
  collapseSidebar: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setCustomTheme: (theme: DashboardTheme) => void;
  setLoading: (key: string, loading: boolean) => void;
  showModal: (modalId: string, props?: any) => void;
  hideModal: (modalId: string) => void;
  showNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => void;
  hideNotification: (id: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setPageTitle: (title: string) => void;
}

// 로딩 상태
export interface LoadingState {
  [key: string]: boolean;
}

// 모달 상태
export interface ModalState {
  [modalId: string]: {
    isOpen: boolean;
    props?: any;
    zIndex?: number;
  };
}

// 알림 상태
export interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // auto-hide duration in ms
  actions?: NotificationAction[];
  timestamp: Date;
}

// 알림 액션
export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

// 브레드크럼 항목
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// ===== 앱 상태 =====

// 앱 상태
export interface AppState {
  // 앱 정보
  version: string;
  environment: 'development' | 'staging' | 'production';

  // 연결 상태
  isOnline: boolean;
  connectionQuality: 'good' | 'slow' | 'offline';

  // 언어 설정
  locale: 'ko' | 'en';
  availableLocales: string[];

  // 라우팅 상태
  currentRoute: string;
  previousRoute: string;

  // 전역 필터
  globalFilters: GlobalFilter[];

  // 검색 상태
  searchHistory: string[];
  recentSearches: string[];

  // 액션 메서드
  setOnlineStatus: (online: boolean) => void;
  setConnectionQuality: (quality: 'good' | 'slow' | 'offline') => void;
  changeLocale: (locale: 'ko' | 'en') => void;
  setCurrentRoute: (route: string) => void;
  addGlobalFilter: (filter: GlobalFilter) => void;
  removeGlobalFilter: (filterId: string) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

// 전역 필터
export interface GlobalFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'text' | 'number';
  value: any;
  active: boolean;
}

// ===== 환경설정 상태 =====

// 환경설정 상태
export interface PreferencesState {
  // 사용자 프로필
  profile: UserProfile | null;

  // 알림 설정
  notificationSettings: NotificationSettings;

  // 테이블 설정
  tablePreferences: Record<string, TablePreference>;

  // 대시보드 설정
  dashboardPreferences: DashboardPreferences;

  // 단축키 설정
  shortcuts: KeyboardShortcut[];

  // 즐겨찾기
  bookmarks: Bookmark[];

  // 최근 항목
  recentItems: RecentItem[];

  // 액션 메서드
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateTablePreference: (tableId: string, preference: Partial<TablePreference>) => void;
  updateDashboardPreferences: (preferences: Partial<DashboardPreferences>) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (bookmarkId: string) => void;
  addRecentItem: (item: Omit<RecentItem, 'timestamp'>) => void;
  clearRecentItems: () => void;
}

// 테이블 환경설정
export interface TablePreference {
  columnOrder: string[];
  columnWidths: Record<string, number>;
  columnVisibility: Record<string, boolean>;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, any>;
  pageSize: number;
  density: 'comfortable' | 'standard' | 'compact';
}

// 대시보드 환경설정
export interface DashboardPreferences {
  defaultDashboard: string | null;
  favoriteWidgets: string[];
  hiddenWidgets: string[];
  widgetRefreshIntervals: Record<string, number>;
  autoRefreshEnabled: boolean;
  compactMode: boolean;
}

// 키보드 단축키
export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: string;
  scope: 'global' | 'page' | 'component';
  enabled: boolean;
}

// 북마크
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags: string[];
  icon?: string;
  order: number;
  createdAt: Date;
}

// 최근 항목
export interface RecentItem {
  id: string;
  type: 'resp' | 'report' | 'user' | 'dashboard';
  title: string;
  url: string;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ===== 스토어 액션 타입 =====

// 비동기 액션 상태
export interface AsyncActionState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// 비동기 액션
export type AsyncAction<TArgs = any, TResult = any> = (
  args: TArgs
) => Promise<TResult>;

// ===== TanStack Query 상태 타입 =====

// 쿼리 키 타입
export type QueryKey = readonly unknown[];

// 뮤테이션 옵션
export interface MutationOptions<TData = unknown, TError = Error, TVariables = void> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

// 무한 쿼리 페이지 파라미터
export interface InfiniteQueryPageParam {
  pageParam: number;
  direction: 'forward' | 'backward';
}

// ===== 웹소켓 상태 타입 =====

// 웹소켓 연결 상태
export interface WebSocketState {
  connected: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  lastMessage: any;
  subscriptions: string[];
}

// 실시간 업데이트 타입
export interface RealtimeUpdate {
  type: string;
  payload: any;
  timestamp: Date;
}

// ===== 에러 상태 타입 =====

// 에러 상태
export interface ErrorState {
  code?: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  stack?: string;
}

// 전역 에러 핸들러
export interface GlobalErrorHandler {
  handleError: (error: Error, errorInfo?: any) => void;
  clearError: () => void;
  getErrorMessage: (error: any) => string;
}

// ===== 퍼포먼스 모니터링 타입 =====

// 성능 메트릭
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: Record<string, number>;
  renderTime: Record<string, number>;
  memoryUsage?: number;
}

// 성능 모니터링 상태
export interface PerformanceState {
  metrics: PerformanceMetrics;
  enabled: boolean;
  tracking: string[];

  startTracking: (label: string) => void;
  endTracking: (label: string) => void;
  recordMetric: (key: string, value: number) => void;
  clearMetrics: () => void;
}

// ===== 개발자 도구 타입 =====

// 개발자 도구 상태
export interface DevToolsState {
  enabled: boolean;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  logs: Array<{
    level: string;
    message: string;
    timestamp: Date;
    data?: any;
  }>;

  addLog: (level: string, message: string, data?: any) => void;
  clearLogs: () => void;
  setLogLevel: (level: string) => void;
}
