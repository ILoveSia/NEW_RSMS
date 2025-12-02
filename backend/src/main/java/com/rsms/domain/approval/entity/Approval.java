package com.rsms.domain.approval.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 결재 문서 엔티티
 *
 * @description 결재 요청된 문서를 관리하는 테이블
 * - 결재번호, 제목, 상태, 기안자, 현결재자 등을 관리
 * - 하위에 결재 이력(ApprovalHistory)을 가짐
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Entity
@Table(name = "approvals", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval {

    /**
     * 결재ID (PK)
     * - 시퀀스로 자동 생성
     */
    @Id
    @Column(name = "approval_id", length = 20)
    private String approvalId;

    /**
     * 결재번호
     * - APR-YYYY-NNNNN 형식
     * - 예: APR-2025-00001
     */
    @Column(name = "approval_no", length = 50, nullable = false, unique = true)
    private String approvalNo;

    /**
     * 결재 제목
     */
    @Column(name = "title", length = 500, nullable = false)
    private String title;

    /**
     * 결재 내용
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    /**
     * 업무구분코드
     * - WRS: 책무구조도
     * - IMPL: 이행점검
     * - IMPROVE: 개선이행
     */
    @Column(name = "work_type_cd", length = 10, nullable = false)
    private String workTypeCd;

    /**
     * 결재유형코드
     * - PLAN_APPROVAL: 계획승인
     * - COMPLETE_APPROVAL: 완료승인
     * - RESULT_APPROVAL: 결과승인
     */
    @Column(name = "approval_type_cd", length = 20, nullable = false)
    private String approvalTypeCd;

    /**
     * 결재상태코드
     * - 01: 기안
     * - 02: 진행중
     * - 03: 완료
     * - 04: 반려
     * - 05: 회수
     */
    @Column(name = "approval_status_cd", length = 10, nullable = false)
    @Builder.Default
    private String approvalStatusCd = "01";

    /**
     * 결재선ID (FK)
     */
    @Column(name = "approval_line_id", length = 20)
    private String approvalLineId;

    /**
     * 기안자ID
     */
    @Column(name = "drafter_id", length = 50, nullable = false)
    private String drafterId;

    /**
     * 기안자명
     */
    @Column(name = "drafter_name", length = 100)
    private String drafterName;

    /**
     * 기안부서ID
     */
    @Column(name = "drafter_dept_id", length = 50)
    private String drafterDeptId;

    /**
     * 기안부서명
     */
    @Column(name = "drafter_dept_name", length = 100)
    private String drafterDeptName;

    /**
     * 기안자직책
     */
    @Column(name = "drafter_position", length = 100)
    private String drafterPosition;

    /**
     * 기안일시
     */
    @Column(name = "draft_date", nullable = false)
    private LocalDateTime draftDate;

    /**
     * 현재 결재자ID
     */
    @Column(name = "current_approver_id", length = 50)
    private String currentApproverId;

    /**
     * 현재 결재자명
     */
    @Column(name = "current_approver_name", length = 100)
    private String currentApproverName;

    /**
     * 현재 단계
     */
    @Column(name = "current_step")
    @Builder.Default
    private Integer currentStep = 1;

    /**
     * 총 단계 수
     */
    @Column(name = "total_steps")
    @Builder.Default
    private Integer totalSteps = 1;

    /**
     * 최종결재자ID
     */
    @Column(name = "final_approver_id", length = 50)
    private String finalApproverId;

    /**
     * 최종결재자명
     */
    @Column(name = "final_approver_name", length = 100)
    private String finalApproverName;

    /**
     * 최종결재일시
     */
    @Column(name = "final_approval_date")
    private LocalDateTime finalApprovalDate;

    /**
     * 완료일시
     */
    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    /**
     * 반려일시
     */
    @Column(name = "rejected_date")
    private LocalDateTime rejectedDate;

    /**
     * 반려사유
     */
    @Column(name = "reject_reason", length = 1000)
    private String rejectReason;

    /**
     * 회수일시
     */
    @Column(name = "withdrawn_date")
    private LocalDateTime withdrawnDate;

    /**
     * 참조유형 (필수)
     * - MGMT_ACTIVITY: 관리활동
     * - IMPL_INSPECTION_ITEM: 이행점검항목
     * - IMPROVEMENT: 개선이행
     */
    @Column(name = "reference_type", length = 50, nullable = false)
    private String referenceType;

    /**
     * 참조ID (필수)
     * - 연결된 원본 문서의 ID (테이블의 PK)
     */
    @Column(name = "reference_id", length = 50, nullable = false)
    private String referenceId;

    /**
     * 우선순위
     * - HIGH: 높음
     * - MEDIUM: 보통
     * - LOW: 낮음
     */
    @Column(name = "priority_cd", length = 10)
    @Builder.Default
    private String priorityCd = "MEDIUM";

    /**
     * 완료예정일
     */
    @Column(name = "due_date")
    private java.time.LocalDate dueDate;

    /**
     * 사용여부
     * - Y: 사용, N: 미사용
     */
    @Column(name = "is_active", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isActive = "Y";

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

    /**
     * 수정자ID
     */
    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 결재 이력 목록
     * - 단계 순서대로 정렬
     */
    @OneToMany(mappedBy = "approval", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepSequence ASC")
    @Builder.Default
    private List<ApprovalHistory> histories = new ArrayList<>();

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 결재 진행 (다음 단계로)
     */
    public void processApproval(String nextApproverId, String nextApproverName) {
        this.currentStep++;
        this.currentApproverId = nextApproverId;
        this.currentApproverName = nextApproverName;

        if (this.currentStep > this.totalSteps) {
            // 모든 결재 완료
            this.approvalStatusCd = "03";
            this.completedDate = LocalDateTime.now();
            this.currentApproverId = null;
            this.currentApproverName = null;
        } else {
            this.approvalStatusCd = "02";
        }
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 결재 완료 처리
     * - 마지막 단계 승인 시 호출
     * - currentStep을 totalSteps로 설정하여 진행률이 2/2로 표시되도록 함
     */
    public void complete() {
        this.currentStep = this.totalSteps;  // 진행률 2/2 표시를 위해 추가
        this.approvalStatusCd = "03";
        this.completedDate = LocalDateTime.now();
        this.currentApproverId = null;
        this.currentApproverName = null;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 반려 처리
     */
    public void reject(String reason) {
        this.approvalStatusCd = "04";
        this.rejectedDate = LocalDateTime.now();
        this.rejectReason = reason;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 회수 처리
     */
    public void withdraw() {
        this.approvalStatusCd = "05";
        this.withdrawnDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 진행중 상태인지 확인
     */
    public boolean isInProgress() {
        return "02".equals(this.approvalStatusCd);
    }

    /**
     * 완료 상태인지 확인
     */
    public boolean isCompleted() {
        return "03".equals(this.approvalStatusCd);
    }

    /**
     * 반려 상태인지 확인
     */
    public boolean isRejected() {
        return "04".equals(this.approvalStatusCd);
    }

    /**
     * 결재 가능 상태인지 확인
     * - 기안(01) 또는 진행중(02) 상태에서만 결재 가능
     */
    public boolean canProcess() {
        return "01".equals(this.approvalStatusCd) || "02".equals(this.approvalStatusCd);
    }

    /**
     * 결재 이력 추가
     */
    public void addHistory(ApprovalHistory history) {
        this.histories.add(history);
        history.setApproval(this);
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.draftDate == null) {
            this.draftDate = now;
        }
        if (this.approvalStatusCd == null) {
            this.approvalStatusCd = "01";
        }
        if (this.currentStep == null) {
            this.currentStep = 1;
        }
        if (this.totalSteps == null) {
            this.totalSteps = 1;
        }
        if (this.priorityCd == null) {
            this.priorityCd = "MEDIUM";
        }
        if (this.isActive == null) {
            this.isActive = "Y";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
