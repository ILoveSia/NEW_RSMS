// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImplMonitoringStatus.module.scss';

// Types
import type {
  ExecutionFilters,
  ExecutionModalState,
  ExecutionPagination,
  ExecutionStatistics,
  InspectionExecution
} from './types/implMonitoringStatus.types';

// API
import {
  getAllItemsForExecution,
  getItemsByLedgerOrderIdForExecution,
  updateInspectionResult
} from '@/domains/compliance/api/implInspectionPlanApi';
import type { ImplInspectionItemDto } from '@/domains/compliance/types/implInspectionPlan.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper/BaseModalWrapper';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// ImplMonitoringStatus specific components
import { executionColumns } from './components/ImplMonitoringDataGrid/implMonitoringColumns';

// Lazy-loaded components for performance optimization
const ImplMonitoringDetailModal = React.lazy(() =>
  import('./components/ImplMonitoringDetailModal').then(module => ({ default: module.default }))
);

interface ImplMonitoringStatusProps {
  className?: string;
}

/**
 * API 응답 데이터를 화면 표시용 데이터로 변환
 * - impl_inspection_items 기반 데이터를 InspectionExecution 타입으로 변환
 */
const transformApiDataToExecution = (
  items: ImplInspectionItemDto[],
  startIndex: number = 0
): InspectionExecution[] => {
  return items.map((item, index) => ({
    id: item.implInspectionItemId,
    sequenceNumber: startIndex + index + 1,
    inspectionName: item.implInspectionPlan?.implInspectionName || '',
    responsibilityInfo: item.deptManagerManual?.responsibilityInfo || '',
    responsibilityDetailInfo: item.deptManagerManual?.responsibilityDetailInfo || '',
    obligationInfo: item.deptManagerManual?.obligationInfo || '',
    managementActivityName: item.deptManagerManual?.activityName || '',
    activityFrequencyCd: item.deptManagerManual?.execCheckFrequencyCd || '',
    orgCode: item.deptManagerManual?.orgName || item.deptManagerManual?.orgCode || '',
    inspectionMethod: item.deptManagerManual?.execCheckMethod || '',
    inspector: item.inspectorId || '',
    inspectionResult: item.inspectionStatusCd || '01',
    inspectionDetail: item.inspectionResultContent || '',
    inspectionStatus: getInspectionStatus(item.inspectionStatusCd),
    inspectionPeriodId: item.implInspectionPlanId || '',
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || ''
  }));
};

/**
 * 점검상태코드를 InspectionStatus 타입으로 변환
 */
