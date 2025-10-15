/**
 * 원장차수(Ledger Order) 관련 타입 정의
 * 테이블: ledger_order
 */

/**
 * 원장차수 기본 인터페이스
 */
export interface LedgerOrder {
  ledgerOrderId: string;          // 원장차수ID (년도4자리+순번4자리, 예: 20250001)
  ledgerOrderTitle?: string;      // 원장 제목
  ledgerOrderStatus: string;      // 원장상태 (NEW: 신규, PROG: 진행중, CLSD: 종료)
  ledgerOrderRemarks?: string;    // 비고
  createdBy: string;              // 생성자
  createdAt: string;              // 생성일시
  updatedBy: string;              // 수정자
  updatedAt: string;              // 수정일시
  순번?: number;                   // AG-Grid용 순번 (클라이언트 측에서만 사용)
}

/**
 * 원장차수 생성 DTO
 */
export interface CreateLedgerOrderDto {
  ledgerOrderTitle?: string;
  ledgerOrderStatus?: string;
  ledgerOrderRemarks?: string;
}

/**
 * 원장차수 수정 DTO
 */
export interface UpdateLedgerOrderDto {
  ledgerOrderId: string;
  ledgerOrderTitle?: string;
  ledgerOrderStatus?: string;
  ledgerOrderRemarks?: string;
}

/**
 * 원장차수 검색 필터
 */
export interface LedgerOrderSearchFilter {
  searchKeyword?: string;         // 검색어 (제목, 비고 등)
  ledgerOrderStatus?: string;     // 원장상태
  year?: string;                  // 년도
}

/**
 * 원장차수 목록 응답
 */
export interface LedgerOrderListResponse {
  content: LedgerOrder[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 원장차수 상태 코드
 */
export const LEDGER_ORDER_STATUS = {
  NEW: '신규',
  PROG: '진행중',
  CLSD: '종료'
} as const;

export type LedgerOrderStatusType = keyof typeof LEDGER_ORDER_STATUS;

/**
 * 원장차수 상태 옵션 (Select 컴포넌트용)
 */
export const LEDGER_ORDER_STATUS_OPTIONS = Object.entries(LEDGER_ORDER_STATUS).map(
  ([value, label]) => ({ value, label })
);
