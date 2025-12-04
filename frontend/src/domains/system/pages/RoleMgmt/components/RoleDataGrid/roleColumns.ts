/**
 * 역활관리 AG-Grid 컬럼 정의
 *
 * @description CodeMgmt.tsx 행추가 패턴 기반 역활 데이터 그리드 컬럼 설정
 * @based_on database/scripts - roles, permissions 테이블 구조
 * @author Claude AI
 * @version 3.0.0
 * @created 2025-09-24
 * @updated 2025-12-04
 */

import { ColDef } from 'ag-grid-community';

/**
 * Y/N 값을 'O' 또는 빈 문자열로 변환
 * - DB에서 'Y'/'N' 문자열로 저장됨
 */
const formatYNValue = (value: any): string => {
  return value === 'Y' || value === true ? 'O' : '';
};

/**
 * 역활 카테고리 옵션
 * - roles 테이블 role_category 컬럼의 CHECK 제약조건 기반
 */
export const ROLE_CATEGORY_OPTIONS = ['최고관리자', '관리자', '사용자'];

/**
 * 역활 타입 옵션
 * - roles 테이블 role_type 컬럼의 CHECK 제약조건 기반
 */
export const ROLE_TYPE_OPTIONS = ['SYSTEM', 'CUSTOM'];

/**
 * 역활 상태 옵션
 * - roles 테이블 status 컬럼의 CHECK 제약조건 기반
 */
export const ROLE_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

/**
 * 역활관리 AG-Grid 컬럼 정의 (왼쪽 그리드)
 * - roles 테이블 기반: 역활코드, 역활명, 역활카테고리, 역활타입, 상태, 상세역활수
 * - 인라인 편집 가능
 *
 * 필수 컬럼 (roles 테이블 NOT NULL):
 * - role_code: VARCHAR(50) NOT NULL UNIQUE
 * - role_name: VARCHAR(100) NOT NULL
 * - role_type: VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'
 * - sort_order: INTEGER NOT NULL DEFAULT 0
 * - status: VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
 * - is_system_role: VARCHAR(1) NOT NULL DEFAULT 'N'
 */
