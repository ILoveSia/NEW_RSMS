/**
 * 직책 관련 타입 정의
 */

/**
 * 직책 기본 인터페이스
 */
export interface Position {
  positionId: number;              // 직책ID
  positionName: string;            // 직책명
  positionsCd?: string;            // 직책코드
  ledgerOrderId?: string;          // 원장차수ID
  hqCode?: string;                 // 본부코드
  hqName?: string;                 // 본부명
  isConcurrent?: string;           // 겸직여부 (Y/N)
  concurrentDetails?: string;      // 겸직사항
  currentPositionDate?: string;    // 현직책부여일
  employeeName?: string;           // 직원명
  departmentName?: string;         // 소관부점
  committeeNames?: string;         // 주관회의체
  isActive?: string;               // 활성화 여부
  createdBy?: string;              // 생성자
  createdAt?: string;              // 생성일시
  updatedBy?: string;              // 수정자
  updatedAt?: string;              // 수정일시
}

/**
 * 직책 검색 필터 인터페이스
 */
export interface PositionSearchFilter {
  positionName?: string;           // 직책명
  hqCode?: string;                 // 본부코드
  hqName?: string;                 // 본부명
  isConcurrent?: string;           // 겸직여부
  isActive?: string;               // 활성화 여부
  ledgerOrderId?: string;          // 원장차수ID
}

/**
 * 직책 선택 콜백 타입
 */
export type PositionSelectCallback = (position: Position) => void;
