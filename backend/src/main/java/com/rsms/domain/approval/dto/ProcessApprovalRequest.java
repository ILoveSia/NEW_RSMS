package com.rsms.domain.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * 결재 처리 요청 DTO
 *
 * @description 결재 승인/반려 시 필요한 데이터
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessApprovalRequest {

    /**
     * 결재결과 (APPROVE: 승인, REJECT: 반려)
     */
    @NotBlank(message = "결재결과는 필수입니다.")
    private String resultCd;

    /**
     * 의견
     */
    @Size(max = 2000, message = "의견은 2000자 이내로 입력해주세요.")
    private String comment;
}
