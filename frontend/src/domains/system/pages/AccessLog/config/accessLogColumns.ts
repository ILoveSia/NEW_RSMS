/**
 * 접근로그 AG-Grid 컬럼 정의
 *
 * @description 접근로그 화면 이미지 및 요구사항 기반 컬럼 구성
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import { ColDef } from 'ag-grid-community';
import { AccessLog } from '../types/accessLog.types';


export const accessLogColumns: ColDef<AccessLog>[] = [
  {
    field: 'accessTarget',
    headerName: '접근대상',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'menuName',
    headerName: '메뉴명',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'employeeNo',
    headerName: '직번',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'employee-no-cell',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'fullName',
    headerName: '성명',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'full-name-cell',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'deptName',
    headerName: '부정',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'ipAddress',
    headerName: '접근IP',
    width: 130,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ip-address-cell',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'logDateTime',
    headerName: '접근일',
    width: 120,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellRenderer: (params: any) => {
      const dateTime = params.value;
      if (!dateTime) return '-';

      try {
        const date = new Date(dateTime);
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\./g, '-').replace(/-$/, '');
      } catch (error) {
        return dateTime;
      }
    }
  },
  {
    field: 'logDateTime',
    headerName: '접근시간',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      const dateTime = params.value;
      if (!dateTime) return '-';

      try {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } catch (error) {
        return dateTime;
      }
    }
  },
  {
    field: 'actionType',
    headerName: '액션유형',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'logLevel',
    headerName: '로그레벨',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
    },
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  },
  {
    field: 'message',
    headerName: '메시지',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    wrapText: true,
    autoHeight: false,
    cellRenderer: (params: any) => {
      return params.value || '-';
    }
  }
];

// 기본 그리드 설정
export const accessLogGridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false
  },
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  rowMultiSelectWithClick: false,
  enableRangeSelection: true,
  animateRows: true,
  pagination: true,
  paginationPageSize: 50,
  paginationPageSizeSelector: [20, 50, 100, 200],
  suppressScrollOnNewData: true,
  suppressMenuHide: true,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  suppressLoadingOverlay: false,
  suppressNoRowsOverlay: false,
  rowHeight: 40,
  headerHeight: 45
};

// 접근 대상 옵션
export const accessTargetOptions = [
  { value: '전체', label: '전체' },
  { value: '101', label: '101' },
  { value: '102', label: '102' },
  { value: '103', label: '103' }
];