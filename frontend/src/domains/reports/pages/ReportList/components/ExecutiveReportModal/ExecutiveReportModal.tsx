/**
 * ExecutiveReportModal.tsx
 * - 임원이행점검보고서 모달
 * - ReportList에서 "임원" 보고서 클릭 시 모달로 표시
 */

import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrintIcon from '@mui/icons-material/Print';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import React, { useCallback, useState } from 'react';
import styles from './ExecutiveReportModal.module.scss';

// Types
interface SummaryStats {
  responsibilities: number;
  managementDuties: number;
  managementActivities: number;
  inspectionResults: { written: number; nonCompliance: number };
  improvementActions: { completed: number; inProgress: number };
}

interface ResponsibilityInspection {
  id: string;
  responsibility: string;
  result: string;
}

interface DutyInspection {
  id: string;
  managementDuty: string;
  result: string;
}

interface ActivityInspection {
  id: string;
  activity: string;
  managementItem: string;
  result: string;
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
  const [summaryData] = useState<SummaryStats>({
    responsibilities: 1,
    managementDuties: 3,
    managementActivities: 5,
    inspectionResults: { written: 3, nonCompliance: 2 },
    improvementActions: { completed: 1, inProgress: 1 }
  });

  const [responsibilityData] = useState<ResponsibilityInspection[]>([
    {
      id: '1',
      responsibility: '법무·송무 업무와 관련된 책무',
      result: '점검'
    }
  ]);

  const [dutyData] = useState<DutyInspection[]>([
    {
      id: '1',
      managementDuty: '중요계약서(약관 포함), 서식 검토 내용 및 법률실무에 대한 질의회신 내용의 적정성 검토',
      result: '점검'
    },
    {
      id: '2',
      managementDuty: '소송 관련 제도 전반, 소송 업무 처리 및 외부위임 소송사건의 업무 처리 적정성 관리·감독',
      result: '점검'
    },
    {
      id: '3',
      managementDuty: '정관 변경 업무 및 내규 제정·개정·폐지안의 사전심의 업무 관리',
      result: '점검'
    }
  ]);

  const [activityData] = useState<ActivityInspection[]>([
    {
      id: '1',
      activity: '중요계약서 서식 및 내용의 적정성 검토에 대한 점검',
      managementItem: '중요계약서 서식 및 내용의 적정성 검토에 대한 점검',
      result: '적정'
    },
    {
      id: '2',
      activity: '법률 관련 질의회신 내용의 적정성 검토에 대한 점검',
      managementItem: '법률 관련 질의회신 내용의 적정성 검토에 대한 점검',
      result: '적정'
    },
    {
      id: '3',
      activity: '소송관련 업무 전반에 대한 지원 점검',
      managementItem: '소송관련 업무 전반에 대한 지원 및 관련 자료 수집 및 보관 절차준수 여부에 대한 점검',
      result: '적정'
    },
    {
      id: '4',
      activity: '외부위임 소송사건의 업무 처리 적정성 점검',
      managementItem: '외부위임 소송업무의 변호사 선정 및 자문료 금액에 대한 규정 준수 및 전결권자 승인여부에 대한 점검',
      result: '부적정'
    },
    {
      id: '5',
      activity: '정관 변경 및 내규 제·개정·폐지 시 사전심의 및 협의 절차 점검',
      managementItem: '정관 변경 및 내규 제·개정·폐지 시 사전검토 및 협의 수행여부에 대한 점검',
      result: '부적정'
    }
  ]);

  // 통계 계산
  const statistics = {
    totalResponsibilities: summaryData.responsibilities,
    totalDuties: summaryData.managementDuties,
    totalActivities: summaryData.managementActivities,
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
                <div className={styles.summaryCell}>{summaryData.responsibilities}개</div>
                <div className={styles.summaryCell}>{summaryData.managementDuties}개</div>
                <div className={styles.summaryCell}>{summaryData.managementActivities}개</div>
                <div className={styles.summaryCell}>
                  <span className={styles.completed}>작성 : {summaryData.inspectionResults.written}건</span>
                  <span className={styles.notCompleted}>부적성 : {summaryData.inspectionResults.nonCompliance}건</span>
                </div>
                <div className={styles.summaryCell}>
                  <span className={styles.completed}>완료 : {summaryData.improvementActions.completed}건</span>
                  <span className={styles.inProgress}>진행중 : {summaryData.improvementActions.inProgress}건</span>
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
              {responsibilityData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.responsibility}</div>
                  <div className={styles.simpleTableCell}>{item.result}</div>
                </div>
              ))}
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
              <div className={styles.simpleTableRow}>
                <div className={styles.simpleTableCell}>{dutyData[0]?.managementDuty || ''}</div>
                <div className={styles.simpleTableCell}>{dutyData[0]?.result || ''}</div>
                <div className={styles.simpleTableCell}>{dutyData[1]?.managementDuty || ''}</div>
                <div className={styles.simpleTableCell}>{dutyData[1]?.result || ''}</div>
              </div>
              <div className={styles.simpleTableRow}>
                <div className={styles.simpleTableCell}>{dutyData[2]?.managementDuty || ''}</div>
                <div className={styles.simpleTableCell}>{dutyData[2]?.result || ''}</div>
                <div className={styles.simpleTableCell}></div>
                <div className={styles.simpleTableCell}></div>
              </div>
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
              {activityData.map((item) => (
                <div key={item.id} className={styles.simpleTableRow}>
                  <div className={styles.simpleTableCell}>{item.activity}</div>
                  <div className={styles.simpleTableCell}>{item.managementItem}</div>
                  <div className={styles.simpleTableCell}>{item.result}</div>
                </div>
              ))}
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
              defaultValue="2025년 하반기 정기점검 결과, 전체적으로 책무 이행이 양호한 것으로 확인되었습니다."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExecutiveReportModal;
