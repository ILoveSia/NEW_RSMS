/**
 * 보고서목록 페이지 관련 TypeScript 타입 정의
 */

// 📊 보고서 데이터 인터페이스
export interface Report {
  id: string;
  sequence: number;
  department: string;
  category: string;
  inspectionName: string;
  inspectionPeriod: string;
  reportNumber: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  author: string;
  createdAt: string;
  approver?: string;
  approvedAt?: string;
  reviewContent?: string;
  result?: string;
  improvementAction?: string;
}

// 🔍 보고서 목록 필터 인터페이스
export interface ReportListFilters {
  ledgerOrderId: string;
  inspectionName: string;
  orgCode: string;
}

// 📊 페이지네이션 인터페이스
export interface ReportListPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 🎭 모달 상태 인터페이스
export interface ReportListModalState {
  ceoReportModal: boolean;
  newReportModal: boolean;
  improvementModal: boolean;
  detailModal: boolean;
  selectedReport: Report | null;
}

// 📄 보고서 작성 폼 데이터
export interface ReportFormData {
  inspectionRound: string;
  inspectionPeriod: string;
  reviewContent: string;
  attachments?: File[];
  reportType?: 'CEO' | 'EXECUTIVE' | 'DEPARTMENT';
}

// 📝 개선조치 폼 데이터
export interface ImprovementActionFormData {
  reportId: string;
  actionPlan: string;
  responsible?: string;
  targetDate?: string;
}
