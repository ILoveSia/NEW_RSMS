/**
 * 임원이행점검보고서 뷰 페이지
 * - ReportList에서 "임원" 보고서 클릭 시 표시
 * - BaseSearchFilter, BaseActionBar 없이 보고서 내용만 표시
 *
 * @author RSMS
 * @since 2025-11-20
 */

import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import toast from '@/shared/utils/toast';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import Button from '@/shared/components/atoms/Button';
import styles from './ExecutiveReportView.module.scss';

// Types
import type {
  DutyInspection,
  ExecutiveDashboardStats,
  ResponsibilityInspection
} from '../ExecutiveReport/types/executiveReport.types';

interface ExecutiveReportViewProps {
  className?: string;
}

const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({ className }) => {
  const { t } = useTranslation('reports');
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  // State Management
  const [responsibilityData, setResponsibilityData] = useState<ResponsibilityInspection[]>([]);
  const [dutyData, setDutyData] = useState<DutyInspection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 통계 데이터
  const statistics = useMemo<ExecutiveDashboardStats>(() => ({
    totalResponsibilities: responsibilityData.length,
    totalDuties: dutyData.length,
    complianceRate: 95
  }), [responsibilityData, dutyData]);

  // 뒤로가기 핸들러
  const handleGoBack = useCallback(() => {
    navigate('/app/reports/list');
  }, [navigate]);

  // 인쇄 핸들러
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      try {
        // TODO: API 호출하여 실제 데이터 로드
        // const response = await executiveReportApi.getReportById(reportId);

        // Mock 데이터 (임시)
        const mockResponsibilityData: ResponsibilityInspection[] = [
          {
            id: '1',
            responsibility: '내부통제',
            managementDuty: '내부통제 업무수행 관련 책무',
            managementActivity: '내부통제 시스템 운영',
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
          }
        ];

        setResponsibilityData(mockResponsibilityData);
        setDutyData(mockDutyData);
      } catch (error) {
        console.error('보고서 데이터 로드 실패:', error);
        toast.error('보고서 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [reportId]);

  if (loading) {
    return <LoadingSpinner message="보고서를 불러오는 중입니다..." />;
  }

  return (
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
                {t('executive.report.description', '임원 소관 조직의 관리활동 내역에 대한 통계 및 보고서')}
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
        {/* 액션 버튼 영역 */}
        <div className={styles.actionArea}>
          <Button
            variant="outlined"
            onClick={handleGoBack}
          >
            목록으로
          </Button>
          <Button
            variant="contained"
            onClick={handlePrint}
          >
            인쇄
          </Button>
        </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveReportView;
