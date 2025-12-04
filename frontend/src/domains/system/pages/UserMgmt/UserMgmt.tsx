/**
 * 사용자관리 시스템 메인 컴포넌트
 *
 * @description PositionMgmt 표준 템플릿 기반 사용자관리 시스템
 * - 실제 DB 데이터 연동 (users, user_roles, employees 테이블)
 * - API: /api/system/users
 * @author RSMS Development Team
 * @version 2.0.0
 * @created 2025-09-24
 * @updated 2025-12-04 - 실제 데이터 연동
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './UserMgmt.module.scss';

// Types
import type {
  User,
  UserFilters,
  UserModalState,
  UserStatistics,
  RoleOption,
  AccountStatus
} from './types/user.types';

// API
import {
  getAllUsers,
  searchUsers,
  deleteUsers,
  getActiveRoles,
  type UserDto
} from '../../api/userMgmtApi';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField } from '@/shared/components/organisms/BaseSearchFilter';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import { OrganizationSelect } from '@/shared/components/molecules/OrganizationSelect';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import usePagination from '@/shared/hooks/usePagination';
import useFilters from '@/shared/hooks/useFilters';

// User specific components
import { userColumns } from './components/UserDataGrid/userColumns';

// Lazy-loaded components for performance optimization
const UserFormModal = React.lazy(() =>
  import('./components/UserFormModal/UserFormModal').then(module => ({ default: module.default }))
);

interface UserMgmtProps {
  className?: string;
}

/**
 * UserDto (API 응답)를 User (Frontend 타입)로 변환
 * - API 응답 데이터를 UI 컴포넌트에서 사용할 수 있는 형식으로 변환
 */
const convertDtoToUser = (dto: UserDto): User => {
  return {
    id: dto.userId.toString(),
    username: dto.username,
    employeeNo: dto.empNo || '',
    fullName: dto.empName || dto.username,
    englishName: dto.empNameEn,
    email: dto.email,
    deptCode: dto.orgCode,
    deptName: dto.orgName,
    positionName: dto.positionName,
    accountStatus: (dto.accountStatus || 'ACTIVE') as AccountStatus,
    passwordChangeRequired: dto.passwordChangeRequired,
    lastLoginAt: dto.lastLoginAt,
    failedLoginCount: dto.failedLoginCount,
    isAdmin: dto.isAdmin,
    isExecutive: dto.isExecutive,
    authLevel: dto.authLevel,
    isLoginBlocked: dto.isLoginBlocked,
    timezone: dto.timezone || 'Asia/Seoul',
    language: dto.language || 'ko',
    isActive: dto.isActive,
    roles: dto.roles?.map(role => ({
      id: role.userRoleId?.toString() || '',
      userId: dto.userId.toString(),
      roleId: role.roleId.toString(),
      roleCode: role.roleCode,
      roleName: role.roleName,
      detailRoleCount: 0,
      assignedAt: role.assignedAt || '',
      assignedBy: role.assignedBy || '',
      isActive: role.isActive
    })),
    roleCount: dto.roleCount,
    createdAt: dto.createdAt || '',
    updatedAt: dto.updatedAt || '',
    createdBy: dto.createdBy,
    updatedBy: dto.updatedBy,
    isDeleted: false
  };
};

