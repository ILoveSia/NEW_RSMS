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
  InternalControlMgmtDetail,
  InternalControlMgmtModalState,
  InternalControlMgmtPagination,
  InternalControlMgmtStatistics,
  LoadingStates
} from './types/internalControlMgmt.types';

import {
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,
  DEFAULT_FORM_DATA,
  USAGE_STATUS_OPTIONS,
  DEPARTMENT_OPTIONS
} from './types/internalControlMgmt.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import { TextField, Select, MenuItem, FormControl, InputLabel, TextareaAutosize, Box, Button, Typography, Paper, Grid } from '@mui/material';

// Internal Control Management specific components
import { internalControlMgmtColumns } from './components/InternalControlMgmtDataGrid/internalControlMgmtColumns';

// Lazy-loaded components for performance optimization
const InternalControlMgmtDetailModal = React.lazy(() =>
  import('./components/InternalControlMgmtDetailModal').then(module => ({ default: module.default }))
);

interface InternalControlMgmtProps {
  className?: string;
}

const InternalControlMgmt: React.FC<InternalControlMgmtProps> = ({ className }) => {
  const { t } = useTranslation('activities');

  // State Management
  const [items, setItems] = useState<InternalControlMgmt[]>([]);
  const [selectedItems, setSelectedItems] = useState<InternalControlMgmt[]>([]);
  const [selectedItem, setSelectedItem] = useState<InternalControlMgmt | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<InternalControlMgmtDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    search: false,
    save: false,
    detail: false,
    copy: false
  });

  const [filters, setFilters] = useState<InternalControlMgmtFilters>(DEFAULT_FILTERS);

  const [pagination, setPagination] = useState<InternalControlMgmtPagination>(DEFAULT_PAGINATION);

  const [modalState, setModalState] = useState<InternalControlMgmtModalState>({
    detailModal: false,
    selectedItem: null
  });

  // 우측 상세 입력 폼 상태
  const [formData, setFormData] = useState<InternalControlMgmtFormData>(DEFAULT_FORM_DATA);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<InternalControlMgmtFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAdd = useCallback(() => {
    // 새 항목 추가 로직
    setSelectedItem(null);
    setSelectedDetail(null);
    setFormData(DEFAULT_FORM_DATA);
    toast.info('새 내부통제장치 매핑을 추가해주세요.', { autoClose: 2000 });
  }, []);

  const handleSave = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, save: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('내부통제장치 매핑 정보를 저장 중입니다...');

    try {
      // TODO: 실제 저장 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '내부통제장치 매핑 정보가 저장되었습니다.');
      console.log('저장할 데이터:', formData);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '저장에 실패했습니다.');
      console.error('저장 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  }, [formData]);

  const handleCopy = useCallback(async () => {
    if (!selectedItem) {
      toast.warning('복사할 항목을 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, copy: true }));

    try {
      // TODO: 복사 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      toast.success('선택된 항목이 복사되었습니다.');
    } catch (error) {
      toast.error('복사에 실패했습니다.');
      console.error('복사 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, copy: false }));
    }
  }, [selectedItem]);

  const handleDetailView = useCallback((item: InternalControlMgmt) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedItem: item
    }));
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      detailModal: false,
      selectedItem: null
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
    setFilters(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((item: InternalControlMgmt) => {
    setSelectedItem(item);
    // 선택된 항목의 상세 정보 로드
    loadItemDetail(item.id);
    console.log('행 클릭:', item);
  }, []);

  const handleRowDoubleClick = useCallback((item: InternalControlMgmt) => {
    handleDetailView(item);
  }, [handleDetailView]);

  const handleSelectionChange = useCallback((selected: InternalControlMgmt[]) => {
    setSelectedItems(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // 선택된 항목의 상세 정보 로드 함수
  const loadItemDetail = useCallback(async (itemId: string) => {
    setLoadingStates(prev => ({ ...prev, detail: true }));

    try {
      // TODO: 실제 API 호출로 상세 정보 로드
      // const response = await internalControlMgmtApi.getDetail(itemId);
      // setSelectedDetail(response.data);

      // 임시 데이터
      const detail: InternalControlMgmtDetail = {
        ceoInfo: '김대표',
        managementActivityName: '내부통제 점검',
        managementActivityDetail: '월별 내부통제 현황 점검 및 보고',
        internalControl: '내부통제시스템 A',
        internalControlDeviceDescription: '자동화된 내부통제 점검 도구',
        unifiedNumber: 'IC2024001',
        url: 'https://internal-control.example.com',
        applicationDate: '2024.01.01'
      };

      setSelectedDetail(detail);
      setFormData(detail);
    } catch (error) {
      console.error('상세 정보 로드 실패:', error);
      toast.error('상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, detail: false }));
    }
  }, []);

  // Form Input Handlers
  const handleFormChange = useCallback((field: keyof InternalControlMgmtFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      type: 'date',
      label: '적용일자 (시작)',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'applicationDateTo',
      type: 'date',
      label: '적용일자 (종료)',
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

  // BaseActionBar용 액션 버튼 정의
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'add',
      type: 'add',
      onClick: handleAdd
    },
    {
      key: 'save',
      type: 'save',
      onClick: handleSave,
      disabled: loadingStates.save,
      loading: loadingStates.save
    },
    {
      key: 'copy',
      type: 'copy',
      onClick: handleCopy,
      disabled: !selectedItem || loadingStates.copy,
      loading: loadingStates.copy
    },
    {
      key: 'detail',
      type: 'detail',
      label: '내부통제장치 상세',
      onClick: () => selectedItem && handleDetailView(selectedItem),
      disabled: !selectedItem
    }
  ], [handleAdd, handleSave, handleCopy, handleDetailView, selectedItem, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo>(() => ({
    total: statistics.total,
    selected: selectedItems.length
  }), [statistics.total, selectedItems.length]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1>내부통제장치관리</h1>
            <p>타 내부통제 시스템과 관리활동 간의 매핑 관계를 관리합니다</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <DashboardIcon className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{statistics.total}</span>
                <span className={styles.statLabel}>총 매핑 수</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <SecurityIcon className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{statistics.active}</span>
                <span className={styles.statLabel}>활성 매핑</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <TrendingUpIcon className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{statistics.expiringSoon}</span>
                <span className={styles.statLabel}>만료 예정</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <AnalyticsIcon className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{statistics.inactive}</span>
                <span className={styles.statLabel}>비활성 매핑</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 섹션 */}
      <div className={styles.searchSection}>
        <BaseSearchFilter
          fields={searchFields}
          values={filters}
          onValuesChange={handleFiltersChange}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loadingStates.search}
        />
      </div>

      {/* 분할 레이아웃 메인 컨텐츠 */}
      <div className={styles.splitLayout}>
        {/* 좌측: 내부통제장치 목록 (2/3) */}
        <div className={styles.leftPanel}>
          {/* 액션 바 */}
          <div className={styles.actionBarSection}>
            <BaseActionBar
              title="내부통제장치목록"
              statusInfo={statusInfo}
              actionButtons={actionButtons}
            />
          </div>

          {/* 데이터 그리드 */}
          <div className={styles.gridSection}>
            <BaseDataGrid
              data={displayItems}
              columns={internalControlMgmtColumns}
              loading={loading}
              pagination={{
                enabled: true,
                page: pagination.page,
                size: pagination.size,
                total: pagination.total,
                onPageChange: (page) => setPagination(prev => ({ ...prev, page }))
              }}
              selection={{
                enabled: true,
                selected: selectedItems,
                onSelectionChange: handleSelectionChange
              }}
              onRowClick={handleRowClick}
              onRowDoubleClick={handleRowDoubleClick}
              height={500}
              theme="rsms"
              emptyMessage="조회 된 정보가 없습니다."
            />
          </div>
        </div>

        {/* 우측: 상세 정보 입력 (1/3) */}
        <div className={styles.rightPanel}>
          <Paper className={styles.detailPanel}>
            <Typography variant="h6" className={styles.detailTitle}>
              상세 정보 입력
            </Typography>

            {loadingStates.detail && (
              <div className={styles.detailLoading}>
                <LoadingSpinner text="상세 정보 로딩 중..." />
              </div>
            )}

            {!loadingStates.detail && (
              <Box className={styles.detailForm}>
                <Grid container spacing={2}>
                  {/* CEO 정보 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="CEO"
                      value={formData.ceoInfo}
                      onChange={(e) => handleFormChange('ceoInfo', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  {/* 관리활동명 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="관리활동명"
                      value={formData.managementActivityName}
                      onChange={(e) => handleFormChange('managementActivityName', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  {/* 관리활동상세 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="관리활동상세"
                      value={formData.managementActivityDetail}
                      onChange={(e) => handleFormChange('managementActivityDetail', e.target.value)}
                      variant="outlined"
                      multiline
                      rows={3}
                      size="small"
                    />
                  </Grid>

                  {/* 내부통제 */}
                  <Grid item xs={12}>
                    <Box className={styles.searchField}>
                      <TextField
                        fullWidth
                        label="내부통제"
                        value={formData.internalControl}
                        onChange={(e) => handleFormChange('internalControl', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                      <Button variant="outlined" size="small" className={styles.searchButton}>
                        검색
                      </Button>
                    </Box>
                  </Grid>

                  {/* 내부통제장치설명 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="내부통제장치설명"
                      value={formData.internalControlDeviceDescription}
                      onChange={(e) => handleFormChange('internalControlDeviceDescription', e.target.value)}
                      variant="outlined"
                      multiline
                      rows={3}
                      size="small"
                    />
                  </Grid>

                  {/* 통일번호 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="통일번호"
                      value={formData.unifiedNumber}
                      onChange={(e) => handleFormChange('unifiedNumber', e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  {/* URL */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL"
                      value={formData.url}
                      onChange={(e) => handleFormChange('url', e.target.value)}
                      variant="outlined"
                      size="small"
                      type="url"
                    />
                  </Grid>

                  {/* 적용일자 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="적용일자"
                      value={formData.applicationDate}
                      onChange={(e) => handleFormChange('applicationDate', e.target.value)}
                      variant="outlined"
                      type="date"
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* 우측 하단 저장 버튼 */}
                <Box className={styles.detailActions}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={loadingStates.save}
                    className={styles.saveButton}
                  >
                    {loadingStates.save ? '저장 중...' : '저장'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </div>
      </div>

      {/* 상세 보기 모달 */}
      {modalState.detailModal && modalState.selectedItem && (
        <React.Suspense fallback={<LoadingSpinner text="상세 모달 로딩 중..." />}>
          <InternalControlMgmtDetailModal
            open={modalState.detailModal}
            item={modalState.selectedItem}
            onClose={handleModalClose}
            loading={loading}
          />
        </React.Suspense>
      )}
    </div>
  );
};

InternalControlMgmt.displayName = 'InternalControlMgmt';

export default InternalControlMgmt;