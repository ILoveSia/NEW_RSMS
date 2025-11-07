/**
 * 공통 직원조회팝업 컴포넌트
 * 여러 도메인에서 공통으로 사용하는 직원 선택 팝업
 *
 * 주요 기능:
 * - 직원 목록 조회 및 검색
 * - AG-Grid를 통한 직원 표시 (직번, 직원명, 부점, 직급, 상태)
 * - 행 선택 및 선택 버튼 클릭으로 직원 선택
 * - 행 더블클릭으로 빠른 선택
 * - 단일 선택 모드 지원
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { ColDef } from 'ag-grid-community';
import { toast } from 'react-toastify';

import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import Button from '@/shared/components/atoms/Button';
import { useEmployeeLookup } from './hooks/useEmployeeLookup';
import type {
  Employee,
  EmployeeLookupFilters,
  EmployeeLookupModalProps
} from './types/employeeLookup.types';
import styles from './EmployeeLookupModal.module.scss';

/**
 * 공통 직원조회팝업 컴포넌트
 */
const EmployeeLookupModal: React.FC<EmployeeLookupModalProps> = ({
  open,
  onClose,
  onSelect,
  title = '직원 조회 팝업',
  initialFilters = {}
}) => {
  // ===== Custom Hook =====
  const {
    employees,
    loading: searchLoading,
    error,
    searchEmployees,
    clearResults,
    totalCount
  } = useEmployeeLookup();

  // ===== Local State =====
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState<EmployeeLookupFilters>({
    name: '',
    employeeId: '',
    department: '',
    branchCode: '',
    ...initialFilters
  });

  const loading = searchLoading;

  // ===== 검색 필드 정의 =====
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'name',
      type: 'text',
      label: '직원명',
      placeholder: '직원명을 입력하세요',
      gridSize: { xs: 12, sm: 12, md: 12 }
    }
  ], []);

  // ===== AG-Grid 컬럼 정의 =====
  const columnDefs = useMemo<ColDef<Employee>[]>(() => [
    {
      headerName: '직번',
      field: 'employeeId',
      width: 100,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      headerName: '직원명',
      field: 'name',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center'
    },
    {
      headerName: '부점명',
      field: 'branchName',
      flex: 1,
      minWidth: 130,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center'
    },
    {
      headerName: '직급',
      field: 'department',
      width: 100,
      sortable: true,
      filter: true,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    }
  ], []);

  // ===== Event Handlers =====

  /**
   * 검색 버튼 클릭 핸들러
   */
  async function handleSearch() {
    await searchEmployees(filters);
  }

  /**
   * 필터 변경 핸들러
   */
  const handleFiltersChange = useCallback((newFilters: Partial<EmployeeLookupFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 필터 초기화 핸들러
   */
  const handleClearFilters = useCallback(() => {
    const clearedFilters: EmployeeLookupFilters = {
      name: '',
      employeeId: '',
      department: '',
      branchCode: ''
    };
    setFilters(clearedFilters);
    clearResults();
    setSelectedEmployee(null);
  }, [clearResults]);

  /**
   * 행 선택 변경 핸들러
   */
  const handleSelectionChange = useCallback((selectedRows: Employee[]) => {
    if (selectedRows.length > 0) {
      setSelectedEmployee(selectedRows[0]);
    } else {
      setSelectedEmployee(null);
    }
  }, []);

  /**
   * 행 더블클릭 핸들러 (빠른 선택)
   */
  const handleRowDoubleClick = useCallback((data: Employee) => {
    if (data) {
      onSelect(data);
      onClose();
    }
  }, [onSelect, onClose]);

  /**
   * 선택 버튼 클릭 핸들러
   */
  const handleSelectClick = useCallback(() => {
    if (selectedEmployee) {
      onSelect(selectedEmployee);
      onClose();
    } else {
      toast.warning('직원을 선택해주세요.');
    }
  }, [selectedEmployee, onSelect, onClose]);

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = useCallback(() => {
    setSelectedEmployee(null);
    onClose();
  }, [onClose]);

  // ===== Effects =====

  /**
   * 다이얼로그 열릴 때 직원 목록 조회
   */
  useEffect(() => {
    if (open) {
      handleSearch();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setSelectedEmployee(null);
      clearResults();
    }
  }, [open]);

  // ===== 렌더링 =====
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className={styles.modal}
      PaperProps={{
        className: styles.modalPaper
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle className={styles.modalTitle}>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon className={styles.titleIcon} />
          <Typography variant="h6" component="span" className={styles.titleText}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          className={styles.closeButton}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 모달 콘텐츠 */}
      <DialogContent dividers className={styles.modalContent}>
        {/* 검색 필터 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<EmployeeLookupFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loading}
            showClearButton={false}
          />
        </div>

        {/* 검색 결과 정보 */}
        <div className={styles.resultInfo}>
          <Typography variant="body2" className={styles.resultText}>
            <SearchIcon className={styles.resultIcon} />
            직원 목록 ({totalCount}건)
          </Typography>
        </div>

        {/* 직원 목록 그리드 */}
        <div className={styles.gridSection}>
          {loading ? (
            <Box className={styles.loadingBox}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                직원 목록을 불러오는 중...
              </Typography>
            </Box>
          ) : (
            <BaseDataGrid
              data={employees}
              columns={columnDefs}
              rowSelection="single"
              onSelectionChange={handleSelectionChange}
              onRowClick={(data) => setSelectedEmployee(data)}
              onRowDoubleClick={handleRowDoubleClick}
              height="350px"
              emptyMessage="조회된 직원이 없습니다."
              theme="alpine"
              pagination={false}
            />
          )}
        </div>

        {/* 선택된 직원 정보 */}
        {selectedEmployee && (
          <Box className={styles.selectedInfo}>
            <Typography variant="body2" color="primary" fontWeight={500}>
              선택된 직원: {selectedEmployee.name}
              {selectedEmployee.branchName && ` (${selectedEmployee.branchName})`}
            </Typography>
          </Box>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Box className={styles.errorMessage}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions className={styles.modalActions}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSelectClick}
          disabled={!selectedEmployee || loading}
          startIcon="Check"
        >
          확인
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          startIcon="Close"
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(EmployeeLookupModal);
