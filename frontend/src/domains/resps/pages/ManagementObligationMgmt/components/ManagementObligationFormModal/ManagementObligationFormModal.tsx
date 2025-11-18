/**
 * 관리의무 등록/상세 모달
 * - 관리의무 정보 등록 및 수정
 * - ResponsibilityDetailFormModal 구조 100% 준수
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
 * 관리의무 대분류 코드 목록
 */
const OBLIGATION_MAJOR_CATEGORIES = [
  { code: '00', name: '공통' },
  { code: '01', name: '경영기획' },
  { code: '02', name: '리스크관리' },
  { code: '03', name: '고유' },
  { code: '04', name: '내부감사' },
  { code: '05', name: '인사' },
  { code: '06', name: 'IT' },
  { code: '07', name: '재무' },
  { code: '08', name: '기타' }
];

/**
 * 관리의무 Form 데이터
 */
export interface ManagementObligationFormData {
  responsibilityDetailCd: string;    // 책무세부코드 (FK, 필수)
  obligationMajorCatCd: string;      // 관리의무 대분류 구분코드
  obligationInfo: string;            // 관리의무 내용
  orgCode: string;                   // 조직코드
  isActive: string;                  // 사용여부
}

interface ManagementObligationFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  managementObligation: any | null;
  onClose: () => void;
  onSave: (formData: ManagementObligationFormData) => Promise<void>;
  onUpdate: (cd: string, formData: Omit<ManagementObligationFormData, 'responsibilityDetailCd'>) => Promise<void>;
  loading?: boolean;
  // 신규 등록 시 책무세부코드 전달받기
  defaultResponsibilityDetailCd?: string;
}

