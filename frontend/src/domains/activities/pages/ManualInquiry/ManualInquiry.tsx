// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManualInquiry.module.scss';

// Types
import type {
  ManualInquiry,
  ManualInquiryFilters,
  ManualInquiryFormData,
  ManualInquiryModalState,
  ManualInquiryPagination,
  ManualInquiryStatistics,
  ManualInquiryLoadingStates
} from './types/manualInquiry.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// ManualInquiry specific components
import { manualColumns } from './components/ManualDataGrid/manualColumns';

// Lazy-loaded components for performance optimization
const ManualDetailModal = React.lazy(() =>
  import('./components/ManualDetailModal').then(module => ({ default: module.default }))
);

interface ManualInquiryProps {
  className?: string;
}

const ManualInquiry: React.FC<ManualInquiryProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [manuals, setManuals] = useState<ManualInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedManuals, setSelectedManuals] = useState<ManualInquiry[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState<ManualInquiryLoadingStates>({
    search: false,
    excel: false,
    download: false,
    detail: false,
    save: false,
    delete: false
  });

  const [filters, setFilters] = useState<ManualInquiryFilters>({
    departmentCode: '0000',
    searchKeyword: '',
    managementActivityType: '',
    startYearMonth: '',
    endYearMonth: '',
    riskValue: '',
    accessLevel: ''
  });

  const [pagination, setPagination] = useState<ManualInquiryPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ManualInquiryModalState>({
    addModal: false,
    detailModal: false,
    selectedManual: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ManualInquiryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddManual = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedManual: null
    }));
    toast.info('새 업무메뉴얼을 등록해주세요.', { autoClose: 2000 });
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

  const handleDeleteManuals = useCallback(async () => {
    if (selectedManuals.length === 0) {
      toast.warning('삭제할 업무메뉴얼을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedManuals.length}개의 업무메뉴얼을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedManuals.length}개 업무메뉴얼을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setManuals(prev =>
        prev.filter(manual => !selectedManuals.some(selected => selected.id === manual.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedManuals.length
      }));
      setSelectedManuals([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedManuals.length}개 업무메뉴얼이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '업무메뉴얼 삭제에 실패했습니다.');
      console.error('업무메뉴얼 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedManuals]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedManual: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleManualSave = useCallback(async (formData: ManualInquiryFormData) => {
    try {
      setLoadingStates(prev => ({ ...prev, save: true }));
      // TODO: API 호출로 업무메뉴얼 생성
      // const response = await manualApi.create(formData);

      // 임시로 새 업무메뉴얼 객체 생성
      const newManual: ManualInquiry = {
        id: Date.now().toString(),
        sequence: manuals.length + 1,
        departmentName: formData.departmentName,
        managementActivityCode: formData.managementActivityCode,
        managementActivityName: formData.managementActivityName,
        managementActivityDetail: formData.managementActivityDetail,
        riskAssessmentElement: formData.riskAssessmentElement,
        managementActivityType: formData.managementActivityType,
        startYearMonth: formData.startYearMonth,
        endYearMonth: formData.endYearMonth || '',
        relatedRegulation: formData.relatedRegulation || '',
        riskValue: formData.riskValue,
        organizationSystemDescription: false,
        implementationProcedureStatus: '',
        ceoRiskAssessment: false,
        managementRepresentative: formData.managementRepresentative,
        managementDetail: '',
        managementDuplication: '',
        managementChangeContent: '',
        responsibilityDocument: '',
        responsibility: '',
        progress: '',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: '현재사용자',
        modifiedDate: new Date().toISOString().split('T')[0],
        modifiedBy: '현재사용자',
        downloadCount: 0,
        isActive: true,
        accessLevel: 'PUBLIC'
      };

      setManuals(prev => [newManual, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('업무메뉴얼이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('업무메뉴얼 등록 실패:', error);
      toast.error('업무메뉴얼 등록에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  }, [manuals.length, handleModalClose]);

  const handleManualUpdate = useCallback(async (id: string, formData: ManualInquiryFormData) => {
    try {
      setLoadingStates(prev => ({ ...prev, save: true }));
      // TODO: API 호출로 업무메뉴얼 수정
      // const response = await manualApi.update(id, formData);

      // 임시로 기존 업무메뉴얼 업데이트
      setManuals(prev =>
        prev.map(manual =>
          manual.id === id
            ? {
                ...manual,
                departmentName: formData.departmentName,
                managementActivityCode: formData.managementActivityCode,
                managementActivityName: formData.managementActivityName,
                managementActivityDetail: formData.managementActivityDetail,
                riskAssessmentElement: formData.riskAssessmentElement,
                managementActivityType: formData.managementActivityType,
                startYearMonth: formData.startYearMonth,
                endYearMonth: formData.endYearMonth || '',
                relatedRegulation: formData.relatedRegulation || '',
                riskValue: formData.riskValue,
                organizationSystemDescription: manual.organizationSystemDescription,
                implementationProcedureStatus: manual.implementationProcedureStatus,
                ceoRiskAssessment: manual.ceoRiskAssessment,
                managementRepresentative: formData.managementRepresentative,
                managementDetail: manual.managementDetail,
                managementDuplication: manual.managementDuplication,
                managementChangeContent: manual.managementChangeContent,
                responsibilityDocument: manual.responsibilityDocument,
                responsibility: manual.responsibility,
                progress: manual.progress,
                modifiedDate: new Date().toISOString().split('T')[0],
                modifiedBy: '현재사용자',
                accessLevel: manual.accessLevel
              }
            : manual
        )
      );

      handleModalClose();
      toast.success('업무메뉴얼이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('업무메뉴얼 수정 실패:', error);
      toast.error('업무메뉴얼 수정에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  }, [handleModalClose]);

  const handleManualDetail = useCallback((manual: ManualInquiry) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedManual: manual
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('업무메뉴얼 정보를 검색 중입니다...');

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
      departmentCode: '0000',
      searchKeyword: '',
      managementActivityType: '',
      startYearMonth: '',
      endYearMonth: '',
      riskValue: '',
      accessLevel: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((manual: ManualInquiry) => {
    console.log('행 클릭:', manual);
  }, []);

  const handleRowDoubleClick = useCallback((manual: ManualInquiry) => {
    handleManualDetail(manual);
  }, [handleManualDetail]);

  const handleSelectionChange = useCallback((selected: ManualInquiry[]) => {
    setSelectedManuals(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = manuals.filter(m => m.isActive).length;
    const inactiveCount = manuals.filter(m => !m.isActive).length;
    const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      activeCount,
      inactiveCount,
      systemUptime
    };
  }, [pagination.total, manuals]);

  // Filtered manuals for display (성능 최적화)
  const displayManuals = useMemo(() => {
    return manuals; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [manuals]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'searchKeyword',
      type: 'text',
      label: '메뉴얼명',
      placeholder: '메뉴얼명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'managementActivityType',
      type: 'select',
      label: '관리활동구분',
      options: [
        { value: '', label: '전체' },
        { value: 'PLANNING', label: '계획' },
        { value: 'EXECUTION', label: '실행' },
        { value: 'MONITORING', label: '모니터링' },
        { value: 'IMPROVEMENT', label: '개선' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'riskValue',
      type: 'select',
      label: '위험도',
      options: [
        { value: '', label: '전체' },
        { value: 'LOW', label: '낮음' },
        { value: 'MEDIUM', label: '보통' },
        { value: 'HIGH', label: '높음' },
        { value: 'CRITICAL', label: '매우높음' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'accessLevel',
      type: 'select',
      label: '접근권한',
      options: [
        { value: '', label: '전체' },
        { value: 'PUBLIC', label: '공개' },
        { value: 'DEPARTMENT', label: '부서' },
        { value: 'RESTRICTED', label: '제한' }
      ],
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
      onClick: handleAddManual
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteManuals,
      disabled: selectedManuals.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddManual, handleDeleteManuals, selectedManuals.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.activeCount,
      color: 'success',
      icon: <DescriptionIcon />
    },
    {
      label: '비활성',
      value: statistics.inactiveCount,
      color: 'default',
      icon: <DescriptionIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    _profilerID: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ManualInquiry Performance Profiler`);
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
    const mockManuals: ManualInquiry[] = [
      {
        id: '1',
        sequence: 1,
        departmentName: 'CEO',
        managementActivityCode: 'M000000003',
        managementActivityName: 'gfbfgbgf',
        managementActivityDetail: 'cv v',
        riskAssessmentElement: '총',
        managementActivityType: '연',
        startYearMonth: '2025-08',
        endYearMonth: 'bff',
        relatedRegulation: 'oliulykht',
        riskValue: '연',
        organizationSystemDescription: true,
        implementationProcedureStatus: 'kjhg',
        ceoRiskAssessment: false,
        managementRepresentative: '책무구조도의 비전 관리 관련 책무 새테우고',
        managementDetail: '책무구조도의 비전 관리 관련 책무 새테우고',
        managementDuplication: '책무구조도의 비전 관리와 관련된 책무',
        managementChangeContent: '대행이시',
        responsibilityDocument: '',
        responsibility: '',
        progress: '',
        createdDate: '2024-01-15',
        createdBy: '관리자',
        modifiedDate: '2024-03-20',
        modifiedBy: '홍길동',
        downloadCount: 15,
        isActive: true,
        accessLevel: 'PUBLIC'
      }
    ];

    setManuals(mockManuals);
    setPagination(prev => ({
      ...prev,
      total: mockManuals.length,
      totalPages: Math.ceil(mockManuals.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="ManualInquiry" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  업무메뉴얼조회
                </h1>
                <p className={styles.pageDescription}>
                  부서별 내부통제 업무메뉴얼을 조회하고 관리합니다
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
                  <div className={styles.statLabel}>총 메뉴얼</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DescriptionIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.activeCount}
                  </div>
                  <div className={styles.statLabel}>활성 메뉴얼</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ManualInquiryFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 메뉴얼 수"
            selectedCount={selectedManuals.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayManuals}
            columns={manualColumns}
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

        {/* 업무메뉴얼 상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ManualDetailModal
            open={modalState.detailModal || modalState.addModal}
            mode={modalState.addModal ? 'create' : 'detail'}
            manual={modalState.selectedManual}
            onClose={handleModalClose}
            onSave={handleManualSave}
            onUpdate={handleManualUpdate}
            loading={loadingStates.save}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ManualInquiry;