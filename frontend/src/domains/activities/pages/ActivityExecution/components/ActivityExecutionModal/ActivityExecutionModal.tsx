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
  Grid,
  Paper
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import {
  ActivityExecution,
  ActivityExecutionFormData,
  ActivityExecutionDetail
} from '../../types/activityExecution.types';
import styles from './ActivityExecutionModal.module.scss';

interface ActivityExecutionModalProps {
  open: boolean;
  mode: 'edit' | 'detail';
  activity?: ActivityExecution | null;
  onClose: () => void;
  onSave: (data: ActivityExecutionFormData) => void;
  onUpdate: (id: string, data: ActivityExecutionFormData) => void;
  loading?: boolean;
}

// 이미지 기반 폼 검증 스키마
const schema = yup.object({
  activityResult: yup
    .string()
    .required('관리활동 결과 작성은 필수입니다'),
  performanceAssessment: yup
    .string()
    .required('관리활동의 적절히 수행되었습니까는 필수입니다'),
  activityOpinion: yup
    .string()
    .required('관리활동 의견은 필수입니다')
    .max(1000, '관리활동 의견은 1000자 이내로 입력해주세요'),
  checklist: yup
    .string()
    .max(2000, '체크리스트는 2000자 이내로 입력해주세요'),
  checklistConfirmed: yup
    .string()
    .required('체크리스트 점검여부는 필수입니다'),
});

