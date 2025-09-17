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
    // TODO: Replace with actual API call
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
        },
        {
          id: '2',
          positionName: '총합기획부장',
          headquarters: '본부부서',
          departmentName: '총합기획부',
          divisionName: '총합기획부',
          registrationDate: '2024-02-01',
          registrar: '시스템관리자',
          registrarPosition: '시스템관리자',
          modificationDate: '2024-04-10',
          modifier: '김철수',
          modifierPosition: '인사팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '3',
          positionName: '영업본부장',
          headquarters: '본부부서',
          departmentName: '영업본부',
          divisionName: '영업본부',
          registrationDate: '2024-01-20',
          registrar: '관리자',
          registrarPosition: '시스템관리자',
          modificationDate: '2024-05-15',
          modifier: '박영희',
          modifierPosition: '영업기획팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '4',
          positionName: '기술개발팀장',
          headquarters: '팀단위',
          departmentName: '기술개발부',
          divisionName: '기술개발팀',
          registrationDate: '2024-03-05',
          registrar: '홍길동',
          registrarPosition: '총합기획부',
          modificationDate: '2024-06-01',
          modifier: '이민수',
          modifierPosition: '기술개발팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '5',
          positionName: '마케팅팀장',
          headquarters: '팀단위',
          departmentName: '마케팅부',
          divisionName: '마케팅팀',
          registrationDate: '2024-02-15',
          registrar: '김철수',
          registrarPosition: '인사팀',
          modificationDate: '2024-05-20',
          modifier: '정수진',
          modifierPosition: '마케팅팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '6',
          positionName: '인사팀장',
          headquarters: '팀단위',
          departmentName: '인사부',
          divisionName: '인사팀',
          registrationDate: '2024-01-10',
          registrar: '관리자',
          registrarPosition: '시스템관리자',
          modificationDate: '2024-04-25',
          modifier: '한상훈',
          modifierPosition: '인사팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '7',
          positionName: '재무팀장',
          headquarters: '팀단위',
          departmentName: '재무부',
          divisionName: '재무팀',
          registrationDate: '2024-02-28',
          registrar: '박영희',
          registrarPosition: '영업기획팀',
          modificationDate: '2024-06-10',
          modifier: '윤미래',
          modifierPosition: '재무팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '8',
          positionName: '품질보증팀장',
          headquarters: '팀단위',
          departmentName: '품질보증부',
          divisionName: '품질보증팀',
          registrationDate: '2024-03-15',
          registrar: '이민수',
          registrarPosition: '기술개발팀',
          modificationDate: '2024-05-30',
          modifier: '최영수',
          modifierPosition: '품질보증팀',
          status: '정상',
          isActive: true,
          approvalStatus: '승인완료'
        },
        {
          id: '9',
          positionName: '고객서비스팀장',
          headquarters: '팀단위',
          departmentName: '고객서비스부',
          divisionName: '고객서비스팀',
          registrationDate: '2024-04-01',
          registrar: '정수진',
          registrarPosition: '마케팅팀',
          modificationDate: '2024-06-15',
          modifier: '서현아',
          modifierPosition: '고객서비스팀',
          status: '정상',
          isActive: true,
          approvalStatus: '검토중'
        },
        {
          id: '10',
          positionName: '연구개발팀장',
          headquarters: '팀단위',
          departmentName: '연구개발부',
          divisionName: '연구개발팀',
          registrationDate: '2024-03-20',
          registrar: '한상훈',
          registrarPosition: '인사팀',
          modificationDate: '2024-05-10',
          modifier: '김도현',
          modifierPosition: '연구개발팀',
          status: '정상',
          isActive: false,
          approvalStatus: '보류'
        }
      ];

    setPositions(mockPositions);
    setPagination(prev => ({
      ...prev,
      total: mockPositions.length,
      totalPages: Math.ceil(mockPositions.length / prev.size)
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
                {t('position.management.title', '직책관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('position.management.description', '조직의 직책 정보를 체계적으로 관리합니다')}
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
        <div className={styles.searchSection}>
          <PositionSearchFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
          />
        </div>

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
            <p>직책 등록 모달</p>
            <p>PositionAddModal 컴포넌트 구현 예정</p>
            <button onClick={handleModalClose}>닫기</button>
          </div>
        </div>
      )}

      {modalState.detailModal && modalState.selectedPosition && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPlaceholder}>
            <h3>📋 직책 상세 정보</h3>
            <p>직책 정보 상세 보기</p>
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
