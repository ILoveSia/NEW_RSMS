// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
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
  ResponsibilityModalState,
  ResponsibilityPagination
} from './types/responsibility.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// ResponsibilityMgmt specific components
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
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<Responsibility[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
  });

  const [filters, setFilters] = useState<ResponsibilityFilters>({
    positionName: '',
    departmentName: '',
    divisionName: '',
    responsibilityDetailContent: '',
    managementDuty: '',
    status: ''
  });

  const [pagination, setPagination] = useState<ResponsibilityPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<ResponsibilityModalState>({
    addModal: false,
    detailModal: false,
    selectedResponsibility: null
  });

  // Mock Data Generation (실제 환경에서는 API 호출로 대체)
  const mockResponsibilities = useMemo<Responsibility[]>(() => [
    {
      id: '1',
      seq: 1,
      positionCode: 'CEO001',
      positionName: '대표이사',
      headquarters: '본부',
      departmentName: '경영진',
      divisionName: '리스크관리부',
      responsibilityCode: 'RESP001',
      responsibility: '책무구조도 내부 관리 업무',
      responsibilityDetail: '책무구조도 내부 관리 업무 세부 내용',
      managementDutyCode: 'MD001',
      managementDuty: '책무구조도 내부 관리 업무 세부 내용의 관리의무',
      registrationDate: '2025-08-13',
      registrar: '0000000',
      registrarPosition: '관리자',
      status: 'active',
      isActive: true
    },
    {
      id: '2',
      seq: 2,
      positionCode: 'RM001',
      positionName: '감사본부장',
      headquarters: '감사본부',
      departmentName: '감사부',
      divisionName: '감사부',
      responsibilityCode: 'RESP002',
      responsibility: '내부통제 업무와 관련된 책무',
      responsibilityDetail: '내부통제기능 및 위험관리기능 수립 책무',
      managementDutyCode: 'MD002',
      managementDuty: '내부감사 업무와 관련된 책무',
      registrationDate: '2025-08-13',
      registrar: '0000000',
      registrarPosition: '관리자',
      status: 'active',
      isActive: true
    },
    {
      id: '3',
      seq: 3,
      positionCode: 'RM002',
      positionName: '준법감시인',
      headquarters: '준법감시부',
      departmentName: '준법감시부',
      divisionName: '온토금융본부',
      responsibilityCode: 'RESP003',
      responsibility: '(공통) 소관 업무조직의 내부통제 및 위험관리기능 수립',
      responsibilityDetail: '내부통제기능 및 위험관리기능 수립 및 위험관리',
      managementDutyCode: 'MD003',
      managementDuty: '소관 업무 조직의 내부통제기능 수립 대상 책무에 대한 관리의무',
      registrationDate: '2025-08-13',
      registrar: '0000000',
      registrarPosition: '관리자',
      status: 'active',
      isActive: true
    },
    {
      id: '4',
      seq: 4,
      positionCode: 'RM003',
      positionName: '정보전달부본부장',
      headquarters: '경영전략본부',
      departmentName: '경영전략부',
      divisionName: '경영전략부',
      responsibilityCode: 'RESP004',
      responsibility: '경영전략 업무와 관련된 책무',
      responsibilityDetail: '경영전략 수립 및 검토에 대한 세부내용',
      managementDutyCode: 'MD004',
      managementDuty: '경영전략 수립 검토에 대한 관리의무',
      registrationDate: '2025-08-13',
      registrar: '0000000',
      registrarPosition: '관리자',
      status: 'active',
      isActive: true
    },
    {
      id: '5',
      seq: 5,
      positionCode: 'RM004',
      positionName: '온토금융본부장',
      headquarters: '온토금융본부',
      departmentName: '온토금융본부',
      divisionName: '온토금융부',
      responsibilityCode: 'RESP005',
      responsibility: '경영전략 업무와 관련된 책무',
      responsibilityDetail: '경영전략 수립 검토 세부 내용',
      managementDutyCode: 'MD005',
      managementDuty: '경영전략 수립 검토 세부 내용',
      registrationDate: '2025-08-13',
      registrar: '0000000',
      registrarPosition: '관리자',
      status: 'active',
      isActive: true
    }
  ], []);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ResponsibilityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      // TODO: 실제 검색 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      // 필터링 로직 (실제 환경에서는 서버에서 처리)
      const filteredData = mockResponsibilities.filter(responsibility => {
        return (
          (!filters.positionName || responsibility.positionName.includes(filters.positionName)) &&
          (!filters.departmentName || responsibility.departmentName.includes(filters.departmentName)) &&
          (!filters.divisionName || responsibility.divisionName.includes(filters.divisionName)) &&
          (!filters.responsibilityDetailContent || responsibility.responsibilityDetail.includes(filters.responsibilityDetailContent)) &&
          (!filters.managementDuty || responsibility.managementDuty.includes(filters.managementDuty)) &&
          (!filters.status || responsibility.status === filters.status)
        );
      });

      setResponsibilities(filteredData);
      setPagination(prev => ({ ...prev, total: filteredData.length }));

      toast.success(`${filteredData.length}건의 책무 데이터를 조회했습니다.`);
    } catch (error) {
      console.error('검색 실패:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters, mockResponsibilities]);

  const handleAddResponsibility = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedResponsibility: null
    }));
    toast.info('새 책무를 등록해주세요.', { autoClose: 2000 });
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
      console.log('엑셀 다운로드 완료');
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      toast.update(loadingToastId, 'error', '엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedResponsibilities.length === 0) {
      toast.warning('삭제할 책무를 선택해주세요.');
      return;
    }

    const confirmed = window.confirm(`선택한 ${selectedResponsibilities.length}개의 책무를 삭제하시겠습니까?`);
    if (!confirmed) return;

    setLoadingStates(prev => ({ ...prev, delete: true }));

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      const deletedIds = selectedResponsibilities.map(r => r.id);
      setResponsibilities(prev => prev.filter(r => !deletedIds.includes(r.id)));
      setSelectedResponsibilities([]);

      toast.success(`${selectedResponsibilities.length}개의 책무가 삭제되었습니다.`);
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedResponsibilities]);

  const handleRowClick = useCallback((responsibility: Responsibility) => {
    setModalState(prev => ({
      ...prev,
      detailModal: true,
      selectedResponsibility: responsibility
    }));
  }, []);

  const handleSelectionChange = useCallback((selectedRows: Responsibility[]) => {
    setSelectedResponsibilities(selectedRows);
  }, []);

  const handleCloseModal = useCallback((modalType: 'add' | 'detail') => {
    setModalState(prev => ({
      ...prev,
      [`${modalType}Modal`]: false,
      selectedResponsibility: modalType === 'detail' ? null : prev.selectedResponsibility
    }));
  }, []);

  const handleSaveResponsibility = useCallback(async (formData: ResponsibilityFormData) => {
    try {
      // TODO: 실제 저장 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      toast.success('책무가 성공적으로 저장되었습니다.');
      handleCloseModal('add');
      handleSearch(); // 목록 새로고침
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [handleCloseModal, handleSearch]);

  // 초기 데이터 로드
  React.useEffect(() => {
    setResponsibilities(mockResponsibilities);
    setPagination(prev => ({ ...prev, total: mockResponsibilities.length }));
  }, [mockResponsibilities]);

  // 검색 필터 필드 정의
  const filterFields: FilterField[] = [
    {
      key: 'positionName',
      type: 'text',
      label: '직책',
      placeholder: '직책명 입력'
    },
    {
      key: 'departmentName',
      type: 'text',
      label: '부서명',
      placeholder: '부서명 입력'
    },
    {
      key: 'divisionName',
      type: 'text',
      label: '부정명',
      placeholder: '부정명 입력'
    },
    {
      key: 'responsibilityDetailContent',
      type: 'text',
      label: '책무세부내용',
      placeholder: '책무세부내용 입력'
    },
    {
      key: 'managementDuty',
      type: 'text',
      label: '관리의무',
      placeholder: '관리의무 입력'
    },
    {
      key: 'status',
      type: 'select',
      label: '상태',
      placeholder: '전체',
      options: [
        { value: '', label: '전체' },
        { value: 'active', label: '활성' },
        { value: 'inactive', label: '비활성' }
      ]
    }
  ];

  // 액션 버튼 정의
  const actionButtons: ActionButton[] = [
    {
      key: 'excel',
      label: '엑셀다운로드',
      variant: 'contained',
      color: 'success',
      loading: loadingStates.excel,
      onClick: handleExcelDownload
    },
    {
      key: 'add',
      label: '등록',
      variant: 'contained',
      color: 'primary',
      onClick: handleAddResponsibility
    },
    {
      key: 'delete',
      label: '삭제',
      variant: 'contained',
      color: 'error',
      loading: loadingStates.delete,
      disabled: selectedResponsibilities.length === 0,
      onClick: handleDeleteSelected
    }
  ];

  // 상태 정보 정의 (PositionMgmt 표준)
  const statusInfoArray: StatusInfo[] = [
    {
      label: '총 건수',
      value: responsibilities.length,
      color: 'primary',
      icon: <AssignmentIcon />
    },
    {
      label: '활성',
      value: responsibilities.filter(r => r.status === 'active').length,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '비활성',
      value: responsibilities.filter(r => r.status === 'inactive').length,
      color: 'warning',
      icon: <SecurityIcon />
    }
  ];

  // 필터 초기화 함수
  const handleClearFilters = useCallback(() => {
    setFilters({
      positionName: '',
      departmentName: '',
      divisionName: '',
      responsibilityDetailContent: '',
      managementDuty: '',
      status: ''
    });
  }, []);

  // 더블클릭 핸들러 추가
  const handleRowDoubleClick = useCallback((data: Responsibility) => {
    handleRowClick(data);
  }, [handleRowClick]);

  if (loading) {
    return <LoadingSpinner centered text="책무 데이터를 불러오는 중..." />;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <AssignmentIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>
                {t('responsibility.management.title', '책무관리 시스템')}
              </h1>
              <p className={styles.pageDescription}>
                {t('responsibility.management.description', '조직의 책무 정보를 체계적으로 관리합니다')}
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{responsibilities.length}</div>
                <div className={styles.statLabel}>총 책무</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {responsibilities.filter(r => r.status === 'active').length}
                </div>
                <div className={styles.statLabel}>활성 책무</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {new Set(responsibilities.map(r => r.positionCode)).size}
                </div>
                <div className={styles.statLabel}>관련 직책</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 공통 검색 필터 */}
        <BaseSearchFilter
          fields={filterFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ResponsibilityFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={responsibilities.length}
          totalLabel="총 책무 수"
          selectedCount={selectedResponsibilities.length}
          statusInfo={statusInfoArray}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={responsibilities}
          columns={responsibilityColumns}
          loading={loading}
          theme="alpine"
          onRowClick={handleRowClick}
          onRowDoubleClick={handleRowDoubleClick}
          onSelectionChange={handleSelectionChange}
          height="calc(100vh - 370px)"
          pagination={true}
          pageSize={25}
          rowSelection="multiple"
          checkboxSelection={true}
          headerCheckboxSelection={true}
        />
      </div>

      {/* 모달들 */}
      <React.Suspense fallback={<LoadingSpinner centered />}>
        {modalState.addModal && (
          <ResponsibilityFormModal
            open={modalState.addModal}
            mode="create"
            onClose={() => handleCloseModal('add')}
            onSave={handleSaveResponsibility}
          />
        )}

        {modalState.detailModal && modalState.selectedResponsibility && (
          <ResponsibilityFormModal
            open={modalState.detailModal}
            mode="detail"
            responsibility={modalState.selectedResponsibility}
            onClose={() => handleCloseModal('detail')}
            onSave={handleSaveResponsibility}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default ResponsibilityMgmt;