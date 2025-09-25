/**
 * 관리의무별 점검현황 AG-Grid 컬럼 정의
 * @description ExecutiveReport 화면의 두 번째 테이블용 컬럼 설정
 */

import type { ColDef } from 'ag-grid-community';
import type { DutyInspection } from '../../types/executiveReport.types';

// 우선순위 렌더러
const PriorityCellRenderer = (params: any) => {
  const { value } = params;
  if (!value) return '';

  const priorityColors = {
    HIGH: '#f44336',
    MEDIUM: '#ff9800',
    LOW: '#4caf50'
  };

  const priorityLabels = {
    HIGH: '높음',
    MEDIUM: '보통',
    LOW: '낮음'
  };

  const color = priorityColors[value as keyof typeof priorityColors] || '#bdbdbd';
  const label = priorityLabels[value as keyof typeof priorityLabels] || value;

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

// 리스크 수준 렌더러
const RiskLevelCellRenderer = (params: any) => {
  const { value } = params;
  if (!value) return '';

  const riskColors = {
    HIGH: '#d32f2f',
    MEDIUM: '#f57c00',
    LOW: '#388e3c'
  };

  const riskLabels = {
    HIGH: '높음',
    MEDIUM: '보통',
    LOW: '낮음'
  };

  const color = riskColors[value as keyof typeof riskColors] || '#bdbdbd';
  const label = riskLabels[value as keyof typeof riskLabels] || value;

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

// 준수율 렌더러 (진행률 바 형태)
const ComplianceRateCellRenderer = (params: any) => {
  const { value } = params;
  if (value === null || value === undefined) return '';

  const percentage = Math.min(Math.max(value, 0), 100);
  let barColor = '#4caf50'; // 기본 초록색

  if (percentage < 60) {
    barColor = '#f44336'; // 빨간색
  } else if (percentage < 80) {
    barColor = '#ff9800'; // 주황색
  }

  return `
    <div style="
      display: flex;
      align-items: center;
      height: 100%;
      gap: 8px;
      font-weight: 500;
    ">
      <div style="
        flex: 1;
        height: 8px;
        background-color: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      ">
        <div style="
          height: 100%;
          width: ${percentage}%;
          background-color: ${barColor};
          transition: width 0.3s ease;
        "></div>
      </div>
      <span style="
        min-width: 40px;
        font-size: 0.75rem;
        color: ${barColor};
      ">
        ${percentage}%
      </span>
    </div>
  `;
};

// 텍스트 축약 렌더러 (긴 텍스트용)
const TruncatedTextRenderer = (params: any) => {
  const { value } = params;
  if (!value) return '';

  const maxLength = 80;
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

// 관리의무별 점검현황 컬럼 정의
export const dutyColumns: ColDef<DutyInspection>[] = [
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
    headerName: '관리의무',
    field: 'managementDuty',
    width: 300,
    cellRenderer: TruncatedTextRenderer,
    cellStyle: { fontWeight: '600', color: '#1976d2' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      debounceMs: 300
    }
  },
  {
    headerName: '점검결과',
    field: 'inspectionResult',
    width: 250,
    cellRenderer: TruncatedTextRenderer,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains'],
      debounceMs: 300
    }
  },
  {
    headerName: '책무구분',
    field: 'responsibilityCategory',
    width: 120,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['온법감시', '내부감시', '경영진단', '리스크관리', '준법감시']
    }
  },
  {
    headerName: '의무코드',
    field: 'dutyCode',
    width: 100,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' },
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['equals', 'startsWith'],
      debounceMs: 300
    }
  },
  {
    headerName: '우선순위',
    field: 'priority',
    width: 100,
    cellRenderer: PriorityCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['HIGH', 'MEDIUM', 'LOW'],
      valueFormatter: (params: any) => {
        const labels = { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' };
        return labels[params.value as keyof typeof labels] || params.value;
      }
    }
  },
  {
    headerName: '준수율',
    field: 'complianceRate',
    width: 150,
    cellRenderer: ComplianceRateCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
    sortable: true,
    filter: 'agNumberColumnFilter',
    filterParams: {
      filterOptions: ['greaterThan', 'lessThan', 'inRange'],
      debounceMs: 300
    }
  },
  {
    headerName: '리스크수준',
    field: 'riskLevel',
    width: 110,
    cellRenderer: RiskLevelCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['HIGH', 'MEDIUM', 'LOW'],
      valueFormatter: (params: any) => {
        const labels = { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' };
        return labels[params.value as keyof typeof labels] || params.value;
      }
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
export const dutyGridOptions = {
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

    // 리스크 수준에 따른 배경색
    if (params.data?.riskLevel === 'HIGH') {
      return { backgroundColor: '#ffebee' };
    }

    if (params.data?.riskLevel === 'MEDIUM') {
      return { backgroundColor: '#fff3e0' };
    }

    // 준수율이 낮은 경우
    if (params.data?.complianceRate < 60) {
      return { backgroundColor: '#ffebee' };
    }

    // 준수율이 높은 경우
    if (params.data?.complianceRate >= 90) {
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
