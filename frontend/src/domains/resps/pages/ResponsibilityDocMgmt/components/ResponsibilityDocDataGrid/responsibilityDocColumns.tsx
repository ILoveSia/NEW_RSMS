import React from 'react';
import { Chip } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import type { ResponsibilityDoc } from '../../types/responsibilityDoc.types';

// 사용여부별 색상 매핑
const getActiveColor = (isActive: boolean): 'success' | 'error' => {
  return isActive ? 'success' : 'error';
};

// 직책명 링크 렌더러 (상세조회용)
const PositionNameRenderer = ({ value, data, context }: any) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    // context에서 onCellClicked 핸들러 호출
    if (context && context.onPositionClick) {
      context.onPositionClick(data);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      style={{
        color: '#1976d2',
        textDecoration: 'none',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = 'none';
      }}
    >
      {value}
    </a>
  );
};

/**
 * 책무기술서 데이터 그리드 컬럼 정의
 * - "직책" 컬럼: 파란색 링크 스타일, 클릭 시 상세 모달 열기
 */
export const responsibilityDocColumns: ColDef<ResponsibilityDoc>[] = [
  {
    headerName: '순번',
    field: 'seq',
    sortable: true,
    filter: true,
    width: 80,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '직책',
    field: 'positionName',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
    cellRenderer: PositionNameRenderer,
    cellStyle: { fontWeight: '500' },
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '요청일자',
    field: 'requestDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '요청자',
    field: 'requestor',
    sortable: true,
    filter: true,
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '승인일자',
    field: 'approvalDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '승인자',
    field: 'approver',
    sortable: true,
    filter: true,
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '사용여부',
    field: 'isActive',
    sortable: true,
    filter: true,
    width: 100,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: { value: boolean }) => (
      <Chip
        label={params.value ? '사용' : '미사용'}
        color={getActiveColor(params.value)}
        size="small"
        variant="outlined"
      />
    )
  }
];