// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CeoReport.module.scss';

// Types
import type {
  CeoComplianceOpinionStatus,
  CeoDashboardStats,
  CeoOverallDutyInspection,
  CeoReportFilters,
  CeoReportLoadingStates,
  CeoReportModalState,
  CeoSummaryStats
} from './types/ceoReport.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseSearchFilter, type FilterField } from '@/shared/components/organisms/BaseSearchFilter';

// CeoReport specific components
// Lazy-loaded components for performance optimization
const CeoReportFormModal = React.lazy(() =>
  import('./components/CeoReportFormModal').then(module => ({ default: module.default }))
);

interface CeoReportProps {
  className?: string;
}

const CeoReport: React.FC<CeoReportProps> = ({ className }) => {
  const { t } = useTranslation('reports');

  // State Management (PositionMgmt 패턴 준수)
  const [summaryData, setSummaryData] = useState<CeoSummaryStats>({
    totalOverallDuties: 3,
    inspectionResults: { completed: 0, inProgress: 0 },
    nonCompliance: 3,
    improvementOpinions: { completed: 0, inProgress: 0 }
  });

  const [overallDutyData, setOverallDutyData] = useState<CeoOverallDutyInspection[]>([
    {
      id: '1',
      order: 1,
      responsibility: '내부통제기준 및 위험관리기준 준수 확약에 대한 관리의무',
      finalResult: '미이행',
      inspectionResult: { written: 0, notWritten: 0 },
      nonCompliance: 1,
      improvementOpinion: { completed: 0, inProgress: 0 }
    }
  ]);

  const [complianceData, setComplianceData] = useState<CeoComplianceOpinionStatus[]>([
    {
      id: '1',
      order: 1,
      responsibility: '책무구조도의 미준 관리 관련 책무 재부내용의 관리의무',
      written: 2,
      dutyCount: 0,
      notWritten: 2,
      nonCompliance: 0,
      improvementOpinion: { completed: 0, inProgress: 0 }
    }
  ]);

  // 3) CEO 간주 관리의무 이행 현황 데이터 (이미지 02에서 확인)
  const [ceoImpliedDutyData, setCeoImpliedDutyData] = useState([
    {
      id: '1',
      order: 1,
      managementDuty: '', // 관리의무 (이미지에서 잘림)
      written: '미이행',
      department: '',
      managementHQ: '',
      inspectionResult: '',
      remarks: ''
    }
  ]);

  const [loading, setLoading] = useState<boolean>(false);

  // 개별 로딩 상태 (PositionMgmt 패턴)
  const [loadingStates, setLoadingStates] = useState<CeoReportLoadingStates>({
    search: false,
    templateDownload: false,
    newReport: false,
    refresh: false
  });

  const [filters, setFilters] = useState<CeoReportFilters>({
    inspectionYear: '',
    inspectionName: '2026년1회차 이행점검',
    branchName: '',
    inspectionStatus: '',
    improvementStatus: ''
  });

  const [modalState, setModalState] = useState<CeoReportModalState>({
    formModal: false,
    detailModal: false,
    templateModal: false,
    selectedReport: null
  });

  // Event Handlers (PositionMgmt 패턴)
  const handleFiltersChange = useCallback((newFilters: Partial<CeoReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('CEO 점검 현황을 검색 중입니다...');

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
      inspectionYear: '',
      inspectionName: '2026년1회차 이행점검',
      branchName: '',
      inspectionStatus: '',
      improvementStatus: ''
    });
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, []);

  const handleTemplateDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, templateDownload: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('CEO 보고서 템플릿을 다운로드 중입니다...');

    try {
      // TODO: 실제 템플릿 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', 'CEO 보고서 템플릿이 다운로드되었습니다.');
      console.log('템플릿 다운로드 완료');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '템플릿 다운로드에 실패했습니다.');
      console.error('템플릿 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, templateDownload: false }));
    }
  }, []);

  const handleNewReport = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, newReport: true }));

    // 로딩 토스트 표시
    const loadingToastId = toast.loading('신규 CEO 보고서 작성을 준비 중입니다...');

    try {
      // TODO: 실제 신규 보고서 생성 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      // 모달 열기
      setModalState(prev => ({
        ...prev,
        formModal: true,
        selectedReport: null
      }));

      // 성공 토스트로 업데이트
      toast.update(loadingToastId, 'success', '신규 CEO 보고서 작성 화면을 열었습니다.');
      console.log('신규 보고서 작성 시작');
    } catch (error) {
      // 에러 토스트로 업데이트
      toast.update(loadingToastId, 'error', '신규 보고서 작성에 실패했습니다.');
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
      templateModal: false,
      selectedReport: null
    }));
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo<CeoDashboardStats>(() => {
    return {
      totalOverallDuties: summaryData.totalOverallDuties,
      inspectionResults: summaryData.inspectionResults,
      nonCompliance: summaryData.nonCompliance,
      improvementActions: summaryData.improvementOpinions,
      complianceRate: 95.2, // TODO: 실제 데이터 연동
      completionRate: 88.7
    };
  }, [summaryData]);

  // BaseSearchFilter용 검색 필드 정의 (PositionMgmt 패턴)
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'inspectionYear',
      type: 'select',
      label: '점검연도',
      options: [
        { value: '', label: '전체' },
        { value: '2026', label: '2026년' },
        { value: '2025', label: '2025년' },
        { value: '2024', label: '2024년' }
      ],
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'inspectionName',
      type: 'text',
      label: '점검명',
      placeholder: '점검명을 입력하세요',
      defaultValue: '2026년1회차 이행점검',
      disabled: true, // 표시용
      gridSize: { xs: 12, sm: 6, md: 4 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의 (PositionMgmt와 동일한 패턴)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'templateDownload',
      type: 'custom',
      label: '보고서 템플릿 다운로드',
      variant: 'contained',
      color: 'primary',
      onClick: handleTemplateDownload,
      disabled: loadingStates.templateDownload,
      loading: loadingStates.templateDownload
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
  ], [handleTemplateDownload, handleNewReport, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      key: 'totalDuties',
      label: '총 총괄관리의무',
      value: `${statistics.totalOverallDuties}건`,
      color: 'primary'
    },
    {
      key: 'completionRate',
      label: '점검 완료율',
      value: `${statistics.completionRate.toFixed(1)}%`,
      color: 'success'
    },
    {
      key: 'complianceRate',
      label: '컴플라이언스 준수율',
      value: `${statistics.complianceRate.toFixed(1)}%`,
      color: 'info'
    },
    {
      key: 'lastUpdate',
      label: '최종 업데이트',
      value: new Date().toLocaleString('ko-KR'),
      color: 'default'
    }
  ], [statistics]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🎯 페이지 헤더 - PositionMgmt와 100% 동일한 스타일 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <BusinessCenterIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>CEO이행점검보고서</h1>
              <p className={styles.pageDescription}>
                CEO 총괄관리의무별 점검현황 및 개선의견 관리
              </p>
            </div>
          </div>

          {/* 📊 헤더 통계 카드 - PositionMgmt와 동일한 스타일 */}
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AssignmentIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalOverallDuties}</div>
                <div className={styles.statLabel}>총괄관리의무</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUpIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.completionRate.toFixed(1)}%</div>
                <div className={styles.statLabel}>점검완료율</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.complianceRate.toFixed(1)}%</div>
                <div className={styles.statLabel}>준수율</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AnalyticsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.nonCompliance}</div>
                <div className={styles.statLabel}>미이행</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 검색 필터 영역 */}
        <div className={styles.searchSection}>
          <BaseSearchFilter
            fields={searchFields}
            values={filters}
            onValuesChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loadingStates.search}
          />
        </div>

        {/* 📊 액션바 */}
        <BaseActionBar
          totalCount={statistics.totalOverallDuties}
          selectedCount={0}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 📊 점검 현황 집계 테이블 */}
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>
            <AnalyticsIcon className={styles.sectionIcon} />
            점검 현황
          </h3>
          <div className={styles.summaryTable}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryHeaderCell}>총괄관리의무</div>
              <div className={styles.summaryHeaderCell}>점검결과</div>
              <div className={styles.summaryHeaderCell}>미이행</div>
              <div className={styles.summaryHeaderCell}>개선의견</div>
            </div>
            <div className={styles.summaryBody}>
              <div className={styles.summaryRow}>
                <div className={styles.summaryCell}>{summaryData.totalOverallDuties}</div>
                <div className={styles.summaryCell}>
                  <span className={styles.completed}>완료 : {summaryData.inspectionResults.completed}건</span>
                  <span className={styles.inProgress}>진행중 : {summaryData.inspectionResults.inProgress}건</span>
                </div>
                <div className={styles.summaryCell}>{summaryData.nonCompliance}</div>
                <div className={styles.summaryCell}>
                  <span className={styles.completed}>완료 : {summaryData.improvementOpinions.completed}건</span>
                  <span className={styles.inProgress}>진행중 : {summaryData.improvementOpinions.inProgress}건</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📋 1) CEO 총괄 관리의무 유형별 점검 현황 */}
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>
            <DashboardIcon className={styles.sectionIcon} />
            1) CEO 총괄 관리의무 유형별 점검 ({overallDutyData.length}개)
          </h3>
          <div className={styles.simpleTable}>
            <div className={styles.simpleTableHeader}>
              <div className={styles.simpleTableHeaderCell}>순번</div>
              <div className={styles.simpleTableHeaderCell}>책무</div>
              <div className={styles.simpleTableHeaderCell}>최종결과</div>
              <div className={styles.simpleTableHeaderCell}>점검결과<br />작성</div>
              <div className={styles.simpleTableHeaderCell}>점검결과<br />부작성</div>
              <div className={styles.simpleTableHeaderCell}>미이행</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />완료</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />진행중</div>
            </div>
            <div className={styles.simpleTableBody}>
              {overallDutyData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.order}</div>
                  <div className={styles.simpleTableCell}>{item.responsibility}</div>
                  <div className={styles.simpleTableCell}>{item.finalResult}</div>
                  <div className={styles.simpleTableCell}>{item.inspectionResult.written}</div>
                  <div className={styles.simpleTableCell}>{item.inspectionResult.notWritten}</div>
                  <div className={styles.simpleTableCell}>{item.nonCompliance}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.completed}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.inProgress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📋 2) 총괄 관리의무별 이행 부적정의견/개선의견 현황 */}
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>
            <SecurityIcon className={styles.sectionIcon} />
            2) 총괄 관리의무 이행 부적정미이행/개선이행 현황
          </h3>
          <div className={styles.simpleTable}>
            <div className={styles.simpleTableHeader}>
              <div className={styles.simpleTableHeaderCell}>순번</div>
              <div className={styles.simpleTableHeaderCell}>책무</div>
              <div className={styles.simpleTableHeaderCell}>직책</div>
              <div className={styles.simpleTableHeaderCell}>관리의무 수</div>
              <div className={styles.simpleTableHeaderCell}>부작정</div>
              <div className={styles.simpleTableHeaderCell}>미이행</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />완료</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />진행중</div>
            </div>
            <div className={styles.simpleTableBody}>
              {complianceData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.order}</div>
                  <div className={styles.simpleTableCell}>{item.responsibility}</div>
                  <div className={styles.simpleTableCell}>{item.written}</div>
                  <div className={styles.simpleTableCell}>{item.dutyCount}</div>
                  <div className={styles.simpleTableCell}>{item.notWritten}</div>
                  <div className={styles.simpleTableCell}>{item.nonCompliance}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.completed}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.inProgress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📋 3) CEO 간주 관리의무 이행 현황 (이미지 02에서 확인) */}
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>
            <BusinessCenterIcon className={styles.sectionIcon} />
            3) CEO 고유 관리의무 이행 현황
          </h3>
          <div className={styles.simpleTable}>
            <div className={styles.simpleTableHeader}>
              <div className={styles.simpleTableHeaderCell}>순번</div>
              <div className={styles.simpleTableHeaderCell}>관리의무</div>
              <div className={styles.simpleTableHeaderCell}>직책</div>
              <div className={styles.simpleTableHeaderCell}>부서</div>
              <div className={styles.simpleTableHeaderCell}>관리활동</div>
              <div className={styles.simpleTableHeaderCell}>점검결과</div>
              <div className={styles.simpleTableHeaderCell}>비고</div>
            </div>
            <div className={styles.simpleTableBody}>
              {ceoImpliedDutyData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.order}</div>
                  <div className={styles.simpleTableCell}>{item.managementDuty || '(데이터 확인 필요)'}</div>
                  <div className={styles.simpleTableCell}>{item.written}</div>
                  <div className={styles.simpleTableCell}>{item.department || '-'}</div>
                  <div className={styles.simpleTableCell}>{item.managementHQ || '-'}</div>
                  <div className={styles.simpleTableCell}>{item.inspectionResult || '-'}</div>
                  <div className={styles.simpleTableCell}>{item.remarks || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🎭 모달들 - Lazy Loading 적용 */}
      <Suspense fallback={<LoadingSpinner size="small" />}>
        {modalState.formModal && (
          <CeoReportFormModal
            open={modalState.formModal}
            onClose={handleModalClose}
            reportData={modalState.selectedReport}
            onSubmit={(data) => {
              console.log('CEO 보고서 제출:', data);
              handleModalClose();
              toast.success('CEO 보고서가 성공적으로 제출되었습니다.');
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default CeoReport;
