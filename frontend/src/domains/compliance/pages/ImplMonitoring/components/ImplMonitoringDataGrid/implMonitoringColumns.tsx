/**
 * 이행점검 AG-Grid 컬럼 정의
 * 요구사항에 따른 컬럼: 선택, 순번, 점검명, 점검 수행기간, 활동 대상 기간, 등록일자, 등록자권한, 등록자, 상태
 */

import { ColDef } from 'ag-grid-community';
import { Chip } from '@mui/material';
import { PeriodSetting } from '../../types/implMonitoring.types';

// 상태별 색상 매핑
const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'warning';
    case 'INACTIVE':
      return 'error';
    default:
      return 'default';
  }
};

// 상태별 한글 텍스트 매핑
const getStatusText = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return '시행';
    case 'INACTIVE':
      return '중단';
    case 'DRAFT':
      return '임시';
    default:
      return status || '';
  }
};

/**
 * 이행점검 목록 컬럼 정의
 */
export const implMonitoringColumns: ColDef<PeriodSetting>[] = [
  {
    field: 'sequence',
    headerName: '순번',
    width: 80,
    minWidth: 60,
    maxWidth: 100,
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      return params.value;
    },
    cellStyle: {
      fontWeight: '500'
    }
  },
  {
    field: 'inspectionName',
    headerName: '점검명',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 30 ? `${value.substring(0, 30)}...` : value;
    },
    cellStyle: {
      fontWeight: '500',
      color: '#1976d2'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'inspectionStartDate',
    headerName: '점검 수행기간',
    width: 200,
    minWidth: 150,
    sortable: false,
    filter: false,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const data = params.data;
      if (!data || !data.inspectionStartDate || !data.inspectionEndDate) return '';

      const startDate = data.inspectionStartDate.replace(/-/g, '.');
      const endDate = data.inspectionEndDate.replace(/-/g, '.');
      return `${startDate} ~ ${endDate}`;
    },
    cellStyle: {
      fontFamily: 'monospace',
      color: '#2e7d32',
      fontWeight: '500'
    }
  },
  {
    field: 'activityStartDate',
    headerName: '활동 대상 기간',
    width: 200,
    minWidth: 150,
    sortable: false,
    filter: false,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const data = params.data;
      if (!data || !data.activityStartDate || !data.activityEndDate) return '';

      const startDate = data.activityStartDate.replace(/-/g, '.');
      const endDate = data.activityEndDate.replace(/-/g, '.');
      return `${startDate} ~ ${endDate}`;
    },
    cellStyle: {
      fontFamily: 'monospace',
      color: '#ed6c02',
      fontWeight: '500'
    }
  },
  {
    field: 'registrationDate',
    headerName: '등록일자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '';
      const formattedDate = value.replace(/-/g, '.');
      return formattedDate;
    },
    cellStyle: {
      fontFamily: 'monospace',
      color: '#424242',
      fontWeight: '500'
    },
    filterParams: {
      filterOptions: ['equals', 'greaterThan', 'lessThan', 'inRange'],
      suppressAndOrCondition: true,
      comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        if (!cellValue) return -1;

        const cellDate = new Date(cellValue.replace(/\./g, '-'));

        if (cellDate < filterLocalDateAtMidnight) return -1;
        if (cellDate > filterLocalDateAtMidnight) return 1;
        return 0;
      }
    }
  },
  {
    field: 'registrantAuthority',
    headerName: '등록자권한',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      return params.value;
    },
    cellStyle: {
      fontWeight: '500',
      color: '#7b1fa2'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'registrant',
    headerName: '등록자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      return params.value;
    },
    cellStyle: {
      fontWeight: '500',
      color: '#1976d2'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: { value: string }) => (
      <Chip
        label={getStatusText(params.value)}
        color={getStatusColor(params.value)}
        size="small"
        variant="outlined"
      />
    ),
    filterParams: {
      values: ['시행', '중단', '임시'],
      suppressSorting: true
    }
  }
];

/**
 * AG-Grid 기본 설정
 */
export const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  floatingFilter: false,
  suppressMenu: false,
  menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
  cellStyle: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.5'
  }
};

/**
 * Grid 옵션 설정
 */
export const gridOptions = {
  defaultColDef,
  rowHeight: 50,
  headerHeight: 50,
  rowSelection: 'multiple',
  suppressRowClickSelection: false,
  suppressCellSelection: true,
  enableRangeSelection: false,
  animateRows: true,
  enableBrowserTooltips: true,
  suppressHorizontalScroll: false,
  suppressColumnVirtualisation: false,
  suppressRowVirtualisation: false,
  pagination: true,
  paginationPageSize: 20,
  suppressPaginationPanel: true, // 커스텀 페이지네이션 사용
  rowClass: 'custom-row',
  getRowClass: (params: any) => {
    // 상태에 따른 행 스타일링
    if (params.data && params.data.status) {
      switch (params.data.status) {
        case 'INACTIVE':
          return 'inactive-row';
        case 'DRAFT':
          return 'draft-row';
        default:
          return '';
      }
    }
    return '';
  }
};