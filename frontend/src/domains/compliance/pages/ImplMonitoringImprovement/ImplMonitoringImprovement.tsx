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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImplMonitoringImprovement.module.scss';

// Types (ImplMonitoringStatus와 동일)
import type {
  ExecutionFilters,
  ExecutionModalState,
  ExecutionPagination,
  ExecutionStatistics
} from '../ImplMonitoringStatus/types/implMonitoringStatus.types';

// API
import {
  getAllItemsForImprovement,
  getItemsByLedgerOrderIdForImprovement
} from '@/domains/compliance/api/implInspectionPlanApi';
import type { ImplInspectionItemDto } from '@/domains/compliance/types/implInspectionPlan.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// 개선이행 전용 컬럼 (dept_manager_manuals + impl_inspection_items 결합)
import { improvementColumns, type ImprovementData } from './components/ImprovementDataGrid/improvementColumns';

/**
 * API 응답 데이터를 화면 표시용 데이터로 변환
 * - impl_inspection_items 기반 데이터를 ImprovementData 타입으로 변환
 * - 부적정(03) 항목만 조회되므로 개선이행 관련 필드 포함
 */
const transformApiDataToImprovement = (
  items: ImplInspectionItemDto[],
  startIndex: number = 0
): ImprovementData[] => {
  return items.map((item, index) => ({
    id: item.implInspectionItemId,
    // dept_manager_manuals 테이블 컬럼
    sequenceNumber: startIndex + index + 1,
    inspectionName: item.implInspectionPlan?.implInspectionName || '',
    responsibilityInfo: item.deptManagerManual?.responsibilityInfo || '',
    responsibilityDetailInfo: item.deptManagerManual?.responsibilityDetailInfo || '',
    obligationInfo: item.deptManagerManual?.obligationInfo || '',
    managementActivityName: item.deptManagerManual?.activityName || '',
    orgCode: item.deptManagerManual?.orgName || item.deptManagerManual?.orgCode || '',
    // impl_inspection_items 테이블 컬럼
    inspector: item.inspectorName || item.inspectorId || '',
    inspectionResult: item.inspectionStatusCd || '',
    improvementManager: item.improvementManagerName || item.improvementManagerId || '',
    improvementStatus: item.improvementStatusCd || '01',
    improvementPlanDate: item.improvementPlanDate || null,
    improvementApprovedDate: item.improvementPlanApprovedDate || null,
    improvementCompletedDate: item.improvementCompletedDate || null,
    finalInspectionResult: item.finalInspectionResultCd || '',
    finalInspectionDate: item.finalInspectionDate || null,
    finalInspectionOpinion: item.finalInspectionResultContent || ''
  }));
};

// Lazy-loaded components
const ImprovementDetailModal = React.lazy(() =>
  import('./components/ImprovementDetailModal').then(module => ({ default: module.default }))
);

interface ImplMonitoringImprovementProps {
  className?: string;
}

