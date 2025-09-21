import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { ColDef } from 'ag-grid-community';
import { ActivityExecution } from '../../types/activityExecution.types';

// 이미지 기반으로 정확한 관리활동 수행 그리드 컬럼 정의
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
    field: 'activityDetail',
    headerName: '활동상세',
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
    field: 'cycle',
    headerName: '주기',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {value}
        </span>
      );
    }
  },
  {
    field: 'isInternalActivity',
    headerName: '내부활동',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    cellRenderer: (params: any) => {
      const isInternal = params.value;
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          {isInternal ? (
            <CheckBox style={{ color: '#4caf50', fontSize: '20px' }} />
          ) : (
            <CheckBoxOutlineBlank style={{ color: '#9e9e9e', fontSize: '20px' }} />
          )}
        </div>
      );
    }
  },
  {
    field: 'regulation',
    headerName: '규율',
    width: 140,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'regulation'
  },
  {
    field: 'responsibilityArea',
    headerName: '내부활동책임영역',
    width: 160,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'responsibilityArea'
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
    cellRenderer: (params: any) => {
      const isPerformed = params.value;
      const status = isPerformed ? '완료' : '미완료';
      const backgroundColor = isPerformed ? '#e8f5e8' : '#fff3e0';
      const color = isPerformed ? '#2e7d32' : '#ef6c00';

      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor,
            color,
            fontSize: '12px',
            fontWeight: '600',
            border: `1px solid ${color}20`
          }}
        >
          {status}
        </span>
      );
    }
  },
  {
    field: 'performanceResult',
    headerName: '수행결과',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    cellRenderer: (params: any) => {
      const result = params.value || '';
      let backgroundColor = '#f5f5f5';
      let color = '#666666';

      switch (result) {
        case '적정':
          backgroundColor = '#e8f5e8';
          color = '#2e7d32';
          break;
        case '부적정':
          backgroundColor = '#ffebee';
          color = '#c62828';
          break;
        case '보완필요':
          backgroundColor = '#fff3e0';
          color = '#ef6c00';
          break;
        default:
          backgroundColor = '#f5f5f5';
          color = '#666666';
      }

      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor,
            color,
            fontSize: '12px',
            fontWeight: '600',
            border: `1px solid ${color}20`
          }}
        >
          {result || '-'}
        </span>
      );
    }
  },
  {
    field: 'cssConst',
    headerName: 'CSS_CONST',
    width: 110,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      const color = value === 'Y' ? '#4caf50' : '#9e9e9e';
      return (
        <span style={{ color, fontWeight: '600' }}>
          {value}
        </span>
      );
    }
  },
  {
    field: 'gnrzOblgDvcd',
    headerName: 'GNRZ_OBLG_DVCD',
    width: 140,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    cellRenderer: (params: any) => {
      const value = params.value || '';
      return (
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#f3e5f5',
            color: '#7b1fa2',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {value}
        </span>
      );
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
