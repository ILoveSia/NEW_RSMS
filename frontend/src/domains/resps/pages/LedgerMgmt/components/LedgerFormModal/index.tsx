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
  Box,
  MenuItem
} from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import type { LedgerOrder, CreateLedgerOrderDto, UpdateLedgerOrderDto } from '../../types/ledgerOrder.types';

// 한글 글자수 계산 유틸리티 (한글 1자 = 1자)
const getKoreanLength = (str: string): number => {
  return str.length;
};

// 최대 글자수 제한
const MAX_TITLE_LENGTH = 50;
const MAX_REMARKS_LENGTH = 100;

// 원장상태 옵션
const LEDGER_STATUS_OPTIONS = [
  { value: 'NEW', label: '신규' },
  { value: 'PROG', label: '진행중' },
  { value: 'CLSD', label: '종료' }
];

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
    ledgerOrderStatus: 'NEW',
    ledgerOrderRemarks: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    remarks: ''
  });

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        ledgerOrderTitle: '',
        ledgerOrderStatus: 'NEW',
        ledgerOrderRemarks: ''
      });
      setIsEditing(true);
      setErrors({ title: '', remarks: '' });
    } else if (ledger) {
      setFormData({
        ledgerOrderTitle: ledger.ledgerOrderTitle,
        ledgerOrderStatus: ledger.ledgerOrderStatus,
        ledgerOrderRemarks: ledger.ledgerOrderRemarks
      });
      setIsEditing(false);
      setErrors({ title: '', remarks: '' });
    }
  }, [mode, ledger]);

  const handleChange = useCallback((field: keyof CreateLedgerOrderDto, value: string) => {
    // 글자수 체크
    if (field === 'ledgerOrderTitle') {
      if (getKoreanLength(value) > MAX_TITLE_LENGTH) {
        setErrors(prev => ({ ...prev, title: `원장 제목은 ${MAX_TITLE_LENGTH}자까지 입력 가능합니다.` }));
        return;
      } else {
        setErrors(prev => ({ ...prev, title: '' }));
      }
    } else if (field === 'ledgerOrderRemarks') {
      if (getKoreanLength(value) > MAX_REMARKS_LENGTH) {
        setErrors(prev => ({ ...prev, remarks: `비고는 ${MAX_REMARKS_LENGTH}자까지 입력 가능합니다.` }));
        return;
      } else {
        setErrors(prev => ({ ...prev, remarks: '' }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // 제출 전 최종 검증
    if (!formData.ledgerOrderTitle?.trim()) {
      setErrors(prev => ({ ...prev, title: '원장 제목을 입력해주세요.' }));
      return;
    }

    if (errors.title || errors.remarks) {
      return;
    }

    if (mode === 'create') {
      await onSave(formData);
    } else if (ledger && isEditing) {
      await onUpdate(ledger.ledgerOrderId, {
        ...formData,
        ledgerOrderId: ledger.ledgerOrderId
      });
    }
  }, [mode, formData, ledger, isEditing, onSave, onUpdate, errors]);

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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '350px'
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
          <Box>
            <TextField
              label="원장 제목"
              value={formData.ledgerOrderTitle || ''}
              onChange={(e) => handleChange('ledgerOrderTitle', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              placeholder="원장 제목을 입력하세요 (최대 50자)"
              required
              error={!!errors.title}
              helperText={errors.title}
              inputProps={{
                maxLength: MAX_TITLE_LENGTH
              }}
            />
          </Box>

          {/* 원장상태 (상세/수정 모드일 때만 표시) */}
          {mode === 'detail' && (
            <TextField
              label="원장상태"
              value={formData.ledgerOrderStatus || ''}
              onChange={(e) => handleChange('ledgerOrderStatus', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              select
              required
            >
              {LEDGER_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* 비고 */}
          <Box>
            <TextField
              label="비고"
              value={formData.ledgerOrderRemarks || ''}
              onChange={(e) => handleChange('ledgerOrderRemarks', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              multiline
              rows={4}
              placeholder="비고를 입력하세요 (최대 100자)"
              error={!!errors.remarks}
              helperText={errors.remarks}
              inputProps={{
                maxLength: MAX_REMARKS_LENGTH
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
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
