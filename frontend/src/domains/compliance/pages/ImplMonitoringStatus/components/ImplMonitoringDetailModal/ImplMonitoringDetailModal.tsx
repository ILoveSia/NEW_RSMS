/**
 * 이행점검 상세 모달 컴포넌트
 * - 이행점검 대상의 관리활동 상세 정보 조회
 * - 점검 수행 및 결과 작성
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Button } from '@/shared/components/atoms/Button';
import {
  InspectionExecution,
  ManagementActivityDetail,
  InspectionInfo,
  FinalInspectionInfo
} from '../../types/implMonitoringStatus.types';
import styles from './ImplMonitoringDetailModal.module.scss';

interface ImplMonitoringDetailModalProps {
  open: boolean;
  execution?: InspectionExecution | null;
  onClose: () => void;
  loading?: boolean;
}

/**
 * 폼 데이터 타입
 */
interface FormData {
  // 관리활동 정보
  managementActivity: ManagementActivityDetail;
  // 점검정보
  inspectionInfo: InspectionInfo;
  // 최종점검정보
  finalInspectionInfo: FinalInspectionInfo;
}

/**
 * 폼 검증 스키마
 */
const schema = yup.object({
  inspectionInfo: yup.object({
    inspectorId: yup.string(),
    inspectionStatusCd: yup.string(),
    inspectionResultContent: yup.string(),
    inspectionDate: yup.string()
  }),
  finalInspectionInfo: yup.object({
    finalInspectorId: yup.string(),
    finalInspectionResultCd: yup.string(),
    finalInspectionResultContent: yup.string(),
    finalInspectionDate: yup.string()
  })
});

