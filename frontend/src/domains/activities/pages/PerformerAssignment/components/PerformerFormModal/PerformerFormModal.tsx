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
  Autocomplete
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { PerformerAssignment, PerformerFormData, ActivityOption, UserOption, PerformRoleOption } from '../../types/performer.types';
import { ColDef } from 'ag-grid-community';
import styles from './PerformerFormModal.module.scss';

interface PerformerFormModalProps {
  open: boolean;
  mode: 'assign' | 'change' | 'detail';
  performer?: PerformerAssignment | null;
  onClose: () => void;
  onSave: (data: PerformerFormData) => void;
  onUpdate: (id: string, data: PerformerFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  activityId: yup
    .string()
    .required('관리활동은 필수입니다'),
  activityName: yup
    .string()
    .required('관리활동명은 필수입니다'),
  performerUserId: yup
    .string()
    .required('수행자는 필수입니다'),
  performerName: yup
    .string()
    .required('수행자명은 필수입니다'),
  performerDepartment: yup
    .string()
    .required('수행자 부서는 필수입니다'),
  performerPosition: yup
    .string()
    .required('수행자 직책은 필수입니다'),
  performPeriodStart: yup
    .string()
    .required('수행기간 시작일은 필수입니다'),
  performPeriodEnd: yup
    .string()
    .required('수행기간 종료일은 필수입니다'),
  performRole: yup
    .string()
    .required('수행역할은 필수입니다'),
  assignmentReason: yup
    .string()
    .when('$mode', {
      is: 'change',
      then: (schema) => schema.required('변경 사유는 필수입니다'),
      otherwise: (schema) => schema.optional()
    }),
});

