/**
 * 제출보고서목록 관리 페이지
 * submit_reports 테이블 기반
 * PositionMgmt.tsx 표준 템플릿 준수
 * - 실제 API 연동 CRUD 구현
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SubmitReportList.module.scss';

// Types
import type {
  SubmitReport,
  SubmitReportListFilters,
  SubmitReportListModalState,
  SubmitReportListPagination
} from './types/submitReportList.types';

// Shared Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { SubmittingAgencyComboBox } from '@/domains/submitreport/components/molecules/SubmittingAgencyComboBox';
import { ReportTypeComboBox } from '@/domains/submitreport/components/molecules/ReportTypeComboBox';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// SubmitReport specific components
import { createSubmitReportColumns } from './components/SubmitReportDataGrid/submitReportColumns';
import SubmitReportFormModal from './components/SubmitReportFormModal';
import type { SubmitReportFormData } from './types/submitReportList.types';

// 공통코드 Hook
import { useCommonCode } from '@/shared/hooks/useCommonCode';

// API Hooks
import {
  useSubmitReports,
  useCreateSubmitReport,
  useUpdateSubmitReport,
  useDeleteSubmitReports,
} from '@/domains/submitreport/hooks/useSubmitReport';
import type { SubmitReportSearchParams, SubmitReportRequest } from '@/domains/submitreport/api/submitReportApi';

// 첨부파일 API
import { uploadAttachment } from '@/shared/api/attachmentApi';

interface SubmitReportListProps {
  className?: string;
}

/**
 * 제출보고서목록 관리 페이지 컴포넌트
 * - 제출보고서 CRUD 기능 제공
 * - API 연동 완료
 */
