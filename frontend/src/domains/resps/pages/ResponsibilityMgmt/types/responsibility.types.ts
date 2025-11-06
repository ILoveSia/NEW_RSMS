/**
 * 책무관리 타입 정의
 * - Backend DTO와 매핑되는 인터페이스
 *
 * @author Claude AI
 * @since 2025-11-05
 */

/**
 * 책무 DTO (Backend ResponsibilityDto와 매핑)
 */
export interface ResponsibilityDto {
  responsibilityCd: string;          // 책무코드 (PK, 자동생성)
  ledgerOrderId: string;             // 원장차수ID
  positionsId: number;               // 직책ID
  responsibilityCat: string;         // 책무카테고리 코드
  responsibilityCatName?: string;    // 책무카테고리명
  responsibilityCdName?: string;     // 책무명
  responsibilityInfo: string;        // 책무정보
  responsibilityLegal: string;       // 관련근거
  expirationDate?: string;           // 만료일
  responsibilityStatus?: string;     // 상태
  isActive: string;                  // 사용여부 ('Y', 'N')
  createdBy?: string;                // 생성자
  createdAt?: string;                // 생성일시
  updatedBy?: string;                // 수정자
  updatedAt?: string;                // 수정일시
}

/**
 * 책무 생성 요청 DTO (Backend CreateResponsibilityRequest와 매핑)
 */
export interface CreateResponsibilityRequest {
  ledgerOrderId: string;             // 원장차수ID (필수)
  positionsId: number;               // 직책ID (필수)
  responsibilityCat: string;         // 책무카테고리 (필수)
  responsibilityInfo: string;        // 책무정보 (필수)
  responsibilityLegal: string;       // 관련근거 (필수)
  expirationDate?: string;           // 만료일
  responsibilityStatus?: string;     // 상태
  isActive?: string;                 // 사용여부 (기본값: 'Y')
  // responsibilityCd는 서버에서 자동 생성되므로 제외
}

/**
 * 책무 수정 요청 DTO (Backend UpdateResponsibilityRequest와 매핑)
 */
export interface UpdateResponsibilityRequest {
  ledgerOrderId: string;
  positionsId: number;
  responsibilityCat: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  expirationDate?: string;
  responsibilityStatus?: string;
  isActive?: string;
}

/**
 * Grid 표시용 책무 데이터
 */
export interface ResponsibilityGridRow {
  id: string;                        // responsibilityCd (PK)
  순번: number;
  책무코드: string;                  // responsibilityCd
  책무이행차수: string;              // ledgerOrderId
  직책명: string;                    // positions 테이블 조인
  책무카테고리: string;              // responsibilityCatName
  책무내용: string;                  // responsibilityInfo
  책무관련근거: string;              // responsibilityLegal
  사용여부: string;                  // 'Y' 또는 'N' (텍스트 표시)
  등록일자: string;                  // createdAt
  등록자: string;                    // createdBy
  _rawData?: ResponsibilityDto;      // 원본 DTO 데이터 (상세 모달용)
}

/**
 * 검색 필터 타입
 */
export interface ResponsibilityFilters {
  ledgerOrderId?: string;            // 원장차수
  positionsId?: string;              // 직책
  responsibilityCat?: string;        // 책무카테고리
  responsibilityInfo?: string;       // 책무내용
  isActive?: string;                 // 사용여부
}

/**
 * 모달 상태 관리
 */
export interface ResponsibilityModalState {
  addModal: boolean;                 // 등록 모달 열림 여부
  detailModal: boolean;              // 상세 모달 열림 여부
  selectedResponsibility: ResponsibilityDto | null;  // 선택된 책무
}

/**
 * 폼 데이터 (등록/수정 공통)
 */
export interface ResponsibilityFormData {
  ledgerOrderId: string;
  positionsId: number | null;
  responsibilityCat: string;
  responsibilityInfo: string;
  responsibilityLegal: string;
  expirationDate?: string;              // 만료일 (선택)
  responsibilityStatus?: string;        // 상태 (선택)
  isActive: string;                     // 사용여부 (필수)
}
