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
  ExecutiveDashboardStats,
  ExecutiveReportFilters,
  ExecutiveReportModalState,
} from './types/executiveReport.types';

// API & Hooks
import { useExecutiveReport } from '../../hooks/useExecutiveReport';
import type {
  ResponsibilityInspection as ApiResponsibilityInspection,
  ObligationInspection as ApiObligationInspection,
  ActivityInspection as ApiActivityInspection,
} from '../../api/executiveReportApi';

// Shared Components
import { InspectionPlanComboBox } from '@/domains/compliance/components/molecules/InspectionPlanComboBox';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
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

  // State Management - 기존 mock 데이터 상태 제거, API 훅으로 대체
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

  // 선택된 부서 코드 관리
  const [selectedOrgCode, setSelectedOrgCode] = useState<string>('');

  /**
   * 임원이행점검보고서 데이터 조회 훅
   * - ledgerOrderId가 있을 때만 API 호출
   * - 책무별/관리의무별/관리활동별 점검현황 집계
   */
  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useExecutiveReport({
    ledgerOrderId: filters.ledgerOrderId,
    implInspectionPlanId: filters.inspectionName || undefined,
    orgCode: selectedOrgCode || undefined,
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


  /*
   * 대상조직 관리 핸들러 (현재 미사용 - 향후 확장용)
   * const handleTargetOrgManagement = useCallback(() => {
   *   setLoadingStates(prev => ({ ...prev, targetOrg: true }));
   *   setModalState(prev => ({ ...prev, targetOrgModal: true }));
   *   setLoadingStates(prev => ({ ...prev, targetOrg: false }));
   * }, []);
   */

  /*
   * 신규 보고서 작성 핸들러 (현재 미사용 - 향후 확장용)
   * const handleNewReport = useCallback(() => {
   *   setModalState(prev => ({ ...prev, formModal: true, modalMode: 'create', selectedReport: null }));
   * }, []);
   */


  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      formModal: false,
      detailModal: false,
      targetOrgModal: false,
      selectedReport: null
    }));
  }, []);

  /**
   * 보고서 저장 핸들러
   * - ExecutiveReportFormModal 내부의 폼 데이터 타입 사용
   * - Record<string, unknown>으로 유연하게 처리
   */
  const handleReportSave = useCallback(async (formData: Record<string, unknown>) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 생성
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

  /**
   * 보고서 수정 핸들러
   * - ExecutiveReportFormModal 내부의 폼 데이터 타입 사용
   */
  const handleReportUpdate = useCallback(async (id: string, formData: Record<string, unknown>) => {
    try {
      setLoading(true);
      // TODO: API 호출로 보고서 수정
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


  /**
   * 검색 버튼 클릭 핸들러
   * - 필터 조건에 따라 데이터 다시 조회
   * - useExecutiveReport 훅이 자동으로 데이터 갱신
   */
  const handleSearch = useCallback(async () => {
    if (!filters.ledgerOrderId) {
      toast.warning('책무이행차수를 선택해주세요.');
      return;
    }

    setLoadingStates(prev => ({ ...prev, search: true }));
    const loadingToastId = toast.loading('점검 현황을 검색 중입니다...');

    try {
      // React Query refetch로 데이터 갱신
      await refetchReport();
      toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
    } catch (error) {
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters.ledgerOrderId, refetchReport]);

  /**
   * 검색 조건 초기화 핸들러
   * - 모든 필터 값 리셋
   * - 부서코드 상태도 함께 리셋
   */
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
    setSelectedOrgCode('');
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  /**
   * 대시보드 통계 계산
   * - API 응답 데이터에서 집계 현황 추출
   * - 데이터 없을 경우 기본값 0 반환
   */
  const statistics = useMemo<ExecutiveDashboardStats>(() => {
    const summary = reportData?.summary;
    return {
      totalResponsibilities: summary?.totalResponsibilities || 0,
      totalDuties: summary?.totalObligations || 0,
      totalActivities: summary?.totalActivities || 0,
      inspectionResults: {
        completed: summary?.appropriateCount || 0,
        notCompleted: summary?.inappropriateCount || 0
      },
      improvementActions: {
        completed: summary?.improvementCompletedCount || 0,
        inProgress: summary?.improvementInProgressCount || 0
      },
      complianceRate: 98.5,
      systemUptime: 99.2
    };
  }, [reportData]);


  // 조직조회팝업 상태
  const [organizationSearchOpen, setOrganizationSearchOpen] = useState<boolean>(false);

  // 조직조회 팝업 핸들러
  const handleOrganizationSearch = useCallback(() => {
    setOrganizationSearchOpen(true);
  }, []);

  /**
   * 조직선택 완료 핸들러
   * - 부서명 필터 설정
   * - 부서코드 별도 저장 (API 파라미터용)
   */
  const handleOrganizationSelect = useCallback((selected: Organization | Organization[]) => {
    const selectedOrg = Array.isArray(selected) ? selected[0] : selected;
    if (selectedOrg) {
      setFilters(prev => ({
        ...prev,
        branchName: selectedOrg.orgName
      }));
      setSelectedOrgCode(selectedOrg.orgCode);
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
      type: 'custom',
      label: '점검명',
      gridSize: { xs: 12, sm: 6, md: 3 },
      customComponent: (
        <InspectionPlanComboBox
          value={filters.inspectionName || null}
          onChange={(value) => handleFiltersChange({ inspectionName: value || '' })}
          ledgerOrderId={filters.ledgerOrderId || null}
          label="점검명"
          size="small"
          fullWidth
          showAllOption
        />
      )
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
  ], [filters.ledgerOrderId, filters.inspectionName, handleFiltersChange, handleOrganizationSearch]);

  /*
   * BaseActionBar용 액션 버튼 및 상태 정보 정의 (현재 미사용)
   * 향후 확장 시 아래 코드 참고하여 구현
   * - 보고서 템플릿 다운로드 버튼
   * - 신규 보고서 작성 버튼
   * - 작성완료/부적성 상태 표시
   */

  /**
   * 성능 모니터링 함수
   * - 콘솔 로그 제거됨
   * - 필요시 React DevTools Profiler 사용 권장
   */
  const onRenderProfiler = useCallback(() => {
    // 성능 프로파일링 비활성화
  }, []);

  /**
   * 책무별 점검 현황 데이터
   * - API에서 받은 데이터 사용
   */
  const responsibilityInspections = useMemo<ApiResponsibilityInspection[]>(() => {
    return reportData?.responsibilityInspections || [];
  }, [reportData]);

  /**
   * 관리의무별 점검 현황 데이터
   * - API에서 받은 데이터 사용
   */
  const obligationInspections = useMemo<ApiObligationInspection[]>(() => {
    return reportData?.obligationInspections || [];
  }, [reportData]);

  /**
   * 관리활동별 점검 현황 데이터
   * - API에서 받은 데이터 사용
   */
  const activityInspections = useMemo<ApiActivityInspection[]>(() => {
    return reportData?.activityInspections || [];
  }, [reportData]);

  /**
   * 관리의무 2열 배치를 위한 데이터 그룹핑
   * - 왼쪽/오른쪽 컬럼으로 분리하여 테이블 렌더링
   */
  const obligationPairs = useMemo(() => {
    const pairs: { left: ApiObligationInspection | null; right: ApiObligationInspection | null }[] = [];
    for (let i = 0; i < obligationInspections.length; i += 2) {
      pairs.push({
        left: obligationInspections[i] || null,
        right: obligationInspections[i + 1] || null,
      });
    }
    return pairs;
  }, [obligationInspections]);

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
          {/* <BaseActionBar
            totalCount={statistics.totalResponsibilities + statistics.totalDuties}
            totalLabel="총 보고서 수"
            selectedCount={0}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          /> */}

          {/* 📊 집계 현황 테이블 - 실제 API 데이터 표시 */}
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
                {reportLoading ? (
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryCell} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                      데이터를 불러오는 중...
                    </div>
                  </div>
                ) : !filters.ledgerOrderId ? (
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryCell} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                      책무이행차수를 선택해주세요.
                    </div>
                  </div>
                ) : reportError ? (
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryCell} style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#d32f2f' }}>
                      데이터 조회 중 오류가 발생했습니다.
                    </div>
                  </div>
                ) : (
                  <div className={styles.summaryRow}>
                    <div className={styles.summaryCell}>{statistics.totalResponsibilities}개</div>
                    <div className={styles.summaryCell}>{statistics.totalDuties}개</div>
                    <div className={styles.summaryCell}>{statistics.totalActivities}개</div>
                    <div className={styles.summaryCell}>
                      <span className={styles.completed}>적정 : {statistics.inspectionResults.completed}건</span>
                      <span className={styles.notCompleted}>부적정 : {statistics.inspectionResults.notCompleted}건</span>
                    </div>
                    <div className={styles.summaryCell}>
                      <span className={styles.completed}>완료 : {statistics.improvementActions.completed}건</span>
                      <span className={styles.inProgress}>진행중 : {statistics.improvementActions.inProgress}건</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 📋 1) 책무별 점검 현황 - 실제 API 데이터 표시 */}
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
                {reportLoading ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      데이터를 불러오는 중...
                    </div>
                  </div>
                ) : !filters.ledgerOrderId ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      책무이행차수를 선택해주세요.
                    </div>
                  </div>
                ) : responsibilityInspections.length === 0 ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      조회된 데이터가 없습니다.
                    </div>
                  </div>
                ) : (
                  responsibilityInspections.map((item, index) => (
                    <div key={`resp-${item.responsibilityCd}-${index}`} className={styles.simpleTableRow}>
                      <div className={styles.simpleTableCell}>{item.responsibilityInfo}</div>
                      <div className={styles.simpleTableCell}>{item.inspectionResult}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 📋 2) 관리의무별 점검 현황 - 실제 API 데이터 표시 */}
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
                {reportLoading ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      데이터를 불러오는 중...
                    </div>
                  </div>
                ) : !filters.ledgerOrderId ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      책무이행차수를 선택해주세요.
                    </div>
                  </div>
                ) : obligationPairs.length === 0 ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      조회된 데이터가 없습니다.
                    </div>
                  </div>
                ) : (
                  obligationPairs.map((pair, index) => (
                    <div key={`oblig-pair-${index}`} className={styles.simpleTableRow}>
                      <div className={styles.simpleTableCell}>{pair.left?.obligationInfo || ''}</div>
                      <div className={styles.simpleTableCell}>{pair.left?.inspectionResult || ''}</div>
                      <div className={styles.simpleTableCell}>{pair.right?.obligationInfo || ''}</div>
                      <div className={styles.simpleTableCell}>{pair.right?.inspectionResult || ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 📋 3) 관리활동 점검 현황 - 실제 API 데이터 표시 */}
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
                {reportLoading ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      데이터를 불러오는 중...
                    </div>
                  </div>
                ) : !filters.ledgerOrderId ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      책무이행차수를 선택해주세요.
                    </div>
                  </div>
                ) : activityInspections.length === 0 ? (
                  <div className={styles.simpleTableRow}>
                    <div className={styles.simpleTableCell} style={{ width: '100%', textAlign: 'center' }}>
                      조회된 데이터가 없습니다.
                    </div>
                  </div>
                ) : (
                  activityInspections.map((item, index) => (
                    <div key={`activity-${item.implInspectionItemId}-${index}`} className={styles.simpleTableRow}>
                      <div className={styles.simpleTableCell}>{item.activityName}</div>
                      <div className={styles.simpleTableCell}>{item.respItem}</div>
                      <div className={styles.simpleTableCell}>{item.inspectionStatusName}</div>
                    </div>
                  ))
                )}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSave={handleReportSave as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onUpdate={handleReportUpdate as any}
            loading={loading}
          />
        </BaseModalWrapper>

        {/* 조직조회 모달 - single 선택 (multiple=false) */}
        <OrganizationSearchModal
          open={organizationSearchOpen}
          onClose={handleOrganizationSearchClose}
          onSelect={handleOrganizationSelect}
          multiple={false}
          title="부서 조회"
        />
      </div>
    </React.Profiler>
  );
};

export default ExecutiveReport;
