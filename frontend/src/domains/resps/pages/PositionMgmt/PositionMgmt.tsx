// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PositionMgmt.module.scss';

// Types
import type {
  Position,
  PositionFilters,
  PositionFormData,
  PositionModalState,
  PositionPagination
} from './types/position.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Position specific components
import { positionColumns } from './components/PositionDataGrid/positionColumns';

// Lazy-loaded components for performance optimization
const PositionFormModal = React.lazy(() => import('./components/PositionFormModal'));

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


  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedPosition: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handlePositionSave = useCallback(async (formData: PositionFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 직책 생성
      // const response = await positionApi.create(formData);

      // 임시로 새 직책 객체 생성
      const newPosition: Position = {
        id: Date.now().toString(),
        positionName: formData.positionName,
        headquarters: formData.headquarters,
        departmentName: formData.departmentName,
        divisionName: formData.divisionName,
        registrationDate: new Date().toISOString().split('T')[0],
        registrar: '현재사용자',
        registrarPosition: '관리자',
        modificationDate: new Date().toISOString().split('T')[0],
        modifier: '현재사용자',
        modifierPosition: '관리자',
        status: '정상',
        isActive: true,
        approvalStatus: '승인',
        dual: '단일'
      };

      setPositions(prev => [newPosition, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('직책이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('직책 등록 실패:', error);
      toast.error('직책 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handlePositionUpdate = useCallback(async (id: string, formData: PositionFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 직책 수정
      // const response = await positionApi.update(id, formData);

      // 임시로 기존 직책 업데이트
      setPositions(prev =>
        prev.map(pos =>
          pos.id === id
            ? {
                ...pos,
                positionName: formData.positionName,
                headquarters: formData.headquarters,
                departmentName: formData.departmentName,
                divisionName: formData.divisionName,
                modificationDate: new Date().toISOString().split('T')[0],
                modifier: '현재사용자',
                modifierPosition: '관리자'
              }
            : pos
        )
      );

      handleModalClose();
      toast.success('직책이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('직책 수정 실패:', error);
      toast.error('직책 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handlePositionDetail = useCallback((position: Position) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedPosition: position
    }));
  }, []);

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
    handlePositionDetail(position);
  }, [handlePositionDetail]);

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
      key: 'headquarters',
      type: 'select',
      label: '본부구분',
      options: [
        { value: '', label: '전체' },
        { value: '본부부서', label: '본부부서' },
        { value: '지역본부', label: '지역본부' },
        { value: '영업점', label: '영업점' },
        { value: '센터', label: '센터' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'status',
      type: 'select',
      label: '상태',
      options: [
        { value: '', label: '전체' },
        { value: '완료', label: '완료' },
        { value: '반영필요', label: '반영필요' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
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
  ], []);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
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
      onClick: handleAddPosition
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeletePositions,
      disabled: selectedPositions.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddPosition, handleDeletePositions, selectedPositions.length, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.activeCount,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '비활성',
      value: statistics.inactiveCount,
      color: 'default'
    }
  ], [statistics]);

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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'N'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '승인완료',
          dual: 'Y'
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
          status: '반영필요',
          isActive: true,
          approvalStatus: '검토중',
          dual: 'Y'
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
          status: '반영필요',
          isActive: false,
          approvalStatus: '보류',
          dual: 'Y'
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
        {/* 🔍 공통 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<PositionFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 직책 수"
          selectedCount={selectedPositions.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayPositions}
          columns={positionColumns}
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

      {/* 직책 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <PositionFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          position={modalState.selectedPosition}
          onClose={handleModalClose}
          onSave={handlePositionSave}
          onUpdate={handlePositionUpdate}
          loading={loading}
        />
      </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default PositionMgmt;
