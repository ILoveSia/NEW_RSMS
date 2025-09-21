// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InternalControlRegister.module.scss';

// Types
import type {
  InternalControlRegister as InternalControlRegisterType,
  InternalControlRegisterFilters,
  InternalControlRegisterFormData,
  InternalControlRegisterModalState,
  InternalControlRegisterPagination
} from './types/internalControlRegister.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// InternalControlRegister specific components
import { internalControlColumns } from './components/InternalControlDataGrid/internalControlColumns';

// Lazy-loaded components for performance optimization
const InternalControlFormModal = React.lazy(() =>
  import('./components/InternalControlFormModal').then(module => ({ default: module.default }))
);

interface InternalControlRegisterProps {
  className?: string;
}

const InternalControlRegister: React.FC<InternalControlRegisterProps> = ({ className }) => {
  const { t } = useTranslation('activities');

  // State Management
  const [internalControls, setInternalControls] = useState<InternalControlRegisterType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<InternalControlRegisterType[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    add: false,
    save: false,
    delete: false,
    copy: false,
  });

  const [filters, setFilters] = useState<InternalControlRegisterFilters>({
    businessAreaName: '',
    businessAreaCode: '',
    isActive: 'Y' // 기본값: 사용
  });

  const [pagination, setPagination] = useState<InternalControlRegisterPagination>({
    page: 1,
    size: 25,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<InternalControlRegisterModalState>({
    addModal: false,
    detailModal: false,
    selectedItem: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<InternalControlRegisterFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddItem = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedItem: null
    }));
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

  const handleSaveItems = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('저장할 항목을 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, save: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedItems.length}개 항목을 저장 중입니다...`);

    try {
      // TODO: 실제 저장 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedItems.length}개 항목이 저장되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '항목 저장에 실패했습니다.');
      console.error('항목 저장 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  }, [selectedItems]);

  const handleDeleteItems = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('삭제할 항목을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedItems.length}개의 항목을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedItems.length}개 항목을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setInternalControls(prev =>
        prev.filter(item => !selectedItems.some(selected => selected.id === item.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedItems.length
      }));
      setSelectedItems([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedItems.length}개 항목이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '항목 삭제에 실패했습니다.');
      console.error('항목 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedItems]);

  const handleCopyItems = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('복사할 항목을 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, copy: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedItems.length}개 항목을 복사 중입니다...`);

    try {
      // TODO: 실제 복사 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 복사된 항목들 생성 (ID 새로 생성)
      const copiedItems = selectedItems.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        businessAreaName: `${item.businessAreaName} (복사본)`,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: '현재사용자'
      }));

      setInternalControls(prev => [...copiedItems, ...prev]);
      setPagination(prev => ({
        ...prev,
        total: prev.total + copiedItems.length
      }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedItems.length}개 항목이 복사되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '항목 복사에 실패했습니다.');
      console.error('항목 복사 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, copy: false }));
    }
  }, [selectedItems]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedItem: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleItemSave = useCallback(async (formData: InternalControlRegisterFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 내부통제장치 생성
      // const response = await internalControlApi.create(formData);

      // 임시로 새 내부통제장치 객체 생성
      const newItem: InternalControlRegisterType = {
        id: Date.now().toString(),
        sequence: internalControls.length + 1,
        businessAreaName: formData.businessAreaName,
        businessAreaCode: formData.businessAreaCode,
        businessAreaCodeDuplicate: formData.businessAreaCode,
        utilizationStatus: formData.utilizationStatus,
        utilizationDetail: formData.utilizationDetail,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: '현재사용자',
        modifiedDate: new Date().toISOString().split('T')[0],
        modifiedBy: '현재사용자'
      };

      setInternalControls(prev => [newItem, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('내부통제장치가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('내부통제장치 등록 실패:', error);
      toast.error('내부통제장치 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose, internalControls.length]);

  const handleItemUpdate = useCallback(async (id: string, formData: InternalControlRegisterFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 내부통제장치 수정
      // const response = await internalControlApi.update(id, formData);

      // 임시로 기존 내부통제장치 업데이트
      setInternalControls(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                businessAreaName: formData.businessAreaName,
                businessAreaCode: formData.businessAreaCode,
                businessAreaCodeDuplicate: formData.businessAreaCode,
                utilizationStatus: formData.utilizationStatus,
                utilizationDetail: formData.utilizationDetail,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
                modifiedDate: new Date().toISOString().split('T')[0],
                modifiedBy: '현재사용자'
              }
            : item
        )
      );

      handleModalClose();
      toast.success('내부통제장치가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('내부통제장치 수정 실패:', error);
      toast.error('내부통제장치 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleItemDetail = useCallback((item: InternalControlRegisterType) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedItem: item
    }));
  }, []);

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
    setFilters({
      businessAreaName: '',
      businessAreaCode: '',
      isActive: 'Y'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((item: InternalControlRegisterType) => {
    console.log('행 클릭:', item);
  }, []);

  const handleRowDoubleClick = useCallback((item: InternalControlRegisterType) => {
    handleItemDetail(item);
  }, [handleItemDetail]);

  const handleSelectionChange = useCallback((selected: InternalControlRegisterType[]) => {
    setSelectedItems(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = internalControls.filter(item => item.isActive).length;
    const inactiveCount = internalControls.filter(item => !item.isActive).length;
    const externalSystemCount = 1; // TODO: 실제 외부통제장치 현황 API 연동
    const systemUptime = 99.2; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      activeCount,
      inactiveCount,
      externalSystemCount,
      systemUptime
    };
  }, [pagination.total, internalControls]);

  // Filtered items for display (성능 최적화)
  const displayItems = useMemo(() => {
    return internalControls; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [internalControls]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'businessAreaName',
      type: 'text',
      label: '업무영역명',
      placeholder: '업무영역명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'isActive',
      type: 'select',
      label: '사용여부',
      options: [
        { value: '', label: '전체' },
        { value: 'Y', label: '사용' },
        { value: 'N', label: '미사용' }
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
      onClick: handleAddItem,
      disabled: loadingStates.add,
      loading: loadingStates.add
    },
    {
      key: 'save',
      type: 'save',
      onClick: handleSaveItems,
      disabled: selectedItems.length === 0 || loadingStates.save,
      loading: loadingStates.save
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteItems,
      disabled: selectedItems.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    },
    {
      key: 'copy',
      type: 'copy',
      onClick: handleCopyItems,
      disabled: selectedItems.length === 0 || loadingStates.copy,
      loading: loadingStates.copy
    }
  ], [
    handleExcelDownload, handleAddItem, handleSaveItems, handleDeleteItems, handleCopyItems,
    selectedItems.length, loadingStates
  ]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '외부통제장치 현황',
      value: statistics.externalSystemCount,
      color: 'primary',
      icon: <BusinessIcon />
    }
  ], [statistics]);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockData: InternalControlRegisterType[] = [
      {
        id: '1',
        sequence: 1,
        businessAreaName: 'WRS',
        businessAreaCode: 'WRS',
        businessAreaCodeDuplicate: 'A0101',
        utilizationStatus: '내부통제원부',
        utilizationDetail: '내부통제원부상세',
        sortOrder: 1,
        isActive: true,
        createdDate: '2024-01-15',
        createdBy: '관리자',
        modifiedDate: '2024-01-15',
        modifiedBy: '관리자'
      }
    ];

    setInternalControls(mockData);
    setPagination(prev => ({
      ...prev,
      total: mockData.length,
      totalPages: Math.ceil(mockData.length / prev.size)
    }));
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <SecurityIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('internalControl.management.title', '내부통제장치등록')}
              </h1>
              <p className={styles.pageDescription}>
                {t('internalControl.management.description', '타 내부통제 시스템 정보를 등록하고 관리합니다')}
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
                <div className={styles.statLabel}>총 내부통제장치</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SettingsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.activeCount}
                </div>
                <div className={styles.statLabel}>활성 장치</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <BusinessIcon />
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<InternalControlRegisterFilters>)}
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
          columns={internalControlColumns}
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

      {/* 내부통제장치 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <InternalControlFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          item={modalState.selectedItem}
          onClose={handleModalClose}
          onSave={handleItemSave}
          onUpdate={handleItemUpdate}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

export default InternalControlRegister;