/**
 * 이행점검결과보고서 등록/수정/상세 모달
 * - ExecutiveReportFormModal.tsx와 100% 동일한 구조
 * - impl_inspection_reports 테이블 구조 반영
 * - PositionFormModal.tsx 표준 스타일 적용
 * - BaseModalWrapper 미사용 (Dialog 직접 사용)
 */

import { Button } from '@/shared/components/atoms/Button';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

/**
 * 이행점검결과보고서 폼 데이터 타입
 */
interface ReportFormData {
  ledgerOrderId: string;              // 원장차수ID
  implInspectionPlanId: string;       // 이행점검ID
  reportTypeCd: string;               // 보고서구분 (01:CEO보고서, 02:임원보고서, 03:부서별보고서)
  reviewContent: string;              // 검토내용
  reviewDate: string | null;          // 검토일자
  result: string;                     // 결과
  improvementAction: string;          // 개선조치
  remarks: string;                    // 비고
}

/**
 * 모달 Props
 */
interface ReportFormModalProps {
  open: boolean;
  mode?: 'create' | 'detail';
  reportType?: 'CEO' | 'EXECUTIVE' | 'DEPARTMENT';
  reportData?: any | null;
  onClose: () => void;
  onSubmit?: (formData: ReportFormData) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  title?: string;
}

/**
 * 폼 검증 스키마
 */
const schema = yup.object().shape({
  ledgerOrderId: yup
    .string()
    .required('원장차수는 필수입니다'),
  implInspectionPlanId: yup
    .string()
    .required('이행점검ID는 필수입니다')
    .max(13, '이행점검ID는 13자리입니다'),
  reportTypeCd: yup
    .string()
    .required('보고서구분은 필수입니다')
    .oneOf(['01', '02', '03'], '보고서구분은 01, 02, 03만 가능합니다'),
  reviewContent: yup
    .string()
    .default('')
    .max(2000, '검토내용은 2000자 이내로 입력해주세요'),
  reviewDate: yup
    .string()
    .nullable()
    .default(null),
  result: yup
    .string()
    .default('')
    .max(2000, '결과는 2000자 이내로 입력해주세요'),
  improvementAction: yup
    .string()
    .default('')
    .max(2000, '개선조치는 2000자 이내로 입력해주세요'),
  remarks: yup
    .string()
    .default('')
    .max(500, '비고는 500자 이내로 입력해주세요')
});

