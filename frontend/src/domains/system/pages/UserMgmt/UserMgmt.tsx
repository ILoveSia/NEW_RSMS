/**
 * 사용자관리 시스템 메인 컴포넌트
 *
 * @description PositionMgmt 표준 템플릿 기반 사용자관리 시스템
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './UserMgmt.module.scss';

// Types
import type {
  User,
  UserFilters,
  UserFormData,
  UserModalState,
  UserPagination,
  CreateUserRequest,
  UpdateUserRequest,
  UserStatistics,
  RoleOption,
  DetailRoleOption,
  DepartmentOption,
  PositionOption
} from './types/user.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// User specific components
import { userColumns } from './components/UserDataGrid/userColumns';

// Lazy-loaded components for performance optimization
const UserFormModal = React.lazy(() =>
  import('./components/UserFormModal/UserFormModal').then(module => ({ default: module.default }))
);

interface UserMgmtProps {
  className?: string;
}

const UserMgmt: React.FC<UserMgmtProps> = ({ className }) => {
  const { t } = useTranslation('system');

  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    create: false,
    update: false
  });

  // 모달 상태 관리
  const [modalState, setModalState] = useState<UserModalState>({
    addModal: false,
    detailModal: false,
    selectedUser: null
  });

  // 페이지네이션 상태
  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    size: 20,
    total: 4,
    totalPages: 1
  });

  // 검색 필터 상태
  const [filters, setFilters] = useState<UserFilters>({});

  // 옵션 데이터
  const [roles] = useState<RoleOption[]>([]);
  const [detailRoles] = useState<DetailRoleOption[]>([]);
  const [departments] = useState<DepartmentOption[]>([]);
  const [positions] = useState<PositionOption[]>([]);

  // 검색 필드 정의 (이미지 기준으로 수정)
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'deptName',
      type: 'text',
      label: '부정',
      placeholder: '부서명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'fullName',
      type: 'text',
      label: '성명',
      placeholder: '성명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'jobRankName',
      type: 'text',
      label: '직위',
      placeholder: '직위를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    }
  ], []);

  // 검색 핸들러
  const handleSearch = useCallback(async (searchFilters: FilterValues) => {
    setLoadingStates(prev => ({ ...prev, search: true }));
    setFilters(searchFilters as UserFilters);

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('사용자를 검색 중입니다...');

    try {
      // TODO: 실제 검색 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      // Mock 검색 결과
      const mockFilteredUsers = mockUsers.filter(user => {
        if (searchFilters.fullName && !user.fullName.includes(searchFilters.fullName as string)) return false;
        if (searchFilters.employeeNo && !user.employeeNo.includes(searchFilters.employeeNo as string)) return false;
        if (searchFilters.searchKeyword && !user.deptName?.includes(searchFilters.searchKeyword as string)) return false;
        return true;
      });

      setUsers(mockFilteredUsers);
      setPagination(prev => ({
        ...prev,
        total: mockFilteredUsers.length
      }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${mockFilteredUsers.length}개의 사용자를 찾았습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, []);

  // 필터 변경 핸들러
  const handleFiltersChange = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 필터 초기화 핸들러
  const handleClearFilters = useCallback(() => {
    setFilters({
      deptName: '',
      fullName: '',
      jobRankName: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  // 사용자 등록 핸들러
  const handleAddUser = useCallback(() => {
    setModalState({
      addModal: true,
      detailModal: false,
      selectedUser: null
    });
  }, []);

  // 사용자 수정 핸들러
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

  // 사용자 저장 핸들러
  const handleUserSave = useCallback(async (formData: CreateUserRequest) => {
    setLoadingStates(prev => ({ ...prev, create: true }));

    const loadingToastId = toast.loading('사용자를 등록 중입니다...');

    try {
      // TODO: 실제 사용자 등록 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // Mock 사용자 추가
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.employeeNo,
        employeeNo: formData.employeeNo,
        fullName: formData.fullName,
        englishName: formData.englishName,
        deptId: formData.deptId,
        deptName: '새 부서',
        positionId: formData.positionId,
        positionName: '새 직책',
        accountStatus: formData.accountStatus,
        passwordChangeRequired: formData.passwordChangeRequired,
        failedLoginCount: 0,
        isAdmin: false,
        isExecutive: false,
        authLevel: 5,
        timezone: formData.timezone,
        language: 'Korean',
        isActive: formData.isActive,
        roleCount: formData.roleIds.length,
        detailRoleCount: formData.detailRoleIds.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };

      setUsers(prev => [newUser, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));

      toast.update(loadingToastId, 'success', '사용자가 등록되었습니다.');
      handleModalClose();
    } catch (error) {
      toast.update(loadingToastId, 'error', '사용자 등록에 실패했습니다.');
      console.error('사용자 등록 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  }, [handleModalClose]);

  // 사용자 수정 핸들러
  const handleUserUpdate = useCallback(async (id: string, formData: UpdateUserRequest) => {
    setLoadingStates(prev => ({ ...prev, update: true }));

    const loadingToastId = toast.loading('사용자 정보를 수정 중입니다...');

    try {
      // TODO: 실제 사용자 수정 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      setUsers(prev =>
        prev.map(user =>
          user.id === id
            ? {
                ...user,
                fullName: formData.fullName,
                englishName: formData.englishName,
                accountStatus: formData.accountStatus,
                isActive: formData.isActive,
                timezone: formData.timezone,
                updatedAt: new Date().toISOString()
              }
            : user
        )
      );

      toast.update(loadingToastId, 'success', '사용자 정보가 수정되었습니다.');
      handleModalClose();
    } catch (error) {
      toast.update(loadingToastId, 'error', '사용자 수정에 실패했습니다.');
      console.error('사용자 수정 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, update: false }));
    }
  }, [handleModalClose]);

  // 사용자 삭제 핸들러
  const handleDeleteUser = useCallback(async (id: string) => {
    const loadingToastId = toast.loading('사용자를 삭제 중입니다...');

    try {
      // TODO: 실제 사용자 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      setUsers(prev => prev.filter(user => user.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));

      toast.update(loadingToastId, 'success', '사용자가 삭제되었습니다.');
      handleModalClose();
    } catch (error) {
      toast.update(loadingToastId, 'error', '사용자 삭제에 실패했습니다.');
      console.error('사용자 삭제 실패:', error);
    }
  }, [handleModalClose]);

  // 액션 버튼 정의
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      label: '엑셀다운로드',
      variant: 'contained',
      onClick: handleExcelDownload,
      loading: loadingStates.excel
    },
    {
      label: '등록',
      variant: 'contained',
      onClick: handleAddUser
    }
  ], [handleExcelDownload, handleAddUser, loadingStates.excel]);

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
    const total = pagination.total;
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
  }, [pagination.total, users]);

  // Mock 데이터 로딩 - 참조 이미지 기반
  const mockUsers: User[] = useMemo(() => [
    {
      id: '1',
      username: 'fit3',
      employeeNo: '0000003',
      fullName: 'FIT 3',
      deptName: '여신실사부',
      positionName: '사원',
      accountStatus: 'ACTIVE',
      passwordChangeRequired: true,
      lastLoginAt: '2024-09-23T14:30:00Z',
      failedLoginCount: 0,
      isAdmin: false,
      isExecutive: false,
      authLevel: 5,
      roles: [
        {
          id: 'r1',
          userId: '1',
          roleId: 'role_user',
          roleCode: 'USER',
          roleName: '일반사용자',
          detailRoleCount: 3,
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin',
          isActive: true
        }
      ],
      roleCount: 1,
      detailRoleCount: 3,
      timezone: '(GMT+09:00) Seoul/Asia',
      language: 'English, United States',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isDeleted: false
    },
    {
      id: '2',
      username: 'fit2',
      employeeNo: '0000002',
      fullName: 'FIT 2',
      deptName: '영업부',
      positionName: '주임',
      accountStatus: 'ACTIVE',
      passwordChangeRequired: false,
      lastLoginAt: '2024-09-23T13:45:00Z',
      failedLoginCount: 0,
      isAdmin: false,
      isExecutive: false,
      authLevel: 5,
      roles: [
        {
          id: 'r2',
          userId: '2',
          roleId: 'role_user',
          roleCode: 'USER',
          roleName: '일반사용자',
          detailRoleCount: 2,
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin',
          isActive: true
        }
      ],
      roleCount: 1,
      detailRoleCount: 2,
      timezone: '(GMT+09:00) Seoul/Asia',
      language: 'English, United States',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isDeleted: false
    },
    {
      id: '3',
      username: 'manager',
      employeeNo: '0000001',
      fullName: '관리감리부',
      deptName: '경영전략부',
      positionName: '대리',
      accountStatus: 'ACTIVE',
      passwordChangeRequired: false,
      lastLoginAt: '2024-09-23T12:20:00Z',
      failedLoginCount: 0,
      isAdmin: false,
      isExecutive: false,
      authLevel: 5,
      roles: [
        {
          id: 'r3',
          userId: '3',
          roleId: 'role_manager',
          roleCode: 'MANAGER',
          roleName: '관리자',
          detailRoleCount: 5,
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'admin',
          isActive: true
        }
      ],
      roleCount: 1,
      detailRoleCount: 5,
      timezone: '(GMT+09:00) Seoul/Asia',
      language: 'English, United States',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isDeleted: false
    },
    {
      id: '4',
      username: 'admin',
      employeeNo: '0000000',
      fullName: '관리자',
      deptName: '법무팀',
      positionName: '과장',
      accountStatus: 'ACTIVE',
      passwordChangeRequired: false,
      lastLoginAt: '2024-09-23T16:00:00Z',
      failedLoginCount: 0,
      isAdmin: true,
      isExecutive: true,
      authLevel: 1,
      roles: [
        {
          id: 'r4',
          userId: '4',
          roleId: 'role_admin',
          roleCode: 'ADMIN',
          roleName: '시스템관리자',
          detailRoleCount: 10,
          assignedAt: '2024-01-01T00:00:00Z',
          assignedBy: 'system',
          isActive: true
        }
      ],
      roleCount: 1,
      detailRoleCount: 10,
      timezone: '(GMT+09:00) Seoul/Asia',
      language: 'English, United States',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isDeleted: false
    }
  ], []);

  // 컴포넌트 마운트 시 Mock 데이터 설정
  React.useEffect(() => {
    setUsers(mockUsers);
    setPagination(prev => ({
      ...prev,
      total: mockUsers.length
    }));
  }, [mockUsers]);

  // React.Profiler onRender 콜백 (성능 모니터링)
  const onRenderProfiler = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number
  ) => {
    if (actualDuration > 16) { // 60fps 기준 16ms
      console.warn(`🐌 [UserMgmt] ${phase} took ${actualDuration.toFixed(2)}ms`);
    }
  }, []);

  return (
    <React.Profiler id="UserMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <SecurityIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>사용자관리</h1>
              <p className={styles.pageDescription}>
                시스템 사용자 계정을 통합 관리합니다
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <PeopleIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalUsers}</div>
                <div className={styles.statLabel}>전체 사용자</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <PersonAddIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.activeUsers}</div>
                <div className={styles.statLabel}>활성 사용자</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SupervisorAccountIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.adminUsers}</div>
                <div className={styles.statLabel}>관리자</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* 🔍 공통 검색 필터 */}
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

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          statusInfo={statusInfo}
          actions={actionButtons}
        />

        {/* 🎯 공통 데이터 그리드 */}
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
            />
        )}
      </div>

      {/* 사용자 폼 모달 */}
      {(modalState.addModal || modalState.detailModal) && (
        <React.Suspense fallback={<LoadingSpinner />}>
          <UserFormModal
            open={modalState.addModal || modalState.detailModal}
            mode={modalState.addModal ? 'create' : 'edit'}
            user={modalState.selectedUser}
            onClose={handleModalClose}
            onSave={handleUserSave}
            onUpdate={handleUserUpdate}
            onDelete={handleDeleteUser}
            loading={loadingStates.create || loadingStates.update}
            roles={roles}
            detailRoles={detailRoles}
            departments={departments}
            positions={positions}
          />
        </React.Suspense>
      )}
    </div>
    </React.Profiler>
  );
};

export default UserMgmt;