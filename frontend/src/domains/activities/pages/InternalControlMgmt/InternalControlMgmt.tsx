// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InternalControlMgmt.module.scss';

// Types
import type {
  InternalControlMgmt,
  InternalControlMgmtFilters,
  InternalControlMgmtFormData,
  InternalControlMgmtPagination,
  InternalControlMgmtStatistics,
  LoadingStates
} from './types/internalControlMgmt.types';

import {
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,
  USAGE_STATUS_OPTIONS,
  DEPARTMENT_OPTIONS
} from './types/internalControlMgmt.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Internal Control Management specific components
import { internalControlMgmtColumns } from './components/InternalControlMgmtDataGrid/internalControlMgmtColumns';

// Lazy-loaded components for performance optimization
const InternalControlFormModal = React.lazy(() =>
  import('./components/InternalControlFormModal/InternalControlFormModal').then(module => ({ default: module.default }))
);

interface InternalControlMgmtProps {
  className?: string;
}

const InternalControlMgmt: React.FC<InternalControlMgmtProps> = ({ className }) => {
  const { t } = useTranslation('activities');

  // State Management
  const [items, setItems] = useState<InternalControlMgmt[]>([]);
  const [selectedItems, setSelectedItems] = useState<InternalControlMgmt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    search: false,
    excel: false,
    delete: false,
  });

  const [filters, setFilters] = useState<InternalControlMgmtFilters>(DEFAULT_FILTERS);

  const [pagination, setPagination] = useState<InternalControlMgmtPagination>(DEFAULT_PAGINATION);

  // 통합 모달 상태 (PositionFormModal 방식)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'detail'>('create');
  const [selectedInternalControl, setSelectedInternalControl] = useState<InternalControlMgmt | null>(null);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<InternalControlMgmtFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddItem = useCallback(() => {
    setFormModalMode('create');
    setSelectedInternalControl(null);
    setFormModalOpen(true);
    toast.info('새 내부통제장치를 등록해주세요.', { autoClose: 2000 });
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

  const handleDeleteItems = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('삭제할 내부통제장치를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedItems.length}개의 내부통제장치를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedItems.length}개 내부통제장치를 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setItems(prev =>
        prev.filter(item => !selectedItems.some(selected => selected.id === item.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedItems.length
      }));
      setSelectedItems([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedItems.length}개 내부통제장치가 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '내부통제장치 삭제에 실패했습니다.');
      console.error('내부통제장치 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedItems]);

  // 통합 모달 핸들러들 (PositionFormModal 방식)
  const handleFormModalClose = useCallback(() => {
    setFormModalOpen(false);
    setSelectedInternalControl(null);
  }, []);

  const handleRowClick = useCallback((item: InternalControlMgmt) => {
    setSelectedItems([item]); // 선택된 아이템 설정
  }, []);

  const handleRowDoubleClick = useCallback((item: InternalControlMgmt) => {
    setFormModalMode('detail');
    setSelectedInternalControl(item);
    setFormModalOpen(true);
  }, []);

  // 폼 모달 핸들러들
  const handleItemSave = useCallback(async (formData: InternalControlMgmtFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 내부통제장치 생성

      // 임시로 새 항목 객체 생성
      const newItem: InternalControlMgmt = {
        id: Date.now().toString(),
        departmentName: formData.departmentName || '',
        managementActivityName: formData.managementActivityName,
        internalControl: formData.internalControl,
        unifiedNumber: formData.unifiedNumber,
        url: formData.url,
        applicationDate: formData.applicationDate,
        expirationDate: '2025-12-31', // 임시값
        isActive: true,
        status: '정상'
      };

      setItems(prev => [newItem, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleFormModalClose();
      toast.success('내부통제장치가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('내부통제장치 등록 실패:', error);
      toast.error('내부통제장치 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleFormModalClose]);

  const handleItemUpdate = useCallback(async (id: string, formData: InternalControlMgmtFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 내부통제장치 수정

      // 임시로 기존 항목 업데이트
      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                managementActivityName: formData.managementActivityName,
                internalControl: formData.internalControl,
                unifiedNumber: formData.unifiedNumber,
                url: formData.url,
                applicationDate: formData.applicationDate
              }
            : item
        )
      );

      handleFormModalClose();
      toast.success('내부통제장치가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('내부통제장치 수정 실패:', error);
      toast.error('내부통제장치 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleFormModalClose]);


  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('내부통제장치 정보를 검색 중입니다...');

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
    setFilters(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers - 중복 제거, 이미 위에서 정의됨

  const handleSelectionChange = useCallback((selected: InternalControlMgmt[]) => {
    setSelectedItems(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<InternalControlMgmtStatistics>(() => {
    const total = pagination.total;
    const active = items.filter(item => item.isActive).length;
    const inactive = items.filter(item => !item.isActive).length;

    // 만료 예정 건수 계산 (7일 이내)
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = items.filter(item => {
      const expirationDate = new Date(item.expirationDate.replace(/\./g, '-'));
      return expirationDate <= sevenDaysLater && expirationDate >= now;
    }).length;

    return {
      total,
      active,
      inactive,
      expiringSoon
    };
  }, [pagination.total, items]);

  // Filtered items for display (성능 최적화)
  const displayItems = useMemo(() => {
    return items; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [items]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'departmentName',
      type: 'select',
      label: '부정명',
      options: DEPARTMENT_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'applicationDateFrom',
      type: 'text', // date 타입은 현재 지원되지 않으므로 text로 변경
      label: '적용일자 (시작)',
      placeholder: 'YYYY-MM-DD',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'applicationDateTo',
      type: 'text', // date 타입은 현재 지원되지 않으므로 text로 변경
      label: '적용일자 (종료)',
      placeholder: 'YYYY-MM-DD',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'isActive',
      type: 'select',
      label: '사용여부',
      options: USAGE_STATUS_OPTIONS,
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
      onClick: handleAddItem
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteItems,
      disabled: selectedItems.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddItem, handleDeleteItems, selectedItems.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.active,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '비활성',
      value: statistics.inactive,
      color: 'default',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    _id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 InternalControlMgmt Performance Profiler`);
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
    const mockItems: InternalControlMgmt[] = [
      {
        id: '1',
        sequence: 1,
        departmentName: '경영진단본부',
        managementActivityName: '리스크 평가',
        internalControl: '리스크관리시스템',
        unifiedNumber: 'IC2024001',
        url: 'https://risk.example.com',
        applicationDate: '2024-01-15',
        expirationDate: '2024-12-31',
        isActive: true,
        status: '정상'
      },
      {
        id: '2',
        sequence: 2,
        departmentName: '총합기획부',
        managementActivityName: '예산 편성',
        internalControl: '예산관리시스템',
        unifiedNumber: 'IC2024002',
        url: 'https://budget.example.com',
        applicationDate: '2024-02-01',
        expirationDate: '2024-12-31',
        isActive: true,
        status: '정상'
      },
      {
        id: '3',
        sequence: 3,
        departmentName: '정보보호부',
        managementActivityName: '보안 관리',
        internalControl: '보안관리시스템',
        unifiedNumber: 'IC2024003',
        url: 'https://security.example.com',
        applicationDate: '2024-03-01',
        expirationDate: '2024-12-31',
        isActive: true,
        status: '정상'
      },
      {
        id: '4',
        sequence: 4,
        departmentName: '품질관리부',
        managementActivityName: '품질 평가',
        internalControl: '품질관리시스템',
        unifiedNumber: 'IC2024004',
        url: 'https://quality.example.com',
        applicationDate: '2024-04-01',
        expirationDate: '2024-11-30',
        isActive: false,
        status: '비활성'
      },
      {
        id: '5',
        sequence: 5,
        departmentName: '내부감사부',
        managementActivityName: '감사 실시',
        internalControl: '감사관리시스템',
        unifiedNumber: 'IC2024005',
        url: 'https://audit.example.com',
        applicationDate: '2024-05-01',
        expirationDate: '2025-04-30',
        isActive: true,
        status: '정상'
      }
    ];

    setItems(mockItems);
    setPagination(prev => ({
      ...prev,
      total: mockItems.length,
      totalPages: Math.ceil(mockItems.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="InternalControlMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('internalControl.management.title', '내부통제장치관리')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('internalControl.management.description', '타 내부통제 시스템과 관리활동 간의 매핑 관계를 관리합니다')}
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
                  <div className={styles.statLabel}>총 매핑</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <SecurityIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.active}
                  </div>
                  <div className={styles.statLabel}>활성 매핑</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.expiringSoon}</div>
                  <div className={styles.statLabel}>만료 예정</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<InternalControlMgmtFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 내부통제장치 수"
            selectedCount={selectedItems.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayItems}
            columns={internalControlMgmtColumns}
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

        {/* 내부통제장치 등록/상세 통합 모달 (PositionFormModal 방식) */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <InternalControlFormModal
            open={formModalOpen}
            mode={formModalMode}
            internalControl={selectedInternalControl}
            onClose={handleFormModalClose}
            onSave={handleItemSave}
            onUpdate={handleItemUpdate}
            loading={loading}
          />
        </React.Suspense>
      </div>
    </React.Profiler>
  );
};

InternalControlMgmt.displayName = 'InternalControlMgmt';

export default InternalControlMgmt;