/**
 * 관리활동 수행 상세 모달
 * - 좌측: 관리활동 영역 (읽기 전용, 카드 섹션)
 * - 우측: 수행정보 영역 (편집 가능)
 */

import { Button } from '@/shared/components/atoms/Button';
import styles from './ActivityExecutionModal.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  ActivityExecution,
  ActivityExecutionFormData
} from '../../types/activityExecution.types';
import type { UseCommonCodeReturn } from '@/shared/hooks/useCommonCode/useCommonCode';

interface ActivityExecutionModalProps {
  open: boolean;
  mode: 'edit' | 'detail';
  activity?: ActivityExecution | null;
  onClose: () => void;
  onSave: (data: ActivityExecutionFormData) => void;
  onUpdate: (id: string, data: ActivityExecutionFormData) => void;
  loading?: boolean;
  checkFrequencyCode?: UseCommonCodeReturn;
}

/**
 * 수행정보 폼 검증 스키마
 */
const schema = yup.object({
  performanceDate: yup
    .string()
    .nullable(),
  performer: yup
    .string(),
  activityResult: yup
    .string()
    .required('관리활동 결과는 필수입니다'),
  performanceAssessment: yup
    .string()
    .required('수행결과는 필수입니다'),
  activityOpinion: yup
    .string()
    .max(1000, '수행결과 내용은 1000자 이내로 입력해주세요')
});

const ActivityExecutionModal: React.FC<ActivityExecutionModalProps> = ({
  open,
  mode,
  activity,
  onClose,
  onSave,
  onUpdate,
  loading = false,
  checkFrequencyCode
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
      performanceDate: dayjs().format('YYYY-MM-DD'),
      performer: '',
      activityResult: '01',
      performanceAssessment: '',  // 기본값: 선택 (빈 문자열)
      activityOpinion: ''
    }
  });

  useEffect(() => {
    if (open && activity) {
      if (mode === 'edit') {
        reset({
          performanceDate: activity.executionDate || dayjs().format('YYYY-MM-DD'),
          performer: activity.executorName || activity.executorId || '',
          activityResult: activity.executionStatus || '01',  // 수행여부: executionStatus
          performanceAssessment: activity.executionResultCd || '01',  // 수행결과: executionResultCd
          activityOpinion: activity.executionResultContent || ''
        });
      } else {
        // detail 모드: 읽기 전용으로 실제 데이터 표시 (데이터 없으면 '선택' 표시를 위해 빈 문자열)
        reset({
          performanceDate: activity.executionDate || '',
          performer: activity.executorName || activity.executorId || '',
          activityResult: activity.executionStatus || '01',  // 수행여부: executionStatus (기본값: 미수행)
          performanceAssessment: activity.executionResultCd || '',  // 수행결과: executionResultCd (빈값이면 '선택')
          activityOpinion: activity.executionResultContent || ''
        });
      }
    } else if (open && !activity) {
      reset();
    }
  }, [open, activity, mode, reset]);

  const handleFormSubmit = useCallback((data: ActivityExecutionFormData) => {
    if (activity) {
      onUpdate(activity.id, data);
    } else {
      onSave(data);
    }
  }, [activity, onSave, onUpdate]);

  const modalTitle = activity ? '관리활동 수행 상세 / 수정' : '관리활동 수행 등록';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxHeight: '85vh',
            width: '85%'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'var(--theme-page-header-bg)',
            color: 'var(--theme-page-header-text)',
            fontSize: '1.25rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 1
          }}
        >
          <span>{modalTitle}</span>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              color: 'var(--theme-page-header-text)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              {/* 왼쪽: 관리활동 영역 (읽기 전용) */}
              <Grid item xs={12} md={7}>
                <Typography className={styles.sectionTitle}>
                  관리활동 영역
                </Typography>

                {/* 카드 섹션 1: 기본 정보 */}
                <div className={`${styles.cardSection} ${styles.cardBasicInfo}`}>
                  <div className={styles.cardTitle}>📋 기본 정보</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>부서명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={activity?.orgName || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>책무관리항목</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      multiline
                      rows={2}
                      value={activity?.respItem || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>관리활동명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={activity?.activityName || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>

                {/* 카드 섹션 2: 점검 정보 */}
                <div className={`${styles.cardSection} ${styles.cardInspectionInfo}`}>
                  <div className={styles.cardTitle}>📝 점검 정보</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행점검항목</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      variant="outlined"
                      value={activity?.execCheckMethod || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검세부내용</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      variant="outlined"
                      value={activity?.execCheckDetail || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검주기</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={
                        activity?.execCheckFrequencyCd
                          ? checkFrequencyCode?.getCodeName(activity.execCheckFrequencyCd) || activity.execCheckFrequencyCd
                          : '-'
                      }
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>
              </Grid>

              {/* 오른쪽: 수행정보 영역 (편집 가능) */}
              <Grid item xs={12} md={5}>
                <Typography className={styles.sectionTitle}>
                  수행정보 영역
                </Typography>

                <div className={`${styles.cardSection} ${styles.cardPerformanceInput}`}>
                  <div className={styles.cardTitle}>✏️ 수행정보 입력</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행자</Typography>
                    <Controller
                      name="performer"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          error={!!errors.performer}
                          helperText={errors.performer?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행일자</Typography>
                    <Controller
                      name="performanceDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                          format="YYYY/MM/DD"
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: !!errors.performanceDate,
                              helperText: errors.performanceDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.twoColumnGrid}>
                    <div>
                      <Typography className={styles.fieldLabel}>수행여부 <span style={{ color: 'red' }}>*</span></Typography>
                      <Controller
                        name="activityResult"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.activityResult}>
                            <Select {...field}>
                              <MenuItem value="01">미수행</MenuItem>
                              <MenuItem value="02">수행완료</MenuItem>
                            </Select>
                            {errors.activityResult && (
                              <FormHelperText>{errors.activityResult.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </div>

                    <div>
                      <Typography className={styles.fieldLabel}>수행결과 <span style={{ color: 'red' }}>*</span></Typography>
                      <Controller
                        name="performanceAssessment"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.performanceAssessment}>
                            <Select
                              {...field}
                              displayEmpty
                            >
                              <MenuItem value="" disabled>선택</MenuItem>
                              <MenuItem value="01">적정</MenuItem>
                              <MenuItem value="02">부적정</MenuItem>
                            </Select>
                            {errors.performanceAssessment && (
                              <FormHelperText>{errors.performanceAssessment.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행결과 내용</Typography>
                    <Controller
                      name="activityOpinion"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={6}
                          error={!!errors.activityOpinion}
                          helperText={errors.activityOpinion?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            닫기
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={loading || !isValid}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ActivityExecutionModal;
