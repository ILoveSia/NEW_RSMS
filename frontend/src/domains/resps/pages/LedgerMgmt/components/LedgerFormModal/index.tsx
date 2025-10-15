/**
 * 원장차수 등록/수정/상세 모달
 * PositionMgmt 표준 템플릿 기반
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import type { LedgerOrder, CreateLedgerOrderDto, UpdateLedgerOrderDto, LEDGER_ORDER_STATUS } from '../../types/ledgerOrder.types';

interface LedgerFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  ledger: LedgerOrder | null;
  onClose: () => void;
  onSave: (formData: CreateLedgerOrderDto) => Promise<void>;
  onUpdate: (id: string, formData: UpdateLedgerOrderDto) => Promise<void>;
  loading?: boolean;
}

const LedgerFormModal: React.FC<LedgerFormModalProps> = ({
  open,
  mode,
  ledger,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateLedgerOrderDto>({
    ledgerOrderTitle: '',
    ledgerOrderStatus: 'PROG',
    ledgerOrderRemarks: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        ledgerOrderTitle: '',
        ledgerOrderStatus: 'PROG',
        ledgerOrderRemarks: ''
      });
      setIsEditing(true);
    } else if (ledger) {
      setFormData({
        ledgerOrderTitle: ledger.ledgerOrderTitle,
        ledgerOrderStatus: ledger.ledgerOrderStatus,
        ledgerOrderRemarks: ledger.ledgerOrderRemarks
      });
      setIsEditing(false);
    }
  }, [mode, ledger]);

  const handleChange = useCallback((field: keyof CreateLedgerOrderDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (mode === 'create') {
      await onSave(formData);
    } else if (ledger && isEditing) {
      await onUpdate(ledger.ledgerOrderId, {
        ...formData,
        ledgerOrderId: ledger.ledgerOrderId
      });
    }
  }, [mode, formData, ledger, isEditing, onSave, onUpdate]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && ledger) {
      setFormData({
        ledgerOrderTitle: ledger.ledgerOrderTitle,
        ledgerOrderStatus: ledger.ledgerOrderStatus,
        ledgerOrderRemarks: ledger.ledgerOrderRemarks
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, ledger, onClose]);

  const title = mode === 'create' ? '원장차수 등록' : '원장차수 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px'
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
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 원장차수ID (상세보기일 때만 표시) */}
          {mode === 'detail' && ledger && (
            <TextField
              label="원장차수ID"
              value={ledger.ledgerOrderId}
              fullWidth
              disabled
              variant="outlined"
            />
          )}

          {/* 원장 제목 */}
          <TextField
            label="원장 제목"
            value={formData.ledgerOrderTitle || ''}
            onChange={(e) => handleChange('ledgerOrderTitle', e.target.value)}
            fullWidth
            disabled={isReadOnly}
            variant="outlined"
            placeholder="원장 제목을 입력하세요"
          />

          {/* 원장상태 */}
          <TextField
            select
            label="원장상태"
            value={formData.ledgerOrderStatus || 'PROG'}
            onChange={(e) => handleChange('ledgerOrderStatus', e.target.value)}
            fullWidth
            disabled={isReadOnly}
            variant="outlined"
          >
            <MenuItem value="PROG">진행중</MenuItem>
            <MenuItem value="CLSD">종료</MenuItem>
          </TextField>

          {/* 비고 */}
          <TextField
            label="비고"
            value={formData.ledgerOrderRemarks || ''}
            onChange={(e) => handleChange('ledgerOrderRemarks', e.target.value)}
            fullWidth
            disabled={isReadOnly}
            variant="outlined"
            multiline
            rows={4}
            placeholder="비고를 입력하세요"
          />

          {/* 메타 정보 (상세보기일 때만 표시) */}
          {mode === 'detail' && ledger && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                생성일시: {new Date(ledger.createdAt).toLocaleString('ko-KR')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                생성자: {ledger.createdBy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                수정일시: {new Date(ledger.updatedAt).toLocaleString('ko-KR')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                수정자: {ledger.updatedBy}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
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
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
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

export default LedgerFormModal;
