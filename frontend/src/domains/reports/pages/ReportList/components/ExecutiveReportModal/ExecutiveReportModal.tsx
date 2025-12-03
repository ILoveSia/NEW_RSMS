/**
 * ExecutiveReportModal.tsx
 * - 임원이행점검보고서 모달
 * - ReportList에서 "임원" 보고서 클릭 시 모달로 표시
 * - 실제 API 데이터 연동
 */

import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import styles from './ExecutiveReportModal.module.scss';

// API & Hooks
import { useExecutiveReport } from '@/domains/reports/hooks/useExecutiveReport';
import type {
  ResponsibilityInspection as ApiResponsibilityInspection,
  ObligationInspection as ApiObligationInspection,
  ActivityInspection as ApiActivityInspection,
} from '@/domains/reports/api/executiveReportApi';

/**
 * ExecutiveReportModal Props
 * - ledgerOrderId와 implInspectionPlanId를 전달받아 실제 데이터 조회
 */
interface ExecutiveReportModalProps {
  open: boolean;
  onClose: () => void;
  reportId?: string;
  ledgerOrderId?: string;
  implInspectionPlanId?: string;
  result?: string;
}

const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  open,
  onClose,
  reportId,
  ledgerOrderId,
  implInspectionPlanId,
  result
}) => {
  /**
   * 임원이행점검보고서 데이터 조회 훅
   * - ledgerOrderId가 있을 때만 API 호출
   */
  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
  } = useExecutiveReport({
    ledgerOrderId: ledgerOrderId || '',
    implInspectionPlanId: implInspectionPlanId || undefined,
  });

  /**
   * 대시보드 통계 계산
   * - API 응답 데이터에서 집계 현황 추출
   */
  const statistics = useMemo(() => {
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
      complianceRate: 98.5
    };
  }, [reportData]);

  /**
   * 책무별 점검 현황 데이터
   */
  const responsibilityInspections = useMemo<ApiResponsibilityInspection[]>(() => {
    return reportData?.responsibilityInspections || [];
  }, [reportData]);

  /**
   * 관리의무별 점검 현황 데이터
   */
  const obligationInspections = useMemo<ApiObligationInspection[]>(() => {
    return reportData?.obligationInspections || [];
  }, [reportData]);

  /**
   * 관리활동별 점검 현황 데이터
   */
  const activityInspections = useMemo<ApiActivityInspection[]>(() => {
    return reportData?.activityInspections || [];
  }, [reportData]);

  /**
   * 관리의무 2열 배치를 위한 데이터 그룹핑
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

  // Event Handlers
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 디버깅용 로그
  console.log('ExecutiveReportModal - reportId:', reportId, 'ledgerOrderId:', ledgerOrderId, 'implInspectionPlanId:', implInspectionPlanId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: styles.dialogPaper
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleContent}>
          <BusinessCenterIcon className={styles.titleIcon} />
          <div>
            <h2 className={styles.title}>임원이행점검보고서</h2>
            <p className={styles.subtitle}>임원별 책무 이행점검 현황 및 개선이행</p>
          </div>
        </div>
        <div className={styles.titleActions}>
          <IconButton onClick={handlePrint} size="small" className={styles.printButton}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small" className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {/* 로딩 상태 */}
        {reportLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
            <CircularProgress />
            <span style={{ marginLeft: '16px' }}>데이터를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {reportError && !reportLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
            데이터 조회 중 오류가 발생했습니다.
          </div>
        )}

        {/* 데이터 없음 상태 */}
        {!reportLoading && !reportError && !ledgerOrderId && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            조회할 데이터가 없습니다.
          </div>
        )}

        {/* 실제 데이터 표시 */}
        {!reportLoading && !reportError && ledgerOrderId && (
          <>
            {/* 헤더 통계 카드 */}
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

            {/* 집계 현황 테이블 */}
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
                </div>
              </div>
            </div>

            {/* 1) 책무별 점검 현황 */}
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
                  {responsibilityInspections.length === 0 ? (
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

            {/* 2) 관리의무별 점검 현황 */}
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
                  {obligationPairs.length === 0 ? (
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

            {/* 3) 관리활동 점검 현황 */}
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>
                <BusinessCenterIcon className={styles.sectionIcon} />
                3) 관리활동 점검 현황
              </h3>
              <div className={styles.simpleTable}>
                <div className={styles.simpleTableHeader}>
                  <div className={styles.simpleTableHeaderCell} style={{width: '40%'}}>관리활동</div>
                  <div className={styles.simpleTableHeaderCell} style={{width: '50%'}}>책무관리항목</div>
                  <div className={styles.simpleTableHeaderCell} style={{width: '10%'}}>점검결과</div>
                </div>
                <div className={styles.simpleTableBody}>
                  {activityInspections.length === 0 ? (
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

            {/* 이행점검결과 */}
            <div className={styles.resultSection}>
              <h3 className={styles.sectionTitle}>
                <SecurityIcon className={styles.sectionIcon} />
                이행점검결과
              </h3>
              <div className={styles.resultContent}>
                <textarea
                  className={styles.resultTextarea}
                  placeholder="이행점검 결과 내용을 입력하세요..."
                  rows={3}
                  defaultValue={result || ''}
                  readOnly
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExecutiveReportModal;
