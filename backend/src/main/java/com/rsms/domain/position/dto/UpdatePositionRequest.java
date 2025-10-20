package com.rsms.domain.position.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 직책 수정 요청 DTO
 * - 직책 정보 수정 시 사용
 * - 필수 항목 검증 포함
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePositionRequest {

    /**
     * 직책명 (필수)
     */
    @NotBlank(message = "직책명은 필수입니다.")
    private String positionsName;

    /**
     * 본부명 (필수)
     */
    @NotBlank(message = "본부명은 필수입니다.")
    private String hqName;

    /**
     * 본부코드 (선택)
     */
    private String hqCode;

    /**
     * 만료일 (선택)
     */
    private LocalDate expirationDate;

    /**
     * 상태 (선택)
     */
    private String positionsStatus;

    /**
     * 사용여부 (선택)
     */
    private String isActive;

    /**
     * 겸직여부 (선택)
     */
    private String isConcurrent;
}
