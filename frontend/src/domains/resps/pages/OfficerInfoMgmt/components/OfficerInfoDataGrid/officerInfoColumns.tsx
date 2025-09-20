/**
 * 임원정보관리 AG-Grid 컬럼 정의
 * @description PositionMgmt 표준 컬럼 구조를 적용한 임원정보 목록 컬럼
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { OfficerInfo, OfficerInfoStatus, OFFICER_INFO_STATUS_LABELS, OFFICER_INFO_STATUS_COLORS } from '../../types/officerInfo.types';

// 임원명 렌더러
const OfficerNameRenderer = ({ value, data }: { value?: string; data: OfficerInfo }) => {
  if (!value || value === '-') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Chip
          label="미배정"
          color="default"
          size="small"
          variant="outlined"
          style={{ fontSize: '0.75rem' }}
        />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      gap: '4px',
      fontWeight: '500'
    }}>
      <PersonIcon style={{ fontSize: '16px', color: '#666' }} />
      <span>{value}</span>
    </div>
  );
};

// 직책명 렌더러 (클릭 가능)
const PositionNameRenderer = ({ value, data, onCellClicked }: {
  value: string;
  data: OfficerInfo;
  onCellClicked?: (data: OfficerInfo) => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCellClicked) {
      onCellClicked(data);
    }
  };

  return (
    <div
      style={{
        cursor: 'pointer',
        color: '#1976d2',
        textDecoration: 'underline',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500'
      }}
      onClick={handleClick}
      title="클릭하여 상세보기"
    >
      {value}
    </div>
  );
};

// 상태 렌더러
const StatusRenderer = ({ value }: { value: OfficerInfoStatus }) => {
  const getStatusIcon = (status: OfficerInfoStatus) => {
    switch (status) {
      case 'test':
        return <WarningIcon />;
      case 'confirmed':
      case 'approved':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'rejected':
        return <ErrorIcon />;
      default:
        return <PendingIcon />;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Chip
        icon={getStatusIcon(value)}
        label={OFFICER_INFO_STATUS_LABELS[value]}
        color={OFFICER_INFO_STATUS_COLORS[value]}
        size="small"
        variant="outlined"
      />
    </div>
  );
};

// 직위 렌더러
const PositionRenderer = ({ value }: { value?: string }) => {
  if (!value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: '#999' }}>-</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    }}>
      <Chip
        label={value}
        color="primary"
        size="small"
        variant="outlined"
        style={{ fontSize: '0.75rem' }}
      />
    </div>
  );
};

// 날짜 포맷터
const dateFormatter = (params: any) => {
  if (!params.value) return '-';
  try {
    const date = new Date(params.value);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return params.value;
  }
};

// 순번 포맷터
const sequenceFormatter = (params: any) => {
  if (!params.value) return '-';
  return `${params.value}`;
};

export const officerInfoColumns: ColDef<OfficerInfo>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: false,
    resizable: false,
    valueFormatter: sequenceFormatter
  },
  {
    field: 'positionName',
    headerName: '직책',
    width: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    },
    cellRenderer: PositionNameRenderer,
    cellClass: 'clickable-cell',
    tooltipField: 'positionName'
  },
  {
    field: 'officerName',
    headerName: '임원',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'equals'],
      suppressAndOrCondition: true
    },
    cellRenderer: OfficerNameRenderer,
    tooltipValueGetter: (params: any) => {
      return params.data?.officerName || '임원이 배정되지 않았습니다.';
    }
  },
  {
    field: 'officerPosition',
    headerName: '직위',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'equals'],
      suppressAndOrCondition: true
    },
    cellRenderer: PositionRenderer
  },
  {
    field: 'requestDate',
    headerName: '요청일자',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agDateColumnFilter',
    filterParams: {
      comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        if (!cellValue) return -1;

        const cellDate = new Date(cellValue);
        const filterDate = new Date(filterLocalDateAtMidnight);

        if (cellDate.getTime() === filterDate.getTime()) return 0;
        return cellDate.getTime() < filterDate.getTime() ? -1 : 1;
      }
    },
    valueFormatter: dateFormatter
  },
  {
    field: 'requesterPosition',
    headerName: '요청자직책',
    width: 130,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'equals'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'requesterName',
    headerName: '요청자',
    width: 100,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'equals'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'approvalDate',
    headerName: '승인일자',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: dateFormatter
  },
  {
    field: 'approverPosition',
    headerName: '승인자직책',
    width: 130,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'equals'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'approverName',
    headerName: '승인자',
    width: 100,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'equals'],
      suppressAndOrCondition: true
    }
  },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['test', 'confirmed', 'pending', 'approved', 'rejected'],
      valueFormatter: (params: any) => OFFICER_INFO_STATUS_LABELS[params.value as OfficerInfoStatus]
    },
    cellRenderer: StatusRenderer,
    tooltipValueGetter: (params: any) => {
      const status = params.data?.status;
      return `상태: ${OFFICER_INFO_STATUS_LABELS[status as OfficerInfoStatus]}`;
    }
  }
];

// 컬럼 기본 설정
export const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  headerClass: 'ag-header-cell-center',
  cellClass: 'ag-cell-center',
  suppressMovable: false,
  suppressMenu: false,
  enableValue: false,
  enableRowGroup: false,
  enablePivot: false
};

// 그리드 기본 옵션
export const gridOptions = {
  defaultColDef,
  enableRangeSelection: false,
  enableCharts: false,
  enableBrowserTooltips: false,
  tooltipShowDelay: 500,
  tooltipHideDelay: 2000,
  rowSelection: 'multiple' as const,
  suppressRowClickSelection: true,
  rowMultiSelectWithClick: false,
  pagination: true,
  paginationPageSize: 25,
  suppressPaginationPanel: false,
  animateRows: true,
  enableCellTextSelection: true,
  overlayLoadingTemplate: '<div class="ag-overlay-loading-center">임원정보를 불러오는 중...</div>',
  overlayNoRowsTemplate: '<div class="ag-overlay-no-rows-center">조회된 임원정보가 없습니다.</div>'
};

// 회의체 목록용 컬럼 정의 (모달에서 사용)
export const meetingBodyColumns: ColDef[] = [
  {
    field: 'seq',
    headerName: '순서',
    width: 60,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true
  },
  {
    field: 'meetingName',
    headerName: '회의체명',
    width: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'meetingName'
  },
  {
    field: 'chairperson',
    headerName: '위원장',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'frequency',
    headerName: '개최주기',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agSetColumnFilter'
  },
  {
    field: 'mainAgenda',
    headerName: '주요심의사항',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'mainAgenda'
  }
];

// 책무 상세 목록용 컬럼 정의 (모달에서 사용)
export const responsibilityColumns: ColDef[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 60,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true
  },
  {
    field: 'responsibility',
    headerName: '책무',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'responsibility'
  },
  {
    field: 'responsibilityDetails',
    headerName: '책무세부내용',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'responsibilityDetails'
  },
  {
    field: 'legalBasis',
    headerName: '관련근거',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'legalBasis'
  }
];

// 관리의무 목록용 컬럼 정의 (모달에서 사용)
export const managementObligationColumns: ColDef[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 60,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true
  },
  {
    field: 'obligationContent',
    headerName: '관리의무',
    width: 300,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'obligationContent'
  },
  {
    field: 'legalBasis',
    headerName: '관련근거',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'legalBasis'
  }
];