/**
 * 직책 등록/수정/상세 모달
 * LedgerFormModal 표준 템플릿 기반
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  MenuItem
} from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import type { Position, PositionFormData } from '../../types/position.types';

// 한글 글자수 계산 유틸리티 (한글 1자 = 1자)
const getKoreanLength = (str: string): number => {
  return str.length;
};

// 최대 글자수 제한
const MAX_POSITION_NAME_LENGTH = 50;
const MAX_DEPARTMENT_NAME_LENGTH = 100;
const MAX_DIVISION_NAME_LENGTH = 100;

// 본부구분 옵션
const HEADQUARTERS_OPTIONS = [
  { value: 'headquarters', label: '본부' },
  { value: 'department', label: '부서' },
  { value: 'team', label: '팀' },
  { value: 'division', label: '부정' }
];

interface PositionFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  position: Position | null;
  onClose: () => void;
  onSave: (formData: PositionFormData) => Promise<void>;
  onUpdate: (id: string, formData: PositionFormData) => Promise<void>;
  loading?: boolean;
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  open,
  mode,
  position,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const [formData, setFormData] = useState<PositionFormData>({
    positionName: '',
    headquarters: '',
    departmentName: '',
    divisionName: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    positionName: '',
    headquarters: '',
    departmentName: '',
    divisionName: ''
  });

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        positionName: '',
        headquarters: '',
        departmentName: '',
        divisionName: ''
      });
      setIsEditing(true);
      setErrors({ positionName: '', headquarters: '', departmentName: '', divisionName: '' });
    } else if (position) {
      setFormData({
        positionName: position.positionName,
        headquarters: position.headquarters,
        departmentName: position.departmentName,
        divisionName: position.divisionName
      });
      setIsEditing(false);
      setErrors({ positionName: '', headquarters: '', departmentName: '', divisionName: '' });
    }
  }, [mode, position]);

  const handleChange = useCallback((field: keyof PositionFormData, value: string) => {
    // 글자수 체크
    if (field === 'positionName') {
      if (getKoreanLength(value) > MAX_POSITION_NAME_LENGTH) {
        setErrors(prev => ({ ...prev, positionName: `직책명은 ${MAX_POSITION_NAME_LENGTH}자까지 입력 가능합니다.` }));
        return;
      } else {
        setErrors(prev => ({ ...prev, positionName: '' }));
      }
    } else if (field === 'departmentName') {
      if (getKoreanLength(value) > MAX_DEPARTMENT_NAME_LENGTH) {
        setErrors(prev => ({ ...prev, departmentName: `부서명은 ${MAX_DEPARTMENT_NAME_LENGTH}자까지 입력 가능합니다.` }));
        return;
      } else {
        setErrors(prev => ({ ...prev, departmentName: '' }));
      }
    } else if (field === 'divisionName') {
      if (getKoreanLength(value) > MAX_DIVISION_NAME_LENGTH) {
        setErrors(prev => ({ ...prev, divisionName: `부정명은 ${MAX_DIVISION_NAME_LENGTH}자까지 입력 가능합니다.` }));
        return;
      } else {
        setErrors(prev => ({ ...prev, divisionName: '' }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // 제출 전 최종 검증
    if (!formData.positionName?.trim()) {
      setErrors(prev => ({ ...prev, positionName: '직책명을 입력해주세요.' }));
      return;
    }
    if (!formData.headquarters?.trim()) {
      setErrors(prev => ({ ...prev, headquarters: '본부구분을 선택해주세요.' }));
      return;
    }
    if (!formData.departmentName?.trim()) {
      setErrors(prev => ({ ...prev, departmentName: '부서명을 입력해주세요.' }));
      return;
    }
    if (!formData.divisionName?.trim()) {
      setErrors(prev => ({ ...prev, divisionName: '부정명을 입력해주세요.' }));
      return;
    }

    if (errors.positionName || errors.headquarters || errors.departmentName || errors.divisionName) {
      return;
    }

    if (mode === 'create') {
      await onSave(formData);
    } else if (position && isEditing) {
      await onUpdate(position.id, formData);
    }
  }, [mode, formData, position, isEditing, onSave, onUpdate, errors]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && position) {
      setFormData({
        positionName: position.positionName,
        headquarters: position.headquarters,
        departmentName: position.departmentName,
        divisionName: position.divisionName
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, position, onClose]);

  const title = mode === 'create' ? '직책 등록' : '직책 상세';
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
          {/* 직책ID (상세보기일 때만 표시) */}
          {mode === 'detail' && position && (
            <TextField
              label="직책ID"
              value={position.id}
              fullWidth
              disabled
              variant="outlined"
              size="small"
            />
          )}

          {/* 직책명 */}
          <Box>
            <TextField
              label="직책명"
              value={formData.positionName || ''}
              onChange={(e) => handleChange('positionName', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              size="small"
              placeholder="직책명을 입력하세요 (최대 50자)"
              required
              error={!!errors.positionName}
              helperText={errors.positionName}
              inputProps={{
                maxLength: MAX_POSITION_NAME_LENGTH
              }}
            />
          </Box>

          {/* 본부구분 */}
          <Box>
            <TextField
              label="본부구분"
              value={formData.headquarters || ''}
              onChange={(e) => handleChange('headquarters', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              size="small"
              select
              required
              error={!!errors.headquarters}
              helperText={errors.headquarters}
            >
              {HEADQUARTERS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* 부서명 */}
          <Box>
            <TextField
              label="부서명"
              value={formData.departmentName || ''}
              onChange={(e) => handleChange('departmentName', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              size="small"
              placeholder="부서명을 입력하세요 (최대 100자)"
              required
              error={!!errors.departmentName}
              helperText={errors.departmentName}
              inputProps={{
                maxLength: MAX_DEPARTMENT_NAME_LENGTH
              }}
            />
          </Box>

          {/* 부정명 */}
          <Box>
            <TextField
              label="부정명"
              value={formData.divisionName || ''}
              onChange={(e) => handleChange('divisionName', e.target.value)}
              fullWidth
              disabled={isReadOnly}
              variant="outlined"
              size="small"
              placeholder="부정명을 입력하세요 (최대 100자)"
              required
              error={!!errors.divisionName}
              helperText={errors.divisionName}
              inputProps={{
                maxLength: MAX_DIVISION_NAME_LENGTH
              }}
            />
          </Box>

          {/* 메타 정보 (상세보기일 때만 표시) */}
          {mode === 'detail' && position && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>등록일:</strong> {position.registrationDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>등록자:</strong> {position.registrar}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>수정일:</strong> {position.modificationDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>수정자:</strong> {position.modifier}
              </Typography>
            </Box>
          )}
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

export default PositionFormModal;
