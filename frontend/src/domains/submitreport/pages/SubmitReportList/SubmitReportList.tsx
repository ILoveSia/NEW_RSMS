/**
 * 제출보고서목록 관리 페이지
 * submit_reports 테이블 기반
 * PositionMgmt.tsx 표준 템플릿 준수
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
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
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// SubmitReport specific components
import { submitReportColumns } from './components/SubmitReportDataGrid/submitReportColumns';
import SubmitReportFormModal from './components/SubmitReportFormModal';
import type { SubmitReportFormData } from './types/submitReportList.types';

interface SubmitReportListProps {
  className?: string;
}

const SubmitReportList: React.FC<SubmitReportListProps> = ({ className }) => {
  const { t } = useTranslation('submitreport');

  // State Management
  const [reports, setReports] = useState<SubmitReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReports, setSelectedReports] = useState<SubmitReport[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });

  const [filters, setFilters] = useState<SubmitReportListFilters>({
    ledgerOrderId: '',
    reportTypeCd: '',
    submittingAgencyCd: '',
    submissionDateFrom: '',
    submissionDateTo: ''
  });

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

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<SubmitReportListFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleNewReport = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      newReportModal: true,
      selectedReport: null
    }));
    toast.info('신규 제출보고서를 작성해주세요.', { autoClose: 2000 });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      detailModal: false,
      newReportModal: false,
      editModal: false,
      selectedReport: null
    }));
  }, []);

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

      // TODO: API 호출로 실제 삭제
      // await deleteReports(selectedReports.map(r => r.reportId));

      // 임시로 로컬 상태에서 제거
      const selectedIds = selectedReports.map(r => r.reportId);
      setReports(prev => prev.filter(report => !selectedIds.includes(report.reportId)));
      setPagination(prev => ({ ...prev, total: prev.total - selectedReports.length }));
      setSelectedReports([]);

      toast.success(`${selectedReports.length}건의 제출보고서가 삭제되었습니다.`);
    } catch (error) {
      console.error('제출보고서 삭제 실패:', error);
      toast.error('제출보고서 삭제에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedReports]);

  const handleReportDetail = useCallback((report: SubmitReport) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedReport: report
    }));
  }, []);

  /**
   * 제출보고서 등록 핸들러
   */
  const handleSave = useCallback(async (formData: SubmitReportFormData) => {
    try {
      // TODO: 실제 API 호출로 교체
      console.log('제출보고서 등록:', formData);
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션

      // Mock 데이터에 추가
      const newReport: SubmitReport = {
        reportId: String(reports.length + 1),
        sequence: reports.length + 1,
        ledgerOrderId: formData.ledgerOrderId,
        submittingAgencyCd: formData.submittingAgencyCd,
        submittingAgencyName: '', // TODO: 코드명 조회
        reportTypeCd: formData.reportTypeCd,
        reportTypeName: '', // TODO: 코드명 조회
        subReportTitle: formData.subReportTitle,
        targetExecutiveEmpNo: formData.targetExecutiveEmpNo,
        targetExecutiveName: '', // TODO: 임원명 조회
        positionId: formData.positionId,
        positionName: '', // TODO: 직책명 조회
        submissionDate: formData.submissionDate,
        remarks: formData.remarks,
        attachmentCount: formData.attachments?.length || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
      };

      setReports(prev => [...prev, newReport]);
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.size)
      }));
    } catch (error) {
      console.error('제출보고서 등록 실패:', error);
      throw error;
    }
  }, [reports]);

  /**
   * 제출보고서 수정 핸들러
   */
  const handleUpdate = useCallback(async (id: string, formData: SubmitReportFormData) => {
    try {
      // TODO: 실제 API 호출로 교체
      console.log('제출보고서 수정:', id, formData);
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션

      // Mock 데이터 업데이트
      setReports(prev => prev.map(report =>
        report.reportId === id
          ? {
              ...report,
              ledgerOrderId: formData.ledgerOrderId,
              submittingAgencyCd: formData.submittingAgencyCd,
              reportTypeCd: formData.reportTypeCd,
              subReportTitle: formData.subReportTitle,
              targetExecutiveEmpNo: formData.targetExecutiveEmpNo,
              positionId: formData.positionId,
              submissionDate: formData.submissionDate,
              remarks: formData.remarks,
              attachmentCount: formData.attachments?.length || report.attachmentCount,
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin'
            }
          : report
      ));
    } catch (error) {
      console.error('제출보고서 수정 실패:', error);
      throw error;
    }
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('제출보고서 정보를 검색 중입니다...');

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      console.log('검색 필터:', filters);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, { type: 'success', render: '검색이 완료되었습니다.', isLoading: false, autoClose: 2000 });
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, { type: 'error', render: '검색에 실패했습니다.', isLoading: false, autoClose: 3000 });
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      reportTypeCd: '',
      submittingAgencyCd: '',
      submissionDateFrom: '',
      submissionDateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Grid Event Handlers
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

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    return { total };
  }, [pagination.total]);

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
      type: 'text',
      label: '제출기관',
      placeholder: '제출기관코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'reportTypeCd',
      type: 'text',
      label: '제출보고서구분',
      placeholder: '제출보고서구분코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 }
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
  ], [filters.ledgerOrderId, handleFiltersChange]);

  // 엑셀 다운로드 핸들러
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

  // BaseActionBar용 액션 버튼 정의
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
      disabled: loadingStates.excel,
      loading: loadingStates.excel
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
  ], [handleExcelDownload, handleNewReport, handleDeleteReports, selectedReports.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [], []);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockReports: SubmitReport[] = [
      {
        reportId: '1',
        sequence: 1,
        ledgerOrderId: '20250001',
        submittingAgencyCd: 'FSS',
        submittingAgencyName: '금융감독원',
        reportTypeCd: 'RESP_CHG',
        reportTypeName: '임원 이행점검 보고서',
        subReportTitle: '[2025년 하반기 정기점검] 임원 이행점검 보고서',
        targetExecutiveEmpNo: 'EMP001',
        targetExecutiveName: '홍길동',
        positionId: '1',
        positionName: '임원',
        submissionDate: '2025-11-25',
        remarks: '2025년 4분기 책무 변경사항 반영',
        attachmentCount: 2,
        createdAt: '2025-11-25',
        updatedAt: '2025-11-25',
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
      },
      {
        reportId: '2',
        sequence: 2,
        ledgerOrderId: '20250001',
        submittingAgencyCd: 'FSC',
        submittingAgencyName: '금융위원회',
        reportTypeCd: 'EXEC_CHG',
        reportTypeName: 'CEO 이행점검 보고서',
        subReportTitle: '[2025년 하반기 정기점검] CEO 이행점검 보고서',
        targetExecutiveEmpNo: 'EMP002',
        targetExecutiveName: '김철수',
        positionId: '2',
        positionName: 'CEO',
        submissionDate: '2025-11-25',
        remarks: 'CEO 이행점검 보고',
        attachmentCount: 1,
        createdAt: '2025-11-25',
        updatedAt: '2025-11-25',
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
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
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
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

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 공통 검색 필터 */}
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

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 제출보고서 수"
          selectedCount={selectedReports.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
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
        />
      </div>

      {/* 📝 제출보고서 등록 모달 */}
      <SubmitReportFormModal
        open={modalState.newReportModal}
        mode="create"
        report={null}
        onClose={handleModalClose}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onRefresh={handleSearch}
      />

      {/* 📄 제출보고서 상세 모달 */}
      <SubmitReportFormModal
        open={modalState.detailModal}
        mode="detail"
        report={modalState.selectedReport}
        onClose={handleModalClose}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onRefresh={handleSearch}
      />
    </div>
  );
};

export default SubmitReportList;
