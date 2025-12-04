/**
 * 역활관리 시스템 메인 컴포넌트
 * - roles, permissions, role_permissions 테이블 기반 CRUD 구현
 * - CodeMgmt.tsx 행추가 패턴 적용 (모달 없이 그리드 인라인 편집)
 * - Real API 연동 (roleApi.ts)
 *
 * @description 코드관리 UI 스타일 적용한 역활관리 시스템
 * @author Claude AI
 * @version 3.0.0
 * @created 2025-09-24
 * @updated 2025-12-04
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Alert,
  IconButton,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Security as SecurityIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// 공통 컴포넌트
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';

// 타입 import
import type {
  RoleStatistics
} from '../../types';

// API import
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissionsByRoleId,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionsToRole,
  type RoleDto,
  type PermissionDto
} from '../../api/roleApi';

// 역활 그리드 컬럼
import { roleColumns, permissionDetailColumns } from './components/RoleDataGrid/roleColumns';

// 스타일
import styles from './RoleMgmt.module.scss';

/**
 * 역활 행 데이터 타입 (그리드용)
 * - _rowStatus: 행 상태 (NEW, UPDATE, undefined)
 * - _tempId: 임시 고유 ID (새로 추가된 행용)
 */
interface RoleRowData {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
  roleType: string;
  roleCategory?: string;
  parentRoleId?: string;
  sortOrder: number;
  status: string;
  isSystemRole: string;
  detailRoleCount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  _rowStatus?: 'NEW' | 'UPDATE';
  _tempId?: string;
}

/**
 * 권한 행 데이터 타입 (그리드용)
 */
interface PermissionRowData {
  id: string;
  permissionCode: string;
  permissionName: string;
  description?: string;
  menuId: number;
  sortOrder: number;
  businessPermission: string;
  mainBusinessPermission: string;
  executionPermission: string;
  canView: string;
  canCreate: string;
  canUpdate: string;
  canDelete: string;
  canSelect: string;
  extendedPermissionType?: string;
  extendedPermissionName?: string;
  isActive: string;
  _rowStatus?: 'NEW' | 'UPDATE';
  _tempId?: string;
}

interface RoleMgmtProps {
  className?: string;
}

/**
 * RoleDto를 RoleRowData로 변환하는 헬퍼 함수
 * - 백엔드 DTO를 프론트엔드 그리드 데이터로 매핑
 */
const mapRoleDtoToRow = (dto: RoleDto): RoleRowData => ({
  id: String(dto.roleId),
  roleCode: dto.roleCode,
  roleName: dto.roleName,
  description: dto.description,
  roleType: dto.roleType,
  roleCategory: dto.roleCategory,
  parentRoleId: dto.parentRoleId ? String(dto.parentRoleId) : undefined,
  sortOrder: dto.sortOrder,
  status: dto.status,
  isSystemRole: dto.isSystemRole,
  detailRoleCount: dto.detailRoleCount || 0,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  createdBy: dto.createdBy,
  updatedBy: dto.updatedBy
});

/**
 * PermissionDto를 PermissionRowData로 변환하는 헬퍼 함수
 */
const mapPermissionDtoToRow = (dto: PermissionDto): PermissionRowData => ({
  id: String(dto.permissionId),
  permissionCode: dto.permissionCode,
  permissionName: dto.permissionName,
  description: dto.description,
  menuId: dto.menuId,
  sortOrder: dto.sortOrder,
  businessPermission: dto.businessPermission,
  mainBusinessPermission: dto.mainBusinessPermission,
  executionPermission: dto.executionPermission,
  canView: dto.canView,
  canCreate: dto.canCreate,
  canUpdate: dto.canUpdate,
  canDelete: dto.canDelete,
  canSelect: dto.canSelect,
  extendedPermissionType: dto.extendedPermissionType,
  extendedPermissionName: dto.extendedPermissionName,
  isActive: dto.isActive
});

