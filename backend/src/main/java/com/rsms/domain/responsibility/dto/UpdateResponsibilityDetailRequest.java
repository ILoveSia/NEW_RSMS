package com.rsms.domain.responsibility.dto;

import lombok.*;

/**
 * 책무세부 수정 요청 DTO
 * - 책무세부 내용 수정 시 사용
 *
 * @author Claude AI
 * @since 2025-01-06
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateResponsibilityDetailRequest {
    /**
     * 책무세부내용 (필수)
     */
    private String responsibilityDetailInfo;

    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;

    // 참고: 책무세부코드(PK), 책무코드(FK)는 수정 불가 (PathVariable로 전달)
}
