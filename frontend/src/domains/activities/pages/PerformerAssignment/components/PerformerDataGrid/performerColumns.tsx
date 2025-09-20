import { Chip } from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import type { PerformerAssignment } from '../../types/performer.types';

// 수행여부별 색상 매핑
const getPerformanceColor = (isPerformed: boolean): 'success' | 'warning' => {
  return isPerformed ? 'success' : 'warning';
};

// 내부활동여부별 색상 매핑
const getInternalActivityColor = (isInternal: boolean): 'primary' | 'default' => {
  return isInternal ? 'primary' : 'default';
};

// 종료여부별 색상 매핑
const getEndStatusColor = (endYn: string): 'error' | 'success' => {
  return endYn === 'Y' ? 'error' : 'success';
};

// PerformerAssignment 데이터 그리드 컬럼 정의
export const performerColumns: ColDef<PerformerAssignment>[] = [
  {
    headerName: '순번',
    field: 'sequence',
    sortable: true,
    filter: true,
    width: 80,
    cellClass: 'text-center'
  },
  {
    headerName: '순서',
    field: 'order',
    sortable: true,
    filter: true,
    width: 80,
    cellClass: 'text-center'
  },
  {
    headerName: '관리활동명',
    field: 'activityName',
    sortable: true,
    filter: true,
    width: 200,
    cellClass: 'text-left'
  },
  {
    headerName: '활동상세내용',
    field: 'activityDetail',
    sortable: true,
    filter: true,
    width: 250,
    cellClass: 'text-left',
    tooltipField: 'activityDetail'
  },
  {
    headerName: '주기',
    field: 'cycle',
    sortable: true,
    filter: true,
    width: 100,
    cellClass: 'text-center'
  },
  {
    headerName: '내부활동여부',
    field: 'isInternalActivity',
    sortable: true,
    filter: true,
    width: 120,
    cellClass: 'text-center',
    cellRenderer: (params: { value: boolean }) => (
      <Chip
        label={params.value ? 'Y' : 'N'}
        color={getInternalActivityColor(params.value)}
        size="small"
        variant="outlined"
      />
    )
  },
  {
    headerName: '규율',
    field: 'regulation',
    sortable: true,
    filter: true,
    width: 100,
    cellClass: 'text-center'
  },
  {
    headerName: '내부활동책임영역',
    field: 'responsibleDepartment',
    sortable: true,
    filter: true,
    width: 150,
    cellClass: 'text-center'
  },
  {
    headerName: '수행여부',
    field: 'isPerformed',
    sortable: true,
    filter: true,
    width: 100,
    cellClass: 'text-center',
    cellRenderer: (params: { value: boolean }) => (
      <Chip
        label={params.value ? 'Y' : 'N'}
        color={getPerformanceColor(params.value)}
        size="small"
        variant="outlined"
      />
    )
  },
  {
    headerName: '수행자',
    field: 'performer',
    sortable: true,
    filter: true,
    width: 150,
    cellClass: 'text-left'
  },
  {
    headerName: 'CSS_CONST',
    field: 'cssConst',
    sortable: true,
    filter: true,
    width: 120,
    cellClass: 'text-center'
  },
  {
    headerName: 'GNRZ_OBLG_DVCD',
    field: 'gnrzOblgDvcd',
    sortable: true,
    filter: true,
    width: 140,
    cellClass: 'text-center'
  },
  {
    headerName: 'END_YN',
    field: 'endYn',
    sortable: true,
    filter: true,
    width: 100,
    cellClass: 'text-center',
    cellRenderer: (params: { value: string }) => (
      <Chip
        label={params.value}
        color={getEndStatusColor(params.value)}
        size="small"
        variant="outlined"
      />
    )
  }
];