const getInspectionStatus = (statusCd: string): 'NOT_STARTED' | 'FIRST_INSPECTION' | 'SECOND_INSPECTION' | 'COMPLETED' | 'REJECTED' => {
  switch (statusCd) {
    case '01': return 'NOT_STARTED';    // 미점검
    case '02': return 'COMPLETED';      // 적정 (완료)
    case '03': return 'FIRST_INSPECTION'; // 부적정 (점검중)
    default: return 'NOT_STARTED';
  }
};

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

  // 조직조회팝업 상태
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ExecutionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 조직조회 팝업 핸들러
  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  // 조직선택 완료 핸들러
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

  // 조직조회팝업 닫기 핸들러
  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
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

  /**
   * 점검결과 작성 핸들러
   * - 선택된 점검 항목들의 점검결과를 작성
   */
  const handleWriteInspectionResult = useCallback(() => {
    if (selectedExecutions.length === 0) {
      toast.warning('점검결과를 작성할 항목을 선택해주세요.');
      return;
    }

    if (selectedExecutions.length > 1) {
      toast.warning('점검결과 작성은 한 번에 하나씩만 가능합니다.');
      return;
    }

    // 점검결과 작성 모달 열기
    const selectedExecution = selectedExecutions[0];
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedExecution: selectedExecution
    }));
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

  /**
   * 이행점검항목 데이터 로딩 함수
   * - 원장차수ID가 있으면 해당 차수만 조회
   * - 없으면 전체 조회
   * - handleInspectionSave, handleInspectionUpdate, handleSearch 보다 먼저 정의되어야 함
   */
  const fetchExecutionData = useCallback(async (ledgerOrderId?: string) => {
    setLoading(true);
    const loadingToastId = toast.loading('이행점검 데이터를 조회 중입니다...');

    try {
      let items: ImplInspectionItemDto[];

      if (ledgerOrderId) {
        // 원장차수ID가 있으면 해당 차수만 조회
        items = await getItemsByLedgerOrderIdForExecution(ledgerOrderId);
      } else {
        // 전체 조회
        items = await getAllItemsForExecution();
      }

      // API 응답 데이터를 화면용 데이터로 변환
      const transformedData = transformApiDataToExecution(items);

      setExecutions(transformedData);
      setPagination(prev => ({
        ...prev,
        total: transformedData.length,
        totalPages: Math.ceil(transformedData.length / prev.size)
      }));

      toast.update(loadingToastId, 'success', `${transformedData.length}건의 데이터를 조회했습니다.`);
    } catch (error) {
      console.error('이행점검 데이터 조회 실패:', error);
      toast.update(loadingToastId, 'error', '이행점검 데이터 조회에 실패했습니다.');

      // 에러 시 빈 배열로 설정
      setExecutions([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 점검 정보 저장 핸들러
   * - 점검결과상태코드, 점검결과내용 업데이트
   */
  const handleInspectionSave = useCallback(async (data: {
    inspectionStatusCd: string;
    inspectionResultContent: string;
  }) => {
    if (!modalState.selectedExecution) {
      toast.error('선택된 점검 항목이 없습니다.');
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading('점검 정보를 저장 중입니다...');

    try {
      // 점검결과 업데이트 API 호출
      await updateInspectionResult(modalState.selectedExecution.id, {
        inspectionStatusCd: data.inspectionStatusCd,
        inspectionResultContent: data.inspectionResultContent
      });

      toast.update(loadingToastId, 'success', '점검 정보가 저장되었습니다.');
      handleModalClose();

      // 데이터 새로고침
      await fetchExecutionData(filters.ledgerOrderId || undefined);
    } catch (error) {
      toast.update(loadingToastId, 'error', '점검 정보 저장에 실패했습니다.');
      console.error('점검 정보 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [handleModalClose, modalState.selectedExecution, fetchExecutionData, filters.ledgerOrderId]);

  /**
   * 점검 정보 수정 핸들러
   * - 점검결과상태코드, 점검결과내용 업데이트
   */
  const handleInspectionUpdate = useCallback(async (id: string, data: {
    inspectionStatusCd: string;
    inspectionResultContent: string;
  }) => {
    setLoading(true);
    const loadingToastId = toast.loading('점검 정보를 수정 중입니다...');

    try {
      // 점검결과 업데이트 API 호출
      await updateInspectionResult(id, {
        inspectionStatusCd: data.inspectionStatusCd,
        inspectionResultContent: data.inspectionResultContent
      });

      toast.update(loadingToastId, 'success', '점검 정보가 수정되었습니다.');
      handleModalClose();

      // 데이터 새로고침
      await fetchExecutionData(filters.ledgerOrderId || undefined);
    } catch (error) {
      toast.update(loadingToastId, 'error', '점검 정보 수정에 실패했습니다.');
      console.error('점검 정보 수정 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [handleModalClose, fetchExecutionData, filters.ledgerOrderId]);

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    console.log('검색 필터:', filters);

    // 원장차수ID로 필터링된 조회 수행
    await fetchExecutionData(filters.ledgerOrderId || undefined);

    setLoadingStates(prev => ({ ...prev, search: false }));
  }, [filters, fetchExecutionData]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      inspectionPeriodId: '',
      branchCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // 원장차수 변경 핸들러
  const handleLedgerOrderChange = useCallback((value: string | null) => {
    setFilters(prev => ({ ...prev, ledgerOrderId: value || '' }));
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
  ], [filters.ledgerOrderId, handleLedgerOrderChange, handleOrganizationSearch]);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'writeResult',
      type: 'custom',
      label: '점검결과 작성',
      variant: 'contained',
      color: 'primary',
      onClick: handleWriteInspectionResult,
      disabled: selectedExecutions.length === 0,
      confirmationRequired: false
    }
  ], [handleWriteInspectionResult, selectedExecutions.length]);

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

  // 초기 데이터 로딩
  useEffect(() => {
    fetchExecutionData();
  }, [fetchExecutionData]);

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
                  이행점검수행
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
            showClearButton={true}
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
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={false}
          />
        </div>

        {/* 조직조회 팝업 */}
        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          title="부서 조회"
          multiple={false}
        />

        {/* 점검 상세 모달 */}
        <BaseModalWrapper
          isOpen={modalState.detailModal}
          onClose={handleModalClose}
          fallbackComponent={<LoadingSpinner text="이행점검 상세 모달을 불러오는 중..." />}
          ariaLabel="이행점검 상세 모달"
        >
          <ImplMonitoringDetailModal
            open={modalState.detailModal}
            mode="edit"
            execution={modalState.selectedExecution}
            onClose={handleModalClose}
            onSave={handleInspectionSave}
            onUpdate={handleInspectionUpdate}
            loading={loading}
          />
        </BaseModalWrapper>
      </div>
    </React.Profiler>
  );
};

export default ImplMonitoringStatus;
