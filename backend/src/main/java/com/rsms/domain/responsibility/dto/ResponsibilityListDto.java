package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무 목록 조회 DTO
 * - 3개 테이블 조인 (responsibilities, responsibility_details, management_obligations)
 * - responsibilities를 마스터로 하위 테이블 LEFT JOIN
 * - 1:N 관계로 인해 책무, 책무세부가 중복될 수 있음 (정상)
 *
 * @description 책무 목록 조회 시 사용하는 DTO
 * @author Claude AI
 * @since 2025-09-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsibilityListDto {

    // ===== responsibilities 테이블 =====
    /**
     * 책무ID
     */
    private Long responsibilityId;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책ID
     */
    private Long positionsId;

    /**
     * 책무카테고리 (코드)
     */
    private String responsibilityCat;

    /**
     * 책무카테고리명
     */
    private String responsibilityCatName;

    /**
     * 책무코드
     */
    private String responsibilityCd;

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
     * 만료일자
     */
    private String expirationDate;

    /**
     * 책무상태
     */
    private String responsibilityStatus;

    /**
     * 책무 사용여부
     */
    private String responsibilityIsActive;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 생성일시
     */
    private String createdAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 수정일시
     */
    private String updatedAt;

    // ===== positions 테이블 =====
    /**
     * 직책코드
     */
    private String positionsCd;

    /**
     * 직책명
     */
    private String positionsName;

    /**
     * 본부코드
     */
    private String hqCode;

    /**
     * 본부명
     */
    private String hqName;

    // ===== responsibility_details 테이블 =====
    /**
     * 책무세부ID
     */
    private Long responsibilityDetailId;

    /**
     * 책무세부내용
     */
    private String responsibilityDetailInfo;

    /**
     * 책무세부 사용여부
     */
    private String detailIsActive;

    // ===== management_obligations 테이블 =====
    /**
     * 관리의무ID
     */
    private Long managementObligationId;

    /**
     * 관리의무 대분류 구분코드
     */
    private String obligationMajorCatCd;

    /**
     * 관리의무 대분류명
     */
    private String obligationMajorCatName;

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
     * 조직명
     */
    private String orgName;

    /**
     * 관리의무 사용여부
     */
    private String obligationIsActive;
}
