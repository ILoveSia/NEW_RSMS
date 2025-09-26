/**
 * BaseModalWrapper - 모달 래퍼 공통 컴포넌트
 *
 * @description 모든 업무 페이지에서 사용하는 표준 모달 래퍼
 * - React.Suspense + 지연로딩 통합
 * - 로딩 스피너 표시
 * - 에러 바운더리 내장
 * - 키보드 접근성 지원
 * - 포커스 트랩핑
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * <BaseModalWrapper
 *   isOpen={modalState.open}
 *   onClose={handleModalClose}
 *   fallbackComponent={<LoadingSpinner text="모달을 불러오는 중..." />}
 * >
 *   <SomeModal
 *     open={modalState.open}
 *     onClose={handleModalClose}
 *     data={modalData}
 *   />
 * </BaseModalWrapper>
 * ```
 */

import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';

export interface BaseModalWrapperProps {
  /** 모달 표시 여부 */
  isOpen: boolean;

  /** 모달 닫기 핸들러 */
  onClose: () => void;

  /** 모달 내용 (지연로딩되는 컴포넌트) */
  children: ReactNode;

  /** 로딩 중 표시할 컴포넌트 (기본: LoadingSpinner) */
  fallbackComponent?: ReactNode;

  /** ESC 키로 닫기 활성화 여부 (기본: true) */
  closeOnEsc?: boolean;

  /** 오버레이 클릭으로 닫기 활성화 여부 (기본: true) */
  closeOnOverlay?: boolean;

  /** 포커스 트랩핑 활성화 여부 (기본: true) */
  focusTrapping?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 접근성 레이블 */
  ariaLabel?: string;

  /** 모달 열릴 때 실행될 콜백 */
  onOpen?: () => void;

  /** 에러 발생 시 표시할 컴포넌트 */
  errorFallback?: ReactNode;
}

/**
 * 에러 바운더리 컴포넌트
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModalErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Modal Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>모달을 불러올 수 없습니다</h3>
          <p>페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const BaseModalWrapper: React.FC<BaseModalWrapperProps> = ({
  isOpen,
  onClose,
  children,
  fallbackComponent = <LoadingSpinner text="모달을 불러오는 중..." />,
  closeOnEsc = true,
  closeOnOverlay = true,
  focusTrapping = true,
  className = '',
  ariaLabel = '모달 창',
  onOpen,
  errorFallback
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ESC 키 핸들러
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'Escape' && closeOnEsc) {
      event.preventDefault();
      onClose();
    }

    // 포커스 트랩핑
    if (event.key === 'Tab' && focusTrapping && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, closeOnEsc, focusTrapping, onClose]);

  // 오버레이 클릭 핸들러
  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlay, onClose]);

  // 모달 열림/닫힘 처리
  useEffect(() => {
    if (isOpen) {
      // 현재 포커스 저장
      previousFocusRef.current = document.activeElement as HTMLElement;

      // 바디 스크롤 방지
      document.body.style.overflow = 'hidden';

      // 키보드 이벤트 등록
      document.addEventListener('keydown', handleKeyDown);

      // 모달 열림 콜백
      onOpen?.();

      // 모달 내 첫 번째 포커스 가능한 요소로 포커스 이동
      setTimeout(() => {
        if (modalRef.current && focusTrapping) {
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }
      }, 100);
    } else {
      // 바디 스크롤 복원
      document.body.style.overflow = '';

      // 키보드 이벤트 제거
      document.removeEventListener('keydown', handleKeyDown);

      // 이전 포커스 복원
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (isOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, handleKeyDown, focusTrapping, onOpen]);

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`modal-overlay ${className}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <ModalErrorBoundary
          fallback={errorFallback}
          onError={(error) => console.error('Modal Error:', error)}
        >
          <React.Suspense fallback={fallbackComponent}>
            {children}
          </React.Suspense>
        </ModalErrorBoundary>
      </div>
    </div>
  );
};

export default BaseModalWrapper;

/**
 * 지연로딩 모달을 위한 헬퍼 함수
 *
 * @example
 * ```tsx
 * const UserModal = createLazyModal(() =>
 *   import('./UserModal').then(module => ({ default: module.UserModal }))
 * );
 * ```
 */
export const createLazyModal = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

/**
 * 모달 상태를 관리하는 커스텀 훅
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 * ```
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};