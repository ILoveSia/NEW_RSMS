/**
 * 직책겸직관리 AG-Grid 컬럼 정의
 * PositionMgmt.tsx 표준 패턴을 따라 설계됨
 */

import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Flag as FlagIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { Chip, IconButton, Tooltip } from '@mui/material';
import { ColDef } from 'ag-grid-community';

import type { PositionDual } from '../../types/positionDual.types';

// 🎨 상태 렌더러 컴포넌트들

// 대표여부 상태 렌더러
const RepresentativeStatusRenderer = ({ data }: { data: PositionDual }) => {
  const isRepresentative = data.isRepresentative;

  return (
    <Tooltip title={isRepresentative ? '대표직책' : '일반직책'}>
      <Chip
        icon={isRepresentative ? <FlagIcon /> : undefined}
        label={isRepresentative ? 'Y' : 'N'}
        color={isRepresentative ? 'primary' : 'default'}
        size="small"
        variant={isRepresentative ? 'filled' : 'outlined'}
        sx={{
          minWidth: '40px',
          fontSize: '0.75rem',
          fontWeight: isRepresentative ? 'bold' : 'normal'
        }}
      />
    </Tooltip>
  );
};

// 사용여부 상태 렌더러
const ActiveStatusRenderer = ({ data }: { data: PositionDual }) => {
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

// 겸직현황코드 렌더러 (기본)
const ConcurrentStatusCodeRenderer = (params: any) => {
  const { data, onClick } = params;

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '100%',
      justifyContent: 'center'
    }}>
      <span style={{
        color: '#1976d2',
        fontWeight: 'medium',
        fontSize: '0.875rem',
        cursor: onClick ? 'pointer' : 'default'
      }}>
        {data.concurrentStatusCode}
      </span>
      {onClick && (
        <Tooltip title="겸직 상세 보기">
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              padding: '2px',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

// 직책명 렌더러 (강조 표시)
const PositionNameRenderer = ({ data }: { data: PositionDual }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{
        fontWeight: data.isRepresentative ? 'bold' : 'normal',
        color: data.isRepresentative ? '#1976d2' : '#333'
      }}>
        {data.positionName}
      </span>
      {data.isRepresentative && (
        <Tooltip title="대표직책">
          <FlagIcon
            fontSize="small"
            sx={{
              color: '#1976d2',
              fontSize: '16px'
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

// 📊 메인 컬럼 정의
export const positionDualColumns: ColDef<PositionDual>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'concurrentStatusCode',
    headerName: '겸직현황코드',
    width: 140,
    cellRenderer: ConcurrentStatusCodeRenderer,
    cellStyle: {
      textAlign: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'positionCode',
    headerName: '직책코드',
    width: 120,
    cellStyle: {
      textAlign: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'positionName',
    headerName: '직책명',
    width: 180,
    cellRenderer: PositionNameRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  {
    field: 'isRepresentative',
    headerName: '대표여부',
    width: 100,
    cellRenderer: RepresentativeStatusRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'hpName',
    headerName: '본부명',
    width: 150,
    cellStyle: { textAlign: 'left' }
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
    width: 120,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  {
    field: 'modificationDate',
    headerName: '수정일자',
    width: 110,
    valueGetter: (params) => params.data?.modificationDate || '-',
    cellStyle: (params: any) => ({
      textAlign: 'center',
      color: params.value === '-' ? '#999' : '#333'
    }),
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'modifier',
    headerName: '수정자',
    width: 120,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
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
export const positionDualMobileColumns: ColDef<PositionDual>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 60,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'concurrentStatusCode',
    headerName: '겸직코드',
    width: 100,
    cellRenderer: ConcurrentStatusCodeRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'positionName',
    headerName: '직책명',
    width: 150,
    cellRenderer: PositionNameRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  {
    field: 'isRepresentative',
    headerName: '대표',
    width: 70,
    cellRenderer: RepresentativeStatusRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  },
  {
    field: 'isActive',
    headerName: '상태',
    width: 80,
    cellRenderer: ActiveStatusRenderer,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerClass: 'ag-header-cell-centered'
  }
];

// 🎯 컬럼 설정 유틸리티
export const getPositionDualColumns = (
  isMobile: boolean = false,
  onDetailClick?: (data: PositionDual) => void
): ColDef<PositionDual>[] => {
  const baseColumns = isMobile ? positionDualMobileColumns : positionDualColumns;

  // 겸직현황코드 클릭 핸들러 주입
  return baseColumns.map(col => {
    if (col.field === 'concurrentStatusCode' && onDetailClick) {
      return {
        ...col,
        cellRendererParams: {
          onClick: onDetailClick
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
  isActive: {
    type: 'equals',
    filter: null
  }
};

// 📋 엑셀 내보내기용 컬럼 매핑
export const excelColumnMapping = {
  seq: '순번',
  concurrentStatusCode: '겸직현황코드',
  positionCode: '직책코드',
  positionName: '직책명',
  isRepresentative: '대표여부',
  hpName: '본부명',
  registrationDate: '등록일자',
  registrar: '등록자',
  registrarPosition: '등록자직책',
  modificationDate: '수정일자',
  modifier: '수정자',
  modifierPosition: '수정자직책',
  isActive: '사용여부'
};
