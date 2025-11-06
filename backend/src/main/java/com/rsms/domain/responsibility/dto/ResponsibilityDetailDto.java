package com.rsms.domain.responsibility.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 책무세부 응답 DTO
 * - 책무세부 조회 시 반환되는 데이터 구조
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
public class ResponsibilityDetailDto {
    /**
     * 책무세부코드 (PK, 업무 코드)
     * - 코드 생성 규칙: 책무코드 뒷 9자리 + "D" + 순번(4자리)
     * - 예시: "RM0001D0001"
     */
    private String responsibilityDetailCd;

    /**
     * 책무코드 (FK)
     * - 예시: "20250001RM0001"
     */
    private String responsibilityCd;

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
