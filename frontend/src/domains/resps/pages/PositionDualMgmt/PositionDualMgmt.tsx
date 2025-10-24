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

// Domain Components
import { LedgerOrderComboBox } from '../../components/molecules/LedgerOrderComboBox';

// API
import {
  getPositionConcurrents,
  getPositionConcurrentsByGroup,
  type PositionConcurrentDto
} from '../../api/positionApi';

// PositionDual specific components
import { getPositionDualColumns } from './components/PositionDualDataGrid/positionDualColumns';

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
    ledgerOrderId: '',
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

  // 상세조회용 겸직 그룹 데이터
  const [selectedGroupData, setSelectedGroupData] = useState<PositionConcurrentDto[]>([]);

  /**
   * PositionConcurrentDto -> PositionDual 변환
   * - Backend DTO를 Frontend 타입으로 변환
   */
  const convertToPositionDual = useCallback((dto: PositionConcurrentDto, index: number): PositionDual => {
    return {
      id: dto.positionConcurrentId.toString(),
      seq: index + 1,
      concurrentStatusCode: dto.concurrentGroupCd,
      positionCode: dto.positionsCd,
      positionName: dto.positionsName,
      isRepresentative: dto.isRepresentative === 'Y',
      hpName: dto.hqName || '',
      registrationDate: dto.createdAt ? dto.createdAt.split('T')[0] : '',
      registrar: dto.createdBy,
      registrarPosition: '',
      modificationDate: dto.updatedAt ? dto.updatedAt.split('T')[0] : undefined,
      modifier: dto.updatedBy || undefined,
      modifierPosition: undefined,
      isActive: dto.isActive === 'Y'
    };
  }, []);

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
  const handlePositionDualSave = useCallback(async (_formData: PositionDualFormData) => {
    try {
      setLoading(true);

      // API 호출은 PositionDualFormModal에서 이미 처리됨
      // 여기서는 데이터를 다시 조회만 하면 됨
      if (filters.ledgerOrderId) {
        const dtos = await getPositionConcurrents(filters.ledgerOrderId);
        const convertedData = dtos.map((dto, index) => convertToPositionDual(dto, index));

        const sortedPositionDuals = convertedData.sort((a, b) => {
          if (a.concurrentStatusCode !== b.concurrentStatusCode) {
            return a.concurrentStatusCode.localeCompare(b.concurrentStatusCode);
          }
          if (a.isRepresentative !== b.isRepresentative) {
            return a.isRepresentative ? -1 : 1;
          }
          return a.seq - b.seq;
        });

        setPositionDuals(sortedPositionDuals);
        setPagination(prev => ({
          ...prev,
          total: sortedPositionDuals.length,
          totalPages: Math.ceil(sortedPositionDuals.length / prev.size)
        }));
      }

      handleModalClose();
      toast.success('겸직 관계가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('겸직 관계 조회 실패:', error);
      toast.error('겸직 관계 목록을 다시 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters.ledgerOrderId, convertToPositionDual, handleModalClose]);

  const handlePositionDualUpdate = useCallback(async (_id: string, formData: PositionDualFormData) => {
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
    // 책무이행차수가 선택되지 않으면 경고
    if (!filters.ledgerOrderId) {
      toast.warning('책무이행차수를 선택해주세요.');
      return;
    }

    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('겸직 관계 정보를 검색 중입니다...');

    try {
      // 실제 API 호출
      const dtos = await getPositionConcurrents(filters.ledgerOrderId);

      // DTO를 PositionDual 타입으로 변환
      const convertedData = dtos.map((dto, index) => convertToPositionDual(dto, index));

      // 겸직그룹코드별로 정렬 (셀 병합을 위해)
      const sortedPositionDuals = convertedData.sort((a, b) => {
        // 1차: 겸직그룹코드로 정렬
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
        total: sortedPositionDuals.length,
        totalPages: Math.ceil(sortedPositionDuals.length / prev.size)
      }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `검색 완료: ${sortedPositionDuals.length}건`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
      setPositionDuals([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters.ledgerOrderId, convertToPositionDual]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      ledgerOrderId: '',
      positionName: '',
      isActive: '',
      isRepresentative: '',
      concurrentStatusCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // 겸직현황코드 클릭 핸들러 (상세 모달 오픈)
  const handleConcurrentCodeClick = useCallback(async (positionDual: PositionDual) => {
    try {
      setLoading(true);

      // 겸직그룹코드로 해당 그룹의 모든 직책 조회
      const loadingToastId = toast.loading('겸직 관계 상세 정보를 조회 중입니다...');

      const dtos = await getPositionConcurrentsByGroup(positionDual.concurrentStatusCode);

      // 조회한 데이터를 상태에 저장
      setSelectedGroupData(dtos);

      // 조회 성공 토스트
      toast.update(loadingToastId, 'success', `겸직 그룹 ${positionDual.concurrentStatusCode}: ${dtos.length}건 조회 완료`);

      // 모달 열기 (첫 번째 항목을 대표로 전달)
      handlePositionDualDetail(positionDual);

    } catch (error) {
      console.error('겸직 상세 조회 실패:', error);
      toast.error('겸직 관계 상세 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handlePositionDualDetail]);

  // 행 클릭 핸들러 (원클릭으로 상세 모달 열기)
  const handleRowClick = useCallback((positionDual: PositionDual) => {
    // 원클릭으로 상세 모달 열기
    handleConcurrentCodeClick(positionDual);
  }, [handleConcurrentCodeClick]);

  // 더블클릭 핸들러 (동일하게 상세 모달 열기)
  const handleRowDoubleClick = useCallback((positionDual: PositionDual) => {
    // 더블클릭도 동일하게 상세 모달 열기
    handleConcurrentCodeClick(positionDual);
  }, [handleConcurrentCodeClick]);

  const handleSelectionChange = useCallback((selected: PositionDual[]) => {
    setSelectedPositionDuals(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // 컬럼 정의 (겸직현황코드 클릭 핸들러 주입)
  const columns = useMemo(() => {
    return getPositionDualColumns(false, handleConcurrentCodeClick);
  }, [handleConcurrentCodeClick]);

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
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      required: true,
      gridSize: { xs: 12, sm: 6, md: 2.5 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId}
          onChange={(value) => handleFiltersChange({ ledgerOrderId: value || '' })}
          label="책무이행차수"
          required
        />
      )
    },
    {
      key: 'positionName',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
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
  ], [filters.ledgerOrderId, handleFiltersChange]);

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

  /**
   * 실제 API로 겸직 데이터 조회
   * - filters.ledgerOrderId가 변경될 때마다 자동 조회
   */
  React.useEffect(() => {
    const fetchPositionConcurrents = async () => {
      // 책무이행차수가 선택되지 않으면 조회하지 않음
      if (!filters.ledgerOrderId) {
        setPositionDuals([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
        return;
      }

      setLoading(true);
      try {
        // 실제 API 호출
        const dtos = await getPositionConcurrents(filters.ledgerOrderId);

        // DTO를 PositionDual 타입으로 변환
        const convertedData = dtos.map((dto, index) => convertToPositionDual(dto, index));

        // 겸직그룹코드별로 정렬 (셀 병합을 위해)
        const sortedPositionDuals = convertedData.sort((a, b) => {
          // 1차: 겸직그룹코드로 정렬
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
          total: sortedPositionDuals.length,
          totalPages: Math.ceil(sortedPositionDuals.length / prev.size)
        }));
      } catch (error) {
        console.error('겸직 목록 조회 실패:', error);
        toast.error('겸직 목록을 불러오는데 실패했습니다.');
        setPositionDuals([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchPositionConcurrents();
  }, [filters.ledgerOrderId, convertToPositionDual]);

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
          columns={columns}
          loading={loading}
          theme="alpine"
          onSelectionChange={handleSelectionChange}
          onRowClick={(data) => handleRowClick(data)}
          onRowDoubleClick={(data) => handleRowDoubleClick(data)}
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
          groupData={modalState.detailModal ? selectedGroupData : undefined}
        />
      </React.Suspense>
    </div>
  );
};

export default PositionDualMgmt;
