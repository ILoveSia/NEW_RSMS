package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무 생성 요청 DTO
 *
 * @description 책무를 생성할 때 필요한 정보를 담는 DTO
 * @author Claude AI
 * @since 2025-09-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateResponsibilityRequest {

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책ID
     */
    private Long positionsId;

    /**
     * 책무카테고리 (RSBT_OBLG_CLCD)
     */
    private String responsibilityCat;

    /**
     * 책무코드 (RSBT_OBLG_CD)
     */
    private String responsibilityCd;

    /**
     * 책무정보
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
}
