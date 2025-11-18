/**
 * 부서장업무메뉴얼관리 메인 컴포넌트
 * @description PositionMgmt 표준 구조를 적용한 부서장업무메뉴얼 관리 화면
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SecurityIcon from '@mui/icons-material/Security';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DeptOpManualsMgmt.module.scss';

// Types
import type {
  DeptOpManual,
  DeptOpManualsFilters,
  DeptOpManualsModalState,
  DeptOpManualsPagination,
  DeptOpManualsStatistics
} from './types/deptOpManuals.types';
import type {
  CreateDeptManagerManualRequest,
  UpdateDeptManagerManualRequest
} from '../../types/deptManagerManual.types';

// API
import {
  createDeptManagerManual,
  deleteDeptManagerManuals,
  getAllDeptManagerManuals,
  getDeptManagerManualsByLedgerOrderIdAndOrgCode,
  updateDeptManagerManual
} from '../../api/deptManagerManualApi';

// Shared Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';
import { useCommonCode } from '@/shared/hooks';

// DeptOpManuals specific components
import { deptOpManualsColumns } from './components/DeptOpManualsDataGrid/deptOpManualsColumns';

// Lazy-loaded components for performance optimization
const DeptOpManualsFormModal = React.lazy(() =>
  import('./components/DeptOpManualsFormModal/DeptOpManualsFormModal').then(module => ({ default: module.default }))
);

interface DeptOpManualsMgmtProps {
  className?: string;
}

const DeptOpManualsMgmt: React.FC<DeptOpManualsMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // 공통코드 조회 - 책무구분 (책무카테고리)
  const responsibilityCategoryCode = useCommonCode('RSBT_OBLG_CLCD');
  // 공통코드 조회 - 점검주기 (수행점검주기)
  const execCheckFrequencyCode = useCommonCode('FLFL_ISPC_FRCD');

  // State Management
  const [deptOpManuals, setDeptOpManuals] = useState<DeptOpManual[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<DeptOpManual[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false,
    create: false,
    approve: false
  });

  // 필터 및 페이지네이션
  const [filters, setFilters] = useState<DeptOpManualsFilters>({
    ledgerOrder: '',
    managementObligation: '',
    irregularityName: '',
    managementActivityType: 'all',
    managementActivity: '',
    riskAssessmentLevel: 'all',
    isActive: 'all',
    approvalStatus: 'all',
    implementationManager: ''
  });

  const [pagination, setPagination] = useState<DeptOpManualsPagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0
  });

  // 모달 상태
  const [modalState, setModalState] = useState<DeptOpManualsModalState>({
    isOpen: false,
    mode: 'create'
  });

  // 조직조회팝업 상태
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  // ===============================
  // 📊 데이터 로드 함수
  // ===============================

  /**
   * 데이터 조회 함수
   * - 원장차수와 부점코드로 필터링하여 조회
   */
  const fetchDeptOpManuals = useCallback(async () => {
    setLoading(true);

    try {
      let data: any[];

      // 원장차수와 부점코드 둘 다 있으면 특정 조회
      if (filters.ledgerOrder && filters.irregularityName) {
        data = await getDeptManagerManualsByLedgerOrderIdAndOrgCode(
          filters.ledgerOrder,
          filters.irregularityName
        );
      } else {
        // 그 외에는 전체 조회
        data = await getAllDeptManagerManuals();
      }

      // Backend DTO → Frontend 타입 변환
      const converted: DeptOpManual[] = data.map((dto, index) => ({
        id: dto.manualCd,
        seq: index + 1,

        // JOIN 데이터 (책무구조 관련)
        // 책무구분: 코드값 그대로 표시 (공통코드 변환은 Grid의 valueFormatter에서 처리)
        responsibilityCat: dto.responsibilityCat || '',
        responsibilityInfo: dto.responsibilityInfo || '',
        responsibilityDetailInfo: dto.responsibilityDetailInfo || '',
        obligationInfo: dto.obligationInfo || '',  // ✅ 관리의무 추가
        orgName: dto.orgName || '',                 // ✅ 부점명 추가

        // dept_manager_manuals 직접 필드
        manualCd: dto.manualCd,                    // ✅ 메뉴얼코드 추가
        ledgerOrderId: dto.ledgerOrderId || '',    // ✅ 원장차수ID 추가
        obligationCd: dto.obligationCd || '',      // ✅ 관리의무코드 추가
        orgCode: dto.orgCode || '',                // ✅ 조직코드 추가
        respItem: dto.respItem,                    // ✅ 책무관리항목 추가
        activityName: dto.activityName,            // ✅ 관리활동명 추가
        execCheckMethod: dto.execCheckMethod || '', // ✅ 점검항목 추가
        execCheckDetail: dto.execCheckDetail || '', // 점검세부내용
        execCheckFrequencyCd: dto.execCheckFrequencyCd || '', // ✅ 점검주기 추가

        // 수행 정보
        executorId: dto.executorId || '',
        executionDate: dto.executionDate,
        executionStatus: dto.executionStatus,
        executionResultCd: dto.executionResultCd,
        executionResultContent: dto.executionResultContent,

        // 레거시 필드 (호환성 유지)
        managementObligation: dto.obligationInfo || '',
        irregularityName: dto.orgName || '',
        managementActivityCode: dto.manualCd,
        managementActivity: dto.respItem,
        managementActivityName: dto.activityName,
        managementActivityDetail: dto.execCheckDetail || '',
        managementActivityType: 'compliance',
        riskAssessmentLevel: 'medium',
        implementationManager: dto.executorId || '',
        implementationDepartment: dto.orgName || '',

        // 상태 관리
        isActive: dto.isActive === 'Y',
        status: dto.status || 'active',
        approvalStatus: dto.approvedAt ? 'approved' : 'draft',

        // 감사 필드
        createdAt: dto.createdAt || '',
        createdBy: dto.createdBy || '',
        updatedAt: dto.updatedAt,
        updatedBy: dto.updatedBy,
        approvedAt: dto.approvedAt,
        approvedBy: dto.approvedBy,
        remarks: dto.remarks || ''
      }));

      setDeptOpManuals(converted);

      // 페이지네이션 업데이트
      setPagination(prev => ({
        ...prev,
        total: converted.length,
        totalPages: Math.ceil(converted.length / prev.pageSize)
      }));

      console.log('✅ [DeptOpManualsMgmt] 데이터 로드 완료:', converted.length);
    } catch (error) {
      console.error('❌ [DeptOpManualsMgmt] 데이터 로드 실패:', error);
      toast.error('데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters.ledgerOrder, filters.irregularityName]);

  // ===============================
  // 📊 통계 계산
  // ===============================
  const statistics: DeptOpManualsStatistics = useMemo(() => {
    const total = deptOpManuals.length;
    const active = deptOpManuals.filter(item => item.isActive).length;
    const inactive = total - active;
    const pendingApprovals = deptOpManuals.filter(item => item.approvalStatus === 'pending').length;
    const highRisk = deptOpManuals.filter(item =>
      ['very_high', 'high'].includes(item.riskAssessmentLevel)
    ).length;
    const recent = deptOpManuals.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.createdAt) >= weekAgo;
    }).length;

    return {
      totalActivities: total,
      activeActivities: active,
      inactiveActivities: inactive,
      pendingApprovals,
      highRiskActivities: highRisk,
      recentlyCreated: recent
    };
  }, [deptOpManuals]);

  // ===============================
  // 🔍 필터링된 데이터
  // ===============================
  const displayData = useMemo(() => {
    let filtered = [...deptOpManuals];

    // 관리의무 필터
    if (filters.managementObligation) {
      filtered = filtered.filter(item =>
        item.managementObligation.toLowerCase().includes(filters.managementObligation!.toLowerCase())
      );
    }

    // 부정명 필터 (orgName으로 검색)
    // 주의: irregularityName 필터는 orgCode이지만, 실제 검색은 orgName으로 수행
    // API 호출 시에는 orgCode로 조회하고, 프론트엔드에서는 orgName으로 필터링

    // 관리활동구분 필터
    if (filters.managementActivityType && filters.managementActivityType !== 'all') {
      filtered = filtered.filter(item => item.managementActivityType === filters.managementActivityType);
    }

    // 관리활동 필터
    if (filters.managementActivity) {
      filtered = filtered.filter(item =>
        item.managementActivity.toLowerCase().includes(filters.managementActivity!.toLowerCase())
      );
    }

    // 위험평가등급 필터
    if (filters.riskAssessmentLevel && filters.riskAssessmentLevel !== 'all') {
      filtered = filtered.filter(item => item.riskAssessmentLevel === filters.riskAssessmentLevel);
    }

    // 사용여부 필터
    if (filters.isActive !== 'all') {
      filtered = filtered.filter(item => item.isActive === filters.isActive);
    }

    // 결재여부 필터
    if (filters.approvalStatus && filters.approvalStatus !== 'all') {
      filtered = filtered.filter(item => item.approvalStatus === filters.approvalStatus);
    }

    // 이행주관담당 필터
    if (filters.implementationManager) {
      filtered = filtered.filter(item =>
        item.implementationManager.toLowerCase().includes(filters.implementationManager!.toLowerCase())
      );
    }

    return filtered;
  }, [deptOpManuals, filters]);

  // ===============================
  // 초기 데이터 로드 및 필터 변경 시 재조회
  // ===============================
  React.useEffect(() => {
    fetchDeptOpManuals();
  }, [fetchDeptOpManuals]);

  // 조직조회 핸들러
  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  // 조직 선택 핸들러
  const handleOrganizationSelect = useCallback((organization: Organization) => {
    setFilters(prev => ({
      ...prev,
      irregularityName: organization.orgCode || ''
    }));
    setOrganizationSearchOpen(false);
    toast.success(`부점코드 "${organization.orgCode}" 선택되었습니다.`);
  }, []);

  // 조직조회 모달 닫기
  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
  }, []);

  // 🔍 검색 필드 정의
  const searchFields: FilterField[] = useMemo(() => [
    {
      key: 'ledgerOrder',
      label: '책무이행차수',
      type: 'custom',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrder || undefined}
          onChange={(value) => setFilters(prev => ({ ...prev, ledgerOrder: value || '' }))}
          label="책무이행차수"
          size="small"
          fullWidth
        />
      )
    },
    {
      key: 'irregularityName',
      label: '부점코드',
      type: 'text',
      placeholder: '부점코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부점조회'
      }
    },
    {
      key: 'managementActivity',
      label: '관리활동명',
      type: 'text',
      placeholder: '관리활동명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    }
  ], [filters.ledgerOrder, handleOrganizationSearch]);

  // 🎯 이벤트 핸들러
  const handleFiltersChange = useCallback((values: Partial<FilterValues>) => {
    const newFilters: DeptOpManualsFilters = {
      ledgerOrder: values.ledgerOrder as string || '',
      managementObligation: '',
      irregularityName: values.irregularityName as string || '',
      managementActivityType: 'all',
      managementActivity: values.managementActivity as string || '',
      riskAssessmentLevel: 'all',
      isActive: 'all',
      approvalStatus: 'all',
      implementationManager: ''
    };
    setFilters(newFilters);
  }, []);

  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));

    try {
      // 데이터 재조회
      await fetchDeptOpManuals();
      toast.success('검색이 완료되었습니다.');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [fetchDeptOpManuals]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: DeptOpManualsFilters = {
      ledgerOrder: '',
      managementObligation: '',
      irregularityName: '',
      managementActivityType: 'all',
      managementActivity: '',
      riskAssessmentLevel: 'all',
      isActive: 'all',
      approvalStatus: 'all',
      implementationManager: ''
    };
    setFilters(clearedFilters);
    toast.info('검색 조건이 초기화되었습니다.');
  }, []);

  const handleRowClick = useCallback((data: DeptOpManual) => {
    console.log('🔍 [DeptOpManualsMgmt] 상세조회 클릭:', data);

    setModalState({
      isOpen: true,
      mode: 'view',
      selectedItem: data
    });
  }, []);

  const handleRowDoubleClick = useCallback((data: DeptOpManual) => {
    console.log('✏️ [DeptOpManualsMgmt] 수정모드 더블클릭:', data);

    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedItem: data
    });
  }, []);

  const handleSelectionChange = useCallback((selectedRows: DeptOpManual[]) => {
    setSelectedItems(selectedRows);
  }, []);

  const handleCreateItem = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  }, []);

  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    try {
      // Excel 다운로드 로직 구현
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock
      toast.success('Excel 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Excel download error:', error);
      toast.error('Excel 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedItems.length}개의 관리활동을 삭제하시겠습니까?`)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    try {
      // 선택된 항목의 ID(manual_cd) 추출
      const selectedIds = selectedItems.map(item => item.id);

      // API 호출: 일괄 삭제
      await deleteDeptManagerManuals(selectedIds);

      // 삭제 후 데이터 재조회
      await fetchDeptOpManuals();

      setSelectedItems([]);
      toast.success('선택한 관리활동이 삭제되었습니다.');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedItems]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    // 모달 닫힐 때 데이터 재조회
    fetchDeptOpManuals();
  }, [fetchDeptOpManuals]);

  // 등록 핸들러 - activities 배열의 각 항목을 개별 등록
  const handleSave = useCallback(async (formData: any) => {
    console.log('💾 [DeptOpManualsMgmt] Save 요청 - formData:', formData);
    setLoadingStates(prev => ({ ...prev, create: true }));

    try {
      // activities 배열에서 각 항목을 개별 등록
      const activities = formData.activities || [];

      if (activities.length === 0) {
        toast.warning('등록할 활동이 없습니다.');
        return;
      }

      console.log(`📋 [DeptOpManualsMgmt] ${activities.length}개 활동 등록 시작`);

      // 각 활동을 개별 등록
      for (const activity of activities) {
        const createRequest: CreateDeptManagerManualRequest = {
          ledgerOrderId: formData.ledgerOrderId || filters.ledgerOrder || '20250001',
          obligationCd: activity.obligationCd,
          orgCode: formData.orgCode,
          respItem: activity.respItem || '',
          activityName: activity.activityName,
          executorId: activity.executorId,
          executionDate: activity.executionDate,
          executionStatus: activity.executionStatus || '01',
          executionResultCd: activity.executionResultCd,
          executionResultContent: activity.executionResultContent,
          execCheckMethod: activity.execCheckMethod,
          execCheckDetail: activity.execCheckDetail,
          execCheckFrequencyCd: activity.execCheckFrequencyCd,
          isActive: activity.isActive || 'Y',
          status: activity.status || 'active',
          remarks: activity.remarks
        };

        console.log('📤 [DeptOpManualsMgmt] API 요청:', createRequest);
        await createDeptManagerManual(createRequest);
      }

      console.log(`✅ [DeptOpManualsMgmt] ${activities.length}개 활동 등록 완료`);
      toast.success(`${activities.length}개 활동이 등록되었습니다.`, { autoClose: 2000 });

      // 데이터 새로고침
      await fetchDeptOpManuals();
      handleModalClose();
    } catch (error) {
      console.error('❌ [DeptOpManualsMgmt] Save error:', error);
      toast.error('등록 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  }, [filters.ledgerOrder, fetchDeptOpManuals, handleModalClose]);

  // 수정 핸들러
  const handleUpdate = useCallback(async (id: string, formData: any) => {
    setLoadingStates(prev => ({ ...prev, create: true }));

    try {
      // 실제 API 호출: 부서장업무메뉴얼 수정
      const updateRequest: UpdateDeptManagerManualRequest = {
        respItem: formData.respItem,
        activityName: formData.activityName,
        executorId: formData.executorId,
        executionDate: formData.executionDate,
        executionStatus: formData.executionStatus,
        executionResultCd: formData.executionResultCd,
        executionResultContent: formData.executionResultContent,
        execCheckMethod: formData.execCheckMethod,
        execCheckDetail: formData.execCheckDetail,
        execCheckFrequencyCd: formData.execCheckFrequencyCd,
        isActive: formData.isActive || 'Y',
        status: formData.status,
        remarks: formData.remarks
      };

      await updateDeptManagerManual(id, updateRequest);

      console.log('✅ [DeptOpManualsMgmt] 수정 완료:', id);
      toast.success('부서장업무메뉴얼이 수정되었습니다.', { autoClose: 2000 });

      // 데이터 새로고침
      await fetchDeptOpManuals();
      handleModalClose();
    } catch (error) {
      console.error('❌ [DeptOpManualsMgmt] Update error:', error);
      toast.error('수정 중 오류가 발생했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  }, [fetchDeptOpManuals, handleModalClose]);

  // 📊 통계 카드 정의
  const statsCards = [
    {
      icon: <AnalyticsIcon />,
      title: '전체 관리활동',
      value: statistics.totalActivities,
      color: 'primary' as const
    },
    {
      icon: <AssignmentIcon />,
      title: '활성 관리활동',
      value: statistics.activeActivities,
      color: 'success' as const
    },
    {
      icon: <PendingActionsIcon />,
      title: '승인 대기',
      value: statistics.pendingApprovals,
      color: 'warning' as const
    },
    {
      icon: <SecurityIcon />,
      title: '고위험 관리활동',
      value: statistics.highRiskActivities,
      color: 'error' as const
    }
  ];

  // 🎯 액션 버튼 정의
  const actionButtons: ActionButton[] = [
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
      onClick: handleCreateItem,
      disabled: loadingStates.create,
      loading: loadingStates.create
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteSelected,
      disabled: selectedItems.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ];

  // 📊 상태 정보
  const statusInfo: StatusInfo[] = [
    {
      label: '활성',
      value: statistics.activeActivities,
      color: 'success',
      icon: <AssignmentIcon />
    },
    {
      label: '비활성',
      value: statistics.inactiveActivities,
      color: 'default',
      icon: <HighlightOffIcon />
    }
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner centered text="부서장업무메뉴얼을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🎯 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <AssignmentIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>업무메뉴얼관리</h1>
              <p className={styles.pageDescription}>
                부서장업무 관련 관리활동 등록 및 관리
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            {statsCards.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 검색 필터 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />
        </div>

        {/* 📋 액션바 */}
        <BaseActionBar
          totalCount={statistics.totalActivities}
          totalLabel="총 관리활동 수"
          selectedCount={selectedItems.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayData}
          columns={deptOpManualsColumns(responsibilityCategoryCode, execCheckFrequencyCode)}
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

      {/* 🎯 모달 */}
      <React.Suspense fallback={<LoadingSpinner text="모달을 불러오는 중..." />}>
        {modalState.isOpen && (
          <DeptOpManualsFormModal
            open={modalState.isOpen}
            mode={modalState.mode}
            manual={modalState.selectedItem || null}
            onClose={handleModalClose}
            onSave={handleSave}
            onUpdate={handleUpdate}
            loading={loadingStates.create}
          />
        )}
      </React.Suspense>

      {/* 🏢 조직조회 모달 */}
      <OrganizationSearchModal
        open={organizationSearchOpen}
        onClose={handleOrganizationSearchClose}
        onSelect={handleOrganizationSelect}
        title="부점조회"
      />
    </div>
  );
};

export default DeptOpManualsMgmt;
