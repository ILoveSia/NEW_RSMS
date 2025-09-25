/**
 * 책무별 점검현황 AG-Grid 컬럼 정의
 * @description ExecutiveReport 화면의 첫 번째 테이블용 컬럼 설정
 */

import type { ColDef } from 'ag-grid-community';
import type { ResponsibilityInspection } from '../../types/executiveReport.types';
import { IMPROVEMENT_STATUS_COLORS, IMPROVEMENT_STATUS_LABELS, INSPECTION_STATUS_COLORS, INSPECTION_STATUS_LABELS } from '../../types/executiveReport.types';

// 상태 렌더러 컴포넌트
const StatusCellRenderer = (params: any) => {
  const { value, colDef } = params;
  if (!value) return '';

  const isInspectionStatus = colDef.field === 'inspectionResult';
  const colorMap = isInspectionStatus ? INSPECTION_STATUS_COLORS : IMPROVEMENT_STATUS_COLORS;
  const labelMap = isInspectionStatus ? INSPECTION_STATUS_LABELS : IMPROVEMENT_STATUS_LABELS;

  const color = colorMap[value as keyof typeof colorMap] || '#bdbdbd';
  const label = labelMap[value as keyof typeof labelMap] || value;

  return `
    <div style="
      display: flex;
      align-items: center;
      height: 100%;
      font-weight: 500;
    ">
      <span style="
        background-color: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        white-space: nowrap;
      ">
        ${label}
      </span>
    </div>
  `;
};

// 텍스트 축약 렌더러 (긴 텍스트용)
const TruncatedTextRenderer = (params: any) => {
  const { value } = params;
  if (!value) return '';

  const maxLength = 50;
  const truncated = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

  return `
    <div title="${value}" style="
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 100%;
      line-height: 1.5;
      padding: 4px 0;
    ">
      ${truncated}
    </div>
  `;
};

// 날짜 포맷터
const dateFormatter = (params: any) => {
  if (!params.value) return '';
  const date = new Date(params.value);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 책무별 점검현황 컬럼 정의
export const responsibilityColumns: ColDef<ResponsibilityInspection>[] = [
  {
    headerName: '번호',
    field: 'id',
    width: 80,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    sortable: false,
    filter: false,
    valueGetter: (params) => {
      return params.node ? params.node.rowIndex + 1 : '';
    }
  },
  {
    headerName: '책무',
    field: 'responsibility',
    width: 120,
    cellStyle: { fontWeight: '600', color: '#1976d2' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      debounceMs: 300
    }
  },
  {
    headerName: '관리의무',
    field: 'managementDuty',
    width: 200,
    cellRenderer: TruncatedTextRenderer,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains'],
      debounceMs: 300
    }
  },
  {
    headerName: '관리활동',
    field: 'managementActivity',
    width: 200,
    cellRenderer: TruncatedTextRenderer,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains'],
      debounceMs: 300
    }
  },
  {
    headerName: '이행점검결과',
    field: 'inspectionResult',
    width: 130,
    cellRenderer: StatusCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: Object.keys(INSPECTION_STATUS_LABELS),
      valueFormatter: (params: any) => INSPECTION_STATUS_LABELS[params.value as keyof typeof INSPECTION_STATUS_LABELS] || params.value
    }
  },
  {
    headerName: '개선조치',
    field: 'improvementAction',
    width: 110,
    cellRenderer: StatusCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: Object.keys(IMPROVEMENT_STATUS_LABELS),
      valueFormatter: (params: any) => IMPROVEMENT_STATUS_LABELS[params.value as keyof typeof IMPROVEMENT_STATUS_LABELS] || params.value
    }
  },
  {
    headerName: '점검일자',
    field: 'inspectionDate',
    width: 120,
    cellStyle: { textAlign: 'center' },
    valueFormatter: dateFormatter,
    sortable: true,
    filter: 'agDateColumnFilter',
    filterParams: {
      browserDatePicker: true,
      minValidYear: 2020,
      maxValidYear: 2030
    }
  },
  {
    headerName: '점검자',
    field: 'inspector',
    width: 100,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith'],
      debounceMs: 300
    }
  },
  {
    headerName: '점검자 직책',
    field: 'inspectorPosition',
    width: 130,
    cellStyle: { textAlign: 'center' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains'],
      debounceMs: 300
    }
  },
  {
    headerName: '점검결과 상세',
    field: 'resultDetail',
    width: 180,
    cellRenderer: TruncatedTextRenderer,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains'],
      debounceMs: 300
    }
  },
  {
    headerName: '개선조치 상세',
    field: 'improvementDetail',
    width: 180,
    cellRenderer: TruncatedTextRenderer,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains'],
      debounceMs: 300
    }
  },
  {
    headerName: '부점명',
    field: 'branchName',
    width: 120,
    cellStyle: { textAlign: 'center' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith'],
      debounceMs: 300
    }
  },
  {
    headerName: '점검년도',
    field: 'inspectionYear',
    width: 100,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['2024', '2025', '2026', '2027', '2028']
    }
  },
  {
    headerName: '등록일',
    field: 'registrationDate',
    width: 120,
    cellStyle: { textAlign: 'center' },
    valueFormatter: dateFormatter,
    sortable: true,
    filter: 'agDateColumnFilter',
    filterParams: {
      browserDatePicker: true
    }
  },
  {
    headerName: '등록자',
    field: 'registrar',
    width: 100,
    cellStyle: { textAlign: 'center' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith'],
      debounceMs: 300
    }
  },
  {
    headerName: '수정일',
    field: 'modificationDate',
    width: 120,
    cellStyle: { textAlign: 'center' },
    valueFormatter: dateFormatter,
    sortable: true,
    filter: 'agDateColumnFilter',
    filterParams: {
      browserDatePicker: true
    }
  },
  {
    headerName: '수정자',
    field: 'modifier',
    width: 100,
    cellStyle: { textAlign: 'center' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith'],
      debounceMs: 300
    }
  }
];

// 기본 그리드 설정
export const responsibilityGridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    cellStyle: {
      fontSize: '0.875rem',
      lineHeight: '1.5'
    }
  },
  getRowStyle: (params: any) => {
    // 비활성 상태인 경우 배경색 변경
    if (!params.data?.isActive) {
      return { backgroundColor: '#f5f5f5', opacity: 0.8 };
    }

    // 점검결과가 부작성인 경우 연한 빨간색 배경
    if (params.data?.inspectionResult === 'NOT_STARTED') {
      return { backgroundColor: '#ffebee' };
    }

    // 점검결과가 완료인 경우 연한 초록색 배경
    if (params.data?.inspectionResult === 'COMPLETED') {
      return { backgroundColor: '#e8f5e8' };
    }

    return {};
  },
  rowHeight: 40,
  headerHeight: 45,
  animateRows: true,
  enableCellTextSelection: true,
  suppressRowClickSelection: false,
  rowSelection: 'multiple',
  pagination: true,
  paginationPageSize: 25,
  paginationPageSizeSelector: [10, 25, 50, 100],
  suppressPaginationPanel: false,
  suppressMovableColumns: false,
  suppressFieldDotNotation: true
};
