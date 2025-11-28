/**
 * 이행점검수행 AG-Grid 컬럼 정의
 * InspectorAssign와 동일한 스타일 적용
 */

import { ColDef } from 'ag-grid-community';
import React from 'react';
import { InspectionExecution } from '../../types/implMonitoringStatus.types';

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

/**
 * AG-Grid 컬럼 정의
 * - 점검명 다음에 책무, 책무상세, 관리의무 컬럼 추가
 * - 컬럼 너비를 데이터가 잘 보이도록 넉넉하게 설정
 * - 가로스크롤 지원을 위해 suppressSizeToFit 사용
 */
export const executionColumns: ColDef<InspectionExecution>[] = [
  {
    // 순번 컬럼 - 고정 너비
    field: 'sequenceNumber',
    headerName: '순번',
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    // 점검명 컬럼
    field: 'inspectionName',
    headerName: '점검명',
    width: 200,
    minWidth: 180,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 30 ? `${value.substring(0, 30)}...` : value;
    }
  },
  {
    // 책무 컬럼 (신규 추가)
    field: 'responsibilityInfo',
    headerName: '책무',
    width: 250,
    minWidth: 200,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      return value && value.length > 35 ? `${value.substring(0, 35)}...` : value;
    }
  },
  {
    // 책무상세 컬럼 (신규 추가)
    field: 'responsibilityDetailInfo',
    headerName: '책무상세',
    width: 300,
    minWidth: 250,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      return value && value.length > 40 ? `${value.substring(0, 40)}...` : value;
    }
  },
  {
    // 관리의무 컬럼
    field: 'obligationInfo',
    headerName: '관리의무',
    width: 350,
    minWidth: 300,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 45 ? `${value.substring(0, 45)}...` : (value || '');
    }
  },
  {
    // 관리활동명 컬럼 - 링크 스타일
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 320,
    minWidth: 280,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: ManagementActivityNameRenderer,
    cellStyle: { fontWeight: '500' }
  },
  {
    // 수행점검항목 컬럼
    field: 'inspectionMethod',
    headerName: '수행점검항목',
    width: 350,
    minWidth: 300,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      return value && value.length > 45 ? `${value.substring(0, 45)}...` : (value || '');
    }
  },
  {
    // 점검주기 컬럼
    field: 'activityFrequencyCd',
    headerName: '점검주기',
    width: 100,
    minWidth: 90,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    // 부서 컬럼
    field: 'orgCode',
    headerName: '부서',
    width: 120,
    minWidth: 100,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    // 점검자 컬럼 - 점검자명(성명) 표시
    field: 'inspectorName',
    headerName: '점검자',
    width: 100,
    minWidth: 90,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      // 점검자명이 없거나 빈 문자열인 경우 '미지정' 표시
      if (!value || value.trim() === '') {
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
    // 점검결과내용 컬럼
    field: 'inspectionDetail',
    headerName: '점검결과내용',
    width: 250,
    minWidth: 200,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-left',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const value = params.value;
      if (!value) return '-';
      return value && value.length > 35 ? `${value.substring(0, 35)}...` : value;
    }
  },
  {
    // 점검결과 컬럼
    field: 'inspectionResult',
    headerName: '점검결과',
    width: 100,
    minWidth: 90,
    suppressSizeToFit: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellRenderer: (params: any) => {
      const code = params.value;
      if (!code) return '-';

      // 코드를 텍스트로 변환 및 색상 지정 (부적정만 빨간색)
      let text = '';
      let color = '#666'; // 기본 색상

      if (code === '01') {
        text = '미점검';
      } else if (code === '02') {
        text = '적정';
      } else if (code === '03') {
        text = '부적정';
        color = '#f44336'; // 빨간색
      } else {
        // fallback: 코드 값 그대로 표시
        text = code;
      }

      return (
        <span style={{ color, fontWeight: 500 }}>
          {text}
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
