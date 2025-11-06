/**
 * 책무관리 Grid 컬럼 정의
 * - AG-Grid 컬럼 설정
 * - 책무 정보만 표시 (세부/의무는 별도 페이지)
 *
 * @author Claude AI
 * @since 2025-11-05
 */

import { ColDef } from 'ag-grid-community';
import type { ResponsibilityGridRow } from '../../types/responsibility.types';

/**
 * 책무관리 Grid 컬럼 생성
 * - 책무세부, 관리의무 컬럼 제거 (각각 별도 페이지로 분리)
 */
export const createResponsibilityColumns = (
  onDetailClick?: (data: ResponsibilityGridRow) => void
): ColDef<ResponsibilityGridRow>[] => [
  {
    headerName: '순번',
    field: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' },
  },
  {
    headerName: '책무코드',
    field: '책무코드',
    width: 150,
    cellStyle: {
      textAlign: 'center',
      cursor: 'pointer',
      color: '#1976d2',
      fontWeight: 500
    },
    onCellClicked: (params) => {
      if (onDetailClick && params.data) {
        onDetailClick(params.data);
      }
    },
    cellClass: 'responsibility-clickable-cell'
  },
  {
    headerName: '책무이행차수',
    field: '책무이행차수',
    width: 120,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '직책명',
    field: '직책명',
    width: 150,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '책무카테고리',
    field: '책무카테고리',
    width: 150,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '책무내용',
    field: '책무내용',
    width: 300,
    flex: 1,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '책무내용'
  },
  {
    headerName: '책무관련근거',
    field: '책무관련근거',
    width: 250,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '책무관련근거'
  },
  {
    headerName: '사용여부',
    field: '사용여부',
    width: 100,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '등록일자',
    field: '등록일자',
    width: 120,
    valueFormatter: (params) => {
      const value = params.value;
      if (!value) return '';
      // ISO 형식(YYYY-MM-DDTHH:mm:ss) 또는 YYYY-MM-DD 형식 모두 처리
      return value.split('T')[0];
    },
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '등록자',
    field: '등록자',
    width: 120,
    cellStyle: { textAlign: 'center' }
  }
];
