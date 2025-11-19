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

// 계정 상태 렌더러 (HTML 제거, 텍스트만 반환)
const AccountStatusRenderer = (params: any) => {
  const status = params.value;
  const statusLabels = {
    ACTIVE: '재직',
    LOCKED: '잠김',
    SUSPENDED: '정지',
    RESIGNED: '퇴직'
  };

  return statusLabels[status as keyof typeof statusLabels] || status;
};

// 활성화 체크박스 렌더러
const ActiveCheckboxRenderer = (params: any) => {
  const isActive = params.value;
  return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
    <input type="checkbox" ${isActive ? 'checked' : ''} disabled style="cursor: not-allowed;" />
  </div>`;
};

// 로그인차단 체크박스 렌더러
const LoginBlockCheckboxRenderer = (params: any) => {
  const isBlocked = params.value || false;
  return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
    <input type="checkbox" ${isBlocked ? 'checked' : ''} disabled style="cursor: not-allowed;" />
  </div>`;
};

// 역할 개수 렌더러 (텍스트만 반환)
const RoleCountRenderer = (params: any) => {
  const count = params.value || 0;
  return `${count}개`;
};

/**
 * 사용자관리 AG-Grid 컬럼 정의 - 수정된 11개 컬럼
 * 수정사항: 직번→사용자ID, 부정→부서명, 근무상태(텍스트), 로그인시간→로그인차단(체크박스), 활성화(체크박스)
 */
export const userColumns: ColDef<User>[] = [
  {
    headerName: '사용자 ID',
    field: 'employeeNo',
    width: 120,
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
    headerName: '부서명',
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
    headerName: '로그인차단',
    field: 'isLoginBlocked',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'login-block-cell',
    headerClass: 'user-header',
    cellRenderer: LoginBlockCheckboxRenderer
  },
  {
    headerName: '활성화',
    field: 'isActive',
    width: 90,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellClass: 'active-status-cell',
    headerClass: 'user-header',
    cellRenderer: ActiveCheckboxRenderer
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
