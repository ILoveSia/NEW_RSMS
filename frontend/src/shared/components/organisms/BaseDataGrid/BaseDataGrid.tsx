import React, { useMemo, useCallback, useState } from 'react';
import {
  AgGridReact,
  AgGridReactProps
} from 'ag-grid-react';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  GridApi,
  ColumnApi,
  SelectionChangedEvent,
  CellClickedEvent,
  RowDoubleClickedEvent
} from 'ag-grid-community';
import { Box, CircularProgress, Typography } from '@mui/material';
import clsx from 'clsx';

// AG-Grid CSS imports
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { LoadingSpinner } from '../../atoms/LoadingSpinner';
import styles from './BaseDataGrid.module.scss';

export interface BaseDataGridProps<TData = any> extends Omit<AgGridReactProps, 'columnDefs' | 'rowData'> {
  /** 테이블 데이터 */
  data?: TData[];
  /** 컬럼 정의 */
  columns: ColDef<TData>[];
  /** 로딩 상태 */
  loading?: boolean;
  /** 높이 (CSS 값) */
  height?: string | number;
  /** 테마 */
  theme?: 'rsms' | 'alpine' | 'balham' | 'material';
  /** 페이지네이션 활성화 */
  pagination?: boolean;
  /** 페이지 크기 */
  pageSize?: number;
  /** 페이지 크기 옵션 */
  pageSizeOptions?: number[];
  /** 행 선택 모드 */
  rowSelection?: 'single' | 'multiple' | 'none';
  /** 체크박스 선택 */
  checkboxSelection?: boolean;
  /** 헤더 체크박스 선택 */
  headerCheckboxSelection?: boolean;
  /** 필터 활성화 */
  enableFilter?: boolean;
  /** 정렬 활성화 */
  enableSorting?: boolean;
  /** 컬럼 리사이즈 활성화 */
  enableColumnResize?: boolean;
  /** 컬럼 재정렬 활성화 */
  enableColumnReorder?: boolean;
  /** 행 클릭 이벤트 */
  onRowClick?: (data: TData, event: CellClickedEvent<TData>) => void;
  /** 행 더블클릭 이벤트 */
  onRowDoubleClick?: (data: TData, event: RowDoubleClickedEvent<TData>) => void;
  /** 선택 변경 이벤트 */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 에러 상태 */
  error?: string;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * BaseDataGrid - AG-Grid를 래핑한 확장 가능한 데이터 그리드 컴포넌트
 * 
 * UI 디자인 적용 시 CSS 변수와 테마만 교체하면 됨
 * 
 * @example
 * // 기본 사용
 * <BaseDataGrid 
 *   data={users} 
 *   columns={userColumns}
 *   pagination
 *   rowSelection="multiple"
 * />
 * 
 * // 이벤트 처리
 * <BaseDataGrid 
 *   data={items}
 *   columns={columns}
 *   onRowClick={handleRowClick}
 *   onSelectionChange={handleSelection}
 * />
 */
const BaseDataGrid = <TData = any,>({
  data = [],
  columns,
  loading = false,
  height = 400,
  theme = 'alpine',
  pagination = false,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  rowSelection = 'none',
  checkboxSelection = false,
  headerCheckboxSelection = false,
  enableFilter = true,
  enableSorting = true,
  enableColumnResize = true,
  enableColumnReorder = true,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  emptyMessage = '데이터가 없습니다',
  error,
  className,
  'data-testid': dataTestId = 'base-data-grid',
  ...gridProps
}: BaseDataGridProps<TData>) => {
  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);

  // 컬럼 정의에 체크박스 선택 추가 (맨 앞에 위치)
  const finalColumns = useMemo<ColDef<TData>[]>(() => {
    if (!checkboxSelection) return columns;

    const checkboxCol: ColDef<TData> = {
      headerCheckboxSelection: headerCheckboxSelection && rowSelection === 'multiple',
      checkboxSelection: true,
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      resizable: false,
      sortable: false,
      filter: false,
      suppressMenu: true,
      headerName: '',
    };

    // 체크박스는 항상 맨 앞에 위치
    return [checkboxCol, ...columns];
  }, [columns, checkboxSelection, headerCheckboxSelection, rowSelection]);

