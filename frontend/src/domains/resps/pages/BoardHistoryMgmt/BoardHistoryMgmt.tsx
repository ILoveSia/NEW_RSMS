// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BoardHistoryMgmt.module.scss';

// Types
import type {
  BoardHistory,
  BoardHistoryFilters,
  BoardHistoryFormData,
  BoardHistoryModalState,
  BoardHistoryPagination,
  BoardHistoryStatistics
} from './types/boardHistory.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// BoardHistory specific components
import { boardHistoryColumns } from './components/BoardHistoryDataGrid/boardHistoryColumns';

// Lazy-loaded components for performance optimization
const BoardHistoryFormModal = React.lazy(() =>
  import('./components/BoardHistoryFormModal/BoardHistoryFormModal').then(module => ({ default: module.default }))
);

interface BoardHistoryMgmtProps {
  className?: string;
}

const BoardHistoryMgmt: React.FC<BoardHistoryMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [boardHistories, setBoardHistories] = useState<BoardHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBoardHistories, setSelectedBoardHistories] = useState<BoardHistory[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false
  });

  const [filters, setFilters] = useState<BoardHistoryFilters>({
    ledgerOrderId: '',
    resolutionName: '',
    resolutionDateFrom: '',
    resolutionDateTo: ''
  });

  const [pagination, setPagination] = useState<BoardHistoryPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<BoardHistoryModalState>({
    addModal: false,
    detailModal: false,
    selectedBoardHistory: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<BoardHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddBoardHistory = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedBoardHistory: null
    }));
    toast.info('새 이사회 이력을 등록해주세요.', { autoClose: 2000 });
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
      console.log('이사회 이력 엑셀 다운로드 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteBoardHistories = useCallback(async () => {
    if (selectedBoardHistories.length === 0) {
      toast.warning('삭제할 이사회 이력을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedBoardHistories.length}개의 이사회 이력을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedBoardHistories.length}개 이사회 이력을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setBoardHistories(prev =>
        prev.filter(history => !selectedBoardHistories.some(selected => selected.id === history.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedBoardHistories.length
      }));
      setSelectedBoardHistories([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedBoardHistories.length}개 이사회 이력이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '이사회 이력 삭제에 실패했습니다.');
      console.error('이사회 이력 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedBoardHistories]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedBoardHistory: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleBoardHistorySave = useCallback(async (formData: BoardHistoryFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 이사회 이력 생성
      // const response = await boardHistoryApi.create(formData);

      // 임시로 새 이사회 이력 객체 생성
      const newBoardHistory: BoardHistory = {
        id: Date.now().toString(),
        seq: boardHistories.length + 1,
        ledgerOrderId: formData.ledgerOrderId,
        round: boardHistories.length + 1, // 회차는 자동 증가
        resolutionName: formData.resolutionName,
        resolutionDate: formData.resolutionDate,
        uploadDate: new Date().toISOString().split('T')[0],
        summary: formData.summary,
        content: formData.content,
        hasResponsibilityChart: false, // 초기값
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: '현재사용자',
        fileCount: formData.files?.length || 0,
        responsibilityFileCount: formData.files?.filter(f => f.fileCategory === 'responsibility').length || 0
      };

      setBoardHistories(prev => [newBoardHistory, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('이사회 이력이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('이사회 이력 등록 실패:', error);
      toast.error('이사회 이력 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardHistories.length, handleModalClose]);

  const handleBoardHistoryUpdate = useCallback(async (id: string, formData: BoardHistoryFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 이사회 이력 수정
      // const response = await boardHistoryApi.update(id, formData);

      // 임시로 기존 이사회 이력 업데이트
      setBoardHistories(prev =>
        prev.map(history =>
          history.id === id
            ? {
                ...history,
                ledgerOrderId: formData.ledgerOrderId,
                resolutionName: formData.resolutionName,
                resolutionDate: formData.resolutionDate,
                summary: formData.summary,
                content: formData.content,
                updatedAt: new Date().toISOString(),
                updatedBy: '현재사용자',
                fileCount: formData.files?.length || 0,
                responsibilityFileCount: formData.files?.filter(f => f.fileCategory === 'responsibility').length || 0
              }
            : history
        )
      );

      handleModalClose();
      toast.success('이사회 이력이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('이사회 이력 수정 실패:', error);
      toast.error('이사회 이력 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleBoardHistoryDetail = useCallback((boardHistory: BoardHistory) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedBoardHistory: boardHistory
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('이사회 이력을 검색 중입니다...');

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
      ledgerOrderId: '',
      resolutionName: '',
      resolutionDateFrom: '',
      resolutionDateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((boardHistory: BoardHistory) => {
    console.log('행 클릭:', boardHistory);
  }, []);

  const handleRowDoubleClick = useCallback((boardHistory: BoardHistory) => {
    handleBoardHistoryDetail(boardHistory);
  }, [handleBoardHistoryDetail]);

  const handleSelectionChange = useCallback((selected: BoardHistory[]) => {
    setSelectedBoardHistories(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo((): BoardHistoryStatistics => {
    const total = pagination.total;
    const currentYear = new Date().getFullYear();
    const currentYearCount = boardHistories.filter(h =>
      new Date(h.resolutionDate).getFullYear() === currentYear
    ).length;
    const totalFileCount = boardHistories.reduce((sum, h) => sum + (h.fileCount || 0), 0);
    const responsibilityFileCount = boardHistories.reduce((sum, h) => sum + (h.responsibilityFileCount || 0), 0);
    const activeCount = boardHistories.filter(h => h.isActive).length;
    const inactiveCount = boardHistories.filter(h => !h.isActive).length;

    return {
      totalCount: total,
      currentYearCount,
      totalFileCount,
      responsibilityFileCount,
      activeCount,
      inactiveCount
    };
  }, [pagination.total, boardHistories]);

  // Filtered board histories for display (성능 최적화)
  const displayBoardHistories = useMemo(() => {
    return boardHistories; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [boardHistories]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId || undefined}
          onChange={(value) => handleFiltersChange({ ledgerOrderId: value || '' })}
          label="책무이행차수"
          size="small"
          fullWidth
        />
      )
    },
    {
      key: 'resolutionName',
      type: 'text',
      label: '이사회 결의명',
      placeholder: '이사회 결의명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'resolutionDateFrom',
      type: 'date',
      label: '결의일자 시작',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'resolutionDateTo',
      type: 'date',
      label: '결의일자 종료',
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
      onClick: handleAddBoardHistory
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteBoardHistories,
      disabled: selectedBoardHistories.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddBoardHistory, handleDeleteBoardHistories, selectedBoardHistories.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.activeCount,
      color: 'success',
      icon: <HistoryIcon />
    },
    {
      label: '첨부파일',
      value: statistics.totalFileCount,
      color: 'info',
      icon: <AttachFileIcon />
    }
  ], [statistics]);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockBoardHistories: BoardHistory[] = [
      {
        id: '1',
        seq: 1,
        ledgerOrderId: '20250001',
        round: 1,
        resolutionName: '2025년 1차 이사회결의',
        resolutionDate: '2025-08-13',
        uploadDate: '2025-08-13',
        summary: '신규 임원 선임 및 조직 개편에 관한 이사회 결의',
        content: '대상 임원: ○○○\n대상 민원: ○○○',
        hasResponsibilityChart: true,
        isActive: true,
        createdAt: '2025-08-13T09:00:00.000Z',
        createdBy: '관리자',
        fileCount: 3,
        responsibilityFileCount: 1
      },
      {
        id: '2',
        seq: 2,
        ledgerOrderId: '20250001',
        round: 2,
        resolutionName: '2025년 2차 이사회결의',
        resolutionDate: '2025-09-15',
        uploadDate: '2025-09-15',
        summary: '예산 승인 및 신사업 추진 계획 검토',
        content: '2025년 하반기 예산 및 신사업 계획 심의',
        hasResponsibilityChart: false,
        isActive: true,
        createdAt: '2025-09-15T14:30:00.000Z',
        createdBy: '관리자',
        fileCount: 2,
        responsibilityFileCount: 0
      },
      {
        id: '3',
        seq: 3,
        ledgerOrderId: '20250001',
        round: 3,
        resolutionName: '2025년 3차 이사회결의',
        resolutionDate: '2025-09-20',
        uploadDate: '2025-09-20',
        summary: '리스크 관리 체계 개선 방안 논의',
        content: '리스크 관리 체계 강화 및 모니터링 시스템 구축',
        hasResponsibilityChart: true,
        isActive: true,
        createdAt: '2025-09-20T10:15:00.000Z',
        createdBy: '관리자',
        fileCount: 5,
        responsibilityFileCount: 2
      }
    ];

    setBoardHistories(mockBoardHistories);
    setPagination(prev => ({
      ...prev,
      total: mockBoardHistories.length,
      totalPages: Math.ceil(mockBoardHistories.length / prev.size)
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
                {t('boardHistory.management.title', '이사회이력관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('boardHistory.management.description', '이사회 개최 이력 및 관련 파일을 체계적으로 관리합니다')}
              </p>
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalCount}</div>
                <div className={styles.statLabel}>총 이력</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <HistoryIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.currentYearCount}
                </div>
                <div className={styles.statLabel}>금년 이력</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AttachFileIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalFileCount}</div>
                <div className={styles.statLabel}>첨부파일</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.responsibilityFileCount}</div>
                <div className={styles.statLabel}>책무구조도</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<BoardHistoryFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.totalCount}
          totalLabel="총 이사회 이력 수"
          selectedCount={selectedBoardHistories.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayBoardHistories}
          columns={boardHistoryColumns}
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

      {/* 이사회 이력 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <BoardHistoryFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          boardHistory={modalState.selectedBoardHistory}
          onClose={handleModalClose}
          onSave={handleBoardHistorySave}
          onUpdate={handleBoardHistoryUpdate}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

export default BoardHistoryMgmt;