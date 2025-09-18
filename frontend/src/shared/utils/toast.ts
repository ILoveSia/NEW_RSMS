/**
 * Toast 알림 유틸리티
 * 테마 시스템과 통합된 Toast 메시지 관리
 */

import { toast, ToastOptions, ToastContent, Id } from 'react-toastify';

// Toast 타입 정의
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Toast 옵션 인터페이스
export interface CustomToastOptions extends Omit<ToastOptions, 'type'> {
  duration?: number;
  showProgress?: boolean;
  closeButton?: boolean;
  icon?: React.ReactNode;
}

// 기본 Toast 설정
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

/**
 * 성공 Toast 메시지
 */
export const showSuccessToast = (
  message: ToastContent,
  options?: CustomToastOptions
): Id => {
  return toast.success(message, {
    ...defaultOptions,
    autoClose: options?.duration || 3000,
    hideProgressBar: !options?.showProgress,
    closeButton: options?.closeButton !== false,
    icon: options?.icon || '✅',
    className: 'toast-success',
    ...options,
  });
};

/**
 * 에러 Toast 메시지
 */
export const showErrorToast = (
  message: ToastContent,
  options?: CustomToastOptions
): Id => {
  return toast.error(message, {
    ...defaultOptions,
    autoClose: options?.duration || 5000,
    hideProgressBar: !options?.showProgress,
    closeButton: options?.closeButton !== false,
    icon: options?.icon || '❌',
    className: 'toast-error',
    ...options,
  });
};

/**
 * 경고 Toast 메시지
 */
export const showWarningToast = (
  message: ToastContent,
  options?: CustomToastOptions
): Id => {
  return toast.warning(message, {
    ...defaultOptions,
    autoClose: options?.duration || 4000,
    hideProgressBar: !options?.showProgress,
    closeButton: options?.closeButton !== false,
    icon: options?.icon || '⚠️',
    className: 'toast-warning',
    ...options,
  });
};

/**
 * 정보 Toast 메시지
 */
export const showInfoToast = (
  message: ToastContent,
  options?: CustomToastOptions
): Id => {
  return toast.info(message, {
    ...defaultOptions,
    autoClose: options?.duration || 3000,
    hideProgressBar: !options?.showProgress,
    closeButton: options?.closeButton !== false,
    icon: options?.icon || 'ℹ️',
    className: 'toast-info',
    ...options,
  });
};

/**
 * 로딩 Toast 메시지
 */
export const showLoadingToast = (
  message: ToastContent,
  options?: CustomToastOptions
): Id => {
  return toast.loading(message, {
    ...defaultOptions,
    autoClose: false,
    closeOnClick: false,
    closeButton: false,
    icon: options?.icon || '⏳',
    className: 'toast-loading',
    ...options,
  });
};

/**
 * Toast 업데이트 (주로 로딩 → 성공/실패 전환용)
 */
export const updateToast = (
  toastId: Id,
  type: 'success' | 'error' | 'warning' | 'info',
  message: ToastContent,
  options?: CustomToastOptions
): void => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const durations = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
  };

  toast.update(toastId, {
    render: message,
    type: type,
    icon: options?.icon || icons[type],
    autoClose: options?.duration || durations[type],
    closeOnClick: true,
    closeButton: true,
    className: `toast-${type}`,
    ...options,
  });
};

/**
 * Toast 업데이트 (간편 버전)
 */
export const updateToastSimple = (
  toastId: Id,
  message: ToastContent,
  type: 'success' | 'error' | 'warning' | 'info' = 'success'
): void => {
  updateToast(toastId, type, message);
};

/**
 * 모든 Toast 닫기
 */
export const dismissAllToasts = (): void => {
  toast.dismiss();
};

/**
 * 특정 Toast 닫기
 */
export const dismissToast = (toastId: Id): void => {
  toast.dismiss(toastId);
};

/**
 * Promise 기반 Toast (비동기 작업용)
 */
export const showPromiseToast = async <T>(
  promise: Promise<T>,
  messages: {
    pending: ToastContent;
    success: ToastContent | ((data: T) => ToastContent);
    error: ToastContent | ((error: any) => ToastContent);
  },
  options?: CustomToastOptions
): Promise<T> => {
  return toast.promise(
    promise,
    {
      pending: {
        render: messages.pending,
        icon: '⏳',
        className: 'toast-loading',
      },
      success: {
        render: typeof messages.success === 'function'
          ? ({ data }) => messages.success(data)
          : messages.success,
        icon: '✅',
        className: 'toast-success',
        autoClose: 3000,
      },
      error: {
        render: typeof messages.error === 'function'
          ? ({ data }) => messages.error(data)
          : messages.error,
        icon: '❌',
        className: 'toast-error',
        autoClose: 5000,
      },
    },
    {
      ...defaultOptions,
      ...options,
    }
  );
};

// 편의 함수들
export const toastUtils = {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  update: updateToast,
  updateSimple: updateToastSimple,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  promise: showPromiseToast,
};

export default toastUtils;