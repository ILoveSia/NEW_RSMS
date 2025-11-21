/**
 * 이사회이력관리 AG-Grid 컬럼 정의
 * @description PositionMgmt 표준 컬럼 구조를 적용한 이사회 이력 목록 컬럼
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { Chip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { BoardHistory } from '../../types/boardHistory.types';


// 첨부파일 개수 렌더러
const FileCountRenderer = ({ data }: { data: BoardHistory }) => {
  const totalFiles = (data.fileCount || 0);
  const responsibilityFiles = (data.responsibilityFileCount || 0);

  if (totalFiles === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: '#999' }}>-</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
      <AttachFileIcon style={{ fontSize: '16px', color: '#666' }} />
      <span style={{ fontWeight: 500 }}>
        {totalFiles}
        {responsibilityFiles > 0 && (
          <span style={{ color: '#1976d2', marginLeft: '2px' }}>
            ({responsibilityFiles})
          </span>
        )}
      </span>
    </div>
  );
};

// 이사회 결의명 렌더러 (클릭 가능)
const ResolutionNameRenderer = ({ value, data, onCellClicked }: {
  value: string;
  data: BoardHistory;
  onCellClicked?: (data: BoardHistory) => void;
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
        alignItems: 'center'
      }}
      onClick={handleClick}
      title="클릭하여 상세보기"
    >
      {value}
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

// 회차 포맷터
const roundFormatter = (params: any) => {
  if (!params.value) return '-';
  return `제${params.value}차`;
};

export const boardHistoryColumns: ColDef<BoardHistory>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    minWidth: 80,
    maxWidth: 80,
    suppressSizeToFit: true,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: false,
    resizable: false
  },
  {
    field: 'ledgerOrderId',
    headerName: '책무이행차수',
    width: 160,
    minWidth: 140,
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
    field: 'round',
    headerName: '회차',
    width: 120,
    minWidth: 100,
    cellStyle: { textAlign: 'center', fontWeight: '500' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'greaterThan', 'lessThan'],
      suppressAndOrCondition: true
    },
    valueFormatter: roundFormatter
  },
  {
    field: 'resolutionName',
    headerName: '이사회 결의명',
    width: 350,
    minWidth: 280,
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'startsWith', 'endsWith'],
      suppressAndOrCondition: true
    },
    cellRenderer: ResolutionNameRenderer,
    cellClass: 'clickable-cell',
    tooltipField: 'resolutionName'
  },
  {
    field: 'resolutionDate',
    headerName: '이사회 결의일자',
    width: 160,
    minWidth: 140,
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
    field: 'uploadDate',
    headerName: '업로드 일자',
    width: 140,
    minWidth: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: dateFormatter
  },
  {
    field: 'fileCount',
    headerName: '첨부파일',
    width: 120,
    minWidth: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agNumberColumnFilter',
    filterParams: {
      filterOptions: ['equals', 'greaterThan', 'lessThan'],
      suppressAndOrCondition: true
    },
    cellRenderer: FileCountRenderer,
    tooltipValueGetter: (params: any) => {
      const total = params.data?.fileCount || 0;
      const responsibility = params.data?.responsibilityFileCount || 0;
      return `총 ${total}개 파일 (책무구조도: ${responsibility}개)`;
    }
  }
];

// 파일 목록용 컬럼 정의 (상세 모달에서 사용)
export const fileListColumns: ColDef[] = [
  {
    field: 'seq',
    headerName: '순서',
    width: 60,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true
  },
  {
    field: 'fileName',
    headerName: '파일명',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    tooltipField: 'originalFileName'
  },
  {
    field: 'fileSize',
    headerName: '사이즈',
    width: 100,
    cellStyle: { textAlign: 'right' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    valueFormatter: (params: any) => {
      if (!params.value) return '-';
      const bytes = params.value;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
  },
  {
    field: 'fileCategory',
    headerName: '분류',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['responsibility', 'general'],
      valueFormatter: (params: any) =>
        params.value === 'responsibility' ? '책무구조도' : '일반파일'
    },
    cellRenderer: ({ value }: { value: string }) => {
      const isResponsibility = value === 'responsibility';
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={isResponsibility ? '책무구조도' : '일반파일'}
            color={isResponsibility ? 'primary' : 'default'}
            size="small"
            variant="outlined"
          />
        </div>
      );
    }
  },
  {
    field: 'uploadBy',
    headerName: '등록자',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    field: 'uploadDate',
    headerName: '등록일자',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: dateFormatter
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
  overlayLoadingTemplate: '<div class="ag-overlay-loading-center">이사회 이력을 불러오는 중...</div>',
  overlayNoRowsTemplate: '<div class="ag-overlay-no-rows-center">조회된 이사회 이력이 없습니다.</div>'
};