/**
 * 이사회이력관리 페이지
 * - board_resolutions 테이블 CRUD
 * - 실제 API 연동 (Mock 데이터 없음)
 * - PositionMgmt 표준 템플릿 기반
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

// API
import {
  getAllBoardResolutions,
  searchBoardResolutions,
  deleteBoardResolutions,
  type BoardResolutionDto
} from '../../api/boardResolutionApi';

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

/**
 * API 응답 DTO를 Frontend 타입으로 변환
 */
const convertDtoToBoardHistory = (dto: BoardResolutionDto): BoardHistory => {
  return {
    id: dto.resolutionId,
    seq: dto.meetingNumber,
    ledgerOrderId: dto.ledgerOrderId,
    round: dto.meetingNumber,
    resolutionName: dto.resolutionName,
    resolutionDate: dto.createdAt?.split('T')[0] || '',
    uploadDate: dto.createdAt?.split('T')[0] || '',
    summary: dto.summary || '',
    content: dto.content || '',
    hasResponsibilityChart: (dto.responsibilityFileCount || 0) > 0,
    isActive: true,
    createdAt: dto.createdAt || '',
    createdBy: dto.createdBy || '',
    updatedAt: dto.updatedAt,
    updatedBy: dto.updatedBy,
    fileCount: dto.fileCount || 0,
    responsibilityFileCount: dto.responsibilityFileCount || 0
  };
};

const BoardHistoryMgmt: React.FC<BoardHistoryMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [boardHistories, setBoardHistories] = useState<BoardHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
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

  // ===============================
  // 데이터 조회 함수
  // ===============================

  /**
   * 이사회결의 목록 조회
   */
  const fetchBoardHistories = useCallback(async () => {
    try {
      const response = await getAllBoardResolutions();
      const converted = response.map(convertDtoToBoardHistory);
      setBoardHistories(converted);
      setPagination(prev => ({
        ...prev,
        total: converted.length,
        totalPages: Math.ceil(converted.length / prev.size)
      }));
    } catch (error) {
      console.error('이사회결의 목록 조회 실패:', error);
      toast.error('이사회 이력 목록을 불러오는데 실패했습니다.');
    }
  }, []);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    const initializeData = async () => {
      setIsInitialLoading(true);
      await fetchBoardHistories();
      setIsInitialLoading(false);
    };
    initializeData();
  }, [fetchBoardHistories]);

  // ===============================
  // Event Handlers
  // ===============================

  const handleFiltersChange = useCallback((newFilters: Partial<BoardHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddBoardHistory = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedBoardHistory: null
    }));
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));
    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
    } catch (error) {
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  /**
   * 이사회결의 복수 삭제
   */
  const handleDeleteBoardHistories = useCallback(async () => {
    if (selectedBoardHistories.length === 0) {
      toast.warning('삭제할 이사회 이력을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택된 ${selectedBoardHistories.length}개의 이사회 이력을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));
    const loadingToastId = toast.loading(`${selectedBoardHistories.length}개 이사회 이력을 삭제 중입니다...`);

    try {
      const resolutionIds = selectedBoardHistories.map(h => h.id);
      const result = await deleteBoardResolutions(resolutionIds);

      if (result.failCount > 0) {
        toast.update(loadingToastId, 'warning', `${result.successCount}개 성공, ${result.failCount}개 실패`);
      } else {
        toast.update(loadingToastId, 'success', `${result.successCount}개 이사회 이력이 삭제되었습니다.`);
      }

      // 목록 새로고침
      await fetchBoardHistories();
      setSelectedBoardHistories([]);
    } catch (error) {
      toast.update(loadingToastId, 'error', '이사회 이력 삭제에 실패했습니다.');
      console.error('이사회 이력 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedBoardHistories, fetchBoardHistories]);

  const handleModalClose = useCallback(() => {
    setModalState({
      addModal: false,
      detailModal: false,
      selectedBoardHistory: null
    });
  }, []);

  /**
   * 이사회결의 저장 완료 후 콜백
   */
  const handleBoardHistorySave = useCallback(async (_formData: BoardHistoryFormData) => {
    // 저장은 Modal에서 직접 API 호출
    // 여기서는 목록 새로고침만 수행
    await fetchBoardHistories();
    handleModalClose();
    toast.success('이사회 이력이 성공적으로 등록되었습니다.');
  }, [fetchBoardHistories, handleModalClose]);

  /**
   * 이사회결의 수정 완료 후 콜백
   */
  const handleBoardHistoryUpdate = useCallback(async (_id: string, _formData: BoardHistoryFormData) => {
    // 수정은 Modal에서 직접 API 호출
    // 여기서는 목록 새로고침만 수행
    await fetchBoardHistories();
    handleModalClose();
    toast.success('이사회 이력이 성공적으로 수정되었습니다.');
  }, [fetchBoardHistories, handleModalClose]);

  const handleBoardHistoryDetail = useCallback((boardHistory: BoardHistory) => {
    setModalState({
      addModal: false,
      detailModal: true,
      selectedBoardHistory: boardHistory
    });
  }, []);

  /**
   * 검색 핸들러
   */
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    const loadingToastId = toast.loading('이사회 이력을 검색 중입니다...');

    try {
      const response = await searchBoardResolutions(
        filters.ledgerOrderId || undefined,
        filters.resolutionName || undefined
      );
      const converted = response.map(convertDtoToBoardHistory);
      setBoardHistories(converted);
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: converted.length,
        totalPages: Math.ceil(converted.length / prev.size)
      }));
      toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
    } catch (error) {
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
    fetchBoardHistories();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [fetchBoardHistories]);

  // Grid Event Handlers
  const handleRowClick = useCallback((boardHistory: BoardHistory) => {
    console.log('행 클릭:', boardHistory);
  }, []);

  const handleRowDoubleClick = useCallback((boardHistory: BoardHistory) => {
    handleBoardHistoryDetail(boardHistory);
  }, [handleBoardHistoryDetail]);

  const handleSelectionChange = useCallback((selected: BoardHistory[]) => {
    setSelectedBoardHistories(selected);
  }, []);

  // ===============================
  // Memoized Values
  // ===============================

  // 통계 계산
  const statistics = useMemo((): BoardHistoryStatistics => {
    const total = boardHistories.length;
    const currentYear = new Date().getFullYear();
    const currentYearCount = boardHistories.filter(h => {
      const createdYear = h.createdAt ? new Date(h.createdAt).getFullYear() : 0;
      return createdYear === currentYear;
    }).length;
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
      color: 'primary',
      icon: <AttachFileIcon />
    }
  ], [statistics]);

  // 초기 로딩 중 표시
  if (isInitialLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <LoadingSpinner text="이사회 이력 목록을 불러오는 중입니다..." />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 */}
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
                <div className={styles.statNumber}>{statistics.currentYearCount}</div>
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

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 공통 검색 필터 */}
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

        {/* 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.totalCount}
          totalLabel="총 이사회 이력 수"
          selectedCount={selectedBoardHistories.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 공통 데이터 그리드 */}
        <BaseDataGrid
          data={boardHistories}
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
          onRefresh={fetchBoardHistories}
          loading={loading}
        />
      </React.Suspense>
    </div>
  );
};

export default BoardHistoryMgmt;
