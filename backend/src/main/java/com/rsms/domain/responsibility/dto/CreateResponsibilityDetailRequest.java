package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무세부 생성 요청 DTO
 * - 책무에 대한 세부내용을 개별 저장할 때 사용
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
public class CreateResponsibilityDetailRequest {
    /**
     * 책무코드 (FK → responsibilities) (필수)
     * - 예시: "20250001RM0001"
     */
    private String responsibilityCd;

    /**
     * 책무세부내용 (필수)
     */
    private String responsibilityDetailInfo;

    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;

    // 참고: 책무세부코드(responsibilityDetailCd)는 서버에서 자동 생성되므로 요청 필드에 포함하지 않음
}
