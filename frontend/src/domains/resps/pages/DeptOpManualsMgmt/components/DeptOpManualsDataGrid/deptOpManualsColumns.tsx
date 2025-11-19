/**
 * 부서장업무메뉴얼관리 AG-Grid 컬럼 정의
 * @description PositionMgmt 표준을 따라 부서장업무메뉴얼관리 그리드 컬럼을 정의
 */

import { Chip, Tooltip } from '@mui/material';
import { ColDef, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import React from 'react';
import type { UseCommonCodeReturn } from '@/shared/hooks/useCommonCode/useCommonCode';
import {
  ApprovalStatus,
  DeptOpManual,
  ManagementActivityStatus,
  RiskAssessmentLevel
} from '../../types/deptOpManuals.types';

// 🎨 스타일 상수
const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  approved: 'info'
} as const;

const RISK_COLORS = {
  very_high: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
  very_low: 'success'
} as const;

const APPROVAL_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  draft: 'default'
} as const;

const ACTIVITY_TYPE_COLORS = {
  compliance: 'primary',
  risk: 'error',
  internal_audit: 'info',
  operation: 'success',
  finance: 'warning',
  hr: 'secondary'
} as const;

// 🏷️ 라벨 맵핑
const STATUS_LABELS = {
  active: '사용',
  inactive: '미사용',
  pending: '검토중',
  approved: '승인완료'
};

const RISK_LABELS = {
  very_high: '매우높음',
  high: '높음',
  medium: '보통',
  low: '낮음',
  very_low: '매우낮음'
};

const APPROVAL_LABELS = {
  pending: '미결재',
  approved: '결재완료',
  rejected: '결재반려',
  draft: '임시저장'
};

const ACTIVITY_TYPE_LABELS = {
  compliance: '고유',
  risk: '공통',
  internal_audit: '내부감사',
  operation: '운영',
  finance: '재무',
  hr: '인사'
};

// 🎯 셀 렌더러 컴포넌트들

/**
 * 상태 셀 렌더러
 */
const StatusCellRenderer: React.FC<{ value: ManagementActivityStatus }> = ({ value }) => (
  <Chip
    label={STATUS_LABELS[value] || value}
    color={STATUS_COLORS[value] || 'default'}
    size="small"
    variant="filled"
  />
);

/**
 * 위험평가등급 셀 렌더러
 */
const RiskLevelCellRenderer: React.FC<{ value: RiskAssessmentLevel }> = ({ value }) => (
  <Chip
    label={RISK_LABELS[value] || value}
    color={RISK_COLORS[value] || 'default'}
    size="small"
    variant="filled"
  />
);

/**
 * 결재여부 셀 렌더러
 */
const ApprovalStatusCellRenderer: React.FC<{ value: ApprovalStatus }> = ({ value }) => (
  <Chip
    label={APPROVAL_LABELS[value] || value}
    color={APPROVAL_COLORS[value] || 'default'}
    size="small"
    variant="filled"
  />
);

/**
 * 사용여부 셀 렌더러
 */
const ActiveStatusCellRenderer: React.FC<{ value: boolean }> = ({ value }) => (
  <Chip
    label={value ? 'Y' : 'N'}
    color={value ? 'success' : 'default'}
    size="small"
    variant="filled"
  />
);

/**
 * 긴 텍스트 셀 렌더러 (툴팁 포함)
 */
const LongTextCellRenderer: React.FC<{ value: string }> = ({ value }) => (
  <Tooltip title={value} placement="top" arrow>
    <div style={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%'
    }}>
      {value}
    </div>
  </Tooltip>
);

/**
 * 관리의무 링크 렌더러 (상세조회용)
 * PositionMgmt의 PositionNameRenderer 패턴 적용
 */
