// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PerformerAssignment.module.scss';

// Types
import type {
  PerformerAssignment,
  PerformerFilters,
  PerformerFormData,
  PerformerModalState,
  PerformerPagination
} from './types/performer.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Performer specific components
import { performerColumns } from './components/PerformerDataGrid/performerColumns';

// Lazy-loaded components for performance optimization
const PerformerFormModal = React.lazy(() =>
  import('./components/PerformerFormModal/PerformerFormModal').then(module => ({ default: module.default }))
);

interface PerformerAssignmentProps {
  className?: string;
}

const PerformerAssignment: React.FC<PerformerAssignmentProps> = ({ className }) => {
  const { t } = useTranslation('activities');

  // State Management
  const [performers, setPerformers] = useState<PerformerAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPerformers, setSelectedPerformers] = useState<PerformerAssignment[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    assign: false,
    change: false,
    release: false,
  });

  const [filters, setFilters] = useState<PerformerFilters>({
    targetPeriodStart: '2025-01-01',
    targetPeriodEnd: '2025-08-31',
    assignmentStatus: '',
    departmentCode: '',
    searchKeyword: ''
  });

  const [pagination, setPagination] = useState<PerformerPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<PerformerModalState>({
    assignModal: false,
    changeModal: false,
    detailModal: false,
    selectedPerformer: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<PerformerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAssignPerformer = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      assignModal: true,
      selectedPerformer: null
    }));
    toast.info('새 수행자를 지정해주세요.', { autoClose: 2000 });
  }, []);

  const handleChangePerformer = useCallback(() => {
    if (selectedPerformers.length !== 1) {
      toast.warning('변경할 수행자를 하나만 선택해주세요.');
      return;
    }

    setModalState(prev => ({
      ...prev,
      changeModal: true,
      selectedPerformer: selectedPerformers[0]
    }));
    toast.info('수행자 정보를 변경해주세요.', { autoClose: 2000 });
  }, [selectedPerformers]);

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

  const handleReleasePerformer = useCallback(async () => {
    if (selectedPerformers.length === 0) {
      toast.warning('해제할 수행자를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedPerformers.length}개의 수행자 지정을 해제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, release: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedPerformers.length}개 수행자 지정을 해제 중입니다...`);

    try {
      // TODO: 실제 해제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (해제된 항목 제거)
      setPerformers(prev =>
        prev.filter(performer => !selectedPerformers.some(selected => selected.id === performer.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedPerformers.length
      }));
      setSelectedPerformers([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedPerformers.length}개 수행자 지정이 해제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '수행자 지정 해제에 실패했습니다.');
      console.error('수행자 지정 해제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, release: false }));
    }
  }, [selectedPerformers]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      assignModal: false,
      changeModal: false,
      detailModal: false,
      selectedPerformer: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handlePerformerSave = useCallback(async (formData: PerformerFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 수행자 지정

      // 임시로 새 수행자 객체 생성
      const newPerformer: PerformerAssignment = {
        id: Date.now().toString(),
        sequence: performers.length + 1,
        order: 1,
        activityName: formData.activityName,
        activityDetail: '활동 상세 내용',
        cycle: '분기별',
        isInternalActivity: true,
        regulation: '구속',
        responsibleDepartment: formData.performerDepartment,
        isPerformed: false,
        performer: formData.performerName,
        cssConst: 'Y',
        gnrzOblgDvcd: '02',
        endYn: 'N',
        assignmentDate: new Date().toISOString().split('T')[0],
        assigner: '현재사용자',
        assignerPosition: '관리자',
        modificationDate: new Date().toISOString().split('T')[0],
        modifier: '현재사용자',
        modifierPosition: '관리자',
        status: '정상',
        isActive: true
      };

      setPerformers(prev => [newPerformer, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('수행자가 성공적으로 지정되었습니다.');
    } catch (error) {
      console.error('수행자 지정 실패:', error);
      toast.error('수행자 지정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [performers.length, handleModalClose]);

  const handlePerformerUpdate = useCallback(async (id: string, formData: PerformerFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 수행자 변경

      // 임시로 기존 수행자 업데이트
      setPerformers(prev =>
        prev.map(performer =>
          performer.id === id
            ? {
                ...performer,
                activityName: formData.activityName,
                performer: formData.performerName,
                responsibleDepartment: formData.performerDepartment,
                modificationDate: new Date().toISOString().split('T')[0],
                modifier: '현재사용자',
                modifierPosition: '관리자'
              }
            : performer
        )
      );

      handleModalClose();
      toast.success('수행자가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('수행자 변경 실패:', error);
      toast.error('수행자 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handlePerformerDetail = useCallback((performer: PerformerAssignment) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedPerformer: performer
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('수행자 정보를 검색 중입니다...');

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
      assignmentStatus: '',
      departmentCode: '',
      searchKeyword: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((performer: PerformerAssignment) => {
    console.log('행 클릭:', performer);
  }, []);

  const handleRowDoubleClick = useCallback((performer: PerformerAssignment) => {
    handlePerformerDetail(performer);
  }, [handlePerformerDetail]);

  const handleSelectionChange = useCallback((selected: PerformerAssignment[]) => {
    setSelectedPerformers(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const assignedCount = performers.filter(p => p.performer && p.performer.trim() !== '').length;
    const unassignedCount = total - assignedCount;
    const systemUptime = 99.8; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      assignedCount,
      unassignedCount,
      systemUptime
    };
  }, [pagination.total, performers]);

  // Filtered performers for display (성능 최적화)
  const displayPerformers = useMemo(() => {
    return performers; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [performers]);

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
      key: 'assignmentStatus',
      type: 'select',
      label: '수행자 지정 할당여부',
      options: [
        { value: '', label: '전체' },
        { value: 'assigned', label: '할당' },
        { value: 'unassigned', label: '미할당' }
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
      key: 'assign',
      type: 'add',
      label: '작성',
      onClick: handleAssignPerformer
    },
    {
      key: 'change',
      type: 'edit',
      label: '변경',
      onClick: handleChangePerformer,
      disabled: selectedPerformers.length !== 1 || loadingStates.change,
      loading: loadingStates.change
    },
    {
      key: 'release',
      type: 'delete',
      label: '해제',
      onClick: handleReleasePerformer,
      disabled: selectedPerformers.length === 0 || loadingStates.release,
      loading: loadingStates.release,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAssignPerformer, handleChangePerformer, handleReleasePerformer, selectedPerformers.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '할당',
      value: statistics.assignedCount,
      color: 'success',
      icon: <AssignmentIndIcon />
    },
    {
      label: '미할당',
      value: statistics.unassignedCount,
      color: 'warning',
      icon: <AssignmentIndIcon />
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
      console.group(`🔍 PerformerAssignment Performance Profiler`);
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
    const mockPerformers: PerformerAssignment[] = [
      {
        id: '1',
        sequence: 1,
        order: 1,
        activityName: '영업 실적',
        activityDetail: '상반기가',
        cycle: '분기별',
        isInternalActivity: true,
        regulation: '교육수행팀장',
        responsibleDepartment: '교육수행팀장',
        isPerformed: true,
        performer: '0000000-관리자',
        cssConst: 'Y',
        gnrzOblgDvcd: '02',
        endYn: 'N',
        assignmentDate: '2024-01-15',
        assigner: '관리자',
        assignerPosition: '시스템관리자',
        modificationDate: '2024-03-20',
        modifier: '홍길동',
        modifierPosition: '총합기획부',
        status: '정상',
        isActive: true
      }
    ];

    setPerformers(mockPerformers);
    setPagination(prev => ({
      ...prev,
      total: mockPerformers.length,
      totalPages: Math.ceil(mockPerformers.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="PerformerAssignment" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('performer.assignment.title', '수행자지정')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('performer.assignment.description', '관리활동별 수행자를 지정하고 관리합니다')}
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
                  <AssignmentIndIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.assignedCount}
                  </div>
                  <div className={styles.statLabel}>지정된 활동</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<PerformerFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="관리활동 수행자 지정 목록"
            selectedCount={selectedPerformers.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayPerformers}
            columns={performerColumns}
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

        {/* 수행자 지정/변경/상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <PerformerFormModal
            open={modalState.assignModal || modalState.changeModal || modalState.detailModal}
            mode={modalState.assignModal ? 'assign' : modalState.changeModal ? 'change' : 'detail'}
            performer={modalState.selectedPerformer}
            onClose={handleModalClose}
            onSave={handlePerformerSave}
            onUpdate={handlePerformerUpdate}
            loading={loading}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default PerformerAssignment;