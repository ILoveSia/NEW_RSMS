package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 관리의무 생성 요청 DTO
 * - 책무세부에 대한 관리의무를 개별 저장할 때 사용
 * - "공통" 타입: 모든 부점에 대해 여러 번 호출
 * - "고유" 타입: 선택한 부점 하나만 호출
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateManagementObligationRequest {
    /**
     * 책무세부ID (FK → responsibility_details)
     */
    private Long responsibilityDetailId;

    /**
     * 관리의무 대분류 구분코드 (common_code_details의 MGMT_OBLG_LCCD 그룹)
     */
    private String obligationMajorCatCd;

    /**
     * 관리의무 중분류 구분코드 (common_code_details의 MGMT_OBLG_MCCD 그룹)
     */
    private String obligationMiddleCatCd;

    /**
     * 관리의무코드 (신규 생성)
     */
    private String obligationCd;

    /**
     * 관리의무 내용
     */
    private String obligationInfo;

    /**
     * 조직코드 (FK → organizations.org_code)
     */
    private String orgCode;

    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;
}
