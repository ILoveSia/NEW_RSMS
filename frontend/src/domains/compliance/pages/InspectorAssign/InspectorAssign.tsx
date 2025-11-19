// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useMemo, useState } from 'react';
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

// React.memo로 컴포넌트 메모이제이션 (성능 최적화)
const InspectorAssignComponent: React.FC<InspectorAssignProps> = ({ className }) => {

  // 점검자지정 컬럼 정의
  const inspectorColumns = useMemo<ColDef<InspectorAssignment>[]>(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 60,
      minWidth: 60,
      maxWidth: 100,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      field: 'inspectionName',
      headerName: '점검명',
      width: 150,
      minWidth: 150,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 25 ? `${value.substring(0, 25)}...` : value;
      }
    },
    {
      field: 'obligationInfo',
      headerName: '관리의무',
      width: 300,
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
      field: 'activityName',
      headerName: '관리활동명',
      width: 150,
      minWidth: 150,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-left',
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 25 ? `${value.substring(0, 25)}...` : (value || '');
      }
    },
    {
      field: 'activityFrequencyCd',
      headerName: '점검주기',
      width: 80,
      minWidth: 80,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      field: 'orgCode',
      headerName: '부서',
      width: 100,
      minWidth: 100,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellClass: 'ag-cell-center',
      headerClass: 'ag-header-center'
    },
    {
      field: 'inspector',
      headerName: '점검자',
      width: 80,
      minWidth: 80,
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
      width: 80,
      minWidth: 80,
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
      width: 80,
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
          case 'UNASSIGNED': statusText = '미점검'; break;
          case 'COMPLETED': statusText = '■ 점검완료'; break;
          default: statusText = '미점검';
        }
        return statusText;
      }
    }
  ], []);

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

  // Mock data for testing
  const mockAssignments: InspectorAssignment[] = useMemo(() => [
    {
      id: 'ASG_001',
      sequence: 1,
      inspectionName: '2025년 하반기 정기점검',
      obligationInfo: '중요계약서(약관 포함), 서식 검토 내용 및 법률실무에 대한 질의회신 내용의 적정성 검토',
      activityName: '자금세탁방지 시스템 운영',
      activityFrequencyCd: '분기별',
      orgCode: '준법지원팀',
      inspector: {
        id: 'EMP_001',
        name: '김철수',
        empNo: 'E2024001',
        department: '준법지원팀',
        position: '선임',
        email: 'kim.cs@company.com',
        phone: '02-1234-5678'
      },
      inspectionDate: '2025-11-24',
      assignmentStatus: 'ASSIGNED',
      createdAt: '2025-09-22',
      updatedAt: '2025-09-22',
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: 'ASG_002',
      sequence: 2,
      inspectionName: '2025년 하반기 정기점검',
      obligationInfo: '중요계약서(약관 포함), 서식 검토 내용 및 법률실무에 대한 질의회신 내용의 적정성 검토',
      activityName: '개인정보 보호 점검',
      activityFrequencyCd: '월별',
      orgCode: '준법지원팀',
      inspector: {
        id: 'EMP_001',
        name: '김철수',
        empNo: 'E2024001',
        department: '준법지원팀',
        position: '선임',
        email: 'kim.cs@company.com',
        phone: '02-1234-5678'
      },
      inspectionDate: '2025-11-24',
      assignmentStatus: 'ASSIGNED',
      createdAt: '2025-09-22',
      updatedAt: '2025-09-22',
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: 'ASG_003',
      sequence: 3,
      inspectionName: '2025년 하반기 정기점검',
      obligationInfo: '소송 관련 제도 전반, 소송 업무 처리 및 외부위임 소송사건의 업무 처리 적정성 관리·감독',
      activityName: '신용리스크 평가',
      activityFrequencyCd: '반기별',
      orgCode: '준법지원팀',
      inspector: {
        id: 'EMP_001',
        name: '김철수',
        empNo: 'E2024001',
        department: '준법지원팀',
        position: '선임',
        email: 'kim.cs@company.com',
        phone: '02-1234-5678'
      },
      inspectionDate: '2025-11-24',
      assignmentStatus: 'ASSIGNED',
      createdAt: '2025-09-22',
      updatedAt: '2025-09-22',
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: 'ASG_004',
      sequence: 4,
      inspectionName: '2025년 하반기 정기점검',
      obligationInfo: '소송 관련 제도 전반, 소송 업무 처리 및 외부위임 소송사건의 업무 처리 적정성 관리·감독',
      activityName: '신용리스크 평가',
      activityFrequencyCd: '반기별',
      orgCode: '준법지원팀',
      inspector: {
        id: 'EMP_001',
        name: '김철수',
        empNo: 'E2024001',
        department: '준법지원팀',
        position: '선임',
        email: 'kim.cs@company.com',
        phone: '02-1234-5678'
      },
      inspectionDate: '2025-11-24',
      assignmentStatus: 'ASSIGNED',
      createdAt: '2025-09-22',
      updatedAt: '2025-09-22',
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: 'ASG_005',
      sequence: 5,
      inspectionName: '2025년 하반기 정기점검',
      obligationInfo: '정관 변경 업무 및 내규 제정·개정·폐지안의 사전심의 업무 관리',
      activityName: '신용리스크 평가',
      activityFrequencyCd: '반기별',
      orgCode: '준법지원팀',
      inspector: {
        id: 'EMP_001',
        name: '김철수',
        empNo: 'E2024001',
        department: '준법지원팀',
        position: '선임',
        email: 'kim.cs@company.com',
        phone: '02-1234-5678'
      },
      inspectionDate: '2025-11-24',
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
      ledgerOrderId: '',
      inspectionName: '',
      periodId: '',
      assignmentStatus: '',
      boolCode: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

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

  const handleInspectorAssign = useCallback(async (
    assignments: InspectorAssignment[],
    inspector: Inspector,
    _formData: InspectorAssignFormData
  ) => {
    try {
      // TODO: API 호출 구현
      await new Promise(resolve => setTimeout(resolve, 500));

      // 로컬 상태 업데이트 - 선택된 모든 항목에 점검자 지정
      const assignmentIds = assignments.map(a => a.id);
      setAssignments(prev => prev.map(item =>
        assignmentIds.includes(item.id)
          ? {
              ...item,
              inspector,
              assignmentStatus: 'ASSIGNED' as const,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : item
      ));

      toast.success(`${assignments.length}건의 항목에 ${inspector.name} 점검자가 지정되었습니다.`);
      setSelectedAssignments([]);  // 선택 초기화
      handleModalClose();
    } catch (error) {
      console.error('Assignment error:', error);
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
