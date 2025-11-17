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
 * 같은 직책명 그룹의 마지막 행인지 확인
 * - AG-Grid rowClassRules에서 사용
 *
 * @param params AG-Grid params
 * @returns 마지막 행이면 true, 아니면 false
 */
export const isLastRowInGroup = (params: any): boolean => {
  if (!params.data || !params.api) return false;

  const currentRowIndex = params.node.rowIndex;
  const currentGroupValue = params.data.직책명;

  // 다음 행 가져오기
  const nextRowNode = params.api.getDisplayedRowAtIndex(currentRowIndex + 1);

  // 다음 행이 없으면 마지막 행
  if (!nextRowNode || !nextRowNode.data) return true;

  const nextGroupValue = nextRowNode.data.직책명;

  // 다음 행의 직책명이 다르면 현재 그룹의 마지막 행
  return currentGroupValue !== nextGroupValue;
};

/**
 * 책무관리 Grid 컬럼 생성
 * - 컬럼 순서: 순번, 책무코드, 책무구분, 직책명, 책무, 관련 법령 및 내규, 사용여부, 등록일자, 등록자
 * - 책무이행차수 컬럼 삭제
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
    headerName: '책무구분',
    field: '책무카테고리',
    width: 150,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '직책명',
    field: '직책명',
    width: 150,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '책무',
    field: '책무내용',
    width: 300,
    flex: 1,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '책무내용'
  },
  {
    headerName: '관련 법령 및 내규',
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

      // 문자열인 경우
      if (typeof value === 'string') {
        // ISO 형식(YYYY-MM-DDTHH:mm:ss) 또는 공백 포함 형식 처리
        if (value.includes('T')) {
          return value.split('T')[0];
        } else if (value.includes(' ')) {
          return value.split(' ')[0];
        }
        // 이미 YYYY-MM-DD 형식이면 그대로 반환
        return value;
      }

      // Date 객체인 경우
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }

      return String(value).split('T')[0].split(' ')[0];
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
