import {
  SearchButton,
  ExcelButton,
  AddButton,
  EditButton,
  DeleteButton,
  SaveButton,
  CancelButton,
  RefreshButton,
  ViewButton,
  ExcelTemplateDownloadButton,
  ExcelUploadButton
} from '@/shared/components/atoms/ActionButtons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BaseActionBar.module.scss';

// 액션 버튼 타입 정의 (스마트 타입 지원)
export interface ActionButton {
  key: string;
  type?: 'search' | 'excel' | 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'refresh' | 'view' | 'excelTemplateDownload' | 'excelUpload' | 'custom';
  label?: string;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  confirmationRequired?: boolean; // 삭제 버튼용
}

// 상태 표시 타입 정의
export interface StatusInfo {
  label: string;
  value: number | string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

interface BaseActionBarProps {
  // 왼쪽 영역 - 상태 정보
  totalCount?: number;
  totalLabel?: string;
  statusInfo?: StatusInfo[];
  selectedCount?: number;

  // 오른쪽 영역 - 액션 버튼들
  actions: ActionButton[];

  // 스타일링
  className?: string;

  // 로딩 상태
  loading?: boolean;
}

const BaseActionBar: React.FC<BaseActionBarProps> = React.memo(({
  totalCount,
  totalLabel = '총 개수',
  statusInfo = [],
  selectedCount,
  actions,
  className,
  loading = false
}) => {
  const { t } = useTranslation('common');

  // 상태 정보 색상 클래스 매핑
  const getStatusColorClass = (color?: string) => {
    switch (color) {
      case 'primary': return styles.statusPrimary;
      case 'secondary': return styles.statusSecondary;
      case 'success': return styles.statusSuccess;
      case 'warning': return styles.statusWarning;
      case 'error': return styles.statusError;
      default: return styles.statusDefault;
    }
  };

  // 스마트 버튼 렌더링 함수
  const renderButton = (action: ActionButton) => {
    const commonProps = {
      onClick: action.onClick,
      disabled: action.disabled || loading,
      loading: action.loading,
      className: styles.actionButton,
      'data-testid': `action-${action.key}`,
      variant: action.variant,
      label: action.label
    };

    switch (action.type) {
      case 'search':
        return <SearchButton key={action.key} {...commonProps} />;
      case 'excel':
        return <ExcelButton key={action.key} {...commonProps} />;
      case 'add':
        return <AddButton key={action.key} {...commonProps} />;
      case 'edit':
        return <EditButton key={action.key} {...commonProps} />;
      case 'delete':
        return (
          <DeleteButton
            key={action.key}
            {...commonProps}
            confirmationRequired={action.confirmationRequired}
          />
        );
      case 'save':
        return <SaveButton key={action.key} {...commonProps} />;
      case 'cancel':
        return <CancelButton key={action.key} {...commonProps} />;
      case 'refresh':
        return <RefreshButton key={action.key} {...commonProps} />;
      case 'view':
        return <ViewButton key={action.key} {...commonProps} />;
      case 'excelTemplateDownload':
        return <ExcelTemplateDownloadButton key={action.key} {...commonProps} />;
      case 'excelUpload':
        return <ExcelUploadButton key={action.key} {...commonProps} />;
      default:
        // 기본 커스텀 버튼 (기존 방식 호환)
        return (
          <SearchButton
            key={action.key}
            {...commonProps}
            onClick={action.onClick}
          />
        );
    }
  };

  return (
    <div className={`${styles.actionBar} ${className || ''}`}>
      {/* 왼쪽 영역 - 상태 정보 */}
      <div className={styles.actionLeft}>
        {/* 총 개수 표시 */}
        {totalCount !== undefined && (
          <div className={styles.totalCount}>
            <span className={styles.label}>{totalLabel}:</span>
            <span className={styles.count}>{totalCount.toLocaleString()}</span>
          </div>
        )}

        {/* 선택된 개수 표시 */}
        {selectedCount !== undefined && selectedCount > 0 && (
          <div className={styles.selectedCount}>
            <span className={styles.selectedLabel}>
              {t('selected', '선택됨')}:
            </span>
            <span className={styles.selectedValue}>
              {selectedCount.toLocaleString()}
            </span>
          </div>
        )}

        {/* 추가 상태 정보 */}
        {statusInfo && Array.isArray(statusInfo) && statusInfo.map((status, index) => (
          <div
            key={index}
            className={`${styles.statusItem} ${getStatusColorClass(status.color)}`}
          >
            {status.icon && (
              <span className={styles.statusIcon}>{status.icon}</span>
            )}
            <span className={styles.statusLabel}>{status.label}:</span>
            <span className={styles.statusValue}>
              {typeof status.value === 'number'
                ? status.value.toLocaleString()
                : status.value
              }
            </span>
          </div>
        ))}
      </div>

      {/* 오른쪽 영역 - 액션 버튼들 */}
      <div className={styles.actionRight}>
        {actions && Array.isArray(actions) && actions.map(renderButton)}
      </div>
    </div>
  );
});

BaseActionBar.displayName = 'BaseActionBar';

export default BaseActionBar;