package com.rsms.domain.position.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 직책 엔티티
 *
 * @description 원장차수별 직책 정보를 관리하는 엔티티
 * @author Claude AI
 * @since 2025-10-20
 */
@Entity
@Table(name = "positions", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Position {

    /**
     * 직책ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "positions_id")
    private Long positionsId;

    /**
     * 원장차수ID
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 직책코드
     */
    @Column(name = "positions_cd", length = 20, nullable = false)
    private String positionsCd;

    /**
     * 직책명
     */
    @Column(name = "positions_name", length = 200, nullable = false)
    private String positionsName;

    /**
     * 본부코드
     */
    @Column(name = "hq_code", length = 20, nullable = false)
    private String hqCode;

    /**
     * 본부명
     */
    @Column(name = "hq_name", length = 200, nullable = false)
    private String hqName;

    /**
     * 만료일
     */
    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;

    /**
     * 상태
     */
    @Column(name = "positions_status", length = 20)
    private String positionsStatus;

    /**
     * 사용여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive;

    /**
     * 겸직여부 (Y: 겸직, N: 전임)
     */
    @Column(name = "is_concurrent", length = 1, nullable = false)
    private String isConcurrent;

    /**
     * 임원사번
     */
    @Column(name = "executive_emp_no", length = 50)
    private String executiveEmpNo;

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
     * 직책 정보 수정
     */
    public void update(String positionsName, String hqName, String executiveEmpNo, String updatedBy) {
        if (positionsName != null && !positionsName.isBlank()) {
            this.positionsName = positionsName;
        }

        if (hqName != null && !hqName.isBlank()) {
            this.hqName = hqName;
        }

        // 임원사번 업데이트 (null 허용)
        this.executiveEmpNo = executiveEmpNo;

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
     * 겸직 여부 확인
     */
    public boolean isConcurrentPosition() {
        return "Y".equals(this.isConcurrent);
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
        if (this.isConcurrent == null) {
            this.isConcurrent = "N";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
