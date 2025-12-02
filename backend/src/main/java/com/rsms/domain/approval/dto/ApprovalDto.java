package com.rsms.domain.approval.dto;

import com.rsms.domain.approval.entity.Approval;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 결재 문서 응답 DTO
 *
 * @description 결재 문서 정보 전달용 DTO
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDto {

    /**
     * 결재ID
     */
    private String approvalId;

    /**
     * 결재번호
     */
    private String approvalNo;

    /**
     * 제목
     */
    private String title;

    /**
     * 내용
     */
    private String content;

    /**
     * 업무구분코드
     */
    private String workTypeCd;

    /**
     * 업무구분명 (표시용)
     */
    private String workTypeName;

    /**
     * 결재상태코드
     */
    private String approvalStatusCd;

    /**
     * 결재상태명 (표시용)
     */
    private String approvalStatusName;

    /**
     * 결재선ID
     */
    private String approvalLineId;

    /**
     * 기안자ID
     */
    private String drafterId;

    /**
     * 기안자명
     */
    private String drafterName;

    /**
     * 기안부서ID
     */
    private String drafterDeptId;

    /**
     * 기안부서명
     */
    private String drafterDeptName;

    /**
     * 기안자직책
     */
    private String drafterPosition;

    /**
     * 기안일시
     */
    private LocalDateTime draftDate;

    /**
     * 현재 결재자ID
     */
    private String currentApproverId;

    /**
     * 현재 결재자명
     */
    private String currentApproverName;

    /**
     * 현재 단계
     */
    private Integer currentStep;

    /**
     * 총 단계 수
     */
    private Integer totalSteps;

    /**
     * 결재 진행률 (표시용)
     * - 예: "2/3"
     */
    private String approvalSchedule;

    /**
     * 최종결재자ID
     */
    private String finalApproverId;

    /**
     * 최종결재자명
     */
    private String finalApproverName;

    /**
     * 최종결재일시
     */
    private LocalDateTime finalApprovalDate;

    /**
     * 완료일시
     */
    private LocalDateTime completedDate;

    /**
     * 반려일시
     */
    private LocalDateTime rejectedDate;

    /**
     * 반려사유
     */
    private String rejectReason;

    /**
     * 회수일시
     */
    private LocalDateTime withdrawnDate;

    /**
     * 참조유형
     */
    private String referenceType;

    /**
     * 참조ID
     */
    private String referenceId;

    /**
     * 우선순위
     */
    private String priorityCd;

    /**
     * 우선순위명 (표시용)
     */
    private String priorityName;

    /**
     * 완료예정일
     */
    private java.time.LocalDate dueDate;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 결재 이력 목록
     */
    private List<ApprovalHistoryDto> histories;

    /**
     * 엔티티 → DTO 변환
     */
    public static ApprovalDto fromEntity(Approval entity) {
        if (entity == null) return null;

        ApprovalDtoBuilder builder = ApprovalDto.builder()
                .approvalId(entity.getApprovalId())
                .approvalNo(entity.getApprovalNo())
                .title(entity.getTitle())
                .content(entity.getContent())
                .workTypeCd(entity.getWorkTypeCd())
                .approvalStatusCd(entity.getApprovalStatusCd())
                .approvalLineId(entity.getApprovalLineId())
                .drafterId(entity.getDrafterId())
                .drafterName(entity.getDrafterName())
                .drafterDeptId(entity.getDrafterDeptId())
                .drafterDeptName(entity.getDrafterDeptName())
                .drafterPosition(entity.getDrafterPosition())
                .draftDate(entity.getDraftDate())
                .currentApproverId(entity.getCurrentApproverId())
                .currentApproverName(entity.getCurrentApproverName())
                .currentStep(entity.getCurrentStep())
                .totalSteps(entity.getTotalSteps())
                .finalApproverId(entity.getFinalApproverId())
                .finalApproverName(entity.getFinalApproverName())
                .finalApprovalDate(entity.getFinalApprovalDate())
                .completedDate(entity.getCompletedDate())
                .rejectedDate(entity.getRejectedDate())
                .rejectReason(entity.getRejectReason())
                .withdrawnDate(entity.getWithdrawnDate())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .priorityCd(entity.getPriorityCd())
                .dueDate(entity.getDueDate())
                .createdAt(entity.getCreatedAt());

        // 업무구분명 매핑
        String workTypeName = switch (entity.getWorkTypeCd()) {
            case "WRS" -> "책무구조도";
            case "IMPL" -> "이행점검";
            case "IMPROVE" -> "개선이행";
            default -> entity.getWorkTypeCd();
        };
        builder.workTypeName(workTypeName);

        // 결재상태명 매핑
        String approvalStatusName = switch (entity.getApprovalStatusCd()) {
            case "01" -> "기안";
            case "02" -> "진행중";
            case "03" -> "완료";
            case "04" -> "반려";
            case "05" -> "회수";
            default -> entity.getApprovalStatusCd();
        };
        builder.approvalStatusName(approvalStatusName);

        // 우선순위명 매핑
        if (entity.getPriorityCd() != null) {
            String priorityName = switch (entity.getPriorityCd()) {
                case "HIGH" -> "높음";
                case "MEDIUM" -> "보통";
                case "LOW" -> "낮음";
                default -> entity.getPriorityCd();
            };
            builder.priorityName(priorityName);
        }

        // 결재 진행률 생성
        builder.approvalSchedule(entity.getCurrentStep() + "/" + entity.getTotalSteps());

        // 이력 목록 매핑
        if (entity.getHistories() != null && !entity.getHistories().isEmpty()) {
            builder.histories(entity.getHistories().stream()
                    .map(ApprovalHistoryDto::fromEntity)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
