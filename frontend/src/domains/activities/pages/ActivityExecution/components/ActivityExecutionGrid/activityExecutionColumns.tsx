import { ColDef } from 'ag-grid-community';
import type { UseCommonCodeReturn } from '@/shared/hooks/useCommonCode/useCommonCode';
import { ActivityExecution } from '../../types/activityExecution.types';

/**
 * 관리활동 수행 그리드 컬럼 정의
 * @description dept_manager_manuals 테이블 기반 컬럼 정의
 * 컬럼 순서: 순번, 부점, 관리활동명, 책무관리항목, 수행점검항목, 수행자, 수행여부, 수행결과
 */
export const activityExecutionColumns = (
  executionStatusCode: UseCommonCodeReturn,
  executionResultCode: UseCommonCodeReturn
): ColDef<ActivityExecution>[] => [
  // 1. 순번
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false
  },

  // 2. 부점 (orgCode)
  {
    field: 'orgCode',
    headerName: '부점',
    width: 150,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    tooltipField: 'orgName'
  },

  // 3. 관리활동명 (activityName)
  {
    field: 'activityName',
    headerName: '관리활동명',
    width: 400,
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
            color: '#1976d2',
            fontWeight: '500'
          }}
        >
          {value}
        </div>
      );
    }
  },

  // 4. 책무관리항목 (respItem)
  {
    field: 'respItem',
    headerName: '책무관리항목',
    width: 350,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'respItem'
  },

  // 5. 수행점검항목 (execCheckMethod)
  {
    field: 'execCheckMethod',
    headerName: '수행점검항목',
    width: 350,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'execCheckMethod'
  },

  // 6. 수행자 (executorId)
  {
    field: 'executorId',
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

  // 7. 수행여부 (executionStatus) - 공통코드 변환
  {
    field: 'executionStatus',
    headerName: '수행여부',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    valueGetter: (params: any) => {
      const code = params.data?.executionStatus;
      return code ? executionStatusCode.getCodeName(code) : '-';
    }
  },

  // 8. 수행결과 (executionResultCd) - 공통코드 변환
  {
    field: 'executionResultCd',
    headerName: '수행결과',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    valueGetter: (params: any) => {
      const code = params.data?.executionResultCd;
      return code ? executionResultCode.getCodeName(code) : '-';
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
