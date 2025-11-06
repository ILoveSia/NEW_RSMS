/**
 * useAlert - Alert 다이얼로그 관리 커스텀 훅
 *
 * @description BaseAlert 컴포넌트를 편리하게 사용할 수 있는 훅
 * - 프로그래밍 방식으로 Alert/Confirm 호출
 * - Promise 기반 결과 처리
 * - 자동 상태 관리
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const { showAlert, showConfirm, AlertComponent } = useAlert();
 *
 * // Alert 표시
 * const handleSave = async () => {
 *   await showAlert({
 *     type: 'success',
 *     title: '저장 완료',
 *     message: '데이터가 성공적으로 저장되었습니다.'
 *   });
 * };
 *
 * // Confirm 표시
 * const handleDelete = async () => {
 *   const confirmed = await showConfirm({
 *     type: 'warning',
 *     title: '삭제 확인',
 *     message: '정말로 삭제하시겠습니까?'
 *   });
 *
 *   if (confirmed) {
 *     // 삭제 처리
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleSave}>저장</button>
 *     <button onClick={handleDelete}>삭제</button>
 *     <AlertComponent />
 *   </>
 * );
 * ```
 */

import React, { useCallback, useState } from 'react';
import BaseAlert, { type AlertType, type AlertAction, type BaseAlertProps } from '../../components/organisms/BaseAlert';

export interface AlertOptions {
  /** 알림 타입 */
  type?: AlertType;
  /** 제목 */
  title?: string;
  /** 메시지 내용 */
  message: string;
  /** HTML 메시지 사용 여부 */
  dangerouslySetInnerHTML?: boolean;
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 자동 닫기 시간(ms) */
  autoClose?: number;
  /** 다이얼로그 크기 */
  size?: 'xs' | 'sm' | 'md';
  /** 커스텀 액션들 */
  actions?: AlertAction[];
}

export interface ConfirmOptions extends AlertOptions {
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 배경 클릭으로 닫기 비활성화 */
  disableBackdropClick?: boolean;
  /** ESC 키로 닫기 비활성화 */
  disableEscapeKeyDown?: boolean;
}

export interface UseAlertReturn {
  /** Alert 다이얼로그 표시 */
  showAlert: (options: AlertOptions) => Promise<void>;
  /** Confirm 다이얼로그 표시 */
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  /** 현재 열린 다이얼로그 닫기 */
  closeAlert: () => void;
  /** Alert 컴포넌트 (렌더링 필수) */
  AlertComponent: React.FC;
  /** 현재 다이얼로그 열림 상태 */
  isOpen: boolean;
}

interface AlertState extends Omit<BaseAlertProps, 'open' | 'onConfirm' | 'onCancel' | 'onClose'> {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** Promise resolve 함수 */
  resolve?: (value: boolean | void) => void;
  /** 다이얼로그 타입 */
  dialogType: 'alert' | 'confirm';
}

/**
 * Alert 다이얼로그 관리를 위한 커스텀 훅
 */
const useAlert = (): UseAlertReturn => {
  const [state, setState] = useState<AlertState>({
    open: false,
    message: '',
    dialogType: 'alert'
  });

  // Alert 표시
  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        dialogType: 'alert',
        showCancel: false,
        resolve: resolve as (value: boolean | void) => void
      });
    });
  }, []);

  // Confirm 표시
  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        dialogType: 'confirm',
        showCancel: true,
        resolve: resolve as (value: boolean | void) => void
      });
    });
  }, []);

  // 다이얼로그 닫기
  const closeAlert = useCallback(() => {
    setState(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // 확인 핸들러
  const handleConfirm = useCallback(() => {
    const { resolve, dialogType } = state;
    setState(prev => ({ ...prev, open: false }));

    if (resolve) {
      if (dialogType === 'confirm') {
        resolve(true);
      } else {
        resolve();
      }
    }
  }, [state]);

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    const { resolve, dialogType } = state;
    setState(prev => ({ ...prev, open: false }));

    if (resolve && dialogType === 'confirm') {
      resolve(false);
    }
  }, [state]);

  // Alert 컴포넌트
  const AlertComponent = useCallback(() => {
    const { open, resolve, dialogType, ...alertProps } = state;

    return (
      <BaseAlert
        {...alertProps}
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={handleCancel}
        data-testid="use-alert-dialog"
      />
    );
  }, [state, handleConfirm, handleCancel]);

  return {
    showAlert,
    showConfirm,
    closeAlert,
    AlertComponent,
    isOpen: state.open
  };
};

export default useAlert;