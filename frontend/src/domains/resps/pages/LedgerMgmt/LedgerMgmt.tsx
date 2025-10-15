// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LedgerMgmt.module.scss';

// Types
import type {
  LedgerOrder,
  LedgerOrderSearchFilter,
  CreateLedgerOrderDto,
  UpdateLedgerOrderDto
} from './types/ledgerOrder.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import usePagination from '@/shared/hooks/usePagination';
import useFilters from '@/shared/hooks/useFilters';

// Ledger specific components
import { ledgerOrderColumns } from './components/LedgerDataGrid/ledgerOrderColumns';

// Lazy-loaded components for performance optimization
const LedgerFormModal = React.lazy(() =>
  import('./components/LedgerFormModal').then(module => ({ default: module.default }))
);

interface LedgerModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedLedger: LedgerOrder | null;
}

interface LedgerMgmtProps {
  className?: string;
}

const LedgerMgmt: React.FC<LedgerMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [ledgers, setLedgers] = useState<LedgerOrder[]>([]);
  const [selectedLedgers, setSelectedLedgers] = useState<LedgerOrder[]>([]);

  // 커스텀 훅 사용
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: { key: 'ledger-search' },
    excel: { key: 'ledger-excel' },
    delete: { key: 'ledger-delete' },
    create: { key: 'ledger-create' },
    update: { key: 'ledger-update' }
  });

  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters
  } = useFilters<LedgerOrderSearchFilter>({
    searchKeyword: '',
    ledgerOrderStatus: '',
    year: ''
  });

  const {
    pagination,
    updateTotal,
    info: paginationInfo
  } = usePagination({
    initialPage: 1,
    initialSize: 20,
    total: 0
  });

  const [modalState, setModalState] = useState<LedgerModalState>({
    addModal: false,
    detailModal: false,
    selectedLedger: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<LedgerOrderSearchFilter>) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleAddLedger = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedLedger: null
    }));
    toast.info('새 원장차수를 등록해주세요.', { autoClose: 2000 });
  }, []);

  const handleExcelDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // TODO: 실제 엑셀 다운로드 API 호출
        await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
        console.log('엑셀 다운로드 완료');
      },
      {
        loading: '엑셀 파일을 생성 중입니다...',
        success: '엑셀 파일이 다운로드되었습니다.',
        error: '엑셀 다운로드에 실패했습니다.'
      }
    );
  }, [handlers.excel]);

  const handleDeleteLedgers = useCallback(async () => {
    if (selectedLedgers.length === 0) {
      toast.warning('삭제할 원장차수를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedLedgers.length}개의 원장차수를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    await handlers.delete.execute(
      async () => {
        // TODO: 실제 삭제 API 호출
        await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

        // 상태 업데이트 (삭제된 항목 제거)
        setLedgers(prev =>
          prev.filter(ledger => !selectedLedgers.some(selected => selected.ledgerOrderId === ledger.ledgerOrderId))
        );
        updateTotal(pagination.total - selectedLedgers.length);
        setSelectedLedgers([]);
      },
      {
        loading: `${selectedLedgers.length}개 원장차수를 삭제 중입니다...`,
        success: `${selectedLedgers.length}개 원장차수가 삭제되었습니다.`,
        error: '원장차수 삭제에 실패했습니다.'
      }
    );
  }, [selectedLedgers, handlers.delete, updateTotal, pagination.total]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedLedger: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleLedgerSave = useCallback(async (formData: CreateLedgerOrderDto) => {
    await handlers.create.execute(
      async () => {
        // TODO: API 호출로 원장차수 생성
        // const response = await ledgerOrderApi.create(formData);

        // 임시로 새 원장차수 객체 생성
        const newLedger: LedgerOrder = {
          ledgerOrderId: Date.now().toString().slice(-8),
          ledgerOrderTitle: formData.ledgerOrderTitle || '',
          ledgerOrderStatus: formData.ledgerOrderStatus || 'PROG',
          ledgerOrderRemarks: formData.ledgerOrderRemarks,
          createdBy: '현재사용자',
          createdAt: new Date().toISOString(),
          updatedBy: '현재사용자',
          updatedAt: new Date().toISOString()
        };

        setLedgers(prev => [newLedger, ...prev]);
        updateTotal(pagination.total + 1);
        handleModalClose();
      },
      {
        loading: '원장차수를 등록 중입니다...',
        success: '원장차수가 성공적으로 등록되었습니다.',
        error: '원장차수 등록에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.create, updateTotal, pagination.total]);

  const handleLedgerUpdate = useCallback(async (id: string, formData: UpdateLedgerOrderDto) => {
    await handlers.update.execute(
      async () => {
        // TODO: API 호출로 원장차수 수정
        // const response = await ledgerOrderApi.update(id, formData);

        // 임시로 기존 원장차수 업데이트
        setLedgers(prev =>
          prev.map(ledger =>
            ledger.ledgerOrderId === id
              ? {
                  ...ledger,
                  ledgerOrderTitle: formData.ledgerOrderTitle || ledger.ledgerOrderTitle,
                  ledgerOrderStatus: formData.ledgerOrderStatus || ledger.ledgerOrderStatus,
                  ledgerOrderRemarks: formData.ledgerOrderRemarks,
                  updatedAt: new Date().toISOString(),
                  updatedBy: '현재사용자'
                }
              : ledger
          )
        );

        handleModalClose();
      },
      {
        loading: '원장차수를 수정 중입니다...',
        success: '원장차수가 성공적으로 수정되었습니다.',
        error: '원장차수 수정에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.update]);

  const handleLedgerDetail = useCallback((ledger: LedgerOrder) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedLedger: ledger
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // TODO: 실제 API 호출로 교체
        await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
        console.log('검색 필터:', filters);
      },
      {
        loading: '원장차수 정보를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [filters, handlers.search]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters]);

  // Grid Event Handlers
  const handleRowClick = useCallback((ledger: LedgerOrder) => {
    console.log('행 클릭:', ledger);
  }, []);

  const handleRowDoubleClick = useCallback((ledger: LedgerOrder) => {
    handleLedgerDetail(ledger);
  }, [handleLedgerDetail]);

  const handleSelectionChange = useCallback((selected: LedgerOrder[]) => {
    setSelectedLedgers(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = ledgers.filter(l => l.ledgerOrderStatus === 'PROG').length;
    const closedCount = ledgers.filter(l => l.ledgerOrderStatus === 'CLSD').length;
    const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      activeCount,
      closedCount,
      systemUptime
    };
  }, [pagination.total, ledgers]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 원장차수',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.activeCount,
      label: '진행중 원장',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: `${statistics.systemUptime}%`,
      label: '시스템 가동률',
      color: 'default' as const
    }
  ], [statistics]);

  // Filtered ledgers for display (성능 최적화)
  const displayLedgers = useMemo(() => {
    return ledgers.map((ledger, index) => ({
      ...ledger,
      순번: index + 1
    }));
  }, [ledgers]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'searchKeyword',
      type: 'text',
      label: '검색어',
      placeholder: '원장차수ID, 제목, 비고 검색',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'ledgerOrderStatus',
      type: 'select',
      label: '원장상태',
      options: [
        { value: '', label: '전체' },
        { value: 'PROG', label: '진행중' },
        { value: 'CLSD', label: '종료' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'year',
      type: 'text',
      label: '년도',
      placeholder: 'YYYY',
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
      onClick: handleAddLedger
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteLedgers,
      disabled: selectedLedgers.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddLedger, handleDeleteLedgers, selectedLedgers.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '진행중',
      value: statistics.activeCount,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '종료',
      value: statistics.closedCount,
      color: 'default',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockLedgers: LedgerOrder[] = [
      {
        ledgerOrderId: '20250001',
        ledgerOrderTitle: '2025년도 1차 원장',
        ledgerOrderStatus: 'PROG',
        ledgerOrderRemarks: '2025년 1분기 원장차수',
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01T09:00:00',
        updatedBy: 'SYSTEM',
        updatedAt: '2025-01-01T09:00:00'
      },
      {
        ledgerOrderId: '20250002',
        ledgerOrderTitle: '2025년도 2차 원장',
        ledgerOrderStatus: 'PROG',
        ledgerOrderRemarks: '2025년 2분기 원장차수',
        createdBy: 'SYSTEM',
        createdAt: '2025-04-01T09:00:00',
        updatedBy: 'SYSTEM',
        updatedAt: '2025-04-01T09:00:00'
      },
      {
        ledgerOrderId: '20240004',
        ledgerOrderTitle: '2024년도 4차 원장',
        ledgerOrderStatus: 'CLSD',
        ledgerOrderRemarks: '2024년 4분기 원장차수 (종료)',
        createdBy: 'SYSTEM',
        createdAt: '2024-10-01T09:00:00',
        updatedBy: 'ADMIN',
        updatedAt: '2024-12-31T23:59:59'
      }
    ];

    setLedgers(mockLedgers);
    updateTotal(mockLedgers.length);
  }, [updateTotal]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 공통 페이지 헤더 */}
      <BasePageHeader
        icon={<DashboardIcon />}
        title="원장관리 시스템"
        description="원장차수 정보를 체계적으로 관리합니다"
        statistics={headerStatistics}
        i18nNamespace="resps"
      />

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 공통 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<LedgerOrderSearchFilter>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={anyLoading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 원장차수"
          selectedCount={selectedLedgers.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={anyLoading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayLedgers}
          columns={ledgerOrderColumns}
          loading={anyLoading}
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

      {/* 원장차수 등록/상세 모달 - BaseModalWrapper 적용 */}
      <BaseModalWrapper
        isOpen={modalState.addModal || modalState.detailModal}
        onClose={handleModalClose}
        ariaLabel="원장관리 모달"
        fallbackComponent={<LoadingSpinner text="원장 모달을 불러오는 중..." />}
      >
        <LedgerFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          ledger={modalState.selectedLedger}
          onClose={handleModalClose}
          onSave={handleLedgerSave}
          onUpdate={handleLedgerUpdate}
          loading={loadingStates.create || loadingStates.update}
        />
      </BaseModalWrapper>
    </div>
  );
};

export default LedgerMgmt;
