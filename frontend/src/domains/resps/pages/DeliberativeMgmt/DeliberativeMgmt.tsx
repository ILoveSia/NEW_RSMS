// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DeliberativeMgmt.module.scss';

// Types
import type {
  Deliberative,
  DeliberativeFilters,
  DeliberativeFormData,
  DeliberativeModalState,
  DeliberativePagination
} from './types/deliberative.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Deliberative specific components
import { deliberativeColumns } from './components/DeliberativeDataGrid/deliberativeColumns';

// Lazy-loaded components for performance optimization
const DeliberativeFormModal = React.lazy(() =>
  import('./components/DeliberativeFormModal').then(module => ({ default: module.default }))
);

interface DeliberativeMgmtProps {
  className?: string;
}

const DeliberativeMgmt: React.FC<DeliberativeMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [deliberatives, setDeliberatives] = useState<Deliberative[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDeliberatives, setSelectedDeliberatives] = useState<Deliberative[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    reorder: false
  });

  const [filters, setFilters] = useState<DeliberativeFilters>({
    name: '',
    chairperson: '',
    isActive: '',
    holdingPeriod: ''
  });

  const [pagination, setPagination] = useState<DeliberativePagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<DeliberativeModalState>({
    addModal: false,
    detailModal: false,
    selectedDeliberative: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<DeliberativeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddDeliberative = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedDeliberative: null
    }));
    toast.info('새 회의체를 등록해주세요.', { autoClose: 2000 });
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
      console.log('회의체 엑셀 다운로드 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteDeliberatives = useCallback(async () => {
    if (selectedDeliberatives.length === 0) {
      toast.warning('삭제할 회의체를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedDeliberatives.length}개의 회의체를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedDeliberatives.length}개 회의체를 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setDeliberatives(prev =>
        prev.filter(deliberative => !selectedDeliberatives.some(selected => selected.id === deliberative.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedDeliberatives.length
      }));
      setSelectedDeliberatives([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedDeliberatives.length}개 회의체가 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '회의체 삭제에 실패했습니다.');
      console.error('회의체 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedDeliberatives]);

  const handleReorderUp = useCallback(async () => {
    if (selectedDeliberatives.length !== 1) {
      toast.warning('순서를 변경할 회의체를 하나만 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, reorder: true }));

    try {
      // TODO: 실제 순서 변경 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('순서가 변경되었습니다.');
    } catch (error) {
      toast.error('순서 변경에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, reorder: false }));
    }
  }, [selectedDeliberatives]);

  const handleReorderDown = useCallback(async () => {
    if (selectedDeliberatives.length !== 1) {
      toast.warning('순서를 변경할 회의체를 하나만 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, reorder: true }));

    try {
      // TODO: 실제 순서 변경 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('순서가 변경되었습니다.');
    } catch (error) {
      toast.error('순서 변경에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, reorder: false }));
    }
  }, [selectedDeliberatives]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedDeliberative: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleDeliberativeSave = useCallback(async (formData: DeliberativeFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 회의체 생성
      // const response = await deliberativeApi.create(formData);

      // 임시로 새 회의체 객체 생성
      const newDeliberative: Deliberative = {
        id: Date.now().toString(),
        seq: deliberatives.length + 1,
        name: formData.name,
        holdingPeriod: formData.holdingPeriod,
        chairperson: formData.members.find(m => m.type === 'chairman')?.name || '',
        members: formData.members.filter(m => m.type === 'member').map(m => m.name).join(', '),
        mainAgenda: formData.mainAgenda,
        registrationDate: new Date().toISOString().split('T')[0],
        registrar: '현재사용자',
        registrarPosition: '관리자',
        isActive: formData.isActive
      };

      setDeliberatives(prev => [newDeliberative, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('회의체가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('회의체 등록 실패:', error);
      toast.error('회의체 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [deliberatives.length, handleModalClose]);

  const handleDeliberativeUpdate = useCallback(async (id: string, formData: DeliberativeFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 회의체 수정
      // const response = await deliberativeApi.update(id, formData);

      // 임시로 기존 회의체 업데이트
      setDeliberatives(prev =>
        prev.map(deliberative =>
          deliberative.id === id
            ? {
                ...deliberative,
                name: formData.name,
                holdingPeriod: formData.holdingPeriod,
                chairperson: formData.members.find(m => m.type === 'chairman')?.name || '',
                members: formData.members.filter(m => m.type === 'member').map(m => m.name).join(', '),
                mainAgenda: formData.mainAgenda,
                modificationDate: new Date().toISOString().split('T')[0],
                modifier: '현재사용자',
                isActive: formData.isActive
              }
            : deliberative
        )
      );

      handleModalClose();
      toast.success('회의체가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('회의체 수정 실패:', error);
      toast.error('회의체 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleDeliberativeDetail = useCallback((deliberative: Deliberative) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedDeliberative: deliberative
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('회의체 정보를 검색 중입니다...');

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
      name: '',
      chairperson: '',
      isActive: '',
      holdingPeriod: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((deliberative: Deliberative) => {
    console.log('행 클릭:', deliberative);
  }, []);

  const handleRowDoubleClick = useCallback((deliberative: Deliberative) => {
    handleDeliberativeDetail(deliberative);
  }, [handleDeliberativeDetail]);

  const handleSelectionChange = useCallback((selected: Deliberative[]) => {
    setSelectedDeliberatives(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = deliberatives.filter(d => d.isActive).length;
    const inactiveCount = deliberatives.filter(d => !d.isActive).length;
    const monthlyCount = deliberatives.filter(d => d.holdingPeriod === 'monthly').length;

    return {
      total,
      activeCount,
      inactiveCount,
      monthlyCount
    };
  }, [pagination.total, deliberatives]);

  // Filtered deliberatives for display (성능 최적화)
  const displayDeliberatives = useMemo(() => {
    return deliberatives; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [deliberatives]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'name',
      type: 'text',
      label: '회의체명',
      placeholder: '회의체명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'chairperson',
      type: 'text',
      label: '위원장',
      placeholder: '위원장명을 입력하세요',
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
    },
    {
      key: 'holdingPeriod',
      type: 'select',
      label: '개최주기',
      options: [
        { value: '', label: '전체' },
        { value: 'monthly', label: '월' },
        { value: 'quarterly', label: '분기' },
        { value: 'semiannually', label: '반기' },
        { value: 'annually', label: '년' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
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
    },
    {
      key: 'add',
      type: 'add',
      label: '등록',
      onClick: handleAddDeliberative
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteDeliberatives,
      disabled: selectedDeliberatives.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    },
    {
      key: 'up',
      type: 'custom',
      label: 'UP',
      onClick: handleReorderUp,
      disabled: selectedDeliberatives.length !== 1 || loadingStates.reorder,
      loading: loadingStates.reorder && selectedDeliberatives.length === 1
    },
    {
      key: 'down',
      type: 'custom',
      label: 'DOWN',
      onClick: handleReorderDown,
      disabled: selectedDeliberatives.length !== 1 || loadingStates.reorder,
      loading: loadingStates.reorder && selectedDeliberatives.length === 1
    }
  ], [handleExcelDownload, handleAddDeliberative, handleDeleteDeliberatives, handleReorderUp, handleReorderDown, selectedDeliberatives.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.activeCount,
      color: 'success',
      icon: <GroupIcon />
    },
    {
      label: '비활성',
      value: statistics.inactiveCount,
      color: 'default',
      icon: <GroupIcon />
    }
  ], [statistics]);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockDeliberatives: Deliberative[] = [
      {
        id: '1',
        seq: 1,
        name: '리스크관리위원회',
        holdingPeriod: 'monthly',
        chairperson: '김위원장',
        members: '박이사, 이상무, 최전무',
        mainAgenda: '리스크 관리 방안 및 정책 수립, 리스크 한도 관리',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '2',
        seq: 2,
        name: '감사위원회',
        holdingPeriod: 'quarterly',
        chairperson: '이위원장',
        members: '김감사, 박감사, 최감사',
        mainAgenda: '내부감사 계획 수립 및 실행, 감사결과 보고',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '3',
        seq: 3,
        name: '보상위원회',
        holdingPeriod: 'semiannually',
        chairperson: '박위원장',
        members: '김임원, 이임원, 최임원, 정임원',
        mainAgenda: '임원 보상 정책 및 지급 기준 결정',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '4',
        seq: 4,
        name: '투자위원회',
        holdingPeriod: 'monthly',
        chairperson: '최위원장',
        members: '김전무, 이상무, 박전무',
        mainAgenda: '투자 정책 및 전략 수립, 투자 승인',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '5',
        seq: 5,
        name: '준법감시위원회',
        holdingPeriod: 'quarterly',
        chairperson: '정위원장',
        members: '김준법, 이준법, 박준법',
        mainAgenda: '준법감시 업무 및 법규 준수 점검',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: false
      }
    ];

    setDeliberatives(mockDeliberatives);
    setPagination(prev => ({
      ...prev,
      total: mockDeliberatives.length,
      totalPages: Math.ceil(mockDeliberatives.length / prev.size)
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
                {t('deliberative.management.title', '회의체관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('deliberative.management.description', '금융감독원 제출 대상 회의체 정보를 체계적으로 관리합니다')}
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
                <div className={styles.statLabel}>총 회의체</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GroupIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.activeCount}
                </div>
                <div className={styles.statLabel}>활성 회의체</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.monthlyCount}</div>
                <div className={styles.statLabel}>월별 회의체</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<DeliberativeFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 회의체 수"
          selectedCount={selectedDeliberatives.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayDeliberatives}
          columns={deliberativeColumns}
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

      {/* 회의체 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <DeliberativeFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          deliberative={modalState.selectedDeliberative}
          onClose={handleModalClose}
          onSave={handleDeliberativeSave}
          onUpdate={handleDeliberativeUpdate}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

export default DeliberativeMgmt;
