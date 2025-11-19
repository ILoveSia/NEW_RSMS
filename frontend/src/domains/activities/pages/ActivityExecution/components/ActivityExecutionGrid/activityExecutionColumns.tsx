import { ColDef } from 'ag-grid-community';
import type { UseCommonCodeReturn } from '@/shared/hooks/useCommonCode/useCommonCode';
import { ActivityExecution } from '../../types/activityExecution.types';

/**
 * 관리활동 수행 그리드 컬럼 정의
 * @description dept_manager_manuals 테이블 기반 컬럼 정의
 * 컬럼 순서: 순번, 부서, 관리활동명, 책무관리항목, 수행점검항목, 수행자, 수행여부, 수행결과
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

  // 2. 부서 (orgName 표시, orgCode는 tooltip)
  {
    field: 'orgName',
    headerName: '부서',
    width: 200,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'orgCode',
    valueGetter: (params: any) => {
      const orgName = params.data?.orgName || '';
      const orgCode = params.data?.orgCode || '';
      // orgName이 있으면 표시, 없으면 orgCode 표시
      return orgName || orgCode || '-';
    }
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

  // 6. 수행자 (이름 표시, 사번은 tooltip)
  {
    headerName: '수행자',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    valueGetter: (params: any) => {
      const executorName = params.data?.executorName || '';
      const executorId = params.data?.executorId || '';
      // executorName이 있으면 표시, 없으면 executorId 표시
      return executorName || executorId || '미지정';
    },
    tooltipValueGetter: (params: any) => {
      return params.data?.executorId || '';
    },
    cellRenderer: (params: any) => {
      const value = params.value || '미지정';
      const hasValue = value !== '미지정';
      return (
        <div
          style={{
            fontWeight: '500',
            color: hasValue ? '#2e7d32' : '#9e9e9e'
          }}
        >
          {value}
        </div>
      );
    }
  },

  // 7. 수행여부 (01:미수행, 02:수행완료)
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
      if (!code) return '-';

      // 01:미수행, 02:수행완료
      if (code === '01') return '미수행';
      if (code === '02') return '수행완료';

      // 공통코드 fallback
      return executionStatusCode.getCodeName(code) || code;
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
