import { Chip } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import type { Position } from '../../types/position.types';

// 상태별 색상 매핑
const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case '승인':
      return 'success';
    case '대기':
      return 'warning';
    case '반려':
      return 'error';
    default:
      return 'default';
  }
};

// 사용여부별 색상 매핑
const getActiveColor = (isActive: boolean): 'success' | 'error' => {
  return isActive ? 'success' : 'error';
};

// Position 데이터 그리드 컬럼 정의
export const positionColumns: ColDef<Position>[] = [
  {
    headerName: '순번',
    field: 'id',
    sortable: true,
    filter: true,
    width: 80,
    //pinned: 'left'
  },
  {
    headerName: '직책',
    field: 'positionName',
    sortable: true,
    filter: true,
    width: 150,
    //pinned: 'left'
  },
  {
    headerName: '본부구분',
    field: 'headquarters',
    sortable: true,
    filter: true,
    width: 120
  },
  {
    headerName: '부서명',
    field: 'departmentName',
    sortable: true,
    filter: true,
    width: 150
  },
  {
    headerName: '부점명',
    field: 'divisionName',
    sortable: true,
    filter: true,
    width: 150
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
    headerName: '등록자직책',
    field: 'registrarPosition',
    sortable: true,
    filter: true,
    width: 120
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
    headerName: '수정자직책',
    field: 'modifierPosition',
    sortable: true,
    filter: true,
    width: 120
  },
  {
    headerName: '상태',
    field: 'status',
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
    headerName: '승인상태',
    field: 'approvalStatus',
    sortable: true,
    filter: true,
    width: 100,
    cellRenderer: (params: { value: string }) => (
      <Chip
        label={params.value}
        color={getStatusColor(params.value)}
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
