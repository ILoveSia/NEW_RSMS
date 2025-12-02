/**
 * 결재선 상세 모달 컴포넌트
 *
 * @description 결재선 등록/수정/조회를 위한 모달 컴포넌트
 * - PositionFormModal 스타일 100% 준수
 * - 테마 시스템 적용 (DialogTitle)
 * - 결재선 단계 추가/삭제 기능 포함
 *
 * @author Claude AI
 * @since 2025-12-02
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Typography,
  Box,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import type { ColDef } from 'ag-grid-community';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { EmployeeLookupModal } from '@/shared/components/organisms/EmployeeLookupModal';
import type { Employee } from '@/shared/components/organisms/EmployeeLookupModal';
import type {
  ApprovalLine as ApprovalLineType,
  ApprovalLineFormData,
  ApprovalLineStep,
  UseYN
} from '../../types/approvalLine.types';
import {
  WORK_TYPE_OPTIONS,
} from '../../types/approvalLine.types';

/**
 * 결재유형 옵션
 */
const APPROVAL_TYPE_OPTIONS = [
  { value: 'DRAFT', label: '기안' },
  { value: 'REVIEW', label: '검토' },
  { value: 'APPROVE', label: '승인' },
  { value: 'FINAL', label: '최종승인' }
];

/**
 * 결재자유형 옵션
 */
const APPROVER_TYPE_OPTIONS = [
  { value: 'USER', label: '사용자' },
  { value: 'POSITION', label: '직책' },
  { value: 'DEPT', label: '부서' }
];

interface ApprovalLineDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail' | 'edit';
  itemData: ApprovalLineType | null;
  onClose: () => void;
  onSave?: (data: ApprovalLineFormData, steps: ApprovalLineStep[]) => Promise<void>;
  onUpdate?: (data: ApprovalLineFormData, steps: ApprovalLineStep[]) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

