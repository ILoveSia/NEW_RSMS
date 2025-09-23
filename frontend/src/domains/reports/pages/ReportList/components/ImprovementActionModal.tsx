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
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { ImprovementActionModalProps, ImprovementActionFormData } from '../types/reportList.types';

const ImprovementActionModal: React.FC<ImprovementActionModalProps> = ({
  open,
  onClose,
  reportData,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ImprovementActionFormData>({
    reportId: '',
    actionPlan: '',
    responsible: '',
    dueDate: '',
    priority: 'MEDIUM',
    description: '',
    attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 데이터 초기화
  useEffect(() => {
    if (open && reportData) {
      setFormData({
        reportId: reportData.id,
        actionPlan: '',
        responsible: '',
        dueDate: '',
        priority: 'MEDIUM',
        description: '',
        attachments: []
      });
      setErrors({});
    }
  }, [open, reportData]);

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback((field: keyof ImprovementActionFormData, value: any) => {
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

    if (!formData.actionPlan.trim()) {
      newErrors.actionPlan = '개선조치 계획을 입력해주세요.';
    }

    if (!formData.responsible.trim()) {
      newErrors.responsible = '담당자를 입력해주세요.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = '완료예정일을 선택해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '상세내용을 입력해주세요.';
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
      console.error('개선조치 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmit]);

  // 파일 첨부 핸들러
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleInputChange('attachments', files);
  }, [handleInputChange]);

  // 우선순위 색상 및 텍스트
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { color: 'error', text: '높음' };
      case 'MEDIUM':
        return { color: 'warning', text: '보통' };
      case 'LOW':
        return { color: 'success', text: '낮음' };
      default:
        return { color: 'default', text: '보통' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '700px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6" component="div" fontWeight={600}>
              개선조치 등록
            </Typography>
          </Box>
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
          {/* 보고서 정보 표시 */}
          {reportData && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>대상 보고서:</strong> {reportData.inspectionName}
              </Typography>
              <Typography variant="body2">
                보고서번호: {reportData.reportNumber} | 작성자: {reportData.author}
              </Typography>
            </Alert>
          )}

          {/* 개선조치 계획 */}
          <TextField
            label="개선조치 계획"
            value={formData.actionPlan}
            onChange={(e) => handleInputChange('actionPlan', e.target.value)}
            error={!!errors.actionPlan}
            helperText={errors.actionPlan}
            fullWidth
            required
            multiline
            rows={3}
            placeholder="개선이 필요한 사항과 구체적인 조치 계획을 입력해주세요."
          />

          {/* 담당자와 우선순위 */}
          <Box display="flex" gap={2}>
            <TextField
              label="담당자"
              value={formData.responsible}
              onChange={(e) => handleInputChange('responsible', e.target.value)}
              error={!!errors.responsible}
              helperText={errors.responsible}
              fullWidth
              required
              placeholder="담당자명을 입력해주세요."
            />

            <FormControl fullWidth required>
              <InputLabel>우선순위</InputLabel>
              <Select
                value={formData.priority}
                label="우선순위"
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <MenuItem value="HIGH">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="높음" color="error" size="small" />
                    <Typography>높음 (긴급)</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="MEDIUM">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="보통" color="warning" size="small" />
                    <Typography>보통 (일반)</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="LOW">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="낮음" color="success" size="small" />
                    <Typography>낮음 (지연가능)</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 완료예정일 */}
          <TextField
            label="완료예정일"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
            fullWidth
            required
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* 상세내용 */}
          <TextField
            label="상세내용"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="개선조치의 구체적인 방법, 절차, 기대효과 등을 상세히 기술해주세요."
          />

          {/* 관련 첨부파일 */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              관련 첨부파일
            </Typography>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ width: '100%' }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp,.png,.jpg,.jpeg"
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
              📋 <strong>개선조치 등록 안내:</strong>
              <br />
              • 개선조치 계획은 구체적이고 실행 가능한 내용으로 작성해주세요.
              <br />
              • 담당자는 실제 조치를 수행할 담당자를 명시해주세요.
              <br />
              • 완료예정일은 현실적이고 합리적인 기간으로 설정해주세요.
              <br />
              • 관련 문서나 증빙자료가 있는 경우 첨부해주세요.
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
          {loading ? '등록중...' : '개선조치 등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImprovementActionModal;