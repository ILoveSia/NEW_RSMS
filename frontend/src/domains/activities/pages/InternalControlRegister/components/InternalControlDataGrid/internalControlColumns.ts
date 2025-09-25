import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { InternalControlRegister } from '../../types/internalControlRegister.types';

// 내부통제장치등록 그리드 컬럼 정의 (체크박스 다음 두 번째 위치)
export const internalControlColumns: ColDef<InternalControlRegister>[] = [
  {
    field: 'sequence',
    headerName: '순번',
    width: 80,
    sortable: true,
    pinned: 'left',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'businessAreaName',
    headerName: '업무영역명',
    width: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'businessAreaCode',
    headerName: '업무영역코드',
    width: 140,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params: any) => {
      if (params.value) {
        return `<span style="color: #1976d2; text-decoration: underline; cursor: pointer;">${params.value}</span>`;
      }
      return '';
    },
    cellStyle: { color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }
  },
  {
    field: 'businessAreaCodeDuplicate',
    headerName: '업무영역코드',
    width: 140,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'utilizationStatus',
    headerName: '활용현황',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { wordBreak: 'break-word' },
    autoHeight: true
  },
  {
    field: 'utilizationDetail',
    headerName: '활용상세',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { wordBreak: 'break-word' },
    autoHeight: true,
    tooltipField: 'utilizationDetail'
  },
  {
    field: 'isActive',
    headerName: '사용여부',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: (params: ValueFormatterParams) => {
      const isActive = params.value;
      const text = isActive ? 'Y' : 'N';
      const color = isActive ? '#10b981' : '#ef4444';
      const bgColor = isActive ? '#ecfdf5' : '#fef2f2';

      return `
        <span style="
          color: ${color};
          background-color: ${bgColor};
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.75rem;
          display: inline-block;
          min-width: 20px;
          text-align: center;
        ">
          ${text}
        </span>
      `;
    },
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  }
];

// 내부통제장치등록 그리드 기본 설정 (체크박스는 BaseDataGrid에서 자동 처리)
export const internalControlGridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: false,
    floatingFilter: false,
    menuTabs: ['filterMenuTab', 'generalMenuTab']
  },
  rowHeight: 45,
  headerHeight: 50,
  suppressRowClickSelection: false,
  suppressCellFocus: true,
  enableRangeSelection: false,
  animateRows: true,
  pagination: true,
  paginationPageSize: 25,
  suppressPaginationPanel: true,
  rowSelection: 'multiple',
  suppressRowDeselection: false
};

// 엑셀 내보내기용 컬럼 설정
export const excelExportColumns = [
  { field: 'sequence', headerName: '순번' },
  { field: 'businessAreaName', headerName: '업무영역명' },
  { field: 'businessAreaCode', headerName: '업무영역코드' },
  { field: 'utilizationStatus', headerName: '활용현황' },
  { field: 'utilizationDetail', headerName: '활용상세' },
  { field: 'isActive', headerName: '사용여부', valueFormatter: (params: any) => params.value ? 'Y' : 'N' },
  { field: 'createdDate', headerName: '등록일' },
  { field: 'createdBy', headerName: '등록자' },
  { field: 'modifiedDate', headerName: '수정일' },
  { field: 'modifiedBy', headerName: '수정자' }
];