package com.rsms.domain.ledger.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 원장차수 수정 요청 DTO
 *
 * @description 원장차수 수정 시 사용하는 요청 객체
 * @author Claude AI
 * @since 2025-10-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLedgerOrderRequest {

    /**
     * 원장 제목 (최대 50자)
     */
    @NotBlank(message = "원장 제목은 필수입니다")
    @Size(max = 50, message = "원장 제목은 50자 이내로 입력해주세요")
    private String ledgerOrderTitle;

    /**
     * 원장상태
     * - NEW: 신규
     * - PROG: 진행중
     * - CLSD: 종료
     */
    @NotBlank(message = "원장상태는 필수입니다")
    @Pattern(regexp = "^(NEW|PROG|CLSD)$", message = "유효하지 않은 원장상태입니다")
    private String ledgerOrderStatus;

    /**
     * 비고 (최대 100자)
     */
    @Size(max = 100, message = "비고는 100자 이내로 입력해주세요")
    private String ledgerOrderRemarks;
}
