/**
 * 개선이행 상세 모달
 * - ImplMonitoringDetailModal과 동일한 디자인 적용
 * - 좌측: 관리활동 영역 (읽기 전용, 카드 섹션)
 * - 우측: 개선이행정보 + 최종점검정보 영역 (편집 가능)
 */

import { Button } from '@/shared/components/atoms/Button';
import styles from './ImprovementDetailModal.module.scss';
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
import { ImprovementData } from '../ImprovementDataGrid/improvementColumns';

interface ImprovementDetailModalProps {
  open: boolean;
  mode: 'edit' | 'detail';
  improvement?: ImprovementData | null;
  onClose: () => void;
  onSave: (data: ImprovementFormData) => void;
  onUpdate: (id: string, data: ImprovementFormData) => void;
  loading?: boolean;
}

/**
 * 폼 데이터 타입
 */
interface ImprovementFormData {
  // 개선이행정보
  improvementManager: string;
  improvementStatus: string;
  improvementPlanContent: string;
  improvementPlanDate: string | null;
  improvementApprovedDate: string | null;
  improvementDetail: string;
  improvementCompletedDate: string | null;
  // 최종점검정보
  finalInspector: string;
  finalInspectionResult: string;
  finalInspectionOpinion: string;
  finalInspectionDate: string | null;
}

/**
 * 개선이행정보 + 최종점검정보 폼 검증 스키마
 */
const schema = yup.object({
  // 개선이행정보
  improvementManager: yup.string(),
  improvementStatus: yup.string().required('개선이행상태는 필수입니다'),
  improvementPlanContent: yup.string().max(1000, '개선계획내용은 1000자 이내로 입력해주세요'),
  improvementPlanDate: yup.string().nullable(),
  improvementApprovedDate: yup.string().nullable(),
  improvementDetail: yup.string().max(1000, '개선이행세부내용은 1000자 이내로 입력해주세요'),
  improvementCompletedDate: yup.string().nullable(),
  // 최종점검정보
  finalInspector: yup.string(),
  finalInspectionResult: yup.string().required('최종점검결과는 필수입니다'),
  finalInspectionOpinion: yup.string().max(1000, '최종점검결과 내용은 1000자 이내로 입력해주세요'),
  finalInspectionDate: yup.string().nullable()
});

