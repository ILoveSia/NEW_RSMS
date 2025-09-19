/**
 * 책무관리 AG-Grid 컬럼 정의
 * PositionMgmt.tsx 표준 패턴을 따라 설계됨
 */

import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { ColDef } from 'ag-grid-community';

import type { Responsibility } from '../../types/responsibility.types';

// 🎨 상태 렌더러 컴포넌트들

// 상태 렌더러
const StatusRenderer = ({ data }: { data: Responsibility }) => {
  const isActive = data.status === 'active';

  return (
    <Tooltip title={isActive ? '활성' : '비활성'}>
      <Chip
        icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
        label={isActive ? '활성' : '비활성'}
        color={isActive ? 'success' : 'error'}
        size="small"
        variant={isActive ? 'filled' : 'outlined'}
        sx={{
          minWidth: '60px',
          fontSize: '0.75rem',
          fontWeight: 'medium'
        }}
      />
    </Tooltip>
  );
};

// 사용여부 렌더러
const ActiveStatusRenderer = ({ data }: { data: Responsibility }) => {
  const isActive = data.isActive;

  return (
    <Tooltip title={isActive ? '사용중' : '사용안함'}>
      <Chip
        icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
        label={isActive ? '사용' : '미사용'}
        color={isActive ? 'success' : 'error'}
        size="small"
        variant={isActive ? 'filled' : 'outlined'}
        sx={{
          minWidth: '60px',
          fontSize: '0.75rem',
          fontWeight: 'medium'
        }}
      />
    </Tooltip>
  );
};

// 직책명 렌더러 (강조 표시)
const PositionNameRenderer = ({ data }: { data: Responsibility }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <WorkIcon
        fontSize="small"
        sx={{
          color: '#1976d2',
          fontSize: '16px'
        }}
      />
      <span style={{
        fontWeight: '500',
        color: '#1976d2'
      }}>
        {data.positionName}
      </span>
    </div>
  );
};


// 📊 메인 컬럼 정의
export const responsibilityColumns: ColDef<Responsibility>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'positionName',
    headerName: '직책',
    width: 150,
    cellRenderer: PositionNameRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  {
    field: 'responsibility',
    headerName: '책무',
    width: 200,
    cellStyle: {
      fontWeight: '500',
      color: '#2e7d32'
    },
    tooltipField: 'responsibility'
  },
  {
    field: 'responsibilityDetail',
    headerName: '책무세부내용',
    width: 250,
    cellStyle: {
      textAlign: 'left',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },
    tooltipField: 'responsibilityDetail'
  },
  {
    field: 'managementDuty',
    headerName: '관리의무',
    width: 200,
    cellStyle: {
      fontWeight: '500',
      color: '#d32f2f'
    },
    tooltipField: 'managementDuty'
  },
  {
    field: 'divisionName',
    headerName: '부정명',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'registrationDate',
    headerName: '등록일자',
    width: 110,
    cellStyle: {
      textAlign: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'registrar',
    headerName: '등록자',
    width: 100,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    cellRenderer: StatusRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'isActive',
    headerName: '사용여부',
    width: 100,
    cellRenderer: ActiveStatusRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  }
];

// 📱 모바일 컬럼 정의 (반응형)
export const responsibilityMobileColumns: ColDef<Responsibility>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 60,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'positionName',
    headerName: '직책',
    width: 120,
    cellRenderer: PositionNameRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  {
    field: 'responsibility',
    headerName: '책무',
    width: 150,
    cellStyle: {
      fontWeight: '500',
      color: '#2e7d32'
    },
    tooltipField: 'responsibility'
  },
  {
    field: 'managementDuty',
    headerName: '관리의무',
    width: 150,
    cellStyle: {
      fontWeight: '500',
      color: '#d32f2f'
    },
    tooltipField: 'managementDuty'
  },
  {
    field: 'status',
    headerName: '상태',
    width: 80,
    cellRenderer: StatusRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  }
];

// 🎯 컬럼 설정 유틸리티
export const getResponsibilityColumns = (
  isMobile: boolean = false,
  onDetailClick?: (data: Responsibility) => void
): ColDef<Responsibility>[] => {
  const baseColumns = isMobile ? responsibilityMobileColumns : responsibilityColumns;

  // 직책명 클릭 핸들러 주입
  return baseColumns.map(col => {
    if (col.field === 'positionName' && onDetailClick) {
      return {
        ...col,
        cellRendererParams: {
          onClick: onDetailClick
        },
        cellStyle: {
          ...col.cellStyle,
          cursor: 'pointer'
        }
      };
    }
    return col;
  });
};

// 📊 컬럼 정렬 설정
export const defaultSortModel = [
  {
    colId: 'seq',
    sort: 'asc' as const
  }
];

// 🎨 컬럼 필터 설정
export const defaultFilterModel = {
  positionName: {
    type: 'contains',
    filter: ''
  },
  responsibility: {
    type: 'contains',
    filter: ''
  },
  managementDuty: {
    type: 'contains',
    filter: ''
  },
  status: {
    type: 'equals',
    filter: null
  },
  isActive: {
    type: 'equals',
    filter: null
  }
};

// 📋 엑셀 내보내기용 컬럼 매핑
export const excelColumnMapping = {
  seq: '순번',
  positionName: '직책',
  responsibility: '책무',
  responsibilityDetail: '책무세부내용',
  managementDuty: '관리의무',
  divisionName: '부정명',
  registrationDate: '등록일자',
  registrar: '등록자',
  status: '상태',
  isActive: '사용여부'
};