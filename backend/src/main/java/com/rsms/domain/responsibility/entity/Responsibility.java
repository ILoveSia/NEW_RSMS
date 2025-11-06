package com.rsms.domain.responsibility.entity;

import com.rsms.domain.position.entity.Position;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 책무 엔티티
 *
 * @description 원장차수별 직책에 대한 책무 정보를 관리하는 엔티티
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - PK를 자동증가에서 업무 코드로 변경
 */
@Entity
@Table(name = "responsibilities", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Responsibility {

    /**
     * 책무코드 (PK, 업무 코드)
     * 코드 생성 규칙: ledger_order_id + responsibility_cat + 순번(4자리)
     * 예시: "20250001RM0001"
     */
    @Id
    @Column(name = "responsibility_cd", length = 20, nullable = false)
    private String responsibilityCd;

    /**
     * 원장차수ID
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 직책ID
     */
    @Column(name = "positions_id", nullable = false, insertable = false, updatable = false)
    private Long positionsId;

    /**
     * 직책 엔티티 (ManyToOne 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "positions_id", nullable = false)
    private Position positions;

    /**
     * 책무카테고리 (RSBT_OBLG_CLCD)
     * 예시: RM (리스크관리), IC (내부통제), CP (준법감시)
     */
    @Column(name = "responsibility_cat", length = 20, nullable = false)
    private String responsibilityCat;

    /**
     * 책무정보 (책무 상세 설명)
     */
    @Column(name = "responsibility_info", length = 1000, nullable = false)
    private String responsibilityInfo;

    /**
     * 관련근거
     */
    @Column(name = "responsibility_legal", length = 1000, nullable = false)
    private String responsibilityLegal;

    /**
     * 만료일
     */
    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;

    /**
     * 상태
     */
    @Column(name = "responsibility_status", length = 20)
    private String responsibilityStatus;

    /**
     * 사용여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive;

    /**
     * 생성자
     */
    @Column(name = "created_by", length = 50, nullable = false)
    private String createdBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 50, nullable = false)
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
     * 책무 정보 수정
     */
    public void update(String responsibilityInfo, String responsibilityLegal, String isActive, String updatedBy) {
        if (responsibilityInfo != null && !responsibilityInfo.isBlank()) {
            this.responsibilityInfo = responsibilityInfo;
        }

        if (responsibilityLegal != null && !responsibilityLegal.isBlank()) {
            this.responsibilityLegal = responsibilityLegal;
        }

        if (isActive != null && !isActive.isBlank()) {
            this.isActive = isActive;
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

    /**
     * 만료 여부 확인
     */
    public boolean isExpired() {
        return this.expirationDate != null && this.expirationDate.isBefore(LocalDate.now());
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
        if (this.expirationDate == null) {
            this.expirationDate = LocalDate.of(9999, 12, 31);
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
