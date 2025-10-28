package com.rsms.domain.responsibility.dto;

import lombok.*;
import java.util.List;

/**
 * 책무 전체 생성 요청 DTO
 * - responsibilities, responsibility_details, management_obligations 모두 포함
 *
 * @description 책무, 책무세부, 관리의무를 한 번에 생성하는 요청 DTO
 * @author Claude AI
 * @since 2025-09-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateResponsibilityWithDetailsRequest {

    // ===== responsibilities 테이블 =====
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

    // ===== responsibility_details 테이블 리스트 =====
    /**
     * 책무 세부내용 리스트
     */
    private List<ResponsibilityDetailDto> details;

    /**
     * 책무 세부내용 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResponsibilityDetailDto {
        /**
         * 책무세부내용
         */
        private String responsibilityDetailInfo;

        /**
         * 사용여부 (Y/N)
         */
        private String isActive;

        /**
         * 관리의무 리스트
         */
        private List<ManagementObligationDto> obligations;
    }

    /**
     * 관리의무 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagementObligationDto {
        /**
         * 관리의무 대분류 구분코드
         */
        private String obligationMajorCatCd;

        /**
         * 관리의무 중분류 구분코드
         */
        private String obligationMiddleCatCd;

        /**
         * 관리의무코드
         */
        private String obligationCd;

        /**
         * 관리의무내용
         */
        private String obligationInfo;

        /**
         * 조직코드
         */
        private String orgCode;

        /**
         * 사용여부 (Y/N)
         */
        private String isActive;
    }
}
