/**
 * ErrorBoundary - React 에러 경계 컴포넌트
 * 예상치 못한 JavaScript 오류를 포착하고 사용자 친화적인 에러 화면을 표시
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon, BugReport as BugIcon } from '@mui/icons-material';
import toast from '@/shared/utils/toast';
import styles from './ErrorBoundary.module.scss';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

/**
 * ErrorBoundary 컴포넌트
 *
 * @example
 * // 기본 사용
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * // 커스텀 폴백과 에러 핸들러
 * <ErrorBoundary
 *   fallback={<CustomErrorPage />}
 *   onError={(error, errorInfo) => logError(error, errorInfo)}
 *   showDetails={process.env.NODE_ENV === 'development'}
 * >
 *   <Component />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 에러 ID 생성 (디버깅용)
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // 에러 토스트 표시
    toast.error('예상치 못한 오류가 발생했습니다.', {
      autoClose: 5000,
    });

    // 사용자 정의 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 로깅 (TODO: 실제 로깅 서비스 연동)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo): void => {
    // TODO: 실제 로깅 서비스 (Sentry, LogRocket 등) 연동
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error logged:', errorData);

    // 개발 환경에서만 localStorage에 저장
    if (process.env.NODE_ENV === 'development') {
      const errors = JSON.parse(localStorage.getItem('rsms_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('rsms_errors', JSON.stringify(errors.slice(-10))); // 최근 10개만 유지
    }
  };

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });

    toast.info('페이지를 다시 로드합니다.', { autoClose: 2000 });
  };

  private handleRefresh = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private copyErrorDetails = (): void => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = `
Error ID: ${errorId}
Error Message: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      toast.success('에러 정보가 클립보드에 복사되었습니다.', { autoClose: 2000 });
    }).catch(() => {
      toast.error('클립보드 복사에 실패했습니다.', { autoClose: 2000 });
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 커스텀 폴백이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 화면
      return (
        <div className={styles.errorBoundary}>
          <Paper className={styles.errorContainer} elevation={3}>
            <Box className={styles.errorContent}>
              {/* 에러 아이콘 */}
              <BugIcon className={styles.errorIcon} />

              {/* 에러 메시지 */}
              <Typography variant="h4" className={styles.errorTitle}>
                앗! 문제가 발생했습니다
              </Typography>

              <Typography variant="body1" className={styles.errorDescription}>
                예상치 못한 오류가 발생했습니다. <br />
                페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </Typography>

              {/* 에러 ID */}
              <Typography variant="caption" className={styles.errorId}>
                에러 ID: {this.state.errorId}
              </Typography>

              {/* 액션 버튼들 */}
              <Box className={styles.errorActions}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  className={styles.retryButton}
                >
                  다시 시도
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRefresh}
                  className={styles.refreshButton}
                >
                  페이지 새로고침
                </Button>

                <Button
                  variant="text"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  className={styles.homeButton}
                >
                  홈으로 이동
                </Button>
              </Box>

              {/* 개발 환경에서만 에러 상세 정보 표시 */}
              {(this.props.showDetails || process.env.NODE_ENV === 'development') && (
                <Box className={styles.errorDetails}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={this.copyErrorDetails}
                    className={styles.copyButton}
                  >
                    에러 정보 복사
                  </Button>

                  <details className={styles.errorDetailsContent}>
                    <summary>에러 상세 정보</summary>
                    <pre className={styles.errorStack}>
                      <strong>Error:</strong> {this.state.error?.message}
                      {'\n\n'}
                      <strong>Stack:</strong>
                      {'\n'}
                      {this.state.error?.stack}
                      {'\n\n'}
                      <strong>Component Stack:</strong>
                      {'\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </Box>
              )}
            </Box>
          </Paper>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;