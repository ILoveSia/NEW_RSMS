/**
 * 결재함 AG-Grid 컬럼 정의
 *
 * @description ApprovalLine 패턴을 따라 컬럼 정의를 별도 파일로 분리
 * - PositionMgmt.tsx 표준 기반 설계
 * - 커스텀 셀 렌더러 포함
 * - 결재 상태별 색상 표시
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import type { Approval, ApprovalStatus } from '../../types/approvalBox.types';
import { CommonCodeDetail } from '@/app/store/codeStore';

/**
 * 결재상태 색상 매핑
 */
const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  'DRAFT': 'default',
  'PENDING': 'warning',
  'PROGRESS': 'primary',
  'APPROVED': 'success',
  'REJECTED': 'error'
};

/**
 * 결재상태 라벨 매핑
 */
const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  'DRAFT': '기안',
  'PENDING': '대기',
  'PROGRESS': '진행중',
  'APPROVED': '완료',
  'REJECTED': '반려'
};

/**
 * 결재상태 아이콘 매핑
 */
const getStatusIcon = (status: ApprovalStatus) => {
  switch (status) {
    case 'DRAFT':
      return <EditIcon fontSize="small" />;
    case 'PENDING':
      return <HourglassEmptyIcon fontSize="small" />;
    case 'PROGRESS':
      return <SendIcon fontSize="small" />;
    case 'APPROVED':
      return <CheckCircleIcon fontSize="small" />;
    case 'REJECTED':
      return <CancelIcon fontSize="small" />;
    default:
      return null;
  }
};

/**
 * 결재상태 렌더러
 * - 상태별 색상 Chip 표시
 */
const ApprovalStatusRenderer = ({ value }: { value: ApprovalStatus }) => {
  const color = APPROVAL_STATUS_COLORS[value] || 'default';
  const label = APPROVAL_STATUS_LABELS[value] || value;
  const icon = getStatusIcon(value);

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant="outlined"
      icon={icon || undefined}
    />
  );
};

/**
 * 업무구분 렌더러 (공통코드 기반)
 * @param workTypeCodes 업무구분 공통코드 목록
 */
