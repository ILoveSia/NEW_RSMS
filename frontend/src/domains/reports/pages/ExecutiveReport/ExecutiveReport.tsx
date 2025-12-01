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
  DutyInspection,
  ExecutiveDashboardStats,
  ExecutiveReportFilters,
  ExecutiveReportFormData,
  ExecutiveReportModalState,
  ResponsibilityInspection
} from './types/executiveReport.types';

// Shared Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import OrganizationSearchModal from '@/shared/components/organisms/OrganizationSearchModal/OrganizationSearchModal';
import type { Organization } from '@/shared/components/organisms/OrganizationSearchModal/types/organizationSearch.types';

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

    try {
      setModalState(prev => ({
        ...prev,
        formModal: true,
        modalMode: 'create',
        selectedReport: null
      }));

      toast.success('신규 보고서 작성을 시작합니다.', { autoClose: 2000 });
    } catch (error) {
      toast.error('신규 보고서 작성 준비에 실패했습니다.');
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
        { value: '2025년 하반기 정기점검', label: '2025년 하반기 정기점검' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'branchName',
      type: 'text',
      label: '부서명',
      placeholder: '부서명을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 },
      endAdornment: {
        type: 'button',
        icon: 'Search',
        onClick: handleOrganizationSearch,
        tooltip: '부서조회'
      }
    }
  ], [filters.ledgerOrderId, handleFiltersChange, handleOrganizationSearch]);

  // BaseActionBar용 액션 버튼 정의 (PositionMgmt.tsx와 동일한 패턴)
  const actionButtons = useMemo<ActionButton[]>(() => [
    // {
    //   key: 'templateDownload',
    //   type: 'custom',
    //   label: '보고서 템플릿 다운로드',
    //   variant: 'contained',
    //   color: 'primary',
    //   onClick: handleTargetOrgManagement,
    //   disabled: loadingStates.targetOrg,
    //   loading: loadingStates.targetOrg
    // },
    // {
    //   key: 'newReport',
    //   type: 'custom',
    //   label: '신규 보고서 작성',
    //   variant: 'contained',
    //   color: 'success',
    //   onClick: handleNewReport,
    //   disabled: loadingStates.newReport,
    //   loading: loadingStates.newReport
    // }
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
      label: '부적성',
      value: statistics.inspectionResults.notCompleted,
      color: 'error',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수 - 콘솔 로그 제거됨
  // 필요시 React DevTools Profiler 사용 권장
  const onRenderProfiler = useCallback(() => {
    // 성능 프로파일링 비활성화
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
        inspectionResult: '부적성 상태로 조치 필요',
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
                  <div className={styles.summaryCell}>1개</div>
                  <div className={styles.summaryCell}>3개</div>
                  <div className={styles.summaryCell}>5개</div>
                  <div className={styles.summaryCell}>
                    <span className={styles.completed}>작성 : 3건</span>
                    <span className={styles.notCompleted}>부적성 : 2건</span>
                  </div>
                  <div className={styles.summaryCell}>
                    <span className={styles.completed}>완료 : 1건</span>
                    <span className={styles.inProgress}>진행중 : 1건</span>
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
                  <div className={styles.simpleTableCell}>법무·송무 업무와 관련된 책무</div>
                  <div className={styles.simpleTableCell}>점검</div>
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
                  <div className={styles.simpleTableCell}>중요계약서(약관 포함), 서식 검토 내용 및 법률실무에 대한 질의회신 내용의 적정성 검토</div>
                  <div className={styles.simpleTableCell}>점검</div>
                  <div className={styles.simpleTableCell}>소송 관련 제도 전반, 소송 업무 처리 및 외부위임 소송사건의 업무 처리 적정성 관리·감독</div>
                  <div className={styles.simpleTableCell}>점검</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>정관 변경 업무 및 내규 제정·개정·폐지안의 사전심의 업무 관리</div>
                  <div className={styles.simpleTableCell}>점검</div>
                  <div className={styles.simpleTableCell}></div>
                  <div className={styles.simpleTableCell}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 3) 관리활동명 점검 현황 */}
          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>
              <BusinessIcon className={styles.sectionIcon} />
              3) 관리활동 점검 현황
            </h3>
            <div className={styles.simpleTable}>
              <div className={styles.simpleTableHeader}>
                <div className={styles.simpleTableHeaderCell} style={{width: '40%'}}>관리활동</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '50%'}}>책무관리항목</div>
                <div className={styles.simpleTableHeaderCell} style={{width: '10%'}}>점검결과</div>
              </div>
              <div className={styles.simpleTableBody}>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>중요계약서 서식 및 내용의 적정성 검토에 대한 점검</div>
                  <div className={styles.simpleTableCell}>중요계약서 서식 및 내용의 적정성 검토에 대한 점검</div>
                  <div className={styles.simpleTableCell}>적정</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>법률 관련 질의회신 내용의 적정성 검토에 대한 점검</div>
                  <div className={styles.simpleTableCell}>법률 관련 질의회신 내용의 적정성 검토에 대한 점검</div>
                  <div className={styles.simpleTableCell}>적정</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>소송관련 업무 전반에 대한 지원 점검</div>
                  <div className={styles.simpleTableCell}>소송관련 업무 전반에 대한 지원 및 관련 자료 수집 및 보관 절차준수 여부에 대한 점검</div>
                  <div className={styles.simpleTableCell}>적정</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>외부위임 소송사건의 업무 처리 적정성 점검</div>
                  <div className={styles.simpleTableCell}>외부위임 소송업무의 변호사 선정 및 자문료 금액에 대한 규정 준수 및 전결권자 승인여부에 대한 점검</div>
                  <div className={styles.simpleTableCell}>부적정</div>
                </div>
                <div className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>정관 변경 및 내규 제·개정·폐지 시 사전심의 및 협의 절차 점검</div>
                  <div className={styles.simpleTableCell}>정관 변경 및 내규 제·개정·폐지 시 사전검토 및 협의 수행여부에 대한 점검</div>
                  <div className={styles.simpleTableCell}>부적정</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 보고서 등록/상세 모달 - BaseModalWrapper 적용 */}
        <BaseModalWrapper
          isOpen={modalState.formModal || modalState.detailModal}
          onClose={handleModalClose}
          ariaLabel="임원보고서 모달"
          fallbackComponent={<LoadingSpinner text="임원보고서 모달을 불러오는 중..." />}
        >
          <ExecutiveReportFormModal
            open={modalState.formModal || modalState.detailModal}
            mode={modalState.modalMode}
            report={modalState.selectedReport}
            onClose={handleModalClose}
            onSave={handleReportSave}
            onUpdate={handleReportUpdate}
            loading={loading}
          />
        </BaseModalWrapper>

        {/* 조직조회 모달 */}
        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          mode="single"
          title="부서 조회"
        />
      </div>
    </React.Profiler>
  );
};

export default ExecutiveReport;
