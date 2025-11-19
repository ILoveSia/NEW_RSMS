/**
 * 이행점검 보고서 개선이행 관련 타입 정의
 * 요구사항 문서: docs/rdd_docs/05/02.책무구조도_개선이행_이행점검보고서개선이행_요구사항정의서.md
 */

// 보고서 개선이행 상태
export type ReportImprovementStatus =
  | 'IDENTIFIED'    // 식별
  | 'REQUESTED'     // 요청
  | 'PLANNING'      // 계획수립
  | 'APPROVED'      // 승인완료
  | 'IN_PROGRESS'   // 진행중
  | 'COMPLETED'     // 완료
  | 'VERIFIED'      // 검증완료
  | 'CLOSED';       // 종료

// 보고서 품질 등급
export type ReportQualityGrade =
  | 'EXCELLENT'     // 우수
  | 'GOOD'          // 양호
  | 'FAIR'          // 보통
  | 'POOR'          // 미흡
  | 'INADEQUATE';   // 부적정

// 개선 효과성 등급
export type ImprovementEffectivenessGrade =
  | 'VERY_HIGH'     // 매우높음
  | 'HIGH'          // 높음
  | 'MEDIUM'        // 보통
  | 'LOW'           // 낮음
  | 'MINIMAL';      // 최소

// 우선순위
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

// 보고서 개선이행 메인 타입
export interface ReportImprovement {
  id: string;
  sequence: number;                              // 순번
  department: string;                            // 부서
  departmentCode?: string;                       // 부품코드
  inspectionName: string;                        // 점검명
  inspectionRound?: string;                      // 점검회차
  requestDate: string;                           // 개선요청일자
  requester: string;                             // 개선요청자
  requesterPosition?: string;                    // 요청자 직책
  status: ReportImprovementStatus;               // 진행상태
  result?: string;                               // 개선결과

  // 추가 상세 정보
  reportId?: string;                             // 보고서 ID
  reportTitle?: string;                          // 보고서 제목
  inadequateContent?: string;                    // 부적정 내용
  improvementPlan?: string;                      // 개선계획
  improvementContent?: string;                   // 개선내용
  improvementDate?: string;                      // 개선일자
  verificationDate?: string;                     // 검증일자
  verifier?: string;                             // 검증자
  closedDate?: string;                           // 종료일자

  // 품질 및 효과성
  beforeQualityGrade?: ReportQualityGrade;       // 개선전 품질등급
  afterQualityGrade?: ReportQualityGrade;        // 개선후 품질등급
  effectivenessGrade?: ImprovementEffectivenessGrade; // 효과성 등급
  effectivenessScore?: number;                   // 효과성 점수

  // 관리 정보
  priority?: Priority;                           // 우선순위
  dueDate?: string;                             // 완료예정일
  actualCompletionDate?: string;                // 실제완료일
  delayDays?: number;                           // 지연일수
  assignee?: string;                            // 담당자
  assigneePosition?: string;                    // 담당자 직책

  // 첨부파일 및 증빙
  attachments?: string[];                       // 첨부파일
  evidenceFiles?: string[];                     // 증빙자료

  // 감사 정보
  createdAt?: string;                           // 생성일시
  createdBy?: string;                           // 생성자
  updatedAt?: string;                           // 수정일시
  updatedBy?: string;                           // 수정자

  // 알림 및 워크플로우
  notificationSent?: boolean;                   // 알림발송여부
  approvalRequired?: boolean;                   // 승인필요여부
  approvedBy?: string;                          // 승인자
  approvedAt?: string;                          // 승인일시
}

// 검색 필터 타입
export interface ReportImprovementFilters {
  inspectionName: string;                       // 점검명
  branchCode: string;                          // 부서코드
  requestDateFrom: string;                     // 개선요청시작일자
  requestDateTo: string;                       // 개선요청종료일자
  status: string;                              // 진행상태
  priority?: string;                           // 우선순위
  assignee?: string;                           // 담당자
  inspectionRound?: string;                    // 점검회차
}

// 폼 데이터 타입 (등록/수정용)
export interface ReportImprovementFormData {
  department: string;                          // 부서
  departmentCode?: string;                     // 부품코드
  inspectionName: string;                      // 점검명
  inspectionRound?: string;                    // 점검회차
  requestDate: string;                         // 개선요청일자
  requester: string;                           // 개선요청자
  requesterPosition?: string;                  // 요청자 직책

  reportId?: string;                           // 보고서 ID
  reportTitle?: string;                        // 보고서 제목
  inadequateContent?: string;                  // 부적정 내용
  improvementPlan: string;                     // 개선계획
  improvementContent?: string;                 // 개선내용

  priority?: Priority;                         // 우선순위
  dueDate?: string;                           // 완료예정일
  assignee?: string;                          // 담당자
  assigneePosition?: string;                  // 담당자 직책

  attachments?: string[];                     // 첨부파일
  evidenceFiles?: string[];                   // 증빙자료
}

// 페이지네이션 타입
export interface ReportImprovementPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 모달 상태 타입
export interface ReportImprovementModalState {
  addModal: boolean;
  detailModal: boolean;
  planModal: boolean;                         // 계획수립 모달
  progressModal: boolean;                     // 진행현황 모달
  verificationModal: boolean;                 // 검증 모달
  effectivenessModal: boolean;                // 효과성 평가 모달
  selectedItem: ReportImprovement | null;
}

// API 응답 타입
export interface ReportImprovementListResponse {
  content: ReportImprovement[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 통계 정보 타입
export interface ReportImprovementStatistics {
  total: number;                              // 전체 건수
  identifiedCount: number;                    // 식별 건수
  requestedCount: number;                     // 요청 건수
  planningCount: number;                      // 계획수립 건수
  approvedCount: number;                      // 승인완료 건수
  inProgressCount: number;                    // 진행중 건수
  completedCount: number;                     // 완료 건수
  verifiedCount: number;                      // 검증완료 건수
  closedCount: number;                        // 종료 건수

  // 지연 및 효과성 통계
  delayedCount: number;                       // 지연 건수
  averageCompletionDays: number;              // 평균 완료일수
  averageEffectivenessScore: number;          // 평균 효과성 점수

  // 품질 개선 통계
  qualityImprovementRate: number;             // 품질 개선율
  inadequateReductionRate: number;            // 부적정 감소율
}

// 효과성 평가 데이터 타입
export interface EffectivenessEvaluation {
  id: string;
  reportImprovementId: string;                // 개선이행 ID
  evaluationDate: string;                     // 평가일자
  evaluator: string;                          // 평가자

  // 평가 지표
  qualityImprovement: number;                 // 품질 개선도 (1-10)
  processEfficiency: number;                  // 프로세스 효율성 (1-10)
  costEffectiveness: number;                  // 비용 효과성 (1-10)
  sustainabilityScore: number;                // 지속가능성 (1-10)

  // 종합 평가
  overallScore: number;                       // 종합 점수
  effectivenessGrade: ImprovementEffectivenessGrade; // 효과성 등급

  recommendations?: string;                   // 권고사항
  lessonsLearned?: string;                   // 교훈사항
  nextSteps?: string;                        // 향후 조치
}

// 드롭다운 옵션 타입들
export interface SelectOption {
  value: string;
  label: string;
}

// 점검명 옵션
export const INSPECTION_NAME_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'Q1_2024', label: '2024년 1분기 점검' },
  { value: 'Q2_2024', label: '2024년 2분기 점검' },
  { value: 'Q3_2024', label: '2024년 3분기 점검' },
  { value: 'Q4_2024', label: '2024년 4분기 점검' },
  { value: 'ANNUAL_2024', label: '2024년 연간 점검' },
  { value: 'SPECIAL_AUDIT', label: '특별점검' },
];

// 진행상태 옵션
export const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'IDENTIFIED', label: '식별' },
  { value: 'REQUESTED', label: '요청' },
  { value: 'PLANNING', label: '계획수립' },
  { value: 'APPROVED', label: '승인완료' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'VERIFIED', label: '검증완료' },
  { value: 'CLOSED', label: '종료' },
];

// 우선순위 옵션
export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'HIGH', label: '높음' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'LOW', label: '낮음' },
];

// 해커드랩 옵션
export const HACKER_LAB_OPTIONS: SelectOption[] = [
  { value: '', label: '전체' },
  { value: 'LAB01', label: 'LAB01' },
  { value: 'LAB02', label: 'LAB02' },
  { value: 'LAB03', label: 'LAB03' },
  { value: 'LAB04', label: 'LAB04' },
];

// 품질등급 옵션
export const QUALITY_GRADE_OPTIONS: SelectOption[] = [
  { value: 'EXCELLENT', label: '우수' },
  { value: 'GOOD', label: '양호' },
  { value: 'FAIR', label: '보통' },
  { value: 'POOR', label: '미흡' },
  { value: 'INADEQUATE', label: '부적정' },
];

// 효과성등급 옵션
export const EFFECTIVENESS_GRADE_OPTIONS: SelectOption[] = [
  { value: 'VERY_HIGH', label: '매우높음' },
  { value: 'HIGH', label: '높음' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'LOW', label: '낮음' },
  { value: 'MINIMAL', label: '최소' },
];

// 상태별 색상 매핑
export const STATUS_COLOR_MAP: Record<ReportImprovementStatus, string> = {
  IDENTIFIED: '#6B7280',      // Gray
  REQUESTED: '#3B82F6',       // Blue
  PLANNING: '#F59E0B',        // Amber
  APPROVED: '#10B981',        // Emerald
  IN_PROGRESS: '#8B5CF6',     // Violet
  COMPLETED: '#059669',       // Green
  VERIFIED: '#047857',        // Dark Green
  CLOSED: '#374151',          // Dark Gray
};

// 우선순위별 색상 매핑
export const PRIORITY_COLOR_MAP: Record<Priority, string> = {
  HIGH: '#EF4444',            // Red
  MEDIUM: '#F59E0B',          // Amber
  LOW: '#10B981',             // Green
};