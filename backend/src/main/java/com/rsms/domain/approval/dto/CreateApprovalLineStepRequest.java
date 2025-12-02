package com.rsms.domain.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * 결재선 단계 생성 요청 DTO
 *
 * @description 결재선 단계 생성 시 필요한 데이터
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApprovalLineStepRequest {

    /**
     * 단계 순서
     */
    @NotNull(message = "단계 순서는 필수입니다.")
    private Integer stepOrder;

    /**
     * 단계명
     */
    @NotBlank(message = "단계명은 필수입니다.")
    @Size(max = 100, message = "단계명은 100자 이내로 입력해주세요.")
    private String stepName;

    /**
     * 결재유형코드 (DRAFT, REVIEW, APPROVE, FINAL)
     */
    @NotBlank(message = "결재유형은 필수입니다.")
    @Size(max = 10, message = "결재유형코드는 10자 이내로 입력해주세요.")
    private String approvalTypeCd;

    /**
     * 결재자유형코드 (POSITION, DEPT, USER)
     */
    @NotBlank(message = "결재자유형은 필수입니다.")
    @Size(max = 10, message = "결재자유형코드는 10자 이내로 입력해주세요.")
    private String approverTypeCd;

    /**
     * 결재자ID
     */
    @Size(max = 50, message = "결재자ID는 50자 이내로 입력해주세요.")
    private String approverId;

    /**
     * 결재자명
     */
    @Size(max = 100, message = "결재자명은 100자 이내로 입력해주세요.")
    private String approverName;

    /**
     * 필수여부 (Y/N)
     */
    private String isRequired;

    /**
     * 비고
     */
    @Size(max = 500, message = "비고는 500자 이내로 입력해주세요.")
    private String remarks;
}
