/**
 * 관리의무 타입 정의
 * - Backend ManagementObligationDto와 매핑
 *
 * @author Claude AI
 * @since 2025-01-06
 */

/**
 * 관리의무 DTO (Backend 응답)
 */
export interface ManagementObligationDto {
  obligationCd: string;              // 관리의무코드 (PK)
  responsibilityDetailCd: string;    // 책무세부코드 (FK)
  responsibilityDetailInfo?: string; // 책무세부내용
  obligationMajorCatCd: string;      // 관리의무 대분류 구분코드
  obligationMajorCatName?: string;   // 관리의무 대분류 구분명
  obligationMiddleCatCd: string;     // 관리의무 중분류 구분코드
  obligationMiddleCatName?: string;  // 관리의무 중분류 구분명
  obligationInfo: string;            // 관리의무 내용
  orgCode: string;                   // 조직코드
  orgName?: string;                  // 조직명
  isActive: string;                  // 사용여부
  createdAt?: string;                // 생성일시
  createdBy?: string;                // 생성자
  updatedAt?: string;                // 수정일시
  updatedBy?: string;                // 수정자
}

/**
 * 관리의무 생성 요청
 */
export interface CreateManagementObligationRequest {
  responsibilityDetailCd: string;    // 책무세부코드 (필수)
  obligationMajorCatCd: string;      // 관리의무 대분류 구분코드 (필수)
  obligationMiddleCatCd: string;     // 관리의무 중분류 구분코드 (필수)
  obligationInfo: string;            // 관리의무 내용 (필수)
  orgCode: string;                   // 조직코드 (필수)
  isActive?: string;                 // 사용여부 (기본값 'Y')
}

/**
 * 관리의무 수정 요청
 */
export interface UpdateManagementObligationRequest {
  obligationMajorCatCd: string;      // 관리의무 대분류 구분코드
  obligationMiddleCatCd: string;     // 관리의무 중분류 구분코드
  obligationInfo: string;            // 관리의무 내용
  orgCode: string;                   // 조직코드
  isActive: string;                  // 사용여부
}
