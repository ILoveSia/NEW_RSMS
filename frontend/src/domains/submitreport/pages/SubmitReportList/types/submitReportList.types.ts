/**
 * 제출보고서목록 페이지 관련 TypeScript 타입 정의
 * submit_reports 테이블 구조 기반
 */

// 📊 제출보고서 데이터 인터페이스 (submit_reports 테이블)
export interface SubmitReport {
  reportId: string;                      // report_id (PK)
  sequence: number;                      // 순번 (UI용)
  ledgerOrderId: string;                 // ledger_order_id (FK)
  submittingAgencyCd: string;            // submitting_agency_cd (제출기관코드)
  submittingAgencyName?: string;         // 제출기관명 (common_code 조인용)
  reportTypeCd: string;                  // report_type_cd (제출보고서구분코드)
  reportTypeName?: string;               // 제출보고서구분명 (common_code 조인용)
  subReportTitle?: string;               // sub_report_title (제출보고서 제목)
  targetExecutiveEmpNo?: string;         // target_executive_emp_no (제출 대상 임원 사번)
  targetExecutiveName?: string;          // target_executive_name (제출 대상 임원명)
  positionId?: string;                   // position_id (FK)
  positionName?: string;                 // position_name (직책명)
  submissionDate: string;                // submission_date (제출일)
  remarks?: string;                      // remarks (비고)
  attachmentCount?: number;              // 첨부파일 개수 (UI용)
  createdAt: string;                     // created_at (생성일시)
  updatedAt: string;                     // updated_at (수정일시)
  createdBy: string;                     // created_by (생성자)
  updatedBy: string;                     // updated_by (수정자)
  version: number;                       // version (낙관적 잠금)
}

// 🔍 제출보고서 목록 필터 인터페이스
export interface SubmitReportListFilters {
  ledgerOrderId: string;                 // 원장차수ID
  reportTypeCd: string;                  // 제출보고서구분코드
  submittingAgencyCd: string;            // 제출기관코드
  submissionDateFrom: string;            // 제출일 시작
  submissionDateTo: string;              // 제출일 종료
}

// 📊 페이지네이션 인터페이스
export interface SubmitReportListPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 인터페이스
export interface SubmitReportListModalState {
  detailModal: boolean;
  newReportModal: boolean;
  editModal: boolean;
  selectedReport: SubmitReport | null;
}

// 📄 제출보고서 작성/수정 폼 데이터
export interface SubmitReportFormData {
  ledgerOrderId: string;                 // 원장차수ID
  submittingAgencyCd: string;            // 제출기관코드
  reportTypeCd: string;                  // 제출보고서구분코드
  subReportTitle?: string;               // 제출보고서 제목
  targetExecutiveEmpNo?: string;         // 제출 대상 임원 사번
  positionId?: string;                   // 직책ID
  submissionDate: string;                // 제출일
  remarks?: string;                      // 비고
  attachments?: File[];                  // 첨부파일
}