  // 기본 Grid Options
  const defaultGridOptions = useMemo<GridOptions<TData>>(() => ({
    // 기본 설정
    animateRows: true,
    enableRangeSelection: true,
    suppressRowClickSelection: checkboxSelection,
    rowMultiSelectWithClick: rowSelection === 'multiple',
    
    // 페이지네이션
    pagination: pagination,
    paginationPageSize: pageSize,
    paginationPageSizeSelector: pageSizeOptions,
    
    // 선택 모드
    rowSelection: rowSelection === 'none' ? undefined : rowSelection,
    
    // 필터 및 정렬
    enableFilter: enableFilter,
    enableSorting: enableSorting,
    
    // 컬럼 조작
    enableColResize: enableColumnResize,
    enableColumnReorder: enableColumnReorder,
    
    // 로케일 (한국어)
    localeText: {
      // 페이지네이션
      page: '페이지',
      more: '더보기',
      to: '~',
      of: '/',
      next: '다음',
      last: '마지막',
      first: '처음',
      previous: '이전',
      loadingOoo: '로딩 중...',
      
      // 필터
      filterOoo: '필터...',
      equals: '같음',
      notEqual: '같지 않음',
      contains: '포함',
      notContains: '포함하지 않음',
      startsWith: '시작',
      endsWith: '끝',
      
      // 기타
      noRowsToShow: emptyMessage,
    },
  }), [
    checkboxSelection, 
    rowSelection, 
    pagination, 
    pageSize, 
    pageSizeOptions,
    enableFilter,
    enableSorting,
    enableColumnResize,
    enableColumnReorder,
    emptyMessage
  ]);

  // Grid 준비 완료 이벤트
  const onGridReady = useCallback((params: GridReadyEvent<TData>) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    
    // 컬럼 자동 크기 조정
    params.api.sizeColumnsToFit();
  }, []);

  // 행 클릭 이벤트
  const onCellClicked = useCallback((event: CellClickedEvent<TData>) => {
    if (event.data && onRowClick) {
      onRowClick(event.data, event);
    }
  }, [onRowClick]);

  // 행 더블클릭 이벤트
  const onRowDoubleClicked = useCallback((event: RowDoubleClickedEvent<TData>) => {
    if (event.data && onRowDoubleClick) {
      onRowDoubleClick(event.data, event);
    }
  }, [onRowDoubleClick]);

  // 선택 변경 이벤트
  const onSelectionChanged = useCallback((event: SelectionChangedEvent<TData>) => {
    if (onSelectionChange) {
      const selectedRows = event.api.getSelectedRows();
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange]);

  // 테마 클래스명
  const themeClass = `ag-theme-${theme}`;

  // 에러 상태 렌더링
  if (error) {
    return (
      <Box
        className={clsx(styles.container, styles.errorState, className)}
        style={{ height }}
        data-testid={`${dataTestId}-error`}
      >
        <Typography variant="body1" color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  // 로딩 상태 렌더링
  if (loading) {
    return (
      <Box
        className={clsx(styles.container, styles.loadingState, className)}
        style={{ height }}
        data-testid={`${dataTestId}-loading`}
      >
        <LoadingSpinner centered text="데이터를 불러오는 중..." />
      </Box>
    );
  }

  return (
    <Box
      className={clsx(
        styles.container,
        themeClass,
        className
      )}
      style={{ height }}
      data-testid={dataTestId}
    >
      <AgGridReact<TData>
        {...gridProps}
        rowData={data}
        columnDefs={finalColumns}
        gridOptions={defaultGridOptions}
        onGridReady={onGridReady}
        onCellClicked={onCellClicked}
        onRowDoubleClicked={onRowDoubleClicked}
        onSelectionChanged={onSelectionChanged}
        className={styles.grid}
      />
    </Box>
  );
};

export default BaseDataGrid;