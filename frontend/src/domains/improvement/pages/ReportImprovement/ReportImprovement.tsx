// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReportImprovement.module.scss';

// Types
import type {
  ReportImprovement,
  ReportImprovementFilters,
  ReportImprovementFormData,
  ReportImprovementModalState,
  ReportImprovementPagination,
  ReportImprovementStatus,
  HACKER_LAB_OPTIONS,
  INSPECTION_NAME_OPTIONS,
  STATUS_OPTIONS
} from './types/reportImprovement.types';

// Shared Components
import { BranchLookupModal, type Branch } from '@/shared/components/organisms/BranchLookupModal';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// ReportImprovement specific components
const reportImprovementColumns = [
  { field: 'sequence', headerName: '순번', width: 80, sortable: true },
  { field: 'department', headerName: '부서', width: 150, sortable: true },
  { field: 'inspectionName', headerName: '점검명', width: 200, sortable: true, flex: 1 },
  { field: 'requestDate', headerName: '개선요청일자', width: 130, sortable: true },
  { field: 'requester', headerName: '개선요청자', width: 120, sortable: true },
  { field: 'status', headerName: '진행상태', width: 100, sortable: true },
  { field: 'result', headerName: '개선결과', width: 150, sortable: true }
];

// Lazy-loaded components for performance optimization
const ReportImprovementDetailModal = React.lazy(() =>
  import('./components/ReportImprovementDetailModal').then(module => ({ default: module.default }))
);

interface ReportImprovementProps {
  className?: string;
}

const ReportImprovement: React.FC<ReportImprovementProps> = ({ className }) => {
  const { t } = useTranslation('improvement');

  // State Management
  const [reportImprovements, setReportImprovements] = useState<ReportImprovement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReportImprovements, setSelectedReportImprovements] = useState<ReportImprovement[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    plan: false,
    progress: false,
    verification: false
  });

  const [filters, setFilters] = useState<ReportImprovementFilters>({
    inspectionName: '',
    branchCode: '',
    requestDateFrom: '',
    requestDateTo: '',
    status: ''
  });

  // 부서조회 모달 상태
  const [branchModalOpen, setBranchModalOpen] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [pagination, setPagination] = useState<ReportImprovementPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ReportImprovementModalState>({
    addModal: false,
    detailModal: false,
    planModal: false,
    progressModal: false,
    verificationModal: false,
    effectivenessModal: false,
    selectedItem: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ReportImprovementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddReportImprovement = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedItem: null
    }));
    toast.info('새 보고서 개선이행을 등록해주세요.', { autoClose: 2000 });
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

  const handleDeleteReportImprovements = useCallback(async () => {
    if (selectedReportImprovements.length === 0) {
      toast.warning('삭제할 보고서 개선이행을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedReportImprovements.length}개의 보고서 개선이행을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedReportImprovements.length}개 보고서 개선이행을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setReportImprovements(prev =>
        prev.filter(item => !selectedReportImprovements.some(selected => selected.id === item.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedReportImprovements.length
      }));
      setSelectedReportImprovements([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedReportImprovements.length}개 보고서 개선이행이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '보고서 개선이행 삭제에 실패했습니다.');
      console.error('보고서 개선이행 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedReportImprovements]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      planModal: false,
      progressModal: false,
      verificationModal: false,
      effectivenessModal: false,
      selectedItem: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleReportImprovementSave = useCallback(async (formData: ReportImprovementFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 개선이행 생성
      // const response = await reportImprovementApi.create(formData);

      // 임시로 새 보고서 개선이행 객체 생성
      const newReportImprovement: ReportImprovement = {
        id: Date.now().toString(),
        sequence: reportImprovements.length + 1,
        department: formData.department,
        departmentCode: formData.departmentCode,
        inspectionName: formData.inspectionName,
        inspectionRound: formData.inspectionRound,
        requestDate: formData.requestDate,
        requester: formData.requester,
        requesterPosition: formData.requesterPosition,
        status: 'REQUESTED' as ReportImprovementStatus,
        reportId: formData.reportId,
        reportTitle: formData.reportTitle,
        inadequateContent: formData.inadequateContent,
        improvementPlan: formData.improvementPlan,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignee: formData.assignee,
        assigneePosition: formData.assigneePosition,
        attachments: formData.attachments,
        evidenceFiles: formData.evidenceFiles
      };

      setReportImprovements(prev => [newReportImprovement, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('보고서 개선이행이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('보고서 개선이행 등록 실패:', error);
      toast.error('보고서 개선이행 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [reportImprovements.length, handleModalClose]);

  const handleReportImprovementUpdate = useCallback(async (id: string, formData: ReportImprovementFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 개선이행 수정
      // const response = await reportImprovementApi.update(id, formData);

      // 임시로 기존 보고서 개선이행 업데이트
      setReportImprovements(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                department: formData.department,
                departmentCode: formData.departmentCode,
                inspectionName: formData.inspectionName,
                inspectionRound: formData.inspectionRound,
                requestDate: formData.requestDate,
                requester: formData.requester,
                requesterPosition: formData.requesterPosition,
                reportId: formData.reportId,
                reportTitle: formData.reportTitle,
                inadequateContent: formData.inadequateContent,
                improvementPlan: formData.improvementPlan,
                priority: formData.priority,
                dueDate: formData.dueDate,
                assignee: formData.assignee,
                assigneePosition: formData.assigneePosition,
                attachments: formData.attachments,
                evidenceFiles: formData.evidenceFiles
              }
            : item
        )
      );

      handleModalClose();
      toast.success('보고서 개선이행이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('보고서 개선이행 수정 실패:', error);
      toast.error('보고서 개선이행 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleReportImprovementDetail = useCallback((reportImprovement: ReportImprovement) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedItem: reportImprovement
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('보고서 개선이행 정보를 검색 중입니다...');

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
      inspectionName: '',
      branchCode: '',
      requestDateFrom: '',
      requestDateTo: '',
      status: ''
    });
    setSelectedBranch(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // 부서조회 핸들러
  const handleBranchSearchClick = useCallback(() => {
    setBranchModalOpen(true);
  }, []);

  const handleBranchModalClose = useCallback(() => {
    setBranchModalOpen(false);
  }, []);

  const handleBranchSelect = useCallback((selected: Branch | Branch[]) => {
    const branches = Array.isArray(selected) ? selected : [selected];
    if (branches.length > 0) {
      const branch = branches[0];
      setSelectedBranch(branch);
      setFilters(prev => ({
        ...prev,
        branchCode: branch.branchCode
      }));
      toast.success(`부서이 선택되었습니다: ${branch.branchName}`);
    }
    setBranchModalOpen(false);
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((reportImprovement: ReportImprovement) => {
    console.log('행 클릭:', reportImprovement);
  }, []);

  const handleRowDoubleClick = useCallback((reportImprovement: ReportImprovement) => {
    handleReportImprovementDetail(reportImprovement);
  }, [handleReportImprovementDetail]);

  const handleSelectionChange = useCallback((selected: ReportImprovement[]) => {
    setSelectedReportImprovements(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const requestedItems = reportImprovements.filter(item => item.status === 'REQUESTED').length;
    const inProgressItems = reportImprovements.filter(item => item.status === 'IN_PROGRESS').length;
    const completedItems = reportImprovements.filter(item => item.status === 'COMPLETED').length;

    return {
      total,
      requestedItems,
      inProgressItems,
      completedItems
    };
  }, [pagination.total, reportImprovements]);

  // Filtered report improvements for display (성능 최적화)
  const displayReportImprovements = useMemo(() => {
    return reportImprovements; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [reportImprovements]);

  // BaseSearchFilter용 필드 정의 (한줄로 배치: 3+2+2+2+3=12)
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'inspectionName',
      type: 'select',
      label: '점검명',
      options: [
        { value: '', label: '전체' },
        { value: 'Q1_2024', label: '2024년 1분기 점검' },
        { value: 'Q2_2024', label: '2024년 2분기 점검' },
        { value: 'Q3_2024', label: '2024년 3분기 점검' },
        { value: 'Q4_2024', label: '2024년 4분기 점검' },
        { value: 'ANNUAL_2024', label: '2024년 연간 점검' },
        { value: 'SPECIAL_AUDIT', label: '특별점검' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchCode',
      type: 'text',
      label: '부서코드',
      placeholder: '부서코드를 입력하세요',
      endAdornment: {
        type: 'icon',
        icon: 'Search',
        onClick: handleBranchSearchClick,
        tooltip: '부서 조회'
      },
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
      key: 'status',
      type: 'select',
      label: '진행상태',
      options: [
        { value: '', label: '전체' },
        { value: 'IDENTIFIED', label: '식별' },
        { value: 'REQUESTED', label: '요청' },
        { value: 'PLANNING', label: '계획수립' },
        { value: 'APPROVED', label: '승인완료' },
        { value: 'IN_PROGRESS', label: '진행중' },
        { value: 'COMPLETED', label: '완료' },
        { value: 'VERIFIED', label: '검증완료' },
        { value: 'CLOSED', label: '종료' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
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
      onClick: handleAddReportImprovement
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteReportImprovements,
      disabled: selectedReportImprovements.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddReportImprovement, handleDeleteReportImprovements, selectedReportImprovements.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '진행중',
      value: statistics.inProgressItems,
      color: 'info',
      icon: <AssignmentIcon />
    },
    {
      label: '완료',
      value: statistics.completedItems,
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
    const mockReportImprovements: ReportImprovement[] = [
      {
        id: '1',
        sequence: 1,
        department: '경영진단본부',
        departmentCode: 'MGT001',
        inspectionName: '2024년 1분기 점검',
        inspectionRound: '1회차',
        requestDate: '2024-04-15',
        requester: '김철수',
        requesterPosition: '본부장',
        status: 'COMPLETED',
        result: '보고서 품질 향상 완료',
        reportTitle: '내부통제 점검 보고서',
        inadequateContent: '리스크 평가 기준 미흡',
        improvementPlan: '리스크 평가 기준 재정립 및 교육 실시'
      },
      {
        id: '2',
        sequence: 2,
        department: '총합기획부',
        departmentCode: 'PLN001',
        inspectionName: '2024년 2분기 점검',
        inspectionRound: '1회차',
        requestDate: '2024-07-10',
        requester: '박영희',
        requesterPosition: '부장',
        status: 'IN_PROGRESS',
        reportTitle: '정책수립 프로세스 점검',
        inadequateContent: '정책 수립 절차 불명확',
        improvementPlan: '정책 수립 매뉴얼 개선'
      },
      {
        id: '3',
        sequence: 3,
        department: '영업본부',
        departmentCode: 'SAL001',
        inspectionName: '2024년 3분기 점검',
        inspectionRound: '1회차',
        requestDate: '2024-10-05',
        requester: '이민수',
        requesterPosition: '본부장',
        status: 'REQUESTED',
        reportTitle: '영업 성과 관리 점검',
        inadequateContent: '성과 지표 측정 방식 부적절',
        improvementPlan: '성과 측정 시스템 개선'
      },
      {
        id: '4',
        sequence: 4,
        department: '인사부',
        departmentCode: 'HR001',
        inspectionName: '2024년 연간 점검',
        inspectionRound: '1회차',
        requestDate: '2024-11-20',
        requester: '정수진',
        requesterPosition: '부장',
        status: 'PLANNING',
        reportTitle: '인사관리 시스템 점검',
        inadequateContent: '성과평가 기준 모호',
        improvementPlan: '성과평가 기준 명확화'
      },
      {
        id: '5',
        sequence: 5,
        department: '재무부',
        departmentCode: 'FIN001',
        inspectionName: '특별점검',
        inspectionRound: '1회차',
        requestDate: '2024-12-01',
        requester: '한상훈',
        requesterPosition: '부장',
        status: 'APPROVED',
        reportTitle: '예산 관리 특별 점검',
        inadequateContent: '예산 집행 모니터링 부족',
        improvementPlan: '예산 모니터링 시스템 구축'
      }
    ];

    setReportImprovements(mockReportImprovements);
    setPagination(prev => ({
      ...prev,
      total: mockReportImprovements.length,
      totalPages: Math.ceil(mockReportImprovements.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="ReportImprovement" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('reportImprovement.management.title', '이행점검 보고서 개선이행')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('reportImprovement.management.description', '이행점검 보고서의 부적정 판정 건에 대한 개선조치를 관리합니다')}
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
                  <div className={styles.statLabel}>총 보고서 개선이행</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AssignmentIcon />
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ReportImprovementFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 보고서 개선이행 수"
            selectedCount={selectedReportImprovements.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayReportImprovements}
            columns={reportImprovementColumns}
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

        {/* 보고서 개선이행 등록/상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ReportImprovementDetailModal
            open={modalState.addModal || modalState.detailModal}
            mode={modalState.addModal ? 'create' : 'detail'}
            itemData={modalState.selectedItem}
            onClose={handleModalClose}
            onSave={handleReportImprovementSave}
            onUpdate={handleReportImprovementUpdate}
            loading={loading}
          />
        </React.Suspense>
      </div>

      {/* 부서조회 팝업 */}
      <BranchLookupModal
        open={branchModalOpen}
        title="부서조회팝업"
        multiple={false}
        onClose={handleBranchModalClose}
        onSelect={handleBranchSelect}
        loading={false}
      />
    </React.Profiler>
  );
};

export default ReportImprovement;