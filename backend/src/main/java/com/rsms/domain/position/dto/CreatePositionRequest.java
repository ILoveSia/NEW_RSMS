package com.rsms.domain.position.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 직책 생성 요청 DTO
 * - 직책 신규 등록 시 사용
 * - 필수 항목 검증 포함
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePositionRequest {

    /**
     * 원장차수ID (필수)
     */
    @NotBlank(message = "원장차수ID는 필수입니다.")
    private String ledgerOrderId;

    /**
     * 직책코드 (필수)
     */
    @NotBlank(message = "직책코드는 필수입니다.")
    private String positionsCd;

    /**
     * 직책명 (필수)
     */
    @NotBlank(message = "직책명은 필수입니다.")
    private String positionsName;

    /**
     * 본부코드 (필수)
     */
    @NotBlank(message = "본부코드는 필수입니다.")
    private String hqCode;

    /**
     * 본부명 (필수)
     */
    @NotBlank(message = "본부명은 필수입니다.")
    private String hqName;

    /**
     * 만료일 (선택, 기본값: 9999-12-31)
     */
    private LocalDate expirationDate;

    /**
     * 상태 (선택)
     */
    private String positionsStatus;

    /**
     * 사용여부 (선택, 기본값: Y)
     */
    private String isActive;

    /**
     * 겸직여부 (선택, 기본값: N)
     */
    private String isConcurrent;
}
