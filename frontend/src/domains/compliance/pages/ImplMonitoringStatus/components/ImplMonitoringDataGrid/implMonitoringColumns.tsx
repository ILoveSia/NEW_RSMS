/**
 * 이행점검수행 AG-Grid 컬럼 정의
 * InspectorAssign와 동일한 스타일 적용
 */

import { ColDef } from 'ag-grid-community';
import { InspectionExecution } from '../../types/implMonitoringStatus.types';

// AG-Grid 컬럼 정의
export const executionColumns: ColDef<InspectionExecution>[] = [
  {
    field: 'sequenceNumber',
    headerName: '순번',
    width: 80,
    minWidth: 60,
    maxWidth: 100,
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    field: 'inspectionName',
    headerName: '점검명',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
    }
  },
  {
    field: 'obligationInfo',
    headerName: '관리의무',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 20 ? `${value.substring(0, 20)}...` : (value || '');
    }
  },
  {
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 25 ? `${value.substring(0, 25)}...` : (value || '');
    }
  },
  {
    field: 'activityFrequencyCd',
    headerName: '관리활동수행주기',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    field: 'orgCode',
    headerName: '부점',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    field: 'inspectionMethod',
    headerName: '이행점검방법',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 20 ? `${value.substring(0, 20)}...` : (value || '');
    }
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
      const value = params.value;
      if (!value) {
        return (
          <span style={{
            color: '#999',
            fontSize: '0.875rem'
          }}>
            미지정
          </span>
        );
      }
      return (
        <span style={{
          color: '#1976d2',
          fontWeight: 500
        }}>
          {value}
        </span>
      );
    }
  },
  {
    field: 'inspectionResult',
    headerName: '점검결과',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';

      // 점검결과에 따른 색상 표시
      let color = '#666';
      if (value === '적합' || value === 'PASS') {
        color = '#4caf50';
      } else if (value === '부적합' || value === 'FAIL') {
        color = '#f44336';
      } else if (value === '보완필요' || value === 'IMPROVEMENT') {
        color = '#ff9800';
      }

      return (
        <span style={{ color, fontWeight: 500 }}>
          {value}
        </span>
      );
    }
  },
  {
    field: 'inspectionDetail',
    headerName: '점검세부내용',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
    }
  },
  {
    field: 'inspectionStatus',
    headerName: '상태',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      let statusText = '';
      switch (value) {
        case 'NOT_STARTED': statusText = '미수행'; break;
        case 'FIRST_INSPECTION': statusText = '1차점검중'; break;
        case 'SECOND_INSPECTION': statusText = '2차점검중'; break;
        case 'COMPLETED': statusText = '✓ 완료'; break;
        case 'REJECTED': statusText = '반려'; break;
        default: statusText = '미수행';
      }
      return statusText;
    }
  }
];

// 기본 정렬 설정
export const defaultSortModel = [
  {
    colId: 'sequenceNumber',
    sort: 'asc' as const
  }
];

// 기본 컬럼 상태 설정
export const defaultColumnState = [
  {
    colId: 'sequenceNumber',
    width: 80,
    pinned: 'left' as const
  }
];
