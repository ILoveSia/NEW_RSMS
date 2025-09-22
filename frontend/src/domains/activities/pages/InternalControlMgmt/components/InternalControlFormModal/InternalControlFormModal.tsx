import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { InternalControlMgmt, InternalControlMgmtFormData, DepartmentOption } from '../../types/internalControlMgmt.types';
import { ColDef } from 'ag-grid-community';
import styles from './InternalControlFormModal.module.scss';

interface InternalControlFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  internalControl?: InternalControlMgmt | null;
  onClose: () => void;
  onSave: (data: InternalControlMgmtFormData) => void;
  onUpdate: (id: string, data: InternalControlMgmtFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  managementActivityName: yup
    .string()
    .required('관리활동명은 필수입니다')
    .max(100, '관리활동명은 100자 이내로 입력해주세요'),
  internalControl: yup
    .string()
    .required('내부통제는 필수입니다')
    .max(100, '내부통제는 100자 이내로 입력해주세요'),
  unifiedNumber: yup
    .string()
    .required('통일번호는 필수입니다')
    .max(50, '통일번호는 50자 이내로 입력해주세요'),
  url: yup
    .string()
    .url('올바른 URL 형식으로 입력해주세요')
    .max(255, 'URL은 255자 이내로 입력해주세요'),
  applicationDate: yup
    .string()
    .required('적용일자는 필수입니다'),
});

const InternalControlFormModal: React.FC<InternalControlFormModalProps> = ({
  open,
  mode,
  internalControl,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('activities');
  const [itemList, setItemList] = useState<InternalControlMgmt[]>([]);

  // 부정명 옵션 (실제로는 API에서 가져와야 함)
  const departmentOptions: DepartmentOption[] = [
    { value: 'dept1', label: '경영관리부' },
    { value: 'dept2', label: '리스크관리부' },
    { value: 'dept3', label: '준법감시부' },
    { value: 'dept4', label: '내부통제부' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InternalControlMgmtFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      departmentName: '',
      managementActivityName: '',
      internalControl: '',
      unifiedNumber: '',
      url: '',
      applicationDate: ''
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && internalControl) {
        reset({
          departmentName: internalControl.departmentName,
          managementActivityName: internalControl.managementActivityName,
          internalControl: internalControl.internalControl,
          unifiedNumber: internalControl.unifiedNumber,
          url: internalControl.url,
          applicationDate: internalControl.applicationDate
        });
        // 상세 모드에서 목록 로드 (실제로는 API 호출)
        loadItemList(internalControl.id);
      } else {
        reset({
          departmentName: '',
          managementActivityName: '',
          internalControl: '',
          unifiedNumber: '',
          url: '',
          applicationDate: ''
        });
        setItemList([]);
      }
    }
  }, [open, mode, internalControl, reset]);

  // 목록 로드 함수 (상세 모드용)
  const loadItemList = useCallback(async (itemId: string) => {
    try {
      // TODO: API 호출로 해당 내부통제장치의 관련 정보 로드
      // const response = await internalControlMgmtApi.getItemDetails(itemId);
      // setItemList(response.data.itemList);

      // 임시 데이터
      setItemList([
        {
          id: '1',
          departmentName: '경영관리부',
          managementActivityName: '리스크 평가',
          internalControl: '리스크관리시스템',
          unifiedNumber: 'IC2024001',
          url: 'https://risk.example.com',
          applicationDate: '2024-01-15',
          expirationDate: '2024-12-31',
          isActive: true,
          status: '정상'
        }
      ]);
    } catch (error) {
      console.error('목록 로드 실패:', error);
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: InternalControlMgmtFormData) => {
    if (mode === 'create') {
      onSave(data);
    } else if (mode === 'detail' && internalControl) {
      onUpdate(internalControl.id, data);
    }
  }, [mode, internalControl, onSave, onUpdate]);

  // 목록 테이블 컬럼 정의
  const columns: ColDef<InternalControlMgmt>[] = [
    {
      field: 'departmentName',
      headerName: '부정명',
      width: 120,
      sortable: true
    },
    {
      field: 'managementActivityName',
      headerName: '관리활동명',
      width: 180,
      sortable: true
    },
    {
      field: 'internalControl',
      headerName: '내부통제',
      width: 150,
      sortable: true
    },
    {
      field: 'unifiedNumber',
      headerName: '통일번호',
      width: 120,
      sortable: true
    }
  ];

  const modalTitle = mode === 'create' ? '내부통제장치 추가' : '내부통제장치 상세';
  const submitButtonText = mode === 'create' ? '저장' : '수정';

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'cancel',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading
    },
    {
      key: 'submit',
      label: submitButtonText,
      variant: 'contained',
      color: 'primary',
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading,
      loading: loading
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="md"
      actions={modalActions}
      loading={loading}
      className={styles.modal}
      contentClassName={styles.modalContent}
    >
      {/* 기본 정보 입력 폼 */}
      <Box component="form" className={styles.form}>
        <div className={styles.formRow}>
          <Controller
            name="departmentName"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                className={styles.formField}
              >
                <InputLabel>부정명</InputLabel>
                <Select
                  {...field}
                  label="부정명"
                >
                  {departmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="managementActivityName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="관리활동명 *"
                variant="outlined"
                fullWidth
                error={!!errors.managementActivityName}
                helperText={errors.managementActivityName?.message}
                className={styles.formField}
                placeholder="리스크 평가"
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="internalControl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="내부통제 *"
                variant="outlined"
                fullWidth
                error={!!errors.internalControl}
                helperText={errors.internalControl?.message}
                className={styles.formField}
                placeholder="리스크관리시스템"
              />
            )}
          />

          <Controller
            name="unifiedNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="통일번호 *"
                variant="outlined"
                fullWidth
                error={!!errors.unifiedNumber}
                helperText={errors.unifiedNumber?.message}
                className={styles.formField}
                placeholder="IC2024001"
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="URL"
                variant="outlined"
                fullWidth
                error={!!errors.url}
                helperText={errors.url?.message}
                className={styles.formField}
                placeholder="https://risk.example.com"
                type="url"
              />
            )}
          />

          <Controller
            name="applicationDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="적용일자 *"
                variant="outlined"
                fullWidth
                error={!!errors.applicationDate}
                helperText={errors.applicationDate?.message}
                className={styles.formField}
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </div>
      </Box>

      {/* 목록 테이블 (상세 모드에서만 표시) */}
      {mode === 'detail' && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <Typography variant="subtitle1" className={styles.tableTitle}>
                📋 내부통제장치 목록
              </Typography>
            </div>
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={itemList}
                columns={columns}
                pagination={false}
                height={200}
                theme="rsms"
                emptyMessage="조회 된 정보가 없습니다."
              />
            </div>
          </Box>
        </>
      )}
    </BaseModal>
  );
};

InternalControlFormModal.displayName = 'InternalControlFormModal';

export default InternalControlFormModal;