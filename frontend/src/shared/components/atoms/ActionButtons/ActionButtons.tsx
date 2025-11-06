import { Button } from '@/shared/components/atoms/Button';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import EditIcon from '@mui/icons-material/Edit';
import ExcelIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ViewIcon from '@mui/icons-material/Visibility';
import React from 'react';
import { useTranslation } from 'react-i18next';

// 공통 버튼 Props 타입
interface BaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
  'data-testid'?: string;
}

// 개별 버튼 Props 타입들
export interface SearchButtonProps extends BaseButtonProps {
  label?: string;
}

export interface ExcelButtonProps extends BaseButtonProps {
  label?: string;
}

export interface AddButtonProps extends BaseButtonProps {
  label?: string;
}

export interface EditButtonProps extends BaseButtonProps {
  label?: string;
}

export interface DeleteButtonProps extends BaseButtonProps {
  label?: string;
  confirmationRequired?: boolean;
}

export interface SaveButtonProps extends BaseButtonProps {
  label?: string;
}

export interface CancelButtonProps extends BaseButtonProps {
  label?: string;
}

export interface RefreshButtonProps extends BaseButtonProps {
  label?: string;
}

export interface ViewButtonProps extends BaseButtonProps {
  label?: string;
}

export interface ExcelTemplateDownloadButtonProps extends BaseButtonProps {
  label?: string;
}

export interface ExcelUploadButtonProps extends BaseButtonProps {
  label?: string;
}

// 🔍 검색 버튼
export const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'search-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<SearchIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('search', '검색')}
    </Button>
  );
};

// 📊 엑셀 다운로드 버튼
export const ExcelButton: React.FC<ExcelButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'excel-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<ExcelIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('excelDownload', '엑셀다운로드')}
    </Button>
  );
};

// ➕ 추가/등록 버튼
export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'add-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<AddIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('add', '등록')}
    </Button>
  );
};

// ✏️ 수정 버튼
export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'outlined',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'edit-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<EditIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('edit', '수정')}
    </Button>
  );
};

// 🗑️ 삭제 버튼
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  confirmationRequired = true,
  'data-testid': dataTestId = 'delete-button'
}) => {
  const { t } = useTranslation('common');

  const handleClick = () => {
    if (confirmationRequired) {
      const confirmed = window.confirm(
        t('deleteConfirmation', '정말 삭제하시겠습니까?')
      );
      if (confirmed) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<DeleteIcon />}
      onClick={handleClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
      color="error"
    >
      {label || t('delete', '삭제')}
    </Button>
  );
};

// 💾 저장 버튼
export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'save-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<SaveIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('save', '저장')}
    </Button>
  );
};

// ❌ 취소 버튼
export const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'outlined',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'cancel-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<ClearIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('cancel', '취소')}
    </Button>
  );
};

// 🔄 새로고침 버튼
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'outlined',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'refresh-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<RefreshIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('refresh', '새로고침')}
    </Button>
  );
};

// 👁️ 보기/상세 버튼
export const ViewButton: React.FC<ViewButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'outlined',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'view-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<ViewIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('view', '보기')}
    </Button>
  );
};

// 📥 엑셀 업로드 양식 다운로드 버튼
export const ExcelTemplateDownloadButton: React.FC<ExcelTemplateDownloadButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'excel-template-download-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<DownloadForOfflineIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('excelTemplateDownload', '엑셀업로드양식다운로드')}
    </Button>
  );
};

// 📤 엑셀 업로드 등록 버튼
export const ExcelUploadButton: React.FC<ExcelUploadButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  size = 'small',
  variant = 'contained',
  className,
  fullWidth = false,
  'data-testid': dataTestId = 'excel-upload-button'
}) => {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<UploadFileIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      fullWidth={fullWidth}
      data-testid={dataTestId}
    >
      {label || t('excelUpload', '엑셀업로드등록')}
    </Button>
  );
};

// 전체 내보내기를 위한 객체
export const ActionButtons = {
  Search: SearchButton,
  Excel: ExcelButton,
  Add: AddButton,
  Edit: EditButton,
  Delete: DeleteButton,
  Save: SaveButton,
  Cancel: CancelButton,
  Refresh: RefreshButton,
  View: ViewButton,
  ExcelTemplateDownload: ExcelTemplateDownloadButton,
  ExcelUpload: ExcelUploadButton
};