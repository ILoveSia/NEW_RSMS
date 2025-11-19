/**
 * ManualInquiry 데이터 그리드 컬럼 정의
 *
 * 특징:
 * - 19개 컬럼 (요구사항서 기준)
 * - 가로 스크롤 최적화
 * - 주요 컬럼 고정 (순번, 부정명)
 * - 툴팁 및 셀 렌더러 지원
 * - 반응형 컬럼 폭
 */

import { Cancel, CheckCircle, Warning } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import { ManualInquiry } from '../../types/manualInquiry.types';

// 🎨 Boolean 값 렌더러 (Y/N 표시)
const BooleanRenderer: React.FC<ICellRendererParams<ManualInquiry, boolean>> = ({ value }) => {
  if (value === undefined || value === null) return <span>-</span>;

  return value ? (
    <Chip
      icon={<CheckCircle />}
      label="Y"
      size="small"
      color="success"
      variant="outlined"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  ) : (
    <Chip
      icon={<Cancel />}
      label="N"
      size="small"
      color="default"
      variant="outlined"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  );
};

// 🎨 위험도 렌더러
const RiskValueRenderer: React.FC<ICellRendererParams<ManualInquiry, string>> = ({ value }) => {
  if (!value) return <span>-</span>;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
      case '낮음':
        return 'success';
      case 'medium':
      case '보통':
        return 'warning';
      case 'high':
      case '높음':
        return 'error';
      case 'critical':
      case '매우높음':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
      case '높음':
      case 'critical':
      case '매우높음':
        return <Warning />;
      default:
        return undefined;
    }
  };

  return (
    <Chip
      icon={getRiskIcon(value)}
      label={value}
      size="small"
      color={getRiskColor(value) as any}
      variant="filled"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  );
};

// 🎨 관리활동구분 렌더러
const ActivityTypeRenderer: React.FC<ICellRendererParams<ManualInquiry, string>> = ({ value }) => {
  if (!value) return <span>-</span>;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PLANNING':
      case '계획':
        return 'primary';
      case 'EXECUTION':
      case '실행':
        return 'success';
      case 'MONITORING':
      case '모니터링':
        return 'info';
      case 'IMPROVEMENT':
      case '개선':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={value}
      size="small"
      color={getTypeColor(value) as any}
      variant="outlined"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  );
};

// 🎨 접근권한 렌더러
const AccessLevelRenderer: React.FC<ICellRendererParams<ManualInquiry, string>> = ({ value }) => {
  if (!value) return <span>-</span>;

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'PUBLIC':
      case '공개':
        return 'success';
      case 'DEPARTMENT':
      case '부서':
        return 'warning';
      case 'RESTRICTED':
      case '제한':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAccessLabel = (access: string) => {
    switch (access) {
      case 'PUBLIC':
        return '공개';
      case 'DEPARTMENT':
        return '부서';
      case 'RESTRICTED':
        return '제한';
      default:
        return access;
    }
  };

  return (
    <Chip
      label={getAccessLabel(value)}
      size="small"
      color={getAccessColor(value) as any}
      variant="filled"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  );
};

// 🎨 다운로드 수 렌더러
const DownloadCountRenderer: React.FC<ICellRendererParams<ManualInquiry, number>> = ({ value }) => {
  if (value === undefined || value === null) return <span>0</span>;

  return (
    <span style={{
      fontWeight: 'bold',
      color: value > 50 ? '#1976d2' : value > 10 ? '#ed6c02' : '#2e7d32'
    }}>
      {value.toLocaleString()}
    </span>
  );
};

// 🎨 긴 텍스트 렌더러 (툴팁 지원)
const LongTextRenderer: React.FC<ICellRendererParams<ManualInquiry, string>> = ({ value }) => {
  if (!value) return <span>-</span>;

  const truncatedText = value.length > 30 ? value.substring(0, 30) + '...' : value;

  return (
    <Tooltip title={value} arrow placement="top">
      <span style={{ cursor: 'help' }}>
        {truncatedText}
      </span>
    </Tooltip>
  );
};