const RoleMgmt: React.FC<RoleMgmtProps> = ({ className }) => {
  // ===============================
  // State Management
  // ===============================

  // 역활 목록 상태
  const [roles, setRoles] = useState<RoleRowData[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleRowData | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<RoleRowData[]>([]);

  // 권한(상세역활) 목록 상태
  const [permissions, setPermissions] = useState<PermissionRowData[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionRowData[]>([]);

  // 로딩 및 에러 상태
  const [roleLoading, setRoleLoading] = useState<boolean>(false);
  const [permissionLoading, setPermissionLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 스낵바 상태
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // ===============================
  // API 호출 함수들
  // ===============================

  /**
   * 역활 목록 조회
   * - GET /api/system/roles
   */
  const fetchRoles = useCallback(async () => {
    setRoleLoading(true);
    try {
      const data = await getAllRoles();
      const mappedRoles = data.map(mapRoleDtoToRow);
      setRoles(mappedRoles);

      // 첫 번째 역활 자동 선택
      if (mappedRoles.length > 0 && !selectedRole) {
        setSelectedRole(mappedRoles[0]);
        fetchPermissionsByRole(Number(mappedRoles[0].id));
      }
    } catch (err: any) {
      console.error('역활 목록 조회 실패:', err);
      showSnackbar('역활 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setRoleLoading(false);
    }
  }, [selectedRole]);

  /**
   * 역활별 권한 조회
   * - GET /api/system/roles/{roleId}/permissions
   */
  const fetchPermissionsByRole = useCallback(async (roleId: number) => {
    setPermissionLoading(true);
    try {
      const data = await getPermissionsByRoleId(roleId);
      const mappedPermissions = data.map(mapPermissionDtoToRow);
      setPermissions(mappedPermissions);
    } catch (err: any) {
      console.error('권한 목록 조회 실패:', err);
      setPermissions([]);
    } finally {
      setPermissionLoading(false);
    }
  }, []);

  // ===============================
  // 역활 이벤트 핸들러
  // ===============================

  /**
   * 새로고침 버튼 클릭
   */
  const handleRefresh = useCallback(() => {
    fetchRoles();
    showSnackbar('목록을 새로고침했습니다.', 'info');
  }, [fetchRoles]);

  /**
   * 역활 행 클릭 핸들러
   * - 선택된 역활의 권한 목록 조회
   */
  const handleRoleRowClick = useCallback((role: RoleRowData) => {
    // 신규 추가 행은 권한 조회 안함
    if (role._rowStatus === 'NEW') {
      setSelectedRole(role);
      setPermissions([]);
      return;
    }
    setSelectedRole(role);
    fetchPermissionsByRole(Number(role.id));
  }, [fetchPermissionsByRole]);

  /**
   * 역활 다중 선택 핸들러 (체크박스)
   */
  const handleRoleSelectionChange = useCallback((selectedRows: RoleRowData[]) => {
    setSelectedRoles(selectedRows);
  }, []);

  /**
   * 역활 행 추가 (CodeMgmt.tsx 패턴)
   * - 모달 없이 그리드에 새 행 추가
   */
  const handleAddRole = useCallback(() => {
    // 현재 최대 순서 찾기
    const maxOrder = roles.length > 0
      ? Math.max(...roles.map(r => r.sortOrder))
      : 0;

    // 임시 고유 ID 생성
    const tempId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newRole: RoleRowData = {
      id: tempId,
      roleCode: '',
      roleName: '',
      description: '',
      roleType: 'CUSTOM',
      roleCategory: '사용자',
      sortOrder: maxOrder + 1,
      status: 'ACTIVE',
      isSystemRole: 'N',
      detailRoleCount: 0,
      _rowStatus: 'NEW',
      _tempId: tempId
    };

    setRoles(prev => [newRole, ...prev]);
    showSnackbar('새 역활이 추가되었습니다. 값을 입력 후 저장해주세요.', 'info');
  }, [roles]);

  /**
   * 역활 셀 값 변경 핸들러
   */
  const handleRoleCellValueChanged = useCallback((event: any) => {
    const updatedRole = event.data as RoleRowData;
    const rowNode = event.node;

    setRoles(prev =>
      prev.map((role, index) => {
        // AG-Grid의 rowIndex를 사용하여 정확한 행 매칭
        if (rowNode && rowNode.rowIndex !== index) {
          return role;
        }

        // rowNode가 없는 경우 기존 방식 사용
        if (!rowNode) {
          // _tempId 또는 id로 매칭
          const matchKey = role._tempId || role.id;
          const updatedKey = updatedRole._tempId || updatedRole.id;
          if (matchKey !== updatedKey) {
            return role;
          }
        }

        // 기존 상태가 'NEW'면 'NEW' 유지, 그 외는 'UPDATE'로 변경
        const newStatus: 'NEW' | 'UPDATE' = role._rowStatus === 'NEW' ? 'NEW' : 'UPDATE';

        return {
          ...updatedRole,
          _rowStatus: newStatus,
          _tempId: role._tempId
        };
      })
    );
  }, []);

  /**
   * 역활 저장 (신규=INSERT, 수정=UPDATE)
   */
  const handleSaveRoles = useCallback(async () => {
    // 상태가 'NEW' 또는 'UPDATE'인 행만 필터링
    const rolesToSave = roles.filter(r => r._rowStatus === 'NEW' || r._rowStatus === 'UPDATE');

    if (rolesToSave.length === 0) {
      showSnackbar('저장할 데이터가 없습니다.', 'warning');
      return;
    }

    // 필수값 검증
    for (const role of rolesToSave) {
      if (!role.roleCode || !role.roleName) {
        showSnackbar('역활코드와 역활명은 필수입니다.', 'warning');
        return;
      }
    }

    setSaving(true);
    try {
      for (const role of rolesToSave) {
        if (role._rowStatus === 'NEW') {
          // INSERT
          await createRole({
            roleCode: role.roleCode,
            roleName: role.roleName,
            description: role.description,
            roleType: role.roleType as 'SYSTEM' | 'CUSTOM',
            roleCategory: role.roleCategory as '최고관리자' | '관리자' | '사용자',
            parentRoleId: role.parentRoleId ? Number(role.parentRoleId) : undefined,
            sortOrder: role.sortOrder,
            status: role.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
            isSystemRole: role.isSystemRole === 'Y'
          });
          console.log('역활 생성 완료:', role.roleCode);
        } else if (role._rowStatus === 'UPDATE') {
          // UPDATE - roleCategory, isSystemRole 포함
          await updateRole(Number(role.id), {
            roleName: role.roleName,
            description: role.description,
            roleType: role.roleType as 'SYSTEM' | 'CUSTOM',
            roleCategory: role.roleCategory as '최고관리자' | '관리자' | '사용자',
            sortOrder: role.sortOrder,
            status: role.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
            isSystemRole: role.isSystemRole === 'Y'
          });
          console.log('역활 수정 완료:', role.roleCode);
        }
      }

      // 저장 완료 후 데이터 다시 로드
      await fetchRoles();
      showSnackbar('저장되었습니다.', 'success');
    } catch (err) {
      console.error('역활 저장 실패:', err);
      showSnackbar('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }, [roles, fetchRoles]);

  /**
   * 역활 삭제
   */
  const handleDeleteRoles = useCallback(async () => {
    if (selectedRoles.length === 0) {
      showSnackbar('삭제할 역활을 선택해주세요.', 'warning');
      return;
    }

    // 시스템 역활 삭제 방지
    const systemRoles = selectedRoles.filter(r => r.isSystemRole === 'Y');
    if (systemRoles.length > 0) {
      showSnackbar('시스템 역활은 삭제할 수 없습니다.', 'warning');
      return;
    }

    if (!window.confirm(`선택한 ${selectedRoles.length}개의 역활을 삭제하시겠습니까?`)) {
      return;
    }

    setSaving(true);
    try {
      for (const role of selectedRoles) {
        // NEW 상태면 로컬에서만 삭제
        if (role._rowStatus === 'NEW') {
          setRoles(prev => prev.filter(r => r._tempId !== role._tempId));
          console.log('신규 역활 삭제 (로컬):', role.roleCode);
        } else {
          // 기존 데이터는 서버 API 호출
          await deleteRole(Number(role.id));
          console.log('역활 삭제 완료:', role.roleCode);
        }
      }

      // 삭제 완료 후 데이터 다시 로드
      await fetchRoles();
      setSelectedRoles([]);
      setSelectedRole(null);
      setPermissions([]);
      showSnackbar('삭제되었습니다.', 'success');
    } catch (err) {
      console.error('역활 삭제 실패:', err);
      showSnackbar('삭제에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedRoles, fetchRoles]);

  // ===============================
  // 권한 이벤트 핸들러
  // ===============================

  /**
   * 권한 다중 선택 핸들러
   */
  const handlePermissionSelectionChange = useCallback((selectedRows: PermissionRowData[]) => {
    setSelectedPermissions(selectedRows);
  }, []);

  /**
   * 권한 행 추가 (CodeMgmt.tsx 패턴)
   */
  const handleAddPermission = useCallback(() => {
    if (!selectedRole) {
      showSnackbar('먼저 역활을 선택해주세요.', 'warning');
      return;
    }

    // 신규 역활에는 권한 추가 불가
    if (selectedRole._rowStatus === 'NEW') {
      showSnackbar('역활을 먼저 저장한 후 권한을 추가해주세요.', 'warning');
      return;
    }

    // 현재 최대 순서 찾기
    const maxOrder = permissions.length > 0
      ? Math.max(...permissions.map(p => p.sortOrder))
      : 0;

    // 임시 고유 ID 생성
    const tempId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newPermission: PermissionRowData = {
      id: tempId,
      permissionCode: '',
      permissionName: '',
      description: '',
      menuId: 1, // 기본 메뉴ID (실제 사용시 선택 가능하도록 확장)
      sortOrder: maxOrder + 1,
      businessPermission: 'N',
      mainBusinessPermission: 'N',
      executionPermission: 'N',
      canView: 'N',
      canCreate: 'N',
      canUpdate: 'N',
      canDelete: 'N',
      canSelect: 'N',
      isActive: 'Y',
      _rowStatus: 'NEW',
      _tempId: tempId
    };

    setPermissions(prev => [newPermission, ...prev]);
    showSnackbar('새 권한이 추가되었습니다. 값을 입력 후 저장해주세요.', 'info');
  }, [selectedRole, permissions]);

  /**
   * 권한 셀 값 변경 핸들러
   */
  const handlePermissionCellValueChanged = useCallback((event: any) => {
    const updatedPermission = event.data as PermissionRowData;
    const rowNode = event.node;

    setPermissions(prev =>
      prev.map((permission, index) => {
        // AG-Grid의 rowIndex를 사용하여 정확한 행 매칭
        if (rowNode && rowNode.rowIndex !== index) {
          return permission;
        }

        if (!rowNode) {
          const matchKey = permission._tempId || permission.id;
          const updatedKey = updatedPermission._tempId || updatedPermission.id;
          if (matchKey !== updatedKey) {
            return permission;
          }
        }

        const newStatus: 'NEW' | 'UPDATE' = permission._rowStatus === 'NEW' ? 'NEW' : 'UPDATE';

        return {
          ...updatedPermission,
          _rowStatus: newStatus,
          _tempId: permission._tempId
        };
      })
    );
  }, []);

  /**
   * 권한 저장 (신규=INSERT, 수정=UPDATE)
   */
  const handleSavePermissions = useCallback(async () => {
    if (!selectedRole || selectedRole._rowStatus === 'NEW') {
      showSnackbar('역활을 먼저 저장해주세요.', 'warning');
      return;
    }

    const permissionsToSave = permissions.filter(p => p._rowStatus === 'NEW' || p._rowStatus === 'UPDATE');

    if (permissionsToSave.length === 0) {
      showSnackbar('저장할 데이터가 없습니다.', 'warning');
      return;
    }

    // 필수값 검증
    for (const permission of permissionsToSave) {
      if (!permission.permissionCode || !permission.permissionName) {
        showSnackbar('권한코드와 권한명은 필수입니다.', 'warning');
        return;
      }
    }

    setSaving(true);
    try {
      const newPermissionIds: number[] = [];

      for (const permission of permissionsToSave) {
        if (permission._rowStatus === 'NEW') {
          // INSERT - 먼저 권한 생성
          const createdPermission = await createPermission({
            permissionCode: permission.permissionCode,
            permissionName: permission.permissionName,
            description: permission.description,
            menuId: permission.menuId,
            sortOrder: permission.sortOrder,
            businessPermission: permission.businessPermission as 'Y' | 'N',
            mainBusinessPermission: permission.mainBusinessPermission as 'Y' | 'N',
            executionPermission: permission.executionPermission as 'Y' | 'N',
            canView: permission.canView as 'Y' | 'N',
            canCreate: permission.canCreate as 'Y' | 'N',
            canUpdate: permission.canUpdate as 'Y' | 'N',
            canDelete: permission.canDelete as 'Y' | 'N',
            canSelect: permission.canSelect as 'Y' | 'N',
            isActive: permission.isActive as 'Y' | 'N'
          });
          newPermissionIds.push(createdPermission.permissionId);
          console.log('권한 생성 완료:', permission.permissionCode);
        } else if (permission._rowStatus === 'UPDATE') {
          // UPDATE
          await updatePermission(Number(permission.id), {
            permissionName: permission.permissionName,
            description: permission.description,
            sortOrder: permission.sortOrder,
            businessPermission: permission.businessPermission as 'Y' | 'N',
            mainBusinessPermission: permission.mainBusinessPermission as 'Y' | 'N',
            executionPermission: permission.executionPermission as 'Y' | 'N',
            canView: permission.canView as 'Y' | 'N',
            canCreate: permission.canCreate as 'Y' | 'N',
            canUpdate: permission.canUpdate as 'Y' | 'N',
            canDelete: permission.canDelete as 'Y' | 'N',
            canSelect: permission.canSelect as 'Y' | 'N',
            isActive: permission.isActive as 'Y' | 'N'
          });
          console.log('권한 수정 완료:', permission.permissionCode);
        }
      }

      // 새로 생성된 권한을 역활에 할당
      if (newPermissionIds.length > 0) {
        await assignPermissionsToRole(Number(selectedRole.id), newPermissionIds);
        console.log('권한 할당 완료:', newPermissionIds);
      }

      // 저장 완료 후 데이터 다시 로드
      await fetchPermissionsByRole(Number(selectedRole.id));
      await fetchRoles(); // detailRoleCount 갱신
      showSnackbar('저장되었습니다.', 'success');
    } catch (err) {
      console.error('권한 저장 실패:', err);
      showSnackbar('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedRole, permissions, fetchPermissionsByRole, fetchRoles]);

  /**
   * 권한 삭제
   */
  const handleDeletePermissions = useCallback(async () => {
    if (selectedPermissions.length === 0) {
      showSnackbar('삭제할 권한을 선택해주세요.', 'warning');
      return;
    }

    if (!window.confirm(`선택한 ${selectedPermissions.length}개의 권한을 삭제하시겠습니까?`)) {
      return;
    }

    setSaving(true);
    try {
      for (const permission of selectedPermissions) {
        // NEW 상태면 로컬에서만 삭제
        if (permission._rowStatus === 'NEW') {
          setPermissions(prev => prev.filter(p => p._tempId !== permission._tempId));
          console.log('신규 권한 삭제 (로컬):', permission.permissionCode);
        } else {
          // 기존 데이터는 서버 API 호출
          await deletePermission(Number(permission.id));
          console.log('권한 삭제 완료:', permission.permissionCode);
        }
      }

      // 삭제 완료 후 데이터 다시 로드
      if (selectedRole && selectedRole._rowStatus !== 'NEW') {
        await fetchPermissionsByRole(Number(selectedRole.id));
      }
      await fetchRoles(); // detailRoleCount 갱신
      setSelectedPermissions([]);
      showSnackbar('삭제되었습니다.', 'success');
    } catch (err) {
      console.error('권한 삭제 실패:', err);
      showSnackbar('삭제에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedPermissions, selectedRole, fetchPermissionsByRole, fetchRoles]);

  // ===============================
  // 유틸리티 함수들
  // ===============================

  /**
   * 스낵바 표시
   */
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * 스낵바 닫기
   */
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ===============================
  // 통계 계산
  // ===============================
  const statistics = useMemo<RoleStatistics>(() => {
    const total = roles.length;
    const activeCount = roles.filter(role => role.status === 'ACTIVE').length;
    const systemRolesCount = roles.filter(role => role.isSystemRole === 'Y').length;

    return {
      totalRoles: total,
      activeRoles: activeCount,
      systemRoles: systemRolesCount,
      customRoles: total - systemRolesCount,
      rolesWithoutPermissions: roles.filter(r => (r.detailRoleCount || 0) === 0).length
    };
  }, [roles]);

  // ===============================
  // 초기 데이터 로딩
  // ===============================
  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <SecurityIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>역활관리</h1>
              <p className={styles.pageDescription}>
                시스템 역활 및 권한을 통합 관리합니다
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SettingsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalRoles}</div>
                <div className={styles.statLabel}>전체 역활</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GroupIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.activeRoles}</div>
                <div className={styles.statLabel}>활성 역활</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <PersonAddIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{permissions.length}</div>
                <div className={styles.statLabel}>권한 수</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* 좌측 패널 - 역활 목록 (4:6 비율) */}
          <Grid item xs={12} md={4.8}>
            <Paper className={styles.leftPanel}>
              {/* 좌측 헤더 */}
              <div className={styles.leftHeader}>
                <div className={styles.filterSection}>
                  <Typography variant="h6" className={styles.sectionTitle}>
                    역활 목록
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    className={styles.refreshButton}
                    disabled={roleLoading}
                  >
                    {roleLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </div>
                <div className={styles.leftActionButtons}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    className={styles.actionButton}
                    onClick={handleAddRole}
                  >
                    추가
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    className={styles.actionButton}
                    onClick={handleSaveRoles}
                    disabled={saving}
                  >
                    저장
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    className={styles.actionButton}
                    onClick={handleDeleteRoles}
                    disabled={selectedRoles.length === 0 || saving}
                  >
                    삭제
                  </Button>
                </div>
              </div>

              {/* 역활 목록 그리드 */}
              <div className={styles.leftGrid}>
                {roleLoading && roles.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <BaseDataGrid
                    data={roles}
                    columns={roleColumns}
                    onRowClick={handleRoleRowClick}
                    onCellValueChanged={handleRoleCellValueChanged}
                    onSelectionChange={handleRoleSelectionChange}
                    getRowId={(params) => {
                      // 임시 ID가 있으면 사용 (새로 추가된 행)
                      if (params.data._tempId) {
                        return params.data._tempId;
                      }
                      return params.data.id;
                    }}
                    getRowStyle={(params: any) => {
                      if (params.data?._rowStatus === 'NEW') {
                        return { background: '#e3f2fd' }; // 신규: 연한 파란색
                      }
                      if (params.data?._rowStatus === 'UPDATE') {
                        return { background: '#fff3e0' }; // 수정: 연한 오렌지색
                      }
                      return undefined;
                    }}
                    height="calc(100vh - 290px)"
                    pagination={false}
                    rowSelection="multiple"
                    checkboxSelection={true}
                    headerCheckboxSelection={true}
                    suppressHorizontalScroll={false}
                    suppressColumnVirtualisation={false}
                  />
                )}
              </div>
            </Paper>
          </Grid>

          {/* 우측 패널 - 상세역활 (권한) (4:6 비율) */}
          <Grid item xs={12} md={7.2}>
            <Paper className={styles.rightPanel}>
              {/* 우측 헤더 */}
              <div className={styles.rightHeader}>
                <div className={styles.selectedGroupInfo}>
                  {selectedRole ? (
                    <>
                      <Typography variant="h6" className={styles.sectionTitle}>
                        [{selectedRole.roleCode || '신규'}] 상세역활 목록
                      </Typography>
                      <Chip
                        label={selectedRole.roleType || 'CUSTOM'}
                        size="small"
                        color="primary"
                        style={{ marginLeft: '8px' }}
                      />
                      {selectedRole.isSystemRole === 'Y' && (
                        <Chip
                          label="시스템"
                          size="small"
                          color="secondary"
                          style={{ marginLeft: '4px' }}
                        />
                      )}
                    </>
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      역활을 선택하세요
                    </Typography>
                  )}
                </div>
                <div className={styles.rightActions}>
                  <div className={styles.actionButtons}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      className={styles.actionButton}
                      onClick={handleAddPermission}
                      disabled={!selectedRole || selectedRole._rowStatus === 'NEW'}
                    >
                      추가
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SaveIcon />}
                      className={styles.actionButton}
                      onClick={handleSavePermissions}
                      disabled={!selectedRole || selectedRole._rowStatus === 'NEW' || saving}
                    >
                      저장
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      className={styles.actionButton}
                      onClick={handleDeletePermissions}
                      disabled={!selectedRole || selectedPermissions.length === 0 || saving}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>

              {/* 상세역활 그리드 */}
              <div className={styles.rightGrid}>
                {!selectedRole ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="info">
                      좌측에서 역활을 선택하면 상세역활을 확인할 수 있습니다.
                    </Alert>
                  </Box>
                ) : permissionLoading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <CircularProgress />
                  </Box>
                ) : selectedRole._rowStatus === 'NEW' ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="warning">
                      역활을 먼저 저장한 후 권한을 추가할 수 있습니다.
                    </Alert>
                  </Box>
                ) : permissions.length === 0 ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="warning">
                      선택된 역활에 할당된 권한이 없습니다.
                    </Alert>
                  </Box>
                ) : (
                  <BaseDataGrid
                    data={permissions}
                    columns={permissionDetailColumns}
                    onCellValueChanged={handlePermissionCellValueChanged}
                    onSelectionChange={handlePermissionSelectionChange}
                    getRowId={(params) => {
                      if (params.data._tempId) {
                        return params.data._tempId;
                      }
                      return params.data.id;
                    }}
                    getRowStyle={(params: any) => {
                      if (params.data?._rowStatus === 'NEW') {
                        return { background: '#e3f2fd' };
                      }
                      if (params.data?._rowStatus === 'UPDATE') {
                        return { background: '#fff3e0' };
                      }
                      return undefined;
                    }}
                    height="calc(100vh - 290px)"
                    pagination={false}
                    rowSelection="multiple"
                    checkboxSelection={true}
                    headerCheckboxSelection={true}
                    suppressHorizontalScroll={false}
                    suppressColumnVirtualisation={false}
                  />
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RoleMgmt;
