/**
 * BaseErrorBoundary - 향상된 에러 경계 컴포넌트
 *
 * @description React 애플리케이션의 에러를 안전하게 처리하고 복구하는 컴포넌트
 * - 런타임 에러 캐치 및 처리
 * - 사용자 친화적 에러 UI
 * - 에러 로깅 및 리포팅
 * - 자동 복구 및 재시도 기능
 * - 개발/운영 환경별 에러 표시
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <BaseErrorBoundary>
 *   <App />
 * </BaseErrorBoundary>
 *
 * // 커스텀 설정
 * <BaseErrorBoundary
 *   fallbackType="page"
 *   showReloadButton={true}
 *   onError={(error, errorInfo) => {
 *     console.error('Error caught:', error);
 *   }}
 *   enableRetry={true}
 * >
 *   <UserManagement />
 * </BaseErrorBoundary>
 * ```
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  BugReport,
  ExpandMore,
  Home,
  ReportProblem
} from '@mui/icons-material';
import clsx from 'clsx';

import { Button } from '../../atoms/Button';
import styles from './BaseErrorBoundary.module.scss';

// 에러 정보 타입
export interface ErrorDetails {
  /** 에러 객체 */
  error: Error;
  /** React 에러 정보 */
  errorInfo: ErrorInfo;
  /** 에러 발생 시간 */
  timestamp: Date;
  /** 사용자 에이전트 정보 */
  userAgent: string;
  /** 현재 URL */
  url: string;
  /** 사용자 ID (있는 경우) */
  userId?: string;
  /** 세션 ID */
  sessionId?: string;
  /** 추가 컨텍스트 정보 */
  context?: Record<string, any>;
}

// 에러 경계 props 타입
export interface BaseErrorBoundaryProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 폴백 UI 타입 */
  fallbackType?: 'inline' | 'card' | 'page' | 'minimal';
  /** 커스텀 폴백 컴포넌트 */
  fallback?: (errorDetails: ErrorDetails, retry: () => void) => ReactNode;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo, details: ErrorDetails) => void;
  /** 재시도 버튼 표시 여부 */
  showReloadButton?: boolean;
  /** 자동 재시도 활성화 */
  enableRetry?: boolean;
  /** 재시도 최대 횟수 */
  maxRetryCount?: number;
  /** 재시도 지연시간 (ms) */
  retryDelay?: number;
  /** 에러 상세 정보 표시 여부 */
  showErrorDetails?: boolean;
  /** 개발 모드 여부 */
  isDevelopment?: boolean;
  /** 에러 레포팅 활성화 */
  enableReporting?: boolean;
  /** 컴포넌트 식별자 */
  componentName?: string;
  /** 에러 경계 레벨 */
  level?: 'app' | 'page' | 'section' | 'component';
  /** 커스텀 className */
  className?: string;
  /** 테스트 ID */
  'data-testid'?: string;
}

// 에러 경계 상태 타입
interface BaseErrorBoundaryState {
  /** 에러 발생 여부 */
  hasError: boolean;
  /** 에러 상세 정보 */
  errorDetails: ErrorDetails | null;
  /** 재시도 횟수 */
  retryCount: number;
  /** 복구 중 상태 */
  isRecovering: boolean;
}

/**
 * 에러 ID 생성
 */
const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 에러 심각도 계산
 */
const getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';

  // Critical errors
  if (
    errorMessage.includes('chunk') && errorMessage.includes('load') ||
    errorMessage.includes('network') ||
    errorStack.includes('fetch')
  ) {
    return 'critical';
  }

  // High severity
  if (
    errorMessage.includes('cannot read') ||
    errorMessage.includes('undefined') ||
    errorMessage.includes('null')
  ) {
    return 'high';
  }

  // Medium severity
  if (
    errorMessage.includes('warning') ||
    errorMessage.includes('deprecated')
  ) {
    return 'medium';
  }

  return 'low';
};

