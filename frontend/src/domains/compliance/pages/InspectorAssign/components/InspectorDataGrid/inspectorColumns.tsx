/**
 * 점검자지정 AG-Grid 컬럼 정의
 * 요구사항에 따른 컬럼: 상태, 순번, 관리명칭명, 차시, 내부/외부, 구분, 내부/외부제한정보, 수정자, 점검자, 점검일자, END YN
 */

import { ColDef } from 'ag-grid-community';
import { Chip, Button } from '@mui/material';
import { InspectorAssignment } from '../../types/inspectorAssign.types';

// 지정상태별 색상 매핑
const getAssignmentStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'ASSIGNED':
      return 'success';
    case 'UNASSIGNED':
      return 'warning';
    case 'COMPLETED':
      return 'default';
    default:
      return 'default';
  }
};

// 지정상태별 텍스트 매핑
const getAssignmentStatusText = (status: string): string => {
  switch (status) {
    case 'ASSIGNED':
      return '지정완료';
    case 'UNASSIGNED':
      return '미지정';
    case 'COMPLETED':
      return '점검완료';
    default:
      return status || '';
  }
};

// 내부/외부 구분 색상 매핑
const getInternalExternalColor = (type: string): 'primary' | 'secondary' => {
  return type === 'INTERNAL' ? 'primary' : 'secondary';
};

// 내부/외부 구분 텍스트 매핑
const getInternalExternalText = (type: string): string => {
  return type === 'INTERNAL' ? '내부' : '외부';
};

/**
 * 점검자지정 목록 컬럼 정의 (순번과 상태 위치 변경)
 */
export const inspectorColumns: ColDef<InspectorAssignment>[] = [
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
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'assignmentStatus',
    headerName: '상태',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: { value: string }) => (
      <Chip
        label={getAssignmentStatusText(params.value)}
        color={getAssignmentStatusColor(params.value)}
        size="small"
        variant="outlined"
      />
    ),
    filterParams: {
      values: ['지정완료', '미지정', '점검완료'],
      suppressSorting: true
    }
  },
  {
    field: 'managementName',
    headerName: '관리명칭명',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
    },
    cellStyle: { fontWeight: '500', color: '#1976d2' },
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'round',
    headerName: '차시',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { fontWeight: '500', color: '#ed6c02' }
  },
  {
    field: 'internalExternal',
    headerName: '내부/외부',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: { value: string }) => (
      <Chip
        label={getInternalExternalText(params.value)}
        color={getInternalExternalColor(params.value)}
        size="small"
        variant="outlined"
      />
    ),
    filterParams: {
      values: ['내부', '외부'],
      suppressSorting: true
    }
  },
  {
    field: 'category',
    headerName: '구분',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { fontWeight: '500', color: '#7b1fa2' }
  },
  {
    field: 'restrictionInfo',
    headerName: '내부/외부제한정보',
    width: 180,
    minWidth: 150,
    sortable: false,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 20 ? `${value.substring(0, 20)}...` : (value || '');
    },
    cellStyle: { color: '#666666', fontSize: '13px' }
  },
  {
    field: 'modifier',
    headerName: '수정자',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { fontWeight: '500', color: '#1976d2' }
  },
  {
    field: 'inspector',
    headerName: '점검자',
    width: 150,
    minWidth: 120,
    sortable: false,
    filter: false,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const assignment = params.data;
      const inspector = assignment?.inspector;
      const isCompleted = assignment?.endYn === 'Y';

      if (inspector) {
        return (
          <Button
            variant="contained"
            size="small"
            color={isCompleted ? 'inherit' : 'primary'}
            disabled={isCompleted}
            onClick={() => {
              // 점검자 선택/변경 모달 열기
              if (params.context?.onInspectorSelect) {
                params.context.onInspectorSelect(assignment);
              }
            }}
            sx={{
              minWidth: '80px',
              fontSize: '12px',
              textTransform: 'none'
            }}
          >
            {inspector.name}
          </Button>
        );
      } else {
        return (
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={() => {
              // 점검자 선택 모달 열기
              if (params.context?.onInspectorSelect) {
                params.context.onInspectorSelect(assignment);
              }
            }}
            sx={{
              minWidth: '80px',
              fontSize: '12px',
              textTransform: 'none'
            }}
          >
            선택
          </Button>
        );
      }
    }
  },
  {
    field: 'inspectionDate',
    headerName: '점검일자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '초회';
      if (value.includes('-')) {
        return value.replace(/-/g, '.');
      }
      return value;
    },
    cellStyle: { fontFamily: 'monospace', color: '#424242', fontWeight: '500' }
  },
  {
    field: 'endYn',
    headerName: 'END YN',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: { value: string }) => {
      const isCompleted = params.value === 'Y';
      return (
        <Chip
          label={isCompleted ? '완료' : '진행중'}
          color={isCompleted ? 'success' : 'default'}
          size="small"
          variant={isCompleted ? 'filled' : 'outlined'}
        />
      );
    },
    filterParams: {
      values: ['Y', 'N'],
      suppressSorting: true
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
    // 지정상태에 따른 행 스타일링
    if (params.data && params.data.assignmentStatus) {
      switch (params.data.assignmentStatus) {
        case 'COMPLETED':
          return 'completed-row';
        case 'UNASSIGNED':
          return 'unassigned-row';
        default:
          return '';
      }
    }
    return '';
  }
};