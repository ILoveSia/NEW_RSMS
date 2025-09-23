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
import { PeriodSetting, PeriodSettingFormData, StatusOption } from '../../types/periodSetting.types';
import { ColDef } from 'ag-grid-community';
import styles from './PeriodFormModal.module.scss';

interface PeriodFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  period?: PeriodSetting | null;
  onClose: () => void;
  onSave: (data: PeriodSettingFormData) => void;
  onUpdate: (id: string, data: PeriodSettingFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  inspectionName: yup
    .string()
    .required('점검명은 필수입니다')
    .max(100, '점검명은 100자 이내로 입력해주세요'),
  inspectionStartDate: yup
    .string()
    .required('점검 수행기간 시작일은 필수입니다'),
  inspectionEndDate: yup
    .string()
    .required('점검 수행기간 종료일은 필수입니다')
    .test('end-date', '종료일은 시작일보다 이후여야 합니다', function(value) {
      const { inspectionStartDate } = this.parent;
      if (!inspectionStartDate || !value) return true;
      return new Date(value) >= new Date(inspectionStartDate);
    }),
  activityStartDate: yup
    .string()
    .required('활동 대상 기간 시작일은 필수입니다'),
  activityEndDate: yup
    .string()
    .required('활동 대상 기간 종료일은 필수입니다')
    .test('activity-end-date', '활동 대상 기간 종료일은 시작일보다 이후여야 합니다', function(value) {
      const { activityStartDate } = this.parent;
      if (!activityStartDate || !value) return true;
      return new Date(value) >= new Date(activityStartDate);
    })
    .test('activity-before-inspection', '활동 대상 기간은 점검 수행기간보다 이전이어야 합니다', function(value) {
      const { inspectionStartDate } = this.parent;
      if (!inspectionStartDate || !value) return true;
      return new Date(value) <= new Date(inspectionStartDate);
    }),
  status: yup
    .string()
    .required('상태는 필수입니다')
    .oneOf(['ACTIVE', 'INACTIVE', 'DRAFT'], '유효한 상태를 선택해주세요'),
});

