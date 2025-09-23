// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import React, { useCallback, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import styles from './InspectorAssign.module.scss';

// Types
import type {
  InspectorAssignment,
  Inspector,
  InspectorAssignFilters,
  InspectorAssignFormData,
  InspectorAssignModalState,
  InspectorAssignPagination,
  AssignmentStatistics
} from './types/inspectorAssign.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues, type EndAdornment } from '@/shared/components/organisms/BaseSearchFilter';
import { BranchLookupModal, type Branch } from '@/shared/components/organisms/BranchLookupModal';

// Lazy-loaded components for performance optimization
const InspectorSelectionModal = React.lazy(() =>
  import('./components/InspectorSelectionModal/InspectorSelectionModal')
);

interface InspectorAssignProps {
  className?: string;
}

// React.memo로 컴포넌트 메모이제이션 (성능 최적화)
const InspectorAssignComponent: React.FC<InspectorAssignProps> = ({ className }) => {

  // 점검자지정 컬럼 정의
  const inspectorColumns = useMemo<ColDef<InspectorAssignment>[]>(() => [
    {
      field: 'assignmentStatus',
      headerName: '상태',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        let statusText = '';
        switch (value) {
          case 'ASSIGNED': statusText = '✓ 지정완료'; break;
          case 'UNASSIGNED': statusText = '○ 미지정'; break;
          case 'COMPLETED': statusText = '■ 점검완료'; break;
          default: statusText = value || '';
        }
        return statusText;
      }
    },
    {
      field: 'sequence',
      headerName: '순번',
      width: 80,
      minWidth: 60,
      maxWidth: 100,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'managementName',
      headerName: '관리명칭명',
      width: 200,
      minWidth: 150,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
      },
      cellStyle: { fontWeight: '500', color: '#1976d2' }
    },
    {
      field: 'round',
      headerName: '차시',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#ed6c02' }
    },
    {
      field: 'internalExternal',
      headerName: '내부/외부',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value === 'INTERNAL' ? '내부' : '외부';
      }
    },
    {
      field: 'category',
      headerName: '구분',
      width: 120,
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#7b1fa2' }
    },
    {
      field: 'restrictionInfo',
      headerName: '내부/외부제한정보',
      width: 180,
      minWidth: 150,
      sortable: false,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 20 ? `${value.substring(0, 20)}...` : (value || '');
      },
      cellStyle: { color: '#666666', fontSize: '13px' }
    },
    {
      field: 'modifier',
      headerName: '수정자',
      width: 150,
      minWidth: 120,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellStyle: { fontWeight: '500', color: '#1976d2' }
    },
    {
      field: 'inspector',
      headerName: '점검자',
      width: 150,
      minWidth: 120,
      sortable: false,
      filter: false,
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const assignment = params.data;
        const inspector = assignment?.inspector;

        if (inspector) {
          return `${inspector.name} (${inspector.department})`;
        } else {
          return '미지정';
        }
      }
    },
    {
      field: 'inspectionDate',
      headerName: '점검일자',
      width: 120,
      minWidth: 100,
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
      },
      cellStyle: { fontFamily: 'monospace', color: '#424242', fontWeight: '500' }
    },
    {
      field: 'endYn',
      headerName: 'END YN',
      width: 100,
      minWidth: 80,
      sortable: true,
      filter: 'agSetColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value === 'Y' ? '완료' : '진행중';
      }
    }
  ], []);

  // State Management
  const [assignments, setAssignments] = useState<InspectorAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAssignments, setSelectedAssignments] = useState<InspectorAssignment[]>([]);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    save: false,
    delete: false,
  });

  const [filters, setFilters] = useState<InspectorAssignFilters>({
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

  // 부점조회팝업 상태
  const [branchLookupOpen, setBranchLookupOpen] = useState<boolean>(false);

  // Mock data for testing
  const mockAssignments: InspectorAssignment[] = useMemo(() => [
    {
      id: 'ASG_001',
      sequence: 1,
      managementName: '영업 실적',
      round: '1회차',
      internalExternal: 'INTERNAL',
      category: '교육수행내역',
      restrictionInfo: '',
      modifier: '0000000-관리자',
      inspector: {
        id: 'INSPECTOR_001',
        name: '이신혁',
        department: '기획팀',
        position: '대리',
        specialtyArea: '시스템',
        type: 'INTERNAL',
        isActive: true
      },
      inspectionDate: '초회',
      endYn: 'N',
      assignmentStatus: 'ASSIGNED',
      createdAt: '2025-09-22',
      updatedAt: '2025-09-22',
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ], []);

  // Mock 데이터로 초기화
  React.useEffect(() => {
    setAssignments(mockAssignments);
    setPagination(prev => ({ ...prev, total: mockAssignments.length }));
  }, [mockAssignments]);

  // 통계 정보 계산 (메모이제이션)
  const statisticsData = useMemo<AssignmentStatistics>(() => {
    const total = assignments.length;
    const assigned = assignments.filter(a => a.assignmentStatus === 'ASSIGNED').length;
    const unassigned = assignments.filter(a => a.assignmentStatus === 'UNASSIGNED').length;
    const completed = assignments.filter(a => a.endYn === 'Y').length;

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

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('점검자 지정 정보를 검색 중입니다...');

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
      periodId: '',
      assignmentStatus: '',
      boolCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // 부점조회 팝업 핸들러
  const handleBranchSearch = useCallback(() => {
    setBranchLookupOpen(true);
  }, []);

  // 부점선택 완료 핸들러
  const handleBranchSelect = useCallback((selected: Branch | Branch[]) => {
    const selectedBranch = Array.isArray(selected) ? selected[0] : selected;
    if (selectedBranch) {
      setFilters(prev => ({
        ...prev,
        boolCode: selectedBranch.branchCode
      }));
      setBranchLookupOpen(false);
      toast.success(`${selectedBranch.branchName}(${selectedBranch.branchCode})이 선택되었습니다.`);
    }
  }, []);

  // 부점조회팝업 닫기 핸들러
  const handleBranchLookupClose = useCallback(() => {
    setBranchLookupOpen(false);
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
  const handleRowClick = useCallback((assignment: InspectorAssignment) => {
    console.log('행 클릭:', assignment);
  }, []);

  const handleRowDoubleClick = useCallback((assignment: InspectorAssignment) => {
    handleInspectorSelect(assignment);
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

  const handleInspectorAssign = useCallback(async (
    assignment: InspectorAssignment,
    inspector: Inspector,
    _formData: InspectorAssignFormData
  ) => {
    try {
      // TODO: API 호출 구현
      await new Promise(resolve => setTimeout(resolve, 500));

      // 로컬 상태 업데이트
      setAssignments(prev => prev.map(item =>
        item.id === assignment.id
          ? {
              ...item,
              inspector,
              assignmentStatus: 'ASSIGNED' as const,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : item
      ));

      toast.success(`${inspector.name} 점검자가 지정되었습니다.`);
      handleModalClose();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error('점검자 지정 중 오류가 발생했습니다.');
    }
  }, [handleModalClose]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'periodId',
      type: 'select',
      label: '점검명',
      options: [
        { value: '', label: '전체' },
        { value: 'PERIOD_001', label: '2026년1차년 이행점검 | 2026.07.31~2026.08.31' },
        { value: 'PERIOD_002', label: '2026년2차년 이행점검 | 2026.12.01~2026.12.31' }
      ],
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'assignmentStatus',
      type: 'select',
      label: '점검자 지정상태',
      options: [
        { value: '', label: '전체' },
        { value: 'ASSIGNED', label: '지정완료' },
        { value: 'UNASSIGNED', label: '미지정' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'boolCode',
      type: 'text',
      label: '부점코드',
      placeholder: '부점코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleBranchSearch,
        tooltip: '부점조회'
      }
    }
  ], [handleBranchSearch]);

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
      onClick: handleAddAssignment
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteAssignments,
      disabled: selectedAssignments.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    },
    {
      key: 'save',
      label: '저장',
      variant: 'contained',
      color: 'primary',
      startIcon: 'Save',
      loading: loadingStates.save,
      disabled: selectedAssignments.length === 0,
      onClick: handleSave
    }
  ], [handleExcelDownload, handleAddAssignment, handleDeleteAssignments, handleSave, selectedAssignments.length, loadingStates]);

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
      console.group(`🔍 InspectorAssign Performance Profiler`);
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
            showClearButton={false}
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
            onClose={handleModalClose}
            onSelect={handleInspectorAssign}
            loading={false}
          />
        </React.Suspense>

        {/* 부점조회 팝업 */}
        <BranchLookupModal
          open={branchLookupOpen}
          onClose={handleBranchLookupClose}
          onSelect={handleBranchSelect}
          title="부점 조회"
          multiple={false}
        />
      </div>
    </React.Profiler>
  );
};

// React.memo로 래핑하여 성능 최적화
const InspectorAssign = React.memo(InspectorAssignComponent);

export default InspectorAssign;