const ApprovalLineDetailModal: React.FC<ApprovalLineDetailModalProps> = ({
  open,
  mode,
  itemData,
  onClose,
  onSave,
  onUpdate,
  onRefresh,
  loading = false
}) => {
  // 폼 상태 (백엔드 DTO와 매칭)
  const [formData, setFormData] = useState<ApprovalLineFormData>({
    name: '',
    workType: 'WRS',
    popupTitle: '',
    isEditable: 'Y',
    isUsed: 'Y',
    remarks: ''
  });

  // 수정 모드 상태 (PositionFormModal 패턴)
  const [isEditing, setIsEditing] = useState(false);

  // 결재선 단계 목록
  const [approvalSteps, setApprovalSteps] = useState<ApprovalLineStep[]>([]);

  // 선택된 단계
  const [selectedStep, setSelectedStep] = useState<ApprovalLineStep | null>(null);

  // 사원조회 팝업 상태
  const [employeeLookupOpen, setEmployeeLookupOpen] = useState(false);

  // 폼 에러 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 읽기 전용 여부 (PositionFormModal 패턴)
  const isReadOnly = mode === 'detail' && !isEditing;

  // 결재선 단계 컬럼 정의 (삭제 버튼 포함)
  const stepColumns = useMemo<ColDef<ApprovalLineStep>[]>(() => [
    {
      field: 'stepOrder',
      headerName: '순서',
      width: 70,
      sortable: false,
      cellStyle: { textAlign: 'center' as const }
    },
    {
      field: 'stepName',
      headerName: '단계명',
      width: 100,
      sortable: false,
      cellStyle: { fontWeight: 500 }
    },
    {
      field: 'approvalTypeCd',
      headerName: '결재유형',
      width: 90,
      sortable: false,
      valueFormatter: (params) => {
        const option = APPROVAL_TYPE_OPTIONS.find(o => o.value === params.value);
        return option?.label || params.value;
      },
      cellStyle: { textAlign: 'center' as const }
    },
    {
      field: 'approverTypeCd',
      headerName: '결재자유형',
      width: 90,
      sortable: false,
      valueFormatter: (params) => {
        const option = APPROVER_TYPE_OPTIONS.find(o => o.value === params.value);
        return option?.label || params.value;
      },
      cellStyle: { textAlign: 'center' as const }
    },
    {
      field: 'approverName',
      headerName: '결재자',
      flex: 1,
      sortable: false
    },
    {
      field: 'isRequired',
      headerName: '필수',
      width: 60,
      sortable: false,
      cellRenderer: (params: any) => (
        <span style={{
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          backgroundColor: params.value === 'Y' ? '#dcfce7' : '#fef2f2',
          color: params.value === 'Y' ? '#166534' : '#dc2626'
        }}>
          {params.value === 'Y' ? '필수' : '선택'}
        </span>
      ),
      cellStyle: { textAlign: 'center' as const }
    }
  ], []);

  // 모달이 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        // 등록 모드: 초기화 (기본 기안 단계 추가)
        setFormData({
          name: '',
          workType: 'WRS',
          popupTitle: '',
          isEditable: 'Y',
          isUsed: 'Y',
          remarks: ''
        });
        setIsEditing(true);
        setErrors({});
        // 기본 기안 단계 추가
        setApprovalSteps([{
          id: `step_${Date.now()}`,
          stepOrder: 1,
          stepName: '기안',
          approvalTypeCd: 'DRAFT',
          approverTypeCd: 'USER',
          approverName: '기안자',
          isRequired: 'Y'
        }]);
        setSelectedStep(null);
      } else if (itemData) {
        // 상세/수정 모드: API에서 받은 데이터 로드
        setFormData({
          name: itemData.name,
          workType: itemData.workType,
          popupTitle: itemData.popupTitle,
          isEditable: itemData.isEditable,
          isUsed: itemData.isUsed,
          remarks: itemData.remarks || ''
        });
        setIsEditing(false);
        setErrors({});
        // API에서 받은 결재 단계 로드
        setApprovalSteps(itemData.steps || []);
        setSelectedStep(null);
      }
    }
  }, [open, mode, itemData]);

  // 모달 제목
  const title = mode === 'create' ? '결재선 등록' : '결재선 상세';

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

  // Switch 변경 핸들러 (백엔드 필드에 맞게 isEditable, isUsed만 지원)
  const handleSwitchChange = useCallback((field: 'isEditable' | 'isUsed') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value: UseYN = event.target.checked ? 'Y' : 'N';
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * 결재 단계 추가
   */
  const handleAddStep = useCallback(() => {
    const newStepOrder = approvalSteps.length + 1;
    const newStep: ApprovalLineStep = {
      id: `step_${Date.now()}`,
      stepOrder: newStepOrder,
      stepName: `단계${newStepOrder}`,
      approvalTypeCd: newStepOrder === 1 ? 'DRAFT' : 'APPROVE',
      approverTypeCd: 'POSITION',
      approverName: '',
      isRequired: 'Y'
    };
    setApprovalSteps(prev => [...prev, newStep]);
  }, [approvalSteps.length]);

  /**
   * 결재 단계 삭제
   */
  const handleDeleteStep = useCallback(() => {
    if (!selectedStep) return;

    // 기안 단계(1번)는 삭제 불가
    if (selectedStep.stepOrder === 1) {
      alert('기안 단계는 삭제할 수 없습니다.');
      return;
    }

    setApprovalSteps(prev => {
      const filtered = prev.filter(s => s.id !== selectedStep.id);
      // 순서 재정렬
      return filtered.map((step, index) => ({
        ...step,
        stepOrder: index + 1
      }));
    });
    setSelectedStep(null);
  }, [selectedStep]);

  /**
   * 결재 단계 위로 이동
   */
  const handleMoveUp = useCallback(() => {
    if (!selectedStep || selectedStep.stepOrder <= 1) return;

    setApprovalSteps(prev => {
      const newSteps = [...prev];
      const currentIndex = newSteps.findIndex(s => s.id === selectedStep.id);
      if (currentIndex <= 0) return prev;

      // 순서 교환
      const temp = newSteps[currentIndex - 1];
      newSteps[currentIndex - 1] = { ...newSteps[currentIndex], stepOrder: currentIndex };
      newSteps[currentIndex] = { ...temp, stepOrder: currentIndex + 1 };

      return newSteps;
    });
  }, [selectedStep]);

  /**
   * 결재 단계 아래로 이동
   */
  const handleMoveDown = useCallback(() => {
    if (!selectedStep || selectedStep.stepOrder >= approvalSteps.length) return;

    setApprovalSteps(prev => {
      const newSteps = [...prev];
      const currentIndex = newSteps.findIndex(s => s.id === selectedStep.id);
      if (currentIndex >= newSteps.length - 1) return prev;

      // 순서 교환
      const temp = newSteps[currentIndex + 1];
      newSteps[currentIndex + 1] = { ...newSteps[currentIndex], stepOrder: currentIndex + 2 };
      newSteps[currentIndex] = { ...temp, stepOrder: currentIndex + 1 };

      return newSteps;
    });
  }, [selectedStep, approvalSteps.length]);

  /**
   * 단계 선택 핸들러
   */
  const handleStepSelect = useCallback((step: ApprovalLineStep) => {
    setSelectedStep(step);
  }, []);

  /**
   * 선택된 단계 필드 변경
   */
  const handleStepFieldChange = useCallback((field: keyof ApprovalLineStep, value: string) => {
    if (!selectedStep) return;

    setApprovalSteps(prev => prev.map(step =>
      step.id === selectedStep.id
        ? { ...step, [field]: value }
        : step
    ));
    setSelectedStep(prev => prev ? { ...prev, [field]: value } : null);
  }, [selectedStep]);

  /**
   * 사원조회 팝업 열기
   */
  const handleOpenEmployeeLookup = useCallback(() => {
    setEmployeeLookupOpen(true);
  }, []);

  /**
   * 사원조회 팝업 닫기
   */
  const handleCloseEmployeeLookup = useCallback(() => {
    setEmployeeLookupOpen(false);
  }, []);

  /**
   * 사원 선택 핸들러
   * - 선택된 사원 정보로 결재자 ID와 이름 설정
   */
  const handleEmployeeSelect = useCallback((employee: Employee) => {
    if (!selectedStep) return;

    // 결재자 ID(approverId)와 이름(approverName) 모두 설정
    setApprovalSteps(prev => prev.map(step =>
      step.id === selectedStep.id
        ? {
            ...step,
            approverId: employee.employeeId,
            approverName: employee.name
          }
        : step
    ));
    setSelectedStep(prev => prev ? {
      ...prev,
      approverId: employee.employeeId,
      approverName: employee.name
    } : null);

    setEmployeeLookupOpen(false);
  }, [selectedStep]);

  // 폼 유효성 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '결재선명은 필수 항목입니다.';
    }

    if (!formData.popupTitle.trim()) {
      newErrors.popupTitle = 'Popup 제목은 필수 항목입니다.';
    }

    if (approvalSteps.length === 0) {
      newErrors.steps = '최소 1개 이상의 결재 단계가 필요합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, approvalSteps]);

  // 저장 처리
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create' && onSave) {
        await onSave(formData, approvalSteps);
      } else if (isEditing && onUpdate) {
        await onUpdate(formData, approvalSteps);
      }

      // 목록 새로고침
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error('결재선 저장 중 오류 발생:', error);
    }
  }, [mode, formData, approvalSteps, isEditing, validateForm, onSave, onUpdate, onRefresh, onClose]);

  // 수정 버튼 핸들러 (PositionFormModal 패턴)
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 취소 버튼 핸들러 (PositionFormModal 패턴)
  const handleCancel = useCallback(() => {
    if (mode === 'detail' && itemData) {
      // 수정 취소: 원본 데이터로 복원
      setFormData({
        name: itemData.name,
        workType: itemData.workType,
        popupTitle: itemData.popupTitle,
        isEditable: itemData.isEditable,
        isUsed: itemData.isUsed,
        remarks: itemData.remarks || ''
      });
      // API에서 받은 결재 단계로 복원
      setApprovalSteps(itemData.steps || []);
      setIsEditing(false);
      setSelectedStep(null);
    } else {
      onClose();
    }
  }, [mode, itemData, onClose]);

  if (!open) return null;

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
      {/* 헤더 - PositionFormModal 스타일 (테마 적용) */}
      <DialogTitle
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600,
          py: 1.5
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>{title}</span>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* 컨텐츠 - PositionFormModal 스타일 */}
      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 기본 정보 섹션 */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
            기본 정보
          </Typography>

          {/* 결재선명 */}
          <TextField
            label="결재선명"
            value={formData.name}
            onChange={handleFieldChange('name')}
            required
            disabled={isReadOnly}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            size="small"
          />

          {/* 업무구분 + Popup 제목 (한 줄) */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <FormControl size="small" disabled={isReadOnly} sx={{ minWidth: 150 }}>
              <InputLabel>업무구분 *</InputLabel>
              <Select
                value={formData.workType}
                label="업무구분 *"
                onChange={handleFieldChange('workType')}
              >
                {WORK_TYPE_OPTIONS.filter(option => option.value !== '').map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Popup 제목"
              value={formData.popupTitle}
              onChange={handleFieldChange('popupTitle')}
              required
              disabled={isReadOnly}
              error={!!errors.popupTitle}
              helperText={errors.popupTitle}
              fullWidth
              size="small"
            />
          </Box>

          {/* 설정 영역 (Switch 그룹) */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            p: 1,
            bgcolor: '#f5f5f5',
            borderRadius: 1
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isEditable === 'Y'}
                  onChange={handleSwitchChange('isEditable')}
                  disabled={isReadOnly}
                  size="small"
                />
              }
              label="수정가능"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isUsed === 'Y'}
                  onChange={handleSwitchChange('isUsed')}
                  disabled={isReadOnly}
                  size="small"
                />
              }
              label="사용여부"
            />
          </Box>

          {/* 비고 */}
          <TextField
            label="비고"
            value={formData.remarks}
            onChange={handleFieldChange('remarks')}
            disabled={isReadOnly}
            fullWidth
            size="small"
            multiline
            rows={2}
          />

          {/* 결재선 단계 섹션 */}
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                결재선 단계 ({approvalSteps.length}개)
                {errors.steps && (
                  <Typography component="span" sx={{ color: 'error.main', fontSize: '0.75rem', ml: 1 }}>
                    {errors.steps}
                  </Typography>
                )}
              </Typography>

              {/* 단계 관리 버튼들 (등록/수정 모드에서만 표시) */}
              {!isReadOnly && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="위로 이동">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleMoveUp}
                        disabled={!selectedStep || selectedStep.stepOrder <= 1}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="아래로 이동">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleMoveDown}
                        disabled={!selectedStep || selectedStep.stepOrder >= approvalSteps.length}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="단계 추가">
                    <IconButton size="small" onClick={handleAddStep} color="primary">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="단계 삭제">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleDeleteStep}
                        disabled={!selectedStep || selectedStep.stepOrder === 1}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* 결재선 단계 DataGrid */}
            <Box sx={{ width: '100%', height: '180px' }}>
              <BaseDataGrid
                data={approvalSteps}
                columns={stepColumns}
                rowSelection={isReadOnly ? 'none' : 'single'}
                pagination={false}
                height="180px"
                onRowClick={!isReadOnly ? handleStepSelect : undefined}
              />
            </Box>

            {/* 선택된 단계 편집 영역 (등록/수정 모드에서만 표시) */}
            {!isReadOnly && selectedStep && (
              <Box sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: '#f8f9fa',
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', color: '#555' }}>
                  선택된 단계 편집 (순서: {selectedStep.stepOrder})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    label="단계명"
                    value={selectedStep.stepName}
                    onChange={(e) => handleStepFieldChange('stepName', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>결재유형</InputLabel>
                    <Select
                      value={selectedStep.approvalTypeCd}
                      label="결재유형"
                      onChange={(e) => handleStepFieldChange('approvalTypeCd', e.target.value as string)}
                    >
                      {APPROVAL_TYPE_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>결재자유형</InputLabel>
                    <Select
                      value={selectedStep.approverTypeCd}
                      label="결재자유형"
                      onChange={(e) => handleStepFieldChange('approverTypeCd', e.target.value as string)}
                    >
                      {APPROVER_TYPE_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="결재자"
                    value={selectedStep.approverName || ''}
                    onChange={(e) => handleStepFieldChange('approverName', e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 150 }}
                    placeholder="직책명 또는 사용자명"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="사원 조회">
                            <IconButton
                              size="small"
                              onClick={handleOpenEmployeeLookup}
                              edge="end"
                              sx={{ p: 0.5 }}
                            >
                              <SearchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <InputLabel>필수</InputLabel>
                    <Select
                      value={selectedStep.isRequired}
                      label="필수"
                      onChange={(e) => handleStepFieldChange('isRequired', e.target.value as string)}
                    >
                      <MenuItem value="Y">필수</MenuItem>
                      <MenuItem value="N">선택</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </Box>

          {/* 시스템 정보 (상세 모드에서만 표시) */}
          {mode === 'detail' && itemData && (
            <Box sx={{
              mt: 1,
              p: 1.5,
              bgcolor: '#fafafa',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                시스템 정보
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                  생성: {itemData.createdAt} ({itemData.createdBy})
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                  수정: {itemData.updatedAt} ({itemData.updatedBy})
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* 버튼 영역 - PositionFormModal 패턴 */}
      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          // 등록 모드
          <>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </>
        ) : (
          // 상세/수정 모드
          <>
            {isEditing ? (
              // 수정 중
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </>
            ) : (
              // 조회 상태
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

      {/* 사원조회 팝업 */}
      <EmployeeLookupModal
        open={employeeLookupOpen}
        onClose={handleCloseEmployeeLookup}
        onSelect={handleEmployeeSelect}
        title="결재자 선택"
      />
    </Dialog>
  );
};

export default ApprovalLineDetailModal;
