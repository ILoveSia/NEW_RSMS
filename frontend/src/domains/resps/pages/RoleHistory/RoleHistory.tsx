// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './RoleHistory.module.scss';

// Types
import type {
  RoleHistory as RoleHistoryType,
  RoleHistoryTabType,
  RoleHistoryFilters,
  RoleHistoryStatistics,
  PositionOnlyHistory,
  Position,
  Responsibility,
  RoleHistoryPagination,
  RoleHistoryModalState
} from './types/roleHistory.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import type { ColDef } from 'ag-grid-community';

// 지연 로딩 모달들
const PositionSelectModal = React.lazy(() =>
  import('./components/PositionSelectModal/PositionSelectModal')
);
const ResponsibilitySelectModal = React.lazy(() =>
  import('./components/ResponsibilitySelectModal/ResponsibilitySelectModal')
);

interface RoleHistoryProps {
  className?: string;
}

/**
 * 직책/책무이력 메인 페이지
 * PositionMgmt 표준 템플릿을 완전히 따르는 구조
 */
const RoleHistory: React.FC<RoleHistoryProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [historyData, setHistoryData] = useState<(RoleHistoryType | PositionOnlyHistory)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<(RoleHistoryType | PositionOnlyHistory)[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });

  const [filters, setFilters] = useState<RoleHistoryFilters>({
    tabType: 'responsibility',
    startDate: '',
    endDate: '',
    positionName: '',
    responsibilityName: ''
  });

  const [pagination, setPagination] = useState<RoleHistoryPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<RoleHistoryModalState>({
    positionModal: false,
    responsibilityModal: false,
    selectedPosition: null,
    selectedResponsibility: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<RoleHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('직책/책무 이력 엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '직책/책무 이력 엑셀 파일이 다운로드되었습니다.');
      console.log('엑셀 다운로드 완료');
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
      positionModal: false,
      responsibilityModal: false,
      selectedPosition: null,
      selectedResponsibility: null
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('직책/책무 이력을 검색 중입니다...');

    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      console.log('검색 필터:', filters);

      // Mock 데이터 생성
      const mockData = generateMockData(filters.tabType);
      setHistoryData(mockData);
      setPagination(prev => ({
        ...prev,
        total: mockData.length,
        totalPages: Math.ceil(mockData.length / prev.size)
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
      tabType: 'responsibility',
      startDate: '',
      endDate: '',
      positionName: '',
      responsibilityName: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((item: RoleHistoryType | PositionOnlyHistory) => {
    console.log('행 클릭:', item);
  }, []);

  const handleRowDoubleClick = useCallback((item: RoleHistoryType | PositionOnlyHistory) => {
    console.log('행 더블클릭:', item);
  }, []);

  const handleSelectionChange = useCallback((selected: (RoleHistoryType | PositionOnlyHistory)[]) => {
    setSelectedItems(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // 모달 핸들러들
  const handlePositionSelect = useCallback((position: Position) => {
    console.log('직책 선택:', position);
    handleModalClose();
  }, [handleModalClose]);

  const handleResponsibilitySelect = useCallback((responsibility: Responsibility) => {
    console.log('책무 선택:', responsibility);
    handleModalClose();
  }, [handleModalClose]);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<RoleHistoryStatistics>(() => {
    const totalHistories = pagination.total;
    const activePositions = historyData.filter(item => item.isActive).length;
    const totalResponsibilities = historyData.filter(item => 'responsibilityCode' in item).length;
    const recentChanges = 3; // TODO: 실제 API 데이터 연동

    return {
      totalHistories,
      activePositions,
      totalResponsibilities,
      recentChanges
    };
  }, [pagination.total, historyData]);

  // Filtered data for display (성능 최적화)
  const displayData = useMemo(() => {
    return historyData; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [historyData]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'tabType',
      type: 'select',
      label: '조회기준',
      options: [
        { value: 'responsibility', label: '책무 기준' },
        { value: 'position', label: '직책 기준' },
        { value: 'positionOnly', label: '직책' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'startDate',
      type: 'text',
      label: '시작일',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'endDate',
      type: 'text',
      label: '종료일',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'positionName',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'responsibilityName',
      type: 'text',
      label: '책무명',
      placeholder: '책무명을 입력하세요',
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
      label: '활성 직책',
      value: statistics.activePositions,
      color: 'success',
      icon: <PersonIcon />
    },
    {
      label: '총 책무',
      value: statistics.totalResponsibilities,
      color: 'primary',
      icon: <AssignmentIcon />
    },
    {
      label: '최근 변경',
      value: statistics.recentChanges,
      color: 'warning',
      icon: <AnalyticsIcon />
    }
  ], [statistics]);

  // 그리드 컬럼 정의 (탭별로 다름)
  const columns = useMemo<ColDef[]>(() => {
    switch (filters.tabType) {
      case 'responsibility': // 책무 기준
        return [
          { field: 'seq' as keyof RoleHistoryType, headerName: '순번', width: 80, sortable: true },
          { field: 'boardResolutionDate' as keyof RoleHistoryType, headerName: '이사회결의일', width: 150, sortable: true },
          { field: 'responsibilityCode' as keyof RoleHistoryType, headerName: '책무코드', width: 120, sortable: true },
          { field: 'responsibilityName' as keyof RoleHistoryType, headerName: '책무', width: 300, sortable: true },
          { field: 'positionCode' as keyof RoleHistoryType, headerName: '직책코드', width: 120, sortable: true },
          { field: 'positionName' as keyof RoleHistoryType, headerName: '직책', width: 200, sortable: true }
        ];

      case 'position': // 직책 기준
        return [
          { field: 'seq' as keyof RoleHistoryType, headerName: '순번', width: 80, sortable: true },
          { field: 'boardResolutionDate' as keyof RoleHistoryType, headerName: '이사회결의일', width: 150, sortable: true },
          { field: 'positionCode' as keyof RoleHistoryType, headerName: '직책코드', width: 120, sortable: true },
          { field: 'positionName' as keyof RoleHistoryType, headerName: '직책', width: 200, sortable: true },
          { field: 'responsibilityCode' as keyof RoleHistoryType, headerName: '책무코드', width: 120, sortable: true },
          { field: 'responsibilityName' as keyof RoleHistoryType, headerName: '책무', width: 300, sortable: true }
        ];

      case 'positionOnly': // 직책만
        return [
          { field: 'positionCode' as keyof PositionOnlyHistory, headerName: '직책코드', width: 150, sortable: true },
          { field: 'positionName' as keyof PositionOnlyHistory, headerName: '직책', width: 500, sortable: true }
        ];

      default:
        return [];
    }
  }, [filters.tabType]);

  // Mock data loading
  React.useEffect(() => {
    // 초기 데이터 로드
    const initialData = generateMockData(filters.tabType);
    setHistoryData(initialData);
    setPagination(prev => ({
      ...prev,
      total: initialData.length,
      totalPages: Math.ceil(initialData.length / prev.size)
    }));
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <HistoryIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('roleHistory.title', '직책/책무이력')}
              </h1>
              <p className={styles.pageDescription}>
                {t('roleHistory.description', '임원별 직책 변경 및 책무 이력을 조회하고 관리합니다')}
              </p>
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalHistories}</div>
                <div className={styles.statLabel}>총 이력</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <PersonIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.activePositions}
                </div>
                <div className={styles.statLabel}>활성 직책</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.recentChanges}</div>
                <div className={styles.statLabel}>최근 변경</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<RoleHistoryFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.totalHistories}
          totalLabel="총 이력 수"
          selectedCount={selectedItems.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayData}
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

      {/* 직책 선택 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <PositionSelectModal
          open={modalState.positionModal}
          onClose={handleModalClose}
          onSelect={handlePositionSelect}
          loading={loading}
        />
      </React.Suspense>

      {/* 책무 선택 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <ResponsibilitySelectModal
          open={modalState.responsibilityModal}
          onClose={handleModalClose}
          onSelect={handleResponsibilitySelect}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

// Mock 데이터 생성 함수
const generateMockData = (tabType: RoleHistoryTabType): (RoleHistoryType | PositionOnlyHistory)[] => {
  switch (tabType) {
    case 'responsibility':
      return [
        {
          id: '1',
          seq: 1,
          boardResolutionDate: '2025-01-15',
          positionCode: 'CEO001',
          positionName: '대표이사',
          responsibilityCode: 'RM001',
          responsibilityName: '경영전략 업무의 관련된 책무',
          registrationDate: '2025-01-15',
          registrar: '관리자',
          isActive: true
        }
      ] as RoleHistoryType[];

    case 'position':
      return [
        {
          id: '1',
          seq: 1,
          boardResolutionDate: '2025-01-15',
          positionCode: 'CEO001',
          positionName: '대표이사',
          responsibilityCode: 'RM001',
          responsibilityName: '경영전략 업무의 관련된 책무',
          registrationDate: '2025-01-15',
          registrar: '관리자',
          isActive: true
        }
      ] as RoleHistoryType[];

    case 'positionOnly':
      return [
        {
          id: '1',
          positionCode: 'CEO001',
          positionName: '대표이사',
          isActive: true
        }
      ] as PositionOnlyHistory[];

    default:
      return [];
  }
};

export default RoleHistory;