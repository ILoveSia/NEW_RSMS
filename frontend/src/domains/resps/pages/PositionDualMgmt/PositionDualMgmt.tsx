// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PositionDualMgmt.module.scss';

// Types
import type {
  PositionDual,
  PositionDualFilters,
  PositionDualFormData,
  PositionDualModalState,
  PositionDualPagination
} from './types/positionDual.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// PositionDual specific components
import { positionDualColumns } from './components/PositionDualDataGrid/positionDualColumns';

// Lazy-loaded components for performance optimization
const PositionDualFormModal = React.lazy(() =>
  import('./components/PositionDualFormModal').then(module => ({ default: module.default }))
);

interface PositionDualMgmtProps {
  className?: string;
}

const PositionDualMgmt: React.FC<PositionDualMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [positionDuals, setPositionDuals] = useState<PositionDual[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPositionDuals, setSelectedPositionDuals] = useState<PositionDual[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    reorder: false
  });

  const [filters, setFilters] = useState<PositionDualFilters>({
    positionName: '',
    isActive: '',
    isRepresentative: '',
    concurrentStatusCode: ''
  });

  const [pagination, setPagination] = useState<PositionDualPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<PositionDualModalState>({
    addModal: false,
    detailModal: false,
    selectedPositionDual: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<PositionDualFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddPositionDual = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedPositionDual: null
    }));
    toast.info('새 겸직 관계를 등록해주세요.', { autoClose: 2000 });
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
      console.log('직책겸직 엑셀 다운로드 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeletePositionDuals = useCallback(async () => {
    if (selectedPositionDuals.length === 0) {
      toast.warning('삭제할 겸직 관계를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedPositionDuals.length}개의 겸직 관계를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedPositionDuals.length}개 겸직 관계를 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setPositionDuals(prev =>
        prev.filter(positionDual => !selectedPositionDuals.some(selected => selected.id === positionDual.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedPositionDuals.length
      }));
      setSelectedPositionDuals([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedPositionDuals.length}개 겸직 관계가 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '겸직 관계 삭제에 실패했습니다.');
      console.error('겸직 관계 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedPositionDuals]);


  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedPositionDual: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handlePositionDualSave = useCallback(async (formData: PositionDualFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 겸직 관계 생성
      // const response = await positionDualApi.create(formData);

      // 임시로 새 겸직 관계 객체들 생성
      const newPositionDuals: PositionDual[] = formData.positions.map((position, index) => ({
        id: `${Date.now()}_${index}`,
        seq: positionDuals.length + index + 1,
        concurrentStatusCode: formData.concurrentStatusCode,
        positionCode: position.positionCode,
        positionName: position.positionName,
        isRepresentative: position.isRepresentative,
        departmentName: position.departmentName,
        registrationDate: new Date().toISOString().split('T')[0],
        registrar: '현재사용자',
        registrarPosition: '관리자',
        isActive: position.isActive
      }));

      setPositionDuals(prev => [...newPositionDuals, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + newPositionDuals.length }));
      handleModalClose();
      toast.success('겸직 관계가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('겸직 관계 등록 실패:', error);
      toast.error('겸직 관계 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [positionDuals.length, handleModalClose]);

  const handlePositionDualUpdate = useCallback(async (id: string, formData: PositionDualFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 겸직 관계 수정
      // const response = await positionDualApi.update(id, formData);

      // 임시로 기존 겸직 관계 업데이트
      setPositionDuals(prev =>
        prev.map(positionDual => {
          if (positionDual.concurrentStatusCode === formData.concurrentStatusCode) {
            const updatedPosition = formData.positions.find(p => p.positionCode === positionDual.positionCode);
            return updatedPosition ? {
              ...positionDual,
              isRepresentative: updatedPosition.isRepresentative,
              isActive: updatedPosition.isActive,
              modificationDate: new Date().toISOString().split('T')[0],
              modifier: '현재사용자',
              modifierPosition: '관리자'
            } : positionDual;
          }
          return positionDual;
        })
      );

      handleModalClose();
      toast.success('겸직 관계가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('겸직 관계 수정 실패:', error);
      toast.error('겸직 관계 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handlePositionDualDetail = useCallback((positionDual: PositionDual) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedPositionDual: positionDual
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('겸직 관계 정보를 검색 중입니다...');

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
      positionName: '',
      isActive: '',
      isRepresentative: '',
      concurrentStatusCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((positionDual: PositionDual) => {
    console.log('행 클릭:', positionDual);
  }, []);

  const handleRowDoubleClick = useCallback((positionDual: PositionDual) => {
    handlePositionDualDetail(positionDual);
  }, [handlePositionDualDetail]);

  const handleSelectionChange = useCallback((selected: PositionDual[]) => {
    setSelectedPositionDuals(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = positionDuals.filter(d => d.isActive).length;
    const representativeCount = positionDuals.filter(d => d.isRepresentative).length;
    const inactiveCount = positionDuals.filter(d => !d.isActive).length;

    return {
      total,
      activeCount,
      representativeCount,
      inactiveCount
    };
  }, [pagination.total, positionDuals]);

  // Filtered position duals for display (성능 최적화)
  const displayPositionDuals = useMemo(() => {
    return positionDuals; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [positionDuals]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'positionName',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'concurrentStatusCode',
      type: 'text',
      label: '겸직현황코드',
      placeholder: '겸직현황코드를 입력하세요',
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
      key: 'isRepresentative',
      type: 'select',
      label: '대표여부',
      options: [
        { value: '', label: '전체' },
        { value: 'Y', label: '대표' },
        { value: 'N', label: '일반' }
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
      onClick: handleAddPositionDual
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeletePositionDuals,
      disabled: selectedPositionDuals.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddPositionDual, handleDeletePositionDuals, selectedPositionDuals.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.activeCount,
      color: 'success',
      icon: <GroupIcon />
    },
    {
      label: '대표',
      value: statistics.representativeCount,
      color: 'primary',
      icon: <FlagIcon />
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
    const mockPositionDuals: PositionDual[] = [
      {
        id: '1',
        seq: 1,
        concurrentStatusCode: 'G001',
        positionCode: 'R106',
        positionName: '오토금융본부장',
        isRepresentative: true,
        departmentName: '오토금융본부',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2025-09-15',
        modifier: '홍길동',
        modifierPosition: '부서장',
        isActive: true
      },
      {
        id: '2',
        seq: 2,
        concurrentStatusCode: 'G001',
        positionCode: 'R107',
        positionName: '오토채널본부장',
        isRepresentative: false,
        departmentName: '오토채널본부',
        registrationDate: '2025-08-13',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '3',
        seq: 3,
        concurrentStatusCode: 'G002',
        positionCode: 'R001',
        positionName: '대표이사',
        isRepresentative: true,
        departmentName: 'CEO',
        registrationDate: '2025-08-21',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2025-09-18',
        modifier: '김철수',
        modifierPosition: '인사팀장',
        isActive: true
      },
      {
        id: '4',
        seq: 4,
        concurrentStatusCode: 'G002',
        positionCode: 'R003',
        positionName: '준법감시인',
        isRepresentative: false,
        departmentName: '준법감시인',
        registrationDate: '2025-08-21',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '5',
        seq: 5,
        concurrentStatusCode: 'G003',
        positionCode: 'R002',
        positionName: '감사본부장',
        isRepresentative: true,
        departmentName: '감사본부',
        registrationDate: '2025-08-21',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2025-09-10',
        modifier: '이영희',
        modifierPosition: '감사팀장',
        isActive: true
      },
      {
        id: '6',
        seq: 6,
        concurrentStatusCode: 'G003',
        positionCode: 'R004',
        positionName: '경영전략본부장',
        isRepresentative: false,
        departmentName: '경영전략본부',
        registrationDate: '2025-08-21',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        isActive: true
      },
      {
        id: '7',
        seq: 7,
        concurrentStatusCode: 'G004',
        positionCode: 'R000',
        positionName: '이사회의장',
        isRepresentative: false,
        departmentName: '이사회',
        registrationDate: '2025-08-21',
        registrar: '관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2025-09-17',
        modifier: '박민수',
        modifierPosition: '이사회사무국장',
        isActive: false
      }
    ];

    // 겸직현황코드별로 정렬 (셀 병합을 위해)
    const sortedPositionDuals = mockPositionDuals.sort((a, b) => {
      // 1차: 겸직현황코드로 정렬
      if (a.concurrentStatusCode !== b.concurrentStatusCode) {
        return a.concurrentStatusCode.localeCompare(b.concurrentStatusCode);
      }
      // 2차: 대표여부로 정렬 (대표가 먼저)
      if (a.isRepresentative !== b.isRepresentative) {
        return a.isRepresentative ? -1 : 1;
      }
      // 3차: 순번으로 정렬
      return a.seq - b.seq;
    });

    setPositionDuals(sortedPositionDuals);
    setPagination(prev => ({
      ...prev,
      total: mockPositionDuals.length,
      totalPages: Math.ceil(mockPositionDuals.length / prev.size)
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
                {t('positionDual.management.title', '직책겸직관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('positionDual.management.description', '직책별 겸직 현황을 체계적으로 관리합니다')}
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
                <div className={styles.statLabel}>총 겸직</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FlagIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.representativeCount}
                </div>
                <div className={styles.statLabel}>대표 직책</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.activeCount}</div>
                <div className={styles.statLabel}>활성 겸직</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<PositionDualFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 겸직 관계 수"
          selectedCount={selectedPositionDuals.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayPositionDuals}
          columns={positionDualColumns}
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

      {/* 겸직 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <PositionDualFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          positionDual={modalState.selectedPositionDual}
          onClose={handleModalClose}
          onSave={handlePositionDualSave}
          onUpdate={handlePositionDualUpdate}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

export default PositionDualMgmt;
