package com.rsms.domain.approval.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 결재 이력 엔티티
 *
 * @description 결재 문서의 처리 이력을 기록하는 테이블
 * - 각 결재 단계별 처리 정보를 저장
 * - Approval과 N:1 관계
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Entity
@Table(name = "approval_histories", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalHistory {

    /**
     * 결재이력ID (PK)
     * - VARCHAR(20) 타입, 함수로 생성 (예: AH00000001)
     */
    @Id
    @Column(name = "approval_history_id", length = 20)
    private String approvalHistoryId;

    /**
     * 결재 문서 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private Approval approval;

    /**
     * 단계 순서
     */
    @Column(name = "step_sequence", nullable = false)
    private Integer stepSequence;

    /**
     * 단계명
     */
    @Column(name = "step_name", length = 100)
    private String stepName;

    /**
     * 단계유형코드
     * - DRAFT: 기안
     * - REVIEW: 검토
     * - APPROVE: 승인
     * - FINAL: 최종승인
     */
    @Column(name = "step_type_cd", length = 10)
    private String stepTypeCd;

    /**
     * 결재자ID
     */
    @Column(name = "approver_id", length = 50, nullable = false)
    private String approverId;

    /**
     * 결재자명
     */
    @Column(name = "approver_name", length = 100, nullable = false)
    private String approverName;

    /**
     * 결재자부서ID
     */
    @Column(name = "approver_dept_id", length = 50)
    private String approverDeptId;

    /**
     * 결재자부서명
     */
    @Column(name = "approver_dept_name", length = 100)
    private String approverDeptName;

    /**
     * 결재자직책
     */
    @Column(name = "approver_position", length = 100)
    private String approverPosition;

    /**
     * 처리코드
     * - DRAFT: 기안
     * - APPROVE: 승인
     * - REJECT: 반려
     * - WITHDRAW: 회수
     * - FORWARD: 전달
     */
    @Column(name = "action_cd", length = 10, nullable = false)
    private String actionCd;

    /**
     * 처리일시
     */
    @Column(name = "action_date")
    private LocalDateTime actionDate;

    /**
     * 처리의견
     */
    @Column(name = "action_comment", length = 2000)
    private String actionComment;

    /**
     * 대리결재여부
     * - SQL: CHAR(1), 'Y' 또는 'N'
     */
    @Column(name = "is_delegate_yn", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isDelegateYn = "N";

    /**
     * 위임자ID
     */
    @Column(name = "delegate_from_id", length = 50)
    private String delegateFromId;

    /**
     * 위임자명
     */
    @Column(name = "delegate_from_name", length = 100)
    private String delegateFromName;

    /**
     * 생성자ID
     */
    @Column(name = "created_by", length = 50)
    private String createdBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 결재 처리 (승인)
     */
    public void approve(String comment) {
        this.actionCd = "APPROVE";
        this.actionDate = LocalDateTime.now();
        this.actionComment = comment;
    }

    /**
     * 반려 처리
     */
    public void reject(String comment) {
        this.actionCd = "REJECT";
        this.actionDate = LocalDateTime.now();
        this.actionComment = comment;
    }

    /**
     * 승인 상태인지 확인
     */
    public boolean isApproved() {
        return "APPROVE".equals(this.actionCd);
    }

    /**
     * 반려 상태인지 확인
     */
    public boolean isRejected() {
        return "REJECT".equals(this.actionCd);
    }

    /**
     * 기안 상태인지 확인
     */
    public boolean isDraft() {
        return "DRAFT".equals(this.actionCd);
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isDelegateYn == null) {
            this.isDelegateYn = "N";
        }
        if (this.actionDate == null) {
            this.actionDate = LocalDateTime.now();
        }
    }
}
