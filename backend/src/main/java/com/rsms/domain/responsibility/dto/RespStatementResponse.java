package com.rsms.domain.responsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 책무기술서 응답 DTO
 * - 클라이언트로 반환하는 데이터 구조
 *
 * @author RSMS
 * @since 2025-11-07
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespStatementResponse {

    /**
     * 책무기술서 ID
     */
    private String id;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책ID
     */
    private Long positionId;

    /**
     * 직책명
     */
    private String positionName;

    /**
     * 상태 (draft, pending, approved 등)
     */
    private String status;

    /**
     * 결재상태 (pending, approved, rejected)
     */
    private String approvalStatus;

    /**
     * 활성화 여부
     */
    private Boolean isActive;

    /**
     * 생성일시
     */
    private String createdAt;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 수정일시
     */
    private String updatedAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 책무개요
     */
    private String responsibilityOverview;

    /**
     * 책무배경
     */
    private String responsibilityBackground;

    /**
     * 책무배분일
     */
    private String responsibilityBackgroundDate;

    /**
     * 주관회의체 목록
     */
    private List<MainCommitteeResponse> mainCommittees;

    /**
     * 주관회의체 응답 DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MainCommitteeResponse {
        private String id;              // ID
        private String committeeName;   // 회의체명
        private String chairperson;     // 위원장
        private String frequency;       // 개최주기
        private String mainAgenda;      // 주요안건
    }

    /**
     * Entity에서 Response DTO로 변환
     */
    public static RespStatementResponse fromEntity(
            com.rsms.domain.responsibility.entity.RespStatementExec entity) {
        return RespStatementResponse.builder()
                .id(entity.getRespStmtExecId().toString())
                .ledgerOrderId(entity.getLedgerOrder().getLedgerOrderId())
                .positionId(entity.getPosition().getPositionsId())
                .positionName(entity.getPosition().getPositionsName())
                .status("draft") // TODO: 실제 상태 필드 추가 필요
                .approvalStatus("pending") // TODO: 실제 결재상태 필드 추가 필요
                .isActive("Y".equals(entity.getIsActive()))
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
                .updatedBy(entity.getUpdatedBy())
                .responsibilityOverview(entity.getResponsibilityOverview())
                .responsibilityBackgroundDate(entity.getResponsibilityAssignedDate() != null
                    ? entity.getResponsibilityAssignedDate().toString() : null)
                // TODO: mainCommittees는 추후 추가 (별도 조회 필요)
                .build();
    }
}
