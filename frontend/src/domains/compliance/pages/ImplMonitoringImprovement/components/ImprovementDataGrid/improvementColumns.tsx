/**
 * 이행점검개선 AG-Grid 컬럼 정의
 * dept_manager_manuals + impl_inspection_items 테이블 결합
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';

/**
 * 개선이행 데이터 타입
 * dept_manager_manuals (순번~부점) + impl_inspection_items (점검자~최종점검결과)
 */
export interface ImprovementData {
  id: string;
  // dept_manager_manuals 테이블 컬럼 (순번~부점)
  sequenceNumber: number;                  // 순번
  inspectionName: string;                  // 점검명
  obligationInfo: string;                  // 관리의무
  managementActivityName: string;          // 관리활동명
  orgCode: string;                         // 부점

  // impl_inspection_items 테이블 컬럼 (점검자~최종점검결과)
  inspector: string;                       // 점검자 (inspector_id)
  inspectionResult: string;                // 점검결과 (inspection_status_cd: 02=적정, 03=부적정)
  improvementManager: string;              // 수행자(개선담당자) (improvement_manager_id)
  improvementStatus: string;               // 개선이행상태 (improvement_status_cd: 01=개선미이행, 02=진행중, 03=완료)
  improvementPlanDate: string | null;      // 개선계획수립일자 (improvement_plan_date)
  improvementApprovedDate: string | null;  // 개선승인일자 (improvement_plan_approved_date)
  improvementCompletedDate: string | null; // 개선완료일자 (improvement_completed_date)
  finalInspectionResult: string;           // 최종점검결과 (final_inspection_result_cd: 01=승인, 02=반려)
}

// 관리활동명 링크 렌더러 (상세조회용)
const ManagementActivityNameRenderer = ({ value, data, onCellClicked }: any) => {
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
      {value && value.length > 25 ? `${value.substring(0, 25)}...` : (value || '')}
    </a>
  );
};

// AG-Grid 컬럼 정의
export const improvementColumns: ColDef<ImprovementData>[] = [
  // ========================================
  // dept_manager_manuals 테이블 컬럼 (순번~부점)
  // ========================================
  {
    field: 'sequenceNumber',
    headerName: '순번',
    width: 80,
    minWidth: 60,
    maxWidth: 100,
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    field: 'inspectionName',
    headerName: '점검명',
    width: 250,
    minWidth: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
    }
  },
  {
    field: 'obligationInfo',
    headerName: '관리의무',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 20 ? `${value.substring(0, 20)}...` : (value || '');
    }
  },
  {
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 250,
    minWidth: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: ManagementActivityNameRenderer,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'orgCode',
    headerName: '부점',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },

  // ========================================
  // impl_inspection_items 테이블 컬럼 (점검자~최종점검결과)
  // ========================================
  {
    field: 'inspector',
    headerName: '점검자',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) {
        return (
          <span style={{
            color: '#999',
            fontSize: '0.875rem'
          }}>
            미지정
          </span>
        );
      }
      return value;
    }
  },
  {
    field: 'inspectionResult',
    headerName: '점검결과',
    width: 150,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';

      // 점검결과에 따른 색상 표시 (inspection_status_cd: 02=적정, 03=부적정)
      let color = '#666';
      let displayText = value;

      if (value === '02' || value === '적합' || value === 'PASS') {
        color = '#4caf50';
        displayText = '적정';
      } else if (value === '03' || value === '부적합' || value === 'FAIL') {
        color = '#f44336';
        displayText = '부적정';
      }

      return (
        <span style={{ color, fontWeight: 500 }}>
          {displayText}
        </span>
      );
    }
  },
  {
    field: 'improvementManager',
    headerName: '개선담당자(수행자)',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) {
        return (
          <span style={{
            color: '#999',
            fontSize: '0.875rem'
          }}>
            미지정
          </span>
        );
      }
      return value;
    }
  },
  {
    field: 'improvementStatus',
    headerName: '개선이행상태',
    width: 160,
    minWidth: 130,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';

      // 개선이행상태에 따른 색상 표시 (improvement_status_cd: 01=개선미이행, 02=개선계획, 03=승인요청, 04=개선이행, 05=개선완료)
      let color = '#666';
      let displayText = value;

      if (value === '01' || value === '개선미이행') {
        color = '#999';
        displayText = '개선미이행';
      } else if (value === '02' || value === '개선계획') {
        color = '#2196f3';
        displayText = '개선계획';
      } else if (value === '03' || value === '승인요청') {
        color = '#9c27b0';
        displayText = '승인요청';
      } else if (value === '04' || value === '개선이행' || value === '진행중') {
        color = '#ff9800';
        displayText = '개선이행';
      } else if (value === '05' || value === '완료' || value === '개선완료') {
        color = '#4caf50';
        displayText = '개선완료';
      }

      return (
        <span style={{ color, fontWeight: 500 }}>
          {displayText}
        </span>
      );
    }
  },
  {
    field: 'improvementPlanDate',
    headerName: '개선계획수립일자',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agDateColumnFilter',
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
    field: 'improvementApprovedDate',
    headerName: '개선계획승인일자',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agDateColumnFilter',
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
    field: 'improvementCompletedDate',
    headerName: '개선완료일자',
    width: 160,
    minWidth: 130,
    sortable: true,
    filter: 'agDateColumnFilter',
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
    field: 'finalInspectionResult',
    headerName: '최종점검결과',
    width: 160,
    minWidth: 130,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';

      // 최종점검결과에 따른 색상 표시 (final_inspection_result_cd: 01=승인, 02=반려)
      let color = '#666';
      let displayText = value;

      if (value === '01' || value === '승인') {
        color = '#4caf50';
        displayText = '승인';
      } else if (value === '02' || value === '반려') {
        color = '#f44336';
        displayText = '반려';
      }

      return (
        <span style={{ color, fontWeight: 500 }}>
          {displayText}
        </span>
      );
    }
  }
];

// 기본 정렬 설정
export const defaultSortModel = [
  {
    colId: 'sequenceNumber',
    sort: 'asc' as const
  }
];

// 기본 컬럼 상태 설정
export const defaultColumnState = [
  {
    colId: 'sequenceNumber',
    width: 80,
    pinned: 'left' as const
  }
];
