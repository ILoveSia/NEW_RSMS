package com.rsms.domain.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * 결재선 생성 요청 DTO
 *
 * @description 결재선 생성 시 필요한 데이터
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApprovalLineRequest {

    /**
     * 결재선명
     */
    @NotBlank(message = "결재선명은 필수입니다.")
    @Size(max = 200, message = "결재선명은 200자 이내로 입력해주세요.")
    private String approvalLineName;

    /**
     * 업무구분코드
     */
    @NotBlank(message = "업무구분은 필수입니다.")
    @Size(max = 10, message = "업무구분코드는 10자 이내로 입력해주세요.")
    private String workTypeCd;

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
     * 결재선 단계 목록
     */
    private List<CreateApprovalLineStepRequest> steps;
}
