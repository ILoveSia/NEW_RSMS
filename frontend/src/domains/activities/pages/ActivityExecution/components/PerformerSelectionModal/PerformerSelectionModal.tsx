/**
 * 수행자 지정 모달
 * - InspectorSelectionModal을 기반으로 "점검자" → "수행자"로 용어 변경
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { ColDef } from 'ag-grid-community';
import type { ActivityExecution } from '../../types/activityExecution.types';

// 수행자 타입 정의
export interface Performer {
  id: string;
  name: string;
  department: string;
  position: string;
  specialtyArea: string;
  type: 'INTERNAL' | 'EXTERNAL';
  isActive: boolean;
}

// 수행자 지정 폼 데이터
export interface PerformerAssignFormData {
  performerId: string;
  assignmentReason: string;
  estimatedDate: string;
}

// 수행자 선택 상태
interface PerformerSelectionState {
  selectedType: 'INTERNAL' | 'EXTERNAL';
  searchKeyword: string;
  performers: Performer[];
  selectedPerformer: Performer | null;
  loading: boolean;
}

interface PerformerSelectionModalProps {
  open: boolean;
  activity: ActivityExecution | null;
  activities: ActivityExecution[];  // 선택된 여러 항목들
  onClose: () => void;
  onSelect: (activities: ActivityExecution[], performer: Performer, formData: PerformerAssignFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  assignmentReason: yup
    .string()
    .max(200, '지정 사유는 200자 이내로 입력해주세요'),
  estimatedDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
});

// 수행자 목록 컬럼 정의
const performerColumns: ColDef<Performer>[] = [
  {
    headerName: '이름',
    field: 'name',
    width: 100,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '부서',
    field: 'department',
    flex: 1,
    minWidth: 130,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '직급',
    field: 'position',
    width: 100,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '전문영역',
    field: 'specialtyArea',
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  }
];

const PerformerSelectionModal: React.FC<PerformerSelectionModalProps> = ({
  open,
  activity,
  activities,
  onClose,
  onSelect,
  loading = false
}) => {

  // State for performer selection
  const [selectionState, setSelectionState] = useState<PerformerSelectionState>({
    selectedType: 'INTERNAL',
    searchKeyword: '',
    performers: [],
    selectedPerformer: null,
    loading: false
  });

  // Form setup (간단한 검증용)
  const {
    handleSubmit,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      assignmentReason: '',
      estimatedDate: ''
    }
  });

  // Mock data for performers
  const mockPerformers: Performer[] = useMemo(() => [
    {
      id: 'PERFORMER_001',
      name: '이신혁',
      department: '기획팀',
      position: '대리',
      specialtyArea: '시스템',
      type: 'INTERNAL',
      isActive: true
    },
    {
      id: 'PERFORMER_002',
      name: '김철수',
      department: '개발팀',
      position: '과장',
      specialtyArea: '보안',
      type: 'INTERNAL',
      isActive: true
    },
    {
      id: 'PERFORMER_003',
      name: '박영희',
      department: '운영팀',
      position: '차장',
      specialtyArea: '운영',
      type: 'INTERNAL',
      isActive: true
    },
    {
      id: 'PERFORMER_004',
      name: '최외부',
      department: '외부감사법인',
      position: '수석감사원',
      specialtyArea: '감사',
      type: 'EXTERNAL',
      isActive: true
    },
    {
      id: 'PERFORMER_005',
      name: '정외부',
      department: '컨설팅회사',
      position: '시니어컨설턴트',
      specialtyArea: '컨설팅',
      type: 'EXTERNAL',
      isActive: true
    }
  ], []);

  // Filter performers based on search only
  const filteredPerformers = useMemo(() => {
    let filtered = mockPerformers.filter(performer => performer.isActive);

    if (selectionState.searchKeyword.trim()) {
      const keyword = selectionState.searchKeyword.toLowerCase();
      filtered = filtered.filter(performer =>
        performer.name.toLowerCase().includes(keyword) ||
        performer.department.toLowerCase().includes(keyword) ||
        performer.position.toLowerCase().includes(keyword) ||
        performer.specialtyArea.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  }, [mockPerformers, selectionState.searchKeyword]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset();
      setSelectionState(prev => ({
        ...prev,
        selectedPerformer: null,
        searchKeyword: ''
      }));
    }
  }, [open, activity, reset]);

  // Handle search
  const handleSearch = useCallback(() => {
    // 실제로는 API 호출
    setSelectionState(prev => ({ ...prev, loading: true }));
    setTimeout(() => {
      setSelectionState(prev => ({ ...prev, loading: false }));
    }, 300);
  }, []);

  // Handle performer selection (행 선택 변경)
  const handlePerformerSelect = useCallback((selectedRows: Performer[]) => {
    if (selectedRows.length > 0) {
      setSelectionState(prev => ({
        ...prev,
        selectedPerformer: selectedRows[0]
      }));
    } else {
      setSelectionState(prev => ({
        ...prev,
        selectedPerformer: null
      }));
    }
  }, []);

  // Handle row click (행 클릭)
  const handleRowClick = useCallback((data: Performer) => {
    setSelectionState(prev => ({
      ...prev,
      selectedPerformer: data
    }));
  }, []);

  // Handle row double click (행 더블클릭으로 빠른 선택)
  const handleRowDoubleClick = useCallback((data: Performer) => {
    if (data && activities && activities.length > 0) {
      const submitData: PerformerAssignFormData = {
        performerId: data.id,
        assignmentReason: '',
        estimatedDate: ''
      };
      onSelect(activities, data, submitData);
    }
  }, [activities, onSelect]);

  // Handle form submission
  const onSubmit = useCallback((formData: any) => {
    if (!selectionState.selectedPerformer) return;
    if (!activities || activities.length === 0) return;

    const submitData: PerformerAssignFormData = {
      performerId: selectionState.selectedPerformer.id,
      assignmentReason: formData.assignmentReason || '',
      estimatedDate: formData.estimatedDate || ''
    };

    onSelect(activities, selectionState.selectedPerformer, submitData);
  }, [activities, selectionState.selectedPerformer, onSelect]);

  const modalTitle = `수행자 지정 (${activities?.length || 0}건)`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '80vh'
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
        {modalTitle}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 선택된 항목 개수 표시 */}
          {activities && activities.length > 0 && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'primary.main' }}>
              선택된 항목: {activities.length}건
            </Typography>
          )}

          {/* 수행자 검색 */}
          <TextField
            fullWidth
            size="small"
            placeholder="수행자 이름, 부서, 직급, 전문영역으로 검색"
            value={selectionState.searchKeyword}
            onChange={(e) => setSelectionState(prev => ({ ...prev, searchKeyword: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* 수행자 목록 그리드 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
              수행자 목록 ({filteredPerformers.length}건)
            </Typography>
            <Box sx={{ width: '100%', height: '350px' }}>
              <BaseDataGrid
                data={filteredPerformers}
                columns={performerColumns}
                loading={selectionState.loading}
                rowSelection="single"
                selectedRows={selectionState.selectedPerformer ? [selectionState.selectedPerformer] : []}
                onSelectionChange={handlePerformerSelect}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                height="350px"
                emptyMessage="조회된 수행자가 없습니다."
                theme="alpine"
                pagination={false}
              suppressHorizontalScroll={false}
              suppressColumnVirtualisation={false}
              />
            </Box>
          </Box>

          {/* 선택된 수행자 정보 표시 */}
          {selectionState.selectedPerformer && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                선택된 수행자
              </Typography>
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectionState.selectedPerformer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {selectionState.selectedPerformer.department} · {selectionState.selectedPerformer.position}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontSize: '0.875rem' }}>
                  전문영역: {selectionState.selectedPerformer.specialtyArea}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!selectionState.selectedPerformer || loading}
        >
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PerformerSelectionModal.displayName = 'PerformerSelectionModal';

export default PerformerSelectionModal;