const createWorkTypeRenderer = (workTypeCodes?: CommonCodeDetail[]) => {
  return ({ value }: { value: string }) => {
    // 공통코드에서 detailCode에 해당하는 detailName 찾기
    let displayText = value;
    if (workTypeCodes) {
      const code = workTypeCodes.find(c => c.detailCode === value);
      displayText = code ? code.detailName : value;
    } else {
      // 기본 매핑
      const defaultMap: Record<string, string> = {
        'WRS': '책무구조도',
        'RESP': '책무구조',
        'IMPL': '이행점검',
        'IMPROVE': '개선이행'
      };
      displayText = defaultMap[value] || value;
    }

    // 업무구분별 배경색 설정
    const getBgColor = (workType: string) => {
      switch (workType) {
        case 'WRS':
        case 'RESP':
          return '#e3f2fd';      // 파랑 (책무구조)
        case 'IMPL':
          return '#e8f5e9';      // 녹색 (이행점검)
        case 'IMPROVE':
          return '#fff3e0';      // 주황 (개선이행)
        default:
          return '#f5f5f5';
      }
    };

    return (
      <span style={{
        padding: '2px 8px',
        backgroundColor: getBgColor(value),
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}>
        {displayText}
      </span>
    );
  };
};

/**
 * 결재번호 링크 렌더러 (상세조회용)
 */
const ApprovalIdRenderer = ({ value, data, onCellClicked }: any) => {
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
 * 날짜 포맷팅 렌더러
 */
const DateRenderer = ({ value }: { value: string }) => {
  if (!value) return '';

  // YYYY-MM-DD 형식으로 표시
  const dateStr = value.substring(0, 10);
  return (
    <span style={{ fontSize: '0.875rem' }}>
      {dateStr}
    </span>
  );
};

/**
 * 결재 진행률 렌더러
 * - "현재단계/전체단계" 형식 표시
 */
const ApprovalScheduleRenderer = ({ value }: { value: string }) => {
  if (!value) return '';

  const [current, total] = value.split('/').map(Number);
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  // 진행률에 따른 색상
  const getProgressColor = () => {
    if (percentage >= 100) return '#4caf50'; // 완료 - 녹색
    if (percentage >= 50) return '#2196f3';  // 진행중 - 파랑
    return '#ff9800';                         // 초기 - 주황
  };

  return (
    <span style={{
      padding: '2px 8px',
      backgroundColor: `${getProgressColor()}15`,
      color: getProgressColor(),
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500'
    }}>
      {value}
    </span>
  );
};

/**
 * 제목 렌더러 (텍스트 요약)
 */
const ContentRenderer = ({ value }: { value: string }) => {
  const maxLength = 40;
  const displayText = value && value.length > maxLength
    ? `${value.substring(0, maxLength)}...`
    : value || '';

  return (
    <span title={value} style={{ fontSize: '0.875rem' }}>
      {displayText}
    </span>
  );
};

/**
 * 결재함 컬럼 정의 생성 함수
 *
 * @description ApprovalLine 패턴을 따라 함수 형태로 컬럼 정의 생성
 * @param workTypeCodes 업무구분 공통코드 목록 (선택적)
 * @param onRowClick 행 클릭 이벤트 핸들러 (선택적)
 * @returns AG-Grid 컬럼 정의
 */
export const createApprovalBoxColumns = (
  workTypeCodes?: CommonCodeDetail[],
  onRowClick?: (data: Approval) => void
): ColDef<Approval>[] => [
  {
    field: 'approvalId',
    headerName: '결재번호',
    width: 150,
    minWidth: 130,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: ApprovalIdRenderer,
    cellRendererParams: {
      onCellClicked: onRowClick
    },
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'workType',
    headerName: '업무구분',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: createWorkTypeRenderer(workTypeCodes),
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'content',
    headerName: '제목',
    width: 250,
    minWidth: 180,
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: ContentRenderer
  },
  {
    field: 'approvalStatus',
    headerName: '상태',
    width: 100,
    minWidth: 90,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: ApprovalStatusRenderer,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'approvalSchedule',
    headerName: '진행률',
    width: 90,
    minWidth: 80,
    sortable: false,
    filter: false,
    cellRenderer: ApprovalScheduleRenderer,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'drafter',
    headerName: '기안자',
    width: 100,
    minWidth: 90,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'draftDate',
    headerName: '기안일',
    width: 110,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellRenderer: DateRenderer,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'approver',
    headerName: '현결재자',
    width: 100,
    minWidth: 90,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'approveDate',
    headerName: '결재일',
    width: 110,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellRenderer: DateRenderer,
    cellStyle: { textAlign: 'center' }
  }
];

/**
 * 결재 이력 테이블 컬럼 (모달 내부용)
 */
export const approvalHistoryColumns: ColDef<any>[] = [
  {
    field: 'stepOrder',
    headerName: '순서',
    width: 70,
    sortable: false,
    filter: false,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'stepName',
    headerName: '단계명',
    width: 100,
    sortable: false,
    filter: false,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'approverName',
    headerName: '결재자',
    width: 100,
    sortable: false,
    filter: false,
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'actionCd',
    headerName: '처리',
    width: 80,
    sortable: false,
    filter: false,
    cellRenderer: ({ value }: { value: string }) => {
      const actionLabels: Record<string, string> = {
        'DRAFT': '기안',
        'APPROVE': '승인',
        'REJECT': '반려',
        'WITHDRAW': '회수'
      };
      const actionColors: Record<string, string> = {
        'DRAFT': '#9e9e9e',
        'APPROVE': '#4caf50',
        'REJECT': '#f44336',
        'WITHDRAW': '#ff9800'
      };
      return (
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          backgroundColor: `${actionColors[value] || '#9e9e9e'}20`,
          color: actionColors[value] || '#9e9e9e'
        }}>
          {actionLabels[value] || value}
        </span>
      );
    },
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'actionDate',
    headerName: '처리일시',
    width: 150,
    sortable: false,
    filter: false,
    valueFormatter: (params) => {
      if (!params.value) return '';
      const date = new Date(params.value);
      return date.toLocaleString('ko-KR');
    },
    cellStyle: { textAlign: 'center', fontSize: '0.875rem' }
  },
  {
    field: 'comment',
    headerName: '의견',
    width: 200,
    minWidth: 150,
    sortable: false,
    filter: false,
    cellStyle: { fontSize: '0.875rem' }
  }
];

// 기본 export
export default createApprovalBoxColumns;
