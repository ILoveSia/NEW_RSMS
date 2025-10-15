// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ResponsibilityMgmt.module.scss';

// Types
import type {
  Responsibility,
  ResponsibilityFilters,
  ResponsibilityFormData,
  ResponsibilityModalState
} from './types/responsibility.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import useFilters from '@/shared/hooks/useFilters';
import usePagination from '@/shared/hooks/usePagination';

// Responsibility specific components
import { responsibilityColumns } from './components/ResponsibilityDataGrid/responsibilityColumns';

// Lazy-loaded components for performance optimization
const ResponsibilityFormModal = React.lazy(() =>
  import('./components/ResponsibilityFormModal').then(module => ({ default: module.default }))
);

interface ResponsibilityMgmtProps {
  className?: string;
}

const ResponsibilityMgmt: React.FC<ResponsibilityMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<Responsibility[]>([]);

  // 커스텀 훅 사용
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: { key: 'responsibility-search' },
    excel: { key: 'responsibility-excel' },
    delete: { key: 'responsibility-delete' },
    create: { key: 'responsibility-create' },
    update: { key: 'responsibility-update' }
  });

  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters
  } = useFilters<ResponsibilityFilters>({
    직책명: '',
    책무: '',
    본부구분: '',
    부점명: '',
    관리의무: '',
    상태: '',
    사용여부: ''
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

  const [modalState, setModalState] = useState<ResponsibilityModalState>({
    addModal: false,
    detailModal: false,
    selectedResponsibility: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ResponsibilityFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleAddResponsibility = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedResponsibility: null
    }));
    toast.info('새 책무를 등록해주세요.', { autoClose: 2000 });
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

  const handleDeleteResponsibilities = useCallback(async () => {
    if (selectedResponsibilities.length === 0) {
      toast.warning('삭제할 책무를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedResponsibilities.length}개의 책무를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    await handlers.delete.execute(
      async () => {
        // TODO: 실제 삭제 API 호출
        await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

        // 상태 업데이트 (삭제된 항목 제거)
        setResponsibilities(prev =>
          prev.filter(resp => !selectedResponsibilities.some(selected => selected.id === resp.id))
        );
        updateTotal(pagination.total - selectedResponsibilities.length);
        setSelectedResponsibilities([]);
      },
      {
        loading: `${selectedResponsibilities.length}개 책무를 삭제 중입니다...`,
        success: `${selectedResponsibilities.length}개 책무가 삭제되었습니다.`,
        error: '책무 삭제에 실패했습니다.'
      }
    );
  }, [selectedResponsibilities, handlers.delete, updateTotal, pagination.total]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedResponsibility: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleResponsibilitySave = useCallback(async (formData: ResponsibilityFormData) => {
    await handlers.create.execute(
      async () => {
        // TODO: API 호출로 책무 생성
        // const response = await responsibilityApi.create(formData);

        // 임시로 새 책무 객체 생성
        const newResponsibility: Responsibility = {
          id: Date.now().toString(),
          순번: responsibilities.length + 1,
          직책: formData.직책,
          책무: formData.책무,
          책무세부내용: formData.책무세부내용,
          관리의무: formData.관리의무,
          부점명: formData.부점명,
          등록일자: new Date().toISOString().split('T')[0],
          등록자: '현재사용자',
          등록자직책: '관리자',
          상태: '정상',
          사용여부: formData.사용여부,
          본부구분: formData.본부구분,
          부서명: formData.부서명
        };

        setResponsibilities(prev => [newResponsibility, ...prev]);
        updateTotal(pagination.total + 1);
        handleModalClose();
      },
      {
        loading: '책무를 등록 중입니다...',
        success: '책무가 성공적으로 등록되었습니다.',
        error: '책무 등록에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.create, updateTotal, pagination.total, responsibilities.length]);

  const handleResponsibilityUpdate = useCallback(async (id: string, formData: ResponsibilityFormData) => {
    await handlers.update.execute(
      async () => {
        // TODO: API 호출로 책무 수정
        // const response = await responsibilityApi.update(id, formData);

        // 임시로 기존 책무 업데이트
        setResponsibilities(prev =>
          prev.map(resp =>
            resp.id === id
              ? {
                  ...resp,
                  직책: formData.직책,
                  책무: formData.책무,
                  책무세부내용: formData.책무세부내용,
                  관리의무: formData.관리의무,
                  부점명: formData.부점명,
                  본부구분: formData.본부구분,
                  부서명: formData.부서명
                }
              : resp
          )
        );

        handleModalClose();
      },
      {
        loading: '책무를 수정 중입니다...',
        success: '책무가 성공적으로 수정되었습니다.',
        error: '책무 수정에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.update]);

  const handleResponsibilityDetail = useCallback((responsibility: Responsibility) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedResponsibility: responsibility
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // TODO: 실제 API 호출로 교체
        await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
        console.log('검색 필터:', filters);
      },
      {
        loading: '책무 정보를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [filters, handlers.search]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters]);

  // Grid Event Handlers
  const handleRowClick = useCallback((responsibility: Responsibility) => {
    console.log('행 클릭:', responsibility);
  }, []);

  const handleRowDoubleClick = useCallback((responsibility: Responsibility) => {
    handleResponsibilityDetail(responsibility);
  }, [handleResponsibilityDetail]);

  const handleSelectionChange = useCallback((selected: Responsibility[]) => {
    setSelectedResponsibilities(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = responsibilities.filter(r => r.사용여부).length;
    const inactiveCount = responsibilities.filter(r => !r.사용여부).length;
    const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      activeCount,
      inactiveCount,
      systemUptime
    };
  }, [pagination.total, responsibilities]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 책무',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.activeCount,
      label: '활성 책무',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: `${statistics.systemUptime}%`,
      label: '시스템 가동률',
      color: 'default' as const
    }
  ], [statistics]);

  // Filtered responsibilities for display (성능 최적화)
  const displayResponsibilities = useMemo(() => {
    return responsibilities; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [responsibilities]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: '직책명',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: '책무',
      type: 'text',
      label: '책무',
      placeholder: '책무를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: '부점명',
      type: 'text',
      label: '부점명',
      placeholder: '부점명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
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
      onClick: handleAddResponsibility
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteResponsibilities,
      disabled: selectedResponsibilities.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddResponsibility, handleDeleteResponsibilities, selectedResponsibilities.length, loadingStates]);

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
      console.group(`🔍 ResponsibilityMgmt Performance Profiler`);
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

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockResponsibilities: Responsibility[] = [
      {
        id: '1',
        순번: 1,
        직책: '이사회의장',
        책무: '이사회 운영업무 관련된 책무',
        책무세부내용: '책무구조도의 미래 관리 컨설 책무 세부내용',
        관리의무: '내부통제기준 및 위험관리기준 수립 책무에 대한 관리의무',
        부점명: '경영진',
        등록일자: '2025-08-13',
        등록자: '관리자',
        등록자직책: '시스템관리자',
        상태: '반영필요',
        사용여부: true
      },
      {
        id: '2',
        순번: 2,
        직책: '내규인사',
        책무: '책무구조도의 미래 관리 컨설 책무 관리업무',
        책무세부내용: '내부통제기준 및 위험관리기준 수립 책무에 대한 관리의무',
        관리의무: '내부통제기준 및 위험관리기준 수립 책무에 대한 관리의무',
        부점명: '감사부',
        등록일자: '2025-08-13',
        등록자: '김철수',
        등록자직책: '관리자',
        상태: '반영필요',
        사용여부: true
      },
      {
        id: '3',
        순번: 3,
        직책: '감사본부장',
        책무: '내부감사 업무와 관련된 책무',
        책무세부내용: '내부감사 업무와 관련된 책무 세부 내용',
        관리의무: '내부통제기준 및 위험관리기준 수립 책무에 대한 관리의무',
        부점명: '감사부',
        등록일자: '2025-08-13',
        등록자: '홍길동',
        등록자직책: '관리자',
        상태: '반영필요',
        사용여부: true
      }
    ];

    setResponsibilities(mockResponsibilities);
    updateTotal(mockResponsibilities.length);
  }, [updateTotal]);

  return (
    <React.Profiler id="ResponsibilityMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 공통 페이지 헤더 */}
        <BasePageHeader
          icon={<DashboardIcon />}
          title={t('responsibility.management.title', '책무관리 시스템')}
          description={t('responsibility.management.description', '조직의 책무 정보를 체계적으로 관리합니다')}
          statistics={headerStatistics}
          i18nNamespace="resps"
        />

        {/* 🎨 메인 컨텐츠 영역 */}
        <div className={styles.content}>
          {/* 🔍 공통 검색 필터 */}
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ResponsibilityFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={anyLoading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 책무 수"
            selectedCount={selectedResponsibilities.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={anyLoading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayResponsibilities}
            columns={responsibilityColumns}
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

        {/* 책무 등록/상세 모달 - BaseModalWrapper 적용 */}
        <BaseModalWrapper
          isOpen={modalState.addModal || modalState.detailModal}
          onClose={handleModalClose}
          ariaLabel="책무 관리 모달"
          fallbackComponent={<LoadingSpinner text="책무 모달을 불러오는 중..." />}
        >
          <ResponsibilityFormModal
            open={modalState.addModal || modalState.detailModal}
            mode={modalState.addModal ? 'create' : 'detail'}
            responsibility={modalState.selectedResponsibility}
            onClose={handleModalClose}
            onSave={handleResponsibilitySave}
            onUpdate={handleResponsibilityUpdate}
            loading={loadingStates.create || loadingStates.update}
          />
        </BaseModalWrapper>
      </div>
    </React.Profiler>
  );
};

export default ResponsibilityMgmt;
