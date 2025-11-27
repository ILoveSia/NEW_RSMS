/**
 * 점검자 지정 모달
 * - 실제 employees 테이블 데이터와 연동
 * - searchEmployees API를 통해 사원 목록 조회
 * - PerformerSelectionModal 패턴 참고하여 구현
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Inspector,
  InspectorAssignment,
  InspectorAssignFormData,
  InspectorSelectionState
} from '../../types/inspectorAssign.types';
import { ColDef } from 'ag-grid-community';

// API 연동
import { searchEmployees } from '@/shared/api/employeeApi';
import type { Employee } from '@/shared/types/employee';

interface InspectorSelectionModalProps {
  open: boolean;
  assignment: InspectorAssignment | null;
  assignments: InspectorAssignment[];  // 선택된 여러 항목들
  onClose: () => void;
  onSelect: (assignments: InspectorAssignment[], inspector: Inspector, formData: InspectorAssignFormData) => void;
  loading?: boolean;
}

// 점검자 목록 컬럼 정의 (이름, 부서, 직급만 표시)
const inspectorColumns: ColDef<Inspector>[] = [
  {
    headerName: '이름',
    field: 'name',
    width: 150,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '부서',
    field: 'department',
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '직급',
    field: 'position',
    width: 150,
    sortable: true,
    filter: true,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  }
];

const InspectorSelectionModal: React.FC<InspectorSelectionModalProps> = ({
  open,
  assignment,
  assignments,
  onClose,
  onSelect,
  loading = false
}) => {

  // State for inspector selection
  const [selectionState, setSelectionState] = useState<InspectorSelectionState>({
    selectedType: 'INTERNAL',
    searchKeyword: '',
    inspectors: [],
    selectedInspector: null,
    loading: false
  });

  /**
   * 실제 사원 데이터를 저장할 state
   * - employees API에서 조회한 데이터를 Inspector 형식으로 변환하여 저장
   */
  const [inspectors, setInspectors] = useState<Inspector[]>([]);

  /**
   * Employee 데이터를 Inspector 형식으로 변환
   * @param employee - API에서 조회한 Employee 데이터
   * @returns Inspector 형식으로 변환된 데이터
   */
  const convertEmployeeToInspector = useCallback((employee: Employee): Inspector => {
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

      // Employee -> Inspector 변환
      const convertedInspectors = employees
        .filter(emp => emp.isActive === 'Y')  // 활성화된 직원만
        .map(convertEmployeeToInspector);

      setInspectors(convertedInspectors);
    } catch (error) {
      console.error('사원 목록 조회 실패:', error);
      setInspectors([]);
    } finally {
      setSelectionState(prev => ({ ...prev, loading: false }));
    }
  }, [convertEmployeeToInspector]);

  /**
   * 검색어로 사원 목록 필터링 (클라이언트 사이드)
   * - API 조회 결과에서 추가적으로 필터링
   */
  const filteredInspectors = useMemo(() => {
    // 검색어가 없으면 전체 목록 반환
    if (!selectionState.searchKeyword.trim()) {
      return inspectors;
    }

    // 클라이언트 사이드 필터링 (추가 검색)
    const keyword = selectionState.searchKeyword.toLowerCase();
    return inspectors.filter(inspector =>
      inspector.name.toLowerCase().includes(keyword) ||
      inspector.department.toLowerCase().includes(keyword) ||
      inspector.position.toLowerCase().includes(keyword)
    );
  }, [inspectors, selectionState.searchKeyword]);

  /**
   * 모달이 열릴 때 초기화 및 사원 데이터 조회
   * - 선택 상태 초기화
   * - 사원 목록 API 호출
   */
  useEffect(() => {
    if (open) {
      setSelectionState(prev => ({
        ...prev,
        selectedInspector: null,
        searchKeyword: ''
      }));
      // 모달 열릴 때 사원 목록 조회
      fetchEmployees();
    }
  }, [open, assignment, fetchEmployees]);

  /**
   * 검색 버튼 클릭 핸들러
   * - 검색어로 API 재조회
   */
  const handleSearch = useCallback(() => {
    fetchEmployees(selectionState.searchKeyword || undefined);
  }, [fetchEmployees, selectionState.searchKeyword]);

  // Handle inspector selection (행 선택 변경)
  const handleInspectorSelect = useCallback((selectedRows: Inspector[]) => {
    if (selectedRows.length > 0) {
      setSelectionState(prev => ({
        ...prev,
        selectedInspector: selectedRows[0]
      }));
    } else {
      setSelectionState(prev => ({
        ...prev,
        selectedInspector: null
      }));
    }
  }, []);

  // Handle row click (행 클릭)
  const handleRowClick = useCallback((data: Inspector) => {
    setSelectionState(prev => ({
      ...prev,
      selectedInspector: data
    }));
  }, []);

  // Handle row double click (행 더블클릭으로 빠른 선택)
  const handleRowDoubleClick = useCallback((data: Inspector) => {
    if (data && assignments && assignments.length > 0) {
      const submitData: InspectorAssignFormData = {
        inspectorId: data.id,
        assignmentReason: '',
        estimatedDate: ''
      };
      onSelect(assignments, data, submitData);
    }
  }, [assignments, onSelect]);

  /**
   * 저장 버튼 클릭 핸들러
   * - 선택된 점검자 정보를 부모 컴포넌트로 전달
   * - impl_inspection_items 테이블의 inspector_id 업데이트
   */
  const handleSave = useCallback(() => {
    // 선택된 점검자 확인
    if (!selectionState.selectedInspector) {
      console.warn('점검자가 선택되지 않았습니다.');
      return;
    }

    // 선택된 항목 목록 확인
    if (!assignments || assignments.length === 0) {
      console.warn('지정할 점검항목이 없습니다.');
      return;
    }

    console.log('✅ [InspectorSelectionModal] 저장 클릭');
    console.log('  - 선택된 점검자:', selectionState.selectedInspector);
    console.log('  - 대상 항목 수:', assignments.length);

    // 폼 데이터 구성
    const submitData: InspectorAssignFormData = {
      inspectorId: selectionState.selectedInspector.id,
      assignmentReason: '',
      estimatedDate: ''
    };

    // 부모 컴포넌트의 onSelect 호출 (API 호출)
    onSelect(assignments, selectionState.selectedInspector, submitData);
  }, [assignments, selectionState.selectedInspector, onSelect]);

  const modalTitle = `점검자 지정 (${assignments?.length || 0}건)`;

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
          {assignments && assignments.length > 0 && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'primary.main' }}>
              선택된 항목: {assignments.length}건
            </Typography>
          )}

          {/* 점검자 검색 */}
          <TextField
            fullWidth
            size="small"
            placeholder="점검자 이름, 부서, 직급으로 검색"
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

          {/* 점검자 목록 그리드 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
              점검자 목록 ({filteredInspectors.length}건)
            </Typography>
            <Box sx={{ width: '100%', height: '350px' }}>
              <BaseDataGrid
                data={filteredInspectors}
                columns={inspectorColumns}
                loading={selectionState.loading}
                rowSelection="single"
                onSelectionChange={handleInspectorSelect}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                height="350px"
                emptyMessage="조회된 점검자가 없습니다."
                theme="alpine"
                pagination={false}
                suppressHorizontalScroll={false}
                suppressColumnVirtualisation={false}
              />
            </Box>
          </Box>

          {/* 선택된 점검자 정보 표시 */}
          {selectionState.selectedInspector && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                선택된 점검자
              </Typography>
              <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectionState.selectedInspector.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {selectionState.selectedInspector.department} · {selectionState.selectedInspector.position}
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
          onClick={handleSave}
          disabled={!selectionState.selectedInspector || loading}
        >
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

InspectorSelectionModal.displayName = 'InspectorSelectionModal';

export default InspectorSelectionModal;
