package com.rsms.domain.approval.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * 결재선 수정 요청 DTO
 *
 * @description 결재선 수정 시 필요한 데이터
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApprovalLineRequest {

    /**
     * 결재선명
     */
    @Size(max = 200, message = "결재선명은 200자 이내로 입력해주세요.")
    private String approvalLineName;

    /**
     * 팝업 제목
     */
    @Size(max = 200, message = "팝업 제목은 200자 이내로 입력해주세요.")
    private String popupTitle;

    /**
     * 수정가능여부 (Y/N)
     */
    private String isEditable;

    /**
     * 비고
     */
    @Size(max = 500, message = "비고는 500자 이내로 입력해주세요.")
    private String remarks;

    /**
     * 결재선 단계 목록 (전체 교체)
     */
    private List<CreateApprovalLineStepRequest> steps;
}
