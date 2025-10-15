/**
 * 원장관리 AG-Grid 컬럼 정의
 * PositionMgmt 표준 템플릿 기반
 */

import { ColDef } from 'ag-grid-community';
import { LedgerOrder, LEDGER_ORDER_STATUS } from '../../types/ledgerOrder.types';

/**
 * 원장차수 AG-Grid 컬럼 정의
 */
export const ledgerOrderColumns: ColDef<LedgerOrder>[] = [
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
    headerName: '원장차수ID',
    field: 'ledgerOrderId',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    cellStyle: { fontWeight: '500' }
  },
  {
    headerName: '원장 제목',
    field: 'ledgerOrderTitle',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    cellStyle: { fontWeight: '500' }
  },
  {
    headerName: '원장상태',
    field: 'ledgerOrderStatus',
    width: 120,
    sortable: true,
    filter: 'agSetColumnFilter',
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    valueFormatter: (params) => {
      if (!params.value) return '';
      return LEDGER_ORDER_STATUS[params.value as keyof typeof LEDGER_ORDER_STATUS] || params.value;
    }
  },
  {
    headerName: '비고',
    field: 'ledgerOrderRemarks',
    width: 300,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    wrapText: true,
    autoHeight: true
  },
  {
    headerName: '생성일시',
    field: 'createdAt',
    width: 180,
    sortable: true,
    filter: 'agDateColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    valueFormatter: (params) => {
      if (!params.value) return '';
      const date = new Date(params.value);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  },
  {
    headerName: '생성자',
    field: 'createdBy',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center'
  },
  {
    headerName: '수정일시',
    field: 'updatedAt',
    width: 180,
    sortable: true,
    filter: 'agDateColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    valueFormatter: (params) => {
      if (!params.value) return '';
      const date = new Date(params.value);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  },
  {
    headerName: '수정자',
    field: 'updatedBy',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center'
  }
];
