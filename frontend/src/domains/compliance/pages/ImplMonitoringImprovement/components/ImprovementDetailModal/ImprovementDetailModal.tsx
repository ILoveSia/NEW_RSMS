/**
 * 개선이행 상세 모달
 * - ImplMonitoringDetailModal 구조와 유사
 * - 좌측: 관리활동 영역 (읽기 전용)
 * - 우측: 개선이행정보 + 최종점검정보 영역 (편집 가능)
 * - 점검정보는 이미 부적정으로 확정된 항목만 표시되므로 점검정보 섹션 없음
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
import { useTranslation } from 'react-i18next';
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
const schema = yup.object().shape({
  // 개선이행정보
  improvementManager: yup
    .string()
    .default(''),
  improvementStatus: yup
    .string()
    .required('개선이행상태는 필수입니다'),
  improvementPlanContent: yup
    .string()
    .default('')
    .max(1000, '개선계획내용은 1000자 이내로 입력해주세요'),
  improvementPlanDate: yup
    .string()
    .nullable()
    .default(null),
  improvementApprovedDate: yup
    .string()
    .nullable()
    .default(null),
  improvementDetail: yup
    .string()
    .default('')
    .max(1000, '개선이행세부내용은 1000자 이내로 입력해주세요'),
  improvementCompletedDate: yup
    .string()
    .nullable()
    .default(null),
  // 최종점검정보
  finalInspector: yup
    .string()
    .default(''),
  finalInspectionResult: yup
    .string()
    .required('최종점검결과는 필수입니다'),
  finalInspectionOpinion: yup
    .string()
    .default('')
    .max(1000, '최종점검결과 내용은 1000자 이내로 입력해주세요'),
  finalInspectionDate: yup
    .string()
    .nullable()
    .default(null)
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
  const { t } = useTranslation('compliance');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<ImprovementFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      improvementManager: '',
      improvementStatus: '01', // 01:개선미이행, 02:개선계획, 03:승인요청, 04:개선이행
      improvementPlanContent: '',
      improvementPlanDate: dayjs().format('YYYY-MM-DD'),
      improvementApprovedDate: null,
      improvementDetail: '',
      improvementCompletedDate: null,
      finalInspector: '',
      finalInspectionResult: '01', // 01:승인, 02:반려
      finalInspectionOpinion: '',
      finalInspectionDate: dayjs().format('YYYY-MM-DD')
    }
  });

  // 개선이행상태 감시
  const improvementStatus = watch('improvementStatus');

  // 조회 모드 여부
  const isViewMode = mode === 'detail';

  /**
   * 폼 초기화
   * - mode와 improvement 데이터에 따라 폼 데이터 설정
   */
  useEffect(() => {
    if (open && improvement && mode === 'edit') {
      reset({
        improvementManager: improvement.improvementManager || '',
        improvementStatus: improvement.improvementStatus || '01',
        improvementPlanContent: '',
        improvementPlanDate: improvement.improvementPlanDate || dayjs().format('YYYY-MM-DD'),
        improvementApprovedDate: improvement.improvementApprovedDate || null,
        improvementDetail: '',
        improvementCompletedDate: improvement.improvementCompletedDate || null,
        finalInspector: '',
        finalInspectionResult: improvement.finalInspectionResult || '01',
        finalInspectionOpinion: '',
        finalInspectionDate: dayjs().format('YYYY-MM-DD')
      });
    } else if (open && !improvement) {
      reset();
    }
  }, [open, improvement, mode, reset]);

  /**
   * 폼 제출 핸들러
   */
  const handleFormSubmit = useCallback((data: ImprovementFormData) => {
    if (mode === 'edit' && improvement) {
      onUpdate(improvement.id, data);
    } else {
      onSave(data);
    }
  }, [mode, improvement, onSave, onUpdate]);

  const modalTitle = mode === 'detail' ? '개선이행 상세 조회' : '개선이행 등록';

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
                        value={improvement?.inspectionName || '고객정보보호 관리체계 구축'}
                        InputProps={{ readOnly: true }}
                        
                      />
                    </div>
                    <div >
                      <Typography >책무세부내용</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value="고객정보보호를 위한 관리체계 구축 및 운영"
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
                      value={improvement?.obligationInfo || '자금세탁방지 의무'}
                      InputProps={{ readOnly: true }}
                      
                    />
                  </div>

                  {/* 관리활동구분코드 + 관리활동명 */}
                  <div >
                    <div >
                      <Typography >관리활동구분코드</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value="고유"
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
                        value={improvement?.managementActivityName || '자금세탁방지 시스템 운영'}
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

              {/* 오른쪽: 개선이행정보 + 최종점검정보 영역 (편집 가능) */}
              <Grid item xs={12} md={5}>
                <div >
                  {/* 1. 개선이행정보 */}
                  <div >
                    <Typography >
                      1. 개선이행정보
                    </Typography>

                    <div >
                      <div >
                        <Typography >개선담당자</Typography>
                        <Controller
                          name="improvementManager"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              disabled={isViewMode}
                              error={!!errors.improvementManager}
                              helperText={errors.improvementManager?.message}
                            />
                          )}
                        />
                      </div>

                      <div >
                        <Typography >개선이행상태 <span >*</span></Typography>
                        <Controller
                          name="improvementStatus"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small" error={!!errors.improvementStatus}>
                              <Select
                                {...field}
                                disabled={isViewMode}
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

                    {/* 개선계획 입력 영역 */}
                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ▶ 개선계획 입력 영역
                      </Typography>
                    </div>

                    <div >
                      <Typography >개선계획내용</Typography>
                      <Controller
                        name="improvementPlanContent"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            disabled={isViewMode || improvementStatus === '01' || improvementStatus === '04' || improvementStatus === '05'}
                            error={!!errors.improvementPlanContent}
                            helperText={errors.improvementPlanContent?.message}
                          />
                        )}
                      />
                    </div>

                    <div >
                      <div >
                        <Typography >개선계획수립일자</Typography>
                        <Controller
                          name="improvementPlanDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                              format="YYYY/MM/DD"
                              disabled={isViewMode || improvementStatus === '01' || improvementStatus === '04' || improvementStatus === '05'}
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

                      <div >
                        <Typography >개선계획승인일자</Typography>
                        <Controller
                          name="improvementApprovedDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                              format="YYYY/MM/DD"
                              disabled={isViewMode || improvementStatus !== '03'}
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
                    </div>

                    {/* 개선이행 입력 영역 */}
                    <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ▶ 개선이행 입력 영역
                      </Typography>
                    </div>

                    <div >
                      <Typography >개선이행세부내용</Typography>
                      <Controller
                        name="improvementDetail"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            disabled={isViewMode || (improvementStatus !== '04' && improvementStatus !== '05')}
                            error={!!errors.improvementDetail}
                            helperText={errors.improvementDetail?.message}
                          />
                        )}
                      />
                    </div>

                    <div >
                      <Typography >개선완료일자</Typography>
                      <Controller
                        name="improvementCompletedDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                            format="YYYY/MM/DD"
                            disabled={isViewMode || (improvementStatus !== '04' && improvementStatus !== '05')}
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

                  {/* 2. 최종점검정보 */}
                  <div >
                    <Typography >
                      2. 최종점검정보
                    </Typography>

                    <div >
                      <div >
                        <Typography >최종점검자</Typography>
                        <Controller
                          name="finalInspector"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              disabled={isViewMode}
                              error={!!errors.finalInspector}
                              helperText={errors.finalInspector?.message}
                            />
                          )}
                        />
                      </div>

                      <div >
                        <Typography >최종점검일자</Typography>
                        <Controller
                          name="finalInspectionDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                              format="YYYY/MM/DD"
                              disabled={isViewMode}
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
                    </div>

                    <div >
                      <Typography >최종점검결과 <span >*</span></Typography>
                      <Controller
                        name="finalInspectionResult"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.finalInspectionResult}>
                            <Select
                              {...field}
                              disabled={isViewMode}
                            >
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

                    <div >
                      <Typography >최종점검결과 내용</Typography>
                      <Controller
                        name="finalInspectionOpinion"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={4}
                            disabled={isViewMode}
                            error={!!errors.finalInspectionOpinion}
                            helperText={errors.finalInspectionOpinion?.message}
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

export default ImprovementDetailModal;
