// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ActComplImprovement.module.scss';

// Types
import type {
  ActComplImprovement,
  ActComplImprovementFilters,
  ActComplImprovementFormData,
  ActComplImprovementModalState,
  ActComplImprovementPagination,
  ImprovementStatus,
  ImprovementCategory
} from './types/actComplImprovement.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { BranchLookupModal } from '@/shared/components/organisms/BranchLookupModal';
import type { Branch } from '@/shared/components/organisms/BranchLookupModal/types/branchLookup.types';

// ActComplImprovement specific components
const actComplImprovementColumns = [
  { field: 'sequence', headerName: '순번', width: 80, sortable: true },
  { field: 'category', headerName: '구분', width: 120, sortable: true },
  { field: 'departmentName', headerName: '부품명', width: 150, sortable: true },
  { field: 'categoryDetail', headerName: '구분상세', width: 120, sortable: true },
  { field: 'activityName', headerName: '관리활동명', width: 200, sortable: true, flex: 1 },
  { field: 'requestDate', headerName: '개선요청일자', width: 130, sortable: true },
  { field: 'requester', headerName: '개선요청자', width: 120, sortable: true },
  { field: 'improvementDate', headerName: '개선일자', width: 120, sortable: true },
  { field: 'status', headerName: '진행상태', width: 100, sortable: true },
  { field: 'result', headerName: '개선결과', width: 150, sortable: true }
];

// Lazy-loaded components for performance optimization
const ImprovementDetailModal = React.lazy(() =>
  import('./components/ImprovementDetailModal').then(module => ({ default: module.default }))
);

interface ActComplImprovementProps {
  className?: string;
}