const ManagementObligationRenderer = ({ value, data, onCellClicked }: any) => {
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

/**
 * 날짜시간 포맷터
 */
const dateTimeFormatter = (params: ValueFormatterParams): string => {
  if (!params.value) return '-';

  try {
    const date = new Date(params.value);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return params.value;
  }
};

// 📊 AG-Grid 컬럼 정의
// dept_manager_manuals 테이블 구조에 맞게 재정의
// 컬럼 순서: 순번, 책무구분, 책무, 책무상세, 관리의무, 부서명, 책무관리항목, 관리활동명, 점검항목, 점검주기, 사용여부
export const deptOpManualsColumns = (
  responsibilityCategoryCode: UseCommonCodeReturn,
  execCheckFrequencyCode: UseCommonCodeReturn
): ColDef<DeptOpManual>[] => [
  // 체크박스 컬럼은 AG-Grid에서 자동으로 첫 번째에 추가됨

  // 1. 순번 (사이즈 유지)
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center'
  },

  // 2. 책무구분 (사이즈 유지) - 공통코드로 코드명 표시
  {
    field: 'responsibilityCat',
    headerName: '책무구분',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    valueGetter: (params: ValueGetterParams<DeptOpManual>) => {
      const codeValue = params.data?.responsibilityCat;
      if (!codeValue) return '';
      // 공통코드로 코드값을 코드명으로 변환 (예: 'R' -> '고유')
      return responsibilityCategoryCode.getCodeName(codeValue) || codeValue;
    }
  },

  // 3. 책무 (200 → 350 → 550 → 275)
  {
    field: 'responsibilityInfo',
    headerName: '책무',
    width: 275,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'responsibilityInfo'
  },

  // 4. 책무상세 (220 → 400 → 650 → 325)
  {
    field: 'responsibilityDetailInfo',
    headerName: '책무상세',
    width: 325,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'responsibilityDetailInfo'
  },

  // 5. 관리의무 (220 → 350 → 550) - 클릭 가능 스타일 제거
  {
    field: 'obligationInfo',
    headerName: '관리의무',
    width: 550,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'obligationInfo'
  },

  // 6. 부서명 (150 → 250 → 125)
  {
    field: 'orgName',
    headerName: '부서명',
    width: 125,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer
  },

  // 7. 책무관리항목 (200 → 350 → 550)
  {
    field: 'respItem',
    headerName: '책무관리항목',
    width: 550,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'respItem'
  },

  // 8. 관리활동명 (180 → 350 → 550) - 클릭 가능 스타일 추가
  {
    field: 'activityName',
    headerName: '관리활동명',
    width: 550,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: ManagementObligationRenderer,
    cellStyle: { fontWeight: '500' },
    tooltipField: 'activityName'
  },

  // 9. 점검항목 (180 → 350 → 550)
  {
    field: 'execCheckMethod',
    headerName: '점검항목',
    width: 550,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'execCheckMethod'
  },

  // 10. 점검주기 (사이즈 유지) - 공통코드로 코드명 표시
  {
    field: 'execCheckFrequencyCd',
    headerName: '점검주기',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    valueGetter: (params: ValueGetterParams<DeptOpManual>) => {
      const code = params.data?.execCheckFrequencyCd;
      return code ? execCheckFrequencyCode.getCodeName(code) : '';
    }
  },

  // 11. 사용여부 (사이즈 유지)
  {
    field: 'isActive',
    headerName: '사용여부',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: ActiveStatusCellRenderer,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    filterParams: {
      values: [true, false],
      valueFormatter: (params: any) => params.value ? 'Y' : 'N'
    }
  },

  // 이하 추가 컬럼들 (기본적으로 숨김)

  // 부서업무메뉴얼CD (PK)
  {
    field: 'manualCd',
    headerName: '메뉴얼코드',
    width: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    hide: true
  },

  // 점검세부내용 (dept_manager_manuals.exec_check_detail)
  {
    field: 'execCheckDetail',
    headerName: '점검세부내용',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'execCheckDetail',
    hide: true
  },

  // 수행자ID
  {
    field: 'executorId',
    headerName: '수행자ID',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    hide: true
  },

  // 수행일자
  {
    field: 'executionDate',
    headerName: '수행일자',
    width: 120,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 수행여부
  {
    field: 'executionStatus',
    headerName: '수행여부',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    valueFormatter: (params: ValueFormatterParams) => {
      if (params.value === '01') return '미수행';
      if (params.value === '02') return '수행완료';
      return params.value || '-';
    },
    hide: true
  },

  // 수행결과코드
  {
    field: 'executionResultCd',
    headerName: '수행결과',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    valueFormatter: (params: ValueFormatterParams) => {
      if (params.value === '01') return '적정';
      if (params.value === '02') return '부적정';
      return params.value || '-';
    },
    hide: true
  },

  // 수행결과내용
  {
    field: 'executionResultContent',
    headerName: '수행결과내용',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'executionResultContent',
    hide: true
  },

  // 등록일시
  {
    field: 'createdAt',
    headerName: '등록일시',
    width: 140,
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: dateTimeFormatter,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 등록자
  {
    field: 'createdBy',
    headerName: '등록자',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 수정일시
  {
    field: 'updatedAt',
    headerName: '수정일시',
    width: 140,
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: dateTimeFormatter,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 수정자
  {
    field: 'updatedBy',
    headerName: '수정자',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 승인일시
  {
    field: 'approvedAt',
    headerName: '승인일시',
    width: 140,
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: dateTimeFormatter,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 승인자
  {
    field: 'approvedBy',
    headerName: '승인자',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    hide: true
  },

  // 비고
  {
    field: 'remarks',
    headerName: '비고',
    width: 200,
    sortable: false,
    filter: 'agTextColumnFilter',
    cellRenderer: LongTextCellRenderer,
    tooltipField: 'remarks',
    hide: true
  }
];

// 📋 기본 그리드 옵션
export const defaultGridOptions = {
  // 기본 컬럼 정의
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
    cellStyle: {
      fontSize: '0.875rem',
      padding: '8px 12px'
    }
  },

  // 그리드 옵션
  enableRangeSelection: true,
  enableCharts: false,
  suppressRowClickSelection: false,
  rowSelection: 'multiple',
  suppressMenuHide: false,
  suppressContextMenu: false,

  // 페이지네이션
  pagination: true,
  paginationPageSize: 25,
  paginationPageSizeSelector: [10, 25, 50, 100],

  // 스타일링
  rowHeight: 48,
  headerHeight: 40,

  // 로케일
  localeText: {
    // 기본 텍스트
    noRowsToShow: '표시할 데이터가 없습니다',
    loadingOoo: '로딩 중...',

    // 필터 텍스트
    filterOoo: '필터',
    equals: '같음',
    notEqual: '다름',
    contains: '포함',
    notContains: '포함하지 않음',
    startsWith: '시작',
    endsWith: '끝',

    // 페이지네이션 텍스트
    page: '페이지',
    more: '더보기',
    to: '~',
    of: '/',
    next: '다음',
    last: '마지막',
    first: '처음',
    previous: '이전',

    // 기타
    searchOoo: '검색...',
    selectAll: '전체 선택',
    selectAllSearchResults: '검색 결과 전체 선택',
    addCurrentSelectionToFilter: '현재 선택을 필터에 추가',
    blanks: '공백',
    noMatches: '일치하는 항목 없음'
  }
};

// 🎨 컬럼 그룹 정의 (선택사항)
export const columnGroups = [
  {
    headerName: '기본 정보',
    children: ['seq', 'managementObligation', 'irregularityName']
  },
  {
    headerName: '관리활동 정보',
    children: [
      'managementActivity',
      'managementActivityName',
      'managementActivityDetail',
      'managementActivityType'
    ]
  },
  {
    headerName: '평가 및 담당',
    children: [
      'riskAssessmentLevel',
      'implementationManager',
      'implementationDepartment'
    ]
  },
  {
    headerName: '상태 정보',
    children: ['isActive', 'approvalStatus', 'status']
  },
  {
    headerName: '관리 정보',
    children: ['createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'approvedAt', 'approvedBy']
  }
];

// 🔍 빠른 필터 옵션들
export const quickFilterOptions = {
  /** 활성 관리활동만 표시 */
  activeOnly: {
    label: '활성만',
    filter: (data: DeptOpManual[]) => data.filter(item => item.isActive)
  },

  /** 승인 대기 항목만 표시 */
  pendingApproval: {
    label: '승인대기',
    filter: (data: DeptOpManual[]) => data.filter(item => item.approvalStatus === 'pending')
  },

  /** 고위험 등급만 표시 */
  highRisk: {
    label: '고위험',
    filter: (data: DeptOpManual[]) => data.filter(item =>
      ['very_high', 'high'].includes(item.riskAssessmentLevel)
    )
  },

  /** 최근 등록 (7일 이내) */
  recent: {
    label: '최근등록',
    filter: (data: DeptOpManual[]) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return data.filter(item => new Date(item.createdAt) >= weekAgo);
    }
  }
};
