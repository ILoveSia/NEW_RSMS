/**
 * 내부통제장치관리 AG-Grid 컬럼 정의
 * 좌측 목록 영역에 표시되는 테이블의 컬럼 구성
 */

import { ColDef } from 'ag-grid-community';
import { InternalControlMgmt } from '../../types/internalControlMgmt.types';

/**
 * 내부통제장치관리 목록 컬럼 정의
 * 요구사항에 따른 컬럼: 선택, 순번, 부정명, 관리활동명, 내부통제장치명, 내부통제장치설명, 등록일자, 적용일자, 만료일자
 */
export const internalControlMgmtColumns: ColDef<InternalControlMgmt>[] = [
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
    field: 'departmentName',
    headerName: '부정명',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
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
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      return params.value;
    },
    cellStyle: {
      fontWeight: '500',
      color: '#2e7d32'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'internalControl',
    headerName: '내부통제',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
    },
    cellStyle: {
      fontWeight: '500',
      color: '#ed6c02'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'unifiedNumber',
    headerName: '통일번호',
    width: 130,
    minWidth: 110,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      return params.value;
    },
    cellStyle: {
      fontFamily: 'monospace',
      color: '#1976d2',
      fontWeight: '500'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'url',
    headerName: 'URL',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '';

      const truncated = value.length > 25 ? `${value.substring(0, 25)}...` : value;
      return truncated;
    },
    onCellClicked: (event: any) => {
      if (event.value) {
        window.open(event.value, '_blank', 'noopener,noreferrer');
      }
    },
    cellStyle: {
      color: '#1976d2',
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'applicationDate',
    headerName: '적용일자',
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
    cellStyle: (params: any) => {
      const value = params.value;
      if (!value) return {
        fontFamily: 'monospace',
        color: '#424242',
        fontWeight: 'normal'
      };

      const today = new Date();
      const applicationDate = new Date(value.replace(/\./g, '-'));
      const color = applicationDate >= today ? '#1976d2' : '#424242';

      return {
        fontFamily: 'monospace',
        color: color,
        fontWeight: '500'
      };
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
    field: 'expirationDate',
    headerName: '만료일자',
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
    cellStyle: (params: any) => {
      const value = params.value;
      if (!value) return {
        fontFamily: 'monospace',
        color: '#424242',
        fontWeight: 'normal'
      };

      const today = new Date();
      const expirationDate = new Date(value.replace(/\./g, '-'));
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let color = '#424242';
      let fontWeight = 'normal';

      if (daysUntilExpiration < 0) {
        color = '#d32f2f';
        fontWeight = 'bold';
      } else if (daysUntilExpiration <= 7) {
        color = '#f57c00';
        fontWeight = 'bold';
      } else if (daysUntilExpiration <= 30) {
        color = '#fbc02d';
        fontWeight = '500';
      }

      return {
        fontFamily: 'monospace',
        color: color,
        fontWeight: fontWeight
      };
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
    // 만료된 항목에 대한 특별한 스타일링
    if (params.data && params.data.expirationDate) {
      const today = new Date();
      const expirationDate = new Date(params.data.expirationDate.replace(/\./g, '-'));

      if (expirationDate < today) {
        return 'expired-row';
      } else if ((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 7) {
        return 'expiring-soon-row';
      }
    }
    return '';
  }
};
