// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import { Button } from '@/shared/components/atoms/Button';
import toast from '@/shared/utils/toast';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import ExcelIcon from '@mui/icons-material/FileDownload';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Chip } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
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
import { PositionSearchFilter } from './components/PositionSearchFilter';

// Lazy-loaded components for performance optimization
const PositionDataGrid = React.lazy(() => import('./components/PositionDataGrid/PositionDataGrid'));

interface PositionMgmtProps {
  className?: string;
}

const PositionMgmt: React.FC<PositionMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });
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
    toast.info('새 직책을 등록해주세요.', { autoClose: 2000 });
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

  const handleDeletePositions = useCallback(async () => {
    if (selectedPositions.length === 0) {
      toast.warning('삭제할 직책을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedPositions.length}개의 직책을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedPositions.length}개 직책을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setPositions(prev =>
        prev.filter(pos => !selectedPositions.some(selected => selected.id === pos.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedPositions.length
      }));
      setSelectedPositions([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedPositions.length}개 직책이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '직책 삭제에 실패했습니다.');
      console.error('직책 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
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

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('직책 정보를 검색 중입니다...');

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
      headquarters: '',
      status: '',
      isActive: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Grid Event Handlers
  const handleRowClick = useCallback((position: Position) => {
    console.log('행 클릭:', position);
  }, []);

  const handleRowDoubleClick = useCallback((position: Position) => {
    handleViewPosition(position);
  }, [handleViewPosition]);

  const handleSelectionChange = useCallback((selected: Position[]) => {
    setSelectedPositions(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = positions.filter(p => p.isActive).length;
    const inactiveCount = positions.filter(p => !p.isActive).length;
    const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      activeCount,
      inactiveCount,
      systemUptime
    };
  }, [pagination.total, positions]);

  // Filtered positions for display (성능 최적화)
  const displayPositions = useMemo(() => {
    return positions; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [positions]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 PositionMgmt Performance Profiler`);
      console.log(`📊 Phase: ${phase}`);
      console.log(`⏱️ Actual Duration: ${actualDuration.toFixed(2)}ms`);
      console.log(`📏 Base Duration: ${baseDuration.toFixed(2)}ms`);
      console.log(`🚀 Start Time: ${startTime.toFixed(2)}ms`);
      console.log(`✅ Commit Time: ${commitTime.toFixed(2)}ms`);

      if (actualDuration > 16) { // 60fps 기준 16ms 초과 시 경고
        console.warn(`⚠️ 성능 주의: 렌더링 시간이 16ms를 초과했습니다 (${actualDuration.toFixed(2)}ms)`);
      }
      console.groupEnd();
    }
  }, []);

  // Web Performance API를 활용한 페이지 로드 성능 측정
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const measurePageLoad = () => {
        if (performance.getEntriesByType) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            console.group(`📊 Page Load Performance`);
            console.log(`🌐 DNS 조회: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
            console.log(`🔗 연결 시간: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
            console.log(`📥 응답 시간: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
            console.log(`🎨 DOM 로딩: ${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`);
            console.log(`🏁 전체 로딩: ${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`);
            console.groupEnd();
          }
        }
      };

      // 페이지 로드 완료 후 측정
      if (document.readyState === 'complete') {
        measurePageLoad();
      } else {
        window.addEventListener('load', measurePageLoad);
        return () => window.removeEventListener('load', measurePageLoad);
      }
    }
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
    <React.Profiler id="PositionMgmt" onRender={onRenderProfiler}>
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
                <div className={styles.statNumber}>{statistics.total}</div>
                <div className={styles.statLabel}>총 직책</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {statistics.activeCount}
                </div>
                <div className={styles.statLabel}>활성 직책</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
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
              <span className={styles.count}>{statistics.total}</span>
              <span className={styles.unit}>개</span>
            </div>

            <div className={styles.statusIndicators}>
              <Chip
                icon={<SecurityIcon />}
                label={`활성 ${statistics.activeCount}개`}
                color="success"
                variant="filled"
                size="small"
              />
              <Chip
                label={`비활성 ${statistics.inactiveCount}개`}
                color="default"
                variant="outlined"
                size="small"
              />
            </div>
          </div>

          <div className={styles.actionRight}>
            <Button
              variant="contained"
              startIcon={<ExcelIcon />}
              onClick={handleExcelDownload}
              className={styles.actionButton}
            >
              엑셀다운로드
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPosition}
              className={styles.actionButton}
              data-testid="add-position-button"
            >
              등록
            </Button>
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={handleDeletePositions}
              disabled={selectedPositions.length === 0}
              className={styles.actionButton}
            >
              삭제
            </Button>
          </div>
        </div>

        {/* 🎯 데이터 그리드 - 프로페셔널 스타일 (지연 로딩 최적화) */}
        <div className={styles.gridSection}>
          <React.Suspense
            fallback={
              <div className={styles.gridLoadingContainer}>
                <LoadingSpinner
                  size="large"
                  text="데이터 그리드를 로딩 중입니다..."
                />
              </div>
            }
          >
            <PositionDataGrid
              data={displayPositions}
              loading={loading}
              onRowClick={handleRowClick}
              onRowDoubleClick={handleRowDoubleClick}
              onSelectionChange={handleSelectionChange}
              height="calc(100vh - 350px)"
            />
          </React.Suspense>
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
    </React.Profiler>
  );
};

export default PositionMgmt;
