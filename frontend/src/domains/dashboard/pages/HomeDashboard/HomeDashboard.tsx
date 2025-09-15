/**
 * HomeDashboard - RSMS 책무구조도 이행관리시스템 홈 대시보드
 * 뉴욕 맨하탄 금융센터 전문 UI/UX 디자인 시스템 적용
 * 책무 현황 중심의 깔끔하고 전문적인 인터페이스
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Settings,
  X,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Shield,
  BookOpen,
  Plus,
  ArrowRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import styles from './HomeDashboard.module.scss';
import { ResponsibilityMatrix } from '@/shared/components/organisms/ResponsibilityMatrix';
import { ResponsibilityItem } from '@/shared/components/organisms/ResponsibilityMatrix/ResponsibilityMatrix';

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

const mockResponsibilityData: ResponsibilityItem[] = [
  {
    id: 'R01',
    title: '지침책임자 관련 업무',
    department: '리스크관리부',
    assignee: '김부장',
    priority: 'high',
    status: 'in_progress',
    progress: 75,
    dueDate: '2024-09-20',
    category: '지침책임자'
  },
  {
    id: 'F01', 
    title: '금융업무 관련 업무',
    department: '금융사업부',
    assignee: '이차장',
    priority: 'medium',
    status: 'completed',
    progress: 100,
    dueDate: '2024-09-18',
    category: '금융업무'
  }
];

const HomeDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('2026년 07월');
  const [selectedOrg, setSelectedOrg] = useState('대표이사');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderOrganizationChart = (node: OrganizationNode, level = 0) => {
    return (
      <div key={node.id} className={`${styles.orgNode} ${styles[`level${level}`]}`}>
        <div className={styles.nodeContent}>
          <div className={styles.nodeTitle}>{node.position}</div>
          <div className={styles.nodeCount}>{node.count}</div>
        </div>
        {node.children && (
          <div className={styles.nodeChildren}>
            {node.children.map(child => renderOrganizationChart(child, level + 1))}
          </div>
        )}
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
            <div className={styles.orgChart}>
              {renderOrganizationChart(mockOrgData)}
            </div>
            
            <div className={styles.responsibilityTags}>
              <div className={styles.tagGroup}>
                <h4>지침책임자 관련 (12개)</h4>
                <div className={styles.tags}>
                  {Array.from({length: 12}, (_, i) => (
                    <span key={i} className={`${styles.tag} ${styles.guidance}`}>
                      R{String(i + 1).padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.tagGroup}>
                <h4>금융업무 관련 (23개)</h4>
                <div className={styles.tags}>
                  {Array.from({length: 23}, (_, i) => (
                    <span key={i} className={`${styles.tag} ${styles.financial}`}>
                      F{String(i + 1).padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.tagGroup}>
                <h4>경영관리 관련 (17개)</h4>
                <div className={styles.tags}>
                  {Array.from({length: 17}, (_, i) => (
                    <span key={i} className={`${styles.tag} ${styles.management}`}>
                      M{String(i + 1).padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.tagGroup}>
                <h4>공통 (2개)</h4>
                <div className={styles.tags}>
                  {Array.from({length: 2}, (_, i) => (
                    <span key={i} className={`${styles.tag} ${styles.common}`}>
                      C{String(i + 1).padStart(2, '0')}
                    </span>
                  ))}
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
      {/* 대시보드 헤더 */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.dashboardTitle}>
            <Target size={28} />
            책무구조도 이행관리시스템
          </h1>
          <p className={styles.dashboardSubtitle}>
            {currentTime.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })} • {mockWelcomeData.userName}님 ({mockWelcomeData.department})
          </p>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.periodControl}>
            <Calendar size={16} />
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={styles.periodSelect}
            >
              <option value="2026년 07월">2026년 07월</option>
              <option value="2026년 06월">2026년 06월</option>
              <option value="2026년 05월">2026년 05월</option>
            </select>
          </div>
          
          <div className={styles.orgControl}>
            <Building size={16} />
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className={styles.orgSelect}
            >
              <option value="대표이사">대표이사</option>
              <option value="관리의무">관리의무</option>
            </select>
          </div>
          
          <button 
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
          </button>
        </div>
      </div>

      {/* 메인 대시보드 그리드 */}
      <div className={styles.dashboardGrid}>
        
        {/* 환영 카드 */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeHeader}>
            <div className={styles.welcomeIcon}>
              <Users size={24} />
            </div>
            <div className={styles.welcomeInfo}>
              <h2>반갑습니다! {mockWelcomeData.userName}님</h2>
              <p>{mockWelcomeData.department} • {mockWelcomeData.userId} • 관리자</p>
            </div>
          </div>
          
          <div className={styles.notificationPanel}>
            <div className={styles.notificationItem}>
              <div className={styles.notificationIcon}>
                <Bell size={18} />
              </div>
              <div className={styles.notificationContent}>
                <span className={styles.notificationLabel}>알림</span>
                <span className={styles.notificationValue}>{mockWelcomeData.notifications.alerts}</span>
              </div>
            </div>
            
            <div className={styles.notificationItem}>
              <div className={styles.notificationIcon}>
                <CheckCircle2 size={18} />
              </div>
              <div className={styles.notificationContent}>
                <span className={styles.notificationLabel}>결재</span>
                <span className={styles.notificationValue}>{mockWelcomeData.notifications.approvals}</span>
              </div>
            </div>
            
            <div className={styles.notificationItem}>
              <div className={styles.notificationIcon}>
                <Clock size={18} />
              </div>
              <div className={styles.notificationContent}>
                <span className={styles.notificationLabel}>할일</span>
                <span className={styles.notificationValue}>{mockWelcomeData.notifications.todos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 책무 현황 플로우 차트 */}
        <div className={styles.responsibilityFlow}>
          <div className={styles.cardHeader}>
            <h3>책무 현황</h3>
            <button className={styles.addButton}>
              <Plus size={16} />
            </button>
          </div>
          
          <div className={styles.flowChart}>
            <div className={styles.flowLevel}>
              <div className={styles.flowNode}>
                <div className={styles.nodeLabel}>책무</div>
                <div className={styles.nodeValue}>1</div>
              </div>
            </div>
            
            <div className={styles.flowConnector}>
              <ArrowRight size={20} />
            </div>
            
            <div className={styles.flowLevel}>
              <div className={styles.flowNode}>
                <div className={styles.nodeLabel}>관리의무(CEO)</div>
                <div className={styles.nodeValue}>2(2)</div>
              </div>
            </div>
            
            <div className={styles.flowConnector}>
              <ArrowRight size={20} />
            </div>
            
            <div className={styles.flowLevel}>
              <div className={styles.flowNode}>
                <div className={styles.nodeLabel}>이행점검(CEO)</div>
                <div className={styles.nodeValue}>2(1)</div>
              </div>
            </div>
            
            <div className={styles.flowSplit}>
              <div className={styles.flowConnector}>
                <ArrowRight size={20} />
              </div>
              <div className={styles.flowConnector}>
                <ArrowRight size={20} />
              </div>
              <div className={styles.flowConnector}>
                <ArrowRight size={20} />
              </div>
            </div>
            
            <div className={styles.flowLevel}>
              <div className={styles.flowEndNodes}>
                <div className={styles.flowEndNode}>
                  <div className={styles.nodeLabel}>미점검(CEO)</div>
                  <div className={styles.nodeValue}>2(1)</div>
                </div>
                <div className={styles.flowEndNode}>
                  <div className={styles.nodeLabel}>적정(CEO)</div>
                  <div className={styles.nodeValue}>0(0)</div>
                </div>
                <div className={styles.flowEndNode}>
                  <div className={styles.nodeLabel}>부적절(CEO)</div>
                  <div className={styles.nodeValue}>0(0)</div>
                </div>
              </div>
            </div>
            
            <div className={styles.flowBottom}>
              <div className={styles.flowBottomNodes}>
                <div className={styles.flowBottomNode}>
                  <div className={styles.nodeLabel}>개선완료(CEO)</div>
                  <div className={styles.nodeValue}>0(0)</div>
                </div>
                <div className={styles.flowBottomNode}>
                  <div className={styles.nodeLabel}>개선진행중(CEO)</div>
                  <div className={styles.nodeValue}>0(0)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 팀가드팀 책무현황 */}
        <div className={styles.teamStatusCard}>
          <div className={styles.cardHeader}>
            <h3>팀가드팀 책무현황</h3>
            <button className={styles.viewAllButton}>
              <Eye size={16} />
              전체보기
            </button>
          </div>
          
          <div className={styles.statusGrid}>
            <div className={`${styles.statusItem} ${styles.responsibilities}`}>
              <div className={styles.statusIcon}>
                <Target size={20} />
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusNumber}>{mockResponsibilityStatus.responsibilities}</div>
                <div className={styles.statusLabel}>책무</div>
              </div>
            </div>
            
            <div className={`${styles.statusItem} ${styles.management}`}>
              <div className={styles.statusIcon}>
                <Users size={20} />
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusNumber}>{mockResponsibilityStatus.managementDuties}</div>
                <div className={styles.statusLabel}>관리의무</div>
              </div>
            </div>
            
            <div className={`${styles.statusItem} ${styles.complete}`}>
              <div className={styles.statusIcon}>
                <CheckCircle2 size={20} />
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusNumber}>{mockResponsibilityStatus.inspectionComplete}</div>
                <div className={styles.statusLabel}>이행점검</div>
              </div>
            </div>
            
            <div className={`${styles.statusItem} ${styles.pending}`}>
              <div className={styles.statusIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusNumber}>{mockResponsibilityStatus.inspectionPending}</div>
                <div className={styles.statusLabel}>미점검</div>
              </div>
            </div>
            
            <div className={`${styles.statusItem} ${styles.inappropriate}`}>
              <div className={styles.statusIcon}>
                <AlertTriangle size={20} />
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusNumber}>{mockResponsibilityStatus.inappropriate}</div>
                <div className={styles.statusLabel}>부적절</div>
              </div>
            </div>
          </div>
        </div>

        {/* 책무-관리의무 이행 현황 */}
        <div className={styles.implementationStatus}>
          <div className={styles.cardHeader}>
            <h3>책무-관리의무 이행 현황</h3>
            <div className={styles.headerActions}>
              <button className={styles.filterButton}>
                <Filter size={16} />
              </button>
              <button className={styles.downloadButton}>
                <Download size={16} />
              </button>
            </div>
          </div>
          
          <div className={styles.implementationMatrix}>
            <div className={styles.matrixRow}>
              <div className={styles.matrixCell}>
                <div className={styles.matrixLabel}>적정</div>
                <div className={styles.matrixValue}>0</div>
              </div>
              <div className={styles.matrixCell}>
                <div className={styles.matrixLabel}>부적절</div>
                <div className={styles.matrixValue}>0</div>
              </div>
            </div>
            <div className={styles.matrixRow}>
              <div className={styles.matrixCell}>
                <div className={styles.matrixLabel}>적정</div>
                <div className={styles.matrixValue}>0</div>
              </div>
              <div className={styles.matrixCell}>
                <div className={styles.matrixLabel}>부적절</div>
                <div className={styles.matrixValue}>0</div>
              </div>
            </div>
          </div>
          
          <div className={styles.expandedView}>
            <div className={styles.expandedContent}>
              {/* 상세 매트릭스 표시 영역 */}
            </div>
          </div>
        </div>

        {/* 주요업점별 이행점검 현황 차트 */}
        <div className={styles.complianceChart}>
          <div className={styles.cardHeader}>
            <h3>주요업점별 이행점검 현황</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <div className={styles.legendDot}></div>
                이행률
              </span>
            </div>
          </div>
          
          <div className={styles.chartContainer}>
            <svg className={styles.chartSvg} viewBox="0 0 400 250">
              {/* 그리드 라인 */}
              <defs>
                <pattern id="manhattanGrid" width="50" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 40" fill="none" stroke="rgba(98, 125, 152, 0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#manhattanGrid)" />
              
              {/* Y축 레이블 */}
              {[0, 1, 2, 3, 4].map((y, index) => (
                <g key={index}>
                  <text x="20" y={220 - y * 40} textAnchor="middle" className={styles.axisLabel}>
                    {y}
                  </text>
                  <line x1="35" y1={220 - y * 40} x2="380" y2={220 - y * 40} stroke="rgba(98, 125, 152, 0.1)" strokeWidth="1" />
                </g>
              ))}
              
              {/* X축 레이블 */}
              {mockLineChartData.map((point, index) => (
                <text key={index} x={50 + index * 50} y="240" textAnchor="middle" className={styles.axisLabel}>
                  {index}
                </text>
              ))}
              
              {/* 차트 라인 */}
              <polyline
                fill="none"
                stroke="#102a43"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={mockLineChartData.map((point, index) => 
                  `${50 + index * 50},${220 - point.y * 40}`
                ).join(' ')}
              />
              
              {/* 데이터 포인트 */}
              {mockLineChartData.map((point, index) => (
                <circle
                  key={index}
                  cx={50 + index * 50}
                  cy={220 - point.y * 40}
                  r="4"
                  fill="#102a43"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* 부점별 관리의무 배분 현황 */}
        <div className={styles.distributionChart}>
          <div className={styles.cardHeader}>
            <h3>부점별 관리의무 배분 현황</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <div className={styles.legendDot} style={{backgroundColor: '#627d98'}}></div>
                팀가드팀
              </span>
            </div>
          </div>
          
          <div className={styles.donutContainer}>
            <svg className={styles.donutSvg} viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#627d98"
                strokeWidth="20"
                strokeDasharray="220 220"
                transform="rotate(-90 100 100)"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#334e68"
                strokeWidth="20"
                strokeDasharray="110 330"
                strokeDashoffset="-220"
                transform="rotate(-90 100 100)"
              />
              <text x="100" y="100" textAnchor="middle" dy="0.3em" fontSize="14" fill="#102a43" fontWeight="600">
                팀가드팀
              </text>
            </svg>
          </div>
        </div>

        {/* 퀵 액세스 버튼 */}
        <div className={styles.quickAccessGrid}>
          <button 
            className={`${styles.quickAccessCard} ${styles.responsibilityCard}`}
            onClick={() => setShowOrgModal(true)}
          >
            <div className={styles.quickAccessIcon}>
              <Building size={32} />
            </div>
            <div className={styles.quickAccessContent}>
              <h4>책무체계도</h4>
              <p>책무체계도 클라우드시스템<br />접속 책무체계도 클라우드시스템<br />클릭 후 이동가능</p>
            </div>
          </button>
          
          <button className={`${styles.quickAccessCard} ${styles.specificationCard}`}>
            <div className={styles.quickAccessIcon}>
              <BookOpen size={32} />
            </div>
            <div className={styles.quickAccessContent}>
              <h4>책무기술서</h4>
              <p>책무기술서를 클라우드시스템<br />접속 책무기술서 클라우드시스템<br />클릭 후 이동가능</p>
            </div>
          </button>
        </div>
      </div>

      {/* 책무체계도 모달 */}
      {renderResponsibilityModal()}
    </div>
  );
};

export default HomeDashboard;