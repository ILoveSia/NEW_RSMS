import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { ReportFormModalProps, ReportFormData } from '../types/reportList.types';

const ReportFormModal: React.FC<ReportFormModalProps> = ({
  open,
  onClose,
  reportType,
  reportData,
  onSubmit,
  title = '보고서 작성'
}) => {
  const [formData, setFormData] = useState<ReportFormData>({
    inspectionRound: '',
    inspectionPeriod: '',
    reviewContent: '',
    attachments: [],
    reportType: reportType
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (reportData) {
        setFormData({
          inspectionRound: reportData.inspectionName || '',
          inspectionPeriod: reportData.inspectionPeriod || '',
          reviewContent: reportData.reviewContent || '',
          attachments: [],
          reportType: reportType
        });
      } else {
        setFormData({
          inspectionRound: '',
          inspectionPeriod: '',
          reviewContent: '',
          attachments: [],
          reportType: reportType
        });
      }
      setErrors({});
    }
  }, [open, reportData, reportType]);

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback((field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.inspectionRound.trim()) {
      newErrors.inspectionRound = '점검회차를 입력해주세요.';
    }

    if (!formData.inspectionPeriod.trim()) {
      newErrors.inspectionPeriod = '점검기간을 입력해주세요.';
    }

    if (!formData.reviewContent.trim()) {
      newErrors.reviewContent = '검토내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('보고서 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmit]);

  // 파일 첨부 핸들러
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleInputChange('attachments', files);
  }, [handleInputChange]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* 보고서 유형 표시 */}
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              보고서 유형: {reportType === 'CEO' ? 'CEO 보고서' : reportType === 'EXECUTIVE' ? '임원 보고서' : '부서별 보고서'}
            </Typography>
          </Box>

          {/* 점검회차 입력 */}
          <TextField
            label="점검회차"
            value={formData.inspectionRound}
            onChange={(e) => handleInputChange('inspectionRound', e.target.value)}
            error={!!errors.inspectionRound}
            helperText={errors.inspectionRound}
            fullWidth
            required
            placeholder="예: 2024년 1차 이행점검"
          />

          {/* 점검기간 입력 */}
          <TextField
            label="점검기간"
            value={formData.inspectionPeriod}
            onChange={(e) => handleInputChange('inspectionPeriod', e.target.value)}
            error={!!errors.inspectionPeriod}
            helperText={errors.inspectionPeriod}
            fullWidth
            required
            placeholder="예: 2024.01.01~2024.03.31"
          />

          {/* 검토내용 입력 */}
          <TextField
            label="검토내용"
            value={formData.reviewContent}
            onChange={(e) => handleInputChange('reviewContent', e.target.value)}
            error={!!errors.reviewContent}
            helperText={errors.reviewContent}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="점검 및 검토 내용을 상세히 입력해주세요."
          />

          {/* 파일 첨부 */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              첨부파일
            </Typography>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ width: '100%' }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp"
            />
            {formData.attachments && formData.attachments.length > 0 && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {formData.attachments.length}개 파일이 선택되었습니다.
              </Typography>
            )}
          </Box>

          {/* 안내 메시지 */}
          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              📋 <strong>작성 안내:</strong>
              <br />
              • 점검회차와 기간을 정확히 입력해주세요.
              <br />
              • 검토내용은 점검 결과를 구체적으로 기술해주세요.
              <br />
              • 관련 문서가 있는 경우 첨부파일로 업로드해주세요.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={loading}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? '저장중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportFormModal;