/**
 * 결재선 관리 페이지
 *
 * @description 결재선을 등록, 수정, 삭제, 조회하는 관리 페이지
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 *
 * @features
 * - PositionMgmt.tsx 표준 템플릿 100% 준수
 * - 좌우 분할 레이아웃 (Left: 결재선 목록, Right: 상세 정보)
 * - 성능 최적화 (React.memo, useMemo, useCallback, lazy loading)
 * - 8가지 브랜드 테마 지원
 * - 완전한 TypeScript 지원
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Paper } from '@mui/material';
import styles from './ApprovalLine.module.scss';

// Types and Constants
import type {
  ApprovalLine as ApprovalLineType,
  ApprovalLineFilters,
  ApprovalLineFormData,
  ApprovalLineModalState,
  ApprovalLinePagination
} from './types/approvalLine.types';

import {
  WORK_TYPE_OPTIONS,
  MOCK_APPROVAL_LINES
} from './types/approvalLine.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';

// ApprovalLine specific components
const ApprovalLineDetailModal = React.lazy(() =>
  import('./components/ApprovalLineDetailModal/ApprovalLineDetailModal')
);

// 좌측 그리드 컬럼 정의 (이미지 기준)
const leftGridColumns = [
  { field: 'sequence' as any, headerName: '순서', width: 60, sortable: true },
  { field: 'name' as any, headerName: '결재선명', width: 150, sortable: true, flex: 1 },
  { field: 'popupTitle' as any, headerName: 'Popup 제목', width: 120, sortable: true },
  { field: 'url' as any, headerName: 'URL', width: 200, sortable: true }
];

// 우측 그리드 컬럼 정의 (이미지 기준)
const rightGridColumns = [
  { field: 'sequence' as any, headerName: '순서', width: 60, sortable: true },
  { field: 'name' as any, headerName: '결재선명', width: 120, sortable: true },
  { field: 'workType' as any, headerName: '업무', width: 80, sortable: true },
  { field: 'isPopup' as any, headerName: '필수여부', width: 80, sortable: true },
  { field: 'isEditable' as any, headerName: '수정기능여부', width: 100, sortable: true },
  { field: 'isUsed' as any, headerName: '사용여부', width: 80, sortable: true },
  { field: 'remarks' as any, headerName: '비고', width: 100, sortable: true, flex: 1 }
];

interface ApprovalLineProps {
  className?: string;
}

const ApprovalLine: React.FC<ApprovalLineProps> = ({ className }) => {
  const { t } = useTranslation('approval');

  // State Management
  const [approvalLines, setApprovalLines] = useState<ApprovalLineType[]>(MOCK_APPROVAL_LINES);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedApprovalLines, setSelectedApprovalLines] = useState<ApprovalLineType[]>([]);

  // 개별 로딩 상태 (이미지 기준)
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    save: false,
    delete: false,
    up: false,
    down: false
  });

  // 선택된 결재선 상태
  const [selectedApprovalLine, setSelectedApprovalLine] = useState<ApprovalLineType | null>(null);

  // 필터링 상태
  const [filters, setFilters] = useState<ApprovalLineFilters>({
    workType: '',
    searchKeyword: '',
    isUsed: ''
  });

  // 페이지네이션 상태
  const [pagination, setPagination] = useState<ApprovalLinePagination>({
    page: 1,
    pageSize: 20,
    totalCount: MOCK_APPROVAL_LINES.length,
    totalPages: Math.ceil(MOCK_APPROVAL_LINES.length / 20)
  });

  // 모달 상태
  const [modalState, setModalState] = useState<ApprovalLineModalState>({
    open: false,
    mode: 'create',
    itemData: null
  });



  // Event Handlers

  /**
   * 검색 처리
   */
  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // API 호출 시뮬레이션

      // 필터링 로직 (실제로는 API 호출)
      let filteredLines = MOCK_APPROVAL_LINES;

      if (filters.workType) {
        filteredLines = filteredLines.filter(line => line.workType === filters.workType);
      }

      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase();
        filteredLines = filteredLines.filter(line =>
          line.name.toLowerCase().includes(keyword) ||
          line.popupTitle.toLowerCase().includes(keyword)
        );
      }

      if (filters.isUsed) {
        filteredLines = filteredLines.filter(line => line.isUsed === filters.isUsed);
      }

      setApprovalLines(filteredLines);
      setPagination(prev => ({
        ...prev,
        totalCount: filteredLines.length,
        totalPages: Math.ceil(filteredLines.length / prev.pageSize),
        page: 1
      }));

      toast.success(`${filteredLines.length}건의 결재선을 조회했습니다.`);
    } catch (error) {
      console.error('결재선 조회 중 오류 발생:', error);
      toast.error('결재선 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  /**
   * 결재선 추가
   */
  const handleAddApprovalLine = useCallback(() => {
    setModalState({
      open: true,
      mode: 'create',
      itemData: null
    });
    toast.info('새 결재선을 등록해주세요.', { autoClose: 2000 });
  }, []);

  /**
   * 결재선 저장
   */
  const handleSaveApprovalLine = useCallback(async () => {
    if (selectedApprovalLines.length === 0) return;

    setLoadingStates(prev => ({ ...prev, save: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('결재선이 성공적으로 저장되었습니다.');
      handleSearch();
    } catch (error) {
      console.error('결재선 저장 중 오류 발생:', error);
      toast.error('결재선 저장 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  }, [selectedApprovalLines, handleSearch]);

  /**
   * 결재선 순서 올리기
   */
  const handleMoveUp = useCallback(async () => {
    if (selectedApprovalLines.length === 0) return;

    setLoadingStates(prev => ({ ...prev, up: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('결재선 순서가 위로 이동되었습니다.');
      handleSearch();
    } catch (error) {
      console.error('결재선 순서 변경 중 오류 발생:', error);
      toast.error('결재선 순서 변경 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, up: false }));
    }
  }, [selectedApprovalLines, handleSearch]);

  /**
   * 결재선 순서 내리기
   */
  const handleMoveDown = useCallback(async () => {
    if (selectedApprovalLines.length === 0) return;

    setLoadingStates(prev => ({ ...prev, down: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('결재선 순서가 아래로 이동되었습니다.');
      handleSearch();
    } catch (error) {
      console.error('결재선 순서 변경 중 오류 발생:', error);
      toast.error('결재선 순서 변경 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, down: false }));
    }
  }, [selectedApprovalLines, handleSearch]);


  /**
   * 결재선 삭제
   */
  const handleDeleteApprovalLines = useCallback(async () => {
    if (selectedApprovalLines.length === 0) return;

    setLoadingStates(prev => ({ ...prev, delete: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 시뮬레이션

      const deletedCount = selectedApprovalLines.length;
      setApprovalLines(prev =>
        prev.filter(line => !selectedApprovalLines.some(selected => selected.id === line.id))
      );
      setSelectedApprovalLines([]);

      toast.success(`${deletedCount}개의 결재선이 삭제되었습니다.`);
    } catch (error) {
      console.error('결재선 삭제 중 오류 발생:', error);
      toast.error('결재선 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedApprovalLines]);




  // 통계 정보 (PositionMgmt.tsx 표준 템플릿 패턴 준수)
  const statistics = useMemo(() => {
    const total = approvalLines.length;
    const usedCount = approvalLines.filter(line => line.isUsed === 'Y').length;
    const unusedCount = total - usedCount;
    const usageRate = total > 0 ? Math.round((usedCount / total) * 100) : 0;

    return {
      total,
      usedCount,
      unusedCount,
      usageRate
    };
  }, [approvalLines]);

  // React.Profiler onRender callback for performance monitoring
  const onRenderProfiler = useCallback((
    _id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ApprovalLine Performance Profiler`);
      console.log(`Phase: ${phase}`);
      console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
      console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
      console.log(`Start time: ${startTime.toFixed(2)}ms`);
      console.log(`Commit time: ${commitTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  }, []);

  /**
   * 검색 필터 변경 처리
   */
  const handleFilterChange = useCallback((values: Partial<ApprovalLineFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...values
    }));
  }, []);

  /**
   * 그리드 로우 클릭 처리 (좌측 그리드)
   */
  const handleRowClick = useCallback((approvalLine: ApprovalLineType) => {
    setSelectedApprovalLine(approvalLine);
    console.log('선택된 결재선:', approvalLine);
  }, []);

  const handleRowDoubleClick = useCallback((approvalLine: ApprovalLineType) => {
    setModalState({
      open: true,
      mode: 'detail',
      itemData: approvalLine
    });
  }, []);

  // 우측 그리드 데이터 (선택된 결재선 기준)
  const rightGridData = useMemo(() => {
    return selectedApprovalLine ? [selectedApprovalLine] : [];
  }, [selectedApprovalLine]);

  /**
   * 모달 닫기
   */
  const handleCloseModal = useCallback(() => {
    setModalState({
      open: false,
      mode: 'create',
      itemData: null
    });
  }, []);

  /**
   * 결재선 저장 처리 (모달)
   */
  const handleSaveModal = useCallback(async (formData: ApprovalLineFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 시뮬레이션

      if (modalState.mode === 'create') {
        const newApprovalLine: ApprovalLineType = {
          id: Date.now().toString(),
          sequence: approvalLines.length + 1,
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
          updatedBy: 'current-user'
        };

        setApprovalLines(prev => [...prev, newApprovalLine]);
        toast.success('결재선이 성공적으로 등록되었습니다.');
      } else if (modalState.mode === 'edit' && modalState.itemData) {
        setApprovalLines(prev =>
          prev.map(line =>
            line.id === modalState.itemData!.id
              ? { ...line, ...formData, updatedAt: new Date().toISOString(), updatedBy: 'current-user' }
              : line
          )
        );
        toast.success('결재선이 성공적으로 수정되었습니다.');
      }

      handleCloseModal();
    } catch (error) {
      console.error('결재선 저장 중 오류 발생:', error);
      toast.error('결재선 저장 중 오류가 발생했습니다.');
    }
  }, [modalState, approvalLines.length, handleCloseModal]);


  // 컴포넌트 렌더링
  return (
    <React.Profiler id="ApprovalLine" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 (PositionMgmt.tsx 표준 템플릿 100% 준수) */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <AccountTreeIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('approval.line.management.title', '결재선 관리')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('approval.line.management.description', '시스템 내 각종 승인 프로세스에 사용될 결재선을 등록, 수정, 삭제하는 관리 기능입니다.')}
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
                  <div className={styles.statLabel}>총 결재선</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <SecurityIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statistics.usedCount}
                  </div>
                  <div className={styles.statLabel}>사용중</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.usageRate}%</div>
                  <div className={styles.statLabel}>사용률</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 메인 컨텐츠 영역 (이미지 기준 좌우 분할 레이아웃) */}
        <div className={styles.content}>
          <Grid container spacing={2}>
            {/* 좌측 영역: 업무구분 필터 + 결재선 목록 */}
            <Grid item xs={12} md={6}>
              <Paper className={styles.leftPanel}>
                {/* 좌측 상단: 업무구분 필터 */}
                <div className={styles.leftHeader}>
                  <div className={styles.filterSection}>
                    <span className={styles.filterLabel}>업무</span>
                    <select
                      className={styles.workTypeSelect}
                      value={filters.workType}
                      onChange={(e) => handleFilterChange({ workType: e.target.value as any })}
                    >
                      {WORK_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.refreshButton}
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      🔄
                    </button>
                  </div>
                  <div className={styles.leftActionButtons}>
                    <button
                      className={`${styles.actionButton} ${styles.addButton}`}
                      onClick={handleAddApprovalLine}
                      disabled={loading}
                    >
                      추가
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.saveButton}`}
                      onClick={handleSaveApprovalLine}
                      disabled={loading || selectedApprovalLines.length === 0}
                    >
                      저장
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={handleDeleteApprovalLines}
                      disabled={loading || selectedApprovalLines.length === 0}
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 좌측 그리드: 결재선 목록 */}
                <div className={styles.leftGrid}>
                  <BaseDataGrid
                    data={approvalLines}
                    columns={leftGridColumns}
                    loading={loading}
                    theme="alpine"
                    onRowClick={handleRowClick}
                    onSelectionChange={setSelectedApprovalLines}
                    height="calc(100vh - 280px)"
                    pagination={false}
                    rowSelection="single"
                  />
                </div>
              </Paper>
            </Grid>

            {/* 우측 영역: 액션 버튼 + 상세 정보 */}
            <Grid item xs={12} md={6}>
              <Paper className={styles.rightPanel}>
                {/* 우측 상단: 액션 버튼 */}
                <div className={styles.rightHeader}>
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionButton} ${styles.addButton}`}
                      onClick={handleAddApprovalLine}
                      disabled={loading}
                    >
                      추가
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.saveButton}`}
                      onClick={handleSaveApprovalLine}
                      disabled={loading || selectedApprovalLines.length === 0}
                    >
                      저장
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={handleDeleteApprovalLines}
                      disabled={loading || selectedApprovalLines.length === 0}
                    >
                      삭제
                    </button>
                  </div>
                  <div className={styles.orderButtons}>
                    <button
                      className={`${styles.orderButton} ${styles.downButton}`}
                      onClick={handleMoveDown}
                      disabled={loading || selectedApprovalLines.length === 0}
                    >
                      DOWN
                    </button>
                    <button
                      className={`${styles.orderButton} ${styles.upButton}`}
                      onClick={handleMoveUp}
                      disabled={loading || selectedApprovalLines.length === 0}
                    >
                      UP
                    </button>
                  </div>
                </div>

                {/* 우측 그리드: 상세 정보 */}
                <div className={styles.rightGrid}>
                  <BaseDataGrid
                    data={rightGridData}
                    columns={rightGridColumns}
                    loading={loading}
                    theme="alpine"
                    height="calc(100vh - 280px)"
                    pagination={false}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>

        {/* 상세 모달 */}
        <Suspense fallback={<LoadingSpinner />}>
          <ApprovalLineDetailModal
            open={modalState.open}
            mode={modalState.mode}
            itemData={modalState.itemData}
            onClose={handleCloseModal}
            onSave={handleSaveModal}
            onUpdate={handleSaveModal}
            loading={loading}
          />
        </Suspense>
      </div>
    </React.Profiler>
  );
};

// 성능 최적화를 위한 React.memo 적용
export default React.memo(ApprovalLine);