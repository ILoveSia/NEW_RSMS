import { ColDef } from 'ag-grid-community';
import { Report } from '../../types/reportList.types';

/**
 * 날짜 포맷 함수
 * - ISO 형식 또는 다양한 날짜 형식을 yyyy-mm-dd로 변환
 * @param dateString 날짜 문자열
 * @returns yyyy-mm-dd 형식 문자열
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  try {
    // ISO 형식 또는 다양한 날짜 형식 처리
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
};

/**
 * 보고서번호 렌더러 컴포넌트
 * - PositionMgmt의 직책 컬럼과 동일한 스타일 적용
 * - 파란색 글자에 hover 시 underline 표시
 */
const ReportNumberRenderer = ({ value, data, onCellClicked }: any) => {
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

// ReportList AG-Grid 컬럼 정의 (9개 컬럼) - PositionMgmt 표준 준수
export const reportColumns: ColDef<Report>[] = [
  {
    headerName: '순번',
    field: 'sequence',
    sortable: true,
    filter: true,
    width: 80,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '점검명',
    field: 'inspectionName',
    sortable: true,
    filter: true,
    width: 200,
    cellStyle: { display: 'flex', alignItems: 'center' }
  },
  {
    headerName: '점검기간',
    field: 'inspectionPeriod',
    sortable: true,
    filter: true,
    width: 140,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '보고서번호',
    field: 'reportNumber',
    sortable: true,
    filter: true,
    width: 150,
    cellRenderer: ReportNumberRenderer,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '보고서구분',
    field: 'category',
    sortable: true,
    filter: true,
    width: 110,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    valueGetter: (params) => {
      const category = params.data?.category;
      switch (category) {
        case 'EXECUTIVE':
          return '임원';
        case 'CEO':
          return 'CEO';
        case 'DEPARTMENT':
          return '부서별';
        case 'INTEGRATED':
          return '통합';
        default:
          return category || '';
      }
    }
  },
  {
    headerName: '작성자',
    field: 'author',
    sortable: true,
    filter: true,
    width: 100,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  },
  {
    headerName: '작성일자',
    field: 'createdAt',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    headerName: '결과',
    field: 'result',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
    cellStyle: { display: 'flex', alignItems: 'center' },
    wrapText: true,
    autoHeight: false
  },
  {
    headerName: '검토일자',
    field: 'approvedAt',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    valueFormatter: (params) => formatDate(params.value)
  }
];

// 컬럼 그룹 정의 (선택적)
export const reportColumnGroups = [
  {
    headerName: '기본 정보',
    children: ['sequence', 'department', 'category', 'inspectionName']
  },
  {
    headerName: '점검 정보',
    children: ['inspectionPeriod', 'reportNumber', 'status']
  },
  {
    headerName: '작성자 정보',
    children: ['author', 'createdAt', 'approver', 'approvedAt']
  },
  {
    headerName: '결과 정보',
    children: ['result', 'improvementAction']
  }
];

// 기본 그리드 설정
export const defaultReportGridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    cellStyle: {
      fontSize: '0.875rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }
  },
  rowHeight: 50,
  headerHeight: 45,
  suppressRowClickSelection: false,
  rowSelection: 'multiple',
  suppressColumnVirtualisation: false,
  suppressRowVirtualisation: false,
  animateRows: true,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  pagination: true,
  paginationPageSize: 25,
  paginationPageSizeSelector: [10, 25, 50, 100],
  suppressPaginationPanel: false,
  localeText: {
    // 한국어 번역
    page: '페이지',
    more: '더보기',
    to: '~',
    of: '/',
    next: '다음',
    last: '마지막',
    first: '처음',
    previous: '이전',
    loadingOoo: '로딩중...',
    selectAll: '모두선택',
    selectAllFiltered: '필터된항목 모두선택',
    searchOoo: '검색...',
    blanks: '공백',
    filterOoo: '필터...',
    applyFilter: '필터적용',
    equals: '같음',
    notEqual: '같지않음',
    contains: '포함',
    notContains: '포함하지않음',
    startsWith: '시작',
    endsWith: '끝남'
  }
};