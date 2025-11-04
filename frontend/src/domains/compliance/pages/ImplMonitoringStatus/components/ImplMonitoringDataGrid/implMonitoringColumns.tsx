import React from 'react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Chip } from '@mui/material';
import { InspectionExecution, InspectionStatus } from '../../types/executionApproval.types';

// 점검 상태 표시 컴포넌트
const InspectionStatusRenderer: React.FC<ICellRendererParams<InspectionExecution>> = ({ value }) => {
  const getStatusDisplay = (status: InspectionStatus) => {
    switch (status) {
      case 'NOT_STARTED':
        return { label: '미수행', color: 'default' as const, style: { backgroundColor: '#9e9e9e', color: 'white' } };
      case 'FIRST_INSPECTION':
        return { label: '점검중', color: 'warning' as const, style: { backgroundColor: '#ff9800', color: 'white' } };
      case 'SECOND_INSPECTION':
        return { label: '검토중', color: 'info' as const, style: { backgroundColor: '#ff5722', color: 'white' } };
      case 'COMPLETED':
        return { label: '완료', color: 'success' as const, style: { backgroundColor: '#4caf50', color: 'white' } };
      case 'REJECTED':
        return { label: '반려', color: 'error' as const, style: { backgroundColor: '#f44336', color: 'white' } };
      default:
        return { label: '알 수 없음', color: 'default' as const, style: { backgroundColor: '#9e9e9e', color: 'white' } };
    }
  };

  const statusDisplay = getStatusDisplay(value);

  return (
    <Chip
      label={statusDisplay.label}
      size="small"
      style={{
        ...statusDisplay.style,
        fontSize: '0.75rem',
        fontWeight: '500',
        minWidth: '60px'
      }}
    />
  );
};

// 점검 결과 표시 컴포넌트
const InspectionResultRenderer: React.FC<ICellRendererParams<InspectionExecution>> = ({ value }) => {
  if (!value) return <span style={{ color: '#999' }}>-</span>;

  const getResultStyle = (result: string) => {
    switch (result) {
      case 'PASS':
      case '적합':
        return { color: '#4caf50', fontWeight: '500' };
      case 'FAIL':
      case '부적합':
        return { color: '#f44336', fontWeight: '500' };
      case 'IMPROVEMENT':
      case '보완필요':
        return { color: '#ff9800', fontWeight: '500' };
      default:
        return { color: '#666', fontWeight: '400' };
    }
  };

  return (
    <span style={getResultStyle(value)}>
      {value}
    </span>
  );
};

// 수행자 표시 컴포넌트
const PerformerRenderer: React.FC<ICellRendererParams<InspectionExecution>> = ({ value }) => {
  if (!value) return <span style={{ color: '#999' }}>-</span>;

  return (
    <span style={{ color: '#1976d2', fontWeight: '500' }}>
      {value}
    </span>
  );
};

// 점검자 표시 컴포넌트
const InspectorRenderer: React.FC<ICellRendererParams<InspectionExecution>> = ({ value }) => {
  if (!value) return <span style={{ color: '#999' }}>-</span>;

  return (
    <span style={{ color: '#7b1fa2', fontWeight: '500' }}>
      {value}
    </span>
  );
};

// 내부/외제 구분 표시 컴포넌트
const InternalExternalRenderer: React.FC<ICellRendererParams<InspectionExecution>> = ({ value }) => {
  const getStyle = (type: string) => {
    switch (type) {
      case '내부':
        return { color: '#2e7d32', backgroundColor: '#e8f5e8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' };
      case '외부':
        return { color: '#d84315', backgroundColor: '#fef1ec', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' };
      default:
        return { color: '#666', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' };
    }
  };

  return (
    <span style={getStyle(value)}>
      {value}
    </span>
  );
};

// AG-Grid 컬럼 정의
export const executionColumns: ColDef<InspectionExecution>[] = [
  {
    field: 'sequenceNumber',
    headerName: '순번',
    width: 80,
    minWidth: 60,
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { fontWeight: '600', color: '#1976d2' }
  },
  {
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellStyle: { fontWeight: '500' },
    tooltipField: 'managementActivityName'
  },
  {
    field: 'managementActivitySession',
    headerName: '관리활동차시',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { color: '#666' }
  },
  {
    field: 'managementActivityDetail',
    headerName: '관리활동상세',
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    tooltipField: 'managementActivityDetail',
    cellRenderer: (params: ICellRendererParams<InspectionExecution>) => {
      const value = params.value;
      if (!value) return '-';

      // 긴 텍스트는 줄임표 처리
      const maxLength = 30;
      const displayText = value.length > maxLength
        ? `${value.substring(0, maxLength)}...`
        : value;

      return <span title={value}>{displayText}</span>;
    }
  },
  {
    field: 'internalExternal',
    headerName: '내부/외제',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: InternalExternalRenderer
  },
  {
    field: 'classification',
    headerName: '구분',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { color: '#666' }
  },
  {
    field: 'internalExternalLimitInfo',
    headerName: '내부/외제제한정보',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: ICellRendererParams<InspectionExecution>) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#999' }}>-</span>;

      const maxLength = 20;
      const displayText = value.length > maxLength
        ? `${value.substring(0, maxLength)}...`
        : value;

      return <span title={value}>{displayText}</span>;
    }
  },
  {
    field: 'performer',
    headerName: '수행자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: PerformerRenderer
  },
  {
    field: 'performanceTarget',
    headerName: '수행대상',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: ICellRendererParams<InspectionExecution>) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#999' }}>-</span>;
      return <span>{value}</span>;
    }
  },
  {
    field: 'performanceResult',
    headerName: '수행결과',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: ICellRendererParams<InspectionExecution>) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#999' }}>-</span>;
      return <span>{value}</span>;
    }
  },
  {
    field: 'inspector',
    headerName: '점검자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: InspectorRenderer
  },
  {
    field: 'inspectionTarget',
    headerName: '점검대상',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: ICellRendererParams<InspectionExecution>) => {
      const value = params.value;
      if (!value) return <span style={{ color: '#999' }}>-</span>;
      return <span>{value}</span>;
    }
  },
  {
    field: 'firstInspectionResult',
    headerName: '1차',
    width: 80,
    minWidth: 60,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: InspectionResultRenderer
  },
  {
    field: 'secondInspectionResult',
    headerName: '2차',
    width: 80,
    minWidth: 60,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: InspectionResultRenderer
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
  },
  {
    colId: 'managementActivityName',
    width: 180,
    pinned: 'left' as const
  }
];