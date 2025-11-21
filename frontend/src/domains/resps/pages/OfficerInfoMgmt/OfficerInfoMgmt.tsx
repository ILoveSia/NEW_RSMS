/**
 * 임원정보관리 메인 컴포넌트
 * @description PositionMgmt 표준 구조를 적용한 임원정보 관리 화면
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OfficerInfoMgmt.module.scss';

// Types
import type {
  OfficerInfo,
  OfficerInfoFilters,
  OfficerInfoFormData,
  OfficerInfoModalState,
  OfficerInfoPagination,
  OfficerInfoStatistics,
  OfficerInfoStatus
} from './types/officerInfo.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// OfficerInfo specific components
import { officerInfoColumns } from './components/OfficerInfoDataGrid/officerInfoColumns';

// Lazy-loaded components for performance optimization
const OfficerInfoFormModal = React.lazy(() =>
  import('./components/OfficerInfoFormModal/OfficerInfoFormModal').then(module => ({ default: module.default }))
);

interface OfficerInfoMgmtProps {
  className?: string;
}

const OfficerInfoMgmt: React.FC<OfficerInfoMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [officerInfos, setOfficerInfos] = useState<OfficerInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOfficerInfos, setSelectedOfficerInfos] = useState<OfficerInfo[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    create: false
  });

  // 필터 및 페이지네이션
  const [filters, setFilters] = useState<OfficerInfoFilters>({
    positionName: '',
    status: 'all',
    responsibilityChartName: '2025년 1차 이사회결의(예상)',
    hasOfficer: undefined
  });

  const [pagination, setPagination] = useState<OfficerInfoPagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0
  });

  // 모달 상태
  const [modalState, setModalState] = useState<OfficerInfoModalState>({
    isOpen: false,
    mode: 'create'
  });

  // 📊 Mock 데이터 및 통계
  const mockOfficerInfos: OfficerInfo[] = useMemo(() => [
    {
      id: '1',
      seq: 1,
      positionCode: 'POS001',
      positionName: '최고경영진',
      officerName: undefined,
      officerPosition: undefined,
      isDualPosition: false,
      status: 'test',
      isActive: true,
      responsibilityChartName: '2025년 1차 이사회결의(예상)',
      createdAt: '2025-09-18T09:00:00.000Z',
      createdBy: '관리자'
    },
    {
      id: '2',
      seq: 2,
      positionCode: 'POS002',
      positionName: '오토금융본부장',
      officerName: '김오토',
      officerPosition: '상무',
      isDualPosition: false,
      responsibilityAssignDate: '2025-08-01',
      requestDate: '2025-08-18',
      requesterPosition: '0000001',
      requesterName: 'FIT 1',
      approvalDate: '2025-08-18',
      approverPosition: '0000002',
      approverName: 'FIT 2',
      status: 'confirmed',
      isActive: true,
      responsibilityChartName: '2025년 1차 이사회결의(예상)',
      createdAt: '2025-09-15T14:30:00.000Z',
      createdBy: '관리자'
    },
    {
      id: '3',
      seq: 3,
      positionCode: 'POS003',
      positionName: '리스크관리본부장',
      officerName: '이리스크',
      officerPosition: '상무',
      isDualPosition: true,
      dualPositionDetails: '준법감시인 겸직',
      responsibilityAssignDate: '2025-08-01',
      requestDate: '2025-08-20',
      requesterPosition: '0000001',
      requesterName: 'FIT 1',
      status: 'pending',
      isActive: true,
      responsibilityChartName: '2025년 1차 이사회결의(예상)',
      createdAt: '2025-09-20T16:45:00.000Z',
      createdBy: '관리자'
    },
    {
      id: '4',
      seq: 4,
      positionCode: 'POS004',
      positionName: '영업본부장',
      officerName: '박영업',
      officerPosition: '전무',
      isDualPosition: false,
      responsibilityAssignDate: '2025-07-15',
      requestDate: '2025-07-20',
      requesterPosition: '0000003',
      requesterName: 'FIT 3',
      approvalDate: '2025-07-25',
      approverPosition: '0000004',
      approverName: 'FIT 4',
      status: 'approved',
      isActive: true,
      responsibilityChartName: '2025년 1차 이사회결의(예상)',
      createdAt: '2025-09-10T11:20:00.000Z',
      createdBy: '관리자'
    }
  ], []);

  // 📊 통계 계산
  const statistics: OfficerInfoStatistics = useMemo(() => {
    const total = mockOfficerInfos.length;
    const assigned = mockOfficerInfos.filter(item => item.officerName).length;
    const pending = mockOfficerInfos.filter(item => !item.officerName).length;
    const approvals = mockOfficerInfos.filter(item => item.status === 'pending').length;

    return {
      totalPositions: total,
      assignedOfficers: assigned,
      pendingAssignments: pending,
      pendingApprovals: approvals
    };
  }, [mockOfficerInfos]);

  // 🔍 필터링된 데이터
  const displayOfficerInfos = useMemo(() => {
    let filtered = [...mockOfficerInfos];

    // 직책명 필터
    if (filters.positionName) {
      filtered = filtered.filter(item =>
        item.positionName.toLowerCase().includes(filters.positionName!.toLowerCase())
      );
    }

    // 상태 필터
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // 임원 배정 여부 필터
    if (filters.hasOfficer !== undefined) {
      filtered = filtered.filter(item =>
        filters.hasOfficer ? !!item.officerName : !item.officerName
      );
    }

    return filtered;
  }, [mockOfficerInfos, filters]);

  // 초기 데이터 로드
  React.useEffect(() => {
    setOfficerInfos(displayOfficerInfos);
    setPagination(prev => ({
      ...prev,
      total: displayOfficerInfos.length,
      totalPages: Math.ceil(displayOfficerInfos.length / prev.pageSize)
    }));
  }, [displayOfficerInfos]);

  // 🔍 검색 필드 정의
  const searchFields: FilterField[] = [
    {
      key: 'positionName',
      label: '직책',
      type: 'text',
      placeholder: '직책명을 입력하세요'
    },
    {
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'test', label: '테스트' },
        { value: 'confirmed', label: '확정' },
        { value: 'pending', label: '승인대기' },
        { value: 'approved', label: '승인완료' },
        { value: 'rejected', label: '승인거부' }
      ]
    }
  ];

  // 🎯 이벤트 핸들러
  const handleFiltersChange = useCallback((values: Partial<FilterValues>) => {
    const newFilters: OfficerInfoFilters = {
      positionName: values.positionName as string || '',
      status: (values.status as OfficerInfoStatus) || 'all',
      responsibilityChartName: filters.responsibilityChartName
    };
    setFilters(newFilters);
  }, [filters.responsibilityChartName]);

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      // 검색 로직 (현재는 필터가 이미 적용됨)
      toast.success('검색이 완료되었습니다.');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: OfficerInfoFilters = {
      positionName: '',
      status: 'all',
      responsibilityChartName: filters.responsibilityChartName
    };
    setFilters(clearedFilters);
  }, [filters.responsibilityChartName]);

  const handleRowClick = useCallback((data: OfficerInfo) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      officerInfo: data
    });
  }, []);

  const handleRowDoubleClick = useCallback((data: OfficerInfo) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      officerInfo: data
    });
  }, []);

  const handleSelectionChange = useCallback((selectedRows: OfficerInfo[]) => {
    setSelectedOfficerInfos(selectedRows);
  }, []);

  const handleCreateOfficerInfo = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    try {
      // Excel 다운로드 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      toast.success('Excel 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Excel download error:', error);
      toast.error('Excel 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedOfficerInfos.length === 0) {
      toast.warning('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedOfficerInfos.length}개의 임원정보를 삭제하시겠습니까?`)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    try {
      // 삭제 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      setSelectedOfficerInfos([]);
      toast.success('선택한 임원정보가 삭제되었습니다.');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedOfficerInfos]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleModalSubmit = useCallback(async (formData: OfficerInfoFormData) => {
    setLoadingStates(prev => ({ ...prev, create: true }));

    try {
      if (modalState.mode === 'create') {
        // 생성 로직
        toast.success('임원정보가 등록되었습니다.');
      } else {
        // 수정 로직
        toast.success('임원정보가 수정되었습니다.');
      }
      handleModalClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  }, [modalState.mode, handleModalClose]);

  // 📊 통계 카드 정의
  const statsCards = [
    {
      icon: <AnalyticsIcon />,
      title: '전체 직책',
      value: statistics.totalPositions,
      color: 'primary' as const
    },
    {
      icon: <AssignmentIndIcon />,
      title: '임원 배정',
      value: statistics.assignedOfficers,
      color: 'success' as const
    },
    {
      icon: <TrendingUpIcon />,
      title: '배정 대기',
      value: statistics.pendingAssignments,
      color: 'warning' as const
    },
    {
      icon: <PendingActionsIcon />,
      title: '승인 대기',
      value: statistics.pendingApprovals,
      color: 'info' as const
    }
  ];

  // 🎯 액션 버튼 정의
  const actionButtons: ActionButton[] = [
    {
      label: '엑셀다운로드',
      variant: 'outlined',
      onClick: handleExcelDownload,
      loading: loadingStates.excel
    },
    {
      label: '임원 정보 등록',
      variant: 'contained',
      onClick: handleCreateOfficerInfo,
      loading: loadingStates.create
    },
    {
      label: '삭제',
      variant: 'outlined',
      color: 'error',
      onClick: handleDeleteSelected,
      loading: loadingStates.delete,
      disabled: selectedOfficerInfos.length === 0
    }
  ];

  // 📊 상태 정보
  const statusInfo: StatusInfo = {
    total: displayOfficerInfos.length,
    selected: selectedOfficerInfos.length,
    status: `총 ${displayOfficerInfos.length}개의 직책 중 ${statistics.assignedOfficers}개 임원 배정 완료`
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner centered text="임원정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🎯 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <AssignmentIndIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>임원정보관리</h1>
              <p className={styles.pageDescription}>
                책무기술서별 임원정보 등록 및 관리
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            {statsCards.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 검색 필터 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />
        </div>

        {/* 📋 액션바 */}
        <BaseActionBar
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayOfficerInfos}
          columns={officerInfoColumns}
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

      {/* 🎯 모달 */}
      <React.Suspense fallback={<LoadingSpinner text="모달을 불러오는 중..." />}>
        {modalState.isOpen && (
          <OfficerInfoFormModal
            open={modalState.isOpen}
            mode={modalState.mode}
            officerInfo={modalState.officerInfo}
            onClose={handleModalClose}
            onSubmit={handleModalSubmit}
            loading={loadingStates.create}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default OfficerInfoMgmt;