import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Slide,
  SlideProps
} from '@mui/material';
import { Close } from '@mui/icons-material';
import clsx from 'clsx';

import { Button, ButtonProps } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import styles from './Modal.module.scss';

export interface ModalAction extends Omit<ButtonProps, 'children'> {
  /** 액션 라벨 */
  label: string;
  /** 액션 키 (고유 식별자) */
  key: string;
}

export interface ModalProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 이벤트 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 크기 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  /** 최대 너비 비활성화 */
  fullWidth?: boolean;
  /** 스크롤 가능한 컨텐츠 */
  scrollable?: boolean;
  /** 배경 클릭으로 닫기 비활성화 */
  disableBackdropClick?: boolean;
  /** ESC 키로 닫기 비활성화 */
  disableEscapeKeyDown?: boolean;
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  /** 액션 버튼들 */
  actions?: ModalAction[];
  /** 액션 정렬 */
  actionsAlignment?: 'left' | 'center' | 'right' | 'space-between';
  /** 애니메이션 효과 */
  animation?: 'fade' | 'slide' | 'zoom';
  /** 애니메이션 방향 (slide일 때) */
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  /** 모달 컨텐츠 */
  children: React.ReactNode;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

// 슬라이드 애니메이션 컴포넌트
const SlideTransition = React.forwardRef<unknown, SlideProps & { direction?: 'up' | 'down' | 'left' | 'right' }>((
  props, 
  ref
) => {
  return <Slide direction={props.direction || 'up'} ref={ref} {...props} />;
});

SlideTransition.displayName = 'SlideTransition';

/**
 * Modal - 확장 가능한 모달 다이얼로그 컴포넌트
 * 
 * UI 디자인 적용 시 스타일만 교체하면 됨
 * 
 * @example
 * // 기본 사용
 * <Modal open={open} onClose={handleClose} title="확인">
 *   <p>정말로 삭제하시겠습니까?</p>
 * </Modal>
 * 
 * // 액션 버튼 포함
 * <Modal 
 *   open={open} 
 *   onClose={handleClose}
 *   title="사용자 편집"
 *   size="md"
 *   actions={[
 *     { key: 'cancel', label: '취소', variant: 'outlined' },
 *     { key: 'save', label: '저장', variant: 'contained', onClick: handleSave }
 *   ]}
 * >
 *   <UserForm />
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'sm',
  fullWidth = true,
  scrollable = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  showCloseButton = true,
  actions = [],
  actionsAlignment = 'right',
  animation = 'fade',
  slideDirection = 'up',
  children,
  className,
  'data-testid': dataTestId = 'modal',
}) => {
  // 모달 닫기 핸들러
  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && disableBackdropClick) return;
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;
    onClose();
  };

  // 애니메이션 컴포넌트 선택
  const getTransitionComponent = () => {
    switch (animation) {
      case 'slide':
        return (props: SlideProps) => (
          <SlideTransition {...props} direction={slideDirection} />
        );
      case 'zoom':
        // Material-UI에서 기본 제공하는 Grow 트랜지션 사용
        return undefined; // Dialog의 기본 트랜지션
      case 'fade':
      default:
        return undefined; // Dialog의 기본 Fade 트랜지션
    }
  };

  // 액션 버튼 렌더링
  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <DialogActions
        className={clsx(styles.actions, styles[`actions-${actionsAlignment}`])}
        data-testid={`${dataTestId}-actions`}
      >
        {actions.map((action) => {
          const { key, label, onClick, ...buttonProps } = action;
          return (
            <Button
              key={key}
              onClick={onClick}
              {...buttonProps}
              data-testid={`${dataTestId}-action-${key}`}
            >
              {label}
            </Button>
          );
        })}
      </DialogActions>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={size === 'fullscreen' ? false : size}
      fullWidth={fullWidth}
      fullScreen={size === 'fullscreen'}
      scroll={scrollable ? 'body' : 'paper'}
      TransitionComponent={animation === 'slide' ? getTransitionComponent() : undefined}
      className={clsx(
        styles.modal,
        styles[`size-${size}`],
        styles[`animation-${animation}`],
        {
          [styles.scrollable]: scrollable,
          [styles.fullscreen]: size === 'fullscreen',
        },
        className
      )}
      PaperProps={{
        className: styles.paper,
        'data-testid': `${dataTestId}-paper`,
      }}
      BackdropProps={{
        className: styles.backdrop,
        'data-testid': `${dataTestId}-backdrop`,
      }}
      data-testid={dataTestId}
    >
      {/* 헤더 */}
      {(title || showCloseButton) && (
        <DialogTitle 
          className={styles.header}
          data-testid={`${dataTestId}-header`}
        >
          {title && (
            <Typography 
              variant="h6" 
              className={styles.title}
              data-testid={`${dataTestId}-title`}
            >
              {title}
            </Typography>
          )}
          
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              className={styles.closeButton}
              size="small"
              data-testid={`${dataTestId}-close-button`}
              aria-label="모달 닫기"
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {/* 컨텐츠 */}
      <DialogContent 
        className={clsx(styles.content, {
          [styles.contentScrollable]: scrollable,
          [styles.contentNoHeader]: !title && !showCloseButton,
        })}
        data-testid={`${dataTestId}-content`}
      >
        {children}
      </DialogContent>

      {/* 액션 버튼들 */}
      {renderActions()}
    </Dialog>
  );
};

export default Modal;