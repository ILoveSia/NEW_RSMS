/**
 * 공통 직원조회 팝업
 * - 여러 화면에서 재사용 가능한 직원 검색 다이얼로그
 * - AG-Grid를 사용한 직원 목록 표시
 * - 검색 필터 기능 제공
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { Employee, EmployeeSearchFilter, EmployeeSelectCallback } from '@/shared/types/employee';
import { ComponentSearchFilter, FilterField } from '@/shared/components/molecules/ComponentSearchFilter';
import employeeApi from '@/shared/api/employeeApi';
import styles from './EmployeeSearchDialog.module.scss';

/**
 * EmployeeSearchDialog Props
 */
interface EmployeeSearchDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 닫기 핸들러 */
  onClose: () => void;
  /** 직원 선택 핸들러 */
  onSelect: EmployeeSelectCallback;
  /** 초기 검색 필터 (옵션) */
  initialFilter?: Partial<EmployeeSearchFilter>;
  /** 다이얼로그 제목 (옵션, 기본값: '직원 검색') */
  title?: string;
  /** 단일 선택 모드 (옵션, 기본값: true) */
  singleSelection?: boolean;
}

/**
 * 공통 직원조회 팝업 컴포넌트
 */
const EmployeeSearchDialog: React.FC<EmployeeSearchDialogProps> = ({
  open,
  onClose,
  onSelect,
  initialFilter = {},
  title = '직원 검색',
  singleSelection = true,
}) => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<EmployeeSearchFilter>(initialFilter);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Ref
  const gridRef = useRef<AgGridReact>(null);

  /**
   * 검색 필드 정의
   */
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'empNo',
      type: 'text',
      label: '직원번호',
      placeholder: '직원번호 입력',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'empName',
      type: 'text',
      label: '직원명',
      placeholder: '직원명 입력',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'orgCode',
      type: 'text',
      label: '조직코드',
      placeholder: '조직코드 입력',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'employmentStatus',
      type: 'select',
      label: '재직상태',
      options: [
        { value: '', label: '전체' },
        { value: 'ACTIVE', label: '재직' },
        { value: 'RESIGNED', label: '퇴사' },
        { value: 'LEAVE', label: '휴직' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    }
  ], []);

  /**
   * AG-Grid 컬럼 정의
   */
  const columnDefs = useMemo<ColDef<Employee>[]>(() => [
    {
      headerName: '직원번호',
      field: 'empNo',
      width: 120,
      sortable: true,
      filter: true,
      cellStyle: { fontWeight: 500 }
    },
    {
      headerName: '직원명',
      field: 'empName',
      width: 120,
      sortable: true,
      filter: true,
      cellStyle: { fontWeight: 500 }
    },
    {
      headerName: '부점명',
      field: 'orgName',
      width: 200,
      sortable: true,
      filter: true
    },
    {
      headerName: '직급',
      field: 'jobGrade',
      width: 100,
      sortable: true,
      filter: true
    },
    {
      headerName: '상태',
      field: 'employmentStatus',
      width: 100,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const statusMap: Record<string, string> = {
          ACTIVE: '재직',
          RESIGNED: '퇴사',
          LEAVE: '휴직'
        };
        return statusMap[params.value] || params.value;
      },
      cellClass: (params: any) => {
        if (params.value === 'ACTIVE') return styles.statusActive;
        if (params.value === 'RESIGNED') return styles.statusResigned;
        if (params.value === 'LEAVE') return styles.statusLeave;
        return '';
      }
    }
  ], []);

  /**
   * 직원 목록 조회
   * - 실제 API를 호출하여 직원 목록을 가져옴
   * - 검색 필터가 변경될 때마다 자동으로 재조회
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const employees = await employeeApi.searchEmployees(searchFilter);
      setEmployees(employees);
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [searchFilter]);

  /**
   * 검색 버튼 클릭 핸들러
   */
  const handleSearch = useCallback((filters: Record<string, any>) => {
    setSearchFilter(filters as EmployeeSearchFilter);
  }, []);

  /**
   * 초기화 버튼 클릭 핸들러
   */
  const handleReset = useCallback(() => {
    setSearchFilter({});
    setSelectedEmployee(null);
  }, []);

  /**
   * Grid Ready 핸들러
   */
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Grid API 준비 완료
  }, []);

  /**
   * Row 선택 핸들러
   */
  const onSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current?.api?.getSelectedRows() || [];
    setSelectedEmployee(selectedRows.length > 0 ? selectedRows[0] : null);
  }, []);

  /**
   * Row 더블클릭 핸들러 (선택 후 바로 닫기)
   */
  const onRowDoubleClicked = useCallback((event: RowDoubleClickedEvent<Employee>) => {
    if (event.data) {
      onSelect(event.data);
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
    }
  }, [selectedEmployee, onSelect, onClose]);

  /**
   * 다이얼로그 열릴 때 직원 목록 조회
   */
  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open, fetchEmployees]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={styles.dialog}
    >
      <DialogTitle className={styles.dialogTitle}>{title}</DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {/* 검색 필터 */}
        <div className={styles.searchSection}>
          <ComponentSearchFilter
            fields={searchFields}
            onSearch={handleSearch}
            onReset={handleReset}
            initialValues={searchFilter}
          />
        </div>

        {/* 데이터 그리드 */}
        <div className={styles.gridSection}>
          <div className="ag-theme-rsms" style={{ height: 400, width: '100%' }}>
            <AgGridReact<Employee>
              ref={gridRef}
              columnDefs={columnDefs}
              rowData={employees}
              rowSelection={singleSelection ? 'single' : 'multiple'}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              onRowDoubleClicked={onRowDoubleClicked}
              pagination={true}
              paginationPageSize={10}
              suppressRowClickSelection={false}
              animateRows={true}
              loading={loading}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true
              }}
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} variant="outlined">
          취소
        </Button>
        <Button
          onClick={handleSelectClick}
          variant="contained"
          color="primary"
          disabled={!selectedEmployee}
        >
          선택
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeSearchDialog;
