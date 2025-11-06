package com.rsms.domain.responsibility.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 책무 응답 DTO
 *
 * @description 책무 정보를 전달하는 DTO
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - PK 타입 변경 (Long → String)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsibilityDto {

    /**
     * 책무코드 (PK, 업무 코드)
     * - 코드 생성 규칙: ledger_order_id + responsibility_cat + 순번(4자리)
     * - 예시: "20250001RM0001"
     */
    private String responsibilityCd;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책ID
     */
    private Long positionsId;

    /**
     * 책무카테고리
     */
    private String responsibilityCat;

    /**
     * 책무카테고리명
     */
    private String responsibilityCatName;

    /**
     * 책무명
     */
    private String responsibilityCdName;

    /**
     * 책무정보
     */
    private String responsibilityInfo;

    /**
     * 관련근거
     */
    private String responsibilityLegal;

    /**
     * 만료일
     */
    private LocalDate expirationDate;

    /**
     * 상태
     */
    private String responsibilityStatus;

    /**
     * 사용여부
     */
    private String isActive;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;
}
