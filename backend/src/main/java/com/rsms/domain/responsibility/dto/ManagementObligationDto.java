package com.rsms.domain.responsibility.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 관리의무 응답 DTO
 * - 관리의무 조회 시 반환되는 데이터 구조
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagementObligationDto {
    /**
     * 관리의무ID (PK)
     */
    private Long managementObligationId;

    /**
     * 책무세부ID (FK)
     */
    private Long responsibilityDetailId;

    /**
     * 관리의무 대분류 구분코드
     */
    private String obligationMajorCatCd;

    /**
     * 관리의무 대분류 구분명
     */
    private String obligationMajorCatName;

    /**
     * 관리의무 중분류 구분코드
     */
    private String obligationMiddleCatCd;

    /**
     * 관리의무 중분류 구분명
     */
    private String obligationMiddleCatName;

    /**
     * 관리의무코드
     */
    private String obligationCd;

    /**
     * 관리의무 내용
     */
    private String obligationInfo;

    /**
     * 조직코드
     */
    private String orgCode;

    /**
     * 조직명 (organizations 테이블 조인)
     */
    private String orgName;

    /**
     * 사용여부
     */
    private String isActive;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 수정자
     */
    private String updatedBy;
}
