/**
 * 역활관리 AG-Grid 컬럼 정의
 *
 * @description PositionMgmt 컬럼 패턴 기반 역활 데이터 그리드 컬럼 설정
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import { ColDef } from 'ag-grid-community';
import type { Permission, RoleWithPermissions } from '../../../../types';

// 역활 상태 렌더러
const RoleStatusRenderer = (params: any) => {
  const status = params.value;
  const statusClasses = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    ARCHIVED: 'archived'
  };

  const statusLabels = {
    ACTIVE: '활성',
    INACTIVE: '비활성',
    PENDING: '대기',
    ARCHIVED: '보관'
  };

  return `<span class="role-status ${statusClasses[status as keyof typeof statusClasses] || 'inactive'}">${statusLabels[status as keyof typeof statusLabels] || status}</span>`;
};

// 역활 타입 렌더러
const RoleTypeRenderer = (params: any) => {
  const roleType = params.value;
  const typeClasses = {
    SYSTEM: 'system',
    CUSTOM: 'custom',
    INHERITED: 'inherited'
  };

  const typeLabels = {
    SYSTEM: '시스템',
    CUSTOM: '사용자 정의',
    INHERITED: '상속'
  };

  return `<span class="role-type ${typeClasses[roleType as keyof typeof typeClasses] || 'custom'}">${typeLabels[roleType as keyof typeof typeLabels] || roleType}</span>`;
};

// 권한 개수 렌더러
const PermissionCountRenderer = (params: any) => {
  const count = params.value || 0;
  const isEmpty = count === 0;

  return `<span class="permission-count ${isEmpty ? 'empty' : ''}">${count}</span>`;
};

// 상세역활수 렌더러 (숫자만 표시)
const DetailRoleCountRenderer = (params: any) => {
  const count = params.value || 0;
  return count;  // HTML 태그 없이 순수 숫자만 반환
};

// 체크박스 렌더러 (본점기본)
const MainBusinessCheckboxRenderer = (params: any) => {
  const isChecked = params.value || false;
  return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
    <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="cursor: not-allowed;" />
  </div>`;
};

// 체크박스 렌더러 (영업점기본)
const ExecutionCheckboxRenderer = (params: any) => {
  const isChecked = params.value || false;
  return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
    <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="cursor: not-allowed;" />
  </div>`;
};

// 체크박스 렌더러 (사용여부)
const ActiveCheckboxRenderer = (params: any) => {
  const isChecked = params.value || false;
  return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
    <input type="checkbox" ${isChecked ? 'checked' : ''} disabled style="cursor: not-allowed;" />
  </div>`;
};

// 날짜 포맷 함수
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

// 날짜 렌더러
const DateRenderer = (params: any) => {
  const formattedDate = formatDate(params.value);
  return `<span class="date-value">${formattedDate}</span>`;
};

/**
 * 역활관리 AG-Grid 컬럼 정의 (왼쪽 그리드) - 4개 컬럼 (상세설명 삭제, 사용자수→상세역활수 변경)
 */
export const roleColumns: ColDef<RoleWithPermissions>[] = [
  {
    headerName: '순번',
    valueGetter: (params: any) => params.node.rowIndex + 1,
    width: 80,
    cellClass: 'row-number-cell',
    headerClass: 'role-header',
  },
  {
    headerName: '역활코드',
    field: 'roleCode',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'role-code-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '역활명',
    field: 'roleName',
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'role-name-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '상세역활수',
    field: 'detailRoleCount',
    width: 100,
    sortable: true,
    cellClass: 'detail-role-count-cell',
    headerClass: 'role-header',
    cellRenderer: DetailRoleCountRenderer
  }
];

/**
 * 역활 그리드 기본 옵션
 */
export const roleGridOptions = {
  columnDefs: roleColumns,
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    menuTabs: ['filterMenuTab', 'generalMenuTab'],
    cellClass: 'role-cell'
  },
  rowSelection: 'multiple' as const,
  enableRangeSelection: true,
  suppressRowDeselection: true,
  rowMultiSelectWithClick: false,
  suppressRowClickSelection: false,
  animateRows: true,
  enableCellTextSelection: true,
  suppressCellFocus: true,
  getRowStyle: (params: any) => {
    // 선택된 행 스타일 (파란색 하이라이트)
    if (params.node.selected) {
      return {
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3'
      };
    }
    // 시스템 역활은 다른 배경색 적용
    if (params.data?.isSystemRole) {
      return { backgroundColor: '#f8f9fa' };
    }
    // 비활성 역활은 회색 처리
    if (params.data?.status === 'INACTIVE') {
      return { backgroundColor: '#f5f5f5', opacity: 0.7 };
    }
    return null;
  },
  getRowClass: (params: any) => {
    const classes = ['role-row'];
    if (params.data?.isSystemRole) {
      classes.push('system-role-row');
    }
    if (params.data?.status === 'INACTIVE') {
      classes.push('inactive-role-row');
    }
    return classes.join(' ');
  },
  headerHeight: 48,
  rowHeight: 40,
  floatingFiltersHeight: 35
};

/**
 * 상세역활 AG-Grid 컬럼 정의 (오른쪽 그리드) - 9개 컬럼
 * 헤더명 변경: 업무권한→역활유형, 본업무권한→본점기본, 업무실행권한→영업점기본
 */
export const permissionDetailColumns: ColDef<Permission>[] = [
  {
    headerName: '순번',
    valueGetter: (params: any) => params.node.rowIndex + 1,
    width: 50,
    cellClass: 'row-number-cell',
    headerClass: 'permission-header',
  },
  {
    headerName: '순서',
    field: 'sortOrder',
    width: 60,
    sortable: true,
    cellClass: 'sort-order-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '역활코드',
    field: 'permissionCode',
    width: 90,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'permission-code-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '역활명',
    field: 'permissionName',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'permission-name-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '역활유형',
    field: 'businessPermission',
    width: 80,
    cellClass: 'text-cell',
    headerClass: 'permission-header',
    cellRenderer: (params: any) => {
      const hasPermission = params.data?.businessPermission || false;
      return hasPermission ? '업무' : '일반';
    }
  },
  {
    headerName: '본점기본',
    field: 'mainBusinessPermission',
    width: 80,
    cellClass: 'checkbox-cell',
    headerClass: 'permission-header',
    cellRenderer: MainBusinessCheckboxRenderer
  },
  {
    headerName: '영업점기본',
    field: 'executionPermission',
    width: 90,
    cellClass: 'checkbox-cell',
    headerClass: 'permission-header',
    cellRenderer: ExecutionCheckboxRenderer
  },
  {
    headerName: '역활설명',
    field: 'description',
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'description-cell',
    headerClass: 'permission-header',
    tooltipField: 'description'
  },
  {
    headerName: '사용여부',
    field: 'isActive',
    width: 80,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'permission-active-cell',
    headerClass: 'permission-header',
    cellRenderer: ActiveCheckboxRenderer
  }
];
