// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './InspectorAssign.module.scss';

// Types
import type {
  AssignmentStatistics,
  Inspector,
  InspectorAssignFilters,
  InspectorAssignFormData,
  InspectorAssignment,
  InspectorAssignModalState,
  InspectorAssignPagination
} from './types/inspectorAssign.types';

// API
import {
  getAllImplInspectionItems,
  getImplInspectionItemsByLedgerOrderId,
  assignInspectorBatch
} from '@/domains/compliance/api/implInspectionPlanApi';
import type { ImplInspectionItemDto } from '@/domains/compliance/types/implInspectionPlan.types';

// Store - 공통코드 조회용
import { useCodeStore } from '@/app/store/codeStore';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// Lazy-loaded components for performance optimization
const InspectorSelectionModal = React.lazy(() =>
  import('./components/InspectorSelectionModal/InspectorSelectionModal')
);

interface InspectorAssignProps {
  className?: string;
}

/**
 * ImplInspectionItemDto를 InspectorAssignment로 변환하는 함수
 * - impl_inspection_items 테이블 데이터를 UI 타입으로 변환
 * @param dto API 응답 DTO
 * @param index 순번 (0부터 시작)
 * @returns InspectorAssignment UI 타입
 */
const convertToInspectorAssignment = (
  dto: ImplInspectionItemDto,
  index: number
): InspectorAssignment => {
  // 점검 상태 변환 (inspectionStatusCd → assignmentStatus)
  const getAssignmentStatus = (): 'ASSIGNED' | 'UNASSIGNED' | 'COMPLETED' => {
    // 01: 미점검, 02: 적정, 03: 부적정
    if (dto.inspectorId && dto.inspectorId !== '') {
      if (dto.inspectionStatusCd === '02' || dto.inspectionStatusCd === '03') {
        return 'COMPLETED';  // 점검 완료
      }
      return 'ASSIGNED';  // 점검자 지정됨
    }
    return 'UNASSIGNED';  // 미지정
  };

  // 점검자 정보 구성 - inspectorName이 있으면 성명 표시, 없으면 ID fallback
  const inspector: Inspector | null = dto.inspectorId ? {
    id: dto.inspectorId,
    name: dto.inspectorName || dto.inspectorId,  // 점검자명(성명) 우선 표시
    department: dto.deptManagerManual?.orgName || '',
    position: '',
    specialtyArea: '',
    type: 'INTERNAL',
    isActive: true
  } : null;

  return {
    id: dto.implInspectionItemId,
    sequence: index + 1,
    inspectionName: dto.implInspectionPlan?.implInspectionName || '',
    obligationInfo: dto.deptManagerManual?.obligationName || dto.deptManagerManual?.respItem || '',
    activityName: dto.deptManagerManual?.activityName || '',
    activityFrequencyCd: dto.deptManagerManual?.execCheckFrequencyCd || '',
    orgCode: dto.deptManagerManual?.orgName || dto.deptManagerManual?.orgCode || '',
    inspector,
    inspectionDate: dto.inspectionDate || undefined,
    assignmentStatus: getAssignmentStatus(),
    createdAt: dto.createdAt || '',
    updatedAt: dto.updatedAt || '',
    createdBy: dto.createdBy || '',
    updatedBy: dto.updatedBy || ''
  };
};

