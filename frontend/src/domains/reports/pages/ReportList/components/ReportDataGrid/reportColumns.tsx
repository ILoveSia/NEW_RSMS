import { ColDef } from 'ag-grid-community';
import { Report, ReportStatus } from '../../types/reportList.types';

// 상태별 색상 정의
const getStatusColor = (status: ReportStatus): string => {
  switch (status) {
    case 'DRAFT':
      return '#ed6c02'; // 주황색 (작성중)
    case 'SUBMITTED':
      return '#0288d1'; // 파란색 (제출완료)
    case 'REVIEWING':
      return '#9c27b0'; // 보라색 (검토중)
    case 'APPROVED':
      return '#2e7d32'; // 녹색 (승인완료)
    case 'REJECTED':
      return '#d32f2f'; // 빨간색 (반려)
    case 'COMPLETED':
      return '#388e3c'; // 진한 녹색 (완료)
    default:
      return '#666666'; // 기본 회색
  }
};

// 상태별 텍스트 정의
const getStatusText = (status: ReportStatus): string => {
  switch (status) {
    case 'DRAFT':
      return '작성중';
    case 'SUBMITTED':
      return '제출완료';
    case 'REVIEWING':
      return '검토중';
    case 'APPROVED':
      return '승인완료';
    case 'REJECTED':
      return '반려';
    case 'COMPLETED':
      return '완료';
    default:
      return status;
  }
};

// 상태 렌더러 컴포넌트
const StatusRenderer = (params: any) => {
  const status = params.value as ReportStatus;
  const color = getStatusColor(status);
  const text = getStatusText(status);

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'white',
        backgroundColor: color,
        textAlign: 'center',
        minWidth: '60px'
      }}
    >
      {text}
    </span>
  );
};

// 구분(Category) 렌더러 컴포넌트
const CategoryRenderer = (params: any) => {
  const category = params.value;
  let text = '';
  let color = '#666666';

  switch (category) {
    case 'EXECUTIVE':
      text = '임원';
      color = '#1976d2';
      break;
    case 'CEO':
      text = 'CEO';
      color = '#d32f2f';
      break;
    case 'DEPARTMENT':
      text = '부서별';
      color = '#388e3c';
      break;
    case 'INTEGRATED':
      text = '통합';
      color = '#7b1fa2';
      break;
    default:
      text = category;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: 'white',
        backgroundColor: color,
        textAlign: 'center',
        minWidth: '50px'
      }}
    >
      {text}
    </span>
  );
};

// 날짜 포맷 함수
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// ReportList AG-Grid 컬럼 정의 (13개 컬럼)
export const reportColumns: ColDef<Report>[] = [
  {
    field: 'sequence',
    headerName: '순번',
    width: 80,
    minWidth: 60,
    sortable: true,
    filter: false,
    resizable: false,
    cellStyle: {
      textAlign: 'center',
      fontWeight: '600',
      color: '#666666'
    }
  },
  {
    field: 'department',
    headerName: '부서',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: {
      fontWeight: '500'
    }
  },
  {
    field: 'category',
    headerName: '구분',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    cellRenderer: CategoryRenderer,
    cellStyle: {
      textAlign: 'center'
    }
  },
  {
    field: 'inspectionName',
    headerName: '점검명',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: {
      fontWeight: '500'
    },
    tooltipField: 'inspectionName'
  },
  {
    field: 'inspectionPeriod',
    headerName: '점검기간',
    width: 140,
    minWidth: 120,
    sortable: true,
    filter: false,
    resizable: true,
    cellStyle: {
      textAlign: 'center',
      fontSize: '0.85rem'
    }
  },
  {
    field: 'reportNumber',
    headerName: '보고서번호',
    width: 130,
    minWidth: 110,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: {
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      color: '#1976d2'
    }
  },
  {
    field: 'status',
    headerName: '상태',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    cellRenderer: StatusRenderer,
    cellStyle: {
      textAlign: 'center'
    }
  },
  {
    field: 'author',
    headerName: '작성자',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: {
      fontWeight: '500'
    }
  },
  {
    field: 'createdAt',
    headerName: '작성일자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    valueFormatter: (params) => formatDate(params.value),
    cellStyle: {
      textAlign: 'center',
      fontSize: '0.85rem'
    }
  },
  {
    field: 'approver',
    headerName: '결재자',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: {
      fontWeight: '500'
    },
    valueFormatter: (params) => params.value || '-'
  },
  {
    field: 'approvedAt',
    headerName: '결재일자',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    valueFormatter: (params) => formatDate(params.value),
    cellStyle: {
      textAlign: 'center',
      fontSize: '0.85rem'
    }
  },
  {
    field: 'result',
    headerName: '결과',
    width: 100,
    minWidth: 80,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: (params) => {
      const result = params.value;
      let color = '#666666';

      if (result === '적정') {
        color = '#2e7d32';
      } else if (result === '개선필요') {
        color = '#ed6c02';
      } else if (result === '부적정') {
        color = '#d32f2f';
      }

      return {
        textAlign: 'center',
        fontWeight: '600',
        color: color
      };
    },
    valueFormatter: (params) => params.value || '-'
  },
  {
    field: 'improvementAction',
    headerName: '개선조치',
    flex: 1,
    minWidth: 150,
    sortable: false,
    filter: 'agTextColumnFilter',
    resizable: true,
    cellStyle: {
      fontSize: '0.85rem',
      lineHeight: '1.4'
    },
    tooltipField: 'improvementAction',
    valueFormatter: (params) => params.value || '-',
    cellClass: 'text-wrap'
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