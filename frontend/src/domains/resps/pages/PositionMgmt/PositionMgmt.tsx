import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  FileDownload as ExcelIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Button, Chip } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PositionMgmt.module.scss';

// Types
import type {
  Position,
  PositionFilters,
  PositionModalState,
  PositionPagination
} from './types/position.types';

// Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { PositionDataGrid } from './components/PositionDataGrid';
import { PositionSearchFilter } from './components/PositionSearchFilter';

interface PositionMgmtProps {
  className?: string;
}

const PositionMgmt: React.FC<PositionMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [filters, setFilters] = useState<PositionFilters>({
    positionName: '',
    headquarters: '',
    status: '',
    isActive: ''
  });

  const [pagination, setPagination] = useState<PositionPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<PositionModalState>({
    addModal: false,
    detailModal: false,
    selectedPosition: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<PositionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handlePaginationChange = useCallback((newPagination: Partial<PositionPagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const handleAddPosition = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedPosition: null
    }));
  }, []);

  const handleExcelDownload = useCallback(() => {
    // TODO: 엑셀 다운로드 기능 구현
    console.log('엑셀 다운로드');
  }, []);

  const handleDeletePositions = useCallback(() => {
    // TODO: 선택된 직책 삭제 기능 구현
    console.log('선택된 직책 삭제:', selectedPositions);
  }, [selectedPositions]);

  const handleViewPosition = useCallback((position: Position) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedPosition: position
    }));
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedPosition: null
    }));
  }, []);

  const handlePositionUpdate = useCallback((updatedPosition: Position) => {
    setPositions(prev =>
      prev.map(pos => pos.id === updatedPosition.id ? updatedPosition : pos)
    );
    handleModalClose();
  }, [handleModalClose]);

  const handlePositionCreate = useCallback((newPosition: Position) => {
    setPositions(prev => [newPosition, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
    handleModalClose();
  }, [handleModalClose]);

  const handleSearch = useCallback(() => {
    setLoading(true);
    setPagination(prev => ({ ...prev, page: 1 }));
    // TODO: 실제 API 호출로 교체
    console.log('검색 필터:', filters);
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      positionName: '',
      headquarters: '',
      status: '',
      isActive: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((position: Position) => {
    console.log('행 클릭:', position);
  }, []);

  const handleRowDoubleClick = useCallback((position: Position) => {
    handleViewPosition(position);
  }, []);

  const handleSelectionChange = useCallback((selected: Position[]) => {
    setSelectedPositions(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Mock data loading
  React.useEffect(() => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockPositions: Position[] = [
        {
          id: '1',
          positionName: '경영진단본부장',
          headquarters: '본부부서',
          departmentName: '경영진단본부',
          divisionName: '경영진단본부',
          registrationDate: '2024-01-15',
          registrar: '관리자',
          registrarPosition: '시스템관리자',
          modificationDate: '2024-03-20',
          modifier: '홍길동',
          modifierPosition: '총합기획부',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        }
      ];

      setPositions(mockPositions);
      setPagination(prev => ({
        ...prev,
        total: mockPositions.length,
        totalPages: Math.ceil(mockPositions.length / prev.size)
      }));
      setLoading(false);
    }, 1000);
  }, [filters, pagination.page, pagination.size]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner centered text="맨하탄 금융센터 시스템 로딩 중..." />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 맨하탄 금융센터 스타일 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <DashboardIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('position.management.title', '직책관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('position.management.description', 'Manhattan Financial Center • Position Management System')}
              </p>
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{pagination.total}</div>
                <div className={styles.statLabel}>총 직책</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {positions.filter(p => p.isActive).length}
                </div>
                <div className={styles.statLabel}>활성 직책</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>98.5%</div>
                <div className={styles.statLabel}>시스템 가동률</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 프리미엄 검색 필터 */}
        <PositionSearchFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
        />

        {/* 💎 액션 바 - 프리미엄 스타일 */}
        <div className={styles.actionBar}>
          <div className={styles.actionLeft}>
            <div className={styles.totalCount}>
              <span className={styles.label}>총 직책 수:</span>
              <span className={styles.count}>{pagination.total}</span>
              <span className={styles.unit}>개</span>
            </div>

            <div className={styles.statusIndicators}>
              <Chip
                icon={<SecurityIcon />}
                label={`활성 ${positions.filter(p => p.isActive).length}개`}
                color="success"
                variant="filled"
                size="small"
              />
              <Chip
                label={`비활성 ${positions.filter(p => !p.isActive).length}개`}
                color="default"
                variant="outlined"
                size="small"
              />
            </div>
          </div>

          <div className={styles.actionRight}>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={handleExcelDownload}
              className={styles.actionButton}
            >
              엑셀다운로드
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddPosition}
              className={styles.actionButton}
              data-testid="add-position-button"
            >
              등록
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDeletePositions}
              disabled={selectedPositions.length === 0}
              className={styles.actionButton}
            >
              삭제
            </Button>
          </div>
        </div>

        {/* 🎯 데이터 그리드 - 프로페셔널 스타일 */}
        <div className={styles.gridSection}>
          <PositionDataGrid
            data={positions}
            loading={loading}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            onSelectionChange={handleSelectionChange}
            height="calc(100vh - 400px)"
          />
        </div>
      </div>

      {/* 🎭 프리미엄 모달들 */}
      {modalState.addModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPlaceholder}>
            <h3>🏗️ 새 직책 추가</h3>
            <p>Manhattan Financial Center Position Management</p>
            <p>PositionAddModal 컴포넌트 구현 예정</p>
            <button onClick={handleModalClose}>닫기</button>
          </div>
        </div>
      )}

      {modalState.detailModal && modalState.selectedPosition && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPlaceholder}>
            <h3>📋 직책 상세 정보</h3>
            <p>Manhattan Financial Center Position Details</p>
            <p><strong>선택된 직책:</strong> {modalState.selectedPosition.positionName}</p>
            <p><strong>소속 부서:</strong> {modalState.selectedPosition.departmentName}</p>
            <button onClick={handleModalClose}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionMgmt;
