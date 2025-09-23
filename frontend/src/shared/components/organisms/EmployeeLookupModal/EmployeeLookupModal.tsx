import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import type { ColDef } from 'ag-grid-community';

import { Button } from '@/shared/components/atoms/Button';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { useEmployeeLookup } from './hooks/useEmployeeLookup';
import type {
  Employee,
  EmployeeLookupModalProps,
  EmployeeLookupFilters
} from './types/employeeLookup.types';
import styles from './EmployeeLookupModal.module.scss';

/**
 * 직원조회팝업 컴포넌트
 * 여러 도메인에서 공통으로 사용하는 직원 선택 팝업
 */
const EmployeeLookupModal: React.FC<EmployeeLookupModalProps> = ({
  open,
  title = '직원 조회 팝업',
  multiple = false,
  onClose,
  onSelect,
  onConfirm,
  onCancel,
  initialFilters = {},
  excludeEmployeeIds = [],
  loading: externalLoading = false,
  showActiveOnly = true
}) => {
  const {
    employees,
    loading: searchLoading,
    error,
    searchEmployees,
    clearResults,
    totalCount
  } = useEmployeeLookup();

  // Local state
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState<EmployeeLookupFilters>({
    name: '',
    employeeId: '',
    department: '',
    branchCode: '',
    ...initialFilters
  });

  const loading = searchLoading || externalLoading;

  // AG-Grid 컬럼 정의
  const columns = useMemo<ColDef<Employee>[]>(() => [
    {
      field: 'employeeId',
      headerName: '직번',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '600', color: '#1976d2' }
    },
    {
      field: 'name',
      headerName: '직원명',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'branchCode',
      headerName: '부점코드',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { color: '#ed6c02', fontWeight: '500' }
    },
    {
      field: 'branchName',
      headerName: '부점명',
      width: 130,
      minWidth: 110,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center'
    },
    {
      field: 'department',
      headerName: '직급',
      width: 80,
      minWidth: 60,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { color: '#7b1fa2', fontWeight: '500' }
    },
    {
      field: 'status',
      headerName: '상태',
      width: 80,
      minWidth: 60,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const employee = params.data as Employee;
        return (
          <Chip
            label={employee.status === 'ACTIVE' ? '재직' : '퇴직'}
            size="small"
            color={employee.status === 'ACTIVE' ? 'success' : 'default'}
            variant="outlined"
          />
        );
      }
    }
  ], []);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<EmployeeLookupFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  async function handleSearch() {
    await searchEmployees(filters);
  }

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'name',
      type: 'text',
      label: '직원명',
      placeholder: '직원명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 6 }
    },
    {
      key: 'employeeId',
      type: 'text',
      label: '직번',
      placeholder: '직번을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 6 }
    },
    {
      key: 'department',
      type: 'text',
      label: '직급',
      placeholder: '직급을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 6 }
    },
    {
      key: 'branchCode',
      type: 'text',
      label: '부점',
      placeholder: '부점을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 6 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleSearch,
        tooltip: '직원 검색'
      }
    }
  ], []);

  // 필터된 직원 목록 (제외할 직원 ID 제거 및 재직자 필터)
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // 제외할 직원 ID 제거
    if (excludeEmployeeIds.length > 0) {
      filtered = filtered.filter(employee => !excludeEmployeeIds.includes(employee.id));
    }

    // 재직자만 표시 옵션
    if (showActiveOnly) {
      filtered = filtered.filter(employee => employee.status === 'ACTIVE');
    }

    return filtered;
  }, [employees, excludeEmployeeIds, showActiveOnly]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: EmployeeLookupFilters = {
      name: '',
      employeeId: '',
      department: '',
      branchCode: ''
    };
    setFilters(clearedFilters);
    clearResults();
    setSelectedEmployees([]);
  }, [clearResults]);

  const handleRowClick = useCallback((employee: Employee) => {
    if (multiple) {
      setSelectedEmployees(prev => {
        const exists = prev.find(item => item.id === employee.id);
        if (exists) {
          return prev.filter(item => item.id !== employee.id);
        } else {
          return [...prev, employee];
        }
      });
    } else {
      setSelectedEmployees([employee]);
    }
  }, [multiple]);

  const handleRowDoubleClick = useCallback((employee: Employee) => {
    if (!multiple) {
      onSelect(employee);
      onClose();
    }
  }, [multiple, onSelect, onClose]);

  const handleSelectionChange = useCallback((selected: Employee[]) => {
    setSelectedEmployees(selected);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedEmployees.length === 0) {
      return;
    }

    const result = multiple ? selectedEmployees : selectedEmployees[0];

    if (onConfirm) {
      onConfirm(result);
    } else {
      onSelect(result);
    }
    onClose();
  }, [selectedEmployees, multiple, onSelect, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedEmployees([]);
    if (onCancel) {
      onCancel();
    }
    onClose();
  }, [onCancel, onClose]);

  // 모달이 열릴 때 초기 검색 실행
  useEffect(() => {
    if (open) {
      handleSearch();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setSelectedEmployees([]);
      clearResults();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
      <DialogContent className={styles.modalContent}>
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
            showClearButton={true}
          />
        </div>

        {/* 검색 결과 정보 */}
        <div className={styles.resultInfo}>
          <Typography variant="body2" className={styles.resultText}>
            <SearchIcon className={styles.resultIcon} />
            직원 목록 ({totalCount}건)
          </Typography>
          {showActiveOnly && (
            <Chip
              label="재직자만 표시"
              size="small"
              color="primary"
              variant="outlined"
              className={styles.filterChip}
            />
          )}
        </div>

        {/* 데이터 그리드 */}
        <div className={styles.gridSection}>
          <BaseDataGrid
            data={filteredEmployees}
            columns={columns}
            loading={loading}
            theme="alpine"
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChange={handleSelectionChange}
            height="400px"
            pagination={true}
            pageSize={20}
            rowSelection={multiple ? "multiple" : "single"}
            checkboxSelection={multiple}
            headerCheckboxSelection={multiple}
            emptyMessage={filteredEmployees.length === 0 && !loading ? "조회된 정보가 없습니다." : undefined}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Box className={styles.errorMessage}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        {/* 선택된 직원 정보 */}
        {selectedEmployees.length > 0 && (
          <Box className={styles.selectionInfo}>
            <Typography variant="body2" className={styles.selectionText}>
              선택된 직원: {selectedEmployees.map(emp => emp.name).join(', ')}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions className={styles.modalActions}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={selectedEmployees.length === 0 || loading}
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