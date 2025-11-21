/**
 * 원장관리 AG-Grid 컬럼 정의
 * PositionMgmt 표준 템플릿 기반
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { LEDGER_ORDER_STATUS, LedgerOrder } from '../../types/ledgerOrder.types';

// 책무이행차수 제목 링크 렌더러 (상세조회용)
const LedgerOrderTitleRenderer = ({ value, data, onCellClicked }: any) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onCellClicked) {
      onCellClicked(data);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      style={{
        color: '#1976d2',
        textDecoration: 'none',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = 'none';
      }}
    >
      {value}
    </a>
  );
};

/**
 * 원장차수 AG-Grid 컬럼 정의
 */
export const ledgerOrderColumns: ColDef<LedgerOrder>[] = [
  {
    headerName: '순번',
    field: '순번',
    width: 80,
    minWidth: 80,
    maxWidth: 80,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    sortable: true,
    filter: false,
    suppressSizeToFit: true,
    valueFormatter: (params) => {
      if (params.value !== undefined && params.value !== null) {
        return String(params.value);
      }
      return '';
    }
  },
  {
    headerName: '책무이행차수ID',
    field: 'ledgerOrderId',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center',
    cellStyle: { fontWeight: '500' }
  },
  {
    headerName: '책무이행차수 제목',
    field: 'ledgerOrderTitle',
    width: 350,
    minWidth: 250,
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    cellRenderer: LedgerOrderTitleRenderer,
    cellStyle: { fontWeight: '500' }
  },
  {
    headerName: '책무차수상태',
    field: 'ledgerOrderStatus',
    width: 130,
    minWidth: 120,
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
    width: 400,
    minWidth: 300,
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
    minWidth: 160,
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
    width: 130,
    minWidth: 100,
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
    minWidth: 160,
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
    width: 130,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'ag-cell-center'
  }
];
