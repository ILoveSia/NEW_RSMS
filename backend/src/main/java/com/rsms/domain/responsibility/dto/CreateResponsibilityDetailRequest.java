package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무세부 생성 요청 DTO
 * - 책무에 대한 세부내용을 개별 저장할 때 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateResponsibilityDetailRequest {
    /**
     * 책무ID (FK → responsibilities)
     */
    private Long responsibilityId;

    /**
     * 책무세부내용
     */
    private String responsibilityDetailInfo;

    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;
}
