// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PositionMgmt.module.scss';

// API
import { deletePositions, getAllPositions, getPositionsByLedgerOrderId } from '../../api/positionApi';

// Types
import type {
  Position,
  PositionFilters,
  PositionFormData,
  PositionModalState
} from './types/position.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Domain Components
import { LedgerOrderComboBox } from '../../components/molecules/LedgerOrderComboBox';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import useFilters from '@/shared/hooks/useFilters';
import usePagination from '@/shared/hooks/usePagination';

// Position specific components
import { positionColumns } from './components/PositionDataGrid/positionColumns';

// Lazy-loaded components for performance optimization
const PositionFormModal = React.lazy(() =>
  import('./components/PositionFormModal/index').then(module => ({ default: module.default }))
);

interface PositionMgmtProps {
  className?: string;
}

const PositionMgmt: React.FC<PositionMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);

  // 커스텀 훅 사용
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: {
      key: 'position-search',
      messages: { cancel: '' } // 취소 메시지 비활성화
    },
    excel: {
      key: 'position-excel',
      messages: { cancel: '' }
    },
    delete: {
      key: 'position-delete',
      messages: { cancel: '' }
    },
    create: {
      key: 'position-create',
      messages: { cancel: '' }
    },
    update: {
      key: 'position-update',
      messages: { cancel: '' }
    }
  });

  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters
  } = useFilters<PositionFilters>({
    ledgerOrderId: '',
    positionName: '',
    isActive: ''
  });

  const {
    pagination,
    updateTotal,
    info: paginationInfo
  } = usePagination({
    initialPage: 1,
    initialSize: 20,
    total: 0
  });

  const [modalState, setModalState] = useState<PositionModalState>({
    addModal: false,
    detailModal: false,
    selectedPosition: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<PositionFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);


  const handleAddPosition = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedPosition: null
    }));
    toast.info('새 직책을 등록해주세요.', { autoClose: 2000 });
  }, []);

  const handleExcelDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // TODO: 실제 엑셀 다운로드 API 호출
        await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
        console.log('엑셀 다운로드 완료');
      },
      {
        loading: '엑셀 파일을 생성 중입니다...',
        success: '엑셀 파일이 다운로드되었습니다.',
        error: '엑셀 다운로드에 실패했습니다.'
      }
    );
  }, [handlers.excel]);

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

    await handlers.delete.execute(
      async () => {
        // 삭제 API 호출
        const positionIds = selectedPositions.map(pos => Number(pos.id));
        await deletePositions(positionIds);

        // 삭제 후 목록 다시 조회
        await handleSearch();
        updateTotal(pagination.total - selectedPositions.length);
        setSelectedPositions([]);
      },
      {
        loading: `${selectedPositions.length}개 직책을 삭제 중입니다...`,
        success: `${selectedPositions.length}개 직책이 삭제되었습니다.`,
        error: '직책 삭제에 실패했습니다.'
      }
    );
  }, [selectedPositions, handlers.delete, updateTotal, pagination.total]);


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
    await handlers.create.execute(
      async () => {
        // TODO: API 호출로 직책 생성
        // const response = await positionApi.create(formData);

        // 임시로 새 직책 객체 생성
        const newPosition: Position = {
          id: Date.now().toString(),
          positionName: formData.positionName,
          headquarters: formData.headquarters,
          divisionName: '미지정',
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
        updateTotal(pagination.total + 1);
        handleModalClose();
      },
      {
        loading: '직책을 등록 중입니다...',
        success: '직책이 성공적으로 등록되었습니다.',
        error: '직책 등록에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.create, updateTotal, pagination.total]);

  const handlePositionUpdate = useCallback(async (id: string, formData: PositionFormData) => {
    await handlers.update.execute(
      async () => {
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
                  modificationDate: new Date().toISOString().split('T')[0],
                  modifier: '현재사용자',
                  modifierPosition: '관리자'
                }
              : pos
          )
        );

        handleModalClose();
      },
      {
        loading: '직책을 수정 중입니다...',
        success: '직책이 성공적으로 수정되었습니다.',
        error: '직책 수정에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.update]);

  const handlePositionDetail = useCallback((position: Position) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedPosition: position
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // API 호출: ledgerOrderId가 있으면 원장차수별 조회, 없으면 전체 조회
        let data;
        if (filters.ledgerOrderId) {
          data = await getPositionsByLedgerOrderId(filters.ledgerOrderId);
          console.log('🔍 원장차수별 조회 API Response:', data);
        } else {
          data = await getAllPositions();
          console.log('🔍 전체 조회 API Response:', data);
        }

        // 클라이언트 사이드 필터링 (필요시)
        let filteredData = data;

        if (filters.positionName) {
          filteredData = filteredData.filter(p =>
            p.positionsName.includes(filters.positionName)
          );
        }

        if (filters.isActive) {
          filteredData = filteredData.filter(p =>
            p.isActive === filters.isActive
          );
        }

        // Position 타입으로 변환 (positions 기준, orgNames 배열 사용)
        const positions: Position[] = filteredData.map(dto => ({
          id: dto.positionsId.toString(),
          positionName: dto.positionsName,
          headquarters: dto.hqName,
          hqName: dto.hqName,                           // 본부명
          orgName: dto.orgNames?.[0] || '-',            // 부점명 (첫번째 값, 호환성 유지)
          orgNames: dto.orgNames || [],                 // 부점명 배열 (Grid valueGetter 사용)
          registrationDate: dto.createdAt.split('T')[0],
          registrar: dto.createdBy,
          registrarPosition: '-',
          modificationDate: dto.updatedAt.split('T')[0],
          modifier: dto.updatedBy,
          modifierPosition: '-',
          status: dto.positionsStatus || '-',
          isActive: dto.isActive === 'Y',
          approvalStatus: '-',
          dual: dto.isConcurrent
        }));

        console.log('🔍 Mapped Positions:', positions);
        setPositions(positions);
        updateTotal(positions.length);
      },
      {
        loading: '직책 정보를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [filters, handlers.search, updateTotal]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters]);

  // Grid Event Handlers
  const handleRowClick = useCallback((position: Position) => {
    // 원클릭으로 상세 모달 열기
    handlePositionDetail(position);
  }, [handlePositionDetail]);

  const handleRowDoubleClick = useCallback((position: Position) => {
    // 더블클릭도 동일하게 상세 모달 열기
    handlePositionDetail(position);
  }, [handlePositionDetail]);

  const handleSelectionChange = useCallback((selected: Position[]) => {
    setSelectedPositions(selected);
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

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 직책',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.activeCount,
      label: '활성 직책',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: `${statistics.systemUptime}%`,
      label: '시스템 가동률',
      color: 'default' as const
    }
  ], [statistics]);

  // Filtered positions for display (성능 최적화)
  const displayPositions = useMemo(() => {
    return positions; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [positions]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 2.5 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId}
          onChange={(value) => setFilter('ledgerOrderId', value || '')}
          label="책무이행차수"
          required
          fullWidth
          size="small"
        />
      )
    },
    {
      key: 'positionName',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
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
  ], [filters.ledgerOrderId, setFilter]);

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
      color: 'default',
      icon: <SecurityIcon />
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
      // console.group(`🔍 PositionMgmt Performance Profiler`);
      // console.log(`📊 Phase: ${phase}`);
      // console.log(`⏱️ Actual Duration: ${actualDuration.toFixed(2)}ms`);
      // console.log(`📏 Base Duration: ${baseDuration.toFixed(2)}ms`);
      // console.log(`🚀 Start Time: ${startTime.toFixed(2)}ms`);
      // console.log(`✅ Commit Time: ${commitTime.toFixed(2)}ms`);

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

  // 페이지 로드 시 초기 데이터 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      await handlers.search.execute(
        async () => {
          const data = await getAllPositions();

          // Position 타입으로 변환
          const positions: Position[] = data.map(dto => {
            return {
              id: dto.positionsId.toString(),
              positionName: dto.positionsName,
              headquarters: dto.hqName,
              hqName: dto.hqName,
              orgName: dto.orgName || '-',
              registrationDate: dto.createdAt.split('T')[0],
              registrar: dto.createdBy,
              registrarPosition: '-',
              modificationDate: dto.updatedAt.split('T')[0],
              modifier: dto.updatedBy,
              modifierPosition: '-',
              status: dto.positionsStatus || '-',
              isActive: dto.isActive === 'Y',
              approvalStatus: '-',
              dual: dto.isConcurrent
            };
          });

          setPositions(positions);
          updateTotal(positions.length);
        },
        {
          loading: '직책 정보를 불러오는 중입니다...',
          success: '', // 페이지 로드 시 성공 메시지 비활성화
          error: '직책 정보를 불러오는데 실패했습니다.'
        }
      );
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 페이지 로드 시 한 번만 실행


  return (
    <React.Profiler id="PositionMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 공통 페이지 헤더 */}
        <BasePageHeader
          icon={<DashboardIcon />}
          title={t('position.management.title', '직책관리 시스템')}
          description={t('position.management.description', '조직의 직책 정보를 체계적으로 관리합니다')}
          statistics={headerStatistics}
          i18nNamespace="resps"
        />

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 공통 검색 필터 (원장차수 포함) */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<PositionFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={anyLoading}
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
          loading={anyLoading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayPositions}
          columns={positionColumns}
          loading={anyLoading}
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

      {/* 직책 등록/상세 모달 - BaseModalWrapper 적용 */}
      <BaseModalWrapper
        isOpen={modalState.addModal || modalState.detailModal}
        onClose={handleModalClose}
        ariaLabel="직책 관리 모달"
        fallbackComponent={<LoadingSpinner text="직책 모달을 불러오는 중..." />}
      >
        <PositionFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          position={modalState.selectedPosition}
          onClose={handleModalClose}
          onSave={handlePositionSave}
          onUpdate={handlePositionUpdate}
          onRefresh={handleSearch}
          loading={loadingStates.create || loadingStates.update}
        />
      </BaseModalWrapper>
      </div>
    </React.Profiler>
  );
};

export default PositionMgmt;
