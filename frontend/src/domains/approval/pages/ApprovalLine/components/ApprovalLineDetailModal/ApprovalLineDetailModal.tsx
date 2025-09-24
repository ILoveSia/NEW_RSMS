/**
 * 결재선 상세 모달 컴포넌트
 *
 * @description 결재선 등록/수정/조회를 위한 모달 컴포넌트
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 *
 * @features
 * - 결재선 등록, 수정, 상세 조회
 * - 폼 유효성 검증
 * - 8가지 브랜드 테마 지원
 * - 반응형 디자인
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Button } from '@/shared/components/atoms/Button';
import { useTranslation } from 'react-i18next';
import type {
  ApprovalLine as ApprovalLineType,
  ApprovalLineFormData,
  WorkType,
  UseYN
} from '../../types/approvalLine.types';
import {
  WORK_TYPE_OPTIONS,
  USE_YN_OPTIONS
} from '../../types/approvalLine.types';
import styles from './ApprovalLineDetailModal.module.scss';

interface ApprovalLineDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail' | 'edit';
  itemData: ApprovalLineType | null;
  onClose: () => void;
  onSave?: (data: ApprovalLineFormData) => Promise<void>;
  onUpdate?: (data: ApprovalLineFormData) => Promise<void>;
  loading?: boolean;
}

const ApprovalLineDetailModal: React.FC<ApprovalLineDetailModalProps> = ({
  open,
  mode,
  itemData,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('approval');

  // 폼 상태
  const [formData, setFormData] = useState<ApprovalLineFormData>({
    name: '',
    workType: 'WRS',
    popupTitle: '',
    url: '',
    description: '',
    isPopup: 'Y',
    isEditable: 'Y',
    isUsed: 'Y',
    remarks: ''
  });

  // 폼 에러 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 모달이 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        setFormData({
          name: '',
          workType: 'WRS',
          popupTitle: '',
          url: '',
          description: '',
          isPopup: 'Y',
          isEditable: 'Y',
          isUsed: 'Y',
          remarks: ''
        });
        setErrors({});
      } else if (itemData) {
        setFormData({
          name: itemData.name,
          workType: itemData.workType,
          popupTitle: itemData.popupTitle,
          url: itemData.url,
          description: itemData.description || '',
          isPopup: itemData.isPopup,
          isEditable: itemData.isEditable,
          isUsed: itemData.isUsed,
          remarks: itemData.remarks || ''
        });
        setErrors({});
      }
    }
  }, [open, mode, itemData]);

  // 모달 제목 결정
  const modalTitle = useMemo(() => {
    switch (mode) {
      case 'create':
        return '결재선 등록';
      case 'edit':
        return '결재선 수정';
      default:
        return '결재선 상세 정보';
    }
  }, [mode]);

  // 읽기 전용 여부
  const isReadonly = mode === 'detail';

  // 폼 필드 변경 핸들러
  const handleFieldChange = useCallback((field: keyof ApprovalLineFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value as string;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Switch 변경 핸들러
  const handleSwitchChange = useCallback((field: 'isPopup' | 'isEditable' | 'isUsed') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value: UseYN = event.target.checked ? 'Y' : 'N';
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 폼 유효성 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!formData.name.trim()) {
      newErrors.name = '결재선명은 필수 항목입니다.';
    }

    if (!formData.popupTitle.trim()) {
      newErrors.popupTitle = 'Popup 제목은 필수 항목입니다.';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL은 필수 항목입니다.';
    }

    // URL 형식 검증 (선택적)
    if (formData.url && !formData.url.includes('/')) {
      newErrors.url = '올바른 URL 형식을 입력하세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 저장 처리
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create' && onSave) {
        await onSave(formData);
      } else if (mode === 'edit' && onUpdate) {
        await onUpdate(formData);
      }
    } catch (error) {
      console.error('결재선 저장 중 오류 발생:', error);
    }
  }, [mode, formData, validateForm, onSave, onUpdate]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={styles.dialog}
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleContent}>
          <div className={styles.titleMain}>
            <AccountTreeIcon className={styles.titleIcon} />
            <div>
              <Typography variant="h6" className={styles.title}>
                {modalTitle}
              </Typography>
              {itemData && (
                <Typography variant="body2" className={styles.subtitle}>
                  결재선ID: {itemData.id} | {itemData.workType}
                </Typography>
              )}
            </div>
          </div>
          <IconButton
            onClick={onClose}
            className={styles.closeButton}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <Grid container spacing={3}>
          {/* 기본 정보 섹션 */}
          <Grid item xs={12}>
            <Box className={styles.sectionTitle}>
              <Typography variant="h6">기본 정보</Typography>
            </Box>
          </Grid>

          {/* 결재선명 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="결재선명 *"
              value={formData.name}
              onChange={handleFieldChange('name')}
              disabled={isReadonly || loading}
              error={!!errors.name}
              helperText={errors.name}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* 업무 구분 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>업무 구분 *</InputLabel>
              <Select
                value={formData.workType}
                label="업무 구분 *"
                onChange={handleFieldChange('workType')}
                disabled={isReadonly || loading}
              >
                {WORK_TYPE_OPTIONS.filter(option => option.value !== '').map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Popup 제목 */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Popup 제목 *"
              value={formData.popupTitle}
              onChange={handleFieldChange('popupTitle')}
              disabled={isReadonly || loading}
              error={!!errors.popupTitle}
              helperText={errors.popupTitle}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* URL */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="URL *"
              value={formData.url}
              onChange={handleFieldChange('url')}
              disabled={isReadonly || loading}
              error={!!errors.url}
              helperText={errors.url}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* 설명 */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="설명"
              value={formData.description}
              onChange={handleFieldChange('description')}
              disabled={isReadonly || loading}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
          </Grid>

          {/* 설정 섹션 */}
          <Grid item xs={12}>
            <Box className={styles.sectionTitle} style={{ marginTop: '20px' }}>
              <Typography variant="h6">설정</Typography>
            </Box>
          </Grid>

          {/* 팝업여부 */}
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPopup === 'Y'}
                  onChange={handleSwitchChange('isPopup')}
                  disabled={isReadonly || loading}
                />
              }
              label="팝업여부"
            />
          </Grid>

          {/* 수정기능여부 */}
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isEditable === 'Y'}
                  onChange={handleSwitchChange('isEditable')}
                  disabled={isReadonly || loading}
                />
              }
              label="수정기능여부"
            />
          </Grid>

          {/* 사용여부 */}
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isUsed === 'Y'}
                  onChange={handleSwitchChange('isUsed')}
                  disabled={isReadonly || loading}
                />
              }
              label="사용여부"
            />
          </Grid>

          {/* 비고 */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="비고"
              value={formData.remarks}
              onChange={handleFieldChange('remarks')}
              disabled={isReadonly || loading}
              variant="outlined"
              size="small"
              multiline
              rows={3}
            />
          </Grid>

          {/* 시스템 정보 (상세 보기에서만 표시) */}
          {mode === 'detail' && itemData && (
            <>
              <Grid item xs={12}>
                <Box className={styles.sectionTitle} style={{ marginTop: '20px' }}>
                  <Typography variant="h6">시스템 정보</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="생성일시"
                  value={itemData.createdAt}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="수정일시"
                  value={itemData.updatedAt}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="생성자"
                  value={itemData.createdBy}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="수정자"
                  value={itemData.updatedBy}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          {mode === 'detail' ? '닫기' : '취소'}
        </Button>
        {(mode === 'create' || mode === 'edit') && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          >
            {mode === 'create' ? '등록' : '수정'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalLineDetailModal;