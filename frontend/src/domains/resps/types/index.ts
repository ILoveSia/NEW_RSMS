// 리스크 관리 도메인 - 타입 정의
// 핵심 비즈니스 도메인

// ===== 기본 리스크 엔티티 타입 =====
import { BaseEntity, ID, Timestamp } from '@/shared/types/common';

// 리스크 레벨 및 상태 정의
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'IDENTIFIED' | 'ANALYZED' | 'PLANNING' | 'MITIGATING' | 'MONITORING' | 'CLOSED';
export type RiskCategory = 'TECHNICAL' | 'OPERATIONAL' | 'FINANCIAL' | 'STRATEGIC' | 'COMPLIANCE';

// 리스크 엔티티
export interface Risk extends BaseEntity {
  title: string;
  description: string;
  category: RiskCategory;
  level: RiskLevel;
  status: RiskStatus;
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number; // probability * impact / 100
  
  // 관계 필드
  ownerId: ID;
  assignedToId?: ID;
  projectId?: ID;
  
  // 날짜 필드
  identifiedAt: Timestamp;
  dueDate?: Timestamp;
  closedAt?: Timestamp;
  
  // 추가 메타데이터
  tags: string[];
  attachments?: RiskAttachment[];
}

// 리스크 첨부파일
export interface RiskAttachment extends BaseEntity {
  riskId: ID;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

// ===== 리스크 분석 및 평가 타입 =====

// 리스크 분석 결과
export interface RiskAnalysis extends BaseEntity {
  riskId: ID;
  analysisType: 'QUALITATIVE' | 'QUANTITATIVE';
  methodology: string;
  findings: string;
  recommendations: string;
  
  // 정량적 분석 데이터
  financialImpact?: number;
  timeImpact?: number; // days
  resourceImpact?: number;
  
  // 분석자 정보
  analyzedBy: ID;
  analyzedAt: Timestamp;
  reviewedBy?: ID;
  reviewedAt?: Timestamp;
}

// 리스크 평가 매트릭스
export interface RiskAssessmentMatrix {
  probability: {
    veryLow: number;    // 0-20
    low: number;        // 21-40
    medium: number;     // 41-60
    high: number;       // 61-80
    veryHigh: number;   // 81-100
  };
  impact: {
    negligible: number; // 0-20
    minor: number;      // 21-40
    moderate: number;   // 41-60
    major: number;      // 61-80
    severe: number;     // 81-100
  };
}

// ===== 리스크 대응 및 완화 타입 =====

// 리스크 대응 전략
export type MitigationStrategy = 'AVOID' | 'MITIGATE' | 'TRANSFER' | 'ACCEPT';

// 리스크 대응 계획
export interface RiskMitigationPlan extends BaseEntity {
  riskId: ID;
  strategy: MitigationStrategy;
  description: string;
  actions: RiskAction[];
  
  // 예산 및 자원
  estimatedCost?: number;
  requiredResources?: string[];
  
  // 일정
  startDate?: Timestamp;
  targetDate?: Timestamp;
  
  // 담당자
  responsiblePersonId: ID;
  
  // 효과성 측정
  successCriteria: string[];
  kpiMetrics?: RiskKPI[];
}

// 리스크 대응 액션
export interface RiskAction extends BaseEntity {
  mitigationPlanId: ID;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  
  // 일정
  plannedStartDate?: Timestamp;
  plannedEndDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // 담당자
  assignedToId: ID;
  
  // 진행률
  progressPercentage: number; // 0-100
}

// 리스크 KPI
export interface RiskKPI extends BaseEntity {
  name: string;
  description: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
  measurementFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
}

// ===== 리스크 모니터링 및 보고 타입 =====

// 리스크 모니터링 데이터
export interface RiskMonitoring extends BaseEntity {
  riskId: ID;
  monitoringDate: Timestamp;
  
  // 변경된 메트릭
  currentProbability: number;
  currentImpact: number;
  currentRiskScore: number;
  
  // 상태 변경
  previousStatus: RiskStatus;
  currentStatus: RiskStatus;
  statusChangeReason?: string;
  
  // 모니터링 노트
  observations: string;
  trends: string;
  recommendations: string;
  
  // 모니터링 담당자
  monitoredBy: ID;
  
  // 알림 설정
  alertTriggered: boolean;
  alertReason?: string;
}

// 리스크 보고서
export interface RiskReport extends BaseEntity {
  title: string;
  reportType: 'DASHBOARD' | 'SUMMARY' | 'DETAILED' | 'EXECUTIVE';
  reportPeriod: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  
  // 보고서 내용
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  
  // 메트릭 데이터
  totalRisks: number;
  risksByLevel: Record<RiskLevel, number>;
  risksByStatus: Record<RiskStatus, number>;
  risksByCategory: Record<RiskCategory, number>;
  
  // 트렌드 데이터
  riskTrends: RiskTrendData[];
  
  // 생성 정보
  generatedBy: ID;
  generatedAt: Timestamp;
  approvedBy?: ID;
  approvedAt?: Timestamp;
}

// 리스크 트렌드 데이터
export interface RiskTrendData {
  date: Timestamp;
  totalRisks: number;
  highRisks: number;
  criticalRisks: number;
  closedRisks: number;
  newRisks: number;
}

// ===== API 요청/응답 타입 =====

// 리스크 생성 요청
export interface CreateRiskRequest {
  title: string;
  description: string;
  category: RiskCategory;
  level: RiskLevel;
  probability: number;
  impact: number;
  ownerId: ID;
  assignedToId?: ID;
  projectId?: ID;
  dueDate?: Timestamp;
  tags: string[];
}

// 리스크 수정 요청
export interface UpdateRiskRequest {
  title?: string;
  description?: string;
  category?: RiskCategory;
  level?: RiskLevel;
  status?: RiskStatus;
  probability?: number;
  impact?: number;
  assignedToId?: ID;
  dueDate?: Timestamp;
  tags?: string[];
}

// 리스크 쿼리 파라미터
export interface RiskQueryParams {
  category?: RiskCategory[];
  level?: RiskLevel[];
  status?: RiskStatus[];
  ownerId?: ID;
  assignedToId?: ID;
  projectId?: ID;
  
  // 날짜 범위
  identifiedAfter?: Timestamp;
  identifiedBefore?: Timestamp;
  dueBefore?: Timestamp;
  
  // 검색
  search?: string;
  tags?: string[];
  
  // 정렬
  sortBy?: 'title' | 'level' | 'status' | 'riskScore' | 'identifiedAt' | 'dueDate';
  sortDirection?: 'asc' | 'desc';
}

// 리스크 통계
export interface RiskStatistics {
  totalCount: number;
  byLevel: Record<RiskLevel, number>;
  byStatus: Record<RiskStatus, number>;
  byCategory: Record<RiskCategory, number>;
  
  // 시간대별 통계
  monthlyTrends: Array<{
    month: string;
    newRisks: number;
    closedRisks: number;
    totalRisks: number;
  }>;
  
  // 성과 지표
  averageResolutionTime: number; // days
  riskClosureRate: number; // percentage
  overdueTasks: number;
}

// ===== 리스크 대시보드 타입 =====

// 대시보드 위젯 데이터
export interface RiskDashboardData {
  summary: {
    totalRisks: number;
    criticalRisks: number;
    overdueRisks: number;
    risksTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  };
  
  // 차트 데이터
  riskLevelDistribution: Array<{
    level: RiskLevel;
    count: number;
    percentage: number;
  }>;
  
  riskTrendChart: Array<{
    date: string;
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>;
  
  topRisks: Risk[];
  recentActivities: RiskActivity[];
}

// 리스크 활동 로그
export interface RiskActivity extends BaseEntity {
  riskId: ID;
  activityType: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'COMMENTED' | 'CLOSED';
  description: string;
  performedBy: ID;
  performedAt: Timestamp;
  
  // 변경 세부사항
  changes?: Record<string, {
    before: any;
    after: any;
  }>;
}

// 리스크 알림
export interface RiskNotification extends BaseEntity {
  riskId: ID;
  recipientId: ID;
  notificationType: 'RISK_OVERDUE' | 'RISK_ESCALATED' | 'ACTION_REQUIRED' | 'STATUS_CHANGED';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Timestamp;
}