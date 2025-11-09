/**
 * 이행점검개선 페이지
 * ImplMonitoringStatus와 동일한 UI, 부적정 상태만 필터링
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImplMonitoringImprovement.module.scss';

// Types (ImplMonitoringStatus와 동일)
import type {
  ExecutionFilters,
  ExecutionModalState,
  ExecutionPagination,
  ExecutionStatistics,
  InspectionExecution
} from '../ImplMonitoringStatus/types/implMonitoringStatus.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// ImplMonitoringStatus 컬럼 재사용
import { executionColumns } from '../ImplMonitoringStatus/components/ImplMonitoringDataGrid/implMonitoringColumns';

// Lazy-loaded components
const ImprovementDetailModal = React.lazy(() =>
  import('./components/ImprovementDetailModal').then(module => ({ default: module.default }))
);

interface ImplMonitoringImprovementProps {
  className?: string;
}

const ImplMonitoringImprovement: React.FC<ImplMonitoringImprovementProps> = ({ className }) => {
  const { t } = useTranslation('compliance');

  // State Management
  const [executions, setExecutions] = useState<InspectionExecution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedExecutions, setSelectedExecutions] = useState<InspectionExecution[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    detail: false,
    complete: false,
  });

  const [filters, setFilters] = useState<ExecutionFilters>({
    ledgerOrderId: '',
    inspectionPeriodId: '',
    branchCode: ''
  });

  const [pagination, setPagination] = useState<ExecutionPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ExecutionModalState>({
    detailModal: false,
    selectedExecution: null
  });

  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ExecutionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  const handleOrganizationSelect = useCallback((selected: Organization | Organization[]) => {
    const selectedOrg = Array.isArray(selected) ? selected[0] : selected;
    if (selectedOrg) {
      setFilters(prev => ({
        ...prev,
        branchCode: selectedOrg.orgCode
      }));
      setOrganizationSearchOpen(false);
      toast.success(`${selectedOrg.orgName}(${selectedOrg.orgCode})이 선택되었습니다.`);
    }
  }, []);

  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
  }, []);

  const handleWriteImprovementPlan = useCallback(() => {
    if (selectedExecutions.length === 0) {
      toast.warning('개선계획을 작성할 항목을 선택해주세요.');
      return;
    }

    if (selectedExecutions.length > 1) {
      toast.warning('개선계획 작성은 한 번에 하나씩만 가능합니다.');
      return;
    }

    const selectedExecution = selectedExecutions[0];
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedExecution: selectedExecution
    }));
  }, [selectedExecutions]);

  const handleCompleteImprovement = useCallback(async () => {
    if (selectedExecutions.length === 0) {
      toast.warning('개선완료 처리할 항목을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택된 ${selectedExecutions.length}개의 개선을 완료 처리하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, complete: true }));
    const loadingToastId = toast.loading(`${selectedExecutions.length}개 개선을 완료 처리 중입니다...`);

    try {
      // TODO: 실제 개선완료 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));

      setExecutions(prev =>
        prev.map(exec =>
          selectedExecutions.some(selected => selected.id === exec.id)
            ? { ...exec, inspectionStatus: 'COMPLETED' }
            : exec
        )
      );
      setSelectedExecutions([]);

      toast.update(loadingToastId, 'success', `${selectedExecutions.length}개 개선이 완료되었습니다.`);
    } catch (error) {
      toast.update(loadingToastId, 'error', '개선완료 처리에 실패했습니다.');
      console.error('개선완료 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, complete: false }));
    }
  }, [selectedExecutions]);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));
    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
    } catch (error) {
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      detailModal: false,
      selectedExecution: null
    }));
  }, []);

  const handleExecutionDetail = useCallback((execution: InspectionExecution) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedExecution: execution
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    const loadingToastId = toast.loading('부적정 항목을 검색 중입니다...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('검색 필터:', filters);
      toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
    } catch (error) {
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      inspectionPeriodId: '',
      branchCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  const handleLedgerOrderChange = useCallback((value: string | null) => {
    setFilters(prev => ({ ...prev, ledgerOrderId: value || '' }));
  }, []);

  const handleRowClick = useCallback((execution: InspectionExecution) => {
    console.log('행 클릭:', execution);
  }, []);

  const handleRowDoubleClick = useCallback((execution: InspectionExecution) => {
    handleExecutionDetail(execution);
  }, [handleExecutionDetail]);

  const handleSelectionChange = useCallback((selected: InspectionExecution[]) => {
    setSelectedExecutions(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values
  const statistics = useMemo<ExecutionStatistics>(() => {
    const total = pagination.total;
    const inProgress = executions.filter(e => e.inspectionStatus === 'FIRST_INSPECTION' || e.inspectionStatus === 'SECOND_INSPECTION').length;
    const completed = executions.filter(e => e.inspectionStatus === 'COMPLETED').length;
    const notStarted = executions.filter(e => e.inspectionStatus === 'NOT_STARTED').length;
    const rejected = executions.filter(e => e.inspectionStatus === 'REJECTED').length;
    const systemUptime = 99.2;

    return {
      total,
      inProgress,
      completed,
      notStarted,
      rejected,
      systemUptime
    };
  }, [pagination.total, executions]);

  // 부적정 항목만 필터링
  const displayExecutions = useMemo(() => {
    return executions.filter(e => e.inspectionResult === '부적정' || e.inspectionResult === 'FAIL');
  }, [executions]);

  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId || undefined}
          onChange={handleLedgerOrderChange}
          label="책무이행차수"
          placeholder="전체"
        />
      )
    },
    {
      key: 'inspectionPeriodId',
      type: 'text',
      label: '점검명',
      placeholder: '점검명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchCode',
      type: 'text',
      label: '부점코드',
      placeholder: '부점코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부점조회'
      }
    }
  ], [filters.ledgerOrderId, handleLedgerOrderChange, handleOrganizationSearch]);

  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'writePlan',
      type: 'custom',
      label: '개선계획 작성',
      variant: 'contained',
      color: 'primary',
      onClick: handleWriteImprovementPlan,
      disabled: selectedExecutions.length === 0,
      confirmationRequired: false
    },
    {
      key: 'complete',
      type: 'custom',
      label: '개선완료',
      variant: 'contained',
      color: 'success',
      onClick: handleCompleteImprovement,
      disabled: selectedExecutions.length === 0 || loadingStates.complete,
      loading: loadingStates.complete,
      confirmationRequired: true
    }
  ], [handleWriteImprovementPlan, handleCompleteImprovement, selectedExecutions.length, loadingStates]);

  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '개선진행중',
      value: statistics.inProgress,
      color: 'warning',
      icon: <TrendingUpIcon />
    },
    {
      label: '개선완료',
      value: statistics.completed,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '미착수',
      value: statistics.notStarted,
      color: 'default',
      icon: <AnalyticsIcon />
    }
  ], [statistics]);

  const onRenderProfiler = useCallback((
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ImplMonitoringImprovement Performance Profiler`);
      console.log(`📊 Phase: ${phase}`);
      console.log(`⏱️ Actual Duration: ${actualDuration.toFixed(2)}ms`);
      console.log(`📏 Base Duration: ${baseDuration.toFixed(2)}ms`);
      console.log(`🚀 Start Time: ${startTime.toFixed(2)}ms`);
      console.log(`✅ Commit Time: ${commitTime.toFixed(2)}ms`);

      if (actualDuration > 16) {
        console.warn(`⚠️ 성능 주의: 렌더링 시간이 16ms를 초과했습니다 (${actualDuration.toFixed(2)}ms)`);
      }
      console.groupEnd();
    }
  }, []);

  // Mock data - 부적정 항목만
  React.useEffect(() => {
    const mockExecutions: InspectionExecution[] = [
      {
        id: '2',
        sequenceNumber: 2,
        inspectionName: '2025년 1분기 정기점검',
        obligationInfo: '정보보호 관리 의무',
        managementActivityName: '개인정보 보호 점검',
        activityFrequencyCd: '월별',
        orgCode: '준법지원부',
        inspectionMethod: '시스템 점검',
        inspector: '김철수',
        inspectionResult: '부적정',
        inspectionDetail: '일부 항목 보완 필요',
        inspectionStatus: 'FIRST_INSPECTION',
        inspectionPeriodId: '2026_FIRST_HALF',
        createdAt: '2024-09-21T10:00:00Z',
        updatedAt: '2024-09-21T10:00:00Z'
      }
    ];

    setExecutions(mockExecutions);
    setPagination(prev => ({
      ...prev,
      total: mockExecutions.length,
      totalPages: Math.ceil(mockExecutions.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="ImplMonitoringImprovement" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  이행점검개선
                </h1>
                <p className={styles.pageDescription}>
                  부적정 판정 항목의 개선계획 및 이행을 관리합니다
                </p>
              </div>
            </div>

            <div className={styles.headerStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUpIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.total}</div>
                  <div className={styles.statLabel}>총 개선대상</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <SecurityIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.inProgress}
                  </div>
                  <div className={styles.statLabel}>진행중</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.completed}</div>
                  <div className={styles.statLabel}>완료</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.notStarted}</div>
                  <div className={styles.statLabel}>미착수</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={styles.content}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ExecutionFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          <BaseActionBar
            totalCount={displayExecutions.length}
            totalLabel="총 개선대상"
            selectedCount={selectedExecutions.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          <BaseDataGrid
            data={displayExecutions}
            columns={executionColumns.map(col => {
              if (col.field === 'managementActivityName') {
                return {
                  ...col,
                  cellRendererParams: {
                    onCellClicked: handleExecutionDetail
                  }
                };
              }
              return col;
            })}
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

        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          title="부점 조회"
          multiple={false}
        />

        <React.Suspense fallback={<LoadingSpinner />}>
          <ImprovementDetailModal
            open={modalState.detailModal}
            execution={modalState.selectedExecution}
            onClose={handleModalClose}
            loading={loading}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ImplMonitoringImprovement;
