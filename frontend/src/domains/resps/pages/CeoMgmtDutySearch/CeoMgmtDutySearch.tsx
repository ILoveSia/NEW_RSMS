// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CeoMgmtDutySearch.module.scss';

// Types
import type {
  CeoMgmtDuty,
  CeoMgmtDutyFilters,
  CeoMgmtDutyFormData,
  CeoMgmtDutyModalState,
  CeoMgmtDutyPagination,
  CeoMgmtDutyStatistics
} from './types/ceoMgmtDuty.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// CEO specific components (주석 처리 - 현재 사용하지 않음)
// import { ceoMgmtDutyColumns } from './components/CeoMgmtDutyDataGrid/ceoMgmtDutyColumns';

// Lazy-loaded components for performance optimization
const CeoMgmtDutyDetailModal = React.lazy(() =>
  import('./components/CeoMgmtDutyDetailModal/CeoMgmtDutyDetailModal').then(module => ({ default: module.default }))
);

interface CeoMgmtDutySearchProps {
  className?: string;
}

const CeoMgmtDutySearch: React.FC<CeoMgmtDutySearchProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [duties, setDuties] = useState<CeoMgmtDuty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDuties, setSelectedDuties] = useState<CeoMgmtDuty[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });

  const [filters, setFilters] = useState<CeoMgmtDutyFilters>({
    implementationStatus: '서울', // 기본값: 서울
    dutyName: '',
    executive: '',
    department: ''
  });

  const [pagination, setPagination] = useState<CeoMgmtDutyPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<CeoMgmtDutyModalState>({
    detailModal: false,
    selectedDuty: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<CeoMgmtDutyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', 'CEO 총괄관리의무 엑셀 파일이 다운로드되었습니다.');
      console.log('CEO 총괄관리의무 엑셀 다운로드 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      detailModal: false,
      selectedDuty: null
    }));
  }, []);

  // 상세 조회 핸들러
  const handleDutyDetail = useCallback((duty: CeoMgmtDuty) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedDuty: duty
    }));
  }, []);

  // 수정 핸들러
  const handleDutyUpdate = useCallback(async (id: string, formData: CeoMgmtDutyFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 관리의무 수정
      // const response = await ceoMgmtDutyApi.update(id, formData);

      // 임시로 기존 관리의무 업데이트
      setDuties(prev =>
        prev.map(duty =>
          duty.id === id
            ? {
                ...duty,
                dutyName: formData.dutyName,
                modificationDate: new Date().toISOString().split('T')[0],
                modifier: '현재사용자'
              }
            : duty
        )
      );

      handleModalClose();
      toast.success('CEO 총괄관리의무가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('관리의무 수정 실패:', error);
      toast.error('관리의무 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('CEO 총괄관리의무를 검색 중입니다...');

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      console.log('검색 필터:', filters);

      // Mock 데이터 생성
      const mockDuties: CeoMgmtDuty[] = [
        {
          id: '1',
          seq: 1,
          executiveManagementDuty: '책무구조도의 마련 관리 관련 책무 세부내용의 관리의무',
          dutyCode: 'R000000012',
          dutyName: '책무구조도의 마련 관리 관련 책무 세부내용의 관리의무',
          executives: ['감사보부장', 'CEO(고유)', '준법감시인'],
          departments: ['감사부', '감사부', '준법지원부'],
          managementActivities: ['내부감사기준의 적정성 검토', 'gfbfgbgf', '준법감시 업무의 관련된...'],
          managementDuties: [
            '내부감사기준의 업무의 관련된 책무 세부 내용 1에 대한 관리의무 1',
            '책무구조도의 마련 관리 관련 책무 세부내용의 관리의무',
            '준법감시 업무의 관련된 책무 세부내용에 대한 관리의무'
          ],
          implementationStatus: '서울',
          managementActivityList: [],
          registrationDate: '2024-01-15',
          registrar: '관리자',
          modificationDate: '2024-03-20',
          modifier: '시스템관리자',
          isActive: true
        }
      ];

      setDuties(mockDuties);
      setPagination(prev => ({
        ...prev,
        total: mockDuties.length,
        totalPages: Math.ceil(mockDuties.length / prev.size)
      }));

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
      implementationStatus: '서울', // 기본값 유지
      dutyName: '',
      executive: '',
      department: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((duty: CeoMgmtDuty) => {
    console.log('행 클릭:', duty);
  }, []);

  const handleRowDoubleClick = useCallback((duty: CeoMgmtDuty) => {
    handleDutyDetail(duty);
  }, [handleDutyDetail]);

  const handleSelectionChange = useCallback((selected: CeoMgmtDuty[]) => {
    setSelectedDuties(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<CeoMgmtDutyStatistics>(() => {
    const totalDuties = pagination.total;
    const activeDuties = duties.filter(d => d.isActive).length;
    const totalActivities = duties.reduce((sum, duty) => sum + duty.managementActivityList.length, 0);
    const pendingActivities = duties.reduce((sum, duty) =>
      sum + duty.managementActivityList.filter(activity => activity.status === 'pending').length, 0);
    const completionRate = totalActivities > 0 ?
      Math.round(((totalActivities - pendingActivities) / totalActivities) * 100) : 0;

    return {
      totalDuties,
      activeDuties,
      pendingActivities,
      totalActivities,
      completionRate
    };
  }, [pagination.total, duties]);

  // Filtered duties for display (성능 최적화)
  const displayDuties = useMemo(() => {
    return duties; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [duties]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'implementationStatus',
      type: 'select',
      label: '시행여부',
      options: [
        { value: '서울', label: '서울' },
        { value: '부산', label: '부산' },
        { value: '대구', label: '대구' },
        { value: '인천', label: '인천' },
        { value: '광주', label: '광주' },
        { value: '대전', label: '대전' },
        { value: '울산', label: '울산' },
        { value: '세종', label: '세종' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      type: 'excel',
      onClick: handleExcelDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    }
  ], [handleExcelDownload, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성 의무',
      value: statistics.activeDuties,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '총 관리활동',
      value: statistics.totalActivities,
      color: 'primary',
      icon: <AssignmentIcon />
    },
    {
      label: '완료율',
      value: `${statistics.completionRate}%`,
      color: 'warning',
      icon: <AnalyticsIcon />
    }
  ], [statistics]);

  // 그리드 컬럼 정의 (6개 컬럼)
  const columns = useMemo(() => [
    {
      field: 'seq' as keyof CeoMgmtDuty,
      headerName: '순번',
      width: 80,
      sortable: true
    },
    {
      field: 'executiveManagementDuty' as keyof CeoMgmtDuty,
      headerName: 'CEO총괄관리의무',
      width: 400,
      sortable: true
    },
    {
      headerName: '임원',
      width: 150,
      sortable: true,
      valueGetter: (params: any) => params.data?.executives?.join(', ') || ''
    },
    {
      headerName: '부서',
      width: 120,
      sortable: true,
      valueGetter: (params: any) => params.data?.departments?.join(', ') || ''
    },
    {
      headerName: '관리활동',
      width: 300,
      sortable: true,
      valueGetter: (params: any) => params.data?.managementActivities?.join(', ') || ''
    },
    {
      headerName: '관리의무',
      width: 400,
      sortable: true,
      valueGetter: (params: any) => params.data?.managementDuties?.join(', ') || ''
    }
  ], []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <AssignmentIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('ceo.duty.title', 'CEO총괄관리의무조회')}
              </h1>
              <p className={styles.pageDescription}>
                {t('ceo.duty.description', 'CEO의 총괄관리의무의 관리활동을 조회하고 관리합니다')}
              </p>
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalDuties}</div>
                <div className={styles.statLabel}>총 관리의무</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.activeDuties}
                </div>
                <div className={styles.statLabel}>활성 의무</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.completionRate}%</div>
                <div className={styles.statLabel}>완료율</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<CeoMgmtDutyFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.totalDuties}
          totalLabel="총 관리의무 수"
          selectedCount={selectedDuties.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayDuties}
          columns={columns}
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

      {/* CEO 관리의무 상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <CeoMgmtDutyDetailModal
          open={modalState.detailModal}
          duty={modalState.selectedDuty}
          onClose={handleModalClose}
          onUpdate={handleDutyUpdate}
          onActivityAdd={async () => {}}
          onActivityDelete={async () => {}}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

export default CeoMgmtDutySearch;