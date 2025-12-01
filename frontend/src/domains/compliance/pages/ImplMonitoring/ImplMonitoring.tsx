/**
 * 이행점검계획 페이지
 * - impl_inspection_plans 테이블 CRUD
 * - dept_manager_manuals 기반 점검대상 선택
 * - impl_inspection_items 일괄 생성
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImplMonitoring.module.scss';

// API imports
import {
  getAllImplInspectionPlans,
  getImplInspectionPlansByLedgerOrderId,
  createImplInspectionPlan,
  updateImplInspectionPlan,
  deleteImplInspectionPlans
} from '@/domains/compliance/api/implInspectionPlanApi';
import type { ImplInspectionPlanDto } from '@/domains/compliance/types/implInspectionPlan.types';

// Types
import type {
  PeriodSetting,
  PeriodSettingFilters,
  PeriodSettingFormData,
  PeriodSettingModalState,
  PeriodSettingPagination
} from './types/implMonitoring.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// ImplMonitoring specific components
// import { implMonitoringColumns } from './components/ImplMonitoringDataGrid/implMonitoringColumns';

// Lazy-loaded components for performance optimization
const ImplMonitoringFormModal = React.lazy(() =>
  import('./components/ImplMonitoringFormModal/ImplMonitoringFormModal')
);

interface ImplMonitoringProps {
  className?: string;
}

/**
 * Backend API 응답을 UI 타입으로 변환
 * - ImplInspectionPlanDto -> PeriodSetting
 */
const convertToPeriodSetting = (dto: ImplInspectionPlanDto, index: number): PeriodSetting => {
  // 상태코드 -> UI 상태 변환
  const statusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'DRAFT'> = {
    '01': 'DRAFT',    // 계획 -> 임시
    '02': 'ACTIVE',   // 진행중 -> 시행
    '03': 'ACTIVE',   // 완료 -> 시행
    '04': 'INACTIVE'  // 보류 -> 중단
  };

  const statusTextMap: Record<string, string> = {
    '01': '계획',
    '02': '진행중',
    '03': '완료',
    '04': '보류'
  };

  const status = statusMap[dto.implInspectionStatusCd] || 'DRAFT';

  return {
    id: dto.implInspectionPlanId,
    sequence: index + 1,
    ledgerOrderId: dto.ledgerOrderId,
    inspectionName: dto.implInspectionName,
    inspectionType: dto.inspectionTypeName || (dto.inspectionTypeCd === '01' ? '정기점검' : '특별점검'),
    inspectionTypeCd: dto.inspectionTypeCd,
    inspectionStartDate: dto.implInspectionStartDate,
    inspectionEndDate: dto.implInspectionEndDate,
    activityStartDate: dto.implInspectionStartDate, // UI용 (같은 값 사용)
    activityEndDate: dto.implInspectionEndDate,     // UI용 (같은 값 사용)
    registrationDate: dto.createdAt?.split('T')[0] || '',
    registrant: dto.createdBy,
    status: status,
    statusCd: dto.implInspectionStatusCd,
    statusText: statusTextMap[dto.implInspectionStatusCd] || '',
    remarks: dto.remarks,
    isActive: dto.isActive === 'Y',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy,
    updatedBy: dto.updatedBy,
    totalItemCount: dto.totalItemCount,
    completedItemCount: dto.completedItemCount,
    inProgressItemCount: dto.inProgressItemCount
  };
};

