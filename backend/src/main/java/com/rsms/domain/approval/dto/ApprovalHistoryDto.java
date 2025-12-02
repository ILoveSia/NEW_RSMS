package com.rsms.domain.approval.dto;

import com.rsms.domain.approval.entity.ApprovalHistory;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 결재 이력 응답 DTO
 *
 * @description 결재 이력 정보 전달용 DTO
 * - SQL 테이블 approval_histories와 매핑
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalHistoryDto {

    /**
     * 결재이력ID (VARCHAR(20))
     */
    private String approvalHistoryId;

    /**
     * 결재ID
     */
    private String approvalId;

    /**
     * 단계 순서
     */
    private Integer stepSequence;

    /**
     * 단계명
     */
    private String stepName;

    /**
     * 단계유형코드 (DRAFT/REVIEW/APPROVE/FINAL)
     */
    private String stepTypeCd;

    /**
     * 단계유형명 (표시용)
     */
    private String stepTypeName;

    /**
     * 결재자ID
     */
    private String approverId;

    /**
     * 결재자명
     */
    private String approverName;

    /**
     * 결재자부서ID
     */
    private String approverDeptId;

    /**
     * 결재자부서명
     */
    private String approverDeptName;

    /**
     * 결재자직책
     */
    private String approverPosition;

    /**
     * 처리코드 (DRAFT/APPROVE/REJECT/WITHDRAW/FORWARD)
     */
    private String actionCd;

    /**
     * 처리코드명 (표시용)
     */
    private String actionName;

    /**
     * 처리일시
     */
    private LocalDateTime actionDate;

    /**
     * 처리의견
     */
    private String actionComment;

    /**
     * 대리결재여부
     */
    private String isDelegateYn;

    /**
     * 위임자ID
     */
    private String delegateFromId;

    /**
     * 위임자명
     */
    private String delegateFromName;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 엔티티 → DTO 변환
     */
    public static ApprovalHistoryDto fromEntity(ApprovalHistory entity) {
        if (entity == null) return null;

        ApprovalHistoryDtoBuilder builder = ApprovalHistoryDto.builder()
                .approvalHistoryId(entity.getApprovalHistoryId())
                .approvalId(entity.getApproval() != null ?
                        entity.getApproval().getApprovalId() : null)
                .stepSequence(entity.getStepSequence())
                .stepName(entity.getStepName())
                .stepTypeCd(entity.getStepTypeCd())
                .approverId(entity.getApproverId())
                .approverName(entity.getApproverName())
                .approverDeptId(entity.getApproverDeptId())
                .approverDeptName(entity.getApproverDeptName())
                .approverPosition(entity.getApproverPosition())
                .actionCd(entity.getActionCd())
                .actionDate(entity.getActionDate())
                .actionComment(entity.getActionComment())
                .isDelegateYn(entity.getIsDelegateYn())
                .delegateFromId(entity.getDelegateFromId())
                .delegateFromName(entity.getDelegateFromName())
                .createdAt(entity.getCreatedAt());

        // 단계유형명 매핑
        if (entity.getStepTypeCd() != null) {
            String stepTypeName = switch (entity.getStepTypeCd()) {
                case "DRAFT" -> "기안";
                case "REVIEW" -> "검토";
                case "APPROVE" -> "승인";
                case "FINAL" -> "최종승인";
                default -> entity.getStepTypeCd();
            };
            builder.stepTypeName(stepTypeName);
        }

        // 처리코드명 매핑
        if (entity.getActionCd() != null) {
            String actionName = switch (entity.getActionCd()) {
                case "DRAFT" -> "기안";
                case "APPROVE" -> "승인";
                case "REJECT" -> "반려";
                case "WITHDRAW" -> "회수";
                case "FORWARD" -> "전달";
                default -> entity.getActionCd();
            };
            builder.actionName(actionName);
        }

        return builder.build();
    }
}
