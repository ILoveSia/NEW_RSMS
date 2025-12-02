package com.rsms.domain.approval.dto;

import com.rsms.domain.approval.entity.ApprovalLine;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 결재선 응답 DTO
 *
 * @description 결재선 정보 전달용 DTO
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLineDto {

    /**
     * 결재선ID
     */
    private String approvalLineId;

    /**
     * 결재선명
     */
    private String approvalLineName;

    /**
     * 업무구분코드
     */
    private String workTypeCd;

    /**
     * 업무구분명 (표시용)
     */
    private String workTypeName;

    /**
     * 팝업 제목
     */
    private String popupTitle;

    /**
     * 순서
     */
    private Integer sequence;

    /**
     * 사용여부
     */
    private String isUsed;

    /**
     * 수정가능여부
     */
    private String isEditable;

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
     * 수정자ID
     */
    private String updatedBy;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 결재선 단계 목록
     */
    private List<ApprovalLineStepDto> steps;

    /**
     * 엔티티 → DTO 변환
     */
    public static ApprovalLineDto fromEntity(ApprovalLine entity) {
        if (entity == null) return null;

        ApprovalLineDtoBuilder builder = ApprovalLineDto.builder()
                .approvalLineId(entity.getApprovalLineId())
                .approvalLineName(entity.getApprovalLineName())
                .workTypeCd(entity.getWorkTypeCd())
                .popupTitle(entity.getPopupTitle())
                .sequence(entity.getSequence())
                .isUsed(entity.getIsUsed())
                .isEditable(entity.getIsEditable())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt());

        // 업무구분명 매핑
        String workTypeName = switch (entity.getWorkTypeCd()) {
            case "WRS" -> "책무구조도";
            case "IMPL" -> "이행점검";
            case "IMPROVE" -> "개선이행";
            default -> entity.getWorkTypeCd();
        };
        builder.workTypeName(workTypeName);

        // 단계 목록 매핑
        if (entity.getSteps() != null && !entity.getSteps().isEmpty()) {
            builder.steps(entity.getSteps().stream()
                    .map(ApprovalLineStepDto::fromEntity)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
