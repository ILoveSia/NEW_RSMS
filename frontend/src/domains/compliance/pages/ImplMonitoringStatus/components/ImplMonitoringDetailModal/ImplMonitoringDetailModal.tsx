/**
 * 이행점검 상세 모달
 * - 좌측: 관리활동 영역 (읽기 전용, 카드 섹션)
 * - 우측: 수행정보 + 점검정보 영역 (편집 가능)
 * - ActivityExecutionModal과 동일한 디자인 적용
 */

import { Button } from '@/shared/components/atoms/Button';
import styles from './ImplMonitoringDetailModal.module.scss';
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
import * as yup from 'yup';
import { InspectionExecution } from '../../types/implMonitoringStatus.types';

interface ImplMonitoringDetailModalProps {
  open: boolean;
  mode: 'edit' | 'detail';
  execution?: InspectionExecution | null;
  onClose: () => void;
  onSave: (data: InspectionFormData) => void;
  onUpdate: (id: string, data: InspectionFormData) => void;
  loading?: boolean;
}

/**
 * 폼 데이터 타입
 */
interface InspectionFormData {
  // 수행정보
  performer: string;
  performanceDate: string | null;
  activityResult: string;
  performanceAssessment: string;
  activityOpinion: string;
  // 점검정보
  inspector: string;
  inspectionDate: string | null;
  inspectionResult: string;
  inspectionOpinion: string;
}

/**
 * 수행정보 + 점검정보 폼 검증 스키마
 */
const schema = yup.object({
  // 수행정보
  performanceDate: yup.string().nullable(),
  performer: yup.string(),
  activityResult: yup.string().required('수행여부는 필수입니다'),
  performanceAssessment: yup.string().required('수행결과는 필수입니다'),
  activityOpinion: yup.string().max(1000, '수행결과 내용은 1000자 이내로 입력해주세요'),
  // 점검정보
  inspectionDate: yup.string().nullable(),
  inspector: yup.string(),
  inspectionResult: yup.string().required('점검결과는 필수입니다'),
  inspectionOpinion: yup.string().max(1000, '점검결과 내용은 1000자 이내로 입력해주세요')
});

const ImplMonitoringDetailModal: React.FC<ImplMonitoringDetailModalProps> = ({
  open,
  mode,
  execution,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InspectionFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      performanceDate: dayjs().format('YYYY-MM-DD'),
      performer: '홍길동',
      activityResult: '02', // 수행완료
      performanceAssessment: '01', // 적정
      activityOpinion: '수행항목 점검결과 이상없음으로 확인되었습니다.',
      inspectionDate: dayjs().format('YYYY-MM-DD'),
      inspector: '',
      inspectionResult: '01',
      inspectionOpinion: ''
    }
  });

  useEffect(() => {
    if (open && execution) {
      if (mode === 'edit') {
        reset({
          performanceDate: dayjs().format('YYYY-MM-DD'),
          performer: execution.performer || '홍길동',
          activityResult: '02', // 수행완료
          performanceAssessment: '01', // 적정
          activityOpinion: '수행항목 점검결과 이상없음으로 확인되었습니다.',
          inspectionDate: dayjs().format('YYYY-MM-DD'),
          inspector: execution.inspector || '',
          inspectionResult: execution.inspectionResult || '01',
          inspectionOpinion: execution.inspectionDetail || ''
        });
      } else {
        reset({
          performanceDate: dayjs().format('YYYY-MM-DD'),
          performer: execution.performer || '홍길동',
          activityResult: '02', // 수행완료
          performanceAssessment: '01', // 적정
          activityOpinion: '수행항목 점검결과 이상없음으로 확인되었습니다.',
          inspectionDate: dayjs().format('YYYY-MM-DD'),
          inspector: execution.inspector || '',
          inspectionResult: execution.inspectionResult || '01',
          inspectionOpinion: execution.inspectionDetail || ''
        });
      }
    } else if (open && !execution) {
      // 모달을 열 때마다 defaultValues로 완전히 초기화
      reset({
        performanceDate: dayjs().format('YYYY-MM-DD'),
        performer: '홍길동',
        activityResult: '02', // 수행완료
        performanceAssessment: '01', // 적정
        activityOpinion: '수행항목 점검결과 이상없음으로 확인되었습니다.',
        inspectionDate: dayjs().format('YYYY-MM-DD'),
        inspector: '',
        inspectionResult: '01', // 미점검
        inspectionOpinion: ''
      });
    }
  }, [open, execution, mode, reset]);

  const handleFormSubmit = useCallback((data: InspectionFormData) => {
    if (mode === 'edit' && execution) {
      onUpdate(execution.id, data);
    } else {
      onSave(data);
    }
  }, [mode, execution, onSave, onUpdate]);

  const modalTitle = mode === 'detail' ? '이행점검 대상 상세 조회' : '이행점검 결과 작성';

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
                      value={execution?.orgCode || '-'}
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
                      value={execution?.obligationInfo || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>관리활동명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={execution?.managementActivityName || '-'}
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
                      value={execution?.inspectionMethod || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검결과내용</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      variant="outlined"
                      value={execution?.inspectionDetail || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검주기</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={execution?.activityFrequencyCd || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>
              </Grid>

              {/* 오른쪽: 수행정보 + 점검정보 영역 (편집 가능) */}
              <Grid item xs={12} md={5}>
                <Typography className={styles.sectionTitle}>
                  수행정보 + 점검정보 영역
                </Typography>

                {/* 카드 섹션 3: 수행정보 입력 */}
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
                            <Select {...field}>
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
                          rows={3}
                          error={!!errors.activityOpinion}
                          helperText={errors.activityOpinion?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* 카드 섹션 4: 점검정보 입력 */}
                <div className={`${styles.cardSection} ${styles.cardInspectionInput}`}>
                  <div className={styles.cardTitle}>🔍 점검정보 입력</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검자</Typography>
                    <Controller
                      name="inspector"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          error={!!errors.inspector}
                          helperText={errors.inspector?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검일자</Typography>
                    <Controller
                      name="inspectionDate"
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
                              error: !!errors.inspectionDate,
                              helperText: errors.inspectionDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검결과 <span style={{ color: 'red' }}>*</span></Typography>
                    <Controller
                      name="inspectionResult"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.inspectionResult}>
                          <Select
                            value={field.value || '01'}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          >
                            <MenuItem value="01">미점검</MenuItem>
                            <MenuItem value="02">적정</MenuItem>
                            <MenuItem value="03">부적정</MenuItem>
                          </Select>
                          {errors.inspectionResult && (
                            <FormHelperText>{errors.inspectionResult.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검결과 내용</Typography>
                    <Controller
                      name="inspectionOpinion"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.inspectionOpinion}
                          helperText={errors.inspectionOpinion?.message}
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

export default ImplMonitoringDetailModal;
