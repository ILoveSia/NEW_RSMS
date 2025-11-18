/**
 * 관리의무관리 Grid 컬럼 정의
 * - AG-Grid 컬럼 설정
 * - 관리의무 정보 표시
 *
 * @author Claude AI
 * @since 2025-01-06
 */

import { ColDef } from 'ag-grid-community';
import type { ManagementObligationDto } from '@/domains/resps/types/managementObligation.types';

/**
 * AG-Grid 표시용 Row 타입
 * - 한글 컬럼명 사용
 */
export interface ManagementObligationGridRow {
  순번?: number;
  책무세부내용: string;
  관리의무코드: string;
  관리의무대분류: string;
  관리의무내용: string;
  조직명: string;
  사용여부: string;
  등록일자?: string;
  등록자?: string;
  수정일자?: string;
  수정자?: string;
  // DTO 원본 데이터
  _original?: ManagementObligationDto;
}

/**
 * DTO → Grid Row 변환 함수
 */
export const convertToGridRow = (
  dto: ManagementObligationDto,
  index: number
): ManagementObligationGridRow => ({
  순번: index + 1,
  책무세부내용: dto.responsibilityDetailInfo || '',
  관리의무코드: dto.obligationCd,
  관리의무대분류: dto.obligationMajorCatName
    ? `${dto.obligationMajorCatName}(${dto.obligationMajorCatCd})`
    : dto.obligationMajorCatCd,
  관리의무내용: dto.obligationInfo,
  조직명: dto.orgName && dto.orgCode ? `${dto.orgName}(${dto.orgCode})` : (dto.orgName || ''),
  사용여부: dto.isActive === 'Y' ? '사용' : '미사용',
  등록일자: dto.createdAt ? dto.createdAt.split('T')[0] : '',
  등록자: dto.createdBy || '',
  수정일자: dto.updatedAt ? dto.updatedAt.split('T')[0] : '',
  수정자: dto.updatedBy || '',
  _original: dto
});

/**
 * 관리의무관리 Grid 컬럼 생성
 * - ResponsibilityMgmt 구조 100% 준수
 * - 컬럼 순서: 순번, 책무세부내용, 관리의무코드, 관리의무대분류, 관리의무내용, 조직명, 사용여부, 등록일자, 등록자, 수정일자, 수정자
 */
export const createManagementObligationColumns = (
  onDetailClick?: (data: ManagementObligationGridRow) => void
): ColDef<ManagementObligationGridRow>[] => [
  {
    headerName: '순번',
    field: '순번',
    width: 70,
    cellStyle: { textAlign: 'center' },
  },
  {
    headerName: '책무세부내용',
    field: '책무세부내용',
    width: 250,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '책무세부내용'
  },
  {
    headerName: '관리의무코드',
    field: '관리의무코드',
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
    cellClass: 'management-obligation-clickable-cell'
  },
  {
    headerName: '관리의무 대분류',
    field: '관리의무대분류',
    width: 140,
    cellStyle: { textAlign: 'center' }
  },
  {
    headerName: '관리의무 내용',
    field: '관리의무내용',
    width: 350,
    flex: 1,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' },
    tooltipField: '관리의무내용'
  },
  {
    headerName: '조직명',
    field: '조직명',
    width: 180,
    cellStyle: { textAlign: 'left', paddingLeft: '12px' }
  },
  {
    headerName: '사용여부',
    field: '사용여부',
    width: 80,
    cellStyle: { textAlign: 'center' }
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
    width: 90,
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
    width: 90,
    cellStyle: { textAlign: 'center' }
  }
];

/**
 * 책무세부내용 그룹의 마지막 행인지 확인하는 함수
 * - 같은 책무세부내용을 가진 행들의 마지막 행에만 진한 border를 적용
 */
export const isLastRowInGroup = (params: any): boolean => {
  if (!params.data || !params.api) return false;

  const currentRowIndex = params.node.rowIndex;
  const currentGroupValue = params.data.책무세부내용;

  // 다음 행 가져오기
  const nextRowNode = params.api.getDisplayedRowAtIndex(currentRowIndex + 1);

  // 다음 행이 없거나, 다음 행의 책무세부내용이 다르면 그룹의 마지막 행
  if (!nextRowNode || !nextRowNode.data) return true;

  const nextGroupValue = nextRowNode.data.책무세부내용;
  return currentGroupValue !== nextGroupValue;
};
