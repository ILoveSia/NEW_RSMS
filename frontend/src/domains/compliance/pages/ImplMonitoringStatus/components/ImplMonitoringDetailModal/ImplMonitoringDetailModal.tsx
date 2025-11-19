/**
 * 이행점검 상세 모달
 * - ActivityExecutionModal 구조와 동일
 * - 좌측: 관리활동 영역 (읽기 전용)
 * - 우측: 수행정보 + 점검정보 영역 (편집 가능)
 */

import { Button } from '@/shared/components/atoms/Button';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
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
  performanceDate: yup
    .string()
    .nullable(),
  performer: yup
    .string(),
  activityResult: yup
    .string()
    .required('수행여부는 필수입니다'),
  performanceAssessment: yup
    .string()
    .required('수행결과는 필수입니다'),
  activityOpinion: yup
    .string()
    .max(1000, '수행결과 내용은 1000자 이내로 입력해주세요'),
  // 점검정보
  inspectionDate: yup
    .string()
    .nullable(),
  inspector: yup
    .string(),
  inspectionResult: yup
    .string()
    .required('점검결과는 필수입니다'),
  inspectionOpinion: yup
    .string()
    .max(1000, '점검결과 내용은 1000자 이내로 입력해주세요')
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
      performanceDate: dayjs().format('YYYY-MM-DD'), // 오늘 날짜
      performer: '',
      activityResult: '01', // 01:미수행, 02:수행완료
      performanceAssessment: '01', // 01:적정, 02:부적정
      activityOpinion: '',
      inspectionDate: dayjs().format('YYYY-MM-DD'), // 오늘 날짜
      inspector: '',
      inspectionResult: '01', // 01:미점검, 02:적정, 03:부적정
      inspectionOpinion: ''
    }
  });

  /**
   * 폼 초기화
   * - mode와 execution 데이터에 따라 폼 데이터 설정
   */
  useEffect(() => {
    if (open && execution && mode === 'edit') {
      reset({
        performanceDate: dayjs().format('YYYY-MM-DD'),
        performer: execution.performer || '',
        activityResult: '01',
        performanceAssessment: '01',
        activityOpinion: '',
        inspectionDate: dayjs().format('YYYY-MM-DD'),
        inspector: execution.inspector || '',
        inspectionResult: '01',
        inspectionOpinion: ''
      });
    } else if (open && !execution) {
      reset();
    }
  }, [open, execution, mode, reset]);

  /**
   * 폼 제출 핸들러
   */
  const handleFormSubmit = useCallback((data: InspectionFormData) => {
    if (mode === 'edit' && execution) {
      onUpdate(execution.id, data);
    } else {
      onSave(data);
    }
  }, [mode, execution, onSave, onUpdate]);

  const modalTitle = mode === 'detail' ? '이행점검 대상 상세 조회' : '이행점검 대상 등록';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxHeight: '90vh',
            width: '95%'
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
          {modalTitle}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              {/* 왼쪽: 관리활동 영역 (읽기 전용) */}
              <Grid item xs={12} md={7}>
                <div >
                  <Typography >
                    관리활동 영역
                  </Typography>

                  {/* 책무명 + 책무세부내용 */}
                  <div >
                    <div >
                      <Typography >책무명</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={execution?.responsibilityName || '고객정보보호 관리체계 구축'}
                        InputProps={{ readOnly: true }}
                        
                      />
                    </div>
                    <div >
                      <Typography >책무세부내용</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={execution?.responsibilityDetail || '고객정보보호를 위한 관리체계 구축 및 운영'}
                        InputProps={{ readOnly: true }}
                        
                      />
                    </div>
                  </div>

                  {/* 관리의무 */}
                  <div >
                    <Typography >관리의무</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={execution?.obligation || '자금세탁방지 의무'}
                      InputProps={{ readOnly: true }}
                      
                    />
                  </div>

                  {/* 관리활동구분코드 + 관리활동명 */}
                  <div >
                    <div >
                      <Typography >관리활동구분코드</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={execution?.gnrzOblgDvcd || '고유'}
                          disabled
                        >
                          <MenuItem value="고유">고유</MenuItem>
                          <MenuItem value="공통">공통</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div >
                      <Typography >관리활동명</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={execution?.activityName || '자금세탁방지 시스템 운영'}
                        InputProps={{ readOnly: true }}
                        
                      />
                    </div>
                  </div>

                  {/* 관리활동증빙자료 */}
                  <div >
                    <Typography >관리활동증빙자료</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value="자금세탁방지 점검보고서, 시스템 운영 로그"
                      InputProps={{ readOnly: true }}
                      
                    />
                  </div>

                  {/* 이행점검방법 */}
                  <div >
                    <Typography >이행점검방법</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      variant="outlined"
                      value="문서검토 + 실사"
                      InputProps={{ readOnly: true }}
                      
                    />
                  </div>

                  {/* 이행점검세부내용 */}
                  <div >
                    <Typography >이행점검세부내용</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      variant="outlined"
                      value="자금세탁방지 시스템 운영 점검 및 관련 문서 검토"
                      InputProps={{ readOnly: true }}
                      
                    />
                  </div>

                  {/* 증빙 자료 */}
                  <div >
                    <Typography >증빙 자료</Typography>
                    <div >
                      <Typography variant="body2" color="textSecondary">
                        첨부파일 기능은 추후 구현 예정입니다.
                      </Typography>
                    </div>
                  </div>
                </div>
              </Grid>

              {/* 오른쪽: 수행정보 + 점검정보 영역 (편집 가능) */}
              <Grid item xs={12} md={5}>
                <div >
                  {/* 1. 수행정보 */}
                  <div >
                    <Typography >
                      1. 수행정보
                    </Typography>

                    <div >
                      <div >
                        <Typography >수행자</Typography>
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

                      <div >
                        <Typography >수행일자</Typography>
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
                    </div>

                    <div >
                      <div >
                        <Typography >수행여부 <span >*</span></Typography>
                        <Controller
                          name="activityResult"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small" error={!!errors.activityResult}>
                              <Select
                                {...field}
                              >
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

                      <div >
                        <Typography >수행결과 <span >*</span></Typography>
                        <Controller
                          name="performanceAssessment"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small" error={!!errors.performanceAssessment}>
                              <Select
                                {...field}
                              >
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

                    <div >
                      <Typography >수행결과 내용</Typography>
                      <Controller
                        name="activityOpinion"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            error={!!errors.activityOpinion}
                            helperText={errors.activityOpinion?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* 2. 점검정보 */}
                  <div >
                    <Typography >
                      2. 점검정보
                    </Typography>

                    <div >
                      <div >
                        <Typography >점검자</Typography>
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

                      <div >
                        <Typography >점검일자</Typography>
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
                    </div>

                    <div >
                      <Typography >점검결과 <span >*</span></Typography>
                      <Controller
                        name="inspectionResult"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.inspectionResult}>
                            <Select
                              {...field}
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

                    <div >
                      <Typography >점검결과 내용</Typography>
                      <Controller
                        name="inspectionOpinion"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            error={!!errors.inspectionOpinion}
                            helperText={errors.inspectionOpinion?.message}
                          />
                        )}
                      />
                    </div>
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
