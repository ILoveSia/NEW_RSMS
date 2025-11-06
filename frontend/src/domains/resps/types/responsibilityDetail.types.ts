/**
 * 책무세부 관련 타입 정의
 * - Backend ResponsibilityDetailDto 및 CreateResponsibilityDetailRequest와 매핑
 * - 책무세부코드는 서버에서 자동 생성됨 (책무코드 suffix + "D" + 순번)
 *
 * @author Claude AI
 * @since 2025-11-05
 */

/**
 * 책무세부 DTO
 * - Backend ResponsibilityDetailDto와 1:1 매핑
 */
export interface ResponsibilityDetailDto {
  /** 책무세부코드 (PK, 자동생성) - 예: "RM0001D0001" */
  responsibilityDetailCd: string;

  /** 책무코드 (FK) - 예: "20250001RM0001" */
  responsibilityCd: string;

  /** 책무내용 */
  responsibilityInfo?: string;

  /** 책무세부내용 */
  responsibilityDetailInfo: string;

  /** 사용여부 ('Y', 'N') */
  isActive: string;

  /** 생성일시 (ISO 8601 format) */
  createdAt?: string;

  /** 생성자 */
  createdBy?: string;

  /** 수정일시 (ISO 8601 format) */
  updatedAt?: string;

  /** 수정자 */
  updatedBy?: string;
}

/**
 * 책무세부 생성 요청 DTO
 * - Backend CreateResponsibilityDetailRequest와 1:1 매핑
 * - 책무세부코드는 서버에서 자동 생성되므로 포함하지 않음
 */
export interface CreateResponsibilityDetailRequest {
  /** 책무코드 (FK, 필수) - 예: "20250001RM0001" */
  responsibilityCd: string;

  /** 책무세부내용 (필수) */
  responsibilityDetailInfo: string;

  /** 사용여부 ('Y', 'N'), 기본값 'Y' */
  isActive?: string;
}

/**
 * 책무세부 수정 요청 DTO
 * - 수정 시에는 책무세부코드를 URL 파라미터로 전달
 * - 책무코드(FK)는 변경 불가
 */
export interface UpdateResponsibilityDetailRequest {
  /** 책무세부내용 */
  responsibilityDetailInfo: string;

  /** 사용여부 ('Y', 'N') */
  isActive: string;
}
