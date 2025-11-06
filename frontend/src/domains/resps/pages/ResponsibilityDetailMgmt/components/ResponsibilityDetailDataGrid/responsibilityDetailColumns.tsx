/**
 * 책무상세관리 Grid 컬럼 정의
 * - AG-Grid 컬럼 설정
 * - 책무상세 정보 표시
 *
 * @author Claude AI
 * @since 2025-01-06
 */

import { ColDef } from 'ag-grid-community';
import type { ResponsibilityDetailDto } from '@/domains/resps/types/responsibilityDetail.types';

/**
 * 같은 책무내용 그룹의 마지막 행인지 확인
 * - AG-Grid rowClassRules에서 사용
 *
 * @param params AG-Grid params
 * @returns 마지막 행이면 true, 아니면 false
 */
export const isLastRowInGroup = (params: any): boolean => {
  if (!params.data || !params.api) return false;

  const currentRowIndex = params.node.rowIndex;
  const currentGroupValue = params.data.책무내용;

  // 다음 행 가져오기
  const nextRowNode = params.api.getDisplayedRowAtIndex(currentRowIndex + 1);

  // 다음 행이 없으면 마지막 행
  if (!nextRowNode || !nextRowNode.data) return true;

  const nextGroupValue = nextRowNode.data.책무내용;

  // 다음 행의 책무내용이 다르면 현재 그룹의 마지막 행
  return currentGroupValue !== nextGroupValue;
};

/**
 * AG-Grid 표시용 Row 타입
 * - 한글 컬럼명 사용
 */
export interface ResponsibilityDetailGridRow {
  순번?: number;
  책무세부코드: string;
  책무세부내용: string;
  책무내용: string;  // 책무코드 → 책무내용으로 변경
  등록일자?: string;
  등록자?: string;
  수정일자?: string;
  수정자?: string;
  사용여부: string;
  // DTO 원본 데이터
  _original?: ResponsibilityDetailDto;
}

/**
 * DTO → Grid Row 변환 함수
 */
export const convertToGridRow = (
  dto: ResponsibilityDetailDto,
  index: number
): ResponsibilityDetailGridRow => ({
  순번: index + 1,
  책무세부코드: dto.responsibilityDetailCd,
  책무세부내용: dto.responsibilityDetailInfo,
  책무내용: dto.responsibilityInfo || '',  // 책무코드 → 책무내용으로 변경
  등록일자: dto.createdAt ? dto.createdAt.split('T')[0] : '',
  등록자: dto.createdBy || '',
  수정일자: dto.updatedAt ? dto.updatedAt.split('T')[0] : '',
  수정자: dto.updatedBy || '',
  사용여부: dto.isActive === 'Y' ? '사용' : '미사용',
  _original: dto
});

/**
 * 책무상세관리 Grid 컬럼 생성
 * - ResponsibilityMgmt 구조 100% 준수
 * - 컬럼 순서: 순번, 책무내용, 책무세부코드, 책무세부내용, 등록일자, 등록자, 수정일자, 수정자
 */
export const createResponsibilityDetailColumns = (
  onDetailClick?: (data: ResponsibilityDetailGridRow) => void
): ColDef<ResponsibilityDetailGridRow>[] => [
  {
    headerName: '순번',
    field: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '책무내용',
    field: '책무내용',
    width: 250,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '책무내용'
  },
  {
    headerName: '책무세부코드',
    field: '책무세부코드',
    width: 220,
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
    cellClass: 'responsibility-detail-clickable-cell'
  },
  {
    headerName: '책무세부내용',
    field: '책무세부내용',
    width: 400,
    flex: 1,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '책무세부내용'
  },
  {
    headerName: '등록일자',
    field: '등록일자',
    width: 120,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '등록자',
    field: '등록자',
    width: 100,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '수정일자',
    field: '수정일자',
    width: 120,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '수정자',
    field: '수정자',
    width: 100,
    cellStyle: { textAlign: 'center' }
  }
];