const ReportFormModal: React.FC<ReportFormModalProps> = ({
  open,
  mode = 'create',
  reportType = 'DEPARTMENT',
  reportData,
  onClose,
  onSubmit,
  onRefresh,
  loading = false,
  title
}) => {
  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // reportType을 reportTypeCd로 변환
  const getReportTypeCd = (type: string): string => {
    switch (type) {
      case 'CEO':
        return '01';
      case 'EXECUTIVE':
        return '02';
      case 'DEPARTMENT':
        return '03';
      default:
        return '03';
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ReportFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ledgerOrderId: '',
      implInspectionPlanId: '',
      reportTypeCd: getReportTypeCd(reportType),
      reviewContent: '',
      reviewDate: dayjs().format('YYYY-MM-DD'),
      result: '',
      improvementAction: '',
      remarks: ''
    }
  });

  /**
   * 폼 초기화
   * - mode와 report 데이터에 따라 폼 데이터 설정
   */
  useEffect(() => {
    if (mode === 'create') {
      reset({
        ledgerOrderId: '',
        implInspectionPlanId: '',
        reportTypeCd: getReportTypeCd(reportType),
        reviewContent: '',
        reviewDate: dayjs().format('YYYY-MM-DD'),
        result: '',
        improvementAction: '',
        remarks: ''
      });
      setIsEditing(true);
    } else if (reportData) {
      reset({
        ledgerOrderId: reportData.ledgerOrderId || '',
        implInspectionPlanId: reportData.implInspectionPlanId || '',
        reportTypeCd: reportData.reportTypeCd || getReportTypeCd(reportType),
        reviewContent: reportData.reviewContent || '',
        reviewDate: reportData.reviewDate || dayjs().format('YYYY-MM-DD'),
        result: reportData.result || '',
        improvementAction: reportData.improvementAction || '',
        remarks: reportData.remarks || ''
      });
      setIsEditing(false);
    }
  }, [mode, reportData, reportType, reset]);

  /**
   * 폼 제출 핸들러
   */
  const onFormSubmit = useCallback(async (formData: ReportFormData) => {
    try {
      if (mode === 'create') {
        // TODO: API 호출 - 보고서 등록
        console.log('보고서 등록:', formData);
        alert('보고서가 성공적으로 등록되었습니다.');

        if (onSubmit) {
          await onSubmit(formData);
        }

        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      } else if (reportData && isEditing) {
        // TODO: API 호출 - 보고서 수정
        console.log('보고서 수정:', reportData.id, formData);
        alert('보고서가 성공적으로 수정되었습니다.');

        if (onSubmit) {
          await onSubmit(formData);
        }

        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      }
    } catch (error) {
      console.error('보고서 저장 실패:', error);
      alert(error instanceof Error ? error.message : '보고서 저장에 실패했습니다.');
    }
  }, [mode, reportData, isEditing, onClose, onRefresh, onSubmit]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && reportData) {
      reset({
        ledgerOrderId: reportData.ledgerOrderId || '',
        implInspectionPlanId: reportData.implInspectionPlanId || '',
        reportTypeCd: reportData.reportTypeCd || getReportTypeCd(reportType),
        reviewContent: reportData.reviewContent || '',
        reviewDate: reportData.reviewDate || dayjs().format('YYYY-MM-DD'),
        result: reportData.result || '',
        improvementAction: reportData.improvementAction || '',
        remarks: reportData.remarks || ''
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, reportData, onClose, reset, reportType]);

  const modalTitle = title || (mode === 'create' ? '이행점검결과보고서 등록' : '이행점검결과보고서 상세');
  const isReadOnly = mode === 'detail' && !isEditing;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '90vh'
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

      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 원장차수 + 이행점검ID */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <LedgerOrderComboBox
                value={undefined}
                onChange={() => {}}
                label="원장차수"
                required
                disabled={isReadOnly}
                error={!!errors.ledgerOrderId}
                helperText={errors.ledgerOrderId?.message}
                fullWidth
                size="small"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Controller
                name="implInspectionPlanId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="이행점검ID"
                    required
                    fullWidth
                    size="small"
                    disabled={isReadOnly}
                    error={!!errors.implInspectionPlanId}
                    helperText={errors.implInspectionPlanId?.message}
                    placeholder="예: 20250001A0001"
                  />
                )}
              />
            </Box>
          </Box>

          {/* 보고서구분 + 검토일자 */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="reportTypeCd"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="보고서구분"
                    required
                    fullWidth
                    size="small"
                    disabled={isReadOnly}
                    error={!!errors.reportTypeCd}
                    helperText={errors.reportTypeCd?.message}
                  >
                    <MenuItem value="01">CEO보고서</MenuItem>
                    <MenuItem value="02">임원보고서</MenuItem>
                    <MenuItem value="03">부서별보고서</MenuItem>
                  </TextField>
                )}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Controller
                name="reviewDate"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      {...field}
                      label="검토일자"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                      format="YYYY/MM/DD"
                      disabled={isReadOnly}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: !!errors.reviewDate,
                          helperText: errors.reviewDate?.message
                        }
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Box>
          </Box>

          {/* 검토내용 */}
          <Controller
            name="reviewContent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="검토내용"
                fullWidth
                multiline
                rows={4}
                disabled={isReadOnly}
                error={!!errors.reviewContent}
                helperText={errors.reviewContent?.message}
                placeholder="검토 내용을 입력하세요"
              />
            )}
          />

          {/* 결과 */}
          <Controller
            name="result"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="결과"
                fullWidth
                multiline
                rows={4}
                disabled={isReadOnly}
                error={!!errors.result}
                helperText={errors.result?.message}
                placeholder="점검 결과를 입력하세요"
              />
            )}
          />

          {/* 개선조치 */}
          <Controller
            name="improvementAction"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="개선조치"
                fullWidth
                multiline
                rows={4}
                disabled={isReadOnly}
                error={!!errors.improvementAction}
                helperText={errors.improvementAction?.message}
                placeholder="개선조치 내용을 입력하세요"
              />
            )}
          />

          {/* 비고 */}
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="비고"
                fullWidth
                multiline
                rows={2}
                disabled={isReadOnly}
                error={!!errors.remarks}
                helperText={errors.remarks?.message}
                placeholder="비고 사항을 입력하세요"
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit(onFormSubmit)} disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </>
        ) : (
          <>
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleSubmit(onFormSubmit)} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={onClose}>
                  닫기
                </Button>
                <Button variant="contained" onClick={handleEdit}>
                  수정
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportFormModal;
