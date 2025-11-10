/**
 * 부서장업무메뉴얼관리 메인 컴포넌트
 * @description PositionMgmt 표준 구조를 적용한 부서장업무메뉴얼 관리 화면
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SecurityIcon from '@mui/icons-material/Security';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DeptOpManualsMgmt.module.scss';

// Types
import type {
  DeptOpManual,
  DeptOpManualsFilters,
  DeptOpManualsModalState,
  DeptOpManualsPagination,
  DeptOpManualsStatistics,
  ManagementActivityType,
  RiskAssessmentLevel
} from './types/deptOpManuals.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// DeptOpManuals specific components
import { deptOpManualsColumns } from './components/DeptOpManualsDataGrid/deptOpManualsColumns';

// Lazy-loaded components for performance optimization
const DeptOpManualsFormModal = React.lazy(() =>
  import('./components/DeptOpManualsFormModal/DeptOpManualsFormModal').then(module => ({ default: module.default }))
);

interface DeptOpManualsMgmtProps {
  className?: string;
}

const DeptOpManualsMgmt: React.FC<DeptOpManualsMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [deptOpManuals, setDeptOpManuals] = useState<DeptOpManual[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeptOpManual[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    create: false,
    approve: false
  });

  // 필터 및 페이지네이션
  const [filters, setFilters] = useState<DeptOpManualsFilters>({
    ledgerOrder: '',
    managementObligation: '',
    irregularityName: '',
    managementActivityType: 'all',
    managementActivity: '',
    riskAssessmentLevel: 'all',
    isActive: 'all',
    approvalStatus: 'all',
    implementationManager: ''
  });

  const [pagination, setPagination] = useState<DeptOpManualsPagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0
  });

  // 모달 상태
  const [modalState, setModalState] = useState<DeptOpManualsModalState>({
    isOpen: false,
    mode: 'create'
  });

  // 조직조회팝업 상태
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  // 📊 Mock 데이터
  const mockDeptOpManuals: DeptOpManual[] = useMemo(() => [
    {
      id: '1',
      seq: 1,
      managementObligation: '준법감시 업무와 관련된 책무 세부내용에 대한 관리의무',
      irregularityName: '경영전략부',
      managementActivityCode: 'M201300001',
      managementActivity: '준법감시 업무와 관련된 관리활동',
      managementActivityName: '경영전략 수립의 적정성 점검',
      managementActivityDetail: '부서별 준법감시담당자 점검 보고',
      managementActivityType: 'compliance',
      riskAssessmentLevel: 'medium',
      implementationManager: '경영전략 수립의 적정성 점검',
      implementationDepartment: '준법감시부',
      isActive: true,
      status: 'active',
      approvalStatus: 'approved',
      createdAt: '2025-08-01T09:00:00.000Z',
      createdBy: '관리자',
      updatedAt: '2025-09-18T14:30:00.000Z',
      updatedBy: '준법감시부',
      approvedAt: '2025-08-02T10:00:00.000Z',
      approvedBy: '본부장',
      remarks: '월간 정기 점검 실시'
    },
    {
      id: '2',
      seq: 2,
      managementObligation: '리스크관리 업무와 관련된 책무',
      irregularityName: '준법지원부',
      managementActivityCode: 'M201300002',
      managementActivity: '리스크 식별 및 평가',
      managementActivityName: '준법감시 업무와 관련된 관리활동',
      managementActivityDetail: '운영리스크 식별 및 평가 절차',
      managementActivityType: 'risk',
      riskAssessmentLevel: 'high',
      implementationManager: '준법감시 업무와 관련된 관리활동',
      implementationDepartment: '리스크관리부',
      isActive: true,
      status: 'active',
      approvalStatus: 'pending',
      createdAt: '2025-08-15T10:30:00.000Z',
      createdBy: '리스크관리부',
      remarks: '분기별 리스크 평가 실시'
    },
    {
      id: '3',
      seq: 3,
      managementObligation: '내부감사 업무 관련 관리의무',
      irregularityName: '리스크관리부',
      managementActivityCode: 'M201300003',
      managementActivity: '내부감사 품질관리',
      managementActivityName: '내부감사 품질관리',
      managementActivityDetail: '내부감사 품질 보증 및 개선',
      managementActivityType: 'internal_audit',
      riskAssessmentLevel: 'medium',
      implementationManager: '내부감사 품질 보증 및 개선',
      implementationDepartment: '내부감사부',
      isActive: true,
      status: 'pending',
      approvalStatus: 'draft',
      createdAt: '2025-09-01T11:00:00.000Z',
      createdBy: '내부감사부',
      remarks: '반기별 품질평가 수행'
    },
    {
      id: '4',
      seq: 4,
      managementObligation: '재무관리 업무 관련 책무',
      irregularityName: '여신관리부',
      managementActivityCode: 'M201300004',
      managementActivity: '재무보고서 작성 및 검토',
      managementActivityName: '재무보고서 작성 및 검토',
      managementActivityDetail: '월간/분기별 재무보고서 작성',
      managementActivityType: 'finance',
      riskAssessmentLevel: 'low',
      implementationManager: '월간/분기별 재무보고서 작성',
      implementationDepartment: '재무부',
      isActive: false,
      status: 'inactive',
      approvalStatus: 'rejected',
      createdAt: '2025-07-20T09:30:00.000Z',
      createdBy: '재무부',
      updatedAt: '2025-08-10T16:00:00.000Z',
      updatedBy: '재무부',
      remarks: '프로세스 개선 필요'
    }
  ], []);

  // 📊 통계 계산
  const statistics: DeptOpManualsStatistics = useMemo(() => {
    const total = mockDeptOpManuals.length;
    const active = mockDeptOpManuals.filter(item => item.isActive).length;
    const inactive = total - active;
    const pendingApprovals = mockDeptOpManuals.filter(item => item.approvalStatus === 'pending').length;
    const highRisk = mockDeptOpManuals.filter(item =>
      ['very_high', 'high'].includes(item.riskAssessmentLevel)
    ).length;
    const recent = mockDeptOpManuals.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.createdAt) >= weekAgo;
    }).length;

    return {
      totalActivities: total,
      activeActivities: active,
      inactiveActivities: inactive,
      pendingApprovals,
      highRiskActivities: highRisk,
      recentlyCreated: recent
    };
  }, [mockDeptOpManuals]);

  // 🔍 필터링된 데이터
  const displayData = useMemo(() => {
    let filtered = [...mockDeptOpManuals];

    // 관리의무 필터
    if (filters.managementObligation) {
      filtered = filtered.filter(item =>
        item.managementObligation.toLowerCase().includes(filters.managementObligation!.toLowerCase())
      );
    }

    // 부정명 필터
    if (filters.irregularityName) {
      filtered = filtered.filter(item =>
        item.irregularityName.toLowerCase().includes(filters.irregularityName!.toLowerCase())
      );
    }

    // 관리활동구분 필터
    if (filters.managementActivityType && filters.managementActivityType !== 'all') {
      filtered = filtered.filter(item => item.managementActivityType === filters.managementActivityType);
    }

    // 관리활동 필터
    if (filters.managementActivity) {
      filtered = filtered.filter(item =>
        item.managementActivity.toLowerCase().includes(filters.managementActivity!.toLowerCase())
      );
    }

    // 위험평가등급 필터
    if (filters.riskAssessmentLevel && filters.riskAssessmentLevel !== 'all') {
      filtered = filtered.filter(item => item.riskAssessmentLevel === filters.riskAssessmentLevel);
    }

    // 사용여부 필터
    if (filters.isActive !== 'all') {
      filtered = filtered.filter(item => item.isActive === filters.isActive);
    }

    // 결재여부 필터
    if (filters.approvalStatus && filters.approvalStatus !== 'all') {
      filtered = filtered.filter(item => item.approvalStatus === filters.approvalStatus);
    }

    // 이행주관담당 필터
    if (filters.implementationManager) {
      filtered = filtered.filter(item =>
        item.implementationManager.toLowerCase().includes(filters.implementationManager!.toLowerCase())
      );
    }

    return filtered;
  }, [mockDeptOpManuals, filters]);

  // 초기 데이터 로드
  React.useEffect(() => {
    setDeptOpManuals(displayData);
    setPagination(prev => ({
      ...prev,
      total: displayData.length,
      totalPages: Math.ceil(displayData.length / prev.pageSize)
    }));
  }, [displayData]);

  // 조직조회 핸들러
  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  // 조직 선택 핸들러
  const handleOrganizationSelect = useCallback((organization: Organization) => {
    setFilters(prev => ({
      ...prev,
      irregularityName: organization.orgCode || ''
    }));
    setOrganizationSearchOpen(false);
    toast.success(`부점코드 "${organization.orgCode}" 선택되었습니다.`);
  }, []);

  // 조직조회 모달 닫기
  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
  }, []);

  // 🔍 검색 필드 정의
  const searchFields: FilterField[] = useMemo(() => [
    {
      key: 'ledgerOrder',
      label: '책무이행차수',
      type: 'custom',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrder || undefined}
          onChange={(value) => setFilters(prev => ({ ...prev, ledgerOrder: value || '' }))}
          label="책무이행차수"
          size="small"
          fullWidth
        />
      )
    },
    {
      key: 'irregularityName',
      label: '부점코드',
      type: 'text',
      placeholder: '부점코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부점조회'
      }
    },
    {
      key: 'managementActivity',
      label: '관리활동명',
      type: 'text',
      placeholder: '관리활동명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    }
  ], [filters.ledgerOrder, handleOrganizationSearch]);

  // 🎯 이벤트 핸들러
  const handleFiltersChange = useCallback((values: Partial<FilterValues>) => {
    const newFilters: DeptOpManualsFilters = {
      ledgerOrder: values.ledgerOrder as string || '',
      managementObligation: '',
      irregularityName: values.irregularityName as string || '',
      managementActivityType: 'all',
      managementActivity: values.managementActivity as string || '',
      riskAssessmentLevel: 'all',
      isActive: 'all',
      approvalStatus: 'all',
      implementationManager: ''
    };
    setFilters(newFilters);
  }, []);

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      // 검색 로직 (현재는 필터가 이미 적용됨)
      toast.success('검색이 완료되었습니다.');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: DeptOpManualsFilters = {
      ledgerOrder: '',
      managementObligation: '',
      irregularityName: '',
      managementActivityType: 'all',
      managementActivity: '',
      riskAssessmentLevel: 'all',
      isActive: 'all',
      approvalStatus: 'all',
      implementationManager: ''
    };
    setFilters(clearedFilters);
    toast.info('검색 조건이 초기화되었습니다.');
  }, []);

  const handleRowClick = useCallback((data: DeptOpManual) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      selectedItem: data
    });
  }, []);

  const handleRowDoubleClick = useCallback((data: DeptOpManual) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedItem: data
    });
  }, []);

  const handleSelectionChange = useCallback((selectedRows: DeptOpManual[]) => {
    setSelectedItems(selectedRows);
  }, []);

  const handleCreateItem = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    try {
      // Excel 다운로드 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock
      toast.success('Excel 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Excel download error:', error);
      toast.error('Excel 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedItems.length}개의 관리활동을 삭제하시겠습니까?`)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    try {
      // 삭제 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      setSelectedItems([]);
      toast.success('선택한 관리활동이 삭제되었습니다.');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedItems]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 등록 핸들러
  const handleSave = useCallback(async (formData: any) => {
    setLoadingStates(prev => ({ ...prev, create: true }));

    try {
      // 생성 로직
      console.log('등록 데이터:', formData);
      toast.success('관리활동이 등록되었습니다.');
      handleModalClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('등록 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  }, [handleModalClose]);

  // 수정 핸들러
  const handleUpdate = useCallback(async (id: string, formData: any) => {
    setLoadingStates(prev => ({ ...prev, create: true }));

    try {
      // 수정 로직
      console.log('수정 데이터:', id, formData);
      toast.success('관리활동이 수정되었습니다.');
      handleModalClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('수정 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  }, [handleModalClose]);

  // 📊 통계 카드 정의
  const statsCards = [
    {
      icon: <AnalyticsIcon />,
      title: '전체 관리활동',
      value: statistics.totalActivities,
      color: 'primary' as const
    },
    {
      icon: <AssignmentIcon />,
      title: '활성 관리활동',
      value: statistics.activeActivities,
      color: 'success' as const
    },
    {
      icon: <PendingActionsIcon />,
      title: '승인 대기',
      value: statistics.pendingApprovals,
      color: 'warning' as const
    },
    {
      icon: <SecurityIcon />,
      title: '고위험 관리활동',
      value: statistics.highRiskActivities,
      color: 'error' as const
    }
  ];

  // 🎯 액션 버튼 정의
  const actionButtons: ActionButton[] = [
    {
      key: 'excel',
      type: 'excel',
      onClick: handleExcelDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    },
    {
      key: 'add',
      type: 'add',
      onClick: handleCreateItem,
      disabled: loadingStates.create,
      loading: loadingStates.create
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteSelected,
      disabled: selectedItems.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ];

  // 📊 상태 정보
  const statusInfo: StatusInfo[] = [
    {
      label: '활성',
      value: statistics.activeActivities,
      color: 'success',
      icon: <AssignmentIcon />
    },
    {
      label: '비활성',
      value: statistics.inactiveActivities,
      color: 'default',
      icon: <HighlightOffIcon />
    }
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner centered text="부서장업무메뉴얼을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🎯 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <AssignmentIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>업무메뉴얼관리</h1>
              <p className={styles.pageDescription}>
                부서장업무 관련 관리활동 등록 및 관리
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            {statsCards.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 검색 필터 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />
        </div>

        {/* 📋 액션바 */}
        <BaseActionBar
          totalCount={statistics.totalActivities}
          totalLabel="총 관리활동 수"
          selectedCount={selectedItems.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayData}
          columns={deptOpManualsColumns}
          loading={loading}
          theme="alpine"
          onRowClick={(data) => handleRowClick(data)}
          onRowDoubleClick={(data) => handleRowDoubleClick(data)}
          onSelectionChange={handleSelectionChange}
          height="calc(100vh - 370px)"
          pagination={true}
          pageSize={25}
          rowSelection="multiple"
          checkboxSelection={true}
          headerCheckboxSelection={true}
        />
      </div>

      {/* 🎯 모달 */}
      <React.Suspense fallback={<LoadingSpinner text="모달을 불러오는 중..." />}>
        {modalState.isOpen && (
          <DeptOpManualsFormModal
            open={modalState.isOpen}
            mode={modalState.mode === 'view' ? 'detail' : modalState.mode === 'edit' ? 'detail' : modalState.mode}
            manual={modalState.selectedItem || null}
            onClose={handleModalClose}
            onSave={handleSave}
            onUpdate={handleUpdate}
            loading={loadingStates.create}
          />
        )}
      </React.Suspense>

      {/* 🏢 조직조회 모달 */}
      <OrganizationSearchModal
        open={organizationSearchOpen}
        onClose={handleOrganizationSearchClose}
        onSelect={handleOrganizationSelect}
        title="부점조회"
      />
    </div>
  );
};

export default DeptOpManualsMgmt;
