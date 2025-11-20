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

    // ===== 기본키 =====
    /**
     * 책무기술서_임원_정보ID (PK)
     */
    private String respStmtExecId;

    // ===== 외래키 =====
    /**
     * 직책ID (FK)
     */
    private Long positionsId;

    /**
     * 원장차수ID (FK)
     */
    private String ledgerOrderId;

    /**
     * 직책명 (positions 테이블 JOIN)
     */
    private String positionName;

    // ===== 기본 정보 (resp_statement_execs 테이블 컬럼) =====
    /**
     * 사용자ID
     */
    private String userId;

    /**
     * 임원성명
     */
    private String executiveName;

    /**
     * 사번
     */
    private String employeeNo;

    /**
     * 현직책 부여일
     */
    private String positionAssignedDate;

    /**
     * 겸직사항
     */
    private String concurrentPosition;

    /**
     * 직무대행자 내용
     */
    private String actingOfficerInfo;

    /**
     * 비고
     */
    private String remarks;

    // ===== 책무기술서 정보 =====
    /**
     * 책무개요 내용
     */
    private String responsibilityOverview;

    /**
     * 책무 배분일자
     */
    private String responsibilityAssignedDate;

    // ===== 상태 정보 =====
    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;

    // ===== 공통 컬럼 (Audit) =====
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

    // ===== 추가 정보 (프론트엔드 호환성) =====
    /**
     * 책무기술서 ID (respStmtExecId 별칭)
     */
    private String id;

    /**
     * 직책ID (positionsId 별칭)
     */
    private Long positionId;

    /**
     * 상태 (draft, pending, approved 등) - 향후 확장용
     */
    private String status;

    /**
     * 결재상태 (pending, approved, rejected) - 향후 확장용
     */
    private String approvalStatus;

    /**
     * 책무배경 - 향후 확장용
     */
    private String responsibilityBackground;

    /**
     * 책무배분일 (responsibilityAssignedDate 별칭)
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
     * - resp_statement_execs 테이블의 모든 컬럼을 매핑
     */
    public static RespStatementResponse fromEntity(
            com.rsms.domain.responsibility.entity.RespStatementExec entity) {
        String respStmtExecIdStr = entity.getRespStmtExecId() != null
                ? entity.getRespStmtExecId().toString() : null;

        return RespStatementResponse.builder()
                // 기본키
                .respStmtExecId(respStmtExecIdStr)
                // 외래키
                .positionsId(entity.getPosition() != null ? entity.getPosition().getPositionsId() : null)
                .ledgerOrderId(entity.getLedgerOrder() != null ? entity.getLedgerOrder().getLedgerOrderId() : null)
                .positionName(entity.getPosition() != null ? entity.getPosition().getPositionsName() : null)
                // 기본 정보 (resp_statement_execs 테이블 컬럼)
                .userId(entity.getUserId())
                .executiveName(entity.getExecutiveName())
                .employeeNo(entity.getEmployeeNo())
                .positionAssignedDate(entity.getPositionAssignedDate() != null
                        ? entity.getPositionAssignedDate().toString() : null)
                .concurrentPosition(entity.getConcurrentPosition())
                .actingOfficerInfo(entity.getActingOfficerInfo())
                .remarks(entity.getRemarks())
                // 책무기술서 정보
                .responsibilityOverview(entity.getResponsibilityOverview())
                .responsibilityAssignedDate(entity.getResponsibilityAssignedDate() != null
                        ? entity.getResponsibilityAssignedDate().toString() : null)
                // 상태 정보
                .isActive(entity.getIsActive()) // 'Y' or 'N' 문자열 그대로
                // 공통 컬럼 (Audit)
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
                .updatedBy(entity.getUpdatedBy())
                // 추가 정보 (프론트엔드 호환성 - 별칭)
                .id(respStmtExecIdStr) // respStmtExecId 별칭
                .positionId(entity.getPosition() != null ? entity.getPosition().getPositionsId() : null) // positionsId 별칭
                .status("draft") // TODO: 실제 상태 필드 추가 필요
                .approvalStatus("pending") // TODO: 실제 결재상태 필드 추가 필요
                .responsibilityBackgroundDate(entity.getResponsibilityAssignedDate() != null
                        ? entity.getResponsibilityAssignedDate().toString() : null) // responsibilityAssignedDate 별칭
                // mainCommittees는 추후 추가 (별도 조회 필요)
                .build();
    }
}
