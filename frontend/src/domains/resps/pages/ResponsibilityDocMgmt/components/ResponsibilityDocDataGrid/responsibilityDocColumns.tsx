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
 * 책무기술서 데이터 그리드 컬럼 정의 (resp_statement_execs 테이블 기반)
 * - "직책" 컬럼: 파란색 링크 스타일, 클릭 시 상세 모달 열기
 */
export const responsibilityDocColumns: ColDef<ResponsibilityDoc>[] = [
  {
    headerName: '순번',
    field: 'seq',
    sortable: true,
    filter: 'agNumberColumnFilter',
    width: 80,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '직책',
    field: 'positionName',
    sortable: true,
    filter: 'agTextColumnFilter',
    flex: 1,
    minWidth: 150,
    cellRenderer: PositionNameRenderer,
    cellStyle: { fontWeight: '500' },
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '임원성명',
    field: 'executiveName',
    sortable: true,
    filter: 'agTextColumnFilter',
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value || '-';
    }
  },
  {
    headerName: '현직책 부여일',
    field: 'positionAssignedDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 140,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      // YYYY-MM-DD → YYYY/MM/DD 형식으로 표시
      return value.replace(/-/g, '/');
    }
  },
  {
    headerName: '겸직사항',
    field: 'concurrentPosition',
    sortable: true,
    filter: 'agTextColumnFilter',
    width: 200,
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value || '-';
    }
  },
  {
    headerName: '책무 분배일',
    field: 'responsibilityAssignedDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 130,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      // YYYY-MM-DD → YYYY/MM/DD 형식으로 표시
      return value.replace(/-/g, '/');
    }
  },
  {
    headerName: '등록일자',
    field: 'createdAt',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 130,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      // YYYY-MM-DD HH:mm:ss → YYYY/MM/DD 형식으로 표시
      return value.split('T')[0].replace(/-/g, '/');
    }
  },
  {
    headerName: '등록자',
    field: 'createdBy',
    sortable: true,
    filter: 'agTextColumnFilter',
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '사용여부',
    field: 'isActive',
    sortable: true,
    filter: 'agTextColumnFilter',
    width: 110,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      const displayText = value ? '사용' : '미사용';
      const color = value ? '#4caf50' : '#9e9e9e';

      return (
        <span style={{ color, fontWeight: 500 }}>
          {displayText}
        </span>
      );
    }
  }
];