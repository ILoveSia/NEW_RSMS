import { Chip } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import type { ResponsibilityDoc } from '../../types/responsibilityDoc.types';

// 상태별 색상 매핑
const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'draft':
      return 'default';
    default:
      return 'default';
  }
};

// 승인상태별 색상 매핑
const getApprovalStatusColor = (status: string): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    default:
      return 'warning';
  }
};

// 사용여부별 색상 매핑
const getActiveColor = (isActive: boolean): 'success' | 'error' => {
  return isActive ? 'success' : 'error';
};

// 변경여부별 색상 매핑
const getChangedColor = (isChanged: boolean): 'warning' | 'default' => {
  return isChanged ? 'warning' : 'default';
};

export const responsibilityDocColumns: ColDef<ResponsibilityDoc>[] = [
  {
    headerName: '순번',
    field: 'seq',
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
  },
  {
    headerName: '요청일자',
    field: 'requestDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120
  },
  {
    headerName: '요청자사번',
    field: 'requestor',
    sortable: true,
    filter: true,
    width: 120
  },
  {
    headerName: '승인일자',
    field: 'approvalDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120
  },
  {
    headerName: '승인인자',
    field: 'approver',
    sortable: true,
    filter: true,
    width: 100
  },
  {
    headerName: '승인자사번',
    field: 'approverPosition',
    sortable: true,
    filter: true,
    width: 120
  },
  {
    headerName: '변경여부',
    field: 'isChanged',
    sortable: true,
    filter: true,
    width: 100,
    cellRenderer: (params: { value: boolean }) => (
      <Chip
        label={params.value ? '변경' : '미변경'}
        color={getChangedColor(params.value)}
        size="small"
        variant="outlined"
      />
    )
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
    headerName: '상태',
    field: 'status',
    sortable: true,
    filter: true,
    width: 100,
    cellRenderer: (params: { value: string }) => {
      const statusLabels = {
        'draft': '임시저장',
        'pending': '대기',
        'approved': '승인',
        'rejected': '반려'
      };
      return (
        <Chip
          label={statusLabels[params.value as keyof typeof statusLabels] || params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      );
    }
  },
  {
    headerName: '결재상태',
    field: 'approvalStatus',
    sortable: true,
    filter: true,
    width: 100,
    cellRenderer: (params: { value: string }) => {
      const approvalLabels = {
        'pending': '대기',
        'approved': '승인',
        'rejected': '반려'
      };
      return (
        <Chip
          label={approvalLabels[params.value as keyof typeof approvalLabels] || params.value}
          color={getApprovalStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      );
    }
  }
];