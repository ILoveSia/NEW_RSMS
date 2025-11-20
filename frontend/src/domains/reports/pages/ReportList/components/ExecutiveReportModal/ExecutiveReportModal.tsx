/**
 * ExecutiveReportModal.tsx
 * - 임원이행점검보고서 모달
 * - ReportList에서 "임원" 보고서 클릭 시 모달로 표시
 */

import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import styles from './ExecutiveReportModal.module.scss';

// Types
interface ResponsibilityInspection {
  id: string;
  order: number;
  responsibility: string;
  result: string;
  written: number;
  notWritten: number;
  nonCompliance: number;
  improvementOpinion: { completed: number; inProgress: number };
}

interface DutyInspection {
  id: string;
  order: number;
  managementDuty: string;
  position: string;
  dutyCount: number;
  nonCompliance: number;
  improvementOpinion: { completed: number; inProgress: number };
}

interface ExecutiveReportModalProps {
  open: boolean;
  onClose: () => void;
  reportId?: string;
}

const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  open,
  onClose,
  reportId
}) => {
  // State Management
  const [responsibilityData] = useState<ResponsibilityInspection[]>([
    {
      id: '1',
      order: 1,
      responsibility: '내부통제기준 및 위험관리기준 준수 확약에 대한 관리의무',
      result: '미이행',
      written: 0,
      notWritten: 0,
      nonCompliance: 1,
      improvementOpinion: { completed: 0, inProgress: 0 }
    }
  ]);

  const [dutyData] = useState<DutyInspection[]>([
    {
      id: '1',
      order: 1,
      managementDuty: '책무구조도의 미준 관리 관련 책무 재부내용의 관리의무',
      position: '2',
      dutyCount: 0,
      nonCompliance: 0,
      improvementOpinion: { completed: 0, inProgress: 0 }
    }
  ]);

  // 통계 계산
  const statistics = {
    totalResponsibilities: responsibilityData.length,
    totalDuties: dutyData.length,
    totalNonCompliance: responsibilityData.reduce((sum, item) => sum + item.nonCompliance, 0),
    complianceRate: 88.5
  };

  // Event Handlers
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // TODO: reportId를 사용하여 실제 데이터 로딩
  console.log('Report ID:', reportId);

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
            <p className={styles.subtitle}>임원별 책무 이행점검 현황 및 개선의견</p>
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
        {/* 헤더 통계 카드 */}
        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <AssignmentIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{statistics.totalResponsibilities}</div>
              <div className={styles.statLabel}>총 책무</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUpIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{statistics.complianceRate.toFixed(1)}%</div>
              <div className={styles.statLabel}>이행율</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <SecurityIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{statistics.totalNonCompliance}</div>
              <div className={styles.statLabel}>미이행</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <AnalyticsIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{statistics.totalDuties}</div>
              <div className={styles.statLabel}>관리의무</div>
            </div>
          </div>
        </div>

        {/* 요약 테이블 */}
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>
            <AnalyticsIcon className={styles.sectionIcon} />
            점검 현황 요약
          </h3>
          <div className={styles.summaryTable}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryHeaderCell}>책무</div>
              <div className={styles.summaryHeaderCell}>점검결과</div>
              <div className={styles.summaryHeaderCell}>미이행</div>
              <div className={styles.summaryHeaderCell}>개선의견</div>
            </div>
            <div className={styles.summaryBody}>
              <div className={styles.summaryRow}>
                <div className={styles.summaryCell}>{statistics.totalResponsibilities}</div>
                <div className={styles.summaryCell}>
                  <span className={styles.completed}>작성: 0건</span>
                  <span className={styles.notCompleted}>미작성: 0건</span>
                </div>
                <div className={styles.summaryCell}>{statistics.totalNonCompliance}</div>
                <div className={styles.summaryCell}>
                  <span className={styles.completed}>완료: 0건</span>
                  <span className={styles.inProgress}>진행중: 0건</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1) 책무별 점검 현황 */}
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>
            <DashboardIcon className={styles.sectionIcon} />
            1) 책무별 점검 현황 ({responsibilityData.length}개)
          </h3>
          <div className={styles.simpleTable}>
            <div className={styles.simpleTableHeader}>
              <div className={styles.simpleTableHeaderCell}>순번</div>
              <div className={styles.simpleTableHeaderCell}>책무</div>
              <div className={styles.simpleTableHeaderCell}>점검결과</div>
              <div className={styles.simpleTableHeaderCell}>작성</div>
              <div className={styles.simpleTableHeaderCell}>미작성</div>
              <div className={styles.simpleTableHeaderCell}>미이행</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />완료</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />진행중</div>
            </div>
            <div className={styles.simpleTableBody}>
              {responsibilityData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.order}</div>
                  <div className={styles.simpleTableCell}>{item.responsibility}</div>
                  <div className={styles.simpleTableCell}>{item.result}</div>
                  <div className={styles.simpleTableCell}>{item.written}</div>
                  <div className={styles.simpleTableCell}>{item.notWritten}</div>
                  <div className={styles.simpleTableCell}>{item.nonCompliance}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.completed}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.inProgress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2) 관리의무별 점검 현황 */}
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>
            <SecurityIcon className={styles.sectionIcon} />
            2) 관리의무별 점검 현황 ({dutyData.length}개)
          </h3>
          <div className={styles.simpleTable}>
            <div className={styles.simpleTableHeader}>
              <div className={styles.simpleTableHeaderCell}>순번</div>
              <div className={styles.simpleTableHeaderCell}>관리의무</div>
              <div className={styles.simpleTableHeaderCell}>직책</div>
              <div className={styles.simpleTableHeaderCell}>관리의무 수</div>
              <div className={styles.simpleTableHeaderCell}>미이행</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />완료</div>
              <div className={styles.simpleTableHeaderCell}>개선의견<br />진행중</div>
            </div>
            <div className={styles.simpleTableBody}>
              {dutyData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.order}</div>
                  <div className={styles.simpleTableCell}>{item.managementDuty}</div>
                  <div className={styles.simpleTableCell}>{item.position}</div>
                  <div className={styles.simpleTableCell}>{item.dutyCount}</div>
                  <div className={styles.simpleTableCell}>{item.nonCompliance}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.completed}</div>
                  <div className={styles.simpleTableCell}>{item.improvementOpinion.inProgress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExecutiveReportModal;
