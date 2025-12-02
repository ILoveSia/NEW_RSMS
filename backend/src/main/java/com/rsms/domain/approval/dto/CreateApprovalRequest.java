package com.rsms.domain.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * 결재 요청 생성 DTO
 *
 * @description 결재 요청 시 필요한 데이터
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApprovalRequest {

    /**
     * 제목
     */
    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 500, message = "제목은 500자 이내로 입력해주세요.")
    private String title;

    /**
     * 내용
     */
    private String content;

    /**
     * 업무구분코드 (WRS, IMPL, IMPROVE)
     */
    @NotBlank(message = "업무구분은 필수입니다.")
    @Size(max = 10, message = "업무구분코드는 10자 이내로 입력해주세요.")
    private String workTypeCd;

    /**
     * 결재유형코드 (PLAN_APPROVAL, COMPLETE_APPROVAL, RESULT_APPROVAL)
     * - PLAN_APPROVAL: 계획승인
     * - COMPLETE_APPROVAL: 완료승인
     * - RESULT_APPROVAL: 결과승인
     */
    @NotBlank(message = "결재유형은 필수입니다.")
    @Size(max = 20, message = "결재유형코드는 20자 이내로 입력해주세요.")
    private String approvalTypeCd;

    /**
     * 결재선ID
     */
    @NotBlank(message = "결재선은 필수입니다.")
    private String approvalLineId;

    /**
     * 참조문서 유형 (MGMT_ACTIVITY, IMPL_INSPECTION_ITEM, IMPROVEMENT 등)
     * - 결재 문서와 연결된 원본 테이블 유형
     */
    @NotBlank(message = "참조문서 유형은 필수입니다.")
    @Size(max = 50, message = "참조문서 유형은 50자 이내로 입력해주세요.")
    private String refDocType;

    /**
     * 참조문서 ID
     * - 결재 문서와 연결된 원본 테이블의 PK
     */
    @NotBlank(message = "참조문서 ID는 필수입니다.")
    @Size(max = 50, message = "참조문서 ID는 50자 이내로 입력해주세요.")
    private String refDocId;

    /**
     * 긴급여부 (Y/N)
     */
    private String isUrgent;

    /**
     * 비고
     */
    @Size(max = 1000, message = "비고는 1000자 이내로 입력해주세요.")
    private String remarks;
}
