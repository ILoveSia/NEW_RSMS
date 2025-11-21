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
  ExecutionFilters,
  ExecutionModalState,
  ExecutionPagination,
  ExecutionStatistics,
  InspectionExecution
} from './types/implMonitoringStatus.types';

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

  const handleInspectionSave = useCallback(async (data: any) => {
    setLoading(true);
    const loadingToastId = toast.loading('점검 정보를 저장 중입니다...');

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.update(loadingToastId, 'success', '점검 정보가 저장되었습니다.');
      handleModalClose();
    } catch (error) {
      toast.update(loadingToastId, 'error', '점검 정보 저장에 실패했습니다.');
      console.error('점검 정보 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleInspectionUpdate = useCallback(async (id: string, data: any) => {
    setLoading(true);
    const loadingToastId = toast.loading('점검 정보를 수정 중입니다...');

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.update(loadingToastId, 'success', '점검 정보가 수정되었습니다.');
      handleModalClose();
    } catch (error) {
      toast.update(loadingToastId, 'error', '점검 정보 수정에 실패했습니다.');
      console.error('점검 정보 수정 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

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

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockExecutions: InspectionExecution[] = [
      {
        id: '1',
        sequenceNumber: 1,
        inspectionName: '2025년 하반기 정기점검',
        obligationInfo: '중요계약서 서식 및 내용의 적정성 검토에 대한 점검',
        managementActivityName: '중요계약서 서식 및 내용의 적정성 검토에 대한 점검',
        activityFrequencyCd: '월간',
        orgCode: '준법지원팀',
        inspectionMethod: '법률 위험이 발생하지 않도록 표준계약서 및 약관 작성·운영 기준 마련 여부',
        inspector: '김철수',
        inspectionResult: '02', // 02: 적정
        inspectionDetail: '모든 항목 정상 확인',
        inspectionStatus: 'COMPLETED',
        inspectionPeriodId: '2026_FIRST_HALF',
        createdAt: '2024-09-21T10:00:00Z',
        updatedAt: '2024-09-21T10:00:00Z'
      },
      {
        id: '2',
        sequenceNumber: 2,
        inspectionName: '2025년 하반기 정기점검',
        obligationInfo: '법률 관련 질의회신 내용의 적정성 검토에 대한 점검',
        managementActivityName: '법률 관련 질의회신 내용의 적정성 검토에 대한 점검',
        activityFrequencyCd: '월간',
        orgCode: '준법지원팀',
        inspectionMethod: '법률자문 의뢰 시 질의 배경, 질의 요지, 해당 부점의 의견 등의 기재 여부 의뢰한 사안에 대하여 신속히 검토하고, 그 결과를 문서의 방법으로 회신여부 의뢰받은 법률자문이 다수일 경우에는 접수한 순서대로 회신 수행 여부',
        inspector: '김철수',
        inspectionResult: '02', // 01: 미점검
        inspectionDetail: '일부 항목 보완 필요',
        inspectionStatus: 'COMPLETED',
        inspectionPeriodId: '2026_FIRST_HALF',
        createdAt: '2024-09-21T10:00:00Z',
        updatedAt: '2024-09-21T10:00:00Z'
      },
      {
        id: '3',
        sequenceNumber: 3,
        inspectionName: '2025년 하반기 정기점검',
        obligationInfo: '소송관련 업무 전반에 대한 지원 및 관련 자료 수집 및 보관 절차준수 여부에 대한 점검',
        managementActivityName: '소송관련 업무 전반에 대한 지원 점검',
        activityFrequencyCd: '월간',
        orgCode: '준법지원팀',
        inspectionMethod: '법·규정이나 법적 문서의 해석 및 업무의 적법성 여부의 의문시 사항에 대한 지원 여부 : 각 부점의 업무와 관련하여 긴박한 법적 문제가 발생항목에 대한 지원 여부',
        inspector: '김철수',
        inspectionResult: '02', // 02: 적정
        inspectionDetail: '모든 항목 정상 확인',
        inspectionStatus: 'COMPLETED',
        inspectionPeriodId: '2026_FIRST_HALF',
        createdAt: '2024-09-21T10:00:00Z',
        updatedAt: '2024-09-21T10:00:00Z'
      },
      {
        id: '4',
        sequenceNumber: 4,
        inspectionName: '2025년 하반기 정기점검',
        obligationInfo: '외부위임 소송업무의 변호사 선정 및 자문료 금액에 대한 규정 준수 및 전결권자 승인여부에 대한 점검',
        managementActivityName: '외부위임 소송사건의 업무 처리 적정성 점검',
        activityFrequencyCd: '월간',
        orgCode: '준법지원팀',
        inspectionMethod: '법률자문신청서를 작성하여 문서로 법률자문을 의뢰 여부 : 법률자문의뢰시 질의 배경, 질의 요지, 해당 부점의 의견 등을 기재 여부 : 법률자문의뢰 관련 비용의 의뢰부점에 귀속 여부',
        inspector: '김철수',
        inspectionResult: '03', // 02: 적정
        inspectionDetail: '개선이 필요',
        inspectionStatus: 'COMPLETED',
        inspectionPeriodId: '2026_FIRST_HALF',
        createdAt: '2024-09-21T10:00:00Z',
        updatedAt: '2024-09-21T10:00:00Z'
      },
      {
        id: '5',
        sequenceNumber: 5,
        inspectionName: '2025년 하반기 정기점검',
        obligationInfo: '정관 변경 및 내규 제·개정·폐지 시 사전검토 및 협의 수행여부에 대한 점검',
        managementActivityName: '정관 변경 및 내규 제·개정·폐지 시 사전심의 및 협의 절차 점검',
        activityFrequencyCd: '연간',
        orgCode: '준법지원팀',
        inspectionMethod: '정관·사규 등의 제정 및 개폐시 관계법령등의 준수 여부 및 사전 심의 수행 여부',
        inspector: '김철수',
        inspectionResult: '03', // 03: 부적정
        inspectionDetail: '개선이 필요',
        inspectionStatus: 'COMPLETED',
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
