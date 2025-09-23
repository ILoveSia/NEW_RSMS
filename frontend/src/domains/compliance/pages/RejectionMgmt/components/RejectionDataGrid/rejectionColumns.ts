import { ColDef } from 'ag-grid-community';
import { Rejection } from '../../types/rejection.types';

/**
 * 반려관리 AG-Grid 컬럼 정의
 * 요구사항 기반: 순번, 구분, 구분상세, 부품명, 내용, 요청일자, 요청자명, 요청자, 반려일자, 반려자명, 반려자, 반려의견
 */
export const rejectionColumns: ColDef<Rejection>[] = [
  {
    field: 'sequence',
    headerName: '순번',
    width: 80,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    type: 'numericColumn'
  },
  {
    field: 'category',
    headerName: '구분',
    width: 120,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'categoryDetail',
    headerName: '구분상세',
    width: 140,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'partName',
    headerName: '부품명',
    width: 180,
    sortable: true,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    tooltipField: 'partName'
  },
  {
    field: 'content',
    headerName: '내용',
    width: 250,
    sortable: true,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    tooltipField: 'content',
    cellRenderer: (params: any) => {
      const content = params.value || '';
      // 내용이 길 경우 말줄임표 처리
      if (content.length > 30) {
        return `${content.substring(0, 30)}...`;
      }
      return content;
    }
  },
  {
    field: 'requestDate',
    headerName: '요청일자',
    width: 110,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    valueFormatter: (params: any) => {
      if (!params.value) return '';
      // YYYY-MM-DD 형식으로 표시
      return params.value.split('T')[0];
    }
  },
  {
    field: 'requesterName',
    headerName: '요청자명',
    width: 100,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'requester',
    headerName: '요청자',
    width: 120,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'rejectionDate',
    headerName: '반려일자',
    width: 110,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    valueFormatter: (params: any) => {
      if (!params.value) return '';
      // YYYY-MM-DD 형식으로 표시
      return params.value.split('T')[0];
    }
  },
  {
    field: 'rejectorName',
    headerName: '반려자명',
    width: 100,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'rejector',
    headerName: '반려자',
    width: 120,
    sortable: true,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },
  {
    field: 'rejectionComment',
    headerName: '반려의견',
    width: 200,
    sortable: true,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    tooltipField: 'rejectionComment',
    cellRenderer: (params: any) => {
      const comment = params.value || '';
      // 반려의견이 길 경우 말줄임표 처리
      if (comment.length > 25) {
        return `${comment.substring(0, 25)}...`;
      }
      return comment;
    }
  },
  {
    field: 'status',
    headerName: '상태',
    width: 90,
    sortable: true,
    cellStyle: (params: any) => {
      const status = params.value;
      let backgroundColor = '#f5f5f5';
      let color = '#333';

      switch (status) {
        case '처리중':
          backgroundColor = '#fff3cd';
          color = '#856404';
          break;
        case '반려':
          backgroundColor = '#f8d7da';
          color = '#721c24';
          break;
        case '완료':
          backgroundColor = '#d1edff';
          color = '#0c5460';
          break;
        case '재처리대기':
          backgroundColor = '#d4edda';
          color = '#155724';
          break;
        default:
          break;
      }

      return {
        backgroundColor,
        color,
        textAlign: 'center',
        fontWeight: '500',
        borderRadius: '4px',
        padding: '2px 6px'
      };
    },
    headerClass: 'ag-header-cell-center'
  }
];