const ActivityExecutionModal: React.FC<ActivityExecutionModalProps> = ({
  open,
  mode,
  activity,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('resps');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ActivityExecutionFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      activityResult: '적정',
      performanceAssessment: '적정',
      activityOpinion: '',
      checklist: '방법1',
      checklistConfirmed: 'Y'
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open && activity && mode === 'edit') {
      reset({
        activityResult: '적정',
        performanceAssessment: '적정',
        activityOpinion: '',
        checklist: '방법1',
        checklistConfirmed: 'Y'
      });
    } else if (open && !activity) {
      reset();
    }
  }, [open, activity, mode, reset]);

  const handleFormSubmit = useCallback((data: ActivityExecutionFormData) => {
    if (mode === 'edit' && activity) {
      onUpdate(activity.id, data);
    } else {
      onSave(data);
    }
  }, [mode, activity, onSave, onUpdate]);

  const modalActions: ModalAction[] = [
    {
      label: '취소',
      onClick: onClose,
      variant: 'outlined',
      disabled: loading
    },
    {
      label: '등록및저장(0)',
      onClick: mode === 'detail' ? onClose : handleSubmit(handleFormSubmit),
      variant: 'contained',
      disabled: loading || (mode === 'edit' && !isValid),
      loading: loading
    }
  ];

  const modalTitle = '관리활동 수행 대상 목록 상세';

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      fullWidth
      actions={modalActions}
      loading={loading}
    >
      <div className={styles.modalContent}>
        {/* 📋 상단 영역: 관리활동 결과 작성 */}
        <div className={styles.topSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            🔸 관리활동 수행 대상 목록 상세
          </Typography>

          <Grid container spacing={2} className={styles.topFields}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" className={styles.fieldLabel}>
                • 관리활동 결과 작성 *
              </Typography>
              <Controller
                name="activityResult"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.activityResult}>
                    <Select
                      {...field}
                      disabled={mode === 'detail'}
                      className={styles.selectField}
                    >
                      <MenuItem value="적정">적정</MenuItem>
                      <MenuItem value="부적정">부적정</MenuItem>
                      <MenuItem value="보완필요">보완필요</MenuItem>
                    </Select>
                    {errors.activityResult && (
                      <FormHelperText>{errors.activityResult.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" className={styles.fieldLabel}>
                • 관리활동의 적절히 수행되었습니까? *
              </Typography>
              <Controller
                name="performanceAssessment"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.performanceAssessment}>
                    <Select
                      {...field}
                      disabled={mode === 'detail'}
                      className={styles.selectField}
                    >
                      <MenuItem value="적정">적정</MenuItem>
                      <MenuItem value="부적정">부적정</MenuItem>
                      <MenuItem value="보완필요">보완필요</MenuItem>
                    </Select>
                    {errors.performanceAssessment && (
                      <FormHelperText>{errors.performanceAssessment.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" className={styles.fieldLabel}>
                • 관리활동 의견 *
              </Typography>
              <Controller
                name="activityOpinion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={mode === 'detail'}
                    error={!!errors.activityOpinion}
                    helperText={errors.activityOpinion?.message}
                    className={styles.opinionField}
                  />
                )}
              />
            </Grid>
          </Grid>
        </div>

        {/* 🏗️ 중앙 분할 레이아웃: 왼쪽 파란색 + 오른쪽 폼 */}
        <div className={styles.mainSplitLayout}>
          {/* 왼쪽 파란색 영역: "관리활동" */}
          <div className={styles.leftBluePanel}>
            <Typography variant="h4" className={styles.bluePanelTitle}>
              관리활동
            </Typography>
          </div>

          {/* 오른쪽 폼 영역 */}
          <div className={styles.rightFormPanel}>
            <Grid container spacing={2}>
              {/* 첫 번째 행: 항목코드, 업무Lv.1, 업무Lv.2 */}
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 항목코드 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value="M000000001"
                  disabled
                  className={styles.formField}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 업무Lv.1 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value="책무구조도"
                  disabled={mode === 'detail'}
                  className={styles.formField}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 업무Lv.2 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value="관리활동수행"
                  disabled={mode === 'detail'}
                  className={styles.formField}
                />
              </Grid>

              {/* 두 번째 행: 관리활동명, 관리활동주기 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 관리활동명 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={activity?.activityName || "명청 실컷"}
                  disabled={mode === 'detail'}
                  className={styles.formField}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 관리활동주기 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value="분기"
                  disabled={mode === 'detail'}
                  className={styles.formField}
                />
              </Grid>

              {/* 세 번째 행: 이행점검항목 */}
              <Grid item xs={12}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 이행점검항목 *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value="항법1"
                  disabled={mode === 'detail'}
                  className={styles.textareaField}
                />
              </Grid>

              {/* 네 번째 행: 내부통제지적 구분, 관련 내규 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 내부통제지적 구분 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value="근기1"
                  disabled={mode === 'detail'}
                  className={styles.formField}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 관련 내규 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value="승업차급1"
                  disabled={mode === 'detail'}
                  className={styles.formField}
                />
              </Grid>

              {/* 다섯 번째 행: 통제 가이드 */}
              <Grid item xs={12}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 통제 가이드 *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value="교육수행내역"
                  disabled={mode === 'detail'}
                  className={styles.textareaField}
                />
              </Grid>

              {/* 여섯 번째 행: 통제 현실 */}
              <Grid item xs={12}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 통제 현실 *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  disabled={mode === 'detail'}
                  className={styles.textareaField}
                />
              </Grid>

              {/* 일곱 번째 행: 통제 지표 */}
              <Grid item xs={12}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  • 통제 지표 *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  disabled={mode === 'detail'}
                  className={styles.textareaField}
                />
              </Grid>
            </Grid>
          </div>
        </div>

        {/* 🏛️ 하단 영역: 체크리스트 */}
        <div className={styles.bottomSection}>
          <div className={styles.checklistLayout}>
            {/* 왼쪽: 체크리스트 제목 */}
            <div className={styles.checklistLabel}>
              <Typography variant="h6" className={styles.checklistTitle}>
                체크리스트
              </Typography>
            </div>

            {/* 중앙: 체크리스트 내용 */}
            <div className={styles.checklistContent}>
              <Controller
                name="checklist"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={mode === 'detail'}
                    error={!!errors.checklist}
                    helperText={errors.checklist?.message}
                    className={styles.checklistField}
                  />
                )}
              />
            </div>

            {/* 오른쪽: 체크리스트 점검여부 */}
            <div className={styles.checklistConfirmation}>
              <Typography variant="body2" className={styles.fieldLabel}>
                • 체크리스트 점검여부 *
              </Typography>
              <Controller
                name="checklistConfirmed"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.checklistConfirmed}>
                    <Select
                      {...field}
                      disabled={mode === 'detail'}
                      className={styles.confirmSelect}
                    >
                      <MenuItem value="Y">Y</MenuItem>
                      <MenuItem value="N">N</MenuItem>
                    </Select>
                    {errors.checklistConfirmed && (
                      <FormHelperText>{errors.checklistConfirmed.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ActivityExecutionModal;