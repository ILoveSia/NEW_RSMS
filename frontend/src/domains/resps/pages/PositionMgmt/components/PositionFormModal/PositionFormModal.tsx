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
import { Position, PositionFormData, HeadquartersOption } from '../../types/position.types';
import { ColDef } from 'ag-grid-community';
import styles from './PositionFormModal.module.scss';

interface PositionFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  position?: Position | null;
  onClose: () => void;
  onSave: (data: PositionFormData) => void;
  onUpdate: (id: string, data: PositionFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  positionName: yup
    .string()
    .required('직책명은 필수입니다')
    .max(50, '직책명은 50자 이내로 입력해주세요'),
  headquarters: yup
    .string()
    .required('본부구분은 필수입니다'),
  departmentName: yup
    .string()
    .required('부서명은 필수입니다')
    .max(100, '부서명은 100자 이내로 입력해주세요'),
  divisionName: yup
    .string()
    .required('부정명은 필수입니다')
    .max(100, '부정명은 100자 이내로 입력해주세요'),
});

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  open,
  mode,
  position,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('resps');
  const [positionList, setPositionList] = useState<Position[]>([]);

  // 본부구분 옵션 (실제로는 API에서 가져와야 함)
  const headquartersOptions: HeadquartersOption[] = [
    { value: 'headquarters', label: '본부' },
    { value: 'department', label: '부서' },
    { value: 'team', label: '팀' },
    { value: 'division', label: '부정' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<PositionFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      positionName: '',
      headquarters: '',
      departmentName: '',
      divisionName: ''
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && position) {
        reset({
          positionName: position.positionName,
          headquarters: position.headquarters,
          departmentName: position.departmentName,
          divisionName: position.divisionName
        });
        // 상세 모드에서 직책목록 로드 (실제로는 API 호출)
        loadPositionList(position.id);
      } else {
        reset({
          positionName: '',
          headquarters: '',
          departmentName: '',
          divisionName: ''
        });
        setPositionList([]);
      }
    }
  }, [open, mode, position, reset]);

  // 직책목록 로드 함수 (상세 모드용)
  const loadPositionList = useCallback(async (positionId: string) => {
    try {
      // TODO: API 호출로 해당 직책의 관련 정보 로드
      // const response = await positionApi.getPositionDetails(positionId);
      // setPositionList(response.data.positionList);

      // 임시 데이터
      setPositionList([
        {
          id: '1',
          positionName: '경영전략본부장',
          headquarters: '본부',
          departmentName: '경영전략본부',
          divisionName: '경영전략부',
          registrationDate: '2024-01-15',
          registrar: '김관리자',
          registrarPosition: '시스템관리자',
          modificationDate: '2024-01-15',
          modifier: '김관리자',
          modifierPosition: '시스템관리자',
          status: '정상',
          isActive: true,
          approvalStatus: '승인',
          dual: '단일'
        }
      ]);
    } catch (error) {
      console.error('직책목록 로드 실패:', error);
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: PositionFormData) => {
    if (mode === 'create') {
      onSave(data);
    } else if (mode === 'detail' && position) {
      onUpdate(position.id, data);
    }
  }, [mode, position, onSave, onUpdate]);

  // 직책목록 테이블 컬럼 정의
  const columns: ColDef<Position>[] = [
    {
      field: 'positionName',
      headerName: '직책',
      width: 150,
      sortable: true
    },
    {
      field: 'headquarters',
      headerName: '본부구분',
      width: 120,
      sortable: true
    },
    {
      field: 'departmentName',
      headerName: '부서명',
      width: 150,
      sortable: true
    },
    {
      field: 'divisionName',
      headerName: '부정명',
      width: 150,
      sortable: true
    }
  ];

  const modalTitle = mode === 'create' ? '직책 추가' : '직책 상세';
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
            name="positionName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="직책 *"
                variant="outlined"
                fullWidth
                error={!!errors.positionName}
                helperText={errors.positionName?.message}
                className={styles.formField}
                placeholder="이사회의장"
              />
            )}
          />

          <Controller
            name="headquarters"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.headquarters}
                className={styles.formField}
              >
                <InputLabel>본부구분 *</InputLabel>
                <Select
                  {...field}
                  label="본부구분 *"
                >
                  {headquartersOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.headquarters && (
                  <FormHelperText>{errors.headquarters.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="departmentName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="부서명 *"
                variant="outlined"
                fullWidth
                error={!!errors.departmentName}
                helperText={errors.departmentName?.message}
                className={styles.formField}
                placeholder="사외이사"
              />
            )}
          />

          <Controller
            name="divisionName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="부정명 *"
                variant="outlined"
                fullWidth
                error={!!errors.divisionName}
                helperText={errors.divisionName?.message}
                className={styles.formField}
              />
            )}
          />
        </div>
      </Box>

      {/* 직책목록 테이블 (상세 모드에서만 표시) */}
      {mode === 'detail' && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <Typography variant="subtitle1" className={styles.tableTitle}>
                📋 직책목록
              </Typography>
            </div>
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={positionList}
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

PositionFormModal.displayName = 'PositionFormModal';

export default PositionFormModal;