// 공통 타입 정의
// 프로젝트 전반에서 사용되는 기본 타입들

// ===== 기본 유틸리티 타입 =====
export type ID = string;
export type Timestamp = string; // ISO string format

// ===== API 관련 공통 타입 =====
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: number;
  timestamp: Timestamp;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ===== 기본 엔티티 타입 =====
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version?: number; // 낙관적 락을 위한 버전
}

// ===== 상태 관련 타입 =====
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Timestamp;
}

// ===== 권한 관련 기본 타입 =====
export type Permission = string;
export type Role = 'ADMIN' | 'USER' | 'RESP_MANAGER' | 'VIEWER';

// ===== 시스템 알림 타입 =====
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
}

// ===== 언어 및 지역 타입 =====
export type Locale = 'ko' | 'en';

// ===== 컴포넌트 공통 Props =====
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}