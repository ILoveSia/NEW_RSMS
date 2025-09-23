// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './RejectionMgmt.module.scss';

// Types
import type {
  Rejection,
  RejectionFilters,
  RejectionModalState,
  RejectionPagination
} from './types/rejection.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Rejection specific components
import { rejectionColumns } from './components/RejectionDataGrid/rejectionColumns';

// Lazy-loaded components for performance optimization
const RejectionFormModal = React.lazy(() =>
  import('./components/RejectionFormModal').then(module => ({ default: module.default }))
);

interface RejectionMgmtProps {
  className?: string;
}

const RejectionMgmt: React.FC<RejectionMgmtProps> = ({ className }) => {
  const { t } = useTranslation('compliance');

  // State Management
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRejections, setSelectedRejections] = useState<Rejection[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    reprocess: false,
  });
  const [filters, setFilters] = useState<RejectionFilters>({
    category: '',
    partCode: '',
    requestDateFrom: '',
    requestDateTo: ''
  });

  const [pagination, setPagination] = useState<RejectionPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<RejectionModalState>({
    detailModal: false,
    reprocessModal: false,
    selectedRejection: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<RejectionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);


  const handleReprocessRequest = useCallback(async () => {
    if (selectedRejections.length === 0) {
      toast.warning('재처리 요청할 항목을 선택해주세요.');
      return;
    }

    // 재처리 가능한 항목만 필터링
    const reprocessableItems = selectedRejections.filter(item => item.canReprocess);
    if (reprocessableItems.length === 0) {
      toast.warning('선택된 항목 중 재처리 가능한 항목이 없습니다.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${reprocessableItems.length}개의 항목에 대해 재처리를 요청하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, reprocess: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${reprocessableItems.length}개 항목을 재처리 요청 중입니다...`);

    try {
      // TODO: 실제 재처리 요청 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (재처리 요청된 항목들의 상태 변경)
      setRejections(prev =>
        prev.map(rejection => {
          const isReprocessed = reprocessableItems.some(item => item.id === rejection.id);
          return isReprocessed
            ? { ...rejection, status: '재처리대기', canReprocess: false }
            : rejection;
        })
      );
      setSelectedRejections([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${reprocessableItems.length}개 항목의 재처리 요청이 완료되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '재처리 요청에 실패했습니다.');
      console.error('재처리 요청 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, reprocess: false }));
    }
  }, [selectedRejections]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      detailModal: false,
      reprocessModal: false,
      selectedRejection: null
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('반려 정보를 검색 중입니다...');

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
      category: '',
      partCode: '',
      requestDateFrom: '',
      requestDateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((rejection: Rejection) => {
    console.log('행 클릭:', rejection);
  }, []);

  const handleRowDoubleClick = useCallback((rejection: Rejection) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedRejection: rejection
    }));
  }, []);

  const handleSelectionChange = useCallback((selected: Rejection[]) => {
    setSelectedRejections(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const processingCount = rejections.filter(r => r.status === '처리중').length;
    const completedCount = rejections.filter(r => r.status === '완료').length;
    const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      processingCount,
      completedCount,
      systemUptime
    };
  }, [pagination.total, rejections]);

  // Filtered rejections for display (성능 최적화)
  const displayRejections = useMemo(() => {
    return rejections; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [rejections]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'category',
      type: 'select',
      label: '구분',
      options: [
        { value: '', label: '전체' },
        { value: '책무구조도', label: '책무구조도' },
        { value: '이행점검', label: '이행점검' },
        { value: '관리활동', label: '관리활동' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'partCode',
      type: 'text',
      label: '부품코드',
      placeholder: '부품코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 },
      endAdornment: {
        type: 'icon',
        icon: 'Search',
        onClick: () => {
          toast.info('부품조회팝업 기능은 준비 중입니다.', { autoClose: 2000 });
        },
        tooltip: '부품조회'
      }
    },
    {
      key: 'requestDateFrom',
      type: 'text',
      label: '요청일자(시작)',
      placeholder: 'YYYY-MM-DD',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'requestDateTo',
      type: 'text',
      label: '요청일자(종료)',
      placeholder: 'YYYY-MM-DD',
      gridSize: { xs: 12, sm: 6, md: 3 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'reprocess',
      type: 'custom',
      label: '재처리요청',
      variant: 'contained',
      color: 'warning',
      onClick: handleReprocessRequest,
      disabled: selectedRejections.length === 0 || loadingStates.reprocess,
      loading: loadingStates.reprocess,
      confirmationRequired: true
    }
  ], [handleReprocessRequest, selectedRejections.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '처리중',
      value: statistics.processingCount,
      color: 'warning',
      icon: <SecurityIcon />
    },
    {
      label: '완료',
      value: statistics.completedCount,
      color: 'success',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    _id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 RejectionMgmt Performance Profiler`);
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
    const mockRejections: Rejection[] = [
      {
        id: '1',
        sequence: 1,
        category: '책무구조도',
        categoryDetail: '조직체계',
        partName: '경영진단본부',
        content: '책무구조도 승인 요청',
        requestDate: '2024-09-15',
        requesterName: '김담당',
        requester: '경영진단본부',
        rejectionDate: '2024-09-17',
        rejectorName: '박승인자',
        rejector: '총합기획부',
        rejectionComment: '추가 검토 필요',
        status: '반려',
        canReprocess: true,
        partCode: 'RSP-001'
      },
      {
        id: '2',
        sequence: 2,
        category: '이행점검',
        categoryDetail: '점검활동',
        partName: '리스크관리본부',
        content: '이행점검 결과 승인 요청',
        requestDate: '2024-09-14',
        requesterName: '이점검',
        requester: '리스크관리본부',
        rejectionDate: '2024-09-16',
        rejectorName: '최검토자',
        rejector: '감사부',
        rejectionComment: '증빙자료 부족',
        status: '반려',
        canReprocess: true,
        partCode: 'RSP-002'
      },
      {
        id: '3',
        sequence: 3,
        category: '관리활동',
        categoryDetail: '활동수행',
        partName: '영업본부',
        content: '관리활동 실적 보고 승인 요청',
        requestDate: '2024-09-13',
        requesterName: '정관리',
        requester: '영업본부',
        rejectionDate: '2024-09-15',
        rejectorName: '한확인자',
        rejector: '준법감시부',
        rejectionComment: '기준 미충족',
        status: '재처리대기',
        canReprocess: false,
        partCode: 'RSP-003'
      }
    ];

    setRejections(mockRejections);
    setPagination(prev => ({
      ...prev,
      total: mockRejections.length,
      totalPages: Math.ceil(mockRejections.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="RejectionMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <DashboardIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('rejection.management.title', '반려관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('rejection.management.description', '반려된 요청 건들을 체계적으로 관리합니다')}
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
                <div className={styles.statLabel}>총 반려</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.processingCount}
                </div>
                <div className={styles.statLabel}>처리중</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.completedCount}</div>
                <div className={styles.statLabel}>완료</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<RejectionFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 반려 건수"
          selectedCount={selectedRejections.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayRejections}
          columns={rejectionColumns}
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

      {/* 반려 상세/재처리요청 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <RejectionFormModal
          open={modalState.detailModal}
          rejection={modalState.selectedRejection}
          onClose={handleModalClose}
          loading={loading}
        />
      </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default RejectionMgmt;