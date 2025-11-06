/**
 * 책무상세 등록/상세 모달
 * - 책무상세 정보 등록 및 수정
 * - ResponsibilityFormModal 구조 100% 준수
 *
 * @author Claude AI
 * @since 2025-01-06
 */

import { Button } from '@/shared/components/atoms/Button';
import toast from '@/shared/utils/toast';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * 책무상세 Form 데이터
 */
export interface ResponsibilityDetailFormData {
  responsibilityCd: string;  // 책무코드 (FK, 필수)
  responsibilityDetailInfo: string;  // 책무세부내용
  isActive: string;  // 사용여부
}

interface ResponsibilityDetailFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  responsibilityDetail: any | null;
  onClose: () => void;
  onSave: (formData: ResponsibilityDetailFormData) => Promise<void>;
  onUpdate: (cd: string, formData: Omit<ResponsibilityDetailFormData, 'responsibilityCd'>) => Promise<void>;
  loading?: boolean;
  // 신규 등록 시 책무코드 전달받기
  defaultResponsibilityCd?: string;
}

const ResponsibilityDetailFormModal: React.FC<ResponsibilityDetailFormModalProps> = ({
  open,
  mode,
  responsibilityDetail,
  onClose,
  onSave,
  onUpdate,
  loading = false,
  defaultResponsibilityCd = ''
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<ResponsibilityDetailFormData>({
    responsibilityCd: defaultResponsibilityCd,
    responsibilityDetailInfo: '',
    isActive: 'Y'
  });

  // 수정 모드 상태 (상세 모달에서 수정 버튼 클릭 시 true)
  const [isEditing, setIsEditing] = useState(false);

  // 모달 제목
  const modalTitle = mode === 'create' ? '책무상세 등록' : '책무상세 상세';

  // 읽기 전용 모드 (상세 모드이면서 수정중이 아닐 때)
  const isReadOnly = mode === 'detail' && !isEditing;

  // 상세 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'detail' && responsibilityDetail && open) {
      console.log('🔍 [ResponsibilityDetailFormModal] 상세 데이터 로드:', responsibilityDetail);
      setFormData({
        responsibilityCd: responsibilityDetail._original?.responsibilityCd || '',
        responsibilityDetailInfo: responsibilityDetail._original?.responsibilityDetailInfo || '',
        isActive: responsibilityDetail._original?.isActive || 'Y'
      });
    }
  }, [mode, responsibilityDetail, open]);

  // defaultResponsibilityCd 변경 시 반영
  useEffect(() => {
    if (mode === 'create' && defaultResponsibilityCd) {
      setFormData(prev => ({
        ...prev,
        responsibilityCd: defaultResponsibilityCd
      }));
    }
  }, [mode, defaultResponsibilityCd]);

  // 폼 리셋
  const handleReset = useCallback(() => {
    setFormData({
      responsibilityCd: defaultResponsibilityCd,
      responsibilityDetailInfo: '',
      isActive: 'Y'
    });
    setIsEditing(false); // 수정 모드 초기화
  }, [defaultResponsibilityCd]);

  // 닫기
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // 입력 변경 핸들러
  const handleChange = useCallback((field: keyof ResponsibilityDetailFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 저장 버튼 클릭
  const handleSave = useCallback(async () => {
    // 필수 필드 검증
    if (!formData.responsibilityCd) {
      toast.error('책무코드를 입력해주세요.');
      return;
    }

    if (!formData.responsibilityDetailInfo.trim()) {
      toast.error('책무세부내용을 입력해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        await onSave(formData);
      } else if (mode === 'detail' && isEditing) {
        // 수정 모드: 책무세부코드는 URL 파라미터로 전달, responsibilityCd는 수정 불가
        const updateData: Omit<ResponsibilityDetailFormData, 'responsibilityCd'> = {
          responsibilityDetailInfo: formData.responsibilityDetailInfo,
          isActive: formData.isActive
        };
        await onUpdate(responsibilityDetail._original?.responsibilityDetailCd, updateData);
        setIsEditing(false); // 수정 모드 해제
      }
      handleReset();
      onClose();
    } catch (error) {
      console.error('책무상세 저장 실패:', error);
    }
  }, [mode, formData, isEditing, onSave, onUpdate, responsibilityDetail, handleReset, onClose]);

  // 수정 버튼 클릭
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 수정 취소
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    // 원래 데이터로 복원
    if (responsibilityDetail) {
      setFormData({
        responsibilityCd: responsibilityDetail._original?.responsibilityCd || '',
        responsibilityDetailInfo: responsibilityDetail._original?.responsibilityDetailInfo || '',
        isActive: responsibilityDetail._original?.isActive || 'Y'
      });
    }
  }, [responsibilityDetail]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '400px'
        }
      }}
      aria-labelledby="responsibility-detail-modal-title"
    >
      <DialogTitle
        id="responsibility-detail-modal-title"
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
            {modalTitle}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 책무코드 - 등록 모드일 때만 입력 가능, 상세 모드일 때는 읽기 전용 */}
          <TextField
            label="책무코드"
            value={formData.responsibilityCd}
            onChange={(e) => handleChange('responsibilityCd', e.target.value)}
            disabled={isReadOnly || mode === 'detail'}
            required
            fullWidth
            size="small"
          />

          {/* 책무세부내용 */}
          <TextField
            label="책무세부내용"
            value={formData.responsibilityDetailInfo}
            onChange={(e) => handleChange('responsibilityDetailInfo', e.target.value)}
            disabled={isReadOnly}
            required
            fullWidth
            multiline
            rows={4}
            size="small"
            placeholder="책무세부내용을 입력하세요"
          />

          {/* 사용여부 */}
          <FormControl fullWidth size="small" required disabled={isReadOnly}>
            <InputLabel>사용여부</InputLabel>
            <Select
              value={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.value)}
              label="사용여부"
            >
              <MenuItem value="Y">사용</MenuItem>
              <MenuItem value="N">미사용</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </>
        ) : (
          <>
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={handleCancelEdit} disabled={loading}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={handleClose} disabled={loading}>
                  닫기
                </Button>
                <Button variant="contained" onClick={handleEdit} disabled={loading}>
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

export default ResponsibilityDetailFormModal;
