// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ApprovalBox.module.scss';

// Types and Constants
import type {
  Approval,
  ApprovalBoxFilters,
  ApprovalFormData,
  ApprovalBoxModalState,
  ApprovalBoxPagination,
  ApprovalStatus
} from './types/approvalBox.types';

import {
  WORK_TYPE_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
  DEPARTMENT_OPTIONS
} from './types/approvalBox.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
// ApprovalBox specific components
const ApprovalDetailModal = React.lazy(() =>
  import('./components/ApprovalDetailModal/ApprovalDetailModal')
);

const approvalBoxColumns = [
  { field: 'approvalId' as any, headerName: '결재ID', width: 100, sortable: true },
  { field: 'workType' as any, headerName: '업무종류', width: 120, sortable: true },
  { field: 'content' as any, headerName: '내용', width: 200, sortable: true, flex: 1 },
  { field: 'approvalStatus' as any, headerName: '결재상태', width: 100, sortable: true },
  { field: 'approvalSchedule' as any, headerName: '결재일정', width: 120, sortable: true },
  { field: 'drafter' as any, headerName: '기안자', width: 100, sortable: true },
  { field: 'draftDate' as any, headerName: '기안일', width: 120, sortable: true },
  { field: 'requester' as any, headerName: '요청자', width: 100, sortable: true },
  { field: 'requestDate' as any, headerName: '요청일', width: 120, sortable: true },
  { field: 'approver' as any, headerName: '결재자', width: 100, sortable: true },
  { field: 'approveDate' as any, headerName: '결재일', width: 120, sortable: true },
  { field: 'waiter' as any, headerName: '대기자', width: 100, sortable: true }
];


interface ApprovalBoxProps {
  className?: string;
}