const ImprovementDetailModal: React.FC<ImprovementDetailModalProps> = ({
  open,
  mode,
  improvement,
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
  } = useForm<ImprovementFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      improvementManager: '',
      improvementStatus: '01',
      improvementPlanContent: '',
      improvementPlanDate: dayjs().format('YYYY-MM-DD'),
      improvementApprovedDate: null,
      improvementDetail: '',
      improvementCompletedDate: null,
      finalInspector: '',
      finalInspectionResult: '',
      finalInspectionOpinion: '',
      finalInspectionDate: dayjs().format('YYYY-MM-DD')
    }
  });

  useEffect(() => {
    if (open && improvement) {
      if (mode === 'edit') {
        reset({
          improvementManager: improvement.improvementManager || '',
          improvementStatus: improvement.improvementStatus || '01',
          improvementPlanContent: '점검 결과 부적정 사항에 대한 개선계획을 수립하였습니다.\n1. 관련 규정 및 절차 재검토\n2. 담당자 교육 실시\n3. 개선 조치 완료 후 재점검 실시',
          improvementPlanDate: improvement.improvementPlanDate || dayjs().format('YYYY-MM-DD'),
          improvementApprovedDate: improvement.improvementApprovedDate || null,
          improvementDetail: '개선계획에 따라 다음과 같이 이행하였습니다.\n1. 관련 규정 개정 완료 (2024.01.15)\n2. 전체 담당자 교육 완료 (2024.01.20)\n3. 개선사항 적용 및 검증 완료 (2024.01.25)',
          improvementCompletedDate: improvement.improvementCompletedDate || null,
          finalInspector: improvement.inspector || '',
          finalInspectionResult: improvement.finalInspectionResult || '',
          finalInspectionOpinion: improvement.finalInspectionOpinion || '',
          finalInspectionDate: improvement.finalInspectionDate || null
        });
      } else {
        reset({
          improvementManager: improvement.improvementManager || '',
          improvementStatus: improvement.improvementStatus || '01',
          improvementPlanContent: '점검 결과 부적정 사항에 대한 개선계획을 수립하였습니다.\n1. 관련 규정 및 절차 재검토\n2. 담당자 교육 실시\n3. 개선 조치 완료 후 재점검 실시',
          improvementPlanDate: improvement.improvementPlanDate || dayjs().format('YYYY-MM-DD'),
          improvementApprovedDate: improvement.improvementApprovedDate || null,
          improvementDetail: '개선계획에 따라 다음과 같이 이행하였습니다.\n1. 관련 규정 개정 완료 (2024.01.15)\n2. 전체 담당자 교육 완료 (2024.01.20)\n3. 개선사항 적용 및 검증 완료 (2024.01.25)',
          improvementCompletedDate: improvement.improvementCompletedDate || null,
          finalInspector: improvement.inspector || '',
          finalInspectionResult: improvement.finalInspectionResult || '',
          finalInspectionOpinion: improvement.finalInspectionOpinion || '',
          finalInspectionDate: improvement.finalInspectionDate || null
        });
      }
    } else if (open && !improvement) {
      reset({
        improvementManager: '',
        improvementStatus: '01',
        improvementPlanContent: '',
        improvementPlanDate: dayjs().format('YYYY-MM-DD'),
        improvementApprovedDate: null,
        improvementDetail: '',
        improvementCompletedDate: null,
        finalInspector: '',
        finalInspectionResult: '01',
        finalInspectionOpinion: '',
        finalInspectionDate: dayjs().format('YYYY-MM-DD')
      });
    }
  }, [open, improvement, mode, reset]);

  const handleFormSubmit = useCallback((data: ImprovementFormData) => {
    if (mode === 'edit' && improvement) {
      onUpdate(improvement.id, data);
    } else {
      onSave(data);
    }
  }, [mode, improvement, onSave, onUpdate]);

  const modalTitle = mode === 'detail' ? '개선이행 상세 조회' : '개선이행 결과 작성';

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
                      value={improvement?.orgCode || '-'}
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
                      value={improvement?.obligationInfo || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>관리활동명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={improvement?.managementActivityName || '-'}
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
                      value={improvement?.managementActivityName || '-'}
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
                      value={improvement?.inspectionName || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검주기</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value="월간"
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>
              </Grid>

              {/* 오른쪽: 개선이행정보 + 최종점검정보 영역 (편집 가능) */}
              <Grid item xs={12} md={5}>
                <Typography className={styles.sectionTitle}>
                  개선이행정보 + 최종점검정보 영역
                </Typography>

                {/* 카드 섹션 3: 개선계획 */}
                <div className={`${styles.cardSection} ${styles.cardImprovementPlan}`}>
                  <div className={styles.cardTitle}>✏️ 개선계획</div>

                  <div className={styles.twoColumnGrid}>
                    <div>
                      <Typography className={styles.fieldLabel}>개선담당자</Typography>
                      <Controller
                        name="improvementManager"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            error={!!errors.improvementManager}
                            helperText={errors.improvementManager?.message}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Typography className={styles.fieldLabel}>개선이행상태 <span style={{ color: 'red' }}>*</span></Typography>
                      <Controller
                        name="improvementStatus"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.improvementStatus}>
                            <Select
                              value={field.value || '01'}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                            >
                              <MenuItem value="01">개선미이행</MenuItem>
                              <MenuItem value="02">개선계획</MenuItem>
                              <MenuItem value="03">승인요청</MenuItem>
                              <MenuItem value="04">개선이행</MenuItem>
                              <MenuItem value="05">개선완료</MenuItem>
                            </Select>
                            {errors.improvementStatus && (
                              <FormHelperText>{errors.improvementStatus.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획내용</Typography>
                    <Controller
                      name="improvementPlanContent"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.improvementPlanContent}
                          helperText={errors.improvementPlanContent?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획수립일자</Typography>
                    <Controller
                      name="improvementPlanDate"
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
                              error: !!errors.improvementPlanDate,
                              helperText: errors.improvementPlanDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* 카드 섹션 4: 개선이행 */}
                <div className={`${styles.cardSection} ${styles.cardImprovementExecution}`}>
                  <div className={styles.cardTitle}>✏️ 개선이행</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획승인일자</Typography>
                    <Controller
                      name="improvementApprovedDate"
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
                              error: !!errors.improvementApprovedDate,
                              helperText: errors.improvementApprovedDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선이행세부내용</Typography>
                    <Controller
                      name="improvementDetail"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.improvementDetail}
                          helperText={errors.improvementDetail?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선완료일자</Typography>
                    <Controller
                      name="improvementCompletedDate"
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
                              error: !!errors.improvementCompletedDate,
                              helperText: errors.improvementCompletedDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* 카드 섹션 4: 최종점검정보 입력 */}
                <div className={`${styles.cardSection} ${styles.cardFinalInspectionInput}`}>
                  <div className={styles.cardTitle}>🔍 최종점검정보 입력</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>최종점검자</Typography>
                    <Controller
                      name="finalInspector"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          error={!!errors.finalInspector}
                          helperText={errors.finalInspector?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>최종점검일자</Typography>
                    <Controller
                      name="finalInspectionDate"
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
                              error: !!errors.finalInspectionDate,
                              helperText: errors.finalInspectionDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>최종점검결과 <span style={{ color: 'red' }}>*</span></Typography>
                    <Controller
                      name="finalInspectionResult"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.finalInspectionResult}>
                          <Select
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            displayEmpty
                          >
                            <MenuItem value="">미선택</MenuItem>
                            <MenuItem value="01">승인</MenuItem>
                            <MenuItem value="02">반려</MenuItem>
                          </Select>
                          {errors.finalInspectionResult && (
                            <FormHelperText>{errors.finalInspectionResult.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>최종점검결과 내용</Typography>
                    <Controller
                      name="finalInspectionOpinion"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.finalInspectionOpinion}
                          helperText={errors.finalInspectionOpinion?.message}
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

export default ImprovementDetailModal;
