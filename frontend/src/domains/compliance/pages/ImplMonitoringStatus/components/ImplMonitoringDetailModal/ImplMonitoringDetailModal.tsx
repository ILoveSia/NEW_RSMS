/**
 * 이행점검 상세 모달
 * - 좌측: 관리활동 영역 (읽기 전용, 카드 섹션)
 * - 우측: 수행활동 정보 (읽기 전용, dept_manager_manuals 데이터) + 점검정보 (편집 가능)
 * - ActivityExecutionModal과 동일한 디자인 적용
 * - 공통코드를 활용하여 코드값을 코드명으로 표시
 */

import { Button } from '@/shared/components/atoms/Button';
import { useCommonCode } from '@/shared/hooks/useCommonCode';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
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
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { InspectionExecution } from '../../types/implMonitoringStatus.types';
import styles from './ImplMonitoringDetailModal.module.scss';

/**
 * API 요청 데이터 타입
 * - impl_inspection_items 테이블 업데이트용
 */
interface InspectionApiData {
  inspectionStatusCd: string;       // 점검결과상태코드 (01:미점검, 02:적정, 03:부적정)
  inspectionResultContent: string;  // 점검결과내용
}

interface ImplMonitoringDetailModalProps {
  open: boolean;
  mode: 'edit' | 'detail';
  execution?: InspectionExecution | null;
  onClose: () => void;
  onSave: (data: InspectionApiData) => void;
  onUpdate: (id: string, data: InspectionApiData) => void;
  loading?: boolean;
}

/**
 * 폼 데이터 타입
 * - 점검정보만 입력 (수행정보는 읽기 전용)
 */
interface InspectionFormData {
  // 점검정보 입력 필드
  inspectionResult: string;
  inspectionOpinion: string;
}

/**
 * 점검정보 폼 검증 스키마
 * - 수행정보는 읽기 전용이므로 검증에서 제외
 */
const schema = yup.object({
  // 점검정보
  inspectionResult: yup.string().required('점검결과는 필수입니다'),
  inspectionOpinion: yup.string().max(1000, '점검결과 내용은 1000자 이내로 입력해주세요')
});

/**
 * 수행결과 코드를 코드명으로 변환
 * - 01: 적정, 02: 부적정
 * - 공통코드가 없거나 매핑되지 않을 경우 fallback
 */
const getExecutionResultDisplayName = (code: string | undefined, commonCodeName?: string): string => {
  // 공통코드에서 이름을 찾았고, 코드 자체가 아닌 경우 사용
  if (commonCodeName && commonCodeName !== code) {
    return commonCodeName;
  }

  // 공통코드가 없거나 코드 자체가 반환된 경우 직접 매핑
  switch (code) {
    case '01':
      return '적정';
    case '02':
      return '부적정';
    default:
      return code || '-';
  }
};

const ImplMonitoringDetailModal: React.FC<ImplMonitoringDetailModalProps> = ({
  open,
  mode,
  execution,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {

  // 공통코드 조회 - 점검주기, 수행결과
  const { getCodeName: getFrequencyName } = useCommonCode('FLFL_ISPC_FRCD');  // 점검주기
  const { getCodeName: getExecutionResultCodeName } = useCommonCode('EXEC_RSLT_CD');  // 수행결과

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InspectionFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      inspectionResult: '',
      inspectionOpinion: ''
    }
  });

  /**
   * 모달 열릴 때 폼 데이터 초기화
   * - 점검정보만 폼으로 관리 (입력 가능)
   * - 수행정보는 execution에서 직접 읽어서 표시 (읽기 전용)
   */
  useEffect(() => {
    if (open && execution) {
      reset({
        inspectionResult: execution.inspectionResult || '',
        inspectionOpinion: execution.inspectionDetail || ''
      });
    } else if (open && !execution) {
      reset({
        inspectionResult: '',
        inspectionOpinion: ''
      });
    }
  }, [open, execution, mode, reset]);

  /**
   * 폼 제출 핸들러
   * - 폼 데이터를 API 형식으로 변환하여 전달
   * - inspectionResult → inspectionStatusCd
   * - inspectionOpinion → inspectionResultContent
   */
  const handleFormSubmit = useCallback((data: InspectionFormData) => {
    // API 형식으로 변환
    const apiData = {
      inspectionStatusCd: data.inspectionResult,
      inspectionResultContent: data.inspectionOpinion
    };

    if (execution) {
      onUpdate(execution.id, apiData);
    } else {
      onSave(apiData);
    }
  }, [execution, onSave, onUpdate]);

  const modalTitle = execution ? '이행점검 상세 / 수정' : '이행점검 등록';

  return (
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
          <Grid container spacing={2}>
            {/* 왼쪽: 관리활동 영역 (읽기 전용) */}
            <Grid item xs={12} md={7}>
              <Typography className={styles.sectionTitle}>
                관리활동 영역
              </Typography>

              {/* 관리활동 정보 카드 */}
              <div className={`${styles.cardSection} ${styles.cardBasicInfo}`}>
                <div className={styles.cardTitle}>📋 관리활동 정보</div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>책무</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={execution?.responsibilityInfo || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>책무상세</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={execution?.responsibilityDetailInfo || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>관리의무</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={execution?.obligationInfo || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>

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
                  <Typography className={styles.fieldLabel}>관리활동명</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    variant="outlined"
                    value={execution?.managementActivityName || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>

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
                  <Typography className={styles.fieldLabel}>점검주기</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={execution?.activityFrequencyCd ? getFrequencyName(execution.activityFrequencyCd) : '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>
              </div>
            </Grid>

            {/* 오른쪽: 수행활동 정보 (읽기 전용) + 점검정보 (편집 가능) */}
            <Grid item xs={12} md={5}>
              <Typography className={styles.sectionTitle}>
                수행/점검 정보 영역
              </Typography>

              {/* 수행활동 정보 카드 (읽기 전용, dept_manager_manuals 데이터) */}
              <div className={`${styles.cardSection} ${styles.cardPerformanceInput}`}>
                <div className={styles.cardTitle}>📋 수행활동 정보</div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>수행자</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={execution?.executorName || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>수행결과</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={getExecutionResultDisplayName(execution?.executionResultCd, getExecutionResultCodeName(execution?.executionResultCd || ''))}
                    InputProps={{ readOnly: true }}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>수행결과 내용</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={execution?.executionResultContent || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </div>
              </div>

              {/* 점검정보 입력 카드 */}
              <div className={`${styles.cardSection} ${styles.cardInspectionInput}`}>
                <div className={styles.cardTitle}>🔍 점검정보 입력</div>

                <div className={styles.fieldGroup}>
                  <Typography className={styles.fieldLabel}>점검자</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={execution?.inspectorName || '-'}
                    InputProps={{ readOnly: true }}
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
                          {...field}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>선택</MenuItem>
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
  );
};

export default ImplMonitoringDetailModal;
