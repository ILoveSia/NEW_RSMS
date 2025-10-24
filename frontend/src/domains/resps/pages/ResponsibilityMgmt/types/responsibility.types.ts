// 책무관리 타입 정의

/**
 * 책무 인터페이스
 */
export interface Responsibility {
  id: string;
  순번?: number;
  직책: string;
  책무: string;
  책무세부내용: string;
  관리의무: string;
  부점명: string;
  등록일자: string;
  등록자: string;
  등록자직책: string;
  상태: string;
  사용여부: boolean;

  // 추가 상세 정보
  본부구분?: string;
  부서명?: string;
  책무테고리?: string;
  관련근거?: string;
  연결책무?: string;
  관리의무코드?: string;
  관리의무대본부구분?: string;
  관리의무중본부구분?: string;
}

/**
 * 책무 검색 필터
 */
export interface ResponsibilityFilters {
  책무이행차수?: string;
  직책명?: string;
  책무?: string;
  본부구분?: string;
  관리의무?: string;
  상태?: string;
  사용여부?: string;
  등록일시작?: string;
  등록일종료?: string;
}

/**
 * 책무 폼 데이터 (등록/수정)
 */
export interface ResponsibilityFormData {
  직책: string;
  본부구분: string;
  부서명: string;
  부점명: string;
  책무테고리: string;
  책무: string;
  책무세부내용: string;
  관리의무: string;
  관리의무코드?: string;
  관리의무대본부구분?: string;
  관리의무중본부구분?: string;
  사용여부: boolean;
}

/**
 * 책무 모달 상태
 */
export interface ResponsibilityModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedResponsibility: Responsibility | null;
}

/**
 * 책무 페이지네이션
 */
export interface ResponsibilityPagination {
  page: number;
  size: number;
  total: number;
}

/**
 * 책무 관련근거 인터페이스
 */
export interface ResponsibilityEvidence {
  id: string;
  책무테고리: string;
  책무: string;
  관련근거: string;
  최종변경일자: string;
  사용여부: string;
}

/**
 * 책무 세부내용 인터페이스
 */
export interface ResponsibilityDetail {
  id: string;
  연결책무: string;
  책무세부내용: string;
  최종변경일자: string;
  사용여부: string;
}

/**
 * 관리의무 인터페이스
 */
export interface ManagementInfo {
  id: string;
  관리의무대본부구분: string;
  관리의무중본부구분: string;
  관리의무코드: string;
  관리의무: string;
  부점명: string;
  사용여부: string;
}
