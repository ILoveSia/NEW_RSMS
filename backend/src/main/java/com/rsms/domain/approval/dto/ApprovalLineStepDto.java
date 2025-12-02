package com.rsms.domain.approval.dto;

import com.rsms.domain.approval.entity.ApprovalLineStep;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 결재선 단계 응답 DTO
 *
 * @description 결재선 단계 정보 전달용 DTO
 * - SQL 테이블 approval_line_steps와 매핑
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLineStepDto {

    /**
     * 결재선단계ID (VARCHAR(20))
     */
    private String approvalLineStepId;

    /**
     * 결재선ID
     */
    private String approvalLineId;

    /**
     * 단계 순서
     */
    private Integer stepOrder;

    /**
     * 단계명
     */
    private String stepName;

    /**
     * 결재유형코드
     */
    private String approvalTypeCd;

    /**
     * 결재유형명 (표시용)
     */
    private String approvalTypeName;

    /**
     * 결재자유형코드
     */
    private String approverTypeCd;

    /**
     * 결재자유형명 (표시용)
     */
    private String approverTypeName;

    /**
     * 결재자ID
     */
    private String approverId;

    /**
     * 결재자명
     */
    private String approverName;

    /**
     * 필수여부
     */
    private String isRequired;

    /**
     * 비고
     */
    private String remarks;

    /**
     * 생성자ID
     */
    private String createdBy;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 엔티티 → DTO 변환
     */
    public static ApprovalLineStepDto fromEntity(ApprovalLineStep entity) {
        if (entity == null) return null;

        ApprovalLineStepDtoBuilder builder = ApprovalLineStepDto.builder()
                .approvalLineStepId(entity.getApprovalLineStepId())
                .approvalLineId(entity.getApprovalLine() != null ?
                        entity.getApprovalLine().getApprovalLineId() : null)
                .stepOrder(entity.getStepOrder())
                .stepName(entity.getStepName())
                .approvalTypeCd(entity.getApprovalTypeCd())
                .approverTypeCd(entity.getApproverTypeCd())
                .approverId(entity.getApproverId())
                .approverName(entity.getApproverName())
                .isRequired(entity.getIsRequired())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt());

        // 결재유형명 매핑
        String approvalTypeName = switch (entity.getApprovalTypeCd()) {
            case "DRAFT" -> "기안";
            case "REVIEW" -> "검토";
            case "APPROVE" -> "승인";
            case "FINAL" -> "최종승인";
            default -> entity.getApprovalTypeCd();
        };
        builder.approvalTypeName(approvalTypeName);

        // 결재자유형명 매핑
        String approverTypeName = switch (entity.getApproverTypeCd()) {
            case "POSITION" -> "직책 지정";
            case "DEPT" -> "부서장";
            case "USER" -> "사용자 지정";
            default -> entity.getApproverTypeCd();
        };
        builder.approverTypeName(approverTypeName);

        return builder.build();
    }
}
