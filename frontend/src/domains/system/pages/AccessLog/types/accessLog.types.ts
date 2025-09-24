/**
 * 접근로그 도메인 타입 정의
 *
 * @description DB 설계서 및 요구사항 정의서 기반 접근로그 관리 타입 시스템
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

// 기본 접근로그 엔티티 (system_logs 테이블 기준)
export interface AccessLog {
  id: string;
  logDateTime: string;
  logLevel: LogLevel;
  logCategory: string;

  // 사용자 정보
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  // 추가 사용자 정보 (JOIN으로 가져올 정보)
  employeeNo?: string;
  fullName?: string;
  deptName?: string;

  // 액션 정보
  actionType: string;
  targetType?: string;
  targetId?: string;

  // 로그 내용
  message: string;
  details?: Record<string, any>;

  // 성능 정보
  executionTimeMs?: number;

  // 추가 컨텍스트
  requestId?: string;
  correlationId?: string;

  // UI 표시용 추가 필드
  menuName?: string;
  accessTarget?: string;
}

// 로그 레벨 열거형
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

// 접근 대상 타입 (화면 이미지 기준)
export type AccessTarget = '101' | '102' | '103' | '전체';

// 접근로그 검색 필터
export interface AccessLogFilters {
  [key: string]: string | undefined;
  accessTarget?: string;        // 접근대상
  startDate?: string;          // 시작일
  endDate?: string;            // 종료일
  employeeNo?: string;         // 직번
  ipAddress?: string;          // 접근IP
  menuName?: string;           // 메뉴명
  fullName?: string;           // 성명
}

// 접근로그 폼 데이터 (검색용)
export interface AccessLogFormData {
  accessTarget: string;
  startDate: string;
  endDate: string;
  employeeNo: string;
  ipAddress: string;
  menuName: string;
  fullName: string;
}

// 접근로그 페이지네이션
export interface AccessLogPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 접근로그 통계
export interface AccessLogStatistics {
  totalLogs: number;
  todayLogs: number;
  activeUsers: number;
  uniqueIpCount: number;
}

// 접근 대상 옵션
export interface AccessTargetOption {
  value: string;
  label: string;
}

// UI 컴포넌트 props 타입
export interface AccessLogMgmtProps {
  className?: string;
}

// API 응답 타입
export interface AccessLogApiResponse {
  success: boolean;
  data?: AccessLog;
  message?: string;
  errorCode?: string;
}

export interface AccessLogListApiResponse {
  success: boolean;
  data?: {
    logs: AccessLog[];
    pagination: AccessLogPagination;
    statistics?: AccessLogStatistics;
  };
  message?: string;
  errorCode?: string;
}

// 엑셀 내보내기 요청
export interface ExportAccessLogRequest {
  filters: AccessLogFilters;
  format: 'xlsx' | 'csv';
  filename?: string;
}

// 실시간 모니터링 데이터
export interface AccessLogMonitoring {
  realtimeLogs: AccessLog[];
  activeSessionCount: number;
  suspiciousActivityCount: number;
  systemPerformance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

// 로그 상세 보기 모달용
export interface AccessLogDetailModal {
  open: boolean;
  log: AccessLog | null;
}

// 접근 패턴 분석
export interface AccessPattern {
  pattern: string;
  count: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}