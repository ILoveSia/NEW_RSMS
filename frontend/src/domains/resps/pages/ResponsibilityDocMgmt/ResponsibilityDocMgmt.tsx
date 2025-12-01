// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as responsibilityDocApi from '@/domains/resps/api/responsibilityDocApi';
import styles from './ResponsibilityDocMgmt.module.scss';

// Types
import type {
  ResponsibilityDoc,
  ResponsibilityDocFilters,
  ResponsibilityDocFormData,
  ResponsibilityDocModalState,
  ResponsibilityDocPagination
} from './types/responsibilityDoc.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import LedgerOrderComboBox from '@/domains/resps/components/molecules/LedgerOrderComboBox/LedgerOrderComboBox';

// ResponsibilityDoc specific components
import { responsibilityDocColumns } from './components/ResponsibilityDocDataGrid/responsibilityDocColumns.tsx';

// Lazy-loaded components for performance optimization
const ResponsibilityDocFormModal = React.lazy(() =>
  import('./components/ResponsibilityDocFormModal/ResponsibilityDocFormModal').then(module => ({ default: module.default }))
);

interface ResponsibilityDocMgmtProps {
  className?: string;
}

const ResponsibilityDocMgmt: React.FC<ResponsibilityDocMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [docs, setDocs] = useState<ResponsibilityDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDocs, setSelectedDocs] = useState<ResponsibilityDoc[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });

  const [filters, setFilters] = useState<ResponsibilityDocFilters>({
    ledgerOrderId: '',
    positionName: '',
    isActive: ''
  });

  const [pagination, setPagination] = useState<ResponsibilityDocPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ResponsibilityDocModalState>({
    addModal: false,
    detailModal: false,
    selectedDoc: null
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ResponsibilityDocFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAddDoc = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedDoc: null
    }));
    toast.info('새 책무기술서를 생성해주세요.', { autoClose: 2000 });
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

  const handleDeleteDocs = useCallback(async () => {
    if (selectedDocs.length === 0) {
      toast.warning('삭제할 책무기술서를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedDocs.length}개의 책무기술서를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedDocs.length}개 책무기술서를 삭제 중입니다...`);

    try {
      // 실제 삭제 API 호출
      const deletePromises = selectedDocs.map(doc =>
        responsibilityDocApi.deleteResponsibilityDoc(doc.id)
      );

      await Promise.all(deletePromises);

      // 상태 업데이트 (삭제된 항목 제거)
      setDocs(prev =>
        prev.filter(doc => !selectedDocs.some(selected => selected.id === doc.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedDocs.length
      }));
      setSelectedDocs([]);

      // 성공 토스트로 업데이트
      toast.dismiss(loadingToastId);
      toast.success(`${selectedDocs.length}개 책무기술서가 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.dismiss(loadingToastId);
      const errorMessage = error instanceof Error ? error.message : '책무기술서 삭제에 실패했습니다.';
      toast.error(errorMessage);
      console.error('책무기술서 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedDocs]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedDoc: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleDocSave = useCallback(async (formData: ResponsibilityDocFormData) => {
    try {
      setLoading(true);

      // 책무기술서 생성 요청 DTO 변환
      const createRequest: responsibilityDocApi.CreateResponsibilityDocRequest = {
        ledgerOrderId: formData.ledgerOrderId,
        positionId: formData.positionId,
        arbitraryPosition: formData.arbitraryPosition,
        mainCommittees: formData.mainCommittees,
        responsibilityOverview: formData.responsibilityOverview,
        responsibilityBackground: formData.responsibilityBackground,
        responsibilityBackgroundDate: formData.responsibilityBackgroundDate,
        responsibilities: formData.responsibilities,
        managementDuties: formData.managementDuties
      };

      // 실제 API 호출
      const response = await responsibilityDocApi.createResponsibilityDoc(createRequest);

      // 응답 데이터로 새 책무기술서 객체 생성 (resp_statement_execs 테이블 전체 컬럼)
      const newDoc: ResponsibilityDoc = {
        id: response.respStmtExecId,
        seq: docs.length + 1,
        positionName: response.positionName,
        executiveName: response.executiveName,
        positionAssignedDate: response.positionAssignedDate || null,
        concurrentPosition: response.concurrentPosition || null,
        responsibilityAssignedDate: response.responsibilityAssignedDate || null,
        createdAt: response.createdAt,
        createdBy: response.createdBy,
        isActive: response.isActive === 'Y'
      };

      setDocs(prev => [newDoc, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      handleModalClose();
      toast.success('책무기술서가 성공적으로 생성되었습니다.');
    } catch (error) {
      console.error('책무기술서 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '책무기술서 생성에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [docs.length, handleModalClose]);

  const handleDocUpdate = useCallback(async (id: string, formData: ResponsibilityDocFormData) => {
    try {
      setLoading(true);

      // 책무기술서 수정 요청 DTO 변환
      const updateRequest: responsibilityDocApi.UpdateResponsibilityDocRequest = {
        ledgerOrderId: formData.ledgerOrderId,
        positionId: formData.positionId,
        arbitraryPosition: formData.arbitraryPosition,
        mainCommittees: formData.mainCommittees,
        responsibilityOverview: formData.responsibilityOverview,
        responsibilityBackground: formData.responsibilityBackground,
        responsibilityBackgroundDate: formData.responsibilityBackgroundDate,
        responsibilities: formData.responsibilities,
        managementDuties: formData.managementDuties
      };

      // 실제 API 호출
      const response = await responsibilityDocApi.updateResponsibilityDoc(id, updateRequest);

      // 응답 데이터로 기존 책무기술서 업데이트 (resp_statement_execs 테이블 전체 컬럼)
      setDocs(prev =>
        prev.map(doc =>
          doc.id === id
            ? {
                ...doc,
                positionName: response.positionName,
                executiveName: response.executiveName,
                positionAssignedDate: response.positionAssignedDate || null,
                concurrentPosition: response.concurrentPosition || null,
                responsibilityAssignedDate: response.responsibilityAssignedDate || null,
                isActive: response.isActive === 'Y'
              }
            : doc
        )
      );

      handleModalClose();
      toast.success('책무기술서가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('책무기술서 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '책무기술서 수정에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleDocDetail = useCallback((doc: ResponsibilityDoc) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedDoc: doc
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('책무기술서를 검색 중입니다...');

    try {
      // 실제 API 호출 (필터 적용)
      const response = await responsibilityDocApi.getResponsibilityDocs({
        ledgerOrderId: filters.ledgerOrderId || undefined,
        positionName: filters.positionName || undefined,
        isActive: filters.isActive ? (filters.isActive === 'Y') : undefined,
        page: 0,
        size: 20
      });

      // 응답 데이터를 ResponsibilityDoc 형식으로 변환 (resp_statement_execs 테이블 전체 컬럼)
      const convertedDocs: ResponsibilityDoc[] = response.content.map((item, index) => ({
        id: item.respStmtExecId,
        seq: index + 1,
        positionName: item.positionName,
        executiveName: item.executiveName,
        positionAssignedDate: item.positionAssignedDate || null,
        concurrentPosition: item.concurrentPosition || null,
        responsibilityAssignedDate: item.responsibilityAssignedDate || null,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
        isActive: item.isActive === 'Y'
      }));

      setDocs(convertedDocs);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements,
        totalPages: response.totalPages,
        page: response.page + 1
      }));

      console.log('검색 필터:', filters);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `검색이 완료되었습니다. (${response.totalElements}건)`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  const handleClearFilters = useCallback(async () => {
    // 필터 초기화
    setFilters({
      ledgerOrderId: '',
      positionName: '',
      isActive: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));

    // 전체 데이터 다시 로드
    try {
      setLoading(true);

      const response = await responsibilityDocApi.getResponsibilityDocs({
        page: 0,
        size: 20
      });

      // 응답 데이터를 ResponsibilityDoc 형식으로 변환 (resp_statement_execs 테이블 전체 컬럼)
      const convertedDocs: ResponsibilityDoc[] = response.content.map((item, index) => ({
        id: item.respStmtExecId,
        seq: index + 1,
        positionName: item.positionName,
        executiveName: item.executiveName,
        positionAssignedDate: item.positionAssignedDate || null,
        concurrentPosition: item.concurrentPosition || null,
        responsibilityAssignedDate: item.responsibilityAssignedDate || null,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
        isActive: item.isActive === 'Y'
      }));

      setDocs(convertedDocs);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements,
        totalPages: response.totalPages,
        page: response.page + 1
      }));

      toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Grid Event Handlers
  // 📝 주의: 행 전체 클릭 이벤트는 제거하고, "직책" 컬럼만 클릭 가능하도록 변경
  // handleRowClick, handleRowDoubleClick 함수는 더 이상 사용하지 않음
  // 대신 responsibilityDocColumns.tsx의 PositionNameRenderer에서 직책 컬럼 클릭 처리

  const handleSelectionChange = useCallback((selected: ResponsibilityDoc[]) => {
    setSelectedDocs(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = docs.filter(d => d.isActive).length;
    const inactiveCount = docs.filter(d => !d.isActive).length;
    const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

    return {
      total,
      activeCount,
      inactiveCount,
      systemUptime
    };
  }, [pagination.total, docs]);

  // Filtered docs for display (성능 최적화)
  const displayDocs = useMemo(() => {
    return docs; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [docs]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '원장차수',
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId}
          onChange={(value) => setFilters(prev => ({ ...prev, ledgerOrderId: value || '' }))}
          size="small"
        />
      ),
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'positionName',
      type: 'text',
      label: '직책명',
      placeholder: '직책명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
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
  ], [filters.ledgerOrderId]);


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
      label: '등록',
      onClick: handleAddDoc
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteDocs,
      disabled: selectedDocs.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAddDoc, handleDeleteDocs, selectedDocs.length, loadingStates]);

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

  // 성능 모니터링 함수 - 콘솔 로그 제거됨
  // 필요시 React DevTools Profiler 사용 권장
  const onRenderProfiler = useCallback(() => {
    // 성능 프로파일링 비활성화
  }, []);

  // 초기 데이터 로딩 (실제 API 호출)
  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // 실제 API 호출 (페이징 응답 받음)
        const response = await responsibilityDocApi.getResponsibilityDocs({
          page: 0,
          size: 20
        });

        // 응답 데이터를 ResponsibilityDoc 형식으로 변환 (resp_statement_execs 테이블 기반)
        const convertedDocs: ResponsibilityDoc[] = response.content.map((item, index) => ({
          id: item.respStmtExecId,
          seq: index + 1,
          positionName: item.positionName,
          executiveName: item.executiveName,
          positionAssignedDate: item.positionAssignedDate || null,
          concurrentPosition: item.concurrentPosition || null,
          responsibilityAssignedDate: item.responsibilityAssignedDate || null,
          createdAt: item.createdAt,
          createdBy: item.createdBy,
          isActive: item.isActive === 'Y'
        }));

        setDocs(convertedDocs);
        setPagination(prev => ({
          ...prev,
          total: response.totalElements,
          totalPages: response.totalPages,
          page: response.page + 1 // 백엔드는 0부터, 프론트는 1부터 시작
        }));
      } catch (error) {
        console.error('책무기술서 목록 조회 실패:', error);
        toast.error('책무기술서 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <React.Profiler id="ResponsibilityDocMgmt" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <DashboardIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('responsibilityDoc.management.title', '책무기술서관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('responsibilityDoc.management.description', '직책별 책무기술서를 체계적으로 관리합니다')}
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
                <div className={styles.statLabel}>총 기술서</div>
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
                <div className={styles.statLabel}>활성 기술서</div>
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
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ResponsibilityDocFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 기술서 수"
          selectedCount={selectedDocs.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayDocs}
          columns={responsibilityDocColumns}
          loading={loading}
          theme="alpine"
          onSelectionChange={handleSelectionChange}
          height="calc(100vh - 370px)"
          pagination={true}
          pageSize={25}
          rowSelection="multiple"
          checkboxSelection={true}
          headerCheckboxSelection={true}
          suppressHorizontalScroll={false}
          suppressColumnVirtualisation={false}
          context={{
            onPositionClick: handleDocDetail // 직책 컬럼 클릭 시 상세 모달 열기
          }}
        />
      </div>

      {/* 책무기술서 등록/상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        <ResponsibilityDocFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          doc={modalState.selectedDoc}
          onClose={handleModalClose}
          onSave={handleDocSave}
          onUpdate={handleDocUpdate}
          loading={loading}
        />
      </React.Suspense>
      </div>
    </React.Profiler>
  );
};

export default ResponsibilityDocMgmt;