const SubmitReportList: React.FC<SubmitReportListProps> = ({ className }) => {
  const { t } = useTranslation('submitreport');

  // ===============================
  // 공통코드 Hook (코드값 → 코드명 변환용)
  // ===============================
  const { getCodeName: getSubmittingAgencyName } = useCommonCode('SUB_AGENCY_CD');
  const { getCodeName: getReportTypeName } = useCommonCode('SUB_REPORT_TYCD');

  /**
   * Grid 컬럼 정의 (공통코드 코드명 변환 적용)
   */
  const submitReportColumns = useMemo(() => {
    return createSubmitReportColumns({
      getSubmittingAgencyName,
      getReportTypeName,
    });
  }, [getSubmittingAgencyName, getReportTypeName]);

  // ===============================
  // State Management
  // ===============================
  const [selectedReports, setSelectedReports] = useState<SubmitReport[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });

  // 검색 필터 상태
  const [filters, setFilters] = useState<SubmitReportListFilters>({
    ledgerOrderId: '',
    reportTypeCd: '',
    submittingAgencyCd: '',
    submissionDateFrom: '',
    submissionDateTo: ''
  });

  // 검색 실행용 파라미터 (검색 버튼 클릭 시에만 업데이트)
  const [searchParams, setSearchParams] = useState<SubmitReportSearchParams>({});

  const [pagination, setPagination] = useState<SubmitReportListPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<SubmitReportListModalState>({
    detailModal: false,
    newReportModal: false,
    editModal: false,
    selectedReport: null
  });

  // ===============================
  // API Hooks
  // ===============================

  /**
   * 제출보고서 목록 조회 (React Query)
   */
  const {
    data: reportsData,
    isLoading: isLoadingReports,
    refetch: refetchReports,
  } = useSubmitReports(searchParams);

  /**
   * 제출보고서 생성 mutation
   */
  const createMutation = useCreateSubmitReport();

  /**
   * 제출보고서 수정 mutation
   */
  const updateMutation = useUpdateSubmitReport();

  /**
   * 제출보고서 일괄 삭제 mutation
   */
  const deleteMutation = useDeleteSubmitReports();

  // ===============================
  // 데이터 변환 및 표시
  // ===============================

  /**
   * API 응답을 UI용 SubmitReport 타입으로 변환
   */
  const displayReports = useMemo<SubmitReport[]>(() => {
    if (!reportsData) return [];

    return reportsData.map((report, index) => ({
      reportId: String(report.reportId),
      sequence: index + 1,
      ledgerOrderId: report.ledgerOrderId,
      submittingAgencyCd: report.submittingAgencyCd,
      submittingAgencyName: report.submittingAgencyName || '',
      reportTypeCd: report.reportTypeCd,
      reportTypeName: report.reportTypeName || '',
      subReportTitle: report.subReportTitle || '',
      targetExecutiveEmpNo: report.targetExecutiveEmpNo || '',
      targetExecutiveName: report.targetExecutiveName || '',
      positionId: report.positionId ? String(report.positionId) : '',
      positionName: report.positionName || '',
      submissionDate: report.submissionDate,
      remarks: report.remarks || '',
      attachmentCount: report.attachmentCount || 0,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      createdBy: report.createdBy,
      updatedBy: report.updatedBy,
      version: 1
    }));
  }, [reportsData]);

  // 로딩 상태 통합
  const loading = isLoadingReports || loadingStates.search;

  // ===============================
  // Event Handlers
  // ===============================

  /**
   * 필터 값 변경 핸들러
   */
  const handleFiltersChange = useCallback((newFilters: Partial<SubmitReportListFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 신규 등록 모달 열기
   */
  const handleNewReport = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      newReportModal: true,
      selectedReport: null
    }));
    toast.info('신규 제출보고서를 작성해주세요.', { autoClose: 2000 });
  }, []);

  /**
   * 모달 닫기
   */
  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      detailModal: false,
      newReportModal: false,
      editModal: false,
      selectedReport: null
    }));
  }, []);

  /**
   * 제출보고서 삭제 핸들러
   */
  const handleDeleteReports = useCallback(async () => {
    if (selectedReports.length === 0) {
      toast.warning('삭제할 제출보고서를 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedReports.length}건의 제출보고서를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, delete: true }));

      // 선택된 보고서 ID 배열 생성
      const reportIds = selectedReports.map(r => Number(r.reportId));

      // API 호출로 일괄 삭제
      await deleteMutation.mutateAsync(reportIds);

      setSelectedReports([]);
      toast.success(`${selectedReports.length}건의 제출보고서가 삭제되었습니다.`);
    } catch (error) {
      console.error('제출보고서 삭제 실패:', error);
      toast.error('제출보고서 삭제에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedReports, deleteMutation]);

  /**
   * 보고서 상세 보기
   */
  const handleReportDetail = useCallback((report: SubmitReport) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedReport: report
    }));
  }, []);

  /**
   * 제출보고서 등록 핸들러
   * - 보고서 생성 후 첨부파일 업로드 처리
   */
  const handleSave = useCallback(async (formData: SubmitReportFormData) => {
    try {
      // API 요청 DTO 생성
      const request: SubmitReportRequest = {
        ledgerOrderId: formData.ledgerOrderId,
        submittingAgencyCd: formData.submittingAgencyCd,
        reportTypeCd: formData.reportTypeCd,
        subReportTitle: formData.subReportTitle,
        targetExecutiveEmpNo: formData.targetExecutiveEmpNo,
        targetExecutiveName: '', // TODO: 임원명 조회
        positionId: formData.positionId ? Number(formData.positionId) : undefined,
        positionName: '', // TODO: 직책명 조회
        submissionDate: formData.submissionDate,
        remarks: formData.remarks,
      };

      // 1. 제출보고서 생성 (reportId 반환)
      const createdReport = await createMutation.mutateAsync(request);
      const newReportId = String(createdReport.reportId);
      console.log('[SubmitReportList] 제출보고서 생성 완료:', newReportId);

      // 2. 첨부파일 업로드 (파일이 있을 경우에만)
      if (formData.attachments && formData.attachments.length > 0) {
        console.log('[SubmitReportList] 첨부파일 업로드 시작:', formData.attachments.length, '개');
        for (const file of formData.attachments) {
          try {
            await uploadAttachment({
              file,
              entityType: 'submit_reports',
              entityId: newReportId,
              fileCategory: 'REPORT'
            });
            console.log('[SubmitReportList] 파일 업로드 성공:', file.name);
          } catch (uploadError) {
            console.error('[SubmitReportList] 파일 업로드 실패:', file.name, uploadError);
            // 파일 업로드 실패해도 보고서는 이미 생성됨 - 경고만 표시
            toast.warning(`파일 '${file.name}' 업로드에 실패했습니다.`);
          }
        }
      }

      toast.success('제출보고서가 등록되었습니다.');
      handleModalClose();
    } catch (error) {
      console.error('제출보고서 등록 실패:', error);
      toast.error('제출보고서 등록에 실패했습니다.');
      throw error;
    }
  }, [createMutation, handleModalClose]);

  /**
   * 제출보고서 수정 핸들러
   */
  const handleUpdate = useCallback(async (id: string, formData: SubmitReportFormData) => {
    try {
      // API 요청 DTO 생성
      const request: SubmitReportRequest = {
        ledgerOrderId: formData.ledgerOrderId,
        submittingAgencyCd: formData.submittingAgencyCd,
        reportTypeCd: formData.reportTypeCd,
        subReportTitle: formData.subReportTitle,
        targetExecutiveEmpNo: formData.targetExecutiveEmpNo,
        targetExecutiveName: '', // TODO: 임원명 조회
        positionId: formData.positionId ? Number(formData.positionId) : undefined,
        positionName: '', // TODO: 직책명 조회
        submissionDate: formData.submissionDate,
        remarks: formData.remarks,
      };

      await updateMutation.mutateAsync({ id: Number(id), request });
      toast.success('제출보고서가 수정되었습니다.');
      handleModalClose();
    } catch (error) {
      console.error('제출보고서 수정 실패:', error);
      toast.error('제출보고서 수정에 실패했습니다.');
      throw error;
    }
  }, [updateMutation, handleModalClose]);

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 검색 토스트 표시
    const loadingToastId = toast.loading('제출보고서 정보를 검색 중입니다...');

    try {
      // 검색 파라미터 업데이트 (빈 값 제외)
      const newSearchParams: SubmitReportSearchParams = {};
      if (filters.ledgerOrderId) newSearchParams.ledgerOrderId = filters.ledgerOrderId;
      if (filters.submittingAgencyCd) newSearchParams.submittingAgencyCd = filters.submittingAgencyCd;
      if (filters.reportTypeCd) newSearchParams.reportTypeCd = filters.reportTypeCd;
      if (filters.submissionDateFrom) newSearchParams.submissionDateFrom = filters.submissionDateFrom;
      if (filters.submissionDateTo) newSearchParams.submissionDateTo = filters.submissionDateTo;

      setSearchParams(newSearchParams);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, {
        type: 'success',
        render: '검색이 완료되었습니다.',
        isLoading: false,
        autoClose: 2000
      });
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, {
        type: 'error',
        render: '검색에 실패했습니다.',
        isLoading: false,
        autoClose: 3000
      });
      console.error('검색 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  /**
   * 필터 초기화 핸들러
   */
  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      reportTypeCd: '',
      submittingAgencyCd: '',
      submissionDateFrom: '',
      submissionDateTo: ''
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * 데이터 새로고침 핸들러
   */
  const handleRefresh = useCallback(() => {
    refetchReports();
  }, [refetchReports]);

  // ===============================
  // Grid Event Handlers
  // ===============================

  const handleRowClick = useCallback((report: SubmitReport) => {
    console.log('행 클릭:', report);
  }, []);

  const handleRowDoubleClick = useCallback((report: SubmitReport) => {
    handleReportDetail(report);
  }, [handleReportDetail]);

  const handleSelectionChange = useCallback((selected: SubmitReport[]) => {
    setSelectedReports(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // ===============================
  // Memoized Values
  // ===============================

  /**
   * 통계 정보 계산
   */
  const statistics = useMemo(() => {
    const total = displayReports.length;
    return { total };
  }, [displayReports.length]);

  /**
   * 페이지네이션 업데이트
   */
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: displayReports.length,
      totalPages: Math.ceil(displayReports.length / prev.size)
    }));
  }, [displayReports.length]);

  /**
   * BaseSearchFilter용 필드 정의
   * - 제출기관: SUB_AGENCY_CD 공통코드 콤보박스
   * - 제출보고서구분: SUB_REPORT_TYCD 공통코드 콤보박스
   */
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 2 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId}
          onChange={(value: string | null) => handleFiltersChange({ ledgerOrderId: value || '' })}
          placeholder="선택"
        />
      )
    },
    {
      key: 'submittingAgencyCd',
      type: 'custom',
      label: '제출기관',
      gridSize: { xs: 12, sm: 6, md: 2 },
      customComponent: (
        <SubmittingAgencyComboBox
          value={filters.submittingAgencyCd}
          onChange={(value: string | null) => handleFiltersChange({ submittingAgencyCd: value || '' })}
          placeholder="제출기관 선택"
        />
      )
    },
    {
      key: 'reportTypeCd',
      type: 'custom',
      label: '제출보고서구분',
      gridSize: { xs: 12, sm: 6, md: 2 },
      customComponent: (
        <ReportTypeComboBox
          value={filters.reportTypeCd}
          onChange={(value: string | null) => handleFiltersChange({ reportTypeCd: value || '' })}
          placeholder="제출보고서구분 선택"
        />
      )
    },
    {
      key: 'submissionDateFrom',
      type: 'date',
      label: '제출기간(시작)',
      placeholder: '시작일을 선택하세요',
      gridSize: { xs: 12, sm: 6, md: 1.5 }
    },
    {
      key: 'submissionDateTo',
      type: 'date',
      label: '제출기간(종료)',
      placeholder: '종료일을 선택하세요',
      gridSize: { xs: 12, sm: 6, md: 1.5 }
    }
  ], [filters.ledgerOrderId, filters.submittingAgencyCd, filters.reportTypeCd, handleFiltersChange]);

  /**
   * 엑셀 다운로드 핸들러
   */
  const handleExcelDownload = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, excel: true }));

      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('엑셀 다운로드가 완료되었습니다.');
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      toast.error('엑셀 다운로드에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  /**
   * BaseActionBar용 액션 버튼 정의
   */
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      type: 'custom',
      label: '엑셀다운로드',
      variant: 'contained',
      color: 'primary',
      onClick: handleExcelDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    },
    {
      key: 'register',
      type: 'custom',
      label: '등록',
      variant: 'contained',
      color: 'success',
      onClick: handleNewReport,
      disabled: loading
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
  ], [handleExcelDownload, handleNewReport, handleDeleteReports, selectedReports.length, loadingStates, loading]);

  /**
   * BaseActionBar용 상태 정보 정의
   */
  const statusInfo = useMemo<StatusInfo[]>(() => [], []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <DashboardIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('submitReportList.title', '제출보고서목록 관리')}
              </h1>
              <p className={styles.pageDescription}>
                {t('submitReportList.description', '금융감독원 등 정부기관에 제출하는 각종 보고서를 관리합니다')}
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
                <div className={styles.statLabel}>총 제출보고서</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AssignmentIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{selectedReports.length}</div>
                <div className={styles.statLabel}>선택됨</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 공통 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<SubmitReportListFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 제출보고서 수"
          selectedCount={selectedReports.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayReports}
          columns={submitReportColumns}
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

      {/* 제출보고서 등록 모달 */}
      <SubmitReportFormModal
        open={modalState.newReportModal}
        mode="create"
        report={null}
        onClose={handleModalClose}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />

      {/* 제출보고서 상세 모달 */}
      <SubmitReportFormModal
        open={modalState.detailModal}
        mode="detail"
        report={modalState.selectedReport}
        onClose={handleModalClose}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default SubmitReportList;
