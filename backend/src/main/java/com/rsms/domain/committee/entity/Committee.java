package com.rsms.domain.committee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회의체 엔티티
 *
 * @description 원장차수별 회의체 정보를 관리하는 엔티티
 * - 데이터베이스 테이블: rsms.committees
 * - PK: committees_id (BIGSERIAL, 자동증가)
 *
 * @author Claude AI
 * @since 2025-10-24
 */
@Entity
@Table(name = "committees", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Committee {

    /**
     * 회의체ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "committees_id")
    private Long committeesId;

    /**
     * 원장차수ID
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 회의체명
     */
    @Column(name = "committees_title", length = 100, nullable = false)
    private String committeesTitle;

    /**
     * 개최주기
     */
    @Column(name = "committee_frequency", length = 20)
    private String committeeFrequency;

    /**
     * 주요심의 의결 사항
     */
    @Column(name = "resolution_matters", length = 1000)
    private String resolutionMatters;

    /**
     * 사용여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive;

    /**
     * 생성자
     */
    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 100, nullable = false)
    private String updatedBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 회의체 정보 수정
     */
    public void update(String committeesTitle, String committeeFrequency, String resolutionMatters, String updatedBy) {
        if (committeesTitle != null && !committeesTitle.isBlank()) {
            this.committeesTitle = committeesTitle;
        }

        if (committeeFrequency != null && !committeeFrequency.isBlank()) {
            this.committeeFrequency = committeeFrequency;
        }

        if (resolutionMatters != null) {
            this.resolutionMatters = resolutionMatters;
        }

        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 활성화
     */
    public void activate() {
        this.isActive = "Y";
    }

    /**
     * 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
    }

    /**
     * 활성 상태인지 확인
     */
    public boolean isActiveStatus() {
        return "Y".equals(this.isActive);
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
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
