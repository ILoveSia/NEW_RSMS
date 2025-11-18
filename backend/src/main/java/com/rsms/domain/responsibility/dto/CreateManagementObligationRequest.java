package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 관리의무 생성 요청 DTO
 * - 책무세부에 대한 관리의무를 개별 저장할 때 사용
 * - "공통" 타입: 모든 부점에 대해 여러 번 호출
 * - "고유" 타입: 선택한 부점 하나만 호출
 *
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - FK 타입 변경 (Long → String), 코드는 자동 생성
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateManagementObligationRequest {
    /**
     * 책무세부코드 (FK → responsibility_details) (필수)
     * - 예시: "RM0001D0001"
     */
    private String responsibilityDetailCd;

    /**
     * 관리의무 대분류 구분코드 (필수)
     * - common_code_details의 MGMT_OBLG_LCCD 그룹
     */
    private String obligationMajorCatCd;

    /**
     * 관리의무 내용 (필수)
     */
    private String obligationInfo;

    /**
     * 조직코드 (FK → organizations.org_code) (필수)
     */
    private String orgCode;

    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;

    // 참고: 관리의무코드(obligationCd)는 서버에서 자동 생성되므로 요청 필드에 포함하지 않음
}
