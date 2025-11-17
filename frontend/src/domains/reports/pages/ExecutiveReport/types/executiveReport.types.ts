/**
 * 임원이행점검보고서 관련 TypeScript 타입 정의
 * @description PositionMgmt.tsx 표준 템플릿을 기반으로 한 ExecutiveReport 전용 타입
 */

// 점검상태 코드 정의
export type InspectionStatus = 'DRAFT' | 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'INCOMPLETE';

// 개선조치상태 코드 정의
export type ImprovementStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'NOT_REQUIRED';

// 기본 점검 엔티티
export interface BaseInspection {
  id: string;
  inspectionYear: string;
  inspectionName: string;
  branchName: string;
  registrationDate: string;
  registrar: string;
  registrarPosition: string;
  modificationDate: string;
  modifier: string;
  modifierPosition: string;
  isActive: boolean;
}

// 책무별 점검현황 인터페이스
export interface ResponsibilityInspection extends BaseInspection {
  responsibility: string; // 책무 (온법감시, 내부감시, 경영진단 등)
  managementDuty: string; // 관리의무
  managementActivity: string; // 관리활동
  inspectionResult: InspectionStatus; // 이행점검결과 상태
  improvementAction: ImprovementStatus; // 개선조치 상태
  inspectionDate: string; // 점검일자
  inspector: string; // 점검자
  inspectorPosition: string; // 점검자 직책
  resultDetail: string; // 점검결과 상세
  improvementDetail: string; // 개선조치 상세
}

// 관리의무별 점검현황 인터페이스
export interface DutyInspection extends BaseInspection {
  managementDuty: string; // 관리의무 상세 내용
  inspectionResult: string; // 해당 의무에 대한 점검결과
  responsibilityCategory: string; // 연관된 책무 카테고리
  dutyCode: string; // 관리의무 코드
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // 우선순위
  complianceRate: number; // 준수율 (0-100)
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'; // 리스크 수준
}

// 검색 필터 인터페이스
export interface ExecutiveReportFilters {
  ledgerOrderId: string; // 책무이행차수
  inspectionName: string; // 점검명
  branchName: string; // 부점명
  inspectionStatus: InspectionStatus | ''; // 점검상태
  improvementStatus: ImprovementStatus | ''; // 개선조치상태
  responsibility: string; // 책무 구분
  inspector: string; // 점검자명
}

// 보고서 등록 폼 데이터
export interface ExecutiveReportFormData {
  inspectionRound: string; // 점검회차
  inspectionPeriod: {
    startDate: string;
    endDate: string;
  }; // 점검기간
  inspectionContent: string; // 점검내용
  targetOrganization: string; // 대상조직
  reportSummary: string; // 보고서 요약
  attachmentFiles: File[]; // 첨부파일
  inspectionScope: string; // 점검범위
  keyFindings: string; // 주요 발견사항
  recommendations: string; // 권고사항
  followUpActions: string; // 후속조치 계획
}

// 대시보드 통계 데이터
export interface ExecutiveDashboardStats {
  totalResponsibilities: number; // 총 책무 건수
  totalDuties: number; // 총 관리의무 건수
  totalActivities: number; // 총 관리활동 건수
  inspectionResults: {
    completed: number; // 작성완료
    notCompleted: number; // 부적성
  }; // 이행점검결과
  improvementActions: {
    completed: number; // 완료
    inProgress: number; // 진행중
  }; // 개선조치
  complianceRate: number; // 전체 준수율
  systemUptime: number; // 시스템 가동률
}

// 모달 상태 관리
export interface ExecutiveReportModalState {
  formModal: boolean; // 보고서 등록/수정 모달
  detailModal: boolean; // 상세보기 모달
  targetOrgModal: boolean; // 대상조직 관리 모달
  selectedReport: ResponsibilityInspection | DutyInspection | null;
  modalMode: 'create' | 'edit' | 'detail';
}

// 페이지네이션 인터페이스
export interface ExecutiveReportPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 테이블 탭 정의
export type InspectionTableTab = 'responsibility' | 'duty';

// API 응답 인터페이스
export interface ExecutiveReportApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  totalCount?: number;
  page?: number;
  size?: number;
}

// 대상조직 관리 인터페이스
export interface TargetOrganization {
  id: string;
  organizationName: string;
  organizationType: 'HEADQUARTERS' | 'BRANCH' | 'CENTER' | 'TEAM';
  parentOrganization: string;
  manager: string;
  managerPosition: string;
  contactInfo: string;
  isActive: boolean;
  authorityLevel: 'READ' | 'WRITE' | 'ADMIN';
}

// 신규 보고서 생성 요청
export interface NewReportRequest {
  inspectionRound: string;
  targetYear: string;
  inspectionType: 'REGULAR' | 'SPECIAL' | 'FOLLOW_UP';
  targetOrganizations: string[]; // 대상조직 ID 배열
  templateId?: string; // 보고서 템플릿 ID (선택사항)
}

// 엑셀 다운로드 요청 파라미터
export interface ExcelDownloadParams {
  tableType: InspectionTableTab;
  filters: ExecutiveReportFilters;
  selectedIds?: string[]; // 선택된 항목만 다운로드할 경우
  includeStats: boolean; // 통계 정보 포함 여부
}

// 상태별 색상 매핑
export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  DRAFT: '#ffa726', // 주황색 - 작성중
  COMPLETED: '#66bb6a', // 초록색 - 작성완료
  NOT_STARTED: '#ef5350', // 빨간색 - 부적성
  IN_PROGRESS: '#42a5f5', // 파란색 - 진행중
  INCOMPLETE: '#ff7043' // 주황-빨강 - 미완성
};

export const IMPROVEMENT_STATUS_COLORS: Record<ImprovementStatus, string> = {
  COMPLETED: '#66bb6a', // 초록색 - 완료
  IN_PROGRESS: '#42a5f5', // 파란색 - 진행중
  PLANNED: '#ffa726', // 주황색 - 계획
  NOT_REQUIRED: '#bdbdbd' // 회색 - 불필요
};

// 상태별 라벨 매핑
export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  DRAFT: '작성중',
  COMPLETED: '작성완료',
  NOT_STARTED: '부적성',
  IN_PROGRESS: '진행중',
  INCOMPLETE: '미완성'
};

export const IMPROVEMENT_STATUS_LABELS: Record<ImprovementStatus, string> = {
  COMPLETED: '완료',
  IN_PROGRESS: '진행중',
  PLANNED: '계획',
  NOT_REQUIRED: '불필요'
};
