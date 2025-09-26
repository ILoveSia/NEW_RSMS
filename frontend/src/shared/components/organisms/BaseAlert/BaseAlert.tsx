/**
 * BaseAlert - 공통 알림 다이얼로그 컴포넌트
 *
 * @description 시스템 전반에서 사용하는 표준 알림창
 * - Alert: 단순 알림 (확인 버튼만)
 * - Confirm: 확인/취소 선택
 * - Custom: 사용자 정의 액션들
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * // 기본 Alert
 * <BaseAlert
 *   open={true}
 *   type="info"
 *   title="알림"
 *   message="저장되었습니다."
 *   onConfirm={() => setOpen(false)}
 * />
 *
 * // Confirm 다이얼로그
 * <BaseAlert
 *   open={true}
 *   type="warning"
 *   title="확인"
 *   message="정말로 삭제하시겠습니까?"
 *   showCancel={true}
 *   onConfirm={handleDelete}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 */

import React, { useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade
} from '@mui/material';
import { Close } from '@mui/icons-material';
import clsx from 'clsx';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';

import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import styles from './BaseAlert.module.scss';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface AlertAction {
  /** 액션 키 (고유 식별자) */
  key: string;
  /** 버튼 라벨 */
  label: string;
  /** 버튼 변형 */
  variant?: 'contained' | 'outlined' | 'text';
  /** 버튼 색상 */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 */
  disabled?: boolean;
}

export interface BaseAlertProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
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
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  /** 취소 버튼 표시 여부 */
  showCancel?: boolean;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 커스텀 액션들 */
  actions?: AlertAction[];
  /** 확인 버튼 클릭 핸들러 */
  onConfirm?: () => void;
  /** 취소 버튼 클릭 핸들러 */
  onCancel?: () => void;
  /** 다이얼로그 닫기 핸들러 */
  onClose?: () => void;
  /** 배경 클릭으로 닫기 비활성화 */
  disableBackdropClick?: boolean;
  /** ESC 키로 닫기 비활성화 */
  disableEscapeKeyDown?: boolean;
  /** 자동 닫기 시간(ms) */
  autoClose?: number;
  /** 다이얼로그 크기 */
  size?: 'xs' | 'sm' | 'md';
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

// 타입별 아이콘 매핑
const TYPE_ICONS = {
  success: CheckCircleIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  question: HelpIcon
};

// 타입별 기본 색상 매핑
const TYPE_COLORS = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  question: 'primary'
} as const;

/**
 * BaseAlert 컴포넌트
 */
const BaseAlert: React.FC<BaseAlertProps> = ({
  open,
  type = 'info',
  title,
  message,
  dangerouslySetInnerHTML = false,
  showIcon = true,
  showCloseButton = false,
  showCancel = false,
  confirmLabel = '확인',
  cancelLabel = '취소',
  actions = [],
  onConfirm,
  onCancel,
  onClose,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  autoClose,
  size = 'sm',
  className,
  'data-testid': dataTestId = 'base-alert'
}) => {
  // 자동 닫기 타이머 처리
  useEffect(() => {
    if (!open || !autoClose) return;

    const timer = setTimeout(() => {
      onConfirm?.();
      onClose?.();
    }, autoClose);

    return () => clearTimeout(timer);
  }, [open, autoClose, onConfirm, onClose]);

  // 다이얼로그 닫기 핸들러
  const handleClose = useCallback((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && disableBackdropClick) return;
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;
    onClose?.();
    onCancel?.();
  }, [disableBackdropClick, disableEscapeKeyDown, onClose, onCancel]);

  // 확인 핸들러
  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose?.();
  }, [onConfirm, onClose]);

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  // 아이콘 렌더링
  const renderIcon = () => {
    if (!showIcon) return null;

    const IconComponent = TYPE_ICONS[type];
    return (
      <div className={clsx(styles.iconWrapper, styles[`icon-${type}`])}>
        <IconComponent className={styles.icon} />
      </div>
    );
  };

  // 액션 버튼들 렌더링
  const renderActions = () => {
    // 커스텀 액션이 있으면 우선 사용
    if (actions.length > 0) {
      return actions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant || 'outlined'}
          color={action.color || 'primary'}
          onClick={action.onClick}
          autoFocus={action.autoFocus}
          loading={action.loading}
          disabled={action.disabled}
          data-testid={`${dataTestId}-action-${action.key}`}
        >
          {action.label}
        </Button>
      ));
    }

    // 기본 액션 버튼들
    const buttons = [];

    if (showCancel) {
      buttons.push(
        <Button
          key="cancel"
          variant="outlined"
          onClick={handleCancel}
          data-testid={`${dataTestId}-cancel`}
        >
          {cancelLabel}
        </Button>
      );
    }

    if (onConfirm) {
      buttons.push(
        <Button
          key="confirm"
          variant="contained"
          color={TYPE_COLORS[type]}
          onClick={handleConfirm}
          autoFocus={!showCancel}
          data-testid={`${dataTestId}-confirm`}
        >
          {confirmLabel}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={size}
      fullWidth
      TransitionComponent={Fade}
      className={clsx(
        styles.alert,
        styles[`type-${type}`],
        styles[`size-${size}`],
        className
      )}
      PaperProps={{
        className: styles.paper,
        'data-testid': `${dataTestId}-paper`
      }}
      BackdropProps={{
        className: styles.backdrop,
        'data-testid': `${dataTestId}-backdrop`
      }}
      data-testid={dataTestId}
    >
      {/* 헤더 */}
      {(title || showCloseButton) && (
        <DialogTitle className={styles.header}>
          <div className={styles.headerContent}>
            {renderIcon()}
            {title && (
              <Typography
                variant="h6"
                className={styles.title}
                data-testid={`${dataTestId}-title`}
              >
                {title}
              </Typography>
            )}
          </div>

          {showCloseButton && (
            <IconButton
              onClick={handleCancel}
              className={styles.closeButton}
              size="small"
              data-testid={`${dataTestId}-close`}
              aria-label="알림창 닫기"
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {/* 컨텐츠 */}
      <DialogContent className={clsx(styles.content, {
        [styles.contentWithIcon]: showIcon && !title,
        [styles.contentNoHeader]: !title && !showCloseButton
      })}>
        {!title && renderIcon()}

        <div className={styles.messageWrapper}>
          {dangerouslySetInnerHTML ? (
            <Typography
              variant="body1"
              className={styles.message}
              dangerouslySetInnerHTML={{ __html: message }}
              data-testid={`${dataTestId}-message`}
            />
          ) : (
            <Typography
              variant="body1"
              className={styles.message}
              data-testid={`${dataTestId}-message`}
            >
              {message}
            </Typography>
          )}
        </div>
      </DialogContent>

      {/* 액션 버튼들 */}
      <DialogActions className={styles.actions}>
        {renderActions()}
      </DialogActions>
    </Dialog>
  );
};

export default BaseAlert;