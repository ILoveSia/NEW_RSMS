/**
 * 직책 등록/수정/상세 모달
 * LedgerFormModal 표준 템플릿 기반
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  MenuItem,
  Grid
} from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { Button } from '@/shared/components/atoms/Button';
import type { Position, PositionFormData } from '../../types/position.types';

// AG-Grid 스타일 import
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Domain Components
import { PositionNameComboBox } from '../../../../components/molecules/PositionNameComboBox';

// 한글 글자수 계산 유틸리티 (한글 1자 = 1자)
const getKoreanLength = (str: string): number => {
  return str.length;
};

// 본부명 옵션
const HEADQUARTERS_OPTIONS = [
  { value: '본부부서', label: '본부부서' },
  { value: '팀단위', label: '팀단위' },
  { value: '지점', label: '지점' },
  { value: '사업소', label: '사업소' }
];

// DataGrid 행 데이터 타입
interface DepartmentRow {
  id: string;
  positionName: string;
  headquarters: string;
  departmentName: string;
}

// Mock 데이터
const MOCK_DEPARTMENT_DATA: DepartmentRow[] = [
  { id: '1', positionName: '경영진단본부장', headquarters: '본부부서', departmentName: '경영진단본부' },
  { id: '2', positionName: '총합기획부장', headquarters: '본부부서', departmentName: '총합기획부' },
  { id: '3', positionName: '영업본부장', headquarters: '본부부서', departmentName: '영업본부' },
  { id: '4', positionName: '기술개발팀장', headquarters: '팀단위', departmentName: '기술개발부' },
  { id: '5', positionName: '마케팅팀장', headquarters: '팀단위', departmentName: '마케팅부' }
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
    headquarters: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    positionName: '',
    headquarters: ''
  });

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        positionName: '',
        headquarters: ''
      });
      setIsEditing(true);
      setErrors({ positionName: '', headquarters: '' });
    } else if (position) {
      setFormData({
        positionName: position.positionName,
        headquarters: position.headquarters
      });
      setIsEditing(false);
      setErrors({ positionName: '', headquarters: '' });
    }
  }, [mode, position]);

  const handleChange = useCallback((field: keyof PositionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // 제출 전 최종 검증
    if (!formData.positionName?.trim()) {
      setErrors(prev => ({ ...prev, positionName: '직책명을 선택해주세요.' }));
      return;
    }
    if (!formData.headquarters?.trim()) {
      setErrors(prev => ({ ...prev, headquarters: '본부명을 선택해주세요.' }));
      return;
    }

    if (errors.positionName || errors.headquarters) {
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
        headquarters: position.headquarters
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, position, onClose]);

  const title = mode === 'create' ? '직책 등록' : '직책 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

  // DataGrid 컬럼 정의
  const columnDefs = useMemo<ColDef<DepartmentRow>[]>(() => [
    {
      field: 'positionName',
      headerName: '직책',
      flex: 1.5,
      minWidth: 120
    },
    {
      field: 'headquarters',
      headerName: '본부명',
      flex: 1,
      minWidth: 100
    },
    {
      field: 'departmentName',
      headerName: '부서명',
      flex: 1.5,
      minWidth: 120
    }
  ], []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '500px'
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

          {/* 직책명 - 공통 컴포넌트 사용 */}
          <PositionNameComboBox
            value={formData.positionName}
            onChange={(value) => handleChange('positionName', value || '')}
            label="직책명"
            required
            disabled={isReadOnly}
            error={!!errors.positionName}
            helperText={errors.positionName}
            fullWidth
            size="small"
          />

          {/* 본부명 */}
          <Box>
            <TextField
              label="본부명"
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

          {/* DataGrid - 부서 목록 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              부서 목록
            </Typography>
            <div className="ag-theme-alpine" style={{ height: '200px', width: '100%' }}>
              <AgGridReact<DepartmentRow>
                rowData={MOCK_DEPARTMENT_DATA}
                columnDefs={columnDefs}
                domLayout="normal"
                headerHeight={40}
                rowHeight={35}
                suppressMovableColumns={true}
                suppressCellFocus={true}
                animateRows={true}
              />
            </div>
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