export const roleColumns: ColDef[] = [
  {
    headerName: '순서',
    field: 'sortOrder',
    width: 70,
    sortable: true,
    editable: false, // 자동 증가이므로 편집 불가
    cellClass: 'sort-order-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '역활코드',
    field: 'roleCode',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true, // 편집 가능
    cellClass: 'role-code-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '역활명',
    field: 'roleName',
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true, // 편집 가능
    cellClass: 'role-name-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '역활카테고리',
    field: 'roleCategory',
    width: 110,
    sortable: true,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ROLE_CATEGORY_OPTIONS
    },
    cellClass: 'role-category-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '역활타입',
    field: 'roleType',
    width: 100,
    sortable: true,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ROLE_TYPE_OPTIONS
    },
    cellClass: 'role-type-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '상태',
    field: 'status',
    width: 90,
    sortable: true,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ROLE_STATUS_OPTIONS
    },
    cellClass: 'status-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '시스템역활',
    field: 'isSystemRole',
    width: 90,
    sortable: true,
    editable: true,
    cellEditor: 'agCheckboxCellEditor',
    cellRenderer: 'agCheckboxCellRenderer',
    valueGetter: (params: any) => params.data?.isSystemRole === 'Y' || params.data?.isSystemRole === true,
    valueSetter: (params: any) => {
      params.data.isSystemRole = params.newValue ? 'Y' : 'N';
      return true;
    },
    cellClass: 'checkbox-cell',
    headerClass: 'role-header'
  },
  {
    headerName: '상세역활수',
    field: 'detailRoleCount',
    width: 90,
    sortable: true,
    editable: false, // 조인 결과이므로 편집 불가
    cellClass: 'detail-role-count-cell',
    headerClass: 'role-header',
    // 숫자 그대로 표시 (HTML 태그 방지)
    valueFormatter: (params: any) => params.value ?? 0
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
    // 신규 추가 행 (파란색)
    if (params.data?._rowStatus === 'NEW') {
      return { backgroundColor: '#e3f2fd' };
    }
    // 수정된 행 (오렌지색)
    if (params.data?._rowStatus === 'UPDATE') {
      return { backgroundColor: '#fff3e0' };
    }
    // 선택된 행 스타일 (파란색 하이라이트)
    if (params.node.selected) {
      return {
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3'
      };
    }
    // 시스템 역활은 다른 배경색 적용
    if (params.data?.isSystemRole === 'Y' || params.data?.isSystemRole === true) {
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
    if (params.data?.isSystemRole === 'Y' || params.data?.isSystemRole === true) {
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
 * 권한 유형 옵션
 * - permissions 테이블 extended_permission_type 컬럼의 CHECK 제약조건 기반
 */
export const PERMISSION_TYPE_OPTIONS = ['전체권한', '제한권한', '조회권한'];

/**
 * 상세역활(권한) AG-Grid 컬럼 정의 (오른쪽 그리드)
 * - permissions 테이블 기반 컬럼
 * - 인라인 편집 가능
 *
 * 필수 컬럼 (permissions 테이블 NOT NULL):
 * - permission_code: VARCHAR(50) NOT NULL UNIQUE
 * - permission_name: VARCHAR(100) NOT NULL
 * - menu_id: BIGINT NOT NULL
 * - sort_order: INTEGER NOT NULL DEFAULT 0
 * - business_permission: VARCHAR(1) NOT NULL DEFAULT 'N'
 * - main_business_permission: VARCHAR(1) NOT NULL DEFAULT 'N'
 * - execution_permission: VARCHAR(1) NOT NULL DEFAULT 'N'
 * - can_view, can_create, can_update, can_delete, can_select: VARCHAR(1) NOT NULL DEFAULT 'N'
 * - is_active: VARCHAR(1) NOT NULL DEFAULT 'Y'
 */
export const permissionDetailColumns: ColDef[] = [
  {
    headerName: '순서',
    field: 'sortOrder',
    width: 60,
    sortable: true,
    editable: false, // 자동 증가
    cellClass: 'sort-order-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '권한코드',
    field: 'permissionCode',
    width: 90,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true,
    cellClass: 'permission-code-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '권한명',
    field: 'permissionName',
    width: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true,
    cellClass: 'permission-name-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '권한유형',
    field: 'businessPermission',
    width: 80,
    editable: true,
    cellEditor: 'agCheckboxCellEditor',
    cellRenderer: 'agCheckboxCellRenderer',
    valueGetter: (params: any) => params.data?.businessPermission === 'Y',
    valueSetter: (params: any) => {
      params.data.businessPermission = params.newValue ? 'Y' : 'N';
      return true;
    },
    cellClass: 'checkbox-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '본점기본',
    field: 'mainBusinessPermission',
    width: 80,
    editable: true,
    cellEditor: 'agCheckboxCellEditor',
    cellRenderer: 'agCheckboxCellRenderer',
    valueGetter: (params: any) => params.data?.mainBusinessPermission === 'Y',
    valueSetter: (params: any) => {
      params.data.mainBusinessPermission = params.newValue ? 'Y' : 'N';
      return true;
    },
    cellClass: 'checkbox-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '영업점기본',
    field: 'executionPermission',
    width: 90,
    editable: true,
    cellEditor: 'agCheckboxCellEditor',
    cellRenderer: 'agCheckboxCellRenderer',
    valueGetter: (params: any) => params.data?.executionPermission === 'Y',
    valueSetter: (params: any) => {
      params.data.executionPermission = params.newValue ? 'Y' : 'N';
      return true;
    },
    cellClass: 'checkbox-cell',
    headerClass: 'permission-header'
  },
  {
    headerName: '권한설명',
    field: 'description',
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    editable: true,
    cellClass: 'description-cell',
    headerClass: 'permission-header',
    tooltipField: 'description'
  },
  {
    headerName: '사용여부',
    field: 'isActive',
    width: 80,
    sortable: true,
    editable: true,
    cellEditor: 'agCheckboxCellEditor',
    cellRenderer: 'agCheckboxCellRenderer',
    valueGetter: (params: any) => params.data?.isActive === 'Y',
    valueSetter: (params: any) => {
      params.data.isActive = params.newValue ? 'Y' : 'N';
      return true;
    },
    cellClass: 'checkbox-cell',
    headerClass: 'permission-header'
  }
];
