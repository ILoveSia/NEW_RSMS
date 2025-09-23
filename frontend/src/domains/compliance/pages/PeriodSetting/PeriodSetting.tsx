// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColDef } from 'ag-grid-community';
import styles from './PeriodSetting.module.scss';

// Types
import type {
  PeriodSetting,
  PeriodSettingFilters,
  PeriodSettingFormData,
  PeriodSettingModalState,
  PeriodSettingPagination
} from './types/periodSetting.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// PeriodSetting specific components
// import { periodColumns } from './components/PeriodDataGrid/periodColumns';

// Lazy-loaded components for performance optimization
const PeriodFormModal = React.lazy(() =>
  import('./components/PeriodFormModal/PeriodFormModal')
);

interface PeriodSettingProps {
  className?: string;
}

const PeriodSetting: React.FC<PeriodSettingProps> = ({ className }) => {
  const { t } = useTranslation('compliance');

  // 기간설정 컬럼 정의 (모든 컬럼 포함)
  const periodColumns = useMemo<ColDef<PeriodSetting>[]>(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 80,
      minWidth: 60,
      maxWidth: 100,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'inspectionName',
      headerName: '점검명',
      width: 200,
      minWidth: 150,
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
      field: 'inspectionStartDate',
      headerName: '점검 수행기간',
      width: 200,
      minWidth: 150,
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
      cellStyle: { fontFamily: 'monospace', color: '#2e7d32', fontWeight: '500' }
    },
    {
      field: 'activityStartDate',
      headerName: '활동 대상 기간',
      width: 200,
      minWidth: 150,
      sortable: false,
      filter: false,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data || !data.activityStartDate || !data.activityEndDate) return '';
        const startDate = data.activityStartDate.replace(/-/g, '.');
        const endDate = data.activityEndDate.replace(/-/g, '.');
        return `${startDate} ~ ${endDate}`;
      },
      cellStyle: { fontFamily: 'monospace', color: '#ed6c02', fontWeight: '500' }
    },
    {
      field: 'registrationDate',
      headerName: '등록일자',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agDateColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) return '';
        return value.replace(/-/g, '.');
      },
      cellStyle: { fontFamily: 'monospace', color: '#424242', fontWeight: '500' }
    },
    {
      field: 'registrantAuthority',
      headerName: '등록자권한',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#7b1fa2' }
    },
    {
      field: 'registrant',
      headerName: '등록자',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#1976d2' }
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      minWidth: 80,
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
  ], []);

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
    searchPeriodStart: '',
    searchPeriodEnd: '',
    inspectionName: '',
    status: '',
    registrant: ''
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
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

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
      // TODO: API 호출로 기간설정 생성
      // const response = await periodApi.create(formData);

      // 임시로 새 기간설정 객체 생성
      const newPeriod: PeriodSetting = {
        id: Date.now().toString(),
        sequence: periods.length + 1,
        inspectionName: formData.inspectionName,
        inspectionStartDate: formData.inspectionStartDate,
        inspectionEndDate: formData.inspectionEndDate,
        activityStartDate: formData.activityStartDate,
        activityEndDate: formData.activityEndDate,
        registrationDate: new Date().toISOString().split('T')[0],
        registrantAuthority: '관리자',
        registrant: '현재사용자',
        status: formData.status,
        statusText: formData.status === 'ACTIVE' ? '시행' : formData.status === 'INACTIVE' ? '중단' : '임시',
        isActive: formData.status === 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedBy: 'admin'
      };

      setPeriods(prev => [newPeriod, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('기간설정이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('기간설정 등록 실패:', error);
      toast.error('기간설정 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose, periods.length]);

  const handlePeriodUpdate = useCallback(async (id: string, formData: PeriodSettingFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 기간설정 수정
      // const response = await periodApi.update(id, formData);

      // 임시로 기존 기간설정 업데이트
      setPeriods(prev =>
        prev.map(period =>
          period.id === id
            ? {
                ...period,
                inspectionName: formData.inspectionName,
                inspectionStartDate: formData.inspectionStartDate,
                inspectionEndDate: formData.inspectionEndDate,
                activityStartDate: formData.activityStartDate,
                activityEndDate: formData.activityEndDate,
                status: formData.status,
                statusText: formData.status === 'ACTIVE' ? '시행' : formData.status === 'INACTIVE' ? '중단' : '임시',
                isActive: formData.status === 'ACTIVE',
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin'
              }
            : period
        )
      );

      handleModalClose();
      toast.success('기간설정이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('기간설정 수정 실패:', error);
      toast.error('기간설정 수정에 실패했습니다.');
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

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('기간설정 정보를 검색 중입니다...');

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
      searchPeriodStart: '',
      searchPeriodEnd: '',
      inspectionName: '',
      status: '',
      registrant: ''
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

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'searchPeriodStart',
      type: 'text',
      label: '항목기간 시작일',
      placeholder: 'YYYY-MM-DD',
      gridSize: { xs: 12, sm: 6, md: 2.5 }
    },
    {
      key: 'searchPeriodEnd',
      type: 'text',
      label: '항목기간 종료일',
      placeholder: 'YYYY-MM-DD',
      gridSize: { xs: 12, sm: 6, md: 2.5 }
    },
    {
      key: 'inspectionName',
      type: 'text',
      label: '점검명',
      placeholder: '점검명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'status',
      type: 'select',
      label: '상태',
      options: [
        { value: '', label: '전체' },
        { value: 'ACTIVE', label: '시행' },
        { value: 'INACTIVE', label: '중단' },
        { value: 'DRAFT', label: '임시' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'registrant',
      type: 'text',
      label: '등록자',
      placeholder: '등록자를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 }
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
      console.group(`🔍 PeriodSetting Performance Profiler`);
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
    const mockPeriods: PeriodSetting[] = [
      {
        id: '1',
        sequence: 1,
        inspectionName: '2024년 상반기 내부통제 점검',
        inspectionStartDate: '2024-07-01',
        inspectionEndDate: '2024-07-31',
        activityStartDate: '2024-01-01',
        activityEndDate: '2024-06-30',
        registrationDate: '2024-05-15',
        registrantAuthority: '관리자',
        registrant: '김관리',
        status: 'ACTIVE',
        statusText: '시행',
        isActive: true,
        createdAt: '2024-05-15T09:00:00Z',
        updatedAt: '2024-05-15T09:00:00Z',
        createdBy: 'admin',
        updatedBy: 'admin'
      },
      {
        id: '2',
        sequence: 2,
        inspectionName: '2024년 상반기 리스크 관리 점검',
        inspectionStartDate: '2024-08-01',
        inspectionEndDate: '2024-08-31',
        activityStartDate: '2024-02-01',
        activityEndDate: '2024-07-31',
        registrationDate: '2024-06-10',
        registrantAuthority: '부서장',
        registrant: '이부장',
        status: 'ACTIVE',
        statusText: '시행',
        isActive: true,
        createdAt: '2024-06-10T10:00:00Z',
        updatedAt: '2024-06-10T10:00:00Z',
        createdBy: 'manager',
        updatedBy: 'manager'
      },
      {
        id: '3',
        sequence: 3,
        inspectionName: '2024년 하반기 컴플라이언스 점검',
        inspectionStartDate: '2024-12-01',
        inspectionEndDate: '2024-12-31',
        activityStartDate: '2024-07-01',
        activityEndDate: '2024-11-30',
        registrationDate: '2024-08-20',
        registrantAuthority: '팀장',
        registrant: '박팀장',
        status: 'DRAFT',
        statusText: '임시',
        isActive: false,
        createdAt: '2024-08-20T14:00:00Z',
        updatedAt: '2024-08-20T14:00:00Z',
        createdBy: 'team_lead',
        updatedBy: 'team_lead'
      },
      {
        id: '4',
        sequence: 4,
        inspectionName: '2024년 정보보안 점검',
        inspectionStartDate: '2024-09-01',
        inspectionEndDate: '2024-09-30',
        activityStartDate: '2024-03-01',
        activityEndDate: '2024-08-31',
        registrationDate: '2024-07-05',
        registrantAuthority: '관리자',
        registrant: '최관리',
        status: 'INACTIVE',
        statusText: '중단',
        isActive: false,
        createdAt: '2024-07-05T11:00:00Z',
        updatedAt: '2024-07-05T11:00:00Z',
        createdBy: 'admin',
        updatedBy: 'admin'
      },
      {
        id: '5',
        sequence: 5,
        inspectionName: '2024년 재무 감사',
        inspectionStartDate: '2024-10-01',
        inspectionEndDate: '2024-10-31',
        activityStartDate: '2024-04-01',
        activityEndDate: '2024-09-30',
        registrationDate: '2024-08-01',
        registrantAuthority: '감사팀',
        registrant: '정감사',
        status: 'ACTIVE',
        statusText: '시행',
        isActive: true,
        createdAt: '2024-08-01T08:30:00Z',
        updatedAt: '2024-08-01T08:30:00Z',
        createdBy: 'auditor',
        updatedBy: 'auditor'
      }
    ];

    setPeriods(mockPeriods);
    setPagination(prev => ({
      ...prev,
      total: mockPeriods.length,
      totalPages: Math.ceil(mockPeriods.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="PeriodSetting" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <CalendarTodayIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('period.management.title', '기간설정 관리')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('period.management.description', '점검 기간 및 활동 대상 기간을 체계적으로 관리합니다')}
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
            columns={periodColumns}
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

        {/* 기간설정 등록/상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <PeriodFormModal
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

export default PeriodSetting;