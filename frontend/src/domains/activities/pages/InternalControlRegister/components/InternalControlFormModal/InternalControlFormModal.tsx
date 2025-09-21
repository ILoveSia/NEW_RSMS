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
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import {
  InternalControlRegister,
  InternalControlRegisterFormData,
  ExternalSystemInfo
} from '../../types/internalControlRegister.types';
import { ColDef } from 'ag-grid-community';
import styles from './InternalControlFormModal.module.scss';

interface InternalControlFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  item?: InternalControlRegister | null;
  onClose: () => void;
  onSave: (data: InternalControlRegisterFormData) => void;
  onUpdate: (id: string, data: InternalControlRegisterFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  businessAreaName: yup
    .string()
    .required('업무영역명은 필수입니다')
    .max(100, '업무영역명은 100자 이내로 입력해주세요'),
  businessAreaCode: yup
    .string()
    .required('업무영역코드는 필수입니다')
    .max(20, '업무영역코드는 20자 이내로 입력해주세요')
    .matches(/^[A-Z0-9]+$/, '업무영역코드는 영문 대문자와 숫자만 입력 가능합니다'),
  utilizationStatus: yup
    .string()
    .max(500, '활용현황은 500자 이내로 입력해주세요'),
  utilizationDetail: yup
    .string()
    .max(1000, '활용상세는 1000자 이내로 입력해주세요'),
  sortOrder: yup
    .number()
    .min(1, '정렬순서는 1 이상이어야 합니다')
    .max(999, '정렬순서는 999 이하여야 합니다')
    .required('정렬순서는 필수입니다'),
  isActive: yup
    .boolean()
    .required('사용여부는 필수입니다')
});

const InternalControlFormModal: React.FC<InternalControlFormModalProps> = ({
  open,
  mode,
  item,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('activities');
  const [externalSystems, setExternalSystems] = useState<ExternalSystemInfo[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InternalControlRegisterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      businessAreaName: '',
      businessAreaCode: '',
      utilizationStatus: '',
      utilizationDetail: '',
      sortOrder: 1,
      isActive: true
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && item) {
        reset({
          businessAreaName: item.businessAreaName,
          businessAreaCode: item.businessAreaCode,
          utilizationStatus: item.utilizationStatus,
          utilizationDetail: item.utilizationDetail,
          sortOrder: item.sortOrder,
          isActive: item.isActive
        });
        // 상세 모드에서 외부 시스템 연계 정보 로드 (실제로는 API 호출)
        loadExternalSystems(item.id);
      } else {
        reset({
          businessAreaName: '',
          businessAreaCode: '',
          utilizationStatus: '',
          utilizationDetail: '',
          sortOrder: 1,
          isActive: true
        });
        setExternalSystems([]);
      }
    }
  }, [open, mode, item, reset]);

  // 외부 시스템 연계 정보 로드 함수 (상세 모드용)
  const loadExternalSystems = useCallback(async (itemId: string) => {
    try {
      // TODO: API 호출로 해당 내부통제장치의 외부 시스템 연계 정보 로드
      // const response = await internalControlApi.getExternalSystems(itemId);
      // setExternalSystems(response.data);

      // 임시 데이터
      setExternalSystems([
        {
          id: '1',
          systemName: '외부 내부통제 시스템 A',
          connectionStatus: 'CONNECTED',
          lastSyncDate: '2024-09-20',
          syncStatus: '정상 동기화'
        },
        {
          id: '2',
          systemName: '외부 내부통제 시스템 B',
          connectionStatus: 'DISCONNECTED',
          lastSyncDate: '2024-09-18',
          syncStatus: '연결 끊김'
        }
      ]);
    } catch (error) {
      console.error('외부 시스템 연계 정보 로드 실패:', error);
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: InternalControlRegisterFormData) => {
    if (mode === 'create') {
      onSave(data);
    } else if (mode === 'detail' && item) {
      onUpdate(item.id, data);
    }
  }, [mode, item, onSave, onUpdate]);

  // 외부 시스템 연계 정보 테이블 컬럼 정의
  const externalSystemColumns: ColDef<ExternalSystemInfo>[] = [
    {
      field: 'systemName',
      headerName: '시스템명',
      width: 200,
      sortable: true
    },
    {
      field: 'connectionStatus',
      headerName: '연결 상태',
      width: 120,
      sortable: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        let color = '#6b7280';
        let bgColor = '#f3f4f6';
        let text = '알 수 없음';

        switch (status) {
          case 'CONNECTED':
            color = '#10b981';
            bgColor = '#ecfdf5';
            text = '연결됨';
            break;
          case 'DISCONNECTED':
            color = '#ef4444';
            bgColor = '#fef2f2';
            text = '연결 끊김';
            break;
          case 'ERROR':
            color = '#f59e0b';
            bgColor = '#fffbeb';
            text = '오류';
            break;
        }

        return `
          <span style="
            color: ${color};
            background-color: ${bgColor};
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.75rem;
            display: inline-block;
          ">
            ${text}
          </span>
        `;
      }
    },
    {
      field: 'lastSyncDate',
      headerName: '최종 동기화',
      width: 120,
      sortable: true
    },
    {
      field: 'syncStatus',
      headerName: '동기화 상태',
      width: 150,
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
            name="businessAreaName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="업무영역명 *"
                variant="outlined"
                fullWidth
                error={!!errors.businessAreaName}
                helperText={errors.businessAreaName?.message}
                className={styles.formField}
                placeholder="예: WRS"
              />
            )}
          />

          <Controller
            name="businessAreaCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="업무영역코드 *"
                variant="outlined"
                fullWidth
                error={!!errors.businessAreaCode}
                helperText={errors.businessAreaCode?.message}
                className={styles.formField}
                placeholder="예: WRS"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="utilizationStatus"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="활용현황"
                variant="outlined"
                fullWidth
                error={!!errors.utilizationStatus}
                helperText={errors.utilizationStatus?.message}
                className={styles.formField}
                placeholder="예: 내부통제원부"
              />
            )}
          />

          <Controller
            name="sortOrder"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="정렬순서 *"
                variant="outlined"
                type="number"
                fullWidth
                error={!!errors.sortOrder}
                helperText={errors.sortOrder?.message}
                className={styles.formField}
                inputProps={{ min: 1, max: 999 }}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="utilizationDetail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="활용상세"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.utilizationDetail}
                helperText={errors.utilizationDetail?.message}
                className={styles.formField}
                placeholder="예: 내부통제원부상세"
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    color="primary"
                  />
                }
                label="사용여부"
                className={styles.switchField}
              />
            )}
          />
        </div>
      </Box>

      {/* 외부 시스템 연계 정보 테이블 (상세 모드에서만 표시) */}
      {mode === 'detail' && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <Typography variant="subtitle1" className={styles.tableTitle}>
                🔗 외부 시스템 연계 정보
              </Typography>
            </div>
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={externalSystems}
                columns={externalSystemColumns}
                pagination={false}
                height={200}
                theme="rsms"
                emptyMessage="연계된 외부 시스템이 없습니다."
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