const ImplMonitoringImprovement: React.FC<ImplMonitoringImprovementProps> = ({ className }) => {
  const { t } = useTranslation('compliance');

  // 초기 로딩 중복 실행 방지용 ref
  const isInitialLoadRef = useRef(false);

  // State Management
  const [executions, setExecutions] = useState<ImprovementData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedExecutions, setSelectedExecutions] = useState<ImprovementData[]>([]);

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

  const handleRequestApproval = useCallback(async () => {
    if (selectedExecutions.length === 0) {
      toast.warning('승인요청할 항목을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택된 ${selectedExecutions.length}개의 개선계획을 승인요청하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, detail: true }));
    const loadingToastId = toast.loading(`${selectedExecutions.length}개 개선계획을 승인요청 중입니다...`);

    try {
      // TODO: 실제 개선계획 승인요청 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));

      setExecutions(prev =>
        prev.map(exec =>
          selectedExecutions.some(selected => selected.id === exec.id)
            ? { ...exec, improvementStatus: '04' } // 개선이행으로 상태 변경
            : exec
        )
      );
      setSelectedExecutions([]);

      toast.update(loadingToastId, 'success', `${selectedExecutions.length}개 개선계획이 승인요청되었습니다.`);
    } catch (error) {
      toast.update(loadingToastId, 'error', '개선계획 승인요청에 실패했습니다.');
      console.error('승인요청 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, detail: false }));
    }
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

  const handleExecutionDetail = useCallback((execution: ImprovementData) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedExecution: execution
    }));
  }, []);

  /**
   * 부적정 항목 데이터 로딩 함수
   * - 원장차수ID가 있으면 해당 차수만 조회
   * - 없으면 전체 조회
   * - inspection_status_cd = '03' (부적정) 항목만 조회
   */
  const fetchImprovementData = useCallback(async (ledgerOrderId?: string) => {
    setLoading(true);
    const loadingToastId = toast.loading('부적정 항목 데이터를 조회 중입니다...');

    try {
      let items: ImplInspectionItemDto[];

      if (ledgerOrderId) {
        // 원장차수ID가 있으면 해당 차수의 부적정 항목만 조회
        items = await getItemsByLedgerOrderIdForImprovement(ledgerOrderId);
      } else {
        // 전체 부적정 항목 조회
        items = await getAllItemsForImprovement();
      }

      // API 응답 데이터를 화면용 데이터로 변환
      const transformedData = transformApiDataToImprovement(items);

      setExecutions(transformedData);
      setPagination(prev => ({
        ...prev,
        total: transformedData.length,
        totalPages: Math.ceil(transformedData.length / prev.size)
      }));

      toast.update(loadingToastId, 'success', `${transformedData.length}건의 부적정 항목을 조회했습니다.`);
    } catch (error) {
      console.error('부적정 항목 데이터 조회 실패:', error);
      toast.update(loadingToastId, 'error', '부적정 항목 데이터 조회에 실패했습니다.');

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

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    console.log('검색 필터:', filters);

    // 원장차수ID로 필터링된 조회 수행
    await fetchImprovementData(filters.ledgerOrderId || undefined);

    setLoadingStates(prev => ({ ...prev, search: false }));
  }, [filters, fetchImprovementData]);

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

  const handleRowClick = useCallback((execution: ImprovementData) => {
    console.log('행 클릭:', execution);
  }, []);

  const handleRowDoubleClick = useCallback((execution: ImprovementData) => {
    handleExecutionDetail(execution);
  }, [handleExecutionDetail]);

  const handleSelectionChange = useCallback((selected: ImprovementData[]) => {
    setSelectedExecutions(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values
  const statistics = useMemo<ExecutionStatistics>(() => {
    const total = pagination.total;
    // 개선이행상태 기준으로 통계 계산 (improvement_status_cd)
    const inProgress = executions.filter(e => e.improvementStatus === '04' || e.improvementStatus === '개선이행').length;
    const completed = executions.filter(e => e.improvementStatus === '03' || e.improvementStatus === '완료' || e.improvementStatus === '개선완료').length;
    const notStarted = executions.filter(e => e.improvementStatus === '01' || e.improvementStatus === '개선미이행').length;
    const rejected = executions.filter(e => e.finalInspectionResult === '02' || e.finalInspectionResult === '반려').length;
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

  // 부적정 항목만 필터링 (inspection_status_cd: 03=부적정)
  const displayExecutions = useMemo(() => {
    return executions.filter(e => e.inspectionResult === '03' || e.inspectionResult === '부적정' || e.inspectionResult === 'FAIL');
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

  const actionButtons = useMemo<ActionButton[]>(() => {
    // 개선계획이행 작성: 01(개선미이행) 또는 04(개선이행) 상태만 활성화
    const canWritePlan = selectedExecutions.length > 0 &&
      selectedExecutions.every(e => e.improvementStatus === '01' || e.improvementStatus === '04');

    // 개선계획 승인요청: 02(개선계획) 상태만 활성화
    const canRequestApproval = selectedExecutions.length > 0 &&
      selectedExecutions.every(e => e.improvementStatus === '02');

    // 개선완료: 04(개선이행) 상태만 활성화
    const canComplete = selectedExecutions.length > 0 &&
      selectedExecutions.every(e => e.improvementStatus === '04');

    return [
      {
        key: 'writePlan',
        type: 'custom',
        label: '개선계획/이행작성',
        variant: 'contained',
        color: 'primary',
        onClick: handleWriteImprovementPlan,
        disabled: !canWritePlan,
        confirmationRequired: false
      },
      {
        key: 'requestApproval',
        type: 'custom',
        label: '개선계획 승인요청',
        variant: 'contained',
        color: 'primary',
        onClick: handleRequestApproval,
        disabled: !canRequestApproval || loadingStates.detail,
        loading: loadingStates.detail,
        confirmationRequired: true
      },
      {
        key: 'complete',
        type: 'custom',
        label: '개선완료',
        variant: 'contained',
        color: 'success',
        onClick: handleCompleteImprovement,
        disabled: !canComplete || loadingStates.complete,
        loading: loadingStates.complete,
        confirmationRequired: true
      }
    ];
  }, [handleWriteImprovementPlan, handleRequestApproval, handleCompleteImprovement, selectedExecutions, loadingStates]);

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

  // 초기 데이터 로딩 (컴포넌트 마운트 시 1회만 실행)
  // React Strict Mode 및 탭 재진입 시 중복 실행 방지
  useEffect(() => {
    if (isInitialLoadRef.current) {
      return; // 이미 로딩이 실행되었으면 스킵
    }
    isInitialLoadRef.current = true;
    fetchImprovementData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            columns={improvementColumns.map(col => {
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

        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          title="부서 조회"
          multiple={false}
        />

        <React.Suspense fallback={<LoadingSpinner />}>
          <ImprovementDetailModal
            open={modalState.detailModal}
            mode="detail"
            improvement={modalState.selectedExecution}
            onClose={handleModalClose}
            onSave={() => {}}
            onUpdate={() => {}}
            loading={loading}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ImplMonitoringImprovement;
