package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무 생성 요청 DTO
 *
 * @description 책무를 생성할 때 필요한 정보를 담는 DTO
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - 책무코드는 자동 생성되므로 필드에서 제거
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateResponsibilityRequest {

    /**
     * 원장차수ID (필수)
     * - 코드 생성에 사용됨
     */
    private String ledgerOrderId;

    /**
     * 직책ID (필수)
     */
    private Long positionsId;

    /**
     * 책무카테고리 (RSBT_OBLG_CLCD) (필수)
     * - 코드 생성에 사용됨
     * - 예시: RM (리스크관리), IC (내부통제), CP (준법감시)
     */
    private String responsibilityCat;

    /**
     * 책무정보 (필수)
     */
    private String responsibilityInfo;

    /**
     * 관련근거
     */
    private String responsibilityLegal;

    /**
     * 사용여부 (Y/N)
     */
    private String isActive;

    // 참고: 책무코드(responsibilityCd)는 서버에서 자동 생성되므로 요청 필드에 포함하지 않음
}
