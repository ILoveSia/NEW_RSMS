import React from 'react';
import { Chip } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import type { Position } from '../../types/position.types';

// 사용여부별 색상 매핑
const getActiveColor = (isActive: boolean): 'success' | 'error' => {
  return isActive ? 'success' : 'error';
};

// 직책명 링크 렌더러 (상세조회용)
const PositionNameRenderer = ({ value, data, onCellClicked }: any) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onCellClicked) {
      onCellClicked(data);
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

// Position 데이터 그리드 컬럼 정의
export const positionColumns: ColDef<Position>[] = [
  {
    headerName: '순번',
    field: 'id',
    sortable: true,
    filter: true,
    width: 80,
  },
  {
    headerName: '직책',
    field: 'positionName',
    sortable: true,
    filter: true,
    width: 150,
    cellRenderer: PositionNameRenderer,
    cellStyle: { fontWeight: '500' },
    // @ts-ignore - AG-Grid Community spanRows 기능
    spanRows: true // 같은 값을 가진 연속된 셀 자동 병합
  },
  {
    headerName: '본부명',
    field: 'hqName',
    sortable: true,
    filter: true,
    width: 150
  },
  {
    headerName: '부점명',
    field: 'orgName',
    sortable: true,
    filter: true,
    width: 200,
    valueGetter: (params) => {
      const orgNames = params.data?.orgNames;

      // orgNames가 없거나 빈 배열인 경우
      if (!orgNames || orgNames.length === 0) {
        return '';
      }

      // 부점이 1개인 경우
      if (orgNames.length === 1) {
        return orgNames[0];
      }

      // 부점이 2개 이상인 경우: "첫번째부점명 외 N"
      const firstOrgName = orgNames[0];
      const remainingCount = orgNames.length - 1;
      return `${firstOrgName} 외 ${remainingCount}`;
    }
  },
  {
    headerName: '등록일',
    field: 'registrationDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120
  },
  {
    headerName: '등록자',
    field: 'registrar',
    sortable: true,
    filter: true,
    width: 100
  },
  {
    headerName: '수정일',
    field: 'modificationDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120
  },
  {
    headerName: '수정자',
    field: 'modifier',
    sortable: true,
    filter: true,
    width: 100
  },
  {
    headerName: '사용여부',
    field: 'isActive',
    sortable: true,
    filter: true,
    width: 100,
    cellRenderer: (params: { value: boolean }) => (
      <Chip
        label={params.value ? '사용' : '미사용'}
        color={getActiveColor(params.value)}
        size="small"
        variant="outlined"
      />
    )
  },
  {
    headerName: '겸직여부',
    field: 'dual',
    sortable: true,
    filter: true,
    width: 100
  }
];