const UserMgmt: React.FC<UserMgmtProps> = ({ className }) => {
  // i18n 훅 (추후 다국어 지원 시 사용)
  useTranslation('system');

  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 모달 상태 관리
  const [modalState, setModalState] = useState<UserModalState>({
    addModal: false,
    detailModal: false,
    selectedUser: null
  });

  // Custom Hooks
  const { handlers, loadingStates, loading } = useAsyncHandlers({
    search: { key: 'user-search' },
    excel: { key: 'user-excel' },
    delete: { key: 'user-delete' },
    create: { key: 'user-create' },
    update: { key: 'user-update' }
  });

  const { pagination, updateTotal } = usePagination({
    initialPage: 1,
    initialSize: 20,
    total: 0
  });

  const {
    filters,
    setFilter,
    clearFilters
  } = useFilters<UserFilters>({});

  // 역할 목록 (드롭다운용)
  const [, setRoles] = useState<RoleOption[]>([]);

  /**
   * 사용자 목록 조회
   * - 컴포넌트 마운트 시 및 검색 시 호출
   */
  const fetchUsers = useCallback(async (keyword?: string) => {
    try {
      let response: UserDto[];

      if (keyword && keyword.trim()) {
        response = await searchUsers(keyword);
      } else {
        response = await getAllUsers();
      }

      const convertedUsers = response.map(convertDtoToUser);
      setUsers(convertedUsers);
      updateTotal(convertedUsers.length);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    }
  }, [updateTotal]);

  /**
   * 역할 목록 조회 (드롭다운용)
   */
  const fetchRoles = useCallback(async () => {
    try {
      const response = await getActiveRoles();
      const convertedRoles: RoleOption[] = response.map(role => ({
        id: role.roleId.toString(),
        code: role.roleCode,
        name: role.roleName,
        detailRoleCount: 0,
        isSystemRole: false
      }));
      setRoles(convertedRoles);
    } catch (error) {
      console.error('역할 목록 조회 실패:', error);
    }
  }, []);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    const initializeData = async () => {
      setIsInitialLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setIsInitialLoading(false);
    };
    initializeData();
  }, [fetchUsers, fetchRoles]);

  // 부서 선택 변경 핸들러
  const handleOrgChange = useCallback((orgCode: string | null) => {
    setFilter('deptCode', orgCode || '');
  }, [setFilter]);

  // 검색 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'deptCode',
      type: 'custom',
      label: '부서',
      gridSize: { xs: 6, sm: 4, md: 2 },
      customComponent: (
        <OrganizationSelect
          value={filters.deptCode as string || null}
          onChange={handleOrgChange}
          label="부서"
          placeholder="부서를 선택하세요"
          size="small"
          fullWidth
        />
      )
    },
    {
      key: 'fullName',
      type: 'text',
      label: '성명',
      placeholder: '성명을 입력하세요',
      gridSize: { xs: 6, sm: 4, md: 2 }
    }
  ], [filters.deptCode, handleOrgChange]);

  /**
   * 검색 핸들러
   * - API searchUsers 호출
   * - filters 상태에서 검색어 추출
   */
  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // 검색어 추출 (fullName 또는 deptCode)
        const keyword = (filters.fullName as string) || '';
        await fetchUsers(keyword);
        // TODO: 부서코드(deptCode)로 필터링하는 로직은 백엔드 API 확장 필요
        // 현재는 성명으로만 검색
      },
      {
        loading: '사용자를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [handlers.search, filters, fetchUsers]);

  // 필터 변경 핸들러
  const handleFiltersChange = useCallback((newFilters: Partial<UserFilters>) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      setFilter(key as keyof UserFilters, value);
    });
  }, [setFilter]);

  // 필터 초기화 핸들러
  const handleClearFilters = useCallback(() => {
    clearFilters();
    fetchUsers(); // 전체 목록 다시 조회
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters, fetchUsers]);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // TODO: 실제 엑셀 다운로드 API 호출
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('엑셀 다운로드 완료');
      },
      {
        loading: '엑셀 파일을 생성 중입니다...',
        success: '엑셀 파일이 다운로드되었습니다.',
        error: '엑셀 다운로드에 실패했습니다.'
      }
    );
  }, [handlers.excel]);

  // 사용자 등록 모달 열기
  const handleAddUser = useCallback(() => {
    setModalState({
      addModal: true,
      detailModal: false,
      selectedUser: null
    });
  }, []);

  // 사용자 수정 모달 열기
  const handleEditUser = useCallback((user: User) => {
    setModalState({
      addModal: false,
      detailModal: true,
      selectedUser: user
    });
  }, []);

  // 모달 닫기 핸들러
  const handleModalClose = useCallback(() => {
    setModalState({
      addModal: false,
      detailModal: false,
      selectedUser: null
    });
  }, []);

  /**
   * 사용자 복수 삭제 핸들러
   * - API deleteUsers 호출
   */
  const handleDeleteSelectedUsers = useCallback(async () => {
    if (selectedUsers.length === 0) {
      toast.warning('삭제할 사용자를 선택해주세요.');
      return;
    }

    await handlers.delete.execute(
      async () => {
        const userIds = selectedUsers.map(user => parseInt(user.id));
        const result = await deleteUsers(userIds);

        if (result.failCount > 0) {
          toast.warning(`${result.successCount}개 성공, ${result.failCount}개 실패`);
        }

        await fetchUsers(); // 목록 새로고침
        setSelectedUsers([]); // 선택 초기화
      },
      {
        loading: '선택한 사용자를 삭제 중입니다...',
        success: '선택한 사용자가 삭제되었습니다.',
        error: '사용자 삭제에 실패했습니다.'
      }
    );
  }, [handlers.delete, selectedUsers, fetchUsers]);

  // 액션 버튼 정의
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      label: '엑셀다운로드',
      variant: 'contained',
      onClick: handleExcelDownload,
      loading: loadingStates.excel
    },
    {
      key: 'add',
      label: '등록',
      variant: 'contained',
      onClick: handleAddUser
    },
    {
      key: 'delete',
      label: '삭제',
      variant: 'contained',
      onClick: handleDeleteSelectedUsers,
      loading: loadingStates.delete,
      disabled: selectedUsers.length === 0
    }
  ], [handleExcelDownload, handleAddUser, handleDeleteSelectedUsers, loadingStates.excel, loadingStates.delete, selectedUsers.length]);

  // 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '전체',
      value: `${pagination.total}명`,
      color: 'primary' as const
    },
    {
      label: '선택',
      value: `${selectedUsers.length}명`,
      color: 'secondary' as const
    }
  ], [pagination.total, selectedUsers.length]);

  // 통계 계산
  const statistics = useMemo<UserStatistics>(() => {
    const total = users.length;
    const activeCount = users.filter(user => user.accountStatus === 'ACTIVE').length;
    const lockedCount = users.filter(user => user.accountStatus === 'LOCKED').length;
    const adminCount = users.filter(user => user.isAdmin).length;

    return {
      totalUsers: total,
      activeUsers: activeCount,
      lockedUsers: lockedCount,
      adminUsers: adminCount,
      recentLogins: 0
    };
  }, [users]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <PeopleIcon />,
      value: statistics.totalUsers,
      label: '전체 사용자',
      color: 'primary' as const
    },
    {
      icon: <PersonAddIcon />,
      value: statistics.activeUsers,
      label: '활성 사용자',
      color: 'success' as const
    },
    {
      icon: <SupervisorAccountIcon />,
      value: statistics.adminUsers,
      label: '관리자',
      color: 'warning' as const
    }
  ], [statistics]);

  // React.Profiler onRender 콜백 (성능 모니터링)
  const onRenderProfiler = useCallback((
    _id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number
  ) => {
    if (actualDuration > 16) { // 60fps 기준 16ms
      console.warn(`🐌 [UserMgmt] ${phase} took ${actualDuration.toFixed(2)}ms`);
    }
  }, []);

  // 초기 로딩 중 표시
  if (isInitialLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <LoadingSpinner text="사용자 목록을 불러오는 중입니다..." />
      </div>
    );
  }

  return (
    <React.Profiler id="UserMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 공통 페이지 헤더 */}
        <BasePageHeader
          icon={<SecurityIcon />}
          title="사용자관리"
          description="시스템 사용자 계정을 통합 관리합니다"
          statistics={headerStatistics}
          i18nNamespace="system"
        />

        <div className={styles.content}>
          {/* 공통 검색 필터 */}
          <BaseSearchFilter
            fields={searchFields}
            values={filters}
            onValuesChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 공통 액션 바 */}
          <BaseActionBar
            statusInfo={statusInfo}
            actions={actionButtons}
          />

          {/* 공통 데이터 그리드 */}
          {loading ? (
            <LoadingSpinner text="사용자 목록을 불러오는 중입니다..." />
          ) : (
            <BaseDataGrid
              data={users}
              columns={userColumns}
              loading={loading}
              theme="alpine"
              onRowDoubleClick={handleEditUser}
              onSelectionChange={setSelectedUsers}
              height="calc(100vh - 380px)"
              pagination={true}
              pageSize={pagination.size}
              rowSelection="multiple"
              checkboxSelection={true}
              suppressHorizontalScroll={false}
              suppressColumnVirtualisation={false}
            />
          )}
        </div>

        {/* 사용자 폼 모달 - BaseModalWrapper 적용 */}
        <BaseModalWrapper
          isOpen={modalState.addModal || modalState.detailModal}
          onClose={handleModalClose}
          ariaLabel="사용자 관리 모달"
          fallbackComponent={<LoadingSpinner text="사용자 모달을 불러오는 중..." />}
        >
          <UserFormModal
            open={modalState.addModal || modalState.detailModal}
            mode={modalState.addModal ? 'create' : 'detail'}
            user={modalState.selectedUser}
            onClose={handleModalClose}
            onRefresh={fetchUsers}
            loading={loadingStates.create || loadingStates.update}
          />
        </BaseModalWrapper>
      </div>
    </React.Profiler>
  );
};

export default UserMgmt;