const ImplMonitoring: React.FC<ImplMonitoringProps> = ({ className }) => {
  const { t } = useTranslation('compliance');

  // 기간설정 컬럼 정의 (모든 컬럼 포함)
  const implMonitoringColumns = useMemo(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      suppressSizeToFit: true,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'ledgerOrderId',
      headerName: '책무이행차수',
      width: 180,
      minWidth: 140,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#9c27b0' }
    },
    {
      field: 'inspectionName',
      headerName: '점검명',
      width: 280,
      minWidth: 200,
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 30 ? `${value.substring(0, 30)}...` : value;
      },
      cellStyle: { fontWeight: '500', color: '#1976d2' }
    },
    {
      field: 'inspectionType',
      headerName: '점검유형',
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#00897b' }
    },
    {
      field: 'inspectionStartDate',
      headerName: '점검 수행기간',
      width: 240,
      minWidth: 200,
      sortable: false,
      filter: false,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data || !data.inspectionStartDate || !data.inspectionEndDate) return '';
        const startDate = data.inspectionStartDate.replace(/-/g, '.');
        const endDate = data.inspectionEndDate.replace(/-/g, '.');
        return `${startDate} ~ ${endDate}`;
      },
      cellStyle: { color: '#2e7d32', fontWeight: '500' }
    },
    {
      field: 'registrationDate',
      headerName: '등록일자',
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: 'agDateColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) return '';
        return value.replace(/-/g, '.');
      },
      cellStyle: { color: '#424242', fontWeight: '500' }
    },
    {
      field: 'registrant',
      headerName: '등록자',
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#1976d2' }
    },
    {
      field: 'status',
      headerName: '상태',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        let statusText = '';

        switch (value) {
          case 'ACTIVE':
            statusText = '✓ 시행';
            break;
          case 'INACTIVE':
            statusText = '✗ 중단';
            break;
          case 'DRAFT':
            statusText = '○ 임시';
            break;
          default:
            statusText = value || '';
        }

        return statusText;
      },
      filterParams: {
        values: ['시행', '중단', '임시'],
        suppressSorting: true
      }
    }
  ] as ColDef<PeriodSetting>[], []);

  // State Management
  const [periods, setPeriods] = useState<PeriodSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodSetting[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });
  const [filters, setFilters] = useState<PeriodSettingFilters>({
    ledgerOrderId: '',
    searchPeriodStart: '',
    searchPeriodEnd: ''
  });

  const [pagination, setPagination] = useState<PeriodSettingPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<PeriodSettingModalState>({
    addModal: false,
    detailModal: false,
    selectedPeriod: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<PeriodSettingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddPeriod = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedPeriod: null
    }));
    toast.info('새 기간설정을 등록해주세요.', { autoClose: 2000 });
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

  const handleDeletePeriods = useCallback(async () => {
    if (selectedPeriods.length === 0) {
      toast.warning('삭제할 기간설정을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedPeriods.length}개의 기간설정을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedPeriods.length}개 기간설정을 삭제 중입니다...`);

    try {
      // 실제 삭제 API 호출 (impl_inspection_plans 일괄 삭제)
      const idsToDelete = selectedPeriods.map(p => p.id);
      await deleteImplInspectionPlans(idsToDelete);

      // 상태 업데이트 (삭제된 항목 제거)
      setPeriods(prev =>
        prev.filter(period => !selectedPeriods.some(selected => selected.id === period.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedPeriods.length
      }));
      setSelectedPeriods([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedPeriods.length}개 기간설정이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '기간설정 삭제에 실패했습니다.');
      console.error('기간설정 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedPeriods]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedPeriod: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handlePeriodSave = useCallback(async (formData: PeriodSettingFormData) => {
    try {
      setLoading(true);

      // 실제 API 호출 (impl_inspection_plans + impl_inspection_items 일괄 생성)
      const response = await createImplInspectionPlan({
        ledgerOrderId: formData.ledgerOrderId,
        implInspectionName: formData.inspectionName,
        inspectionTypeCd: formData.inspectionTypeCd,
        implInspectionStartDate: formData.inspectionStartDate,
        implInspectionEndDate: formData.inspectionEndDate,
        remarks: formData.remarks,
        manualCds: formData.manualCds // 선택된 점검대상 목록 (impl_inspection_items 생성용)
      });

      // 응답 데이터를 UI 타입으로 변환하여 목록에 추가
      const newPeriod = convertToPeriodSetting(response, 0);

      setPeriods(prev => [newPeriod, ...prev.map((p, i) => ({ ...p, sequence: i + 2 }))]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('이행점검계획이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('이행점검계획 등록 실패:', error);
      toast.error('이행점검계획 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  /**
   * 이행점검계획 수정 핸들러
   * - impl_inspection_plans 테이블만 UPDATE
   * - impl_inspection_items는 수정하지 않음
   */
  const handlePeriodUpdate = useCallback(async (id: string, formData: PeriodSettingFormData) => {
    try {
      setLoading(true);

      // 실제 API 호출 (impl_inspection_plans UPDATE)
      const response = await updateImplInspectionPlan(id, {
        implInspectionName: formData.inspectionName,
        inspectionTypeCd: formData.inspectionTypeCd,
        implInspectionStartDate: formData.inspectionStartDate,
        implInspectionEndDate: formData.inspectionEndDate,
        remarks: formData.remarks
      });

      // 응답 데이터로 목록 업데이트
      setPeriods(prev =>
        prev.map(period =>
          period.id === id
            ? convertToPeriodSetting(response, period.sequence - 1)
            : period
        )
      );

      handleModalClose();
      toast.success('이행점검계획이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('이행점검계획 수정 실패:', error);
      toast.error('이행점검계획 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handlePeriodDetail = useCallback((period: PeriodSetting) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedPeriod: period
    }));
  }, []);

  /**
   * 이행점검계획 목록 조회 (API 호출)
   * - 원장차수ID가 있으면 해당 차수만 조회
   * - 없으면 전체 조회
   */
  const fetchInspectionPlans = useCallback(async (ledgerOrderId?: string) => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      let response: ImplInspectionPlanDto[];

      if (ledgerOrderId) {
        // 원장차수ID로 필터링 조회
        response = await getImplInspectionPlansByLedgerOrderId(ledgerOrderId);
      } else {
        // 전체 조회
        response = await getAllImplInspectionPlans();
      }

      // API 응답을 UI 타입으로 변환
      const convertedPeriods = response.map((dto, index) => convertToPeriodSetting(dto, index));

      setPeriods(convertedPeriods);
      setPagination(prev => ({
        ...prev,
        total: convertedPeriods.length,
        totalPages: Math.ceil(convertedPeriods.length / prev.size)
      }));

      return convertedPeriods;
    } catch (error) {
      console.error('이행점검계획 목록 조회 실패:', error);
      toast.error('이행점검계획 목록 조회에 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, []);

  const handleSearch = useCallback(async () => {
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('이행점검계획 정보를 검색 중입니다...');

    try {
      // 실제 API 호출 (원장차수ID 필터 적용)
      await fetchInspectionPlans(filters.ledgerOrderId || undefined);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    }
  }, [filters.ledgerOrderId, fetchInspectionPlans]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      searchPeriodStart: '',
      searchPeriodEnd: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((period: PeriodSetting) => {
    console.log('행 클릭:', period);
  }, []);

  const handleRowDoubleClick = useCallback((period: PeriodSetting) => {
    handlePeriodDetail(period);
  }, [handlePeriodDetail]);

  const handleSelectionChange = useCallback((selected: PeriodSetting[]) => {
    setSelectedPeriods(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = periods.filter(p => p.status === 'ACTIVE').length;
    const inactiveCount = periods.filter(p => p.status === 'INACTIVE').length;
    const draftCount = periods.filter(p => p.status === 'DRAFT').length;

    return {
      total,
      activeCount,
      inactiveCount,
      draftCount
    };
  }, [pagination.total, periods]);

  // Filtered periods for display (성능 최적화)
  const displayPeriods = useMemo(() => {
    return periods; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [periods]);

  // 원장차수 변경 핸들러
  const handleLedgerOrderChange = useCallback((value: string | null) => {
    setFilters(prev => ({ ...prev, ledgerOrderId: value || '' }));
  }, []);

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
      key: 'searchPeriodStart',
      type: 'date',
      label: '항목시작일',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'searchPeriodEnd',
      type: 'date',
      label: '항목종료일',
      gridSize: { xs: 12, sm: 6, md: 3 }
    }
  ], [filters.ledgerOrderId, handleLedgerOrderChange]);

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
      onClick: handleAddPeriod
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeletePeriods,
      disabled: selectedPeriods.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddPeriod, handleDeletePeriods, selectedPeriods.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '시행',
      value: statistics.activeCount,
      color: 'success',
      icon: <CheckCircleIcon />
    },
    {
      label: '중단',
      value: statistics.inactiveCount,
      color: 'error',
      icon: <ScheduleIcon />
    },
    {
      label: '임시',
      value: statistics.draftCount,
      color: 'warning',
      icon: <AssignmentIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수 - 콘솔 로그 제거됨
  // 필요시 React DevTools Profiler 사용 권장
  const onRenderProfiler = useCallback(() => {
    // 성능 프로파일링 비활성화
  }, []);

  // 페이지 로드 시 이행점검계획 목록 조회
  useEffect(() => {
    fetchInspectionPlans();
  }, [fetchInspectionPlans]);

  return (
    <React.Profiler id="ImplMonitoring" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <CalendarTodayIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('implMonitoring.management.title', '이행점검계획')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('implMonitoring.management.description', '이행점검 현황 및 진행 상황을 체계적으로 관리합니다')}
                </p>
              </div>
            </div>

            <div className={styles.headerStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AssignmentIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.total}</div>
                  <div className={styles.statLabel}>총 기간</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircleIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.activeCount}
                  </div>
                  <div className={styles.statLabel}>시행중</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <ScheduleIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.draftCount}</div>
                  <div className={styles.statLabel}>임시 저장</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<PeriodSettingFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 기간설정 수"
            selectedCount={selectedPeriods.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayPeriods}
            columns={implMonitoringColumns}
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

        {/* 이행점검 등록/상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ImplMonitoringFormModal
            open={modalState.addModal || modalState.detailModal}
            mode={modalState.addModal ? 'create' : 'detail'}
            period={modalState.selectedPeriod}
            onClose={handleModalClose}
            onSave={handlePeriodSave}
            onUpdate={handlePeriodUpdate}
            loading={loading}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

// ImplMonitoring 도메인 공개 API
export { default as ImplMonitoring } from './ImplMonitoring';
export * from './types/implMonitoring.types';

export default ImplMonitoring;
