// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReportList.module.scss';

// Types
import type {
  Report,
  ReportListFilters,
  ReportFormData,
  ReportListModalState,
  ReportListPagination,
  ImprovementActionFormData
} from './types/reportList.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Report specific components
import { reportColumns } from './components/ReportDataGrid/reportColumns';

// Lazy-loaded components for performance optimization
const ReportFormModal = React.lazy(() =>
  import('./components/ReportFormModal').then(module => ({ default: module.default }))
);

const ImprovementActionModal = React.lazy(() =>
  import('./components/ImprovementActionModal').then(module => ({ default: module.default }))
);

interface ReportListProps {
  className?: string;
}

const ReportList: React.FC<ReportListProps> = ({ className }) => {
  const { t } = useTranslation('reports');

  // State Management
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    improvement: false,
    ceoReport: false,
    newReport: false,
    delete: false,
  });

  const [filters, setFilters] = useState<ReportListFilters>({
    inspectionYear: '',
    branchName: '',
    inspectionStatus: ''
  });

  const [pagination, setPagination] = useState<ReportListPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ReportListModalState>({
    ceoReportModal: false,
    newReportModal: false,
    improvementModal: false,
    detailModal: false,
    selectedReport: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ReportListFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleImprovementAction = useCallback(() => {
    if (selectedReports.length === 0) {
      toast.warning('개선조치를 등록할 보고서를 선택해주세요.');
      return;
    }
    setModalState(prev => ({
      ...prev,
      improvementModal: true,
      selectedReport: selectedReports[0]
    }));
    toast.info('개선조치를 등록해주세요.', { autoClose: 2000 });
  }, [selectedReports]);

  const handleCeoReport = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      ceoReportModal: true,
      selectedReport: null
    }));
    toast.info('CEO 보고서를 작성해주세요.', { autoClose: 2000 });
  }, []);

  const handleNewReport = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      newReportModal: true,
      selectedReport: null
    }));
    toast.info('신규 보고서를 작성해주세요.', { autoClose: 2000 });
  }, []);


  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      ceoReportModal: false,
      newReportModal: false,
      improvementModal: false,
      detailModal: false,
      selectedReport: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleReportSave = useCallback(async (formData: ReportFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 생성

      // 임시로 새 보고서 객체 생성
      const newReport: Report = {
        id: Date.now().toString(),
        sequence: reports.length + 1,
        department: formData.reportType === 'DEPARTMENT' ? '일반부서' : '본부부서',
        category: formData.reportType || 'DEPARTMENT',
        inspectionName: '신규점검',
        inspectionPeriod: formData.inspectionPeriod,
        reportNumber: `RPT-${Date.now()}`,
        status: 'DRAFT' as const,
        author: '현재사용자',
        createdAt: new Date().toISOString().split('T')[0],
        reviewContent: formData.reviewContent
      };

      setReports(prev => [newReport, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('보고서가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('보고서 등록 실패:', error);
      toast.error('보고서 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose, reports.length]);

  const handleImprovementSave = useCallback(async (formData: ImprovementActionFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 개선조치 등록

      // 임시로 보고서 상태 업데이트
      setReports(prev =>
        prev.map(report =>
          report.id === formData.reportId
            ? {
                ...report,
                improvementAction: formData.actionPlan,
                status: 'REVIEWING' as const
              }
            : report
        )
      );

      handleModalClose();
      toast.success('개선조치가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('개선조치 등록 실패:', error);
      toast.error('개선조치 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleReportDetail = useCallback((report: Report) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedReport: report
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('보고서 정보를 검색 중입니다...');

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
      inspectionYear: '',
      branchName: '',
      inspectionStatus: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((report: Report) => {
    console.log('행 클릭:', report);
  }, []);

  const handleRowDoubleClick = useCallback((report: Report) => {
    handleReportDetail(report);
  }, [handleReportDetail]);

  const handleSelectionChange = useCallback((selected: Report[]) => {
    setSelectedReports(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const draftReports = reports.filter(r => r.status === 'DRAFT').length;
    const submittedReports = reports.filter(r => r.status === 'SUBMITTED').length;
    const approvedReports = reports.filter(r => r.status === 'APPROVED').length;

    return {
      total,
      draftReports,
      submittedReports,
      approvedReports
    };
  }, [pagination.total, reports]);

  // Filtered reports for display (성능 최적화)
  const displayReports = useMemo(() => {
    return reports; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [reports]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'inspectionYear',
      type: 'select',
      label: '점검연도',
      options: [
        { value: '', label: '전체' },
        { value: '2024', label: '2024년' },
        { value: '2023', label: '2023년' },
        { value: '2022', label: '2022년' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchName',
      type: 'select',
      label: '부점명',
      options: [
        { value: '', label: '전체' },
        { value: '본점', label: '본점' },
        { value: '강남지점', label: '강남지점' },
        { value: '종로지점', label: '종로지점' },
        { value: '부산지점', label: '부산지점' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'inspectionStatus',
      type: 'select',
      label: '점검상태',
      options: [
        { value: '', label: '전체' },
        { value: 'DRAFT', label: '작성중' },
        { value: 'SUBMITTED', label: '제출완료' },
        { value: 'APPROVED', label: '승인완료' },
        { value: 'REJECTED', label: '반려' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'improvement',
      type: 'custom',
      label: '개선조치등록',
      variant: 'contained',
      color: 'primary',
      onClick: handleImprovementAction,
      disabled: selectedReports.length === 0 || loadingStates.improvement,
      loading: loadingStates.improvement
    },
    {
      key: 'ceoReport',
      type: 'custom',
      label: 'CEO 보고서 작성',
      variant: 'contained',
      color: 'secondary',
      onClick: handleCeoReport,
      disabled: loadingStates.ceoReport,
      loading: loadingStates.ceoReport
    },
    {
      key: 'newReport',
      type: 'custom',
      label: '신규 보고서 작성',
      variant: 'contained',
      color: 'success',
      onClick: handleNewReport,
      disabled: loadingStates.newReport,
      loading: loadingStates.newReport
    }
  ], [handleImprovementAction, handleCeoReport, handleNewReport, selectedReports.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '작성중',
      value: statistics.draftReports,
      color: 'warning',
      icon: <AssignmentIcon />
    },
    {
      label: '승인완료',
      value: statistics.approvedReports,
      color: 'success',
      icon: <AssignmentIcon />
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
      console.group(`🔍 ReportList Performance Profiler`);
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

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockReports: Report[] = [
      {
        id: '1',
        sequence: 1,
        department: '경영진단본부',
        category: 'EXECUTIVE',
        inspectionName: '2024년 1차 이행점검',
        inspectionPeriod: '2024.01.01~2024.03.31',
        reportNumber: 'RPT-2024-001',
        status: 'APPROVED' as const,
        author: '홍길동',
        createdAt: '2024-03-15',
        approver: '김대표',
        approvedAt: '2024-03-20',
        reviewContent: '정기 이행점검 완료',
        result: '적정',
        improvementAction: '지속 모니터링'
      },
      {
        id: '2',
        sequence: 2,
        department: 'CEO',
        category: 'CEO',
        inspectionName: 'CEO 특별점검',
        inspectionPeriod: '2024.02.01~2024.02.29',
        reportNumber: 'RPT-2024-002',
        status: 'SUBMITTED' as const,
        author: '김철수',
        createdAt: '2024-02-28',
        reviewContent: 'CEO 지시사항 점검',
        result: '개선필요'
      },
      {
        id: '3',
        sequence: 3,
        department: '영업본부',
        category: 'DEPARTMENT',
        inspectionName: '영업실적 점검',
        inspectionPeriod: '2024.01.15~2024.02.15',
        reportNumber: 'RPT-2024-003',
        status: 'DRAFT' as const,
        author: '박영희',
        createdAt: '2024-02-15',
        reviewContent: '영업목표 달성도 점검'
      }
    ];

    setReports(mockReports);
    setPagination(prev => ({
      ...prev,
      total: mockReports.length,
      totalPages: Math.ceil(mockReports.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="ReportList" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('reportList.title', '보고서목록 관리')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('reportList.description', '이행점검보고서를 체계적으로 관리합니다')}
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
                  <div className={styles.statLabel}>총 보고서</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AssignmentIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.draftReports}
                  </div>
                  <div className={styles.statLabel}>작성중</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AssignmentIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.approvedReports}</div>
                  <div className={styles.statLabel}>승인완료</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ReportListFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 보고서 수"
            selectedCount={selectedReports.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayReports}
            columns={reportColumns}
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

        {/* 보고서 작성 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ReportFormModal
            open={modalState.ceoReportModal || modalState.newReportModal || modalState.detailModal}
            onClose={handleModalClose}
            reportType={modalState.ceoReportModal ? 'CEO' : modalState.newReportModal ? 'DEPARTMENT' : 'EXECUTIVE'}
            reportData={modalState.selectedReport}
            onSubmit={handleReportSave}
            title={modalState.ceoReportModal ? 'CEO 보고서 작성' : modalState.newReportModal ? '신규 보고서 작성' : '보고서 상세'}
          />
        </React.Suspense>

        {/* 개선조치 등록 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ImprovementActionModal
            open={modalState.improvementModal}
            onClose={handleModalClose}
            reportData={modalState.selectedReport}
            onSubmit={handleImprovementSave}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ReportList;