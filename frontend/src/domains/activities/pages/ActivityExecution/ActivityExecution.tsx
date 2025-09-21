// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ActivityExecution.module.scss';

// Types
import type {
  ActivityExecution,
  ActivityExecutionFilters,
  ActivityExecutionFormData,
  ActivityExecutionModalState,
  ActivityExecutionPagination,
  ActivityExecutionLoadingStates,
  ActivityExecutionStatistics
} from './types/activityExecution.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// ActivityExecution specific components
import { activityExecutionColumns } from './components/ActivityExecutionGrid/activityExecutionColumns';

// Lazy-loaded components for performance optimization
const ActivityExecutionModal = React.lazy(() =>
  import('./components/ActivityExecutionModal/ActivityExecutionModal').then(module => ({ default: module.default }))
);

const ApprovalRequestModal = React.lazy(() =>
  import('./components/ApprovalRequestModal/ApprovalRequestModal').then(module => ({ default: module.default }))
);

interface ActivityExecutionProps {
  className?: string;
}

const ActivityExecution: React.FC<ActivityExecutionProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [activities, setActivities] = useState<ActivityExecution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedActivities, setSelectedActivities] = useState<ActivityExecution[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState<ActivityExecutionLoadingStates>({
    search: false,
    excel: false,
    modify: false,
    approval: false,
  });

  const [filters, setFilters] = useState<ActivityExecutionFilters>({
    targetPeriodStart: '2025-01-01',
    targetPeriodEnd: '2025-08-31',
    performanceStatus: '', // 전체/수행완료/미수행
    departmentCode: '',
    searchKeyword: ''
  });

  const [pagination, setPagination] = useState<ActivityExecutionPagination>({
    page: 1,
    size: 25,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ActivityExecutionModalState>({
    executionModal: false,
    approvalModal: false,
    detailModal: false,
    selectedActivity: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ActivityExecutionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleModifyRequest = useCallback(() => {
    if (selectedActivities.length !== 1) {
      toast.warning('수정할 관리활동을 하나만 선택해주세요.');
      return;
    }

    setModalState(prev => ({
      ...prev,
      executionModal: true,
      selectedActivity: selectedActivities[0]
    }));
    toast.info('관리활동 수행 내용을 수정해주세요.', { autoClose: 2000 });
  }, [selectedActivities]);

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

  const handleApprovalRequest = useCallback(() => {
    if (selectedActivities.length === 0) {
      toast.warning('승인 요청할 관리활동을 선택해주세요.');
      return;
    }

    setModalState(prev => ({
      ...prev,
      approvalModal: true
    }));
    toast.info(`${selectedActivities.length}개 관리활동의 승인을 요청합니다.`, { autoClose: 2000 });
  }, [selectedActivities]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      executionModal: false,
      approvalModal: false,
      detailModal: false,
      selectedActivity: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleActivitySave = useCallback(async (formData: ActivityExecutionFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 관리활동 수행 등록

      console.log('관리활동 수행 등록:', formData);

      handleModalClose();
      toast.success('관리활동 수행이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('관리활동 수행 등록 실패:', error);
      toast.error('관리활동 수행 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleActivityUpdate = useCallback(async (id: string, formData: ActivityExecutionFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 관리활동 수행 수정

      // 임시로 기존 활동 업데이트
      setActivities(prev =>
        prev.map(activity =>
          activity.id === id
            ? {
                ...activity,
                status: 'completed' as const,
                updatedAt: new Date().toISOString()
              }
            : activity
        )
      );

      handleModalClose();
      toast.success('관리활동 수행이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('관리활동 수행 수정 실패:', error);
      toast.error('관리활동 수행 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleActivityDetail = useCallback((activity: ActivityExecution) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedActivity: activity
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('관리활동 수행 정보를 검색 중입니다...');

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
      targetPeriodStart: '2025-01-01',
      targetPeriodEnd: '2025-08-31',
      performanceStatus: '',
      departmentCode: '',
      searchKeyword: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((activity: ActivityExecution) => {
    console.log('행 클릭:', activity);
  }, []);

  const handleRowDoubleClick = useCallback((activity: ActivityExecution) => {
    handleActivityDetail(activity);
  }, [handleActivityDetail]);

  const handleSelectionChange = useCallback((selected: ActivityExecution[]) => {
    setSelectedActivities(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<ActivityExecutionStatistics>(() => {
    const total = pagination.total;
    const completed = activities.filter(a => a.isPerformed).length;
    const pending = total - completed;
    const systemUptime = 99.8; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      completed,
      pending,
      systemUptime
    };
  }, [pagination.total, activities]);

  // Filtered activities for display (성능 최적화)
  const displayActivities = useMemo(() => {
    return activities; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [activities]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'targetPeriod',
      type: 'dateRange',
      label: '관리활동 대상기간',
      startKey: 'targetPeriodStart',
      endKey: 'targetPeriodEnd',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'performanceStatus',
      type: 'select',
      label: '관리활동 수행여부',
      options: [
        { value: '', label: '전체' },
        { value: 'completed', label: '수행완료' },
        { value: 'pending', label: '미수행' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'departmentCode',
      type: 'text',
      label: '부서코드',
      placeholder: '0000',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'searchKeyword',
      type: 'text',
      label: '검색어',
      placeholder: '관리활동명, 수행자명 등',
      gridSize: { xs: 12, sm: 6, md: 4 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      type: 'excel',
      onClick: handleExcelDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    },
    {
      key: 'modify',
      type: 'edit',
      label: '수정요청',
      onClick: handleModifyRequest,
      disabled: selectedActivities.length !== 1 || loadingStates.modify,
      loading: loadingStates.modify,
      confirmationRequired: false
    },
    {
      key: 'approval',
      type: 'custom',
      label: '승인요청',
      onClick: handleApprovalRequest,
      disabled: selectedActivities.length === 0 || loadingStates.approval,
      loading: loadingStates.approval,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleModifyRequest, handleApprovalRequest, selectedActivities.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '수행완료',
      value: statistics.completed,
      color: 'success',
      icon: <PlayArrowIcon />
    },
    {
      label: '미수행',
      value: statistics.pending,
      color: 'warning',
      icon: <PlayArrowIcon />
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
      console.group(`🔍 ActivityExecution Performance Profiler`);
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
    const mockActivities: ActivityExecution[] = [
      {
        id: '1',
        sequence: 1,
        activityName: '영업 실적',
        activityDetail: '상세내용',
        cycle: '분기',
        isInternalActivity: true,
        regulation: '교육수행팀장',
        responsibilityArea: '교육수행팀장',
        performer: '0000000',
        isPerformed: true,
        performanceResult: '적정',
        cssConst: 'Y',
        gnrzOblgDvcd: '02',
        executionDate: '2024-01-15',
        status: 'completed',
        createdAt: '2024-01-15',
        updatedAt: '2024-03-20',
        isActive: true
      }
    ];

    setActivities(mockActivities);
    setPagination(prev => ({
      ...prev,
      total: mockActivities.length,
      totalPages: Math.ceil(mockActivities.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="ActivityExecution" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('activity.execution.title', '관리활동 수행')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('activity.execution.description', '관리활동의 실제 수행 과정을 관리하고 수행 결과를 등록합니다')}
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
                  <div className={styles.statLabel}>총 관리활동</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <PlayArrowIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.completed}
                  </div>
                  <div className={styles.statLabel}>수행완료</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.systemUptime}%</div>
                  <div className={styles.statLabel}>시스템 가동률</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ActivityExecutionFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 관리활동 수"
            selectedCount={selectedActivities.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayActivities}
            columns={activityExecutionColumns}
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

        {/* 관리활동 수행 등록/수정 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ActivityExecutionModal
            open={modalState.executionModal || modalState.detailModal}
            mode={modalState.executionModal ? 'edit' : 'detail'}
            activity={modalState.selectedActivity}
            onClose={handleModalClose}
            onSave={handleActivitySave}
            onUpdate={handleActivityUpdate}
            loading={loading}
          />
        </React.Suspense>

        {/* 승인 요청 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ApprovalRequestModal
            open={modalState.approvalModal}
            selectedActivities={selectedActivities}
            onClose={handleModalClose}
            loading={loadingStates.approval}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ActivityExecution;