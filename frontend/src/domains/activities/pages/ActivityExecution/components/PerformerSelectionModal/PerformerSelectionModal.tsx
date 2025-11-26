/**
 * 수행자 지정 모달
 * - 실제 employees 테이블 데이터와 연동
 * - searchEmployees API를 통해 사원 목록 조회
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
import { searchEmployees } from '@/shared/api/employeeApi';
import type { Employee } from '@/shared/types/employee';

/**
 * 수행자 타입 정의
 * - Employee 타입과 매핑하여 그리드에 표시
 */
export interface Performer {
  id: string;           // empNo (직원번호)
  name: string;         // empName (직원명)
  department: string;   // orgName (조직명)
  position: string;     // jobGrade (직급)
  specialtyArea: string; // jobTitle (직함)
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

  /**
   * 실제 사원 데이터를 저장할 state
   * - employees API에서 조회한 데이터를 Performer 형식으로 변환하여 저장
   */
  const [performers, setPerformers] = useState<Performer[]>([]);

  /**
   * Employee 데이터를 Performer 형식으로 변환
   * @param employee - API에서 조회한 Employee 데이터
   * @returns Performer 형식으로 변환된 데이터
   */
  const convertEmployeeToPerformer = useCallback((employee: Employee): Performer => {
    return {
      id: employee.empNo,
      name: employee.empName,
      department: employee.orgName || employee.orgCode || '-',
      position: employee.jobGrade || '-',
      specialtyArea: employee.jobTitle || '-',
      type: 'INTERNAL',  // employees 테이블은 내부 직원
      isActive: employee.isActive === 'Y'
    };
  }, []);

  /**
   * 사원 목록 조회 API 호출
   * - 검색어로 필터링하여 조회
   */
  const fetchEmployees = useCallback(async (keyword?: string) => {
    setSelectionState(prev => ({ ...prev, loading: true }));
    try {
      // 검색 조건 설정 (빈 객체면 전체 조회)
      const searchFilter = keyword ? { empName: keyword } : {};
      const employees = await searchEmployees(searchFilter);

      // Employee -> Performer 변환
      const convertedPerformers = employees
        .filter(emp => emp.isActive === 'Y')  // 활성화된 직원만
        .map(convertEmployeeToPerformer);

      setPerformers(convertedPerformers);
    } catch (error) {
      console.error('사원 목록 조회 실패:', error);
      setPerformers([]);
    } finally {
      setSelectionState(prev => ({ ...prev, loading: false }));
    }
  }, [convertEmployeeToPerformer]);

  /**
   * 검색어로 사원 목록 필터링 (클라이언트 사이드)
   * - API 조회 결과에서 추가적으로 필터링
   */
  const filteredPerformers = useMemo(() => {
    // 검색어가 없으면 전체 목록 반환
    if (!selectionState.searchKeyword.trim()) {
      return performers;
    }

    // 클라이언트 사이드 필터링 (추가 검색)
    const keyword = selectionState.searchKeyword.toLowerCase();
    return performers.filter(performer =>
      performer.name.toLowerCase().includes(keyword) ||
      performer.department.toLowerCase().includes(keyword) ||
      performer.position.toLowerCase().includes(keyword) ||
      performer.specialtyArea.toLowerCase().includes(keyword)
    );
  }, [performers, selectionState.searchKeyword]);

  /**
   * 모달이 열릴 때 초기화 및 사원 데이터 조회
   * - 폼 리셋
   * - 선택 상태 초기화
   * - 사원 목록 API 호출
   */
  useEffect(() => {
    if (open) {
      reset();
      setSelectionState(prev => ({
        ...prev,
        selectedPerformer: null,
        searchKeyword: ''
      }));
      // 모달 열릴 때 사원 목록 조회
      fetchEmployees();
    }
  }, [open, activity, reset, fetchEmployees]);

  /**
   * 검색 버튼 클릭 핸들러
   * - 검색어로 API 재조회
   */
  const handleSearch = useCallback(() => {
    fetchEmployees(selectionState.searchKeyword || undefined);
  }, [fetchEmployees, selectionState.searchKeyword]);

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
