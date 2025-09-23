import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import toast from '@/shared/utils/toast';

import type { CeoNewReportFormData, CeoReportMetadata } from '../types/ceoReport.types';

interface CeoReportFormModalProps {
  open: boolean;
  onClose: () => void;
  reportData?: CeoReportMetadata | null;
  onSubmit: (data: CeoNewReportFormData) => void;
}

const CeoReportFormModal: React.FC<CeoReportFormModalProps> = ({
  open,
  onClose,
  reportData,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CeoNewReportFormData>({
    inspectionRound: '2026년1회차 이행점검',
    inspectionPeriod: '2026.07.31 ~ 2026.08...',
    inspectionContent: '',
    attachments: []
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field: keyof CeoNewReportFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: Array.from(files)
      }));
      toast.success(`${files.length}개 파일이 선택되었습니다.`);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.inspectionContent.trim()) {
      toast.warning('점검 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      onSubmit(formData);
      toast.success('CEO 보고서가 성공적으로 등록되었습니다.');
    } catch (error) {
      toast.error('보고서 등록에 실패했습니다.');
      console.error('보고서 등록 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="ceo-report-form-title"
    >
      <DialogTitle
        id="ceo-report-form-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          이행점검 수행결과 보고서 등록
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: '#666' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="점검회차"
              value={formData.inspectionRound}
              onChange={handleInputChange('inspectionRound')}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="점검기간"
              value={formData.inspectionPeriod}
              onChange={handleInputChange('inspectionPeriod')}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="점검 내용"
              value={formData.inspectionContent}
              onChange={handleInputChange('inspectionContent')}
              fullWidth
              required
              multiline
              rows={6}
              variant="outlined"
              placeholder="CEO 이행점검 수행 결과를 상세히 작성해주세요."
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                파일 첨부
              </Typography>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                  sx={{ mb: 1 }}
                >
                  파일 선택
                </Button>
              </label>

              {formData.attachments && formData.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    선택된 파일: {formData.attachments.length}개
                  </Typography>
                  {formData.attachments.map((file, index) => (
                    <Typography key={index} variant="caption" display="block">
                      • {file.name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{
        padding: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? '등록 중...' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CeoReportFormModal;