const PerformerFormModal: React.FC<PerformerFormModalProps> = ({
  open,
  mode,
  performer,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('activities');
  const [assignmentHistory, setAssignmentHistory] = useState<PerformerAssignment[]>([]);

  // 관리활동 옵션 (실제로는 API에서 가져와야 함)
  const activityOptions: ActivityOption[] = [
    {
      activityId: 'ACT001',
      activityName: '영업 실적',
      activityDetail: '상반기가',
      cycle: '분기별',
      responsibleDepartment: '교육수행팀장'
    },
    {
      activityId: 'ACT002',
      activityName: '교육 관리',
      activityDetail: '교육 계획 수립 및 실행',
      cycle: '월별',
      responsibleDepartment: '교육팀'
    },
    {
      activityId: 'ACT003',
      activityName: '품질 관리',
      activityDetail: '품질 검사 및 개선',
      cycle: '주별',
      responsibleDepartment: '품질관리팀'
    }
  ];

  // 사용자 옵션 (실제로는 API에서 가져와야 함)
  const userOptions: UserOption[] = [
    {
      userId: '0000000',
      userName: '관리자',
      departmentName: '교육수행팀장',
      positionName: '팀장',
      email: 'admin@company.com'
    },
    {
      userId: '0000001',
      userName: '홍길동',
      departmentName: '영업팀',
      positionName: '대리',
      email: 'hong@company.com'
    },
    {
      userId: '0000002',
      userName: '김철수',
      departmentName: '마케팅팀',
      positionName: '과장',
      email: 'kim@company.com'
    }
  ];

  // 수행역할 옵션
  const performRoleOptions: PerformRoleOption[] = [
    { value: 'main', label: '주 수행자' },
    { value: 'sub', label: '보조 수행자' },
    { value: 'reviewer', label: '검토자' },
    { value: 'approver', label: '승인자' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<PerformerFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    context: { mode },
    defaultValues: {
      activityId: '',
      activityName: '',
      performerUserId: '',
      performerName: '',
      performerDepartment: '',
      performerPosition: '',
      performPeriodStart: '',
      performPeriodEnd: '',
      performRole: '',
      assignmentReason: ''
    }
  });

  // 관리활동 선택 시 자동 완성
  const handleActivityChange = useCallback((activityId: string) => {
    const selectedActivity = activityOptions.find(activity => activity.activityId === activityId);
    if (selectedActivity) {
      setValue('activityId', selectedActivity.activityId);
      setValue('activityName', selectedActivity.activityName);
    }
  }, [setValue, activityOptions]);

  // 수행자 선택 시 자동 완성
  const handlePerformerChange = useCallback((userId: string) => {
    const selectedUser = userOptions.find(user => user.userId === userId);
    if (selectedUser) {
      setValue('performerUserId', selectedUser.userId);
      setValue('performerName', selectedUser.userName);
      setValue('performerDepartment', selectedUser.departmentName);
      setValue('performerPosition', selectedUser.positionName);
    }
  }, [setValue, userOptions]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if ((mode === 'change' || mode === 'detail') && performer) {
        reset({
          activityId: performer.activityName, // TODO: 실제 activityId로 변경
          activityName: performer.activityName,
          performerUserId: performer.performer.split('-')[0] || '',
          performerName: performer.performer.split('-')[1] || performer.performer,
          performerDepartment: performer.responsibleDepartment,
          performerPosition: '팀장', // TODO: 실제 직책 정보
          performPeriodStart: performer.assignmentDate,
          performPeriodEnd: '2025-12-31', // TODO: 실제 종료일
          performRole: 'main',
          assignmentReason: ''
        });
        // 상세 모드에서 지정 이력 로드 (실제로는 API 호출)
        loadAssignmentHistory(performer.id);
      } else {
        reset({
          activityId: '',
          activityName: '',
          performerUserId: '',
          performerName: '',
          performerDepartment: '',
          performerPosition: '',
          performPeriodStart: new Date().toISOString().split('T')[0],
          performPeriodEnd: '',
          performRole: '',
          assignmentReason: ''
        });
        setAssignmentHistory([]);
      }
    }
  }, [open, mode, performer, reset]);

  // 지정 이력 로드 함수 (상세 모드용)
  const loadAssignmentHistory = useCallback(async (performerId: string) => {
    try {
      // TODO: API 호출로 해당 수행자의 지정 이력 로드
      // const response = await performerApi.getAssignmentHistory(performerId);
      // setAssignmentHistory(response.data.history);

      // 임시 데이터
      setAssignmentHistory([
        {
          id: '1',
          sequence: 1,
          order: 1,
          activityName: '영업 실적',
          activityDetail: '상반기가',
          cycle: '분기별',
          isInternalActivity: true,
          regulation: '구속',
          responsibleDepartment: '교육수행팀장',
          isPerformed: true,
          performer: '0000000-관리자',
          cssConst: 'Y',
          gnrzOblgDvcd: '02',
          endYn: 'N',
          assignmentDate: '2024-01-15',
          assigner: '시스템관리자',
          assignerPosition: '시스템관리자',
          modificationDate: '2024-03-20',
          modifier: '관리자',
          modifierPosition: '시스템관리자',
          status: '정상',
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('지정 이력 로드 실패:', error);
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: PerformerFormData) => {
    if (mode === 'assign') {
      onSave(data);
    } else if (mode === 'change' && performer) {
      onUpdate(performer.id, data);
    }
  }, [mode, performer, onSave, onUpdate]);

  // 지정 이력 테이블 컬럼 정의
  const historyColumns: ColDef<PerformerAssignment>[] = [
    {
      field: 'activityName',
      headerName: '관리활동명',
      width: 150,
      sortable: true
    },
    {
      field: 'performer',
      headerName: '수행자',
      width: 120,
      sortable: true
    },
    {
      field: 'assignmentDate',
      headerName: '지정일자',
      width: 100,
      sortable: true
    },
    {
      field: 'status',
      headerName: '상태',
      width: 80,
      sortable: true
    }
  ];

  const modalTitle = mode === 'assign' ? '수행자 지정' : mode === 'change' ? '수행자 변경' : '수행자 상세';
  const submitButtonText = mode === 'assign' ? '지정' : mode === 'change' ? '변경' : '확인';
  const isReadOnly = mode === 'detail';

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'cancel',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading
    },
    ...(mode !== 'detail' ? [{
      key: 'submit',
      label: submitButtonText,
      variant: 'contained' as const,
      color: 'primary' as const,
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading,
      loading: loading
    }] : [])
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
            name="activityId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={activityOptions}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.activityName}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{option.activityName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {option.activityDetail} ({option.cycle})
                      </div>
                    </div>
                  </li>
                )}
                onChange={(_, value) => {
                  if (value) {
                    handleActivityChange(value.activityId);
                  }
                }}
                value={activityOptions.find(option => option.activityId === field.value) || null}
                disabled={isReadOnly}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="관리활동 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.activityId}
                    helperText={errors.activityId?.message}
                    className={styles.formField}
                    placeholder="관리활동을 선택하세요"
                  />
                )}
              />
            )}
          />

          <Controller
            name="performerUserId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={userOptions}
                getOptionLabel={(option) => typeof option === 'string' ? option : `${option.userName} (${option.departmentName})`}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{option.userName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {option.departmentName} - {option.positionName}
                      </div>
                    </div>
                  </li>
                )}
                onChange={(_, value) => {
                  if (value) {
                    handlePerformerChange(value.userId);
                  }
                }}
                value={userOptions.find(option => option.userId === field.value) || null}
                disabled={isReadOnly}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="수행자 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.performerUserId}
                    helperText={errors.performerUserId?.message}
                    className={styles.formField}
                    placeholder="수행자를 선택하세요"
                  />
                )}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="performPeriodStart"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="수행기간 시작 *"
                type="date"
                variant="outlined"
                fullWidth
                error={!!errors.performPeriodStart}
                helperText={errors.performPeriodStart?.message}
                className={styles.formField}
                InputLabelProps={{ shrink: true }}
                disabled={isReadOnly}
              />
            )}
          />

          <Controller
            name="performPeriodEnd"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="수행기간 종료 *"
                type="date"
                variant="outlined"
                fullWidth
                error={!!errors.performPeriodEnd}
                helperText={errors.performPeriodEnd?.message}
                className={styles.formField}
                InputLabelProps={{ shrink: true }}
                disabled={isReadOnly}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="performRole"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.performRole}
                className={styles.formField}
              >
                <InputLabel>수행역할 *</InputLabel>
                <Select
                  {...field}
                  label="수행역할 *"
                  disabled={isReadOnly}
                >
                  {performRoleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.performRole && (
                  <FormHelperText>{errors.performRole.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {mode === 'change' && (
            <Controller
              name="assignmentReason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="변경 사유 *"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.assignmentReason}
                  helperText={errors.assignmentReason?.message}
                  className={styles.formField}
                  placeholder="변경 사유를 입력하세요"
                  disabled={isReadOnly}
                />
              )}
            />
          )}
        </div>
      </Box>

      {/* 지정 이력 테이블 (상세 모드에서만 표시) */}
      {mode === 'detail' && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <Typography variant="subtitle1" className={styles.tableTitle}>
                📋 수행자 지정 이력
              </Typography>
            </div>
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={assignmentHistory}
                columns={historyColumns}
                pagination={false}
                height={200}
                theme="rsms"
                emptyMessage="조회된 이력이 없습니다."
              />
            </div>
          </Box>
        </>
      )}
    </BaseModal>
  );
};

PerformerFormModal.displayName = 'PerformerFormModal';

export default PerformerFormModal;