/**
 * HomeDashboard - RSMS 책무구조도 이행관리시스템 홈 대시보드
 * 뉴욕 맨하탄 금융센터 전문 UI/UX 디자인 시스템 적용
 * 책무 현황 중심의 깔끔하고 전문적인 인터페이스
 */

import { colors } from '@/styles/colors';
import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// 테이블 데이터 구조
const implementationData = {
  '소관업무': [
    { id: 1, title: '내부통제 집행 관리의무', status: '미점검' },
    { id: 2, title: '리스크 관리 운영 업무', status: '적정' },
    { id: 3, title: '감사업무 점검 관리의무', status: '미점검' }
  ],
  '미래성장본부': [
    { id: 4, title: '신규사업 관리의무1', status: '미점검' },
    { id: 5, title: '투자심사 관리의무2', status: '적정' }
  ]
};


const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('2026년 07월');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMainItem, setSelectedMainItem] = useState('소관업무');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 책무 현황 카드 클릭 핸들러
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case '책무':
      case '관리의무':
      case '이행점검':
      case '미점검':
      case '적정':
      case '부적정':
        navigate('/app/compliance/execution-approval');
        break;
      case '개선완료':
      case '개선진행중':
        navigate('/app/improvement/activity-compliance');
        break;
      default:
        console.warn('Unknown card type:', cardType);
    }
  };

  const renderResponsibilityHierarchy = () => {
    return (
      <div className={styles.hierarchyContainer}>
        <div className={styles.hierarchyHeader}>
          <h3>은행 책무체계도</h3>
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

  const renderResponsibilitySpecModal = () => {
    if (!showSpecModal) return null;

    return (
      <div className={styles.modalOverlay} onClick={() => setShowSpecModal(false)}>
        <div className={styles.specModalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.specModalHeader}>
            <h2>책무기술서 인쇄</h2>
            <div className={styles.headerActions}>
              <button className={styles.printButton}>인쇄</button>
              <button className={styles.closeButton} onClick={() => setShowSpecModal(false)}>
                <X size={24} />
              </button>
            </div>
          </div>

          <div className={styles.specModalBody}>
            <div className={styles.specFormContainer}>
              {/* 제목 */}
              <div className={styles.specTitle}>
                <h1>임원별 책무기술서</h1>
              </div>

              {/* 1. 임원 및 직책 정보 */}
              <div className={styles.specSection}>
                <h3>1. 임원 및 직책 정보</h3>
                <div className={styles.specTable}>
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabel}>직책</div>
                    <div className={styles.tableValue}>성명</div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabel}>직위</div>
                    <div className={styles.tableValue}>
                      현직책 부여일<br />
                      (임원 선임일 등)
                    </div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabel}>감직여부</div>
                    <div className={styles.tableValue}>감직사항</div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabel}>소관부서</div>
                    <div className={styles.tableValue}></div>
                  </div>
                  <div className={styles.tableRow}>
                    <div className={styles.tableLabel}>주관회의체</div>
                    <div className={styles.tableValueGrid}>
                      <div>회의체명</div>
                      <div>위원장/위원</div>
                      <div>개최주기</div>
                      <div>주요심의 · 의결사항</div>
                    </div>
                  </div>
                </div>

                <div className={styles.specTextArea}>
                  <div className={styles.textAreaLabel}>직무대행자</div>
                  <div className={styles.textAreaContent}></div>
                </div>
              </div>

              {/* 2. 책무 */}
              <div className={styles.specSection}>
                <h3>2. 책무</h3>
                <div className={styles.responsibilityTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.headerCell}>책무개요 <span className={styles.badgeBlue}>R1</span></div>
                    <div className={styles.headerCell}>책무 배분원자 <span className={styles.badgeBlue}>R2</span></div>
                  </div>
                  <div className={styles.tableContent}>
                    <div className={styles.contentArea}></div>
                  </div>

                  <div className={styles.subResponsibilityHeader}>책무 내용</div>
                  <div className={styles.subResponsibilityTable}>
                    <div className={styles.subTableHeader}>
                      <div>책무 <span className={styles.badgeBlue}>R3</span></div>
                      <div>책무 세부내용 <span className={styles.badgeBlue}>R4</span></div>
                      <div>관련 법령 및 내규 <span className={styles.badgeBlue}>R5</span></div>
                    </div>
                    <div className={styles.subTableContent}>
                      <div className={styles.noItemsMessage}>No items found</div>
                    </div>
                  </div>

                  {/* 책무 설명 */}
                  <div className={styles.responsibilityExplanations}>
                    <div className={styles.explanationItem}>
                      <span className={styles.badgeBlue}>R1</span>
                      <span>책무개요 : 영 [별표1] 제2조의 경우 고객, 금융상품, 판매채널, 담당지역 등의 구분기준에 따른 개요를 기재하고 영 [별표1] · 3호의 업무유형의 경우 책무의 내용을 요약하여 기재 </span>
                    </div>
                    <div className={styles.explanationItem}>
                      <span className={styles.badgeBlue}>R2</span>
                      <span>책무 배분일자 : 임원의 직책 변경, 책무의 추가 · 변경 등에 따른 현 책무의 배분일자 기재</span>
                    </div>
                    <div className={styles.explanationItem}>
                      <span className={styles.badgeBlue}>R3</span>
                      <span>책무 : 영 [별표1.에 기재된 각 항목의 책무를 참고하여 기재 (각 금융화사별 조직, 업무특성, 업무범위 등을 고려하여 세분 · 병합, 추가 등 조정 가능)])</span>
                    </div>
                    <div className={styles.explanationItem}>
                      <span className={styles.badgeBlue}>R4</span>
                      <span>책무 세부내용 : 소관책무와 관련하여 임원이 수행 · 운영 · 결정하거나 관리 · 감독할 책임으로서 책임 등 책무의 세부 내용을 기재 (법 제30조2 및 제30조의4 등에서 규정하는 관라의무 등 책임을 수행하는 방범을 기재하는 것이 아님에 유의)하여, 동일 업무와 관련된 책임이 다른 임원과 분할되어 있는 등 제한 또는 한정된 책임을 부담하는 경우 그 제한 또는 한정된 내용을 명확히 설명할 것(예:기업고객 관련 업무에 한함)</span>
                    </div>
                    <div className={styles.explanationItem}>
                      <span className={styles.badgeBlue}>R5</span>
                      <span>관련 법령 및 내규 : 책무의 근거, 내용, 업무수행의 기준 등과 관려된 법령명 및 내규명 기재</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 책무 이행을 위한 주요 관리의무 */}
              <div className={styles.specSection}>
                <h3>3. 책무 이행을 위한 주요 관리의무 <span className={styles.badgeBlue}>R1</span></h3>
                <div className={styles.dutyTextArea}>
                  <div className={styles.textAreaContent}></div>
                </div>

                <div className={styles.dutyExplanation}>
                  <span className={styles.badgeBlue}>R1</span>
                  <span>책무 이행을 위한 주요 관리의무 : 2. 책무와 관련하여 법 제30조의2 및 제30조의4 등에 따라 부담하는 주요 관리 · 총괄의무 (이하 관리의무등) 이라 한다 의 내용의 기재</span>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className={styles.specFooter}>
                <button className={styles.saveButton}>저장</button>
                <button className={styles.printFooterButton}>인쇄</button>
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
        <div className={styles.newModalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.newModalHeader}>
            <h2>책무체계도</h2>
            <button className={styles.closeButton} onClick={() => setShowOrgModal(false)}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.newModalBody}>
            {/* 왼쪽: 광주은행 책무체계도 */}
            <div className={styles.orgChartSection}>
              <div className={styles.orgChartHeader}>
                <div className={styles.bankLogo}>
                  <img
                    src="/src/assets/images/itcen.jpg"
                    alt="ITCEN ENTEC Logo"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.chartTitle}>
                  <h3>ITCEN <span className={styles.entecBlue}>ENTEC</span> 책무체계도</h3>
                  <p>책무구조도 대상 임원은 총 16명이며, 내부통제 책무유형에 따라 책무기술서를 작성하고, 내부통제 책임관리 및 변경관리를 수행합니다.</p>
                  <div className={styles.baseDate}>기준일: 2024-12-30</div>
                </div>
              </div>

              {/* 범례 */}
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendColor} ${styles.guidance}`}>R</span>
                  <span>지정책임자 관련 책무</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendColor} ${styles.financial}`}>F</span>
                  <span>금융영업 관련 책무</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendColor} ${styles.management}`}>M</span>
                  <span>경영관리 관련 책무</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendColor} ${styles.common}`}>C</span>
                  <span>공통책무</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendLine}>—</span>
                  <span>보고체계</span>
                </div>
              </div>

              {/* 조직도 */}
              <div className={styles.newOrgChart}>
                {/* 최상위: CEO */}
                <div className={styles.topLevel}>
                  <div className={styles.orgNode}>
                    <div className={styles.nodeContent}>
                      <div className={styles.nodePosition}>대표이사(CEO)</div>
                      <div className={styles.nodeName}>김정식</div>
                      <div className={styles.nodeDate}>2025-01-01</div>
                      <div className={styles.nodeTags}>
                        <span className={`${styles.tag} ${styles.guidance}`}>R01</span>
                      </div>
                    </div>
                  </div>
                </div>


                {/* 임원영역 */}
                <div className={styles.executiveSection}>
                  <h4 className={styles.sectionTitle}>임원영역</h4>
                  <div className={styles.executiveLevel}>
                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>이사회의장</div>
                        <div className={styles.nodeName}>김경식</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>상임감사위원</div>
                        <div className={styles.nodeName}>윤창의</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R05</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R06</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>이사회사무국장</div>
                        <div className={styles.nodeName}>박착진</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R01</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>은행장CEO</div>
                        <div className={styles.nodeName}>고병일</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R01</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R06</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R08</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>준법감시인</div>
                        <div className={styles.nodeName}>김우진</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R04</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R05</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 본부장영역 */}
                <div className={styles.managerSection}>
                  <h4 className={styles.sectionTitle}>본부장영역</h4>
                  <div className={styles.managerLevel}>
                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>영업전략본부장</div>
                        <div className={styles.nodeName}>정일선</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.financial}`}>F01</span>
                          <span className={`${styles.tag} ${styles.financial}`}>F02</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>투자금융본부장</div>
                        <div className={styles.nodeName}>임형수</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.financial}`}>F07</span>
                          <span className={`${styles.tag} ${styles.financial}`}>F08</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>디지털본부장</div>
                        <div className={styles.nodeName}>변미경</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.management}`}>M11</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>여신지원본부장</div>
                        <div className={styles.nodeName}>박성우</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.financial}`}>F01</span>
                          <span className={`${styles.tag} ${styles.financial}`}>F02</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>경영지원본부장,신탁본부장</div>
                        <div className={styles.nodeName}>임양진</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.management}`}>M01</span>
                          <span className={`${styles.tag} ${styles.financial}`}>F11</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>IT본부장</div>
                        <div className={styles.nodeName}>변동하</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.management}`}>M11</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R07</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>리스크컴플라이언스책임자</div>
                        <div className={styles.nodeName}>김종택</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R03</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R04</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>금융소비자보호총괄책임자</div>
                        <div className={styles.nodeName}>김은호</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R09</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orgNode}>
                      <div className={styles.nodeContent}>
                        <div className={styles.nodePosition}>정보보호최고책임자</div>
                        <div className={styles.nodeName}>이상제</div>
                        <div className={styles.nodeDate}>2025-01-01</div>
                        <div className={styles.nodeTags}>
                          <span className={`${styles.tag} ${styles.guidance}`}>R07</span>
                          <span className={`${styles.tag} ${styles.guidance}`}>R08</span>
                          <span className={`${styles.tag} ${styles.common}`}>C01</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            {/* 오른쪽: 책무 태그 목록 */}
            <div className={styles.responsibilityTagsSection}>
              <div className={styles.tagGroup}>
                <h4 className={styles.tagGroupTitle}>지정책임자 관련 책무(12)</h4>
                <div className={styles.tagList}>
                  {['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12'].map(code => (
                    <div key={code} className={`${styles.tagItem} ${styles.guidance}`}>
                      <span className={styles.tagCode}>{code}</span>
                      <span className={styles.tagDesc}>
                        {code === 'R01' && '책무구조도의 마련 · 관리업무와 관련된 책무'}
                        {code === 'R02' && '내부감사업무의 관련된 책무'}
                        {code === 'R03' && '위험관리업무의 관련된 책무'}
                        {code === 'R04' && '준법관리업무의 관련된 책무'}
                        {code === 'R05' && '자금세탁방지업무의 관련된 책무'}
                        {code === 'R06' && '내부회계업무의 관련된 책무'}
                        {code === 'R07' && '정보보호업무의 관련된 책무'}
                        {code === 'R08' && '개인 · 신용 · 고객정보 보호업무의 관련된 책무'}
                        {code === 'R09' && '금융소비자보호의 관련된 책무'}
                        {code === 'R10' && '내부통제와 관련 총괄 책무'}
                        {code === 'R11' && '내부통제업무와 관련된 책무'}
                        {code === 'R12' && '전기통신금융사기 피해방지 및 피해금 환급업무와 관련된 책무'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.tagGroup}>
                <h4 className={styles.tagGroupTitle}>금융영업 관련 책무(23)</h4>
                <div className={styles.tagList}>
                  {['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23'].map(code => (
                    <div key={code} className={`${styles.tagItem} ${styles.financial}`}>
                      <span className={styles.tagCode}>{code}</span>
                      <span className={styles.tagDesc}>
                        {code === 'F01' && '여신업무에 관한 책무'}
                        {code === 'F02' && '여신 대위해산 및 지보(시보경리) 업'}
                        {code === 'F03' && '신신보증금 관련 책무일부 보리멸랐경'}
                        {code === 'F04' && '수신업무 관련한 관련한 책무'}
                        {code === 'F05' && '유가증권 및 그 외의 부유동업무는 관련한 책무'}
                        {code === 'F06' && '제증업무 : 지급결제업무의 관련한 책무'}
                        {code === 'F07' && '투자해외업무(투자금유통 소유의) 관련한 책무'}
                        {code === 'F08' && '투자해외업무(시호사업 소유의) 관련한 책무'}
                        {code === 'F09' && '용사술당법업무(종합멘터소업의 관련한 책무'}
                        {code === 'F10' && '자본식업무운영업무(ISA)의 관련한 책무'}
                        {code === 'F11' && '신탁업무의 관련한 책무'}
                        {code === 'F12' && '모든성업의 병질정의심체업무의 관련 책무'}
                        {code === 'F13' && '기업인출 관련한 책무'}
                        {code === 'F14' && '천신골융업무의 관련한 책무'}
                        {code === 'F15' && '억산저출료만정상 관련한 책무'}
                        {code === 'F16' && '수단실출혈어 관련한실일간의 관련한 책무'}
                        {code === 'F17' && '한국사어업무(시주료사오) 관련한 책무'}
                        {code === 'F18' && '기광람 관련시 관련한 책무'}
                        {code === 'F19' && '자라평간원의 관련한 책무'}
                        {code === 'F20' && '투자육 관련 지소결업습의 관련한 책무'}
                        {code === 'F21' && '고객식상의 관련한 책무'}
                        {code === 'F22' && '회전인 기본 및 등관의 관련한 책무'}
                        {code === 'F23' && '개인의출사상(만화ENISA) 관련한 책무'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.tagGroup}>
                <h4 className={styles.tagGroupTitle}>경영관리 관련 책무(17)</h4>
                <div className={styles.tagList}>
                  {['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17'].map(code => (
                    <div key={code} className={`${styles.tagItem} ${styles.management}`}>
                      <span className={styles.tagCode}>{code}</span>
                      <span className={styles.tagDesc}>
                        {code === 'M01' && '경영업무 관련 책무'}
                        {code === 'M02' && '인사업무의 관련한 책무'}
                        {code === 'M03' && '보수업무의 관련한 책무'}
                        {code === 'M04' && '채무업무 관련한 책무'}
                        {code === 'M05' && '공시업무동국의 및 정기사신 관련하'}
                        {code === 'M06' && '제변업무생된 남서권사의 관련한 책무'}
                        {code === 'M07' && '통감업무의 관련한 책무'}
                        {code === 'M08' && '저세업 경마식(김과김관리) 관련한 책무'}
                        {code === 'M09' && '청부업무의 관련한 책무'}
                        {code === 'M10' && '진영업무 및 리렌제용 관련하법의 책무'}
                        {code === 'M11' && '정산서스템 운영 · 관리담당와 관련한 책무'}
                        {code === 'M12' && '차일건서비슬 관련한 책무'}
                        {code === 'M13' && '총무업무의 관련한 책무'}
                        {code === 'M14' && '안전업무의 관련한 책무'}
                        {code === 'M15' && '안연업 및 보안결관리법의 관련한 책무'}
                        {code === 'M16' && '제기결업중의 관련한 책무'}
                        {code === 'M17' && '공시업무(여러투자지 옳지 관련하실 책무'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.tagGroup}>
                <h4 className={styles.tagGroupTitle}>공통 책무(2)</h4>
                <div className={styles.tagList}>
                  <div className={`${styles.tagItem} ${styles.common}`}>
                    <span className={styles.tagCode}>C01</span>
                    <span className={styles.tagDesc}>소관 업무 · 조직의 내부통제 등 집행 및 운영</span>
                  </div>
                  <div className={`${styles.tagItem} ${styles.common}`}>
                    <span className={styles.tagCode}>C02</span>
                    <span className={styles.tagDesc}>소관 업무위원의 업무 및 운영뜻관리법의 관련한 책무</span>
                  </div>
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
              className={`${styles.accessButton} ${styles.responsibilitySystem}`}
              onClick={() => setShowOrgModal(true)}
            >
              <div className={styles.buttonContent}>
                <Users size={24} className={styles.buttonIcon} />
                <div className={styles.buttonText}>
                  <span className={styles.buttonTitle}>책무체계도</span>
                  <span className={styles.buttonDescription}>
                    책무체계도를 클릭하셔서<br />
                    전체 책무체계도를 크게<br />
                    볼 수 있어요!
                  </span>
                </div>
              </div>
            </button>

            <button
              className={`${styles.accessButton} ${styles.responsibilitySpec}`}
              onClick={() => navigate('/app/resps/responsibilitydocmgmt')}
            >
              <div className={styles.buttonContent}>
                <FileText size={24} className={styles.buttonIcon} />
                <div className={styles.buttonText}>
                  <span className={styles.buttonTitle}>책무기술서</span>
                  <span className={styles.buttonDescription}>
                    책무기술서를 클릭하셔서<br />
                    책무기술서 관리 페이지로<br />
                    이동할 수 있어요!
                  </span>
                </div>
              </div>
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
              </div>
              <h3 className={styles.centerTitle}>책무 현황</h3>
              <button className={styles.addButton}>+</button>
            </div>

            <div className={styles.flowChartNew}>
              {/* 첫 번째 단계: 책무 */}
              <div className={styles.flowLevel1}>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('책무')}
                >
                  <span className={styles.cardTitle}>책무</span>
                  <span className={styles.cardNumber}>1</span>
                </div>
              </div>
              <div className={styles.verticalArrow}></div>

              {/* 두 번째 단계: 관리의무(CEO) */}
              <div className={styles.flowLevel2}>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('관리의무')}
                >
                  <span className={styles.cardTitle}>관리의무</span>
                  <span className={styles.cardNumber}>2<span className={styles.subNumber}>(2)</span></span>
                </div>
              </div>
              <div className={styles.verticalArrow}></div>

              {/* 세 번째 단계: 이행점검(CEO) */}
              <div className={styles.flowLevel3}>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('이행점검')}
                >
                  <span className={styles.cardTitle}>이행점검</span>
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
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('미점검')}
                >
                  <span className={styles.cardTitle}>미점검</span>
                  <span className={styles.cardNumber}>2<span className={styles.subNumber}>(1)</span></span>
                </div>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('적정')}
                >
                  <span className={styles.cardTitle}>적정</span>
                  <span className={styles.cardNumberBlue}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('부적정')}
                >
                  <span className={styles.cardTitle}>부적정</span>
                  <span className={styles.cardNumberRed}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
              </div>

              {/* 부적정에서 나오는 연결선 */}
              <div className={styles.inadequateConnectionContainer}>
                <div className={styles.inadequateMainLine}></div>
                <div className={styles.inadequateHorizontalLine}></div>
                <div className={styles.inadequateVerticalLines}>
                  <div className={styles.inadequateLeftLine}></div>
                  <div className={styles.inadequateRightLine}></div>
                </div>
              </div>

              {/* 부적정 아래 2개 카드 (양옆 배치) */}
              <div className={styles.flowLevel5Inadequate}>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('개선완료')}
                >
                  <span className={styles.cardTitle}>개선완료</span>
                  <span className={styles.cardNumberBlue}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
                <div
                  className={`${styles.flowCard} ${styles.clickable}`}
                  onClick={() => handleCardClick('개선진행중')}
                >
                  <span className={styles.cardTitle}>개선진행중</span>
                  <span className={styles.cardNumber}>0<span className={styles.subNumber}>(0)</span></span>
                </div>
              </div>





            </div>
          </div>

          {/* 차트 섹션 - 가로 배치 */}
          <div className={styles.chartsHorizontal}>
            {/* 이행점검차트 */}
            <div className={styles.chartCard}>
              <h4>주요부점별 이행점검 현황</h4>
              <div className={styles.lineChart}>
                <svg viewBox="0 0 300 120" className={styles.chartSvg}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={colors.primary600} />
                      <stop offset="50%" stopColor={colors.primary500} />
                      <stop offset="100%" stopColor={colors.primary400} />
                    </linearGradient>
                    <radialGradient id="pointGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={colors.primary500} />
                      <stop offset="70%" stopColor={colors.primary600} />
                      <stop offset="100%" stopColor={colors.primary700} />
                    </radialGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    points="20,100 60,60 100,70 140,40 180,50 220,20 260,30"
                  />
                  <circle cx="20" cy="100" r="4" fill="url(#pointGradient)" />
                  <circle cx="60" cy="60" r="4" fill="url(#pointGradient)" />
                  <circle cx="100" cy="70" r="4" fill="url(#pointGradient)" />
                  <circle cx="140" cy="40" r="4" fill="url(#pointGradient)" />
                  <circle cx="180" cy="50" r="4" fill="url(#pointGradient)" />
                  <circle cx="220" cy="20" r="4" fill="url(#pointGradient)" />
                  <circle cx="260" cy="30" r="4" fill="url(#pointGradient)" />
                </svg>
              </div>
            </div>

            {/* 배분현황차트 */}
            <div className={styles.chartCard}>
              <h4>부점별 배분 현황</h4>
              <div className={styles.pieChart}>
                <svg viewBox="0 0 120 120" className={styles.chartSvg}>
                  <defs>
                    <linearGradient id="pieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors.primary400} />
                      <stop offset="50%" stopColor={colors.primary500} />
                      <stop offset="100%" stopColor={colors.primary600} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke={colors.borderDefault}
                    strokeWidth="16"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="url(#pieGradient)"
                    strokeWidth="16"
                    strokeDasharray="125 125"
                    strokeDashoffset="31.25"
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="60" textAnchor="middle" dy="0.35em" fontSize="16" fontWeight="700" fill={colors.primary700}>
                    75%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 컬럼 */}
        <div className={styles.rightColumn}>
          {/* ITCEN ENTEC 책무현황 */}
          <div className={styles.vanguardTeamStatus}>
            <h3>준법감시인 책무현황</h3>
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
                <span className={styles.tagLabel}>부적정</span>
                <span className={styles.tagNumber}>0</span>
              </div>
              <div className={styles.statusTag}>
                <span className={styles.tagLabel}>적정</span>
                <span className={styles.tagNumber}>0</span>
              </div>
              <div className={styles.statusTag}>
                <span className={styles.tagLabel}>부적정</span>
                <span className={styles.tagNumber}>0</span>
              </div>
            </div>

            {/* 2개 카드 테이블 구조 */}
            <div className={styles.implementationTable}>
              <div className={styles.tableRow}>
                {/* 왼쪽: 메인 항목 선택 */}
                <div className={styles.leftSection}>
                  <div
                    className={`${styles.mainCard} ${selectedMainItem === '소관업무' ? styles.selected : ''}`}
                    onClick={() => setSelectedMainItem('소관업무')}
                  >
                    <div className={styles.cardContent}>
                      <p className={styles.cardTitle}>
                        소관 업무·조직의 내부통제 등 집행 및 운영과 관련된 책무
                      </p>
                      <button className={`${styles.statusButton} ${selectedMainItem === '소관업무' ? styles.selected : ''}`}>
                        미점검
                      </button>
                    </div>
                  </div>

                  <div
                    className={`${styles.mainCard} ${selectedMainItem === '미래성장본부' ? styles.selected : ''}`}
                    onClick={() => setSelectedMainItem('미래성장본부')}
                  >
                    <div className={styles.cardContent}>
                      <p className={styles.cardTitle}>
                        미래성장본부 예시 책무 공통 관리의무1
                      </p>
                      <button className={`${styles.statusButton} ${selectedMainItem === '미래성장본부' ? styles.selected : ''}`}>
                        미점검
                      </button>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 선택된 항목의 하위 항목들 */}
                <div className={styles.rightSection}>
                  {implementationData[selectedMainItem as keyof typeof implementationData]?.map((item) => (
                    <div key={item.id} className={styles.subCard}>
                      <div className={styles.cardContent}>
                        <p className={styles.cardTitle}>
                          {item.title}
                        </p>
                        <button className={`${styles.statusButton} ${item.status === '적정' ? styles.success : ''}`}>
                          {item.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 책무체계도 모달 */}
      {renderResponsibilityModal()}

      {/* 책무기술서 모달 */}
      {renderResponsibilitySpecModal()}
    </div>
  );
};

export default HomeDashboard;