// React.memo로 컴포넌트 메모이제이션 (성능 최적화)
const InspectorAssignComponent: React.FC<InspectorAssignProps> = ({ className }) => {

  // 공통코드 조회 함수 (점검주기 코드명 표시용)
  const getCodeName = useCodeStore((state) => state.getCodeName);

  // 점검자지정 컬럼 정의
  const inspectorColumns = useMemo<ColDef<InspectorAssignment>[]>(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      suppressSizeToFit: true,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      // 점검명 - 너비 축소
      field: 'inspectionName',
      headerName: '점검명',
      width: 180,
      minWidth: 150,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 20 ? `${value.substring(0, 20)}...` : value;
      }
    },
    {
      field: 'obligationInfo',
      headerName: '관리의무',
      width: 350,
      minWidth: 300,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 50 ? `${value.substring(0, 50)}...` : (value || '');
      }
    },
    {
      // 관리활동명 - 너비 확대 및 flex 추가
      field: 'activityName',
      headerName: '관리활동명',
      width: 320,
      minWidth: 280,
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 40 ? `${value.substring(0, 40)}...` : (value || '');
      }
    },
    {
      // 점검주기 - 공통코드명으로 표시 (FLFL_ISPC_FRCD)
      field: 'activityFrequencyCd',
      headerName: '점검주기',
      width: 100,
      minWidth: 90,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const code = params.value;
        if (!code) return '-';
        // 공통코드 그룹 'FLFL_ISPC_FRCD'에서 코드명 조회
        return getCodeName('FLFL_ISPC_FRCD', code);
      }
    },
    {
      field: 'orgCode',
      headerName: '부서',
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      field: 'inspector',
      headerName: '점검자',
      width: 120,
      minWidth: 100,
      sortable: false,
      filter: false,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const assignment = params.data;
        const inspector = assignment?.inspector;

        if (inspector) {
          return inspector.name;
        } else {
          return '미지정';
        }
      }
    },
    {
      field: 'inspectionDate',
      headerName: '점검일자',
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: 'agDateColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) return '초회';
        if (value.includes('-')) {
          return value.replace(/-/g, '.');
        }
        return value;
      }
    },
    {
      field: 'assignmentStatus',
      headerName: '상태',
      width: 140,
      minWidth: 120,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        let statusText = '';
        switch (value) {
          case 'ASSIGNED': statusText = '✓ 지정완료'; break;
          case 'UNASSIGNED': statusText = '미점검'; break;
          case 'COMPLETED': statusText = '■ 점검완료'; break;
          default: statusText = '미점검';
        }
        return statusText;
      }
    }
  ], [getCodeName]);

  // State Management
  const [assignments, setAssignments] = useState<InspectorAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAssignments, setSelectedAssignments] = useState<InspectorAssignment[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false
  });

  const [filters, setFilters] = useState<InspectorAssignFilters>({
    ledgerOrderId: '',
    inspectionName: '',
    periodId: '',
    assignmentStatus: '',
    boolCode: ''
  });

  const [pagination, setPagination] = useState<InspectorAssignPagination>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const [modalState, setModalState] = useState<InspectorAssignModalState>({
    inspectorSelectModal: false,
    assignmentDetailModal: false,
    selectedAssignment: null,
    selectedInspector: null
  });

  // 조직조회팝업 상태
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  /**
   * 점검자지정 목록 데이터 조회 함수
   * - impl_inspection_items 테이블 기준으로 dept_manager_manuals JOIN
   * @param ledgerOrderId 원장차수ID (없으면 전체 조회)
   */
  const fetchAssignments = useCallback(async (ledgerOrderId?: string) => {
    setLoading(true);
    try {
      let data: ImplInspectionItemDto[];

      if (ledgerOrderId && ledgerOrderId !== '') {
        // 원장차수ID로 필터링된 조회
        data = await getImplInspectionItemsByLedgerOrderId(ledgerOrderId);
      } else {
        // 전체 조회
        data = await getAllImplInspectionItems();
      }

      // API 응답을 UI 타입으로 변환
      const convertedAssignments = data.map((dto, index) =>
        convertToInspectorAssignment(dto, index)
      );

      setAssignments(convertedAssignments);
      setPagination(prev => ({ ...prev, total: convertedAssignments.length }));

      console.log('점검자지정 목록 조회 성공:', convertedAssignments.length, '건');
    } catch (error) {
      console.error('점검자지정 목록 조회 실패:', error);
      toast.error('점검자지정 목록 조회에 실패했습니다.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 페이지 로드 시 전체 데이터 조회
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // 통계 정보 계산 (메모이제이션)
  const statisticsData = useMemo<AssignmentStatistics>(() => {
    const total = assignments.length;
    const assigned = assignments.filter(a => a.assignmentStatus === 'ASSIGNED').length;
    const unassigned = assignments.filter(a => a.assignmentStatus === 'UNASSIGNED').length;
    const completed = assignments.filter(a => a.assignmentStatus === 'COMPLETED').length;

    return {
      total,
      assigned,
      unassigned,
      completed
    };
  }, [assignments]);

  // Filtered assignments for display (성능 최적화)
  const displayAssignments = useMemo(() => {
    return assignments; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [assignments]);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<InspectorAssignFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 검색 실행 함수
   * - 필터 조건에 따라 impl_inspection_items 데이터 조회
   */
  const handleSearch = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('점검자 지정 정보를 검색 중입니다...');

    try {
      // 원장차수ID를 기준으로 API 호출
      await fetchAssignments(filters.ledgerOrderId || undefined);

      console.log('검색 필터:', filters);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters.ledgerOrderId, fetchAssignments]);

  /**
   * 검색 조건 초기화 및 전체 데이터 재조회
   */
  const handleClearFilters = useCallback(async () => {
    setFilters({
      ledgerOrderId: '',
      inspectionName: '',
      periodId: '',
      assignmentStatus: '',
      boolCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));

    // 전체 데이터 재조회
    await fetchAssignments();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [fetchAssignments]);

  // 원장차수 변경 핸들러
  const handleLedgerOrderChange = useCallback((value: string | null) => {
    setFilters(prev => ({ ...prev, ledgerOrderId: value || '' }));
  }, []);

  // 조직조회 팝업 핸들러
  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  // 조직선택 완료 핸들러
  const handleOrganizationSelect = useCallback((selected: Organization | Organization[]) => {
    const selectedOrg = Array.isArray(selected) ? selected[0] : selected;
    if (selectedOrg) {
      setFilters(prev => ({
        ...prev,
        boolCode: selectedOrg.orgCode
      }));
      setOrganizationSearchOpen(false);
      toast.success(`${selectedOrg.orgName}(${selectedOrg.orgCode})이 선택되었습니다.`);
    }
  }, []);

  // 조직조회팝업 닫기 핸들러
  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
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

  const handleAddAssignment = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      inspectorSelectModal: true,
      selectedAssignment: null
    }));
    toast.info('새 점검자 지정을 등록해주세요.', { autoClose: 2000 });
  }, []);

  const handleDeleteAssignments = useCallback(async () => {
    if (selectedAssignments.length === 0) {
      toast.warning('삭제할 점검자 지정을 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedAssignments.length}개의 점검자 지정을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedAssignments.length}개 점검자 지정을 삭제 중입니다...`);

    try {
      // TODO: 실제 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 상태 업데이트 (삭제된 항목 제거)
      setAssignments(prev =>
        prev.filter(assignment => !selectedAssignments.some(selected => selected.id === assignment.id))
      );
      setPagination(prev => ({
        ...prev,
        total: prev.total - selectedAssignments.length
      }));
      setSelectedAssignments([]);

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedAssignments.length}개 점검자 지정이 삭제되었습니다.`);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '점검자 지정 삭제에 실패했습니다.');
      console.error('점검자 지정 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedAssignments]);

  async function handleSave() {
    if (selectedAssignments.length === 0) {
      toast.warning('저장할 항목을 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, save: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading(`${selectedAssignments.length}건의 점검자 지정 정보를 저장 중입니다...`);

    try {
      // TODO: API 호출 구현
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', `${selectedAssignments.length}건의 점검자 지정 정보가 저장되었습니다.`);
      setSelectedAssignments([]);
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '저장 중 오류가 발생했습니다.');
      console.error('Save error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, save: false }));
    }
  }

  // Grid Event Handlers
  const handleRowClick = useCallback((_assignment: InspectorAssignment) => {
    // 행 클릭 시 아무 동작 안함
  }, []);

  const handleRowDoubleClick = useCallback((_assignment: InspectorAssignment) => {
    // 행 더블클릭 시 아무 동작 안함
  }, []);

  const handleSelectionChange = useCallback((selected: InspectorAssignment[]) => {
    setSelectedAssignments(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  const handleInspectorSelect = useCallback((assignment: InspectorAssignment) => {
    setModalState({
      inspectorSelectModal: true,
      assignmentDetailModal: false,
      selectedAssignment: assignment,
      selectedInspector: null
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState({
      inspectorSelectModal: false,
      assignmentDetailModal: false,
      selectedAssignment: null,
      selectedInspector: null
    });
  }, []);

  /**
   * 점검자 일괄 지정 핸들러
   * - impl_inspection_items 테이블의 inspector_id 컬럼 업데이트
   * - ActivityExecution.tsx의 handlePerformerAssign 패턴 참고
   * @param assignments 선택된 점검항목 목록
   * @param inspector 지정할 점검자 정보
   * @param _formData 폼 데이터 (현재 미사용)
   */
  const handleInspectorAssign = useCallback(async (
    assignments: InspectorAssignment[],
    inspector: Inspector,
    _formData: InspectorAssignFormData
  ) => {
    // 점검항목ID 목록 추출 (impl_inspection_item_id)
    const itemIds = assignments.map(a => a.id);

    console.log('✅ [InspectorAssign] 점검자 일괄 지정 시작');
    console.log('  - 대상 항목 수:', itemIds.length);
    console.log('  - 점검자ID:', inspector.id);
    console.log('  - 점검자명:', inspector.name);

    try {
      // Backend API 호출 - impl_inspection_items.inspector_id 업데이트
      const response = await assignInspectorBatch({
        itemIds,
        inspectorId: inspector.id
      });

      console.log('✅ [InspectorAssign] API 응답:', response);

      if (response.success) {
        // 로컬 상태 업데이트 - 선택된 모든 항목에 점검자 지정
        setAssignments(prev => prev.map(item =>
          itemIds.includes(item.id)
            ? {
                ...item,
                inspector,
                assignmentStatus: 'ASSIGNED' as const,
                updatedAt: new Date().toISOString().split('T')[0]
              }
            : item
        ));

        toast.success(`${response.updatedCount}건의 항목에 ${inspector.name} 점검자가 지정되었습니다.`);
        setSelectedAssignments([]);  // 선택 초기화
        handleModalClose();
      } else {
        toast.error('점검자 지정에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ [InspectorAssign] 점검자 지정 오류:', error);
      toast.error('점검자 지정 중 오류가 발생했습니다.');
    }
  }, [handleModalClose]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <LedgerOrderComboBox
          value={filters.ledgerOrderId || undefined}
          onChange={handleLedgerOrderChange}
          label="책무이행차수"
          placeholder="전체"
        />
      )
    },
    {
      key: 'inspectionName',
      type: 'text',
      label: '점검명',
      placeholder: '점검명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'boolCode',
      type: 'text',
      label: '부서코드',
      placeholder: '부서코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부서조회'
      }
    }
  ], [filters.ledgerOrderId, handleLedgerOrderChange, handleOrganizationSearch]);

  // 점검자지정 버튼 핸들러
  const handleAssignInspector = useCallback(() => {
    if (selectedAssignments.length === 0) {
      toast.warning('점검자를 지정할 항목을 선택해주세요.');
      return;
    }

    // 사원조회 모달 열기
    setModalState(prev => ({
      ...prev,
      inspectorSelectModal: true,
      selectedAssignment: null
    }));
  }, [selectedAssignments.length]);

  // BaseActionBar용 액션 버튼 정의 (스마트 타입 사용)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'assign',
      label: '점검자지정',
      variant: 'contained',
      color: 'primary',
      startIcon: 'PersonAdd',
      disabled: selectedAssignments.length === 0,
      onClick: handleAssignInspector
    }
  ], [handleAssignInspector, selectedAssignments.length]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '지정완료',
      value: statisticsData.assigned,
      color: 'success',
      icon: <CheckCircleIcon />
    },
    {
      label: '미지정',
      value: statisticsData.unassigned,
      color: 'warning',
      icon: <ErrorOutlineIcon />
    },
    {
      label: '점검완료',
      value: statisticsData.completed,
      color: 'default',
      icon: <ScheduleIcon />
    }
  ], [statisticsData]);

  // 성능 모니터링 함수 - 콘솔 로그 제거됨
  // 필요시 React DevTools Profiler 사용 권장
  const onRenderProfiler = useCallback(() => {
    // 성능 프로파일링 비활성화
  }, []);

  return (
    <React.Profiler id="InspectorAssign" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <AssignmentIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  점검자지정
                </h1>
                <p className={styles.pageDescription}>
                  설정된 이행점검 기간에 대해 각 점검 항목별로 적절한 점검자를 지정합니다
                </p>
              </div>
            </div>

            <div className={styles.headerStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AssignmentIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statisticsData.total}</div>
                  <div className={styles.statLabel}>총 지정</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircleIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {statisticsData.assigned}
                  </div>
                  <div className={styles.statLabel}>지정완료</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <ErrorOutlineIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statisticsData.unassigned}</div>
                  <div className={styles.statLabel}>미지정</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<InspectorAssignFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statisticsData.total}
            totalLabel="총 점검자 지정 수"
            selectedCount={selectedAssignments.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayAssignments}
            columns={inspectorColumns}
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
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={false}
            context={{
              onInspectorSelect: handleInspectorSelect
            }}
          />
        </div>

        {/* 점검자 선택 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <InspectorSelectionModal
            open={modalState.inspectorSelectModal}
            assignment={modalState.selectedAssignment}
            assignments={selectedAssignments}
            onClose={handleModalClose}
            onSelect={handleInspectorAssign}
            loading={false}
          />
        </React.Suspense>

        {/* 조직조회 팝업 */}
        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          title="부서 조회"
          multiple={false}
        />
      </div>
    </React.Profiler>
  );
};

// React.memo로 래핑하여 성능 최적화
const InspectorAssign = React.memo(InspectorAssignComponent);

export default InspectorAssign;
