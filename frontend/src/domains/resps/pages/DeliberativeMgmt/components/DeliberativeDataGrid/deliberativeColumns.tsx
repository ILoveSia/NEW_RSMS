/**
 * 회의체관리 AG-Grid 컬럼 정의
 * PositionMgmt.tsx 표준을 기반으로 설계
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { Deliberative } from '../../types/deliberative.types';
import { CommonCodeDetail } from '@/app/store/codeStore';

// 사용여부 렌더러
const ActiveStatusRenderer = ({ value }: { value: boolean }) => {
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: value ? '#dcfce7' : '#fef2f2',
        color: value ? '#166534' : '#dc2626'
      }}
    >
      {value ? 'Y' : 'N'}
    </span>
  );
};

// 회의체명 링크 렌더러 (상세조회용)
const DeliberativeNameRenderer = ({ value, data, onCellClicked }: any) => {
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

// 개최주기 렌더러 (공통코드 기반)
const createHoldingPeriodRenderer = (holdingPeriodCodes: CommonCodeDetail[]) => {
  return ({ value }: { value: string }) => {
    // 공통코드에서 detailCode에 해당하는 detailName 찾기
    const code = holdingPeriodCodes.find(c => c.detailCode === value);
    const displayText = code ? code.detailName : value;

    return (
      <span style={{
        padding: '2px 6px',
        backgroundColor: '#f1f5f9',
        borderRadius: '3px',
        fontSize: '0.875rem'
      }}>
        {displayText}
      </span>
    );
  };
};

// 주요심의사항 요약 렌더러
const MainAgendaRenderer = ({ value }: { value: string }) => {
  const maxLength = 30;
  const displayText = value && value.length > maxLength
    ? `${value.substring(0, maxLength)}...`
    : value || '';

  return (
    <span title={value} style={{ fontSize: '0.875rem' }}>
      {displayText}
    </span>
  );
};

/**
 * 회의체관리 컬럼 정의 생성 함수
 * @param holdingPeriodCodes 개최주기 공통코드 목록
 * @returns AG-Grid 컬럼 정의
 */
export const createDeliberativeColumns = (holdingPeriodCodes: CommonCodeDetail[]): ColDef<Deliberative>[] => [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    sortable: true,
    filter: false,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'name',
    headerName: '회의체명',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: DeliberativeNameRenderer,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'holdingPeriod',
    headerName: '개최주기',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: createHoldingPeriodRenderer(holdingPeriodCodes),
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'chairperson',
    headerName: '위원장',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'members',
    headerName: '위원',
    width: 250,
    sortable: false,
    filter: false,
    cellRenderer: ({ value }: { value: string }) => (
      <span title={value} style={{ fontSize: '0.875rem' }}>
        {value && value.length > 30 ? `${value.substring(0, 30)}...` : value || ''}
      </span>
    )
  },
  {
    field: 'mainAgenda',
    headerName: '주요심의사항',
    width: 300,
    sortable: false,
    filter: false,
    cellRenderer: MainAgendaRenderer,
    wrapText: false
  },
  {
    field: 'registrationDate',
    headerName: '등록일자',
    width: 110,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellStyle: { textAlign: 'center', fontSize: '0.875rem' }
  },
  {
    field: 'registrar',
    headerName: '등록자',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'isActive',
    headerName: '사용여부',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: ActiveStatusRenderer,
    cellStyle: { textAlign: 'center' }
  }
];

// 회의체 위원 테이블 컬럼 (모달 내부용)
export const memberColumns: ColDef<any>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    sortable: false,
    filter: false,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'type',
    headerName: '구분',
    width: 100,
    sortable: false,
    filter: false,
    cellRenderer: ({ value }: { value: string }) => (
      <span style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: value === 'chairman' ? '#dbeafe' : '#f3f4f6',
        color: value === 'chairman' ? '#1e40af' : '#374151'
      }}>
        {value === 'chairman' ? '위원장' : '위원'}
      </span>
    ),
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'name',
    headerName: '성명',
    width: 120,
    sortable: false,
    filter: false,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'position',
    headerName: '직책',
    width: 150,
    sortable: false,
    filter: false,
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'organization',
    headerName: '소속',
    width: 150,
    sortable: false,
    filter: false,
    cellStyle: { fontSize: '0.875rem' }
  }
];