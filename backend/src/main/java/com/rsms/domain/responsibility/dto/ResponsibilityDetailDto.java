package com.rsms.domain.responsibility.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 책무세부 응답 DTO
 * - 책무세부 조회 시 반환되는 데이터 구조
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsibilityDetailDto {
    /**
     * 책무세부ID (PK)
     */
    private Long responsibilityDetailId;

    /**
     * 책무ID (FK)
     */
    private Long responsibilityId;

    /**
     * 책무세부내용
     */
    private String responsibilityDetailInfo;

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
