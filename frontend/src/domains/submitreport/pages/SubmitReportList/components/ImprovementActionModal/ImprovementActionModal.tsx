/**
 * 개선조치 등록 모달
 * - 제출보고서에 대한 개선조치 등록
 * - 간소화된 폼 (개선조치 내용만 입력)
 */

import { Button } from '@/shared/components/atoms/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

interface ImprovementActionFormData {
  reportId: string;
  actionPlan: string;
  targetDate?: string;
  responsible?: string;
}

interface ImprovementActionModalProps {
  open: boolean;
  onClose: () => void;
  reportData: any | null;
  onSubmit: (formData: ImprovementActionFormData) => Promise<void>;
}

const ImprovementActionModal: React.FC<ImprovementActionModalProps> = ({
  open,
  onClose,
  reportData,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ImprovementActionFormData>({
    reportId: '',
    actionPlan: '',
    targetDate: '',
    responsible: ''
  });

  useEffect(() => {
    if (reportData) {
      setFormData({
        reportId: reportData.id || '',
        actionPlan: reportData.improvementAction || '',
        targetDate: '',
        responsible: ''
      });
    }
  }, [reportData]);

  const handleChange = useCallback((field: keyof ImprovementActionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.actionPlan.trim()) {
      alert('개선조치 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('개선조치 등록 실패:', error);
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
        개선조치 등록
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 보고서 정보 */}
          {reportData && (
            <TextField
              label="보고서 번호"
              value={reportData.reportNumber || ''}
              disabled
              fullWidth
              size="small"
            />
          )}

          {/* 개선조치 내용 */}
          <TextField
            label="개선조치 내용"
            value={formData.actionPlan}
            onChange={(e) => handleChange('actionPlan', e.target.value)}
            multiline
            rows={6}
            fullWidth
            required
            placeholder="개선조치 내용을 입력하세요"
          />

          {/* 목표일자 */}
          <TextField
            label="목표일자"
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleChange('targetDate', e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          {/* 담당자 */}
          <TextField
            label="담당자"
            value={formData.responsible}
            onChange={(e) => handleChange('responsible', e.target.value)}
            fullWidth
            size="small"
            placeholder="담당자를 입력하세요"
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? '등록 중...' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImprovementActionModal;
