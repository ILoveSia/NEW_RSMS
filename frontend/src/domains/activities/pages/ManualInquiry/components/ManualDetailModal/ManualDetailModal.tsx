import React, { useEffect, useCallback } from 'react';
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
  Box
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import {
  ManualInquiry,
  ManualInquiryFormData,
  ActivityTypeOption,
  RiskValueOption
} from '../../types/manualInquiry.types';
import styles from './ManualDetailModal.module.scss';

interface ManualDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  manual?: ManualInquiry | null;
  onClose: () => void;
  onSave: (data: ManualInquiryFormData) => void;
  onUpdate: (id: string, data: ManualInquiryFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  departmentName: yup
    .string()
    .required('부서명은 필수입니다')
    .max(100, '부서명은 100자 이내로 입력해주세요'),
  managementActivityCode: yup
    .string()
    .required('관리활동코드는 필수입니다')
    .max(20, '관리활동코드는 20자 이내로 입력해주세요'),
  managementActivityName: yup
    .string()
    .required('관리활동명은 필수입니다')
    .max(200, '관리활동명은 200자 이내로 입력해주세요'),
  managementActivityDetail: yup
    .string()
    .required('관리활동상세는 필수입니다')
    .max(2000, '관리활동상세는 2000자 이내로 입력해주세요'),
  riskAssessmentElement: yup
    .string()
    .required('위험평가요소는 필수입니다')
    .max(500, '위험평가요소는 500자 이내로 입력해주세요'),
  managementActivityType: yup
    .string()
    .required('관리활동유형은 필수입니다'),
  startYearMonth: yup
    .string()
    .required('시작년월은 필수입니다'),
  endYearMonth: yup
    .string()
    .optional(),
  relatedRegulation: yup
    .string()
    .optional()
    .max(500, '관련규정은 500자 이내로 입력해주세요'),
  riskValue: yup
    .string()
    .required('위험도는 필수입니다'),
  managementRepresentative: yup
    .string()
    .required('관리대표자는 필수입니다')
    .max(100, '관리대표자는 100자 이내로 입력해주세요')
});

const ManualDetailModal: React.FC<ManualDetailModalProps> = ({
  open,
  mode,
  manual,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {

  // 관리활동유형 옵션 (실제로는 API에서 가져와야 함)
  const activityTypeOptions: ActivityTypeOption[] = [
    { value: 'PLANNING', label: '기획' },
    { value: 'EXECUTION', label: '실행' },
    { value: 'MONITORING', label: '모니터링' },
    { value: 'EVALUATION', label: '평가' }
  ];

  // 위험도 옵션 (실제로는 API에서 가져와야 함)
  const riskValueOptions: RiskValueOption[] = [
    { value: 'HIGH', label: '상' },
    { value: 'MEDIUM', label: '중' },
    { value: 'LOW', label: '하' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ManualInquiryFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      departmentName: '',
      managementActivityCode: '',
      managementActivityName: '',
      managementActivityDetail: '',
      riskAssessmentElement: '',
      managementActivityType: '',
      startYearMonth: '',
      endYearMonth: '',
      relatedRegulation: '',
      riskValue: '',
      managementRepresentative: ''
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && manual) {
        reset({
          departmentName: manual.departmentName,
          managementActivityCode: manual.managementActivityCode,
          managementActivityName: manual.managementActivityName,
          managementActivityDetail: manual.managementActivityDetail,
          riskAssessmentElement: manual.riskAssessmentElement,
          managementActivityType: manual.managementActivityType,
          startYearMonth: manual.startYearMonth,
          endYearMonth: manual.endYearMonth || '',
          relatedRegulation: manual.relatedRegulation || '',
          riskValue: manual.riskValue,
          managementRepresentative: manual.managementRepresentative || ''
        });
      } else {
        reset({
          departmentName: '',
          managementActivityCode: '',
          managementActivityName: '',
          managementActivityDetail: '',
          riskAssessmentElement: '',
          managementActivityType: '',
          startYearMonth: '',
          endYearMonth: '',
          relatedRegulation: '',
          riskValue: '',
          managementRepresentative: ''
        });
      }
    }
  }, [open, mode, manual, reset]);

  // 폼 제출 처리
  const onSubmit = useCallback((data: ManualInquiryFormData) => {
    if (mode === 'create') {
      onSave(data);
    } else if (mode === 'detail' && manual) {
      onUpdate(manual.id, data);
    }
  }, [mode, manual, onSave, onUpdate]);

  const modalTitle = mode === 'create' ? '업무메뉴얼 추가' : '업무메뉴얼 상세';
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
              <TextField
                {...field}
                label="부서명 *"
                variant="outlined"
                fullWidth
                error={!!errors.departmentName}
                helperText={errors.departmentName?.message}
                className={styles.formField}
                placeholder="경영전략본부"
              />
            )}
          />

          <Controller
            name="managementActivityCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="관리활동코드 *"
                variant="outlined"
                fullWidth
                error={!!errors.managementActivityCode}
                helperText={errors.managementActivityCode?.message}
                className={styles.formField}
                placeholder="MA001"
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
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
                placeholder="전략기획 및 실행관리"
              />
            )}
          />

          <Controller
            name="managementActivityType"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.managementActivityType}
                className={styles.formField}
              >
                <InputLabel>관리활동유형 *</InputLabel>
                <Select
                  {...field}
                  label="관리활동유형 *"
                >
                  {activityTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.managementActivityType && (
                  <FormHelperText>{errors.managementActivityType.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="managementActivityDetail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="관리활동상세 *"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.managementActivityDetail}
                helperText={errors.managementActivityDetail?.message}
                className={styles.formField}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="riskAssessmentElement"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="위험평가요소 *"
                variant="outlined"
                fullWidth
                error={!!errors.riskAssessmentElement}
                helperText={errors.riskAssessmentElement?.message}
                className={styles.formField}
              />
            )}
          />

          <Controller
            name="riskValue"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.riskValue}
                className={styles.formField}
              >
                <InputLabel>위험도 *</InputLabel>
                <Select
                  {...field}
                  label="위험도 *"
                >
                  {riskValueOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.riskValue && (
                  <FormHelperText>{errors.riskValue.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="startYearMonth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="시작년월 *"
                variant="outlined"
                fullWidth
                type="month"
                error={!!errors.startYearMonth}
                helperText={errors.startYearMonth?.message}
                className={styles.formField}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="endYearMonth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="종료년월"
                variant="outlined"
                fullWidth
                type="month"
                error={!!errors.endYearMonth}
                helperText={errors.endYearMonth?.message}
                className={styles.formField}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="relatedRegulation"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="관련규정"
                variant="outlined"
                fullWidth
                error={!!errors.relatedRegulation}
                helperText={errors.relatedRegulation?.message}
                className={styles.formField}
              />
            )}
          />

          <Controller
            name="managementRepresentative"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="관리대표자 *"
                variant="outlined"
                fullWidth
                error={!!errors.managementRepresentative}
                helperText={errors.managementRepresentative?.message}
                className={styles.formField}
              />
            )}
          />
        </div>
      </Box>
    </BaseModal>
  );
};

ManualDetailModal.displayName = 'ManualDetailModal';

export default ManualDetailModal;