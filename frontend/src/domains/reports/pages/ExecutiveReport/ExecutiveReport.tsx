// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ExecutiveReport.module.scss';

// Types
import type {
  ResponsibilityInspection,
  DutyInspection,
  ExecutiveReportFilters,
  ExecutiveReportFormData,
  ExecutiveReportModalState,
  ExecutiveDashboardStats
} from './types/executiveReport.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// Lazy-loaded components for performance optimization
const ExecutiveReportFormModal = React.lazy(() =>
  import('./components/ExecutiveReportFormModal').then(module => ({ default: module.default }))
);

interface ExecutiveReportProps {
  className?: string;
}

const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ className }) => {
  const { t } = useTranslation('reports');

  // State Management
  const [responsibilityData, setResponsibilityData] = useState<ResponsibilityInspection[]>([]);
  const [dutyData, setDutyData] = useState<DutyInspection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 개별 로딩 상태
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    targetOrg: false,
    newReport: false,
  });

  const [filters, setFilters] = useState<ExecutiveReportFilters>({
    ledgerOrderId: '',
    inspectionName: '',
    branchName: '',
    inspectionStatus: '',
    improvementStatus: '',
    responsibility: '',
    inspector: ''
  });


  const [modalState, setModalState] = useState<ExecutiveReportModalState>({
    formModal: false,
    detailModal: false,
    targetOrgModal: false,
    selectedReport: null,
    modalMode: 'create'
  });

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ExecutiveReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);


  const handleTargetOrgManagement = useCallback(() => {
    setLoadingStates(prev => ({ ...prev, targetOrg: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('대상조직 관리 화면을 준비 중입니다...');

    try {
      // TODO: 대상조직 관리 모달 표시
      setModalState(prev => ({
        ...prev,
        targetOrgModal: true
      }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'info', '대상조직 관리 기능은 준비 중입니다.');
    } catch (error) {
      toast.update(loadingToastId, 'error', '대상조직 관리 기능 로드에 실패했습니다.');
      console.error('대상조직 관리 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, targetOrg: false }));
    }
  }, []);

  const handleNewReport = useCallback(() => {
    setLoadingStates(prev => ({ ...prev, newReport: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('신규 보고서 작성 준비 중입니다...');

    try {
      setModalState(prev => ({
        ...prev,
        formModal: true,
        modalMode: 'create',
        selectedReport: null
      }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '신규 보고서 작성을 시작합니다.');
    } catch (error) {
      toast.update(loadingToastId, 'error', '신규 보고서 작성 준비에 실패했습니다.');
      console.error('신규 보고서 작성 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, newReport: false }));
    }
  }, []);


  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      formModal: false,
      detailModal: false,
      targetOrgModal: false,
      selectedReport: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleReportSave = useCallback(async (formData: ExecutiveReportFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 생성
      // const response = await executiveReportApi.create(formData);

      console.log('보고서 저장:', formData);

      handleModalClose();
      toast.success('보고서가 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('보고서 등록 실패:', error);
      toast.error('보고서 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);

  const handleReportUpdate = useCallback(async (id: string, formData: ExecutiveReportFormData) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 수정
      // const response = await executiveReportApi.update(id, formData);

      console.log('보고서 수정:', id, formData);

      handleModalClose();
      toast.success('보고서가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('보고서 수정 실패:', error);
      toast.error('보고서 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleModalClose]);


  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('점검 현황을 검색 중입니다...');

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
      branchName: '',
      inspectionStatus: '',
      improvementStatus: '',
      responsibility: '',
      inspector: ''
    });
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<ExecutiveDashboardStats>(() => {
    return {
      totalResponsibilities: 4, // TODO: 실제 데이터 연동
      totalDuties: 4,
      totalActivities: 5,
      inspectionResults: {
        completed: 0,
        notCompleted: 0
      },
      improvementActions: {
        completed: 0,
        inProgress: 0
      },
      complianceRate: 98.5,
      systemUptime: 99.2
    };
  }, [responsibilityData, dutyData]);


  // 조직조회팝업 상태
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

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
        branchName: selectedOrg.orgName
      }));
      setOrganizationSearchOpen(false);
      toast.success(`${selectedOrg.orgName}(${selectedOrg.orgCode})이 선택되었습니다.`);
    }
  }, []);

  // 조직조회팝업 닫기 핸들러
  const handleOrganizationSearchClose = useCallback(() => {
    setOrganizationSearchOpen(false);
  }, []);

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
          onChange={(value) => handleFiltersChange({ ledgerOrderId: value || '' })}
          label="책무이행차수"
          size="small"
          fullWidth
        />
      )
    },
    {
      key: 'inspectionName',
      type: 'select',
      label: '점검명',
      options: [
        { value: '', label: '전체' },
        { value: '2024년1회차 이행점검', label: '2024년1회차 이행점검' },
        { value: '2024년2회차 이행점검', label: '2024년2회차 이행점검' },
        { value: '2025년1회차 이행점검', label: '2025년1회차 이행점검' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchName',
      type: 'text',
      label: '부점명',
      placeholder: '부점명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부점조회'
      }
    }
  ], [filters.ledgerOrderId, handleFiltersChange, handleOrganizationSearch]);

  // BaseActionBar용 액션 버튼 정의 (PositionMgmt.tsx와 동일한 패턴)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'templateDownload',
      type: 'custom',
      label: '보고서 템플릿 다운로드',
      variant: 'contained',
      color: 'primary',
      onClick: handleTargetOrgManagement,
      disabled: loadingStates.targetOrg,
      loading: loadingStates.targetOrg
    },
    {
      key: 'newReport',
      type: 'custom',
      label: '신규 보고서 작성',
      variant: 'contained',
      color: 'success',
      onClick: handleNewReport,
      disabled: loadingStates.newReport,
      loading: loadingStates.newReport
    }
  ], [handleTargetOrgManagement, handleNewReport, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '작성완료',
      value: statistics.inspectionResults.completed,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '부작성',
      value: statistics.inspectionResults.notCompleted,
      color: 'error',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    _id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 ExecutiveReport Performance Profiler`);
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
    const mockResponsibilityData: ResponsibilityInspection[] = [
      {
        id: '1',
        responsibility: '온법감시',
        managementDuty: '온법감시 업무수행 관련 책무',
        managementActivity: '내부통제 점검 및 개선',
        inspectionResult: 'IN_PROGRESS',
        improvementAction: 'IN_PROGRESS',
        inspectionDate: '2024-09-15',
        inspector: '홍길동',
        inspectorPosition: '감사팀장',
        resultDetail: '내부통제 시스템 정상 운영 중, 일부 개선사항 발견',
        improvementDetail: '시스템 보완 및 절차 개선 진행 중',
        inspectionYear: '2024',
        inspectionName: '2024년1회차 이행점검',
        branchName: '본점',
        registrationDate: '2024-09-01',
        registrar: '시스템관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2024-09-15',
        modifier: '홍길동',
        modifierPosition: '감사팀장',
        isActive: true
      },
      {
        id: '2',
        responsibility: '내부감시',
        managementDuty: '내부감시 업무수행 관련 책무',
        managementActivity: '리스크 관리 체계 운영',
        inspectionResult: 'COMPLETED',
        improvementAction: 'COMPLETED',
        inspectionDate: '2024-09-10',
        inspector: '김철수',
        inspectorPosition: '리스크관리팀장',
        resultDetail: '리스크 관리 체계 정상 운영, 모든 요구사항 충족',
        improvementDetail: '추가 개선조치 불필요',
        inspectionYear: '2024',
        inspectionName: '2024년1회차 이행점검',
        branchName: '본점',
        registrationDate: '2024-09-01',
        registrar: '시스템관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2024-09-10',
        modifier: '김철수',
        modifierPosition: '리스크관리팀장',
        isActive: true
      }
    ];

    const mockDutyData: DutyInspection[] = [
      {
        id: '1',
        managementDuty: '내부감시 업무수행 관련 책무 세부 내용 1',
        inspectionResult: '이행점검 결과 정상 운영 중',
        responsibilityCategory: '내부감시',
        dutyCode: 'MD001',
        priority: 'HIGH',
        complianceRate: 95,
        riskLevel: 'LOW',
        inspectionYear: '2024',
        inspectionName: '2024년1회차 이행점검',
        branchName: '본점',
        registrationDate: '2024-09-01',
        registrar: '시스템관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2024-09-15',
        modifier: '김철수',
        modifierPosition: '리스크관리팀장',
        isActive: true
      },
      {
        id: '2',
        managementDuty: '경영진단 업무수행 관련 책무 세부 내용 1',
        inspectionResult: '부작성 상태로 조치 필요',
        responsibilityCategory: '경영진단',
        dutyCode: 'MD002',
        priority: 'MEDIUM',
        complianceRate: 65,
        riskLevel: 'MEDIUM',
        inspectionYear: '2024',
        inspectionName: '2024년1회차 이행점검',
        branchName: '본점',
        registrationDate: '2024-09-01',
        registrar: '시스템관리자',
        registrarPosition: '시스템관리자',
        modificationDate: '2024-09-15',
        modifier: '박영희',
        modifierPosition: '경영진단팀장',
        isActive: true
      }
    ];

    setResponsibilityData(mockResponsibilityData);
    setDutyData(mockDutyData);
  }, []);

  return (
    <React.Profiler id="ExecutiveReport" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <DashboardIcon className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>
                  {t('executive.report.title', '임원이행점검보고서')}
                </h1>
                <p className={styles.pageDescription}>
                  {t('executive.report.description', '임원 소관 조직의 관리활동 내역에 대한 통계 및 보고서 관리')}
                </p>
              </div>
            </div>

            <div className={styles.headerStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUpIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.totalResponsibilities}</div>
                  <div className={styles.statLabel}>총 책무</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <SecurityIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.totalDuties}</div>
                  <div className={styles.statLabel}>활성 의무</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <AnalyticsIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{statistics.complianceRate}%</div>
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
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ExecutiveReportFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.totalResponsibilities + statistics.totalDuties}
            totalLabel="총 보고서 수"
            selectedCount={0}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 📊 집계 현황 테이블 */}
          <div className={styles.summarySection}>
            <h3 className={styles.sectionTitle}>
              <AnalyticsIcon className={styles.sectionIcon} />
              집계 현황
            </h3>
            <div className={styles.summaryTable}>
              <div className={styles.summaryHeader}>
                <div className={styles.summaryHeaderCell}>책무</div>
                <div className={styles.summaryHeaderCell}>관리의무</div>
                <div className={styles.summaryHeaderCell}>관리활동</div>
                <div className={styles.summaryHeaderCell}>이행 점검 결과</div>
                <div className={styles.summaryHeaderCell}>개선 조치</div>
              </div>
              <div className={styles.summaryBody}>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryCell}>4개</div>
                  <div className={styles.summaryCell}>4개</div>
                  <div className={styles.summaryCell}>5개</div>
                  <div className={styles.summaryCell}>
                    <span className={styles.completed}>작성 : 0건</span>
                    <span className={styles.notCompleted}>부작성 : 0건</span>
                  </div>
                  <div className={styles.summaryCell}>
                    <span className={styles.completed}>완료 : 0건</span>
                    <span className={styles.inProgress}>진행중 : 0건</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 1) 책무별 점검 현황 */}
          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>
              <AssignmentIcon className={styles.sectionIcon} />
              1) 책무별 점검 현황
            </h3>
            <div className={styles.simpleTable}>
              <div className={styles.simpleTableHeader}>
                <div className={styles.simpleTableHeaderCell} style={{width: '70%'}}>책무</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '30%'}}>점검결과</div>
              </div>
              <div className={styles.simpleTableBody}>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>(공통) 소관 업무-조직의 내부통제기조 및 위험관리기조</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>경영진단 업무와 관련된 책무</div>
                  <div className={styles.simpleTableCell}>부작성</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>온법감시 업무와 관련된 책무</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>내부감시 업무와 관련된 책무</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 2) 관리의무별 점검 현황 */}
          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>
              <SecurityIcon className={styles.sectionIcon} />
              2) 관리의무별 점검 현황
            </h3>
            <div className={styles.simpleTable}>
              <div className={styles.simpleTableHeader}>
                <div className={styles.simpleTableHeaderCell} style={{width: '35%'}}>관리의무</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '15%'}}>점검결과</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '35%'}}>관리의무</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '15%'}}>점검결과</div>
              </div>
              <div className={styles.simpleTableBody}>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>내부감시 업무와 관련된 책무 세부 내용 1에 대한 관리의무 1</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                  <div className={styles.simpleTableCell}>내부통제기조 및 위험관리기조 수립 목적에 대한 관리의무</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>경영진단 업무와 관련된 책무에 대한 세부내용 1</div>
                  <div className={styles.simpleTableCell}>부작성</div>
                  <div className={styles.simpleTableCell}>온법감시 업무와 관련된 책무 세부내용에 대한 관리의무</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 3) 관리의무 유형별 점검 현황 */}
          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>
              <BusinessIcon className={styles.sectionIcon} />
              3) 관리의무 유형별 점검 현황
            </h3>
            <div className={styles.simpleTable}>
              <div className={styles.simpleTableHeader}>
                <div className={styles.simpleTableHeaderCell} style={{width: '70%'}}>관리의무 유형</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '15%'}}>의무</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '15%'}}>점검결과</div>
              </div>
              <div className={styles.simpleTableBody}>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>기타</div>
                  <div className={styles.simpleTableCell}>3</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>(공통1) 내부통제기준의 적정하게 마련되고, 효과적으로 집행·운영되고 있는지 여부에 대한 점검</div>
                  <div className={styles.simpleTableCell}>1</div>
                  <div className={styles.simpleTableCell}>미점검</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 보고서 등록/상세 모달 */}
        <React.Suspense fallback={<LoadingSpinner />}>
          <ExecutiveReportFormModal
            open={modalState.formModal || modalState.detailModal}
            mode={modalState.modalMode}
            report={modalState.selectedReport}
            onClose={handleModalClose}
            onSave={handleReportSave}
            onUpdate={handleReportUpdate}
            loading={loading}
          />
        </React.Suspense>

        {/* 조직조회 모달 */}
        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          mode="single"
          title="부점 조회"
        />
      </div>
    </React.Profiler>
  );
};

export default ExecutiveReport;