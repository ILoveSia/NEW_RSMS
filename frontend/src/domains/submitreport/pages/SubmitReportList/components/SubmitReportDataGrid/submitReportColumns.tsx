import { ColDef } from 'ag-grid-community';
import { SubmitReport } from '../../types/submitReportList.types';

// 제출보고서제목 링크 렌더러 (상세조회용)
// Row 더블클릭으로 상세 모달이 열리므로, 여기서는 스타일만 적용
const ReportTitleRenderer = ({ value }: any) => {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      style={{
        color: '#1976d2',
        textDecoration: 'none',
        fontWeight: '500',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = 'none';
      }}
    >
      {value || '-'}
    </a>
  );
};

/**
 * 코드명 변환 함수 타입
 * - useCommonCode의 getCodeName 함수와 동일한 시그니처
 */
type GetCodeNameFn = (detailCode: string) => string;

/**
 * 컬럼 생성에 필요한 코드명 변환 함수들
 */
interface CodeNameGetters {
  /** 제출기관 코드명 변환 (SUB_AGENCY_CD) */
  getSubmittingAgencyName: GetCodeNameFn;
  /** 제출보고서구분 코드명 변환 (SUB_REPORT_TYCD) */
  getReportTypeName: GetCodeNameFn;
}

/**
 * 제출보고서목록 AG-Grid 컬럼 정의 생성 함수 (9개 컬럼)
 * submit_reports 테이블 구조 기반
 * 순번, 책무이행차수, 제출기관, 제출보고서구분, 제출보고서제목, 직책, 제출대상임원, 제출일, 첨부파일
 *
 * @param codeNameGetters 코드명 변환 함수 객체
 * @returns AG-Grid 컬럼 정의 배열
 */
export const createSubmitReportColumns = (codeNameGetters: CodeNameGetters): ColDef<SubmitReport>[] => [
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
    field: 'submittingAgencyName',
    sortable: true,
    filter: true,
    width: 150,
    cellStyle: { display: 'flex', alignItems: 'center' },
    // 코드값(submittingAgencyCd)을 코드명으로 변환하여 표시
    valueGetter: (params) => {
      const code = params.data?.submittingAgencyCd;
      return code ? codeNameGetters.getSubmittingAgencyName(code) : '-';
    }
  },
  {
    headerName: '제출보고서구분',
    field: 'reportTypeName',
    sortable: true,
    filter: true,
    width: 180,
    cellStyle: { display: 'flex', alignItems: 'center' },
    // 코드값(reportTypeCd)을 코드명으로 변환하여 표시
    valueGetter: (params) => {
      const code = params.data?.reportTypeCd;
      return code ? codeNameGetters.getReportTypeName(code) : '-';
    }
  },
  {
    headerName: '제출보고서제목',
    field: 'subReportTitle',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
    cellRenderer: ReportTitleRenderer,
    cellStyle: { fontWeight: '500' }
  },
  {
    headerName: '직책',
    field: 'positionName',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    valueGetter: (params) => params.data?.positionName || '-'
  },
  {
    headerName: '제출대상임원',
    field: 'targetExecutiveName',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    valueGetter: (params) => params.data?.targetExecutiveName || '-'
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
