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
  ImprovementActionFormData,
  Report,
  ReportFormData,
  ReportListFilters,
  ReportListModalState,
  ReportListPagination
} from './types/reportList.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { OrganizationSearchModal, type Organization } from '@/shared/components/organisms/OrganizationSearchModal';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// Report specific components
import { reportColumns } from './components/ReportDataGrid/reportColumns';

// Lazy-loaded components for performance optimization
const ReportFormModal = React.lazy(() =>
  import('./components/ReportFormModal/ReportFormModal').then(module => ({ default: module.default }))
);

const ImprovementActionModal = React.lazy(() =>
  import('./components/ImprovementActionModal/ImprovementActionModal').then(module => ({ default: module.default }))
);

const ExecutiveReportModal = React.lazy(() =>
  import('./components/ExecutiveReportModal/ExecutiveReportModal').then(module => ({ default: module.default }))
);

const CeoReportModal = React.lazy(() =>
  import('./components/CeoReportModal/CeoReportModal').then(module => ({ default: module.default }))
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
    ledgerOrderId: '',
    inspectionName: '',
    orgCode: ''
  });

  // 부서 조회 팝업 상태
  const [isOrgSearchModalOpen, setIsOrgSearchModalOpen] = useState(false);

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

  // 보고서 조회 모달 상태
  const [executiveReportModalOpen, setExecutiveReportModalOpen] = useState(false);
  const [ceoReportModalOpen, setCeoReportModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);

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

  const handleDeleteReports = useCallback(async () => {
    if (selectedReports.length === 0) {
      toast.warning('삭제할 보고서를 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedReports.length}건의 보고서를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, delete: true }));

      // TODO: API 호출로 실제 삭제
      // await deleteReports(selectedReports.map(r => r.id));

      // 임시로 로컬 상태에서 제거
      const selectedIds = selectedReports.map(r => r.id);
      setReports(prev => prev.filter(report => !selectedIds.includes(report.id)));
      setPagination(prev => ({ ...prev, total: prev.total - selectedReports.length }));
      setSelectedReports([]);

      toast.success(`${selectedReports.length}건의 보고서가 삭제되었습니다.`);
    } catch (error) {
      console.error('보고서 삭제 실패:', error);
      toast.error('보고서 삭제에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedReports]);

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
      ledgerOrderId: '',
      inspectionName: '',
      orgCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // 부서 조회 팝업 핸들러
  const handleOrgSearchOpen = useCallback(() => {
    setIsOrgSearchModalOpen(true);
  }, []);

  const handleOrgSearchClose = useCallback(() => {
    setIsOrgSearchModalOpen(false);
  }, []);

  const handleOrganizationSelect = useCallback((organization: Organization) => {
    setFilters(prev => ({
      ...prev,
      orgCode: organization.orgCode || ''
    }));
    setIsOrgSearchModalOpen(false);
    toast.success(`부서코드 "${organization.orgCode}" 선택되었습니다.`);
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((report: Report) => {
    console.log('행 클릭:', report);

    // 보고서 구분에 따라 해당 모달 표시
    if (report.category === '임원') {
      setSelectedReportId(report.id);
      setExecutiveReportModalOpen(true);
    } else if (report.category === 'CEO') {
      setSelectedReportId(report.id);
      setCeoReportModalOpen(true);
    }
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
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      placeholder: '책무이행차수를 선택하세요',
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId}
          onChange={(newValue) => handleFiltersChange({ ledgerOrderId: newValue || '' })}
          required
        />
      ),
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'inspectionName',
      type: 'text',
      label: '점검명',
      placeholder: '점검명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'orgCode',
      type: 'text',
      label: '부서코드',
      placeholder: '부서코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrgSearchOpen,
        tooltip: '부서조회'
      }
    }
  ], [filters.ledgerOrderId, handleFiltersChange, handleOrgSearchOpen]);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    // {
    //   key: 'improvement',
    //   type: 'custom',
    //   label: '개선조치등록',
    //   variant: 'contained',
    //   color: 'primary',
    //   onClick: handleImprovementAction,
    //   disabled: selectedReports.length === 0 || loadingStates.improvement,
    //   loading: loadingStates.improvement
    // },
    // {
    //   key: 'ceoReport',
    //   type: 'custom',
    //   label: 'CEO 보고서 작성',
    //   variant: 'contained',
    //   color: 'secondary',
    //   onClick: handleCeoReport,
    //   disabled: loadingStates.ceoReport,
    //   loading: loadingStates.ceoReport
    // },
    {
      key: 'newReport',
      type: 'custom',
      label: '신규 보고서 작성',
      variant: 'contained',
      color: 'success',
      onClick: handleNewReport,
      disabled: loadingStates.newReport,
      loading: loadingStates.newReport
    },
    {
      key: 'delete',
      type: 'custom',
      label: '삭제',
      variant: 'contained',
      color: 'error',
      onClick: handleDeleteReports,
      disabled: selectedReports.length === 0 || loadingStates.delete,
      loading: loadingStates.delete
    }
  ], [handleImprovementAction, handleCeoReport, handleNewReport, handleDeleteReports, selectedReports.length, loadingStates]);

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

  // 성능 모니터링 함수 - 콘솔 로그 제거됨
  // 필요시 React DevTools Profiler 사용 권장
  const onRenderProfiler = useCallback(() => {
    // 성능 프로파일링 비활성화
  }, []);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockReports: Report[] = [
      {
        id: '1',
        sequence: 1,
        department: '준법지원본부',
        category: '임원',
        inspectionName: '2025년 하반기 정기점검',
        inspectionPeriod: '2025.11.21~2025.12.20',
        reportNumber: '20250001A0001R001',
        status: 'APPROVED' as const,
        author: '홍길동',
        createdAt: '2025-11-24',
        approver: '김대표',
        approvedAt: '2025-11-24',
        reviewContent: '정기 이행점검 완료',
        result: '적정',
        improvementAction: '지속 모니터링'
      },
      {
        id: '2',
        sequence: 2,
        department: '준법지원본부',
        category: 'CEO',
        inspectionName: '2025년 하반기 정기점검',
        inspectionPeriod: '2025.11.21~2025.12.20',
        reportNumber: '20250001A0001R002',
        status: 'SUBMITTED' as const,
        author: '김철수',
        createdAt: '2025-11-24',
        approver: '김대표',
        approvedAt: '2025-11-24',
        reviewContent: 'CEO 지시사항 점검',
        result: '개선필요',
        improvementAction: '지속 모니터링'
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
          suppressHorizontalScroll={false}
          suppressColumnVirtualisation={false}
          />
        </div>

        {/* 보고서 작성 모달 - BaseModalWrapper 적용 */}
        <BaseModalWrapper
          isOpen={modalState.ceoReportModal || modalState.newReportModal || modalState.detailModal}
          onClose={handleModalClose}
          ariaLabel="보고서 작성 모달"
          fallbackComponent={<LoadingSpinner text="보고서 모달을 불러오는 중..." />}
        >
          <ReportFormModal
            open={modalState.ceoReportModal || modalState.newReportModal || modalState.detailModal}
            onClose={handleModalClose}
            reportType={modalState.ceoReportModal ? 'CEO' : modalState.newReportModal ? 'DEPARTMENT' : 'EXECUTIVE'}
            reportData={modalState.selectedReport}
            onSubmit={handleReportSave}
            title={modalState.ceoReportModal ? 'CEO 보고서 작성' : modalState.newReportModal ? '신규 보고서 작성' : '보고서 상세'}
          />
        </BaseModalWrapper>

        {/* 개선조치 등록 모달 - BaseModalWrapper 적용 */}
        <BaseModalWrapper
          isOpen={modalState.improvementModal}
          onClose={handleModalClose}
          ariaLabel="개선조치 등록 모달"
          fallbackComponent={<LoadingSpinner text="개선조치 모달을 불러오는 중..." />}
        >
          <ImprovementActionModal
            open={modalState.improvementModal}
            onClose={handleModalClose}
            reportData={modalState.selectedReport}
            onSubmit={handleImprovementSave}
          />
        </BaseModalWrapper>

        {/* 부서 조회 팝업 */}
        <OrganizationSearchModal
          open={isOrgSearchModalOpen}
          onClose={handleOrgSearchClose}
          onSelect={handleOrganizationSelect}
        />

        {/* 임원 보고서 조회 모달 */}
        <React.Suspense fallback={<LoadingSpinner size="small" />}>
          {executiveReportModalOpen && (
            <ExecutiveReportModal
              open={executiveReportModalOpen}
              onClose={() => {
                setExecutiveReportModalOpen(false);
                setSelectedReportId(undefined);
              }}
              reportId={selectedReportId}
            />
          )}
        </React.Suspense>

        {/* CEO 보고서 조회 모달 */}
        <React.Suspense fallback={<LoadingSpinner size="small" />}>
          {ceoReportModalOpen && (
            <CeoReportModal
              open={ceoReportModalOpen}
              onClose={() => {
                setCeoReportModalOpen(false);
                setSelectedReportId(undefined);
              }}
              reportId={selectedReportId}
            />
          )}
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ReportList;