const PeriodFormModal: React.FC<PeriodFormModalProps> = ({
  open,
  mode,
  period,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('compliance');
  const [relatedItems, setRelatedItems] = useState<PeriodSetting[]>([]);

  // 상태 옵션
  const statusOptions: StatusOption[] = [
    { value: 'ACTIVE', label: '시행', color: 'success' },
    { value: 'INACTIVE', label: '중단', color: 'error' },
    { value: 'DRAFT', label: '임시', color: 'warning' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<PeriodSettingFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      inspectionName: '',
      inspectionStartDate: '',
      inspectionEndDate: '',
      activityStartDate: '',
      activityEndDate: '',
      description: '',
      status: 'DRAFT'
    }
  });

  // 날짜 감시 (유효성 검증용)
  const watchedDates = watch(['inspectionStartDate', 'inspectionEndDate', 'activityStartDate', 'activityEndDate']);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && period) {
        reset({
          inspectionName: period.inspectionName,
          inspectionStartDate: period.inspectionStartDate,
          inspectionEndDate: period.inspectionEndDate,
          activityStartDate: period.activityStartDate,
          activityEndDate: period.activityEndDate,
          description: '',
          status: period.status
        });
        // 상세 모드에서 관련 항목 로드
        loadRelatedItems(period.id);
      } else {
        reset({
          inspectionName: '',
          inspectionStartDate: '',
          inspectionEndDate: '',
          activityStartDate: '',
          activityEndDate: '',
          description: '',
          status: 'DRAFT'
        });
        setRelatedItems([]);
      }
    }
  }, [open, mode, period, reset]);

  // 관련 항목 로드 함수 (상세 모드용)
  const loadRelatedItems = useCallback(async (periodId: string) => {
    try {
      // TODO: API 호출로 관련 항목 로드
      // const response = await periodApi.getRelatedItems(periodId);
      // setRelatedItems(response.data);

      // 임시 데이터
      setRelatedItems([
        {
          id: '1',
          sequence: 1,
          inspectionName: '관련 점검 1',
          inspectionStartDate: '2024-07-01',
          inspectionEndDate: '2024-07-31',
          activityStartDate: '2024-06-01',
          activityEndDate: '2024-06-30',
          registrationDate: '2024-05-15',
          registrantAuthority: '관리자',
          registrant: '김관리',
          status: 'ACTIVE',
          statusText: '시행',
          isActive: true,
          createdAt: '2024-05-15T09:00:00Z',
          updatedAt: '2024-05-15T09:00:00Z',
          createdBy: 'admin',
          updatedBy: 'admin'
        }
      ]);
    } catch (error) {
      console.error('관련 항목 로드 실패:', error);
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: PeriodSettingFormData) => {
    if (mode === 'create') {
      onSave(data);
    } else if (mode === 'detail' && period) {
      onUpdate(period.id, data);
    }
  }, [mode, period, onSave, onUpdate]);

  // 관련 항목 테이블 컬럼 정의
  const relatedColumns: ColDef<PeriodSetting>[] = [
    {
      field: 'sequence',
      headerName: '순번',
      width: 80,
      sortable: true,
      cellClass: 'ag-cell-center'
    },
    {
      field: 'inspectionName',
      headerName: '점검명',
      width: 200,
      sortable: true
    },
    {
      field: 'inspectionStartDate',
      headerName: '점검 시작일',
      width: 120,
      sortable: true,
      cellRenderer: (params: any) => {
        return params.value ? params.value.replace(/-/g, '.') : '';
      }
    },
    {
      field: 'statusText',
      headerName: '상태',
      width: 80,
      sortable: true,
      cellClass: 'ag-cell-center'
    }
  ];

  const modalTitle = mode === 'create' ? '점검 기간 등록' : '점검 기간 상세';
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
      size="lg"
      actions={modalActions}
      loading={loading}
      className={styles.modal}
      contentClassName={styles.modalContent}
    >
      {/* 기본 정보 입력 폼 */}
      <Box component="form" className={styles.form}>
        <div className={styles.formRow}>
          <Controller
            name="inspectionName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검명 *"
                variant="outlined"
                fullWidth
                error={!!errors.inspectionName}
                helperText={errors.inspectionName?.message}
                className={styles.formField}
                placeholder="점검 명칭을 입력하세요"
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                className={styles.formField}
                error={!!errors.status}
              >
                <InputLabel>상태 *</InputLabel>
                <Select
                  {...field}
                  label="상태 *"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="inspectionStartDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검 수행기간 시작일 *"
                variant="outlined"
                fullWidth
                type="date"
                error={!!errors.inspectionStartDate}
                helperText={errors.inspectionStartDate?.message}
                className={styles.formField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />

          <Controller
            name="inspectionEndDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검 수행기간 종료일 *"
                variant="outlined"
                fullWidth
                type="date"
                error={!!errors.inspectionEndDate}
                helperText={errors.inspectionEndDate?.message}
                className={styles.formField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="activityStartDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="활동 대상 기간 시작일 *"
                variant="outlined"
                fullWidth
                type="date"
                error={!!errors.activityStartDate}
                helperText={errors.activityStartDate?.message}
                className={styles.formField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />

          <Controller
            name="activityEndDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="활동 대상 기간 종료일 *"
                variant="outlined"
                fullWidth
                type="date"
                error={!!errors.activityEndDate}
                helperText={errors.activityEndDate?.message}
                className={styles.formField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설명"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                className={styles.formField}
                placeholder="점검에 대한 추가 설명을 입력하세요"
              />
            )}
          />
        </div>
      </Box>

      {/* 관련 항목 테이블 (상세 모드에서만 표시) */}
      {mode === 'detail' && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <Typography variant="subtitle1" className={styles.tableTitle}>
                📋 관련 점검 항목
              </Typography>
            </div>
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={relatedItems}
                columns={relatedColumns}
                pagination={false}
                height={200}
                theme="rsms"
                emptyMessage="관련 점검 항목이 없습니다."
              />
            </div>
          </Box>
        </>
      )}
    </BaseModal>
  );
};

PeriodFormModal.displayName = 'PeriodFormModal';

export default PeriodFormModal;