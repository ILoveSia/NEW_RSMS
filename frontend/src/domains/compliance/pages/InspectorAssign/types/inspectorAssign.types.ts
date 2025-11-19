/**
 * 점검자지정(Inspector Assignment) 관련 타입 정의
 * 책무구조도 이행점검 점검자지정 화면에서 사용
 */

// 점검자지정 기본 데이터 타입
export interface InspectorAssignment {
  id: string;
  sequence: number;                     // 순번
  inspectionName: string;               // 점검명 (impl_inspection_plans.impl_inspection_name)
  obligationInfo: string;               // 관리의무 (management_obligations.obligation_info)
  activityName: string;                 // 관리활동명 (dept_manager_manuals.activity_name)
  activityFrequencyCd: string;          // 관리활동수행주기 (dept_manager_manuals.activity_frequency_cd)
  orgCode: string;                      // 부서 (dept_manager_manuals.org_code)
  inspector: Inspector | null;          // 지정된 점검자
  inspectionDate?: string;              // 점검일자 (초회/날짜 정보)
  assignmentStatus: 'ASSIGNED' | 'UNASSIGNED' | 'COMPLETED';  // 점검자 지정상태
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 점검자 정보 타입
export interface Inspector {
  id: string;
  name: string;                         // 이름
  department: string;                   // 부서
  position: string;                     // 직급
  specialtyArea: string;                // 전문영역
  type: 'INTERNAL' | 'EXTERNAL';       // 내부/외부 구분
  isActive: boolean;                    // 활성 상태
  contactInfo?: string;                 // 연락처 정보
}

// 점검 기간 정보 타입
export interface InspectionPeriod {
  id: string;
  name: string;                         // 점검명
  startDate: string;                    // 시작일
  endDate: string;                      // 종료일
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

// 검색 필터 타입
export interface InspectorAssignFilters {
  ledgerOrderId?: string;               // 책무이행차수
  inspectionName?: string;              // 점검명
  periodId?: string;                    // 점검명 (기간) 선택
  assignmentStatus?: string;            // 점검자 지정상태 (전체/지정완료/미지정)
  boolCode?: string;                    // 부서코드
}

// 폼 데이터 타입 (점검자 지정용)
export interface InspectorAssignFormData {
  inspectorId: string;                  // 점검자 ID
  assignmentReason?: string;            // 지정 사유
  estimatedDate?: string;               // 예상 점검일
}

// 페이지네이션 타입
export interface InspectorAssignPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// API 응답 타입
export interface InspectorAssignListResponse {
  content: InspectorAssignment[];
  pagination: InspectorAssignPagination;
}

export interface InspectorListResponse {
  content: Inspector[];
  pagination: InspectorAssignPagination;
}

// 모달 상태 타입
export interface InspectorAssignModalState {
  inspectorSelectModal: boolean;        // 점검자 선택 모달
  assignmentDetailModal: boolean;       // 지정 상세 모달
  selectedAssignment: InspectorAssignment | null;
  selectedInspector: Inspector | null;
}

// 일괄 저장 요청 타입
export interface BulkAssignmentRequest {
  assignments: {
    assignmentId: string;
    inspectorId: string;
    assignmentReason?: string;
  }[];
}

// 지정상태 옵션 타입
export interface AssignmentStatusOption {
  value: string;
  label: string;
}

// 점검자 타입 옵션
export interface InspectorTypeOption {
  value: 'INTERNAL' | 'EXTERNAL';
  label: string;
}

// 점검자 선택 모달 상태
export interface InspectorSelectionState {
  selectedType: 'INTERNAL' | 'EXTERNAL';
  searchKeyword: string;
  inspectors: Inspector[];
  selectedInspector: Inspector | null;
  loading: boolean;
}

// 통계 정보 타입
export interface AssignmentStatistics {
  total: number;                        // 전체 점검 항목 수
  assigned: number;                     // 지정완료 수
  unassigned: number;                   // 미지정 수
  completed: number;                    // 점검완료 수
}

// 점검자 지정 이력 타입
export interface AssignmentHistory {
  id: string;
  assignmentId: string;
  previousInspectorId?: string;
  newInspectorId: string;
  changeReason?: string;
  changedBy: string;
  changedAt: string;
  action: 'ASSIGN' | 'CHANGE' | 'REMOVE';
}

// 유효성 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 필터 필드 타입 (BaseSearchFilter용)
export interface FilterField {
  key: string;
  type: 'text' | 'select';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  gridSize: { xs: number; sm: number; md: number; };
}

// 액션 버튼 타입 (BaseActionBar용)
export interface ActionButton {
  key: string;
  label: string;
  variant: 'contained' | 'outlined' | 'text';
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  startIcon?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

// 상태 정보 타입 (BaseActionBar용)
export interface StatusInfo {
  total: number;
  label: string;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}