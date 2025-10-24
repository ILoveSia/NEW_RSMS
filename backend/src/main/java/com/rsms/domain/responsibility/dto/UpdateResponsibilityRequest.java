package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무 수정 요청 DTO
 *
 * @description 책무 정보를 수정할 때 필요한 정보를 담는 DTO
 * @author Claude AI
 * @since 2025-09-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateResponsibilityRequest {

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
}