const ActComplImprovement: React.FC<ActComplImprovementProps> = ({ className }) => {
  const { t } = useTranslation('improvement');

  // State Management
  const [improvements, setImprovements] = useState<ActComplImprovement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImprovements, setSelectedImprovements] = useState<ActComplImprovement[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    plan: false,
    progress: false,
    completion: false
  });

  const [filters, setFilters] = useState<ActComplImprovementFilters>({
    branchCode: '',
    category: '',
    requestDateFrom: '',
    requestDateTo: '',
    round: '',
    status: ''
  });

  const [pagination, setPagination] = useState<ActComplImprovementPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ActComplImprovementModalState>({
    addModal: false,
    detailModal: false,
    planModal: false,
    progressModal: false,
    completionModal: false,
    selectedItem: null
  });

  // BranchLookupModal 상태
  const [branchModalOpen, setBranchModalOpen] = useState<boolean>(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ActComplImprovementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddImprovement = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedItem: null
    }));
    toast.info('새 개선이행을 등록해주세요.', { autoClose: 2000 });
  }, []);

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

  const handleDeleteImprovements = useCallback(async () => {
    if (selectedImprovements.length === 0) {
      toast.warning('삭제할 개선이행을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedImprovements.length}개의 개선이행을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedImprovements.length}개 개선이행을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setImprovements(prev =>
        prev.filter(item => !selectedImprovements.some(selected => selected.id === item.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedImprovements.length
      }));
      setSelectedImprovements([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedImprovements.length}개 개선이행이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '개선이행 삭제에 실패했습니다.');
      console.error('개선이행 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedImprovements]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      planModal: false,
      progressModal: false,
      completionModal: false,
      selectedItem: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleImprovementSave = useCallback(async (formData: ActComplImprovementFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 개선이행 생성
      // const response = await actComplImprovementApi.create(formData);

      // 임시로 새 개선이행 객체 생성
      const newImprovement: ActComplImprovement = {
        id: Date.now().toString(),
        sequence: improvements.length + 1,
        category: formData.category,
        departmentName: formData.departmentName,
        categoryDetail: formData.categoryDetail,
        activityName: formData.activityName,
        requestDate: formData.requestDate,
        requester: formData.requester,
        status: 'REQUESTED' as ImprovementStatus,
        branchCode: formData.branchCode,
        priority: formData.priority,
        description: formData.description,
        dueDate: formData.dueDate,
        attachments: formData.attachments
      };

      setImprovements(prev => [newImprovement, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('개선이행이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('개선이행 등록 실패:', error);
      toast.error('개선이행 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [improvements.length, handleModalClose]);

  const handleImprovementUpdate = useCallback(async (id: string, formData: ActComplImprovementFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 개선이행 수정
      // const response = await actComplImprovementApi.update(id, formData);

      // 임시로 기존 개선이행 업데이트
      setImprovements(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                category: formData.category,
                departmentName: formData.departmentName,
                categoryDetail: formData.categoryDetail,
                activityName: formData.activityName,
                requestDate: formData.requestDate,
                requester: formData.requester,
                branchCode: formData.branchCode,
                priority: formData.priority,
                description: formData.description,
                dueDate: formData.dueDate,
                attachments: formData.attachments
              }
            : item
        )
      );

      handleModalClose();
      toast.success('개선이행이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('개선이행 수정 실패:', error);
      toast.error('개선이행 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleImprovementDetail = useCallback((improvement: ActComplImprovement) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedItem: improvement
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('개선이행 정보를 검색 중입니다...');

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
      branchCode: '',
      category: '',
      requestDateFrom: '',
      requestDateTo: '',
      round: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((improvement: ActComplImprovement) => {
    console.log('행 클릭:', improvement);
  }, []);

  const handleRowDoubleClick = useCallback((improvement: ActComplImprovement) => {
    handleImprovementDetail(improvement);
  }, [handleImprovementDetail]);

  const handleSelectionChange = useCallback((selected: ActComplImprovement[]) => {
    setSelectedImprovements(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // 부점 조회 핸들러
  const handleBranchSearchClick = useCallback(() => {
    setBranchModalOpen(true);
  }, []);

  const handleBranchSelect = useCallback((selected: Branch | Branch[]) => {
    const branch = Array.isArray(selected) ? selected[0] : selected;
    if (branch) {
      handleFiltersChange({ branchCode: branch.branchCode });
      setBranchModalOpen(false);
      console.log('부점 선택:', branch.branchCode, branch.branchName);
    }
  }, [handleFiltersChange]);

  const handleBranchModalClose = useCallback(() => {
    setBranchModalOpen(false);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const requestedItems = improvements.filter(item => item.status === 'REQUESTED').length;
    const inProgressItems = improvements.filter(item => item.status === 'IN_PROGRESS').length;
    const completedItems = improvements.filter(item => item.status === 'COMPLETED').length;

    return {
      total,
      requestedItems,
      inProgressItems,
      completedItems
    };
  }, [pagination.total, improvements]);

  // Filtered improvements for display (성능 최적화)
  const displayImprovements = useMemo(() => {
    return improvements; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [improvements]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'branchCode',
      type: 'text',
      label: '부점코드',
      placeholder: '부점코드를 입력하세요',
      endAdornment: {
        type: 'icon',
        icon: 'Search',
        onClick: handleBranchSearchClick,
        tooltip: '부점 조회'
      },
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'category',
      type: 'select',
      label: '구분',
      options: [
        { value: '', label: '전체' },
        { value: 'MGMT_ACTIVITY', label: '관리활동' },
        { value: 'IMPL_INSPECTION', label: '이행점검' },
        { value: 'BOTH', label: '통합' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'requestDateFrom',
      type: 'date',
      label: '개선요청시작일자',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'requestDateTo',
      type: 'date',
      label: '개선요청종료일자',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'round',
      type: 'select',
      label: '회차',
      options: [
        { value: '', label: '전체' },
        { value: '1', label: '1회차' },
        { value: '2', label: '2회차' },
        { value: '3', label: '3회차' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'status',
      type: 'select',
      label: '진행상태',
      options: [
        { value: '', label: '전체' },
        { value: 'REQUESTED', label: '요청' },
        { value: 'PLANNING', label: '계획수립' },
        { value: 'APPROVED', label: '승인완료' },
        { value: 'IN_PROGRESS', label: '진행중' },
        { value: 'COMPLETED', label: '완료' },
        { value: 'VERIFIED', label: '검증완료' },
        { value: 'CLOSED', label: '종료' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    }
  ], [handleBranchSearchClick]);

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
      key: 'add',
      type: 'add',
      onClick: handleAddImprovement
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteImprovements,
      disabled: selectedImprovements.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddImprovement, handleDeleteImprovements, selectedImprovements.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '진행중',
      value: statistics.inProgressItems,
      color: 'info',
      icon: <SecurityIcon />
    },
    {
      label: '완료',
      value: statistics.completedItems,
      color: 'success',
      icon: <SecurityIcon />
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
      console.group(`🔍 ActComplImprovement Performance Profiler`);
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
    const mockImprovements: ActComplImprovement[] = [
      {
        id: '1',
        sequence: 1,
        category: 'MGMT_ACTIVITY' as ImprovementCategory,
        departmentName: '경영진단본부',
        categoryDetail: '내부통제',
        activityName: '리스크 관리 체계 점검',
        requestDate: '2024-01-15',
        requester: '김철수',
        improvementDate: '2024-02-10',
        status: 'COMPLETED' as ImprovementStatus,
        result: '시스템 개선 완료'
      },
      {
        id: '2',
        sequence: 2,
        category: 'IMPL_INSPECTION' as ImprovementCategory,
        departmentName: '총합기획부',
        categoryDetail: '정책수립',
        activityName: '전사 정책 수립 프로세스 개선',
        requestDate: '2024-02-01',
        requester: '박영희',
        status: 'IN_PROGRESS' as ImprovementStatus
      },
      {
        id: '3',
        sequence: 3,
        category: 'BOTH' as ImprovementCategory,
        departmentName: '영업본부',
        categoryDetail: '영업프로세스',
        activityName: '고객 관리 시스템 업그레이드',
        requestDate: '2024-03-05',
        requester: '이민수',
        status: 'REQUESTED' as ImprovementStatus
      },
      {
        id: '4',
        sequence: 4,
        category: 'MGMT_ACTIVITY' as ImprovementCategory,
        departmentName: '인사부',
        categoryDetail: '인사관리',
        activityName: '성과평가 시스템 개선',
        requestDate: '2024-03-20',
        requester: '정수진',
        status: 'PLANNING' as ImprovementStatus
      },
      {
        id: '5',
        sequence: 5,
        category: 'IMPL_INSPECTION' as ImprovementCategory,
        departmentName: '재무부',
        categoryDetail: '재무관리',
        activityName: '예산 수립 프로세스 표준화',
        requestDate: '2024-04-01',
        requester: '한상훈',
        status: 'APPROVED' as ImprovementStatus
      }
    ];

    setImprovements(mockImprovements);
    setPagination(prev => ({
      ...prev,
      total: mockImprovements.length,
      totalPages: Math.ceil(mockImprovements.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="ActComplImprovement" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('actComplImprovement.management.title', '관리활동/이행점검 개선이행')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('actComplImprovement.management.description', '관리활동 및 이행점검의 개선이행 현황을 관리합니다')}
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
                  <div className={styles.statLabel}>총 개선이행</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <SecurityIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.inProgressItems}
                  </div>
                  <div className={styles.statLabel}>진행중</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.completedItems}</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ActComplImprovementFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 개선이행 수"
            selectedCount={selectedImprovements.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayImprovements}
            columns={actComplImprovementColumns}
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

        {/* 개선이행 등록/상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ImprovementDetailModal
            open={modalState.addModal || modalState.detailModal}
            mode={modalState.addModal ? 'create' : 'detail'}
            itemData={modalState.selectedItem}
            onClose={handleModalClose}
            onSave={handleImprovementSave}
            onUpdate={handleImprovementUpdate}
            loading={loading}
          />
        </React.Suspense>

        {/* 부점 조회 모달 */}
        <BranchLookupModal
          open={branchModalOpen}
          onClose={handleBranchModalClose}
          onSelect={handleBranchSelect}
        />
      </div>
    </React.Profiler>
  );
};

export default ActComplImprovement;