/**
 * BaseErrorBoundary 클래스 컴포넌트
 */
class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, BaseErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: BaseErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      errorDetails: null,
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<BaseErrorBoundaryState> {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {
      onError,
      enableReporting = false,
      componentName = 'Unknown',
      level = 'component'
    } = this.props;

    // 에러 상세 정보 생성
    const errorDetails: ErrorDetails = {
      error,
      errorInfo,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      context: {
        componentName,
        level,
        retryCount: this.state.retryCount
      }
    };

    this.setState({ errorDetails });

    // 에러 콜백 실행
    if (onError) {
      onError(error, errorInfo, errorDetails);
    }

    // 에러 로깅
    this.logError(errorDetails);

    // 에러 리포팅
    if (enableReporting) {
      this.reportError(errorDetails);
    }

    // 자동 재시도
    if (this.props.enableRetry && this.state.retryCount < (this.props.maxRetryCount || 3)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  // 사용자 ID 획득 (구현에 따라 수정)
  private getUserId = (): string | undefined => {
    // TODO: 실제 사용자 ID 획득 로직 구현
    return undefined;
  };

  // 세션 ID 획득
  private getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateErrorId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // 에러 로깅
  private logError = (errorDetails: ErrorDetails) => {
    const { error, errorInfo, timestamp, url } = errorDetails;
    const severity = getErrorSeverity(error);

    console.group(`🚨 [${severity.toUpperCase()}] Error Boundary Caught Error`);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Time:', timestamp.toISOString());
    console.error('URL:', url);
    console.error('Details:', errorDetails);
    console.groupEnd();
  };

  // 에러 리포팅
  private reportError = (errorDetails: ErrorDetails) => {
    // TODO: 실제 에러 리포팅 서비스 연동
    // 예: Sentry, LogRocket, Datadog 등
    try {
      // 예시: API 호출
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorDetails,
          error: {
            name: errorDetails.error.name,
            message: errorDetails.error.message,
            stack: errorDetails.error.stack
          },
          severity: getErrorSeverity(errorDetails.error)
        })
      }).catch(err => console.warn('Failed to report error:', err));
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError);
    }
  };

  // 자동 재시도 스케줄링
  private scheduleRetry = () => {
    const delay = this.props.retryDelay || 3000;

    this.setState({ isRecovering: true });

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  // 재시도 핸들러
  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      errorDetails: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false
    }));
  };

  // 페이지 새로고침
  private handleReload = () => {
    window.location.reload();
  };

  // 홈으로 이동
  private handleGoHome = () => {
    window.location.href = '/';
  };

  // 에러 상세 정보 렌더링
  private renderErrorDetails = (errorDetails: ErrorDetails) => {
    const { showErrorDetails = false, isDevelopment = process.env.NODE_ENV === 'development' } = this.props;

    if (!showErrorDetails && !isDevelopment) return null;

    const severity = getErrorSeverity(errorDetails.error);

    return (
      <Accordion className={styles.errorDetails}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            <BugReport className={styles.detailsIcon} />
            <Typography variant="body2">에러 상세 정보</Typography>
            <Chip
              label={severity.toUpperCase()}
              size="small"
              className={clsx(styles.severityChip, styles[`severity-${severity}`])}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box className={styles.errorInfo}>
            <Typography variant="body2" className={styles.errorName}>
              <strong>에러 타입:</strong> {errorDetails.error.name}
            </Typography>
            <Typography variant="body2" className={styles.errorMessage}>
              <strong>메시지:</strong> {errorDetails.error.message}
            </Typography>
            <Typography variant="body2" className={styles.errorTime}>
              <strong>발생 시간:</strong> {errorDetails.timestamp.toLocaleString()}
            </Typography>
            {isDevelopment && (
              <Box className={styles.stackTrace}>
                <Typography variant="body2" gutterBottom>
                  <strong>스택 트레이스:</strong>
                </Typography>
                <pre className={styles.stackCode}>
                  {errorDetails.error.stack}
                </pre>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // 액션 버튼들 렌더링
  private renderActions = () => {
    const { showReloadButton = true, enableRetry = false, level = 'component' } = this.props;
    const { retryCount, isRecovering } = this.state;
    const maxRetries = this.props.maxRetryCount || 3;

    return (
      <Box className={styles.actions}>
        {enableRetry && retryCount < maxRetries && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={this.handleRetry}
            loading={isRecovering}
            data-testid="error-retry-button"
          >
            다시 시도
          </Button>
        )}

        {showReloadButton && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={this.handleReload}
            data-testid="error-reload-button"
          >
            새로고침
          </Button>
        )}

        {level === 'app' || level === 'page' ? (
          <Button
            variant="text"
            startIcon={<Home />}
            onClick={this.handleGoHome}
            data-testid="error-home-button"
          >
            홈으로
          </Button>
        ) : null}
      </Box>
    );
  };

  // 폴백 UI 렌더링
  private renderFallback = (errorDetails: ErrorDetails) => {
    const { fallbackType = 'card', fallback, componentName } = this.props;

    if (fallback) {
      return fallback(errorDetails, this.handleRetry);
    }

    const severity = getErrorSeverity(errorDetails.error);
    const iconColor = severity === 'critical' ? 'error' : 'warning';

    switch (fallbackType) {
      case 'minimal':
        return (
          <Box className={styles.minimalError}>
            <ErrorOutline color={iconColor} />
            <Typography variant="body2">문제가 발생했습니다.</Typography>
            <Button size="small" onClick={this.handleRetry}>재시도</Button>
          </Box>
        );

      case 'inline':
        return (
          <Box className={styles.inlineError}>
            <ReportProblem color={iconColor} className={styles.errorIcon} />
            <Typography variant="body2">
              {componentName || '이 구성요소'}에서 오류가 발생했습니다.
            </Typography>
            {this.renderActions()}
          </Box>
        );

      case 'page':
        return (
          <Box className={styles.pageError}>
            <Card className={styles.errorCard} elevation={0}>
              <CardContent className={styles.cardContent}>
                <Box className={styles.iconContainer}>
                  <ErrorOutline
                    className={clsx(styles.errorIcon, styles[`icon-${severity}`])}
                  />
                </Box>

                <Typography variant="h4" className={styles.title} gutterBottom>
                  페이지를 불러올 수 없습니다
                </Typography>

                <Typography variant="body1" className={styles.description}>
                  일시적인 문제로 페이지를 표시할 수 없습니다.
                  잠시 후 다시 시도해주세요.
                </Typography>

                {this.renderActions()}
                {this.renderErrorDetails(errorDetails)}
              </CardContent>
            </Card>
          </Box>
        );

      case 'card':
      default:
        return (
          <Card className={styles.errorCard}>
            <CardContent>
              <Box className={styles.header}>
                <ErrorOutline
                  className={clsx(styles.errorIcon, styles[`icon-${severity}`])}
                />
                <Box>
                  <Typography variant="h6" className={styles.title}>
                    문제가 발생했습니다
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {componentName && `${componentName} 구성요소에서 `}
                    예상치 못한 오류가 발생했습니다.
                  </Typography>
                </Box>
              </Box>

              {this.renderActions()}
              {this.renderErrorDetails(errorDetails)}
            </CardContent>
          </Card>
        );
    }
  };

  render() {
    const { hasError, errorDetails } = this.state;
    const { children, className, 'data-testid': dataTestId = 'error-boundary' } = this.props;

    if (hasError && errorDetails) {
      return (
        <div
          className={clsx(styles.errorBoundary, className)}
          data-testid={dataTestId}
        >
          {this.renderFallback(errorDetails)}
        </div>
      );
    }

    return children;
  }
}

export default BaseErrorBoundary;