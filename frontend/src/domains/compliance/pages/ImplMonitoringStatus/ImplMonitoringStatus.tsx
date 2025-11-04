// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImplMonitoringStatus.module.scss';

// Types
import type {
  InspectionExecution,
  ExecutionFilters,
  ExecutionModalState,
  ExecutionPagination,
  PerformanceTargetFilter,
  PerformanceTargetOption,
  InspectionPeriod,
  ExecutionStatistics
} from './types/implMonitoringStatus.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { BranchLookupModal } from '@/shared/components/organisms/BranchLookupModal';
import type { Branch } from '@/shared/components/organisms/BranchLookupModal/types/branchLookup.types';

// ImplMonitoringStatus specific components
import { executionColumns } from './components/ImplMonitoringDataGrid/implMonitoringColumns';

// Lazy-loaded components for performance optimization
const ImplMonitoringDetailModal = React.lazy(() =>
  import('./components/ImplMonitoringDetailModal').then(module => ({ default: module.default }))
);

interface ImplMonitoringStatusProps {
  className?: string;
}

const ImplMonitoringStatus: React.FC<ImplMonitoringStatusProps> = ({ className }) => {
  const { t } = useTranslation('compliance');

  // State Management
  const [executions, setExecutions] = useState<InspectionExecution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedExecutions, setSelectedExecutions] = useState<InspectionExecution[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    detail: false,
    reject: false,
    complete: false,
  });

  const [filters, setFilters] = useState<ExecutionFilters>({
    inspectionPeriodId: '2026_FIRST_HALF',
    performanceTarget: 'ALL',
    branchCode: '0000'
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

  // 부점조회 팝업 상태
  const [branchLookupOpen, setBranchLookupOpen] = useState<boolean>(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ExecutionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleBranchSelect = useCallback((selected: Branch | Branch[]) => {
    const selectedBranch = Array.isArray(selected) ? selected[0] : selected;
    if (selectedBranch) {
      setFilters(prev => ({
        ...prev,
        branchCode: selectedBranch.branchCode
      }));
      setBranchLookupOpen(false);
      toast.success(`${selectedBranch.branchName}(${selectedBranch.branchCode})이 선택되었습니다.`);
    }
  }, []);

  const handleResultDetail = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, detail: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('점검 결과 상세를 조회 중입니다...');

    try {
      // TODO: 실제 상세 조회 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '점검 결과 상세 조회가 완료되었습니다.');
      console.log('점검 결과 상세 조회 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '점검 결과 상세 조회에 실패했습니다.');
      console.error('점검 결과 상세 조회 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, detail: false }));
    }
  }, []);

  const handleRejectFilter = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, reject: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('미결재 항목을 조회 중입니다...');

    try {
      // TODO: 실제 미결재 필터링 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      // 미결재 상태 필터 적용
      setFilters(prev => ({ ...prev, performanceTarget: 'IN_PROGRESS' }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '미결재 항목 조회가 완료되었습니다.');
      console.log('미결재 필터 적용 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '미결재 항목 조회에 실패했습니다.');
      console.error('미결재 필터 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, reject: false }));
    }
  }, []);

  const handleCompleteExecution = useCallback(async () => {
    if (selectedExecutions.length === 0) {
      toast.warning('승인요청할 항목을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedExecutions.length}개의 점검을 승인요청 처리하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, complete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedExecutions.length}개 점검을 승인요청 처리 중입니다...`);

    try {
      // TODO: 실제 승인요청 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 상태 업데이트 (승인요청 상태로 변경)
      setExecutions(prev =>
        prev.map(exec =>
          selectedExecutions.some(selected => selected.id === exec.id)
            ? { ...exec, inspectionStatus: 'COMPLETED' }
            : exec
        )
      );
      setSelectedExecutions([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedExecutions.length}개 점검이 승인요청되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '점검 승인요청 처리에 실패했습니다.');
      console.error('점검 승인요청 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, complete: false }));
    }
  }, [selectedExecutions]);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
      console.log('엑셀 다운로드 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
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

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('점검 대상을 검색 중입니다...');

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      console.log('검색 필터:', filters);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      inspectionPeriodId: '2026_FIRST_HALF',
      performanceTarget: 'ALL',
      branchCode: '0000'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
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

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<ExecutionStatistics>(() => {
    const total = pagination.total;
    const inProgress = executions.filter(e => e.inspectionStatus === 'FIRST_INSPECTION' || e.inspectionStatus === 'SECOND_INSPECTION').length;
    const completed = executions.filter(e => e.inspectionStatus === 'COMPLETED').length;
    const notStarted = executions.filter(e => e.inspectionStatus === 'NOT_STARTED').length;
    const rejected = executions.filter(e => e.inspectionStatus === 'REJECTED').length;
    const systemUptime = 99.2; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      inProgress,
      completed,
      notStarted,
      rejected,
      systemUptime
    };
  }, [pagination.total, executions]);

  // Filtered executions for display (성능 최적화)
  const displayExecutions = useMemo(() => {
    return executions; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [executions]);

  // 점검 기간 옵션 (실제로는 API에서 가져와야 함)
  const inspectionPeriodOptions = useMemo<{ value: string; label: string }[]>(() => [
    { value: '2026_FIRST_HALF', label: '2026년1차년 이행점검 | 2026.07.31~2026.08.31' },
    { value: '2025_SECOND_HALF', label: '2025년2차년 이행점검 | 2025.12.01~2025.12.31' },
    { value: '2025_FIRST_HALF', label: '2025년1차년 이행점검 | 2025.07.01~2025.07.31' }
  ], []);

  // 이행점검 수행대상 옵션
  const performanceTargetOptions = useMemo<PerformanceTargetOption[]>(() => [
    { value: 'ALL', label: '전체' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'NOT_STARTED', label: '미수행' }
  ], []);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'inspectionPeriodId',
      type: 'select',
      label: '점검명',
      options: inspectionPeriodOptions,
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'performanceTarget',
      type: 'select',
      label: '이행점검 수행대상',
      options: performanceTargetOptions.map(option => ({ value: option.value, label: option.label })),
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchCode',
      type: 'text',
      label: '부점코드',
      placeholder: '부점코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: () => setBranchLookupOpen(true),
        tooltip: '부점 검색'
      }
    }
  ], [inspectionPeriodOptions, performanceTargetOptions]);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'complete',
      type: 'custom',
      label: '승인요청',
      variant: 'contained',
      color: 'success',
      onClick: handleCompleteExecution,
      disabled: selectedExecutions.length === 0 || loadingStates.complete,
      loading: loadingStates.complete,
      confirmationRequired: true
    }
  ], [handleCompleteExecution, selectedExecutions.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '진행중',
      value: statistics.inProgress,
      color: 'warning',
      icon: <TrendingUpIcon />
    },
    {
      label: '완료',
      value: statistics.completed,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '미수행',
      value: statistics.notStarted,
      color: 'default',
      icon: <AnalyticsIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ImplMonitoringStatus Performance Profiler`);
      console.log(`📊 Phase: ${phase}`);
      console.log(`⏱️ Actual Duration: ${actualDuration.toFixed(2)}ms`);
      console.log(`📏 Base Duration: ${baseDuration.toFixed(2)}ms`);
      console.log(`🚀 Start Time: ${startTime.toFixed(2)}ms`);
      console.log(`✅ Commit Time: ${commitTime.toFixed(2)}ms`);

      if (actualDuration > 16) { // 60fps 기준 16ms 초과 시 경고
        console.warn(`⚠️ 성능 주의: 렌더링 시간이 16ms를 초과했습니다 (${actualDuration.toFixed(2)}ms)`);
      }
      console.groupEnd();
    }
  }, []);

  // Web Performance API를 활용한 페이지 로드 성능 측정
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const measurePageLoad = () => {
        if (performance.getEntriesByType) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            console.group(`📊 Page Load Performance`);
            console.log(`🌐 DNS 조회: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
            console.log(`🔗 연결 시간: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
            console.log(`📥 응답 시간: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
            console.log(`🎨 DOM 로딩: ${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`);
            console.log(`🏁 전체 로딩: ${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`);
            console.groupEnd();
          }
        }
      };

      // 페이지 로드 완료 후 측정
      if (document.readyState === 'complete') {
        measurePageLoad();
      } else {
        window.addEventListener('load', measurePageLoad);
        return () => window.removeEventListener('load', measurePageLoad);
      }
    }
  }, []);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockExecutions: InspectionExecution[] = [
      {
        id: '1',
        sequenceNumber: 1,
        managementActivityName: '역량 산업',
        managementActivitySession: '2025년 1회차',
        managementActivityDetail: '상세현황다.',
        internalExternal: '외부',
        classification: '교육수행내과',
        internalExternalLimitInfo: '',
        performer: '0000000-관최자',
        performanceTarget: '앞균',
        performanceResult: '작성',
        inspector: '미신혁',
        inspectionTarget: '점검자',
        firstInspectionResult: '미김감',
        secondInspectionResult: '',
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
    <React.Profiler id="ImplMonitoringStatus" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  점검수행 및 결재
                </h1>
                <p className={styles.pageDescription}>
                  이행점검의 점검수행 및 결재 프로세스를 관리합니다
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
                  <div className={styles.statLabel}>총 점검대상</div>
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
                  <div className={styles.statLabel}>미수행</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 메인 컨텐츠 영역 */}
        <div className={styles.content}>
          {/* 🔍 공통 검색 필터 */}
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ExecutionFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={false}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 점검대상"
            selectedCount={selectedExecutions.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayExecutions}
            columns={executionColumns}
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

        {/* 부점조회 팝업 */}
        <BranchLookupModal
          open={branchLookupOpen}
          onClose={() => setBranchLookupOpen(false)}
          onSelect={handleBranchSelect}
          title="부점 조회 팝업"
          multiple={false}
          initialFilters={{ branchCode: filters.branchCode }}
        />

        {/* 점검 상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ImplMonitoringDetailModal
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

export default ImplMonitoringStatus;