const ImplMonitoringDetailModal: React.FC<ImplMonitoringDetailModalProps> = ({
  open,
  execution,
  onClose,
  loading = false
}) => {
  const { t } = useTranslation('compliance');
  const [managementActivity, setManagementActivity] = useState<ManagementActivityDetail | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      inspectionInfo: {
        inspectorId: '',
        inspectionStatusCd: '01',
        inspectionResultContent: '',
        inspectionDate: ''
      },
      finalInspectionInfo: {
        finalInspectorId: '',
        finalInspectionResultCd: '01',
        finalInspectionResultContent: '',
        finalInspectionDate: ''
      }
    }
  });

  /**
   * 폼 초기화
   */
  useEffect(() => {
    if (open && execution) {
      loadManagementActivityDetail(execution.id);
    }
  }, [open, execution]);

  /**
   * 관리활동 상세 정보 로드
   */
  const loadManagementActivityDetail = useCallback(async (executionId: string) => {
    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 500));

      // 임시 데이터
      const mockActivityDetail: ManagementActivityDetail = {
        responsibilityInfo: '고객정보보호 관리체계 구축',
        responsibilityDetailInfo: '고객정보보호를 위한 관리체계 구축 및 운영',
        obligationInfo: '자금세탁방지 의무',
        activityTypeCd: '01',
        activityName: '자금세탁방지 시스템 운영',
        evidenceMaterial: '자금세탁방지 점검보고서, 시스템 운영 로그',
        implCheckMethod: '문서검토 + 실사',
        implCheckDetail: '자금세탁방지 시스템 운영 점검 및 관련 문서 검토'
      };

      setManagementActivity(mockActivityDetail);
    } catch (error) {
      console.error('관리활동 상세 정보 로드 실패:', error);
    }
  }, []);

  /**
   * 폼 제출 처리
   */
  const onSubmit = useCallback(async (data: FormData) => {
    try {
      // TODO: 점검 수행 API 호출
      console.log('점검 수행 데이터:', data);
      onClose();
    } catch (error) {
      console.error('점검 수행 실패:', error);
    }
  }, [onClose]);

  if (!execution || !managementActivity) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '90vh',
          width: '85%'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        이행점검 대상 상세
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box className={styles.container}>
          <Grid container spacing={3}>
            {/* 왼쪽: 관리활동 영역 */}
            <Grid item xs={12} md={6}>
              <div className={styles.leftPanel}>
                <Typography className={styles.sectionTitle}>
                  관리활동 영역
                </Typography>

                {/* 책무명 + 책무세부내용 */}
                <div className={styles.doubleFieldRow}>
                  <div className={styles.halfField}>
                    <Typography className={styles.fieldLabel}>책무명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={managementActivity.responsibilityInfo}
                      InputProps={{ readOnly: true }}
                      className={styles.readOnlyField}
                    />
                  </div>
                  <div className={styles.halfField}>
                    <Typography className={styles.fieldLabel}>책무세부내용</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={managementActivity.responsibilityDetailInfo}
                      InputProps={{ readOnly: true }}
                      className={styles.readOnlyField}
                    />
                  </div>
                </div>

                {/* 관리의무 */}
                <div className={styles.fieldRow}>
                  <Typography className={styles.fieldLabel}>관리의무</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={managementActivity.obligationInfo}
                    InputProps={{ readOnly: true }}
                    className={styles.readOnlyField}
                  />
                </div>

                {/* 관리활동구분코드 + 관리활동명 */}
                <div className={styles.doubleFieldRow}>
                  <div className={styles.halfField}>
                    <Typography className={styles.fieldLabel}>관리활동구분코드</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={managementActivity.activityTypeCd}
                        disabled
                      >
                        <MenuItem value="01">고유</MenuItem>
                        <MenuItem value="02">공통</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className={styles.halfField}>
                    <Typography className={styles.fieldLabel}>관리활동명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={managementActivity.activityName}
                      InputProps={{ readOnly: true }}
                      className={styles.readOnlyField}
                    />
                  </div>
                </div>

                {/* 관리활동증빙자료 */}
                <div className={styles.fieldRow}>
                  <Typography className={styles.fieldLabel}>관리활동증빙자료</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={managementActivity.evidenceMaterial}
                    InputProps={{ readOnly: true }}
                    className={styles.readOnlyField}
                  />
                </div>

                {/* 이행점검방법 */}
                <div className={styles.fieldRow}>
                  <Typography className={styles.fieldLabel}>이행점검방법</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    variant="outlined"
                    value={managementActivity.implCheckMethod}
                    InputProps={{ readOnly: true }}
                    className={styles.readOnlyField}
                  />
                </div>

                {/* 이행점검세부내용 */}
                <div className={styles.fieldRow}>
                  <Typography className={styles.fieldLabel}>이행점검세부내용</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    variant="outlined"
                    value={managementActivity.implCheckDetail}
                    InputProps={{ readOnly: true }}
                    className={styles.readOnlyField}
                  />
                </div>

                {/* 증빙 자료 */}
                <div className={styles.fieldRow}>
                  <Typography className={styles.fieldLabel}>증빙 자료</Typography>
                  <div className={styles.attachmentPlaceholder}>
                    <Typography variant="body2" color="textSecondary">
                      첨부파일 기능은 추후 구현 예정입니다.
                    </Typography>
                  </div>
                </div>
              </div>
            </Grid>

            {/* 오른쪽: 점검정보 영역 */}
            <Grid item xs={12} md={6}>
              <div className={styles.rightPanel}>
                {/* 1. 점검정보 */}
                <div className={styles.sectionBox}>
                  <Typography className={styles.sectionTitle}>
                    1. 점검정보
                  </Typography>

                  {/* 점검자 */}
                  <div className={styles.fieldRow}>
                    <Typography className={styles.fieldLabel}>점검자</Typography>
                    <Controller
                      name="inspectionInfo.inspectorId"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          variant="outlined"
                          placeholder="점검자를 입력하세요"
                        />
                      )}
                    />
                  </div>

                  {/* 점검결과 + 점검일자 */}
                  <div className={styles.doubleFieldRow}>
                    <div className={styles.halfField}>
                      <Typography className={styles.fieldLabel}>점검결과</Typography>
                      <Controller
                        name="inspectionInfo.inspectionStatusCd"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small">
                            <Select {...field}>
                              <MenuItem value="01">미점검</MenuItem>
                              <MenuItem value="02">적정</MenuItem>
                              <MenuItem value="03">부적정</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </div>
                    <div className={styles.halfField}>
                      <Typography className={styles.fieldLabel}>점검일자</Typography>
                      <Controller
                        name="inspectionInfo.inspectionDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(newValue: Dayjs | null) => {
                              field.onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                variant: 'outlined'
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* 점검결과내용 */}
                  <div className={styles.fieldRow}>
                    <Typography className={styles.fieldLabel}>점검결과내용</Typography>
                    <Controller
                      name="inspectionInfo.inspectionResultContent"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          variant="outlined"
                          placeholder="점검결과내용을 입력하세요"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* 2. 최종점검정보 */}
                <div className={styles.sectionBox}>
                  <Typography className={styles.sectionTitle}>
                    2. 최종점검정보
                  </Typography>

                  {/* 최종점검자 + 최종점검결과 + 최종점검일자 */}
                  <div className={styles.doubleFieldRow}>
                    <div className={styles.halfField}>
                      <Typography className={styles.fieldLabel}>최종점검자</Typography>
                      <Controller
                        name="finalInspectionInfo.finalInspectorId"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder="최종점검자를 입력하세요"
                          />
                        )}
                      />
                    </div>
                    <div className={styles.halfField}>
                      <Typography className={styles.fieldLabel}>최종점검결과</Typography>
                      <Controller
                        name="finalInspectionInfo.finalInspectionResultCd"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small">
                            <Select {...field}>
                              <MenuItem value="01">승인</MenuItem>
                              <MenuItem value="02">반려</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </div>
                  </div>

                  {/* 최종점검일자 */}
                  <div className={styles.fieldRow}>
                    <Typography className={styles.fieldLabel}>최종점검일자</Typography>
                    <Controller
                      name="finalInspectionInfo.finalInspectionDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue: Dayjs | null) => {
                            field.onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              variant: 'outlined'
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* 최종점검결과내용 */}
                  <div className={styles.fieldRow}>
                    <Typography className={styles.fieldLabel}>최종점검결과내용</Typography>
                    <Controller
                      name="finalInspectionInfo.finalInspectionResultContent"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          size="small"
                          variant="outlined"
                          placeholder="최종점검결과내용을 입력하세요"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          닫기
        </Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ImplMonitoringDetailModal.displayName = 'ImplMonitoringDetailModal';

export default ImplMonitoringDetailModal;