const ManagementObligationFormModal: React.FC<ManagementObligationFormModalProps> = ({
  open,
  mode,
  managementObligation,
  onClose,
  onSave,
  onUpdate,
  loading = false,
  defaultResponsibilityDetailCd = ''
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<ManagementObligationFormData>({
    responsibilityDetailCd: defaultResponsibilityDetailCd,
    obligationMajorCatCd: '',
    obligationInfo: '',
    orgCode: '',
    isActive: 'Y'
  });

  // 수정 모드 상태 (상세 모달에서 수정 버튼 클릭 시 true)
  const [isEditing, setIsEditing] = useState(false);

  // 모달 제목
  const modalTitle = mode === 'create' ? '관리의무 등록' : '관리의무 상세';

  // 읽기 전용 모드 (상세 모드이면서 수정중이 아닐 때)
  const isReadOnly = mode === 'detail' && !isEditing;

  // 상세 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'detail' && managementObligation && open) {
      console.log('🔍 [ManagementObligationFormModal] 상세 데이터 로드:', managementObligation);
      setFormData({
        responsibilityDetailCd: managementObligation._original?.responsibilityDetailCd || '',
        obligationMajorCatCd: managementObligation._original?.obligationMajorCatCd || '',
        obligationInfo: managementObligation._original?.obligationInfo || '',
        orgCode: managementObligation._original?.orgCode || '',
        isActive: managementObligation._original?.isActive || 'Y'
      });
    }
  }, [mode, managementObligation, open]);

  // defaultResponsibilityDetailCd 변경 시 반영
  useEffect(() => {
    if (mode === 'create' && defaultResponsibilityDetailCd) {
      setFormData(prev => ({
        ...prev,
        responsibilityDetailCd: defaultResponsibilityDetailCd
      }));
    }
  }, [mode, defaultResponsibilityDetailCd]);

  // 폼 리셋
  const handleReset = useCallback(() => {
    setFormData({
      responsibilityDetailCd: defaultResponsibilityDetailCd,
      obligationMajorCatCd: '',
      obligationInfo: '',
      orgCode: '',
      isActive: 'Y'
    });
    setIsEditing(false); // 수정 모드 초기화
  }, [defaultResponsibilityDetailCd]);

  // 닫기
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // 입력 변경 핸들러
  const handleChange = useCallback((field: keyof ManagementObligationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 저장 버튼 클릭
  const handleSave = useCallback(async () => {
    // 필수 필드 검증
    if (!formData.responsibilityDetailCd) {
      toast.error('책무세부코드를 입력해주세요.');
      return;
    }

    if (!formData.obligationMajorCatCd) {
      toast.error('관리의무 대분류를 선택해주세요.');
      return;
    }

    if (!formData.obligationInfo.trim()) {
      toast.error('관리의무 내용을 입력해주세요.');
      return;
    }

    if (!formData.orgCode) {
      toast.error('조직코드를 입력해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        await onSave(formData);
      } else if (mode === 'detail' && isEditing) {
        // 수정 모드: 관리의무코드는 URL 파라미터로 전달, responsibilityDetailCd는 수정 불가
        const updateData: Omit<ManagementObligationFormData, 'responsibilityDetailCd'> = {
          obligationMajorCatCd: formData.obligationMajorCatCd,
          obligationInfo: formData.obligationInfo,
          orgCode: formData.orgCode,
          isActive: formData.isActive
        };
        await onUpdate(managementObligation._original?.obligationCd, updateData);
        setIsEditing(false); // 수정 모드 해제
      }
      handleReset();
      onClose();
    } catch (error) {
      console.error('관리의무 저장 실패:', error);
    }
  }, [mode, formData, isEditing, onSave, onUpdate, managementObligation, handleReset, onClose]);

  // 수정 버튼 클릭
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 수정 취소
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    // 원래 데이터로 복원
    if (managementObligation) {
      setFormData({
        responsibilityDetailCd: managementObligation._original?.responsibilityDetailCd || '',
        obligationMajorCatCd: managementObligation._original?.obligationMajorCatCd || '',
        obligationInfo: managementObligation._original?.obligationInfo || '',
        orgCode: managementObligation._original?.orgCode || '',
        isActive: managementObligation._original?.isActive || 'Y'
      });
    }
  }, [managementObligation]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '500px',
          width: '600px'
        }
      }}
      aria-labelledby="management-obligation-modal-title"
    >
      {/* 모달 헤더 - 테마 적용 */}
      <DialogTitle
        id="management-obligation-modal-title"
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

      {/* 모달 내용 */}
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 책무세부코드 - 등록 모드일 때만 입력 가능, 상세 모드일 때는 읽기 전용 */}
          <TextField
            label="책무세부코드"
            value={formData.responsibilityDetailCd}
            onChange={(e) => handleChange('responsibilityDetailCd', e.target.value)}
            disabled={isReadOnly || mode === 'detail'}
            required
            fullWidth
            size="small"
          />

          {/* 관리의무 대분류 */}
          <FormControl fullWidth size="small" required disabled={isReadOnly}>
            <InputLabel>관리의무 대분류 구분코드</InputLabel>
            <Select
              value={formData.obligationMajorCatCd}
              onChange={(e) => handleChange('obligationMajorCatCd', e.target.value)}
              label="관리의무 대분류 구분코드"
            >
              <MenuItem value="">
                <em>선택하세요</em>
              </MenuItem>
              {OBLIGATION_MAJOR_CATEGORIES.map((category) => (
                <MenuItem key={category.code} value={category.code}>
                  {category.name}({category.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 관리의무 내용 */}
          <TextField
            label="관리의무 내용"
            value={formData.obligationInfo}
            onChange={(e) => handleChange('obligationInfo', e.target.value)}
            disabled={isReadOnly}
            required
            fullWidth
            multiline
            rows={4}
            size="small"
            placeholder="관리의무 내용을 입력하세요"
          />

          {/* 조직코드 */}
          <TextField
            label="조직코드"
            value={formData.orgCode}
            onChange={(e) => handleChange('orgCode', e.target.value)}
            disabled={isReadOnly}
            required
            fullWidth
            size="small"
            placeholder="조직코드를 입력하세요"
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

      {/* 모달 액션 버튼 - ResponsibilityDetailFormModal과 동일한 순서 */}
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

export default ManagementObligationFormModal;
