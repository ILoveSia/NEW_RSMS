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
    // 체크박스 선택 컬럼
    headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    resizable: false,
    sortable: false,
    filter: false,
    pinned: 'left',
    lockPinned: true,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    suppressMenu: true
  },
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
      const value = params.value;
      return `<span style="font-weight: 500;">${value}</span>`;
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
      const value = params.value;
      return `<span style="font-weight: 500; color: #1976d2;">${value}</span>`;
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
      const value = params.value;
      return `<span style="font-weight: 500; color: #2e7d32;">${value}</span>`;
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'internalControlDeviceName',
    headerName: '내부통제장치명',
    width: 220,
    minWidth: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      const truncated = value && value.length > 30 ? `${value.substring(0, 30)}...` : value;
      return `
        <span
          style="font-weight: 500; color: #ed6c02;"
          title="${value}"
        >
          ${truncated}
        </span>
      `;
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'internalControlDeviceDescription',
    headerName: '내부통제장치설명',
    width: 250,
    minWidth: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      const truncated = value && value.length > 40 ? `${value.substring(0, 40)}...` : value;
      return `
        <span
          style="color: #616161; line-height: 1.3;"
          title="${value}"
        >
          ${truncated}
        </span>
      `;
    },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
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

      // YYYY.MM.DD 형식으로 표시
      const formattedDate = value.replace(/-/g, '.');
      return `<span style="font-family: monospace; color: #424242;">${formattedDate}</span>`;
    },
    filterParams: {
      filterOptions: ['equals', 'greaterThan', 'lessThan', 'inRange'],
      suppressAndOrCondition: true,
      comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        if (!cellValue) return -1;

        // cellValue가 'YYYY.MM.DD' 형식인 경우 Date 객체로 변환
        const cellDate = new Date(cellValue.replace(/\./g, '-'));

        if (cellDate < filterLocalDateAtMidnight) return -1;
        if (cellDate > filterLocalDateAtMidnight) return 1;
        return 0;
      }
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

      // YYYY.MM.DD 형식으로 표시
      const formattedDate = value.replace(/-/g, '.');

      // 적용일자가 오늘 이후인 경우 파란색으로 표시
      const today = new Date();
      const applicationDate = new Date(value.replace(/\./g, '-'));
      const color = applicationDate >= today ? '#1976d2' : '#424242';

      return `<span style="font-family: monospace; color: ${color}; font-weight: 500;">${formattedDate}</span>`;
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

      // YYYY.MM.DD 형식으로 표시
      const formattedDate = value.replace(/-/g, '.');

      // 만료일자에 따른 색상 구분
      const today = new Date();
      const expirationDate = new Date(value.replace(/\./g, '-'));
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let color = '#424242';
      let fontWeight = 'normal';

      if (daysUntilExpiration < 0) {
        // 이미 만료된 경우 빨간색
        color = '#d32f2f';
        fontWeight = 'bold';
      } else if (daysUntilExpiration <= 7) {
        // 7일 이내 만료 예정인 경우 오렌지색
        color = '#f57c00';
        fontWeight = 'bold';
      } else if (daysUntilExpiration <= 30) {
        // 30일 이내 만료 예정인 경우 노란색
        color = '#fbc02d';
        fontWeight = '500';
      }

      return `
        <span
          style="font-family: monospace; color: ${color}; font-weight: ${fontWeight};"
          title="${daysUntilExpiration >= 0 ? `${daysUntilExpiration}일 후 만료` : `${Math.abs(daysUntilExpiration)}일 전 만료됨`}"
        >
          ${formattedDate}
        </span>
      `;
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