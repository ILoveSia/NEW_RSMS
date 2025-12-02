/**
 * 결재선관리 AG-Grid 컬럼 정의
 *
 * @description DeliberativeMgmt 패턴을 따라 컬럼 정의를 별도 파일로 분리
 * - PositionMgmt.tsx 표준 기반 설계
 * - 커스텀 셀 렌더러 포함
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { ApprovalLine } from '../../types/approvalLine.types';
import { CommonCodeDetail } from '@/app/store/codeStore';

/**
 * 사용여부 렌더러
 * - Y: 사용 (녹색 Chip)
 * - N: 미사용 (회색 Chip)
 */
const UsedStatusRenderer = ({ value }: { value: string }) => {
  const isUsed = value === 'Y';
  return (
    <Chip
      label={isUsed ? '사용' : '미사용'}
      color={isUsed ? 'success' : 'default'}
      size="small"
      variant="outlined"
      icon={isUsed ? <CheckCircleIcon /> : <CancelIcon />}
    />
  );
};

/**
 * 수정가능 여부 렌더러
 * - Y: 수정가능 (파란색 Chip)
 * - N: 수정불가 (회색 Chip)
 */
const EditableStatusRenderer = ({ value }: { value: string }) => {
  const isEditable = value === 'Y';
  return (
    <Chip
      label={isEditable ? 'Y' : 'N'}
      color={isEditable ? 'primary' : 'default'}
      size="small"
      variant="outlined"
    />
  );
};

/**
 * 결재선명 링크 렌더러 (상세조회용)
 */
const ApprovalLineNameRenderer = ({ value, data, onCellClicked }: any) => {
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
 * 업무구분 렌더러 (공통코드 기반)
 * @param workTypeCodes 업무구분 공통코드 목록
 */
const createWorkTypeRenderer = (workTypeCodes: CommonCodeDetail[]) => {
  return ({ value }: { value: string }) => {
    // 공통코드에서 detailCode에 해당하는 detailName 찾기
    const code = workTypeCodes.find(c => c.detailCode === value);
    const displayText = code ? code.detailName : value;

    // 업무구분별 배경색 설정
    const getBgColor = (workType: string) => {
      switch (workType) {
        case 'WRS': return '#e3f2fd';      // 파랑 (위험관리)
        case 'IMPL': return '#e8f5e9';     // 녹색 (이행점검)
        case 'IMPROVE': return '#fff3e0';  // 주황 (개선이행)
        default: return '#f5f5f5';
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
 * 비고 텍스트 요약 렌더러
 */
const RemarksRenderer = ({ value }: { value: string }) => {
  const maxLength = 30;
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
 * 결재선관리 컬럼 정의 생성 함수
 *
 * @description DeliberativeMgmt 패턴을 따라 함수 형태로 컬럼 정의 생성
 * @param workTypeCodes 업무구분 공통코드 목록 (선택적)
 * @returns AG-Grid 컬럼 정의
 */
export const createApprovalLineColumns = (workTypeCodes?: CommonCodeDetail[]): ColDef<ApprovalLine>[] => [
  {
    field: 'sequence',
    headerName: '순서',
    width: 80,
    minWidth: 70,
    maxWidth: 100,
    suppressSizeToFit: true,
    sortable: true,
    filter: false,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'name',
    headerName: '결재선명',
    width: 200,
    minWidth: 150,
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: ApprovalLineNameRenderer,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'workType',
    headerName: '업무구분',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: workTypeCodes ? createWorkTypeRenderer(workTypeCodes) : undefined,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'popupTitle',
    headerName: 'Popup 제목',
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'isUsed',
    headerName: '사용여부',
    width: 110,
    minWidth: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: UsedStatusRenderer,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'isEditable',
    headerName: '수정가능',
    width: 100,
    minWidth: 90,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellRenderer: EditableStatusRenderer,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'remarks',
    headerName: '비고',
    width: 200,
    minWidth: 150,
    sortable: false,
    filter: false,
    cellRenderer: RemarksRenderer,
    wrapText: false
  },
  {
    field: 'createdAt',
    headerName: '등록일',
    width: 120,
    minWidth: 100,
    sortable: true,
    filter: 'agDateColumnFilter',
    cellStyle: { textAlign: 'center', fontSize: '0.875rem' },
    valueFormatter: (params) => {
      if (!params.value) return '';
      const date = new Date(params.value);
      return date.toLocaleDateString('ko-KR');
    }
  }
];

/**
 * 결재선 단계 테이블 컬럼 (모달 내부용)
 */
export const approvalLineStepColumns: ColDef<any>[] = [
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
    width: 120,
    sortable: false,
    filter: false,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'approvalTypeCd',
    headerName: '결재유형',
    width: 100,
    sortable: false,
    filter: false,
    cellRenderer: ({ value }: { value: string }) => {
      const typeLabels: Record<string, string> = {
        'DRAFT': '기안',
        'REVIEW': '검토',
        'APPROVE': '승인',
        'FINAL': '최종'
      };
      return (
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          backgroundColor: value === 'FINAL' ? '#dbeafe' : '#f3f4f6',
          color: value === 'FINAL' ? '#1e40af' : '#374151'
        }}>
          {typeLabels[value] || value}
        </span>
      );
    },
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'approverTypeCd',
    headerName: '결재자유형',
    width: 100,
    sortable: false,
    filter: false,
    cellRenderer: ({ value }: { value: string }) => {
      const typeLabels: Record<string, string> = {
        'POSITION': '직책',
        'DEPT': '부서',
        'USER': '사용자'
      };
      return typeLabels[value] || value;
    },
    cellStyle: { textAlign: 'center', fontSize: '0.875rem' }
  },
  {
    field: 'approverName',
    headerName: '결재자',
    width: 120,
    sortable: false,
    filter: false,
    cellStyle: { fontSize: '0.875rem' }
  },
  {
    field: 'isRequired',
    headerName: '필수여부',
    width: 80,
    sortable: false,
    filter: false,
    cellRenderer: ({ value }: { value: string }) => (
      <span style={{
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: value === 'Y' ? '#dcfce7' : '#fef2f2',
        color: value === 'Y' ? '#166534' : '#dc2626'
      }}>
        {value === 'Y' ? '필수' : '선택'}
      </span>
    ),
    cellStyle: { textAlign: 'center' }
  }
];

// 기본 export
export default createApprovalLineColumns;
