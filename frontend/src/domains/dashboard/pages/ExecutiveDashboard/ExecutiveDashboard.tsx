/**
 * Executive Dashboard - 임원 전용 대시보드
 * 뉴욕 맨하탄 금융센터 스타일의 첨단 금융시스템 UI
 * CEO, CRO, 이사급 임원을 위한 프리미엄 대시보드
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  DollarSign,
  Users,
  Building,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RefreshCw,
  Signal
} from 'lucide-react';
import styles from './ExecutiveDashboard.module.scss';

// 임원 대시보드 데이터 타입
interface ExecutiveMetrics {
  totalRisk: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    status: 'critical' | 'warning' | 'good';
  };
  responsibilityCompletion: {
    percentage: number;
    completed: number;
    total: number;
    overdue: number;
  };
  organizationHealth: {
    score: number;
    departments: number;
    activeUsers: number;
    systemUptime: number;
  };
  financialMetrics: {
    revenue: number;
    revenueChange: number;
    costs: number;
    costChange: number;
    profit: number;
    profitChange: number;
  };
}

interface RiskAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  department: string;
  assignee: string;
  dueDate: string;
  description: string;
}

interface ResponsibilityTrend {
  month: string;
  completed: number;
  assigned: number;
  overdue: number;
}

// Mock 데이터
const mockMetrics: ExecutiveMetrics = {
  totalRisk: {
    value: 23,
    change: -12.5,
    trend: 'down',
    status: 'good'
  },
  responsibilityCompletion: {
    percentage: 87.3,
    completed: 142,
    total: 163,
    overdue: 8
  },
  organizationHealth: {
    score: 94.2,
    departments: 12,
    activeUsers: 847,
    systemUptime: 99.8
  },
  financialMetrics: {
    revenue: 2847500000,
    revenueChange: 8.7,
    costs: 1923000000,
    costChange: -3.2,
    profit: 924500000,
    profitChange: 15.3
  }
};

const mockRiskAlerts: RiskAlert[] = [
  {
    id: '1',
    title: '시장리스크 임계치 초과',
    severity: 'critical',
    department: '리스크관리부',
    assignee: '김부장',
    dueDate: '2024-09-16',
    description: 'USD/KRW 환율 변동으로 인한 시장리스크가 임계치를 초과했습니다.'
  },
  {
    id: '2',
    title: '신용등급 재평가 필요',
    severity: 'high',
    department: '신용관리부',
    assignee: '이차장',
    dueDate: '2024-09-18',
    description: '주요 기업고객의 신용등급 재평가가 필요합니다.'
  },
  {
    id: '3',
    title: '준법감시 점검 예정',
    severity: 'medium',
    department: '준법감시부',
    assignee: '박과장',
    dueDate: '2024-09-20',
    description: '금융감독원 정기 점검이 예정되어 있습니다.'
  }
];

const mockTrendData: ResponsibilityTrend[] = [
  { month: 'Jan', completed: 95, assigned: 120, overdue: 5 },
  { month: 'Feb', completed: 108, assigned: 135, overdue: 3 },
  { month: 'Mar', completed: 142, assigned: 163, overdue: 8 },
  { month: 'Apr', completed: 156, assigned: 178, overdue: 4 },
  { month: 'May', completed: 189, assigned: 201, overdue: 2 },
  { month: 'Jun', completed: 203, assigned: 218, overdue: 6 }
];

const ExecutiveDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [metrics, setMetrics] = useState<ExecutiveMetrics>(mockMetrics);
  const [alerts, setAlerts] = useState<RiskAlert[]>(mockRiskAlerts);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 실시간 데이터 시뮬레이션 (실제로는 WebSocket 연결)
  useEffect(() => {
    if (!isRealTimeActive) return;

    const dataUpdateInterval = setInterval(() => {
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        totalRisk: {
          ...prevMetrics.totalRisk,
          value: Math.max(1, prevMetrics.totalRisk.value + (Math.random() - 0.5) * 2),
          change: (Math.random() - 0.5) * 20
        },
        responsibilityCompletion: {
          ...prevMetrics.responsibilityCompletion,
          percentage: Math.min(100, Math.max(0, prevMetrics.responsibilityCompletion.percentage + (Math.random() - 0.5) * 2))
        },
        organizationHealth: {
          ...prevMetrics.organizationHealth,
          score: Math.min(100, Math.max(0, prevMetrics.organizationHealth.score + (Math.random() - 0.5) * 1)),
          activeUsers: prevMetrics.organizationHealth.activeUsers + Math.floor((Math.random() - 0.5) * 10)
        }
      }));
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(dataUpdateInterval);
  }, [isRealTimeActive]);

  // 연결 상태 시뮬레이션
  useEffect(() => {
    const connectionSimulation = setInterval(() => {
      if (Math.random() < 0.05) { // 5% 확률로 연결 상태 변경
        setConnectionStatus(prev => 
          prev === 'connected' ? 'connecting' : 'connected'
        );
      }
    }, 2000);

    return () => clearInterval(connectionSimulation);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatLargeCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}조원`;
    }
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(0)}억원`;
    }
    return formatCurrency(value);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className={styles.criticalIcon} />;
      case 'high': return <AlertTriangle className={styles.highIcon} />;
      case 'medium': return <Clock className={styles.mediumIcon} />;
      default: return <CheckCircle2 className={styles.lowIcon} />;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (change > 0) {
      return <ArrowUpRight className={change > 0 ? styles.positiveIcon : styles.negativeIcon} />;
    } else {
      return <ArrowDownRight className={styles.negativeIcon} />;
    }
  };

  return (
    <div className={styles.executiveDashboard}>
      {/* Executive Header */}
      <div className={styles.executiveHeader}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Executive Dashboard</h1>
          <p className={styles.welcomeSubtitle}>
            {currentTime.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })} {currentTime.toLocaleTimeString('ko-KR')}
          </p>
        </div>

        {/* Real-time Controls */}
        <div className={styles.realtimeControls}>
          <div className={styles.connectionStatus}>
            <div className={`${styles.statusIndicator} ${styles[connectionStatus]}`}>
              {connectionStatus === 'connected' ? (
                <Wifi size={16} />
              ) : connectionStatus === 'connecting' ? (
                <RefreshCw size={16} className={styles.spinning} />
              ) : (
                <WifiOff size={16} />
              )}
              <span className={styles.statusText}>
                {connectionStatus === 'connected' ? '실시간 연결' : 
                 connectionStatus === 'connecting' ? '연결 중' : '연결 끊김'}
              </span>
            </div>
          </div>

          <div className={styles.realtimeToggle}>
            <button 
              className={`${styles.realtimeButton} ${isRealTimeActive ? styles.active : ''}`}
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            >
              {isRealTimeActive ? <Pause size={16} /> : <Play size={16} />}
              <span>{isRealTimeActive ? '실시간 일시정지' : '실시간 시작'}</span>
            </button>
          </div>

          <div className={styles.dataQuality}>
            <Signal size={16} />
            <span className={styles.qualityText}>데이터 품질: 99.7%</span>
          </div>
        </div>
        
        <div className={styles.timeframeSelector}>
          {['today', 'week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              className={`${styles.timeframeButton} ${selectedTimeframe === period ? styles.active : ''}`}
              onClick={() => setSelectedTimeframe(period as any)}
            >
              {period === 'today' ? '오늘' : period === 'week' ? '주간' : period === 'month' ? '월간' : '분기'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className={styles.metricsGrid}>
        {/* Total Risk */}
        <div className={`${styles.metricCard} ${styles.riskCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Shield size={32} />
            </div>
            <div className={styles.cardTitle}>
              <h3>총 리스크 지수</h3>
              <span className={styles.cardSubtitle}>Risk Assessment</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.primaryValue}>
              {Math.round(metrics.totalRisk.value)}
              <span className={styles.unit}>points</span>
              {isRealTimeActive && <div className={styles.liveIndicator} />}
            </div>
            <div className={`${styles.changeIndicator} ${metrics.totalRisk.change > 0 ? styles.up : styles.down}`}>
              {getTrendIcon(metrics.totalRisk.change > 0 ? 'up' : 'down', metrics.totalRisk.change)}
              <span>{Math.abs(Math.round(metrics.totalRisk.change * 10) / 10)}%</span>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span className={`${styles.status} ${styles[metrics.totalRisk.status]}`}>
              {metrics.totalRisk.status === 'good' ? '양호' : 
               metrics.totalRisk.status === 'warning' ? '주의' : '위험'}
            </span>
          </div>
        </div>

        {/* Responsibility Completion */}
        <div className={`${styles.metricCard} ${styles.responsibilityCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <CheckCircle2 size={32} />
            </div>
            <div className={styles.cardTitle}>
              <h3>책무 이행률</h3>
              <span className={styles.cardSubtitle}>Responsibility Completion</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.primaryValue}>
              {Math.round(metrics.responsibilityCompletion.percentage * 10) / 10}
              <span className={styles.unit}>%</span>
              {isRealTimeActive && <div className={styles.liveIndicator} />}
            </div>
            <div className={styles.progressRing}>
              <svg className={styles.progressSvg} viewBox="0 0 100 100">
                <circle
                  className={styles.progressBackground}
                  cx="50"
                  cy="50"
                  r="45"
                  strokeWidth="8"
                />
                <circle
                  className={styles.progressForeground}
                  cx="50"
                  cy="50"
                  r="45"
                  strokeWidth="8"
                  strokeDasharray={`${metrics.responsibilityCompletion.percentage * 2.83} 283`}
                />
              </svg>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span>{metrics.responsibilityCompletion.completed}/{metrics.responsibilityCompletion.total} 완료</span>
            <span className={styles.overdue}>{metrics.responsibilityCompletion.overdue} 지연</span>
          </div>
        </div>

        {/* Organization Health */}
        <div className={`${styles.metricCard} ${styles.healthCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Building size={32} />
            </div>
            <div className={styles.cardTitle}>
              <h3>조직 건전성</h3>
              <span className={styles.cardSubtitle}>Organization Health</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.primaryValue}>
              {Math.round(metrics.organizationHealth.score * 10) / 10}
              <span className={styles.unit}>점</span>
              {isRealTimeActive && <div className={styles.liveIndicator} />}
            </div>
            <div className={styles.healthMetrics}>
              <div className={styles.healthItem}>
                <Users size={16} />
                <span>{Math.max(0, metrics.organizationHealth.activeUsers)}</span>
              </div>
              <div className={styles.healthItem}>
                <Building size={16} />
                <span>{metrics.organizationHealth.departments}개 부서</span>
              </div>
              <div className={styles.healthItem}>
                <Activity size={16} />
                <span>{metrics.organizationHealth.systemUptime}% 가동률</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className={`${styles.metricCard} ${styles.financialCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <DollarSign size={32} />
            </div>
            <div className={styles.cardTitle}>
              <h3>재무 현황</h3>
              <span className={styles.cardSubtitle}>Financial Overview</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.financialGrid}>
              <div className={styles.financialItem}>
                <span className={styles.label}>수익</span>
                <span className={styles.value}>{formatLargeCurrency(mockMetrics.financialMetrics.revenue)}</span>
                <span className={`${styles.change} ${styles.positive}`}>
                  +{mockMetrics.financialMetrics.revenueChange}%
                </span>
              </div>
              <div className={styles.financialItem}>
                <span className={styles.label}>비용</span>
                <span className={styles.value}>{formatLargeCurrency(mockMetrics.financialMetrics.costs)}</span>
                <span className={`${styles.change} ${styles.negative}`}>
                  {mockMetrics.financialMetrics.costChange}%
                </span>
              </div>
              <div className={styles.financialItem}>
                <span className={styles.label}>순이익</span>
                <span className={styles.value}>{formatLargeCurrency(mockMetrics.financialMetrics.profit)}</span>
                <span className={`${styles.change} ${styles.positive}`}>
                  +{mockMetrics.financialMetrics.profitChange}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Section */}
      <div className={styles.alertsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={24} />
            긴급 알림
          </h2>
          <button className={styles.viewAllButton}>
            <Eye size={16} />
            전체 보기
          </button>
        </div>
        
        <div className={styles.alertsList}>
          {mockRiskAlerts.map((alert) => (
            <div key={alert.id} className={`${styles.alertItem} ${styles[alert.severity]}`}>
              <div className={styles.alertIcon}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <h4 className={styles.alertTitle}>{alert.title}</h4>
                  <span className={styles.alertDepartment}>{alert.department}</span>
                </div>
                <p className={styles.alertDescription}>{alert.description}</p>
                <div className={styles.alertFooter}>
                  <span className={styles.alertAssignee}>담당: {alert.assignee}</span>
                  <span className={styles.alertDueDate}>마감: {alert.dueDate}</span>
                </div>
              </div>
              <div className={styles.alertActions}>
                <button className={styles.alertButton}>
                  <Eye size={16} />
                </button>
                <button className={styles.alertButton}>
                  <Settings size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis Section */}
      <div className={styles.trendSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={24} />
            책무 이행률 트렌드 분석
          </h2>
          <div className={styles.chartControls}>
            <button className={styles.chartButton}>
              <BarChart3 size={16} />
              바 차트
            </button>
            <button className={`${styles.chartButton} ${styles.active}`}>
              <Activity size={16} />
              라인 차트
            </button>
          </div>
        </div>
        
        <div className={styles.trendChart}>
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.completed}`}></div>
                  <span>완료</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.assigned}`}></div>
                  <span>할당</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.overdue}`}></div>
                  <span>지연</span>
                </div>
              </div>
              <div className={styles.chartMetrics}>
                <span className={styles.metric}>
                  평균 완료율: <strong>89.3%</strong>
                </span>
                <span className={styles.metric}>
                  전월 대비: <strong className={styles.positive}>+5.2%</strong>
                </span>
              </div>
            </div>
            
            <div className={styles.svgChart}>
              <svg viewBox="0 0 600 300" className={styles.chartSvg}>
                {/* 그리드 라인 */}
                <defs>
                  <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 50" fill="none" stroke={`rgba(98, 125, 152, 0.1)`} strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="600" height="300" fill="url(#grid)" />
                
                {/* Y축 레이블 */}
                {[0, 50, 100, 150, 200, 250].map((y, index) => (
                  <g key={index}>
                    <text x="25" y={280 - y} textAnchor="middle" className={styles.axisLabel}>
                      {250 - y}
                    </text>
                    <line x1="40" y1={280 - y} x2="580" y2={280 - y} stroke="rgba(98, 125, 152, 0.1)" strokeWidth="1" />
                  </g>
                ))}
                
                {/* X축 레이블 */}
                {mockTrendData.map((data, index) => (
                  <text key={index} x={80 + index * 80} y="295" textAnchor="middle" className={styles.axisLabel}>
                    {data.month}
                  </text>
                ))}
                
                {/* 완료 라인 */}
                <polyline
                  fill="none"
                  stroke="#137333"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={mockTrendData.map((data, index) => 
                    `${80 + index * 80},${280 - data.completed}`
                  ).join(' ')}
                />
                
                {/* 할당 라인 */}
                <polyline
                  fill="none"
                  stroke="#1a73e8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={mockTrendData.map((data, index) => 
                    `${80 + index * 80},${280 - data.assigned}`
                  ).join(' ')}
                />
                
                {/* 지연 라인 */}
                <polyline
                  fill="none"
                  stroke="#d93025"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={mockTrendData.map((data, index) => 
                    `${80 + index * 80},${280 - data.overdue * 20}`
                  ).join(' ')}
                />
                
                {/* 데이터 포인트 */}
                {mockTrendData.map((data, index) => (
                  <g key={index}>
                    {/* 완료 포인트 */}
                    <circle
                      cx={80 + index * 80}
                      cy={280 - data.completed}
                      r="4"
                      fill="#137333"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* 할당 포인트 */}
                    <circle
                      cx={80 + index * 80}
                      cy={280 - data.assigned}
                      r="4"
                      fill="#1a73e8"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* 지연 포인트 */}
                    <circle
                      cx={80 + index * 80}
                      cy={280 - data.overdue * 20}
                      r="4"
                      fill="#d93025"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>빠른 액세스</h2>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard}>
            <BarChart3 size={24} />
            <span>상세 분석</span>
          </button>
          <button className={styles.actionCard}>
            <PieChart size={24} />
            <span>리스크 분포</span>
          </button>
          <button className={styles.actionCard}>
            <Users size={24} />
            <span>조직 관리</span>
          </button>
          <button className={styles.actionCard}>
            <Shield size={24} />
            <span>보안 현황</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;