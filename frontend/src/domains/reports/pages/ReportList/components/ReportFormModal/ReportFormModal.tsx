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
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

// Domain Components
import { InspectionPlanComboBox } from '@/domains/compliance/components/molecules/InspectionPlanComboBox';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// API
import { createImplInspectionReport, updateImplInspectionReport } from '@/domains/reports/api/implInspectionReportApi';
import toast from '@/shared/utils/toast';

/**
 * 이행점검결과보고서 폼 데이터 타입
 * - impl_inspection_reports 테이블 구조와 매핑
 */
interface ReportFormData {
  ledgerOrderId: string;              // 원장차수ID
  implInspectionPlanId: string;       // 이행점검계획ID (점검명 선택 시 설정)
  reportTypeCd: string;               // 보고서구분 (01:CEO보고서, 02:임원보고서)
  reviewDate: string | null;          // 검토일자
  result: string;                     // 결과
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
 * - impl_inspection_reports 테이블 필드와 매핑
 */
const schema = yup.object().shape({
  ledgerOrderId: yup
    .string()
    .required('원장차수는 필수입니다'),
  implInspectionPlanId: yup
    .string()
    .required('점검명은 필수입니다'),
  reportTypeCd: yup
    .string()
    .required('보고서구분은 필수입니다')
    .oneOf(['01', '02'], '보고서구분은 01, 02만 가능합니다'),
  reviewDate: yup
    .string()
    .nullable()
    .default(null),
  result: yup
    .string()
    .default('')
    .max(2000, '결과는 2000자 이내로 입력해주세요')
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
      default:
        return '02';
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ReportFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ledgerOrderId: '',
      implInspectionPlanId: '',
      reportTypeCd: getReportTypeCd(reportType),
      reviewDate: dayjs().format('YYYY-MM-DD'),
      result: ''
    }
  });

  /**
   * 폼 초기화
   * - mode와 reportData에 따라 폼 데이터 설정
   */
  useEffect(() => {
    if (mode === 'create') {
      reset({
        ledgerOrderId: '',
        implInspectionPlanId: '',
        reportTypeCd: getReportTypeCd(reportType),
        reviewDate: dayjs().format('YYYY-MM-DD'),
        result: ''
      });
      setIsEditing(true);
    } else if (reportData) {
      reset({
        ledgerOrderId: reportData.ledgerOrderId || '',
        implInspectionPlanId: reportData.implInspectionPlanId || '',
        reportTypeCd: reportData.reportTypeCd || getReportTypeCd(reportType),
        reviewDate: reportData.reviewDate || dayjs().format('YYYY-MM-DD'),
        result: reportData.result || ''
      });
      setIsEditing(false);
    }
  }, [mode, reportData, reportType, reset]);

  /**
   * 폼 제출 핸들러
   * - 등록/수정 API 호출
   */
  const onFormSubmit = useCallback(async (formData: ReportFormData) => {
    try {
      if (mode === 'create') {
        // API 호출 - 보고서 등록
        const createRequest = {
          ledgerOrderId: formData.ledgerOrderId,
          implInspectionPlanId: formData.implInspectionPlanId,
          reportTypeCd: formData.reportTypeCd,
          reviewDate: formData.reviewDate || undefined,
          result: formData.result || undefined
        };

        await createImplInspectionReport(createRequest);
        toast.success('보고서가 성공적으로 등록되었습니다.');

        if (onSubmit) {
          await onSubmit(formData);
        }

        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      } else if (reportData && isEditing) {
        // API 호출 - 보고서 수정
        const updateRequest = {
          reportTypeCd: formData.reportTypeCd,
          reviewDate: formData.reviewDate || undefined,
          result: formData.result || undefined
        };

        await updateImplInspectionReport(reportData.implInspectionReportId, updateRequest);
        toast.success('보고서가 성공적으로 수정되었습니다.');

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
      toast.error(error instanceof Error ? error.message : '보고서 저장에 실패했습니다.');
    }
  }, [mode, reportData, isEditing, onClose, onRefresh, onSubmit]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  /**
   * 취소 버튼 핸들러
   * - 상세 모드: 수정 취소 후 원래 데이터로 복원
   * - 등록 모드: 모달 닫기
   */
  const handleCancel = useCallback(() => {
    if (mode === 'detail' && reportData) {
      reset({
        ledgerOrderId: reportData.ledgerOrderId || '',
        implInspectionPlanId: reportData.implInspectionPlanId || '',
        reportTypeCd: reportData.reportTypeCd || getReportTypeCd(reportType),
        reviewDate: reportData.reviewDate || dayjs().format('YYYY-MM-DD'),
        result: reportData.result || ''
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, reportData, onClose, reset, reportType]);

  const modalTitle = title || (mode === 'create' ? '이행점검결과보고서 등록' : '이행점검결과보고서 상세');
  const isReadOnly = mode === 'detail' && !isEditing;

  // 원장차수ID 감시 (점검명 콤보박스에서 필터링용)
  const watchedLedgerOrderId = watch('ledgerOrderId');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '80vh'
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
          {/* 원장차수 - Controller 연결 */}
          <Controller
            name="ledgerOrderId"
            control={control}
            render={({ field }) => (
              <LedgerOrderComboBox
                value={field.value || ''}
                onChange={(value) => field.onChange(value || '')}
                label="원장차수"
                required
                disabled={isReadOnly}
                error={!!errors.ledgerOrderId}
                helperText={errors.ledgerOrderId?.message}
                fullWidth
                size="small"
              />
            )}
          />

          {/* 점검명 - InspectionPlanComboBox 사용 */}
          <Controller
            name="implInspectionPlanId"
            control={control}
            render={({ field }) => (
              <InspectionPlanComboBox
                ledgerOrderId={watchedLedgerOrderId}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
                label="점검명"
                required
                disabled={isReadOnly || !watchedLedgerOrderId}
                error={!!errors.implInspectionPlanId}
                helperText={errors.implInspectionPlanId?.message}
                fullWidth
                size="small"
              />
            )}
          />

          {/* 보고서구분 */}
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
                {/* <MenuItem value="03">부서별보고서</MenuItem> */}
              </TextField>
            )}
          />

          {/* 검토일자 */}
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
                rows={3}
                size="small"
                disabled={isReadOnly}
                error={!!errors.result}
                helperText={errors.result?.message}
                placeholder="점검 결과를 입력하세요"
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
