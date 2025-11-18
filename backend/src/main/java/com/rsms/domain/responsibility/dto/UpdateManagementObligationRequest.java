package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 관리의무 수정 요청 DTO
 * - PK(obligationCd), FK(responsibilityDetailCd)는 수정 불가
 * - 수정 가능한 필드만 포함
 *
 * @author Claude AI
 * @since 2025-01-06
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateManagementObligationRequest {
    /**
     * 관리의무 대분류 구분코드 (수정 가능)
     */
    private String obligationMajorCatCd;

    /**
     * 관리의무 내용 (수정 가능)
     */
    private String obligationInfo;

    /**
     * 조직코드 (수정 가능)
     */
    private String orgCode;

    /**
     * 사용여부 (수정 가능)
     */
    private String isActive;
}
