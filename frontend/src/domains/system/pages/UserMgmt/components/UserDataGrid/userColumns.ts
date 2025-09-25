/**
 * 사용자관리 AG-Grid 컬럼 정의
 *
 * @description 이미지 기준 사용자 데이터 그리드 컬럼 설정
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import { ColDef } from 'ag-grid-community';
import type { User } from '../../types/user.types';

// 계정 상태 렌더러
const AccountStatusRenderer = (params: any) => {
  const status = params.value;
  const statusClasses = {
    ACTIVE: 'active',
    LOCKED: 'locked',
    SUSPENDED: 'suspended',
    RESIGNED: 'resigned'
  };

  const statusLabels = {
    ACTIVE: '재직',
    LOCKED: '잠김',
    SUSPENDED: '정지',
    RESIGNED: '퇴직'
  };

  return `<span class="user-status ${statusClasses[status as keyof typeof statusClasses] || 'resigned'}">${statusLabels[status as keyof typeof statusLabels] || status}</span>`;
};

// 활성화 상태 렌더러
const ActiveStatusRenderer = (params: any) => {
  const isActive = params.value;
  return `<span class="active-status ${isActive ? 'active' : 'inactive'}">${isActive ? '활성화' : '비활성화'}</span>`;
};

// 로그인 시간 렌더러
const LoginTimeRenderer = (params: any) => {
  const loginTime = params.value;
  if (!loginTime) return '-';

  try {
    const date = new Date(loginTime);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

// 역할 개수 렌더러
const RoleCountRenderer = (params: any) => {
  const count = params.value || 0;
  return `<span class="role-count">${count}개</span>`;
};

/**
 * 사용자관리 AG-Grid 컬럼 정의 - 이미지 기준 11개 컬럼
 */
export const userColumns: ColDef<User>[] = [
  {
    headerName: '직번',
    field: 'employeeNo',
    width: 100,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'employee-no-cell',
    headerClass: 'user-header',
  },
  {
    headerName: '성명',
    field: 'fullName',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'full-name-cell',
    headerClass: 'user-header'
  },
  {
    headerName: '부정',
    field: 'deptName',
    width: 140,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'dept-name-cell',
    headerClass: 'user-header',
    tooltipField: 'deptName'
  },
  {
    headerName: '직위',
    field: 'positionName',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'position-name-cell',
    headerClass: 'user-header'
  },
  {
    headerName: '근무상태',
    field: 'accountStatus',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'account-status-cell',
    headerClass: 'user-header',
    cellRenderer: AccountStatusRenderer
  },
  {
    headerName: '역할(MenuID)',
    field: 'roleCount',
    width: 130,
    sortable: true,
    cellClass: 'role-count-cell',
    headerClass: 'user-header',
    cellRenderer: RoleCountRenderer,
    valueGetter: (params: any) => {
      const roles = params.data?.roles || [];
      const roleNames = roles.map((role: any) => role.roleName).join(', ');
      return roleNames || '없음';
    }
  },
  {
    headerName: '상세역할',
    field: 'detailRoleCount',
    width: 130,
    sortable: true,
    cellClass: 'detail-role-count-cell',
    headerClass: 'user-header',
    cellRenderer: RoleCountRenderer,
    valueGetter: (params: any) => {
      return params.data?.detailRoleCount || 0;
    }
  },
  {
    headerName: '로그인시간',
    field: 'lastLoginAt',
    width: 140,
    sortable: true,
    cellClass: 'login-time-cell',
    headerClass: 'user-header',
    cellRenderer: LoginTimeRenderer
  },
  {
    headerName: '활성화',
    field: 'isActive',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'active-status-cell',
    headerClass: 'user-header',
    cellRenderer: ActiveStatusRenderer
  },
  {
    headerName: '언어',
    field: 'language',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'language-cell',
    headerClass: 'user-header'
  },
  {
    headerName: '타임존',
    field: 'timezone',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'timezone-cell',
    headerClass: 'user-header'
  }
];

/**
 * 사용자 그리드 기본 옵션
 */
export const userGridOptions = {
  columnDefs: userColumns,
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    menuTabs: ['filterMenuTab', 'generalMenuTab'],
    cellClass: 'user-cell'
  },
  rowSelection: 'multiple' as const,
  enableRangeSelection: true,
  suppressRowDeselection: false,
  rowMultiSelectWithClick: true,
  suppressRowClickSelection: false,
  animateRows: true,
  enableCellTextSelection: true,
  suppressCellFocus: false,
  getRowStyle: (params: any) => {
    // 비활성 사용자는 회색 처리
    if (params.data?.accountStatus === 'RESIGNED') {
      return { backgroundColor: '#f5f5f5', opacity: 0.7 };
    }
    // 잠긴 계정은 노란색 배경
    if (params.data?.accountStatus === 'LOCKED') {
      return { backgroundColor: '#fff3cd' };
    }
    // 정지 계정은 빨간색 배경
    if (params.data?.accountStatus === 'SUSPENDED') {
      return { backgroundColor: '#f8d7da' };
    }
    return null;
  },
  getRowClass: (params: any) => {
    const classes = ['user-row'];
    if (params.data?.isAdmin) {
      classes.push('admin-user-row');
    }
    if (params.data?.accountStatus !== 'ACTIVE') {
      classes.push('inactive-user-row');
    }
    return classes.join(' ');
  },
  headerHeight: 48,
  rowHeight: 40,
  floatingFiltersHeight: 35
};