const ApprovalBox: React.FC<ApprovalBoxProps> = ({ className }) => {
  const { t } = useTranslation('approval');

  // State Management
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedApprovals, setSelectedApprovals] = useState<Approval[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    approve: false,
    reject: false,
    withdraw: false
  });

  const [filters, setFilters] = useState<ApprovalBoxFilters>({
    startDate: '',
    endDate: '',
    workType: '',
    department: '',
    approvalStatus: '',
    keyword: ''
  });

  const [pagination, setPagination] = useState<ApprovalBoxPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ApprovalBoxModalState>({
    addModal: false,
    detailModal: false,
    approveModal: false,
    rejectModal: false,
    withdrawModal: false,
    selectedItem: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ApprovalBoxFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddApproval = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedItem: null
    }));
    toast.info('새 결재를 등록해주세요.', { autoClose: 2000 });
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
      // 오류 토스트로 업데이트
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 오류:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteApprovals = useCallback(async () => {
    if (selectedApprovals.length === 0) {
      toast.warning('삭제할 결재를 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));
    const loadingToastId = toast.loading(`${selectedApprovals.length}건의 결재를 삭제하는 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 삭제된 항목들 제거
      const deletedIds = selectedApprovals.map(approval => approval.id);
      setApprovals(prev => prev.filter(approval => !deletedIds.includes(approval.id)));
      setSelectedApprovals([]);

      toast.update(loadingToastId, 'success', `${selectedApprovals.length}건의 결재가 삭제되었습니다.`);
    } catch (error) {
      toast.update(loadingToastId, 'error', '결재 삭제에 실패했습니다.');
      console.error('결재 삭제 오류:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedApprovals]);

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      // TODO: 실제 검색 API 호출
      console.log('검색 조건:', filters);
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('검색이 완료되었습니다.', { autoClose: 2000 });
    } catch (error) {
      toast.error('검색에 실패했습니다.');
      console.error('검색 오류:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      workType: '',
      department: '',
      approvalStatus: '',
      keyword: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((approval: Approval) => {
    console.log('행 클릭:', approval);
  }, []);

  const handleApprovalDetail = useCallback((approval: Approval) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedItem: approval
    }));
    console.log('결재 상세 보기:', approval);
  }, []);

  const handleRowDoubleClick = useCallback((approval: Approval) => {
    handleApprovalDetail(approval);
  }, [handleApprovalDetail]);

  const handleSelectionChange = useCallback((selected: Approval[]) => {
    setSelectedApprovals(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      approveModal: false,
      rejectModal: false,
      withdrawModal: false,
      selectedItem: null
    }));
  }, []);

  // Approval Actions
  const handleApprovalSave = useCallback(async (formData: ApprovalFormData) => {
    console.log('결재 저장:', formData);
    // TODO: 실제 저장 API 호출
    handleModalClose();
    toast.success('결재가 등록되었습니다.');
  }, [handleModalClose]);

  const handleApprovalUpdate = useCallback(async (formData: ApprovalFormData) => {
    console.log('결재 수정:', formData);
    // TODO: 실제 수정 API 호출
    handleModalClose();
    toast.success('결재가 수정되었습니다.');
  }, [handleModalClose]);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const waitingItems = approvals.filter(item => item.approvalStatus === 'PENDING').length;
    const progressItems = approvals.filter(item => item.approvalStatus === 'PROGRESS').length;
    const completedItems = approvals.filter(item => item.approvalStatus === 'APPROVED').length;

    return {
      total,
      waitingItems,
      waitingTotal: 70, // TODO: API에서 받아올 값
      progressItems,
      completedItems
    };
  }, [pagination.total, approvals]);

  // Filtered approvals for display (성능 최적화)
  const displayApprovals = useMemo(() => {
    return approvals; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [approvals]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'startDate',
      type: 'date',
      label: '시작일',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'endDate',
      type: 'date',
      label: '종료일',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'workType',
      type: 'select',
      label: '업무종류',
      options: WORK_TYPE_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'department',
      type: 'select',
      label: '부서',
      options: DEPARTMENT_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'approvalStatus',
      type: 'select',
      label: '결재상태',
      options: APPROVAL_STATUS_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'keyword',
      type: 'text',
      label: '키워드',
      placeholder: '키워드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      type: 'excel',
      label: '엑셀다운로드',
      variant: 'contained',
      color: 'primary',
      onClick: handleExcelDownload,
      disabled: loading || loadingStates.excel,
      loading: loadingStates.excel
    },
    {
      key: 'add',
      type: 'add',
      label: '등록',
      variant: 'contained',
      color: 'primary',
      onClick: handleAddApproval,
      disabled: loading
    },
    {
      key: 'delete',
      type: 'delete',
      label: '삭제',
      variant: 'contained',
      color: 'error',
      onClick: handleDeleteApprovals,
      disabled: loading || selectedApprovals.length === 0 || loadingStates.delete,
      loading: loadingStates.delete
    }
  ], [
    loading,
    loadingStates.excel,
    loadingStates.delete,
    selectedApprovals.length,
    handleExcelDownload,
    handleAddApproval,
    handleDeleteApprovals
  ]);

  // BaseActionBar용 상태 정보
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '대기',
      value: `${statistics.waitingItems}/${statistics.waitingTotal}`,
      color: 'warning'
    },
    {
      label: '진행중',
      value: statistics.progressItems.toString(),
      color: 'primary'
    },
    {
      label: '완료',
      value: statistics.completedItems.toString(),
      color: 'success'
    }
  ], [statistics]);

  // React.Profiler onRender callback for performance monitoring
  const onRenderProfiler = useCallback((
    _id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ApprovalBox Performance Profiler`);
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
    const mockApprovals: Approval[] = [
        {
          id: '1',
          sequence: 1,
          approvalId: '1503',
          workType: '책무구조',
          content: '관리활동 결재',
          approvalStatus: 'PROGRESS',
          approvalSchedule: '0/1',
          drafter: '관리자 (0000000)',
          drafterPosition: '관리자',
          draftDate: '2025-09-08 15:36',
          requester: '관리자 (0000000)',
          requestDate: '2025-09-08 15:36',
          approver: 'FIT 3 (0000003)',
          approveDate: '2025-09-08 15:36',
          waiter: 'FIT 3 (0000003)'
        },
        {
          id: '2',
          sequence: 2,
          approvalId: '1502',
          workType: '책무구조',
          content: '관리활동 결재',
          approvalStatus: 'APPROVED',
          approvalSchedule: '0/1',
          drafter: '관리자 (0000000)',
          drafterPosition: '관리자',
          draftDate: '2025-09-08 15:11',
          approver: 'FIT 1 (0000001)',
          approveDate: '2025-09-08 15:11'
        },
        {
          id: '3',
          sequence: 3,
          approvalId: '1501',
          workType: '책무구조',
          content: '관리활동 결재',
          approvalStatus: 'APPROVED',
          approvalSchedule: '0/1',
          drafter: '관리자 (0000000)',
          drafterPosition: '관리자',
          draftDate: '2025-09-08 15:01',
          approver: 'FIT 1 (0000001)',
          approveDate: '2025-09-08 15:01'
        }
    ];

    setApprovals(mockApprovals);
    setPagination(prev => ({ ...prev, total: mockApprovals.length }));
  }, []);

  return (
    <React.Profiler id="ApprovalBox" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <DashboardIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('approval.box.title', '결재함 관리')}
              </h1>
              <p className={styles.pageDescription}>
                {t('approval.box.description', '결재업무를 통합적으로 관리합니다')}
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
                <div className={styles.statLabel}>총 결재</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {`${statistics.waitingItems}/${statistics.waitingTotal}`}
                </div>
                <div className={styles.statLabel}>대기</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.progressItems}</div>
                <div className={styles.statLabel}>진행중</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ApprovalBoxFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 결재 수"
          selectedCount={selectedApprovals.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayApprovals}
          columns={approvalBoxColumns}
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

      {/* 결재 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <ApprovalDetailModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          itemData={modalState.selectedItem}
          onClose={handleModalClose}
          onSave={handleApprovalSave}
          onUpdate={handleApprovalUpdate}
          loading={loading}
        />
      </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ApprovalBox;