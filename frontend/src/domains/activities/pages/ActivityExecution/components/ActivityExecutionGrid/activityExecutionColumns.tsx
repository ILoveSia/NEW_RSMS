import { ColDef } from 'ag-grid-community';
import { ActivityExecution } from '../../types/activityExecution.types';

// 관리활동 수행 그리드 컬럼 정의
// 컬럼 순서: 관리활동구분, 부점, 관리활동명, 관리활동수행주기, 관리활동상세, 위험평가등급, 수행자, 수행여부, 수행결과
export const activityExecutionColumns: ColDef<ActivityExecution>[] = [
  {
    field: 'sequence',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: false,
    resizable: false
  },
  {
    field: 'gnrzOblgDvcd',
    headerName: '관리활동구분',
    width: 150,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true
  },
  {
    field: 'responsibilityArea',
    headerName: '부점',
    width: 140,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'responsibilityArea'
  },
  {
    field: 'activityName',
    headerName: '관리활동명',
    width: 180,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'activityName',
    cellRenderer: (params: any) => {
      const value = params.value || '';
      return (
        <div
          className="activity-name-cell"
          title={value}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            color: '#1976d2'
          }}
        >
          {value}
        </div>
      );
    }
  },
  {
    field: 'cycle',
    headerName: '관리활동수행주기',
    width: 140,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true
  },
  {
    field: 'activityDetail',
    headerName: '관리활동상세',
    width: 150,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'activityDetail',
    cellRenderer: (params: any) => {
      const value = params.value || '';
      return (
        <div
          title={value}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {value}
        </div>
      );
    }
  },
  {
    field: 'regulation',
    headerName: '위험평가등급',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true
  },
  {
    field: 'performer',
    headerName: '수행자',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      return (
        <div
          style={{
            fontWeight: '500',
            color: value ? '#2e7d32' : '#9e9e9e'
          }}
        >
          {value || '미지정'}
        </div>
      );
    }
  },
  {
    field: 'isPerformed',
    headerName: '수행여부',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    valueGetter: (params: any) => {
      return params.data?.isPerformed ? '수행' : '미수행';
    }
  }
];

// 그리드 기본 설정
export const activityExecutionGridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    menuTabs: ['filterMenuTab', 'generalMenuTab'],
  },
  rowHeight: 40,
  headerHeight: 45,
  animateRows: true,
  enableRangeSelection: true,
  rowSelection: 'multiple' as const,
  suppressRowClickSelection: false,
  suppressCellFocus: true,
  getRowStyle: (params: any) => {
    // 선택된 행 스타일
    if (params.node.selected) {
      return { backgroundColor: '#e3f2fd' };
    }

    // 수행 상태에 따른 행 배경색 (선택사항)
    const data = params.data;
    if (data?.status === 'completed') {
      return { backgroundColor: '#f8fff8' };
    } else if (data?.status === 'pending') {
      return { backgroundColor: '#fffef7' };
    }

    return {};
  },
  getRowClass: (params: any) => {
    const classes = ['activity-execution-row'];

    if (params.data?.isActive === false) {
      classes.push('inactive-row');
    }

    return classes.join(' ');
  }
};
