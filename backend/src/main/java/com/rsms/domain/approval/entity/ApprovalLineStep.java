package com.rsms.domain.approval.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 결재선 단계 엔티티
 *
 * @description 결재선의 각 단계를 정의하는 테이블
 * - 결재 순서, 결재 유형, 결재자 정보 등을 관리
 * - ApprovalLine과 N:1 관계
 * - SQL 스키마: approval_line_steps 테이블
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Entity
@Table(name = "approval_line_steps", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLineStep {

    /**
     * 결재선단계ID (PK)
     * - VARCHAR(20) 타입, 함수로 생성 (예: ALS00000001)
     */
    @Id
    @Column(name = "approval_line_step_id", length = 20)
    private String approvalLineStepId;

    /**
     * 결재선 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_line_id", nullable = false)
    private ApprovalLine approvalLine;

    /**
     * 단계 순서
     * - 결재 진행 순서 (1, 2, 3...)
     */
    @Column(name = "step_sequence", nullable = false)
    private Integer stepOrder;

    /**
     * 단계명
     * - 예: 기안, 검토, 승인, 최종승인
     */
    @Column(name = "step_name", length = 100, nullable = false)
    private String stepName;

    /**
     * 단계유형코드
     * - DRAFT: 기안
     * - REVIEW: 검토
     * - APPROVE: 승인
     * - FINAL: 최종승인
     */
    @Column(name = "step_type_cd", length = 10, nullable = false)
    private String approvalTypeCd;

    /**
     * 결재자유형코드
     * - POSITION: 직책 지정
     * - DEPT: 부서장
     * - USER: 사용자 지정
     */
    @Column(name = "approver_type_cd", length = 10, nullable = false)
    private String approverTypeCd;

    /**
     * 결재자ID
     * - approver_type_cd가 USER인 경우 사용자ID
     * - approver_type_cd가 POSITION인 경우 직책ID
     * - approver_type_cd가 DEPT인 경우 부서코드
     */
    @Column(name = "approver_id", length = 50)
    private String approverId;

    /**
     * 결재자명 (캐싱용)
     * - 결재자 표시를 위한 이름 저장
     */
    @Column(name = "approver_name", length = 100)
    private String approverName;

    /**
     * 필수여부
     * - Y: 필수 결재
     * - N: 선택 결재 (건너뛸 수 있음)
     */
    @Column(name = "is_required_yn", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isRequired = "Y";

    /**
     * 사용여부
     * - Y: 사용
     * - N: 미사용
     */
    @Column(name = "is_active", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isActive = "Y";

    /**
     * 비고
     */
    @Column(name = "remarks", length = 500)
    private String remarks;

    /**
     * 생성자ID
     */
    @Column(name = "created_by", length = 50, nullable = false)
    private String createdBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 단계 정보 수정
     */
    public void update(String stepName, String approvalTypeCd, String approverTypeCd,
                       String approverId, String approverName, String isRequired,
                       String remarks) {
        if (stepName != null && !stepName.isBlank()) {
            this.stepName = stepName;
        }
        this.approvalTypeCd = approvalTypeCd;
        this.approverTypeCd = approverTypeCd;
        this.approverId = approverId;
        this.approverName = approverName;
        this.isRequired = isRequired != null ? isRequired : "Y";
        this.remarks = remarks;
    }

    /**
     * 필수 결재 여부 확인
     */
    public boolean isMandatory() {
        return "Y".equals(this.isRequired);
    }

    /**
     * 기안 단계인지 확인
     */
    public boolean isDraft() {
        return "DRAFT".equals(this.approvalTypeCd);
    }

    /**
     * 최종 승인 단계인지 확인
     */
    public boolean isFinalApproval() {
        return "FINAL".equals(this.approvalTypeCd);
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isRequired == null) {
            this.isRequired = "Y";
        }
        if (this.isActive == null) {
            this.isActive = "Y";
        }
    }
}
