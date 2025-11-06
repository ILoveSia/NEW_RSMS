package com.rsms.domain.responsibility.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 관리의무 응답 DTO
 * - 관리의무 조회 시 반환되는 데이터 구조
 *
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - PK/FK 타입 변경 (Long → String)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagementObligationDto {
    /**
     * 관리의무코드 (PK, 업무 코드)
     * - 코드 생성 규칙: 책무세부코드 + "MO" + 순번(4자리)
     * - 예시: "RM0001D0001MO0001"
     */
    private String obligationCd;

    /**
     * 책무세부코드 (FK)
     * - 예시: "RM0001D0001"
     */
    private String responsibilityDetailCd;

    /**
     * 책무세부내용
     */
    private String responsibilityDetailInfo;

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
