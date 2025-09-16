/**
 * HomeDashboard - RSMS 책무구조도 이행관리시스템 홈 대시보드
 * 뉴욕 맨하탄 금융센터 전문 UI/UX 디자인 시스템 적용
 * 책무 현황 중심의 깔끔하고 전문적인 인터페이스
 */

import {
  Bell,
  BookOpen,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import styles from './HomeDashboard.module.scss';

// 타입 정의
interface WelcomeCardData {
  userName: string;
  userId: string;
  department: string;
  notifications: {
    alerts: number;
    approvals: number;
    todos: number;
  };
}

interface ResponsibilityStatus {
  responsibilities: number;
  managementDuties: number;
  inspectionComplete: number;
  inspectionPending: number;
  inappropriate: number;
}

interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
}

interface OrganizationNode {
  id: string;
  name: string;
  position: string;
  count: number;
  children?: OrganizationNode[];
}

// Mock 데이터
const mockWelcomeData: WelcomeCardData = {
  userName: '관리자',
  userId: '0000000',
  department: 'Vanguardlab',
  notifications: {
    alerts: 0,
    approvals: 0,
    todos: 0
  }
};

// 책무체계도 실제 데이터 구조
const responsibilityHierarchyData = {
  '김정식': {
    position: '대표이사',
    code: 'CEO',
    responsibilities: [{
      id: 'R01',
      title: '지침책임자 관련 업무',
      count: 2,
      children: [{
        id: 'R01-01',
        title: '내부통제 관련 업무',
        count: 1
      }]
    }],
    subordinates: {
      '고병익': {
        position: '이사',
        code: 'DIR',
        responsibilities: []
      },
      '김우진': {
        position: '상무',
        code: 'EXEC',
        responsibilities: []
      }
    }
  }
};

const mockResponsibilityStatus: ResponsibilityStatus = {
  responsibilities: 9,
  managementDuties: 14,
  inspectionComplete: 5,
  inspectionPending: 4,
  inappropriate: 1
};

const mockLineChartData: ChartDataPoint[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1.5 },
  { x: 3, y: 2 },
  { x: 4, y: 2.5 },
  { x: 5, y: 3 },
  { x: 6, y: 3.2 }
];

const mockOrgData: OrganizationNode = {
  id: 'ceo',
  name: '대표이사',
  position: 'CEO',
  count: 1,
  children: [
    {
      id: 'manage1',
      name: '관리의무1',
      position: '관리의무',
      count: 2,
    },
    {
      id: 'manage2',
      name: '관리의무2',
      position: '관리의무',
      count: 3,
    }
  ]
};


const HomeDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2026년 07월');
  const [selectedOrg, setSelectedOrg] = useState('대표이사');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderResponsibilityHierarchy = () => {
    return (
      <div className={styles.hierarchyContainer}>
        <div className={styles.hierarchyHeader}>
          <h3>광주은행 책무체계도</h3>
          <p className={styles.hierarchySubtitle}>
            책무구조도 대상 인원은 총 20명이며, 내부통제 책무담당자 미터 책무업무를 적정상담, 내부통제 적정완화 및 법제비교는 수행합니다.
          </p>
          <div className={styles.hierarchyDate}>기준일: 2024-12-30</div>
        </div>

        <div className={styles.orgChart}>
          {/* CEO 레벨 */}
          <div className={styles.ceoLevel}>
            <div className={styles.ceoNode}>
              <div className={styles.nodeTitle}>김정식</div>
              <div className={styles.nodePosition}>대표이사(CEO)</div>
              <div className={styles.nodeDate}>2025-01-01</div>
              <div className={styles.nodeCode}>R01</div>
            </div>
          </div>

          {/* 연결선 */}
          <div className={styles.connectionLine}></div>

          {/* 관리의무 레벨 */}
          <div className={styles.managementLevel}>
            <div className={styles.managementNode}>
              <div className={styles.nodeTitle}>윤창의</div>
              <div className={styles.nodePosition}>상무대행</div>
              <div className={styles.nodeDate}>2025-01-01</div>
              <div className={styles.nodeCode}>G01</div>
            </div>

            <div className={styles.managementNode}>
              <div className={styles.nodeTitle}>고병익</div>
              <div className={styles.nodePosition}>이사</div>
              <div className={styles.nodeDate}>2025-01-01</div>
              <div className={styles.nodeCode}>R01 R06 R18 C01</div>
            </div>
          </div>

          {/* 실무진 레벨 */}
          <div className={styles.staffLevel}>
            <div className={styles.branchContainer}>
              <div className={styles.branchTitle}>감사업무팀</div>
              <div className={styles.staffNodes}>
                <div className={styles.staffNode}>
                  <div className={styles.nodeTitle}>정일성</div>
                  <div className={styles.nodeDate}>2025-01-01</div>
                  <div className={styles.nodeCode}>C01 C02 F01 C01</div>
                </div>
                <div className={styles.staffNode}>
                  <div className={styles.nodeTitle}>김종민</div>
                  <div className={styles.nodeDate}>2025-01-01</div>
                  <div className={styles.nodeCode}>F01 F03 F10 C01</div>
                </div>
                <div className={styles.staffNode}>
                  <div className={styles.nodeTitle}>임영수</div>
                  <div className={styles.nodeDate}>2025-01-01</div>
                  <div className={styles.nodeCode}>F02 F10 F14 C01</div>
                </div>
              </div>
            </div>

            <div className={styles.branchContainer}>
              <div className={styles.branchTitle}>리스크관리</div>
              <div className={styles.staffNodes}>
                <div className={styles.staffNode}>
                  <div className={styles.nodeTitle}>변동하</div>
                  <div className={styles.nodeDate}>2025-01-01</div>
                  <div className={styles.nodeCode}>F15 F16 F18 C01</div>
                </div>
                <div className={styles.staffNode}>
                  <div className={styles.nodeTitle}>김제준</div>
                  <div className={styles.nodeDate}>2025-01-01</div>
                  <div className={styles.nodeCode}>C01 C02</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResponsibilityModal = () => {
    if (!showOrgModal) return null;

    return (
      <div className={styles.modalOverlay} onClick={() => setShowOrgModal(false)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>책무체계도</h2>
            <button className={styles.closeButton} onClick={() => setShowOrgModal(false)}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* 실제 데이터 기반 책무체계도 */}
            {renderResponsibilityHierarchy()}

            {/* 우측 책무 목록 */}
            <div className={styles.responsibilityTags}>
              <div className={styles.tagGroup}>
                <h4>지침책임자 관련 책무(12)</h4>
                <div className={styles.tags}>
                  <span className={`${styles.tag} ${styles.guidance}`}>R01</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R02</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R03</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R04</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R05</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R06</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R07</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R08</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R09</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R10</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R11</span>
                  <span className={`${styles.tag} ${styles.guidance}`}>R12</span>
                </div>
              </div>

              <div className={styles.tagGroup}>
                <h4>금융업무 관련 책무(23)</h4>
                <div className={styles.tags}>
                  {['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23'].map(code => (
                    <span key={code} className={`${styles.tag} ${styles.financial}`}>{code}</span>
                  ))}
                </div>
              </div>

              <div className={styles.tagGroup}>
                <h4>경영관리 관련 책무(17)</h4>
                <div className={styles.tags}>
                  {['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17'].map(code => (
                    <span key={code} className={`${styles.tag} ${styles.management}`}>{code}</span>
                  ))}
                </div>
              </div>

              <div className={styles.tagGroup}>
                <h4>공통 책무(2)</h4>
                <div className={styles.tags}>
                  <span className={`${styles.tag} ${styles.common}`}>C01</span>
                  <span className={`${styles.tag} ${styles.common}`}>C02</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.homeDashboard}>
      {/* 상단 섹션 */}
      <div className={styles.topSection}>

        {/* 좌측 컬럼 */}
        <div className={styles.leftColumn}>
          {/* 환영 카드 */}
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeHeader}>
              <h2>반갑습니다!</h2>
              <p>관리자님.</p>
            </div>

            <div className={styles.notificationIcons}>
              <div className={styles.iconGroup}>
                <div className={styles.iconItem}>
                  <Bell size={24} />
                  <span className={styles.iconCount}>0</span>
                  <span className={styles.iconLabel}>알림</span>
                </div>

                <div className={styles.iconItem}>
                  <CheckCircle2 size={24} />
                  <span className={styles.iconCount}>0</span>
                  <span className={styles.iconLabel}>결재</span>
                </div>

                <div className={styles.iconItem}>
                  <Clock size={24} />
                  <span className={styles.iconCount}>0</span>
                  <span className={styles.iconLabel}>할일</span>
                </div>
              </div>
            </div>
          </div>

          {/* 액세스 버튼 - 가로 배치 */}
          <div className={styles.accessButtonsHorizontal}>
            <button
              className={styles.accessButton}
              onClick={() => setShowOrgModal(true)}
            >
              <Building size={18} />
              <span>책무체계도</span>
            </button>

            <button className={styles.accessButton}>
              <BookOpen size={18} />
              <span>책무기술서</span>
            </button>
          </div>
        </div>

        {/* 중앙 컬럼 */}
        <div className={styles.centerColumn}>
          {/* 책무 현황 (이미지 기반) */}
          <div className={styles.responsibilityFlowNew}>
            <div className={styles.flowHeaderNew}>
              <div className={styles.headerControls}>
                <select className={styles.periodSelect} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <option value="2026년 07월">2026년 07월</option>
                  <option value="2026년 06월">2026년 06월</option>
                </select>
                <select className={styles.positionSelect} value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)}>
                  <option value="대표이사">대표이사</option>
                  <option value="상무">상무</option>
                </select>
              </div>
              <h3>책무 현황</h3>
              <button className={styles.addButton}>+</button>
            </div>

            <div className={styles.flowChartNew}>
              {/* 첫 번째 단계: 책무 */}
              <div className={styles.flowLevel1}>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>책무</span>
                  <span className={styles.cardNumber}>1</span>
                </div>
              </div>
              <div className={styles.verticalArrow}></div>

              {/* 두 번째 단계: 관리의무(CEO) */}
              <div className={styles.flowLevel2}>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>관리의무(CEO)</span>
                  <span className={styles.cardNumber}>2<span className={styles.subNumber}>(2)</span></span>
                </div>
              </div>
              <div className={styles.verticalArrow}></div>

              {/* 세 번째 단계: 이행점검(CEO) */}
              <div className={styles.flowLevel3}>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>이행점검(CEO)</span>
                  <span className={styles.cardNumber}>2<span className={styles.subNumber}>(1)</span></span>
                </div>
              </div>

              {/* 3방향 분기 연결선 */}
              <div className={styles.branchConnectionContainer}>
                <div className={styles.branchMainLine}></div>
                <div className={styles.branchHorizontalLine}></div>
                <div className={styles.branchVerticalLines}>
                  <div className={styles.leftBranchLine}></div>
                  <div className={styles.centerBranchLine}></div>
                  <div className={styles.rightBranchLine}></div>
                </div>
              </div>

              {/* 네 번째 단계: 3방향 분기 */}
              <div className={styles.flowLevel4}>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>미점검(CEO)</span>
                  <span className={styles.cardNumber}>2<span className={styles.subNumber}>(1)</span></span>
                </div>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>적정(CEO)</span>
                  <span className={styles.cardNumberBlue}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>부적절(CEO)</span>
                  <span className={styles.cardNumberRed}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
              </div>

              {/* 하단 2방향 연결선 (적정과 부적절에서) */}
              <div className={styles.bottomConnectionContainer}>
                <div className={styles.centerMainLine}></div>
                <div className={styles.rightMainLine}></div>
                <div className={styles.bottomHorizontalLine}></div>
                <div className={styles.bottomVerticalLines}>
                  <div className={styles.leftBottomLine}></div>
                  <div className={styles.rightBottomLine}></div>
                </div>
              </div>

              {/* 최종 단계: 2개 카드 */}
              <div className={styles.flowLevel5}>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>개선완료(CEO)</span>
                  <span className={styles.cardNumberBlue}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
                <div className={styles.flowCard}>
                  <span className={styles.cardTitle}>개선진행(CEO)</span>
                  <span className={styles.cardNumberRed}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* 차트 섹션 - 가로 배치 */}
          <div className={styles.chartsHorizontal}>
            {/* 이행점검차트 */}
            <div className={styles.chartCard}>
              <h4>이행점검 현황</h4>
              <div className={styles.lineChart}>
                <svg viewBox="0 0 300 120" className={styles.chartSvg}>
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points="20,100 60,60 100,70 140,40 180,50 220,20 260,30"
                  />
                  <circle cx="20" cy="100" r="3" fill="#2563eb" />
                  <circle cx="60" cy="60" r="3" fill="#2563eb" />
                  <circle cx="100" cy="70" r="3" fill="#2563eb" />
                  <circle cx="140" cy="40" r="3" fill="#2563eb" />
                  <circle cx="180" cy="50" r="3" fill="#2563eb" />
                  <circle cx="220" cy="20" r="3" fill="#2563eb" />
                  <circle cx="260" cy="30" r="3" fill="#2563eb" />
                </svg>
              </div>
            </div>

            {/* 배분현황차트 */}
            <div className={styles.chartCard}>
              <h4>배분 현황</h4>
              <div className={styles.pieChart}>
                <svg viewBox="0 0 120 120" className={styles.chartSvg}>
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray="125 125"
                    strokeDashoffset="31.25"
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="60" textAnchor="middle" dy="0.35em" fontSize="14" fill="#374151">
                    75%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 컬럼 */}
        <div className={styles.rightColumn}>
          {/* 뱅가드팀 책무현황 */}
          <div className={styles.vanguardTeamStatus}>
            <h3>뱅가드팀 책무현황</h3>
            <div className={styles.statusBoxesHorizontal}>
              <div className={styles.statusBox}>
                <div className={styles.boxNumber}>9</div>
                <div className={styles.boxLabel}>책무</div>
              </div>

              <div className={styles.statusBox}>
                <div className={styles.boxNumber}>14</div>
                <div className={styles.boxLabel}>관리의무</div>
              </div>

              <div className={styles.statusBox}>
                <div className={styles.boxNumber}>5</div>
                <div className={styles.boxLabel}>이행점검</div>
              </div>

              <div className={`${styles.statusBox} ${styles.highlight}`}>
                <div className={styles.boxNumber}>4</div>
                <div className={styles.boxLabel}>미점검</div>
              </div>

              <div className={`${styles.statusBox} ${styles.danger}`}>
                <div className={styles.boxNumber}>1</div>
                <div className={styles.boxLabel}>부적절</div>
              </div>
            </div>
          </div>

          {/* 책무-관리의무 이행 현황 */}
          <div className={styles.implementationStatusLarge}>
            <h3>책무-관리의무 이행 현황</h3>

            <div className={styles.statusTags}>
              <div className={styles.statusTag}>
                <span className={styles.tagLabel}>적정</span>
                <span className={styles.tagNumber}>0</span>
              </div>
              <div className={styles.statusTag}>
                <span className={styles.tagLabel}>부적절</span>
                <span className={styles.tagNumber}>0</span>
              </div>
              <div className={styles.statusTag}>
                <span className={styles.tagLabel}>적정</span>
                <span className={styles.tagNumber}>0</span>
              </div>
              <div className={styles.statusTag}>
                <span className={styles.tagLabel}>부적절</span>
                <span className={styles.tagNumber}>0</span>
              </div>
            </div>

            <div className={styles.largeChartArea}>
              {/* 큰 차트 영역 */}
              <div className={styles.chartPlaceholder}>
                차트 영역
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 책무체계도 모달 */}
      {renderResponsibilityModal()}
    </div>
  );
};

export default HomeDashboard;
