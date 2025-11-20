/**
 * CeoReportView.tsx
 * - CEO이행점검보고서 조회 페이지 (BaseSearchFilter, BaseActionBar 제외)
 * - ReportList에서 "CEO" 보고서 클릭 시 표시되는 깔끔한 조회 페이지
 */

import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CeoReportView.module.scss';

// Types
import type {
  CeoComplianceOpinionStatus,
  CeoDashboardStats,
  CeoOverallDutyInspection,
  CeoSummaryStats
} from '../CeoReport/types/ceoReport.types';

// Shared Components
import { Button } from '@/shared/components/atoms/Button';

interface CeoReportViewProps {
  className?: string;
}

const CeoReportView: React.FC<CeoReportViewProps> = ({ className }) => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  // State Management
  const [summaryData] = useState<CeoSummaryStats>({
    totalOverallDuties: 3,
    inspectionResults: { completed: 0, inProgress: 0 },
    nonCompliance: 3,
    improvementOpinions: { completed: 0, inProgress: 0 }
  });

  const [overallDutyData] = useState<CeoOverallDutyInspection[]>([
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

  const [complianceData] = useState<CeoComplianceOpinionStatus[]>([
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

  const [loading] = useState<boolean>(false);

  // 통계 계산
  const statistics: CeoDashboardStats = {
    totalOverallDuties: summaryData.totalOverallDuties,
    inspectionResults: summaryData.inspectionResults,
    nonCompliance: summaryData.nonCompliance,
    improvementActions: summaryData.improvementOpinions,
    complianceRate: 95.2,
    completionRate: 88.7
  };

  // Event Handlers
  const handleGoBack = useCallback(() => {
    navigate('/app/reports/report-list');
  }, [navigate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // TODO: reportId를 사용하여 실제 데이터 로딩
  console.log('Report ID:', reportId);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <BusinessCenterIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>CEO이행점검보고서</h1>
              <p className={styles.pageDescription}>
                CEO 총괄관리의무별 점검현황 및 개선의견
              </p>
            </div>
          </div>

          {/* 헤더 통계 카드 */}
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

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        {/* 액션 영역 */}
        <div className={styles.actionArea}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            className={styles.backButton}
          >
            목록으로
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            className={styles.printButton}
          >
            인쇄
          </Button>
        </div>

        {/* 점검 현황 집계 */}
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

        {/* 1) CEO 총괄 관리의무 유형별 점검 현황 */}
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
              <div className={styles.simpleTableHeaderCell}>점검결과<br />미작성</div>
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

        {/* 2) 총괄 관리의무별 이행 부적정의견/개선의견 현황 */}
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
              <div className={styles.simpleTableHeaderCell}>부적정</div>
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

        {/* 3) CEO 고유 관리의무 이행 현황 */}
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
              {/* TODO: 실제 데이터 연동 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CeoReportView;
