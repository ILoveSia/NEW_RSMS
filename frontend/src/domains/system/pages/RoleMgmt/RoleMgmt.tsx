/**
 * 역활관리 시스템 메인 컴포넌트
 *
 * @description 코드관리 UI 스타일 적용한 역활관리 시스템
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Alert,
  IconButton
} from '@mui/material';
import {
  Security as SecurityIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  GetApp as ExcelIcon
} from '@mui/icons-material';

// 공통 컴포넌트
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';

// 타입 import
import type {
  RoleWithPermissions,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleStatistics,
  RoleId
} from '../../types';

// UI 타입
import type {
  DialogState
} from '../../types/role-ui.types';

// 역활 그리드 컬럼
import { roleColumns, permissionDetailColumns } from './components/RoleDataGrid/roleColumns';

// 모달 컴포넌트
import RoleFormModal from './components/RoleFormModal';
import PermissionAssignModal from './components/PermissionAssignModal';

// 스타일
import styles from './RoleMgmt.module.scss';

interface RoleMgmtProps {
  className?: string;
}

const RoleMgmt: React.FC<RoleMgmtProps> = ({ className }) => {
  // State Management
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  // const [selectedRoles, setSelectedRoles] = useState<RoleWithPermissions[]>([]);
  // const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
  const [mockPermissions, setMockPermissions] = useState<any[]>([]);

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: 'create',
    title: '',
    data: undefined
  });

  const [pagination] = useState({
    page: 1,
    size: 20,
    total: 5,
    totalPages: 1
  });

  // 핸들러들
  const handleRefresh = useCallback(() => {
    console.log('새로고침');
  }, []);

  const handleRoleSelect = useCallback((role: RoleWithPermissions) => {
    setSelectedRole(role);

    // 선택된 역활에 따른 권한 데이터 설정
    let permissionData: any[] = [];

    if (role.roleCode === 'Administrator') {
      permissionData = [
        {
          id: '1',
          sortOrder: 1,
          permissionCode: 'A01',
          permissionName: '운영관리자',
          businessPermission: true,
          mainBusinessPermission: true,
          executionPermission: false,
          description: '모든 유저 지시 및 권한 컨설',
          isActive: true
        },
        {
          id: '2',
          sortOrder: 2,
          permissionCode: 'A99',
          permissionName: '시스템관리자',
          businessPermission: true,
          mainBusinessPermission: false,
          executionPermission: true,
          description: '본무무서 직접',
          isActive: true
        }
      ];
    } else if (role.roleCode === 'Manager') {
      permissionData = [
        {
          id: '3',
          sortOrder: 1,
          permissionCode: 'M01',
          permissionName: '부서관리자',
          businessPermission: true,
          mainBusinessPermission: true,
          executionPermission: false,
          description: '부서별 관리 업무',
          isActive: true
        }
      ];
    } else if (role.roleCode === 'User') {
      permissionData = [
        {
          id: '4',
          sortOrder: 1,
          permissionCode: 'U01',
          permissionName: '기본 사용자',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '각 부절할 감시통릘 책정',
          isActive: false
        },
        {
          id: '5',
          sortOrder: 2,
          permissionCode: 'U80',
          permissionName: '소권부서',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '운영관리청',
          isActive: true
        },
        {
          id: '6',
          sortOrder: 3,
          permissionCode: 'U31',
          permissionName: '운영관리담당자',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '직업관리담당자',
          isActive: true
        },
        {
          id: '7',
          sortOrder: 4,
          permissionCode: 'U32',
          permissionName: '자료관리자',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '자료 관리 담당',
          isActive: true
        },
        {
          id: '8',
          sortOrder: 5,
          permissionCode: 'U33',
          permissionName: '직무관리담당자',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '직무관리담당자',
          isActive: true
        }
      ];
    }

    setMockPermissions(permissionData);

    // 선택된 역활의 detailRoleCount 업데이트
    setRoles(prevRoles =>
      prevRoles.map(r =>
        r.id === role.id
          ? { ...r, detailRoleCount: permissionData.length }
          : r
      )
    );
  }, []);

  const handleAddRole = useCallback(() => {
    setDialogState({
      isOpen: true,
      type: 'create',
      title: '새 역활 등록',
      data: null
    });
  }, []);

  const handleDeleteRoles = useCallback(() => {
    console.log('역활 삭제');
  }, []);

  const handlePermissionAssign = useCallback(() => {
    if (!selectedRole) return;
    setDialogState({
      isOpen: true,
      type: 'assign',
      title: '권한 할당',
      data: selectedRole
    });
  }, [selectedRole]);

  const handleDeletePermissions = useCallback(() => {
    console.log('권한 삭제');
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogState({
      isOpen: false,
      type: 'create',
      title: '',
      data: undefined
    });
  }, []);

  const handleRoleSave = useCallback(async (formData: CreateRoleRequest) => {
    console.log('역활 저장:', formData);
    handleDialogClose();
  }, [handleDialogClose]);

  const handleRoleUpdate = useCallback(async (id: RoleId, formData: UpdateRoleRequest) => {
    console.log('역활 수정:', id, formData);
    handleDialogClose();
  }, [handleDialogClose]);

  // 통계 계산
  const statistics = useMemo<RoleStatistics>(() => {
    const total = pagination.total;
    const activeCount = roles.filter(role => role.status === 'ACTIVE').length;
    const systemRoles = roles.filter(role => role.isSystemRole).length;

    return {
      totalRoles: total,
      activeRoles: activeCount,
      systemRoles,
      customRoles: total - systemRoles,
      rolesWithoutPermissions: 0
    };
  }, [pagination.total, roles]);

  // Mock 데이터 로딩
  React.useEffect(() => {
    const mockRoles: RoleWithPermissions[] = [
      {
        id: '1',
        roleCode: 'Administrator',
        roleName: '최고관리자',
        description: '시스템 전체 관리 권한',
        roleType: 'SYSTEM',
        status: 'ACTIVE',
        sortOrder: 1,
        isSystemRole: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        permissions: [],
        userCount: 2,
        detailRoleCount: 2  // 초기 상세역활수
      },
      {
        id: '2',
        roleCode: 'Manager',
        roleName: '관리자',
        description: '부서별 관리 권한',
        roleType: 'SYSTEM',
        status: 'ACTIVE',
        sortOrder: 2,
        isSystemRole: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        permissions: [],
        userCount: 5,
        detailRoleCount: 1  // 초기 상세역활수
      },
      {
        id: '3',
        roleCode: 'User',
        roleName: '사용자',
        description: '기본 사용자 권한',
        roleType: 'SYSTEM',
        status: 'ACTIVE',
        sortOrder: 3,
        isSystemRole: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        permissions: [],
        userCount: 5,
        detailRoleCount: 5  // 초기 상세역활수
      },
      {
        id: '4',
        roleCode: 'Any',
        roleName: '비로그인',
        description: '익명 사용자 권한',
        roleType: 'SYSTEM',
        status: 'ACTIVE',
        sortOrder: 4,
        isSystemRole: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        permissions: [],
        userCount: 0,
        detailRoleCount: 0  // 초기 상세역활수
      }
    ];

    setRoles(mockRoles);

    // 첫 번째 역활 자동 선택
    if (mockRoles.length > 0) {
      setSelectedRole(mockRoles[0]);
      // Mock 권한 데이터 설정
      const mockPermissionData = [
        {
          id: '1',
          sortOrder: 1,
          permissionCode: 'A01',
          permissionName: '운영관리자',
          businessPermission: true,
          mainBusinessPermission: true,
          executionPermission: false,
          description: '모든 유저 지시 및 권한 컨설',
          isActive: true
        },
        {
          id: '2',
          sortOrder: 2,
          permissionCode: 'A99',
          permissionName: '시스템관리자',
          businessPermission: true,
          mainBusinessPermission: false,
          executionPermission: true,
          description: '본무무서 직접',
          isActive: true
        },
        {
          id: '3',
          sortOrder: 3,
          permissionCode: 'U01',
          permissionName: '기본 사용자',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '각 부절할 감시통릴 책정',
          isActive: false
        },
        {
          id: '4',
          sortOrder: 4,
          permissionCode: 'U80',
          permissionName: '소권부서',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '운영관리청',
          isActive: true
        },
        {
          id: '5',
          sortOrder: 5,
          permissionCode: 'U31',
          permissionName: '운영관리담당자',
          businessPermission: false,
          mainBusinessPermission: false,
          executionPermission: false,
          description: '직업관리담당자',
          isActive: true
        }
      ];
      setMockPermissions(mockPermissionData);
    }
  }, [handleRoleSelect]);

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
                <div className={styles.statNumber}>{mockPermissions.length}</div>
                <div className={styles.statLabel}>권한 수</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* 좌측 패널 - 역활 목록 */}
          <Grid item xs={12} md={3.6}>
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
                  >
                    <RefreshIcon />
                  </IconButton>
                </div>
                <div className={styles.leftActionButtons}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ExcelIcon />}
                    className={styles.actionButton}
                  >
                    엑셀다운로드
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    className={styles.actionButton}
                    onClick={handleAddRole}
                  >
                    역활 등록
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    className={styles.actionButton}
                    onClick={handleDeleteRoles}
                  >
                    삭제
                  </Button>
                </div>
              </div>

              {/* 역활 목록 그리드 */}
              <div className={styles.leftGrid}>
                <BaseDataGrid
                  data={roles}
                  columns={roleColumns}
                  onRowClick={handleRoleSelect}
                  height="100%"
                  pagination={false}
                  rowSelection="single"
                  suppressRowDeselection={true}
                />
              </div>
            </Paper>
          </Grid>

          {/* 우측 패널 - 상세역활 (권한) */}
          <Grid item xs={12} md={8.4}>
            <Paper className={styles.rightPanel}>
              {/* 우측 헤더 */}
              <div className={styles.rightHeader}>
                <div className={styles.selectedGroupInfo}>
                  {selectedRole ? (
                    <>
                      <Typography variant="h6" className={styles.sectionTitle}>
                        [{selectedRole.roleCode}] 상세역활 목록
                      </Typography>
                      <Chip
                        label={selectedRole.roleType || 'CUSTOM'}
                        size="small"
                        color="primary"
                        style={{ marginLeft: '8px' }}
                      />
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
                      onClick={handlePermissionAssign}
                      disabled={!selectedRole}
                    >
                      권한할당
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      className={styles.actionButton}
                      onClick={handleDeletePermissions}
                      disabled={!selectedRole}
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
                ) : mockPermissions.length === 0 ? (
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
                    data={mockPermissions}
                    columns={permissionDetailColumns}
                    height="100%"
                    pagination={false}
                  suppressHorizontalScroll={false}
                  suppressColumnVirtualisation={false}
                  />
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>

      {/* 모달들 */}
      <RoleFormModal
        open={dialogState.isOpen && (dialogState.type === 'create' || dialogState.type === 'edit')}
        mode={dialogState.type === 'create' ? 'create' : 'edit'}
        role={dialogState.data}
        onClose={handleDialogClose}
        onSave={handleRoleSave}
        onUpdate={handleRoleUpdate}
        loading={false}
      />

      <PermissionAssignModal
        open={dialogState.isOpen && dialogState.type === 'assign'}
        role={dialogState.data}
        onClose={handleDialogClose}
        loading={false}
      />
    </div>
  );
};

export default RoleMgmt;