import type { ColDef } from 'ag-grid-community';
import type { Responsibility } from '../../types/responsibility.types';

/**
 * 책무관리 AG-Grid 컬럼 정의
 * PositionMgmt와 동일한 스타일 및 구조 적용
 */
export const responsibilityColumns: ColDef<Responsibility>[] = [
  {
    headerName: '순번',
    field: '순번',
    width: 80,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    sortable: true,
    filter: false,
    valueFormatter: (params) => {
      if (params.value !== undefined && params.value !== null) {
        return String(params.value);
      }
      return '';
    }
  },
  {
    headerName: '직책',
    field: '직책',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    cellStyle: { fontWeight: '500' }
  },
  {
    headerName: '책무',
    field: '책무',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    wrapText: false,
    autoHeight: false,
    cellStyle: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    tooltipField: '책무'
  },
  {
    headerName: '책무세부내용',
    field: '책무세부내용',
    width: 300,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    wrapText: false,
    autoHeight: false,
    cellStyle: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    tooltipField: '책무세부내용'
  },
  {
    headerName: '관리의무',
    field: '관리의무',
    width: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center'
  },
  {
    headerName: '부점명',
    field: '부점명',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false
  },
  {
    headerName: '등록일자',
    field: '등록일자',
    width: 120,
    sortable: true,
    filter: 'agDateColumnFilter',
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    valueFormatter: (params) => {
      if (!params.value) return '';
      return params.value;
    }
  },
  {
    headerName: '등록자',
    field: '등록자',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center'
  },
  {
    headerName: '상태',
    field: '상태',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center'
  },
  {
    headerName: '사용여부',
    field: '사용여부',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    valueFormatter: (params) => {
      return params.value ? '사용' : '미사용';
    }
  }
];

/**
 * 기본 컬럼 설정
 */
export const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  editable: false,
  suppressMovable: false
};
