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
  ActivityExecutionLoadingStates,
  ActivityExecutionModalState,
  ActivityExecutionPagination,
  ActivityExecutionStatistics
} from './types/activityExecution.types';

// API
import { getAllDeptManagerManuals, assignExecutorBatch } from '@/domains/resps/api/deptManagerManualApi';

// Shared Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper/BaseModalWrapper';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';
import { useCommonCode } from '@/shared/hooks';

// ActivityExecution specific components
import { activityExecutionColumns } from './components/ActivityExecutionGrid/activityExecutionColumns';

// Lazy-loaded components for performance optimization
const ActivityExecutionModal = React.lazy(() =>
  import('./components/ActivityExecutionModal/ActivityExecutionModal').then(module => ({ default: module.default }))
);

const ApprovalRequestModal = React.lazy(() =>
  import('./components/ApprovalRequestModal/ApprovalRequestModal').then(module => ({ default: module.default }))
);

const PerformerSelectionModal = React.lazy(() =>
  import('./components/PerformerSelectionModal/PerformerSelectionModal')
);

interface ActivityExecutionProps {
  className?: string;
}

const ActivityExecution: React.FC<ActivityExecutionProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // 공통코드 조회
  const executionStatusCode = useCommonCode('EXEC_STTS_CD');      // 수행상태 (수행여부)
  const executionResultCode = useCommonCode('EXEC_RSLT_CD');      // 수행결과코드
  const checkFrequencyCode = useCommonCode('CHCK_FRQ_CD');        // 점검주기코드

  // State Management
  const [activities, setActivities] = useState<ActivityExecution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedActivities, setSelectedActivities] = useState<ActivityExecution[]>([]);
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState<ActivityExecutionLoadingStates>({
    search: false,
    excel: false,
    modify: false,
    approval: false,
  });

  const [filters, setFilters] = useState<ActivityExecutionFilters>({
    ledgerOrderId: '',
    targetPeriodStart: '',
    targetPeriodEnd: '',
    performanceStatus: '', // 전체/수행완료/미수행
    departmentCode: ''
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

  // 수행자 지정 모달 상태
  const [performerModalOpen, setPerformerModalOpen] = useState<boolean>(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ActivityExecutionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAssignPerformer = useCallback(() => {
    if (selectedActivities.length === 0) {
      toast.warning('수행자를 지정할 관리활동을 선택해주세요.');
      return;
    }

    // 수행자 지정 모달 열기
    setPerformerModalOpen(true);
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

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      executionModal: false,
      approvalModal: false,
      detailModal: false,
      selectedActivity: null
    }));
  }, []);

  const handlePerformerModalClose = useCallback(() => {
    setPerformerModalOpen(false);
  }, []);

  /**
   * 수행자 지정 핸들러
   * - 선택된 활동들에 수행자(executor_id)를 일괄 지정
   * - assignExecutorBatch API 호출
   */
  const handlePerformerAssign = useCallback(async (
    activities: ActivityExecution[],
    performer: any,
    _formData: any
  ) => {
    try {
      // 메뉴얼 코드 목록 추출 (id가 manualCd)
      const manualCds = activities.map(a => a.id);

      // API 호출 - 수행자 일괄 지정
      await assignExecutorBatch({
        manualCds,
        executorId: performer.id  // Performer.id = empNo
      });

      // 로컬 상태 업데이트 - 선택된 모든 항목에 수행자 지정
      const activityIds = activities.map(a => a.id);
      setActivities(prev => prev.map(item =>
        activityIds.includes(item.id)
          ? {
              ...item,
              executorId: performer.id,
              executorName: performer.name,
              updatedAt: new Date().toISOString()
            }
          : item
      ));

      toast.success(`${activities.length}건의 항목에 ${performer.name} 수행자가 지정되었습니다.`);
      setSelectedActivities([]);  // 선택 초기화
      handlePerformerModalClose();
    } catch (error) {
      console.error('Performer assignment error:', error);
      toast.error('수행자 지정 중 오류가 발생했습니다.');
    }
  }, [handlePerformerModalClose]);

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

  /**
   * 관리활동 수행 데이터 조회
   * @description dept_manager_manuals 테이블에서 실제 데이터 조회
   */
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      // dept_manager_manuals 테이블에서 전체 데이터 조회
      const data = await getAllDeptManagerManuals();

      console.log(`✅ [ActivityExecution] 관리활동 ${data.length}건 조회 완료`);

      // Backend DTO → Frontend 타입 변환
      const converted: ActivityExecution[] = data.map((dto, index) => ({
        id: dto.manualCd,
        seq: index + 1,

        // dept_manager_manuals 테이블 필드
        manualCd: dto.manualCd,
        ledgerOrderId: dto.ledgerOrderId || '',
        obligationCd: dto.obligationCd || '',
        orgCode: dto.orgCode || '',
        orgName: dto.orgName || '',
        respItem: dto.respItem || '',
        activityName: dto.activityName || '',
        execCheckMethod: dto.execCheckMethod || '',
        execCheckDetail: dto.execCheckDetail || '',
        execCheckFrequencyCd: dto.execCheckFrequencyCd || '',

        // 수행 정보
        executorId: dto.executorId || '',
        executorName: dto.executorName || '',  // employees 테이블 조인 결과
        executionDate: dto.executionDate || '',
        executionStatus: dto.executionStatus || '',
        executionResultCd: dto.executionResultCd || '',
        executionResultContent: dto.executionResultContent || '',

        // 메타데이터
        isActive: dto.isActive === 'Y',
        createdAt: dto.createdAt || '',
        createdBy: dto.createdBy || '',
        updatedAt: dto.updatedAt || '',
        updatedBy: dto.updatedBy || ''
      }));

      setActivities(converted);
      setPagination(prev => ({
        ...prev,
        total: converted.length,
        totalPages: Math.ceil(converted.length / prev.size)
      }));
    } catch (error) {
      console.error('❌ [ActivityExecution] 데이터 조회 실패:', error);
      toast.error('관리활동 수행 정보 조회에 실패했습니다.');
      setActivities([]);
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, []);

  const handleSearch = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      targetPeriodStart: '',
      targetPeriodEnd: '',
      performanceStatus: '',
      departmentCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    console.log('🔄 [ActivityExecution] 검색 조건 초기화');
  }, []);

  // 조직검색 핸들러
  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  const handleOrganizationSelect = useCallback((selected: Organization | Organization[]) => {
    const organization = Array.isArray(selected) ? selected[0] : selected;
    setFilters(prev => ({
      ...prev,
      departmentCode: organization.orgCode || ''
    }));
    setOrganizationSearchOpen(false);
    console.log(`✅ [ActivityExecution] 부서 선택: ${organization.orgCode}`);
  }, []);

  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((activity: ActivityExecution) => {
    console.log('✅ [ActivityExecution] 행 클릭 - 상세조회 모달 열기:', activity.id);
    handleActivityDetail(activity);
  }, [handleActivityDetail]);

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
    // executionStatus가 있으면 수행완료로 간주 (실제 공통코드 값에 따라 조정 필요)
    const completed = activities.filter(a => a.executionStatus && a.executionStatus !== '').length;
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
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId || undefined}
          onChange={(value) => setFilters(prev => ({ ...prev, ledgerOrderId: value || '' }))}
          label="책무이행차수"
          size="small"
          fullWidth
        />
      )
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
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'departmentCode',
      type: 'text',
      label: '부서코드',
      placeholder: '부서코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부서조회'
      }
    }
  ], [filters.ledgerOrderId, handleOrganizationSearch]);

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
      key: 'assign',
      label: '수행자지정',
      variant: 'contained',
      color: 'primary',
      startIcon: 'PersonAdd',
      disabled: selectedActivities.length === 0,
      onClick: handleAssignPerformer
    }
  ], [handleExcelDownload, handleAssignPerformer, selectedActivities.length, loadingStates]);

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

  // 🚀 초기 데이터 로드 (실제 API 호출)
  React.useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
            columns={activityExecutionColumns(executionStatusCode, executionResultCode)}
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
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={false}
          />
        </div>

        {/* 관리활동 수행 등록/수정 모달 */}
        <BaseModalWrapper
          isOpen={modalState.executionModal || modalState.detailModal}
          onClose={handleModalClose}
          fallbackComponent={<LoadingSpinner text="관리활동 수행 모달을 불러오는 중..." />}
          ariaLabel="관리활동 수행 모달"
        >
          <ActivityExecutionModal
            open={modalState.executionModal || modalState.detailModal}
            mode={modalState.executionModal ? 'edit' : 'detail'}
            activity={modalState.selectedActivity}
            onClose={handleModalClose}
            onSave={handleActivitySave}
            onUpdate={handleActivityUpdate}
            loading={loading}
            checkFrequencyCode={checkFrequencyCode}
          />
        </BaseModalWrapper>

        {/* 승인 요청 모달 */}
        {/*
        <React.Suspense fallback={<LoadingSpinner />}>
          <ApprovalRequestModal
            open={modalState.approvalModal}
            selectedActivities={selectedActivities}
            onClose={handleModalClose}
            loading={loadingStates.approval}
          />
        </React.Suspense> */}


        {/* 조직검색 모달 */}
        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          title="부서조회"
        />

        {/* 수행자 지정 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <PerformerSelectionModal
            open={performerModalOpen}
            activity={modalState.selectedActivity}
            activities={selectedActivities}
            onClose={handlePerformerModalClose}
            onSelect={handlePerformerAssign}
            loading={false}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ActivityExecution;