// 📊 ManualInquiry 컬럼 정의 (19개 컬럼)
export const manualColumns: ColDef<ManualInquiry>[] = [
  // 🔒 고정 컬럼 (핀고정) - 체크박스 다음 두 번째 위치
  {
    field: 'sequence',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center', fontWeight: 'bold' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    suppressMenu: true,
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, number>) => {
      return value || '-';
    }
  },
  {
    field: 'departmentName',
    headerName: '부서명',
    width: 120,
    cellStyle: { textAlign: 'center', fontWeight: '600', color: '#1976d2' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    tooltipField: 'departmentName',
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },

  // 📋 관리활동 관련 컬럼
  {
    field: 'managementActivityCode',
    headerName: '관리활동코드',
    width: 150,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    tooltipField: 'managementActivityCode',
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },
  {
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 200,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'managementActivityName',
    cellRenderer: LongTextRenderer
  },
  {
    field: 'managementActivityDetail',
    headerName: '관리활동상세',
    width: 200,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'managementActivityDetail',
    cellRenderer: LongTextRenderer
  },
  {
    field: 'managementActivityType',
    headerName: '관리활동구분',
    width: 120,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: ActivityTypeRenderer
  },

  // 📅 기간 관련 컬럼
  {
    field: 'startYearMonth',
    headerName: '시작년월',
    width: 100,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },
  {
    field: 'endYearMonth',
    headerName: '종료년월',
    width: 100,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },

  // ⚡ 위험 및 평가 관련 컬럼
  {
    field: 'riskAssessmentElement',
    headerName: '위험평가요소',
    width: 150,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'riskAssessmentElement',
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },
  {
    field: 'riskValue',
    headerName: '위험도',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: RiskValueRenderer
  },

  // 📋 규정 및 절차 관련 컬럼
  {
    field: 'relatedRegulation',
    headerName: '관련규정',
    width: 150,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'relatedRegulation',
    cellRenderer: LongTextRenderer
  },
  {
    field: 'implementationProcedureStatus',
    headerName: '이행절차현안',
    width: 140,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'implementationProcedureStatus',
    cellRenderer: LongTextRenderer
  },

  // ✅ Boolean 컬럼들
  {
    field: 'organizationSystemDescription',
    headerName: '조직체계설명여부',
    width: 140,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: BooleanRenderer
  },
  {
    field: 'ceoRiskAssessment',
    headerName: 'CEO위험평가여부',
    width: 140,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: BooleanRenderer
  },

  // 👥 담당자 관련 컬럼
  {
    field: 'managementRepresentative',
    headerName: '관리담당자대표',
    width: 140,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'managementRepresentative',
    cellRenderer: LongTextRenderer
  },
  {
    field: 'managementDetail',
    headerName: '관리담당자상세',
    width: 140,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'managementDetail',
    cellRenderer: LongTextRenderer
  },
  {
    field: 'managementDuplication',
    headerName: '관리담당자중복',
    width: 130,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'managementDuplication',
    cellRenderer: LongTextRenderer
  },
  {
    field: 'managementChangeContent',
    headerName: '담당자변경내용',
    width: 140,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'managementChangeContent',
    cellRenderer: LongTextRenderer
  },

  // 📄 책무 관련 컬럼
  {
    field: 'responsibilityDocument',
    headerName: '책무대비서류',
    width: 120,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'responsibilityDocument',
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },
  {
    field: 'responsibility',
    headerName: '책무',
    width: 100,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'responsibility',
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },
  {
    field: 'progress',
    headerName: '진전',
    width: 100,
    cellStyle: { textAlign: 'left' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    tooltipField: 'progress',
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value || '-';
    }
  },

  // 📊 메타 정보 컬럼 (선택적으로 표시)
  {
    field: 'downloadCount',
    headerName: '다운로드수',
    width: 110,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: DownloadCountRenderer,
    hide: false // 기본 표시
  },
  {
    field: 'accessLevel',
    headerName: '접근권한',
    width: 100,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: AccessLevelRenderer,
    hide: false // 기본 표시
  },
  {
    field: 'createdDate',
    headerName: '등록일',
    width: 110,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    hide: true, // 기본 숨김
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value ? new Date(value).toLocaleDateString('ko-KR') : '-';
    }
  },
  {
    field: 'modifiedDate',
    headerName: '수정일',
    width: 110,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    hide: true, // 기본 숨김
    cellRenderer: ({ value }: ICellRendererParams<ManualInquiry, string>) => {
      return value ? new Date(value).toLocaleDateString('ko-KR') : '-';
    }
  }
];

// 📱 모바일용 컬럼 정의 (필수 컬럼만)
export const mobileManualColumns: ColDef<ManualInquiry>[] = [
  {
    field: 'sequence',
    headerName: '순번',
    width: 60,
    cellStyle: { textAlign: 'center', fontWeight: 'bold' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: false,
    suppressMenu: true
  },
  {
    field: 'departmentName',
    headerName: '부서',
    width: 80,
    cellStyle: { textAlign: 'center', fontWeight: '600', fontSize: '0.85rem' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true
  },
  {
    field: 'managementActivityName',
    headerName: '관리활동명',
    width: 150,
    cellStyle: { textAlign: 'left', fontSize: '0.85rem' },
    headerClass: 'ag-header-cell-left',
    sortable: true,
    resizable: true,
    cellRenderer: LongTextRenderer
  },
  {
    field: 'managementActivityType',
    headerName: '구분',
    width: 80,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: ActivityTypeRenderer
  },
  {
    field: 'riskValue',
    headerName: '위험도',
    width: 80,
    cellStyle: { textAlign: 'center' },
    headerClass: 'ag-header-cell-center',
    sortable: true,
    resizable: true,
    cellRenderer: RiskValueRenderer
  }
];

// 🎯 컬럼 그룹 정의 (선택적으로 사용)
export const manualColumnGroups = [
  {
    headerName: '기본정보',
    children: ['sequence', 'departmentName', 'managementActivityCode']
  },
  {
    headerName: '관리활동',
    children: ['managementActivityName', 'managementActivityDetail', 'managementActivityType']
  },
  {
    headerName: '기간',
    children: ['startYearMonth', 'endYearMonth']
  },
  {
    headerName: '위험평가',
    children: ['riskAssessmentElement', 'riskValue']
  },
  {
    headerName: '규정및절차',
    children: ['relatedRegulation', 'implementationProcedureStatus']
  },
  {
    headerName: '평가여부',
    children: ['organizationSystemDescription', 'ceoRiskAssessment']
  },
  {
    headerName: '담당자정보',
    children: ['managementRepresentative', 'managementDetail', 'managementDuplication', 'managementChangeContent']
  },
  {
    headerName: '책무',
    children: ['responsibilityDocument', 'responsibility', 'progress']
  },
  {
    headerName: '메타정보',
    children: ['downloadCount', 'accessLevel', 'createdDate', 'modifiedDate']
  }
];
