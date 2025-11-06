/**
 * 책무 등록/상세 모달 (기본 정보만)
 * - 책무상세, 관리의무 등록 부분은 제외
 * - 책무 기본 정보만 처리
 */

import { getPositionsByLedgerOrderId, type PositionDto } from '@/domains/resps/api/positionApi';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { Button } from '@/shared/components/atoms/Button';
import { useCommonCode } from '@/shared/hooks';
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
import type { ResponsibilityFormData } from '../../types/responsibility.types';

interface ResponsibilityFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  responsibility: any | null;
  onClose: () => void;
  onSave: (formData: ResponsibilityFormData) => Promise<void>;
  onUpdate: (cd: string, formData: ResponsibilityFormData) => Promise<void>;
  loading?: boolean;
}

const ResponsibilityFormModal: React.FC<ResponsibilityFormModalProps> = ({
  open,
  mode,
  responsibility,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 공통코드 조회
  const responsibilityCategoryCode = useCommonCode('RSBT_OBLG_CLCD'); // 책무카테고리

  // 직책 관련 상태
  const [availablePositions, setAvailablePositions] = useState<PositionDto[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<ResponsibilityFormData>({
    ledgerOrderId: '',
    positionsId: null,
    responsibilityCat: '',
    responsibilityInfo: '',
    responsibilityLegal: '',
    expirationDate: '',
    responsibilityStatus: '정상',
    isActive: 'Y'
  });

  // 수정 모드 상태 (상세 모달에서 수정 버튼 클릭 시 true)
  const [isEditing, setIsEditing] = useState(false);

  // 모달 제목
  const modalTitle = mode === 'create' ? '책무 등록' : '책무 상세';

  // 읽기 전용 모드 (상세 모드이면서 수정중이 아닐 때)
  const isReadOnly = mode === 'detail' && !isEditing;

  // 원장차수 변경 시 직책 목록 조회
  useEffect(() => {
    const fetchPositionsByLedger = async () => {
      if (!formData.ledgerOrderId) {
        console.log('[ResponsibilityFormModal] 원장차수가 선택되지 않음. 직책 목록 초기화');
        setAvailablePositions([]);
        return;
      }

      console.log('[ResponsibilityFormModal] 원장차수:', formData.ledgerOrderId, '로 직책 목록 조회 시작');
      setIsLoadingPositions(true);
      try {
        const positionDtos = await getPositionsByLedgerOrderId(formData.ledgerOrderId);
        console.log('[ResponsibilityFormModal] 직책 목록 조회 성공:', positionDtos.length, '개');
        setAvailablePositions(positionDtos);
      } catch (error) {
        console.error('[ResponsibilityFormModal] 직책 목록 조회 실패:', error);
        toast.error('직책 목록을 불러오는데 실패했습니다.');
        setAvailablePositions([]);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchPositionsByLedger();
  }, [formData.ledgerOrderId]);

  // 상세 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'detail' && responsibility && open) {
      console.log('🔍 [ResponsibilityFormModal] 상세 데이터 로드:', responsibility);
      setFormData({
        ledgerOrderId: responsibility.ledgerOrderId || '',
        positionsId: responsibility.positionsId || null,
        responsibilityCat: responsibility.responsibilityCat || '',
        responsibilityInfo: responsibility.responsibilityInfo || '',
        responsibilityLegal: responsibility.responsibilityLegal || '',
        expirationDate: responsibility.expirationDate || '',
        responsibilityStatus: responsibility.responsibilityStatus || '정상',
        isActive: responsibility.isActive || 'Y'
      });
    }
  }, [mode, responsibility, open]);

  // 폼 리셋
  const handleReset = useCallback(() => {
    setFormData({
      ledgerOrderId: '',
      positionsId: null,
      responsibilityCat: '',
      responsibilityInfo: '',
      responsibilityLegal: '',
      expirationDate: '',
      responsibilityStatus: '정상',
      isActive: 'Y'
    });
    setIsEditing(false); // 수정 모드 초기화
  }, []);

  // 닫기
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // 입력 변경 핸들러
  const handleChange = useCallback((field: keyof ResponsibilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 수정 버튼 클릭 핸들러
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 취소 버튼 클릭 핸들러 (상세 모드에서 수정 중)
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // 원본 데이터로 복원
    if (responsibility) {
      setFormData({
        ledgerOrderId: responsibility.ledgerOrderId || '',
        positionsId: responsibility.positionsId || null,
        responsibilityCat: responsibility.responsibilityCat || '',
        responsibilityInfo: responsibility.responsibilityInfo || '',
        responsibilityLegal: responsibility.responsibilityLegal || '',
        expirationDate: responsibility.expirationDate || '',
        responsibilityStatus: responsibility.responsibilityStatus || '정상',
        isActive: responsibility.isActive || 'Y'
      });
    }
  }, [responsibility]);

  // 저장/제출 핸들러
  const handleSubmit = useCallback(async () => {
    // 유효성 검사
    if (!formData.ledgerOrderId) {
      toast.warning('원장차수를 선택해주세요.');
      return;
    }
    if (formData.positionsId === null || formData.positionsId === undefined) {
      toast.warning('직책을 선택해주세요.');
      return;
    }
    if (!formData.responsibilityCat) {
      toast.warning('책무카테고리를 선택해주세요.');
      return;
    }
    if (!formData.responsibilityInfo) {
      toast.warning('책무내용을 입력해주세요.');
      return;
    }
    if (!formData.responsibilityLegal) {
      toast.warning('책무관련근거를 입력해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        await onSave(formData);
      } else {
        // 상세 모드에서 수정
        await onUpdate(responsibility.responsibilityCd, formData);
        setIsEditing(false); // 수정 완료 후 읽기 모드로 전환
      }
      handleClose();
    } catch (error) {
      console.error('[ResponsibilityFormModal] 저장 실패:', error);
    }
  }, [mode, formData, responsibility, onSave, onUpdate, handleClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '500px'
        }
      }}
      aria-labelledby="responsibility-modal-title"
    >
      <DialogTitle
        id="responsibility-modal-title"
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
          {/* 원장차수 */}
          <LedgerOrderComboBox
            value={formData.ledgerOrderId}
            onChange={(value) => handleChange('ledgerOrderId', value || '')}
            label="원장차수"
            required
            disabled={isReadOnly}
            size="small"
          />

          {/* 직책 */}
          <FormControl fullWidth size="small" required disabled={isReadOnly || isLoadingPositions}>
            <InputLabel>직책</InputLabel>
            <Select
              value={formData.positionsId || ''}
              onChange={(e) => {
                const value = e.target.value;
                handleChange('positionsId', value === '' ? null : Number(value));
              }}
              label="직책"
            >
              <MenuItem value="">선택하세요</MenuItem>
              {availablePositions.map((position) => (
                <MenuItem key={position.positionsId} value={position.positionsId}>
                  {position.positionsName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 책무카테고리 */}
          <FormControl fullWidth size="small" required disabled={isReadOnly}>
            <InputLabel>책무카테고리</InputLabel>
            <Select
              value={formData.responsibilityCat}
              onChange={(e) => handleChange('responsibilityCat', e.target.value)}
              label="책무카테고리"
            >
              {responsibilityCategoryCode.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 책무내용 */}
          <TextField
            fullWidth
            size="small"
            label="책무내용"
            required
            disabled={isReadOnly}
            value={formData.responsibilityInfo}
            onChange={(e) => handleChange('responsibilityInfo', e.target.value)}
            multiline
            rows={3}
          />

          {/* 책무관련근거 */}
          <TextField
            fullWidth
            size="small"
            label="책무관련근거"
            required
            disabled={isReadOnly}
            value={formData.responsibilityLegal}
            onChange={(e) => handleChange('responsibilityLegal', e.target.value)}
            multiline
            rows={3}
          />

          {/* 상태 및 사용여부 (한 줄) */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* 상태 */}
            <FormControl fullWidth size="small" disabled={isReadOnly}>
              <InputLabel>상태</InputLabel>
              <Select
                value={formData.responsibilityStatus}
                onChange={(e) => handleChange('responsibilityStatus', e.target.value)}
                label="상태"
              >
                <MenuItem value="정상">정상</MenuItem>
                <MenuItem value="만료">만료</MenuItem>
                <MenuItem value="중단">중단</MenuItem>
              </Select>
            </FormControl>

            {/* 사용여부 */}
            <FormControl fullWidth size="small" disabled={isReadOnly}>
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
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
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

export default ResponsibilityFormModal;
