import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

import type {
  ReportImprovement,
  ReportImprovementFormData,
  ReportImprovementStatus,
  Priority
} from '../../types/reportImprovement.types';

import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  INSPECTION_NAME_OPTIONS,
  STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP
} from '../../types/reportImprovement.types';


interface ReportImprovementDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail' | 'edit';
  itemData?: ReportImprovement | null;
  onClose: () => void;
  onSave: (data: ReportImprovementFormData) => void;
  onUpdate: (id: string, data: ReportImprovementFormData) => void;
  loading?: boolean;
}

const ReportImprovementDetailModal: React.FC<ReportImprovementDetailModalProps> = ({
  open,
  mode,
  itemData,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<ReportImprovementFormData>({
    department: '',
    departmentCode: '',
    inspectionName: '',
    inspectionRound: '',
    requestDate: '',
    requester: '',
    requesterPosition: '',
    reportId: '',
    reportTitle: '',
    inadequateContent: '',
    improvementPlan: '',
    improvementContent: '',
    priority: undefined,
    dueDate: '',
    assignee: '',
    assigneePosition: '',
    attachments: [],
    evidenceFiles: []
  });

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 폼 데이터 초기화
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        department: '',
        departmentCode: '',
        inspectionName: '',
        inspectionRound: '',
        requestDate: new Date().toISOString().split('T')[0],
        requester: '',
        requesterPosition: '',
        reportId: '',
        reportTitle: '',
        inadequateContent: '',
        improvementPlan: '',
        improvementContent: '',
        priority: undefined,
        dueDate: '',
        assignee: '',
        assigneePosition: '',
        attachments: [],
        evidenceFiles: []
      });
      setIsEditing(true);
    } else if (itemData) {
      setFormData({
        department: itemData.department || '',
        departmentCode: itemData.departmentCode || '',
        inspectionName: itemData.inspectionName || '',
        inspectionRound: itemData.inspectionRound || '',
        requestDate: itemData.requestDate || '',
        requester: itemData.requester || '',
        requesterPosition: itemData.requesterPosition || '',
        reportId: itemData.reportId || '',
        reportTitle: itemData.reportTitle || '',
        inadequateContent: itemData.inadequateContent || '',
        improvementPlan: itemData.improvementPlan || '',
        improvementContent: itemData.improvementContent || '',
        priority: itemData.priority,
        dueDate: itemData.dueDate || '',
        assignee: itemData.assignee || '',
        assigneePosition: itemData.assigneePosition || '',
        attachments: itemData.attachments || [],
        evidenceFiles: itemData.evidenceFiles || []
      });
      setIsEditing(mode === 'edit');
    }
  }, [mode, itemData, open]);

  // 입력 값 변경 핸들러
  const handleInputChange = useCallback((field: keyof ReportImprovementFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    if (mode === 'create') {
      onSave(formData);
    } else if (itemData?.id) {
      onUpdate(itemData.id, formData);
    }
  }, [mode, formData, itemData?.id, onSave, onUpdate]);

  // 편집 모드 토글
  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  // 모달 제목 결정
  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return '보고서 개선이행 등록';
      case 'edit':
        return '보고서 개선이행 수정';
      default:
        return '보고서 개선이행 상세';
    }
  };

  // 상태별 칩 색상 반환
  const getStatusChip = (status: ReportImprovementStatus) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return (
      <Chip
        label={statusOption?.label || status}
        size="small"
        sx={{
          backgroundColor: STATUS_COLOR_MAP[status] || '#6B7280',
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // 우선순위별 칩 색상 반환
  const getPriorityChip = (priority?: Priority) => {
    if (!priority) return null;
    const priorityOption = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return (
      <Chip
        label={priorityOption?.label || priority}
        size="small"
        sx={{
          backgroundColor: PRIORITY_COLOR_MAP[priority] || '#6B7280',
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      
    >
        <DialogTitle >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              {getModalTitle()}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              {itemData && (
                <>
                  {getStatusChip(itemData.status)}
                  {getPriorityChip(itemData.priority)}
                </>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent >
          <Grid container spacing={3}>
            {/* 기본 정보 섹션 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" >
                기본 정보
              </Typography>
              <Divider />
            </Grid>

            {/* 부서 정보 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="부서"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="부품코드"
                value={formData.departmentCode}
                onChange={(e) => handleInputChange('departmentCode', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            {/* 점검 정보 */}
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>점검명</InputLabel>
                <Select
                  value={formData.inspectionName}
                  label="점검명"
                  onChange={(e) => handleInputChange('inspectionName', e.target.value)}
                >
                  {INSPECTION_NAME_OPTIONS.filter(opt => opt.value !== '').map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="점검회차"
                value={formData.inspectionRound}
                onChange={(e) => handleInputChange('inspectionRound', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            {/* 요청자 정보 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="개선요청자"
                value={formData.requester}
                onChange={(e) => handleInputChange('requester', e.target.value)}
                disabled={!isEditing}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="요청자 직책"
                value={formData.requesterPosition}
                onChange={(e) => handleInputChange('requesterPosition', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            {/* 날짜 정보 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="개선요청일자"
                type="date"
                value={formData.requestDate}
                onChange={(e) => handleInputChange('requestDate', e.target.value)}
                disabled={!isEditing}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="완료예정일"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                disabled={!isEditing}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* 보고서 정보 섹션 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" >
                보고서 정보
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="보고서 ID"
                value={formData.reportId}
                onChange={(e) => handleInputChange('reportId', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="보고서 제목"
                value={formData.reportTitle}
                onChange={(e) => handleInputChange('reportTitle', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            {/* 부적정 내용 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="부적정 내용"
                value={formData.inadequateContent}
                onChange={(e) => handleInputChange('inadequateContent', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            {/* 개선 정보 섹션 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" >
                개선 정보
              </Typography>
              <Divider />
            </Grid>

            {/* 개선계획 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="개선계획"
                value={formData.improvementPlan}
                onChange={(e) => handleInputChange('improvementPlan', e.target.value)}
                disabled={!isEditing}
                required
              />
            </Grid>

            {/* 개선내용 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="개선내용"
                value={formData.improvementContent}
                onChange={(e) => handleInputChange('improvementContent', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            {/* 우선순위 및 담당자 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={formData.priority || ''}
                  label="우선순위"
                  onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                >
                  {PRIORITY_OPTIONS.filter(opt => opt.value !== '').map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="담당자"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="담당자 직책"
                value={formData.assigneePosition}
                onChange={(e) => handleInputChange('assigneePosition', e.target.value)}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions >
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            variant="outlined"
          >
            취소
          </Button>

          {mode === 'detail' && !isEditing && (
            <Button
              onClick={handleEditToggle}
              startIcon={<EditIcon />}
              variant="outlined"
              color="primary"
            >
              수정
            </Button>
          )}

          {(mode === 'create' || isEditing) && (
            <Button
              onClick={handleSave}
              startIcon={<SaveIcon />}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {mode === 'create' ? '등록' : '저장'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
  );
};

export default ReportImprovementDetailModal;