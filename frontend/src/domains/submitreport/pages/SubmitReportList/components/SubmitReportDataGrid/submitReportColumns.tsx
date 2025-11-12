import { ColDef } from 'ag-grid-community';
import { SubmitReport } from '../../types/submitReportList.types';

/**
 * 제출보고서목록 AG-Grid 컬럼 정의 (8개 컬럼)
 * submit_reports 테이블 구조 기반
 * 순번, 책무이행차수, 제출기관, 제출보고서, 직책, 제출대상임원, 제출일, 첨부파일
 */
export const submitReportColumns: ColDef<SubmitReport>[] = [
  {
    headerName: '순번',
    field: 'sequence',
    sortable: true,
    filter: true,
    width: 80,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '책무이행차수',
    field: 'ledgerOrderId',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '제출기관',
    field: 'submittingAgency',
    sortable: true,
    filter: true,
    width: 150,
    cellStyle: { display: 'flex', alignItems: 'center' }
  },
  {
    headerName: '제출보고서',
    field: 'reportType',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
    cellStyle: { display: 'flex', alignItems: 'center' }
  },
  {
    headerName: '직책',
    field: 'positionName',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '제출대상임원',
    field: 'targetExecutiveName',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '제출일',
    field: 'submissionDate',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '첨부파일',
    field: 'attachmentCount',
    sortable: true,
    filter: false,
    width: 100,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    valueGetter: (params) => {
      const count = params.data?.attachmentCount;
      return count ? `${count}개` : '-';
    }
  }
];
