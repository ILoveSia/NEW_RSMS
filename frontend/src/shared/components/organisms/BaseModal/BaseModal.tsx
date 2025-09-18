import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styles from './BaseModal.module.scss';

// 모달 크기 타입 정의
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

// 모달 액션 버튼 타입 정의
export interface ModalAction {
  key: string;
  label: string;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface BaseModalProps {
  // 기본 속성
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;

  // 크기 및 레이아웃
  size?: ModalSize;
  maxWidth?: string | number;
  maxHeight?: string | number;
  fullWidth?: boolean;
  fullHeight?: boolean;

  // 내용
  children: React.ReactNode;

  // 액션 버튼
  actions?: ModalAction[];
  hideActions?: boolean;

  // 스타일링
  className?: string;
  contentClassName?: string;

  // 동작 설정
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;

  // 로딩 상태
  loading?: boolean;

  // 접근성
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

/**
 * BaseModal - 재사용 가능한 모달 컴포넌트
 *
 * 다양한 크기와 용도로 사용 가능:
 * - 상세페이지 모달 (size="lg")
 * - 등록/수정 폼 모달 (size="md")
 * - 조회 팝업 (size="sm")
 * - 전체화면 모달 (size="fullscreen")
 *
 * @example
 * // 기본 사용
 * <BaseModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="직책 등록"
 *   size="md"
 *   actions={[
 *     { key: 'cancel', label: '취소', variant: 'outlined', onClick: handleClose },
 *     { key: 'save', label: '저장', variant: 'contained', onClick: handleSave }
 *   ]}
 * >
 *   <form>...</form>
 * </BaseModal>
 *
 * @example
 * // 전체화면 모달
 * <BaseModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="직책 상세"
 *   size="fullscreen"
 *   hideActions
 * >
 *   <DetailContent />
 * </BaseModal>
 */
const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  maxWidth,
  maxHeight,
  fullWidth = true,
  fullHeight = false,
  children,
  actions = [],
  hideActions = false,
  className,
  contentClassName,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  loading = false,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId = 'base-modal'
}) => {

  // 크기별 maxWidth 매핑
  const getSizeWidth = (size: ModalSize): string => {
    switch (size) {
      case 'xs': return '400px';
      case 'sm': return '600px';
      case 'md': return '800px';
      case 'lg': return '1200px';
      case 'xl': return '1600px';
      case 'fullscreen': return '100vw';
      default: return '800px';
    }
  };

  // 모달 닫기 핸들러
  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) return;
    if (reason === 'escapeKeyDown' && !closeOnEscape) return;
    onClose();
  };

  // 액션 버튼 렌더링
  const renderActions = () => {
    if (hideActions || actions.length === 0) return null;

    return (
      <DialogActions className={styles.actions}>
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={action.disabled || loading}
            className={`${styles.actionButton} ${styles[action.variant || 'contained']} ${styles[action.color || 'primary']}`}
            data-testid={`modal-action-${action.key}`}
          >
            {action.loading ? '처리중...' : action.label}
          </button>
        ))}
      </DialogActions>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth={fullWidth}
      className={`${styles.modal} ${styles[size]} ${className || ''}`}
      PaperProps={{
        className: styles.paper,
        style: {
          maxWidth: maxWidth || getSizeWidth(size),
          maxHeight: maxHeight || (fullHeight ? '100vh' : '90vh'),
          height: fullHeight ? '100vh' : 'auto',
          margin: size === 'fullscreen' ? 0 : '32px'
        }
      }}
      aria-labelledby={ariaLabelledBy || 'modal-title'}
      aria-describedby={ariaDescribedBy}
      data-testid={dataTestId}
    >
      {/* 헤더 */}
      {(title || showCloseButton) && (
        <DialogTitle className={styles.header}>
          <div className={styles.titleSection}>
            {title && (
              <Typography variant="h6" component="h2" className={styles.title} id="modal-title">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" className={styles.subtitle}>
                {subtitle}
              </Typography>
            )}
          </div>
          {showCloseButton && (
            <IconButton
              onClick={() => onClose()}
              className={styles.closeButton}
              aria-label="모달 닫기"
              data-testid="modal-close-button"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {/* 구분선 */}
      {title && <Divider />}

      {/* 내용 */}
      <DialogContent className={`${styles.content} ${contentClassName || ''}`}>
        {loading ? (
          <Box className={styles.loading}>
            <div className={styles.spinner}>로딩중...</div>
          </Box>
        ) : (
          children
        )}
      </DialogContent>

      {/* 액션 버튼들 */}
      {renderActions()}
    </Dialog>
  );
};

BaseModal.displayName = 'BaseModal';

export default BaseModal;