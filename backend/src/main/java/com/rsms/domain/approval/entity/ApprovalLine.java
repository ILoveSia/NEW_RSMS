package com.rsms.domain.approval.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 결재선 마스터 엔티티
 *
 * @description 업무별 결재선을 정의하는 마스터 테이블
 * - 결재선명, 업무구분, 사용여부 등을 관리
 * - 하위에 결재선 단계(ApprovalLineStep)를 가짐
 * - SQL 스키마: approval_lines 테이블
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Entity
@Table(name = "approval_lines", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLine {

    /**
     * 결재선ID (PK)
     * - VARCHAR(20) 타입
     */
    @Id
    @Column(name = "approval_line_id", length = 20)
    private String approvalLineId;

    /**
     * 결재선명
     */
    @Column(name = "approval_line_name", length = 100, nullable = false)
    private String approvalLineName;

    /**
     * 업무구분코드
     * - WRS: 책무구조도
     * - IMPL: 이행점검
     * - IMPROVE: 개선이행
     */
    @Column(name = "work_type_cd", length = 10, nullable = false)
    private String workTypeCd;

    /**
     * 팝업 제목
     * - 결재 팝업에 표시될 제목
     */
    @Column(name = "popup_title", length = 200)
    private String popupTitle;

    /**
     * 설명
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * 팝업 URL
     */
    @Column(name = "popup_url", length = 500)
    private String popupUrl;

    /**
     * 팝업여부
     * - Y: 팝업, N: 비팝업
     */
    @Column(name = "is_popup_yn", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isPopupYn = "N";

    /**
     * 수정가능여부
     * - Y: 결재 요청 시 결재선 수정 가능
     * - N: 결재선 수정 불가
     */
    @Column(name = "is_editable_yn", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isEditable = "Y";

    /**
     * 필수여부
     * - Y: 필수, N: 선택
     */
    @Column(name = "is_required_yn", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isRequiredYn = "Y";

    /**
     * 정렬순서
     * - 동일 업무구분 내 표시 순서
     */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sequence = 1;

    /**
     * 사용여부
     * - Y: 사용, N: 미사용
     */
    @Column(name = "is_active", columnDefinition = "bpchar(1)")
    @Builder.Default
    private String isUsed = "Y";

    /**
     * 비고
     */
    @Column(name = "remarks", length = 500)
    private String remarks;

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
     * 결재선 단계 목록
     * - 1:N 관계
     */
    @OneToMany(mappedBy = "approvalLine", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<ApprovalLineStep> steps = new ArrayList<>();

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 결재선 정보 수정
     */
    public void update(String approvalLineName, String popupTitle, String isEditable,
                       String remarks, String updatedBy) {
        if (approvalLineName != null && !approvalLineName.isBlank()) {
            this.approvalLineName = approvalLineName;
        }
        this.popupTitle = popupTitle;
        this.isEditable = isEditable != null ? isEditable : "Y";
        this.remarks = remarks;
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 사용 설정
     */
    public void activate() {
        this.isUsed = "Y";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 미사용 설정
     */
    public void deactivate() {
        this.isUsed = "N";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 사용 중인지 확인
     */
    public boolean isActive() {
        return "Y".equals(this.isUsed);
    }

    /**
     * 수정 가능한지 확인
     */
    public boolean canEdit() {
        return "Y".equals(this.isEditable);
    }

    /**
     * 결재선 단계 추가
     */
    public void addStep(ApprovalLineStep step) {
        this.steps.add(step);
        step.setApprovalLine(this);
    }

    /**
     * 결재선 단계 제거
     */
    public void removeStep(ApprovalLineStep step) {
        this.steps.remove(step);
        step.setApprovalLine(null);
    }

    /**
     * 모든 결재선 단계 제거
     */
    public void clearSteps() {
        this.steps.clear();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isUsed == null) {
            this.isUsed = "Y";
        }
        if (this.isEditable == null) {
            this.isEditable = "Y";
        }
        if (this.isPopupYn == null) {
            this.isPopupYn = "N";
        }
        if (this.isRequiredYn == null) {
            this.isRequiredYn = "Y";
        }
        if (this.sequence == null) {
            this.sequence = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
