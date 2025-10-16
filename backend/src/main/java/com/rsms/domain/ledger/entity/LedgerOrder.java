package com.rsms.domain.ledger.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 원장차수 엔티티
 *
 * @description 원장차수 정보를 관리하는 엔티티
 * @author Claude AI
 * @since 2025-10-16
 */
@Entity
@Table(name = "ledger_order", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerOrder {

    /**
     * 원장차수ID (년도4자리+순번4자리, 예: 20250001)
     * - DB 함수 generate_ledger_order_id()로 자동 생성
     */
    @Id
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 원장 제목
     */
    @Column(name = "ledger_order_title", length = 200)
    private String ledgerOrderTitle;

    /**
     * 원장상태
     * - NEW: 신규
     * - PROG: 진행중
     * - CLSD: 종료
     */
    @Column(name = "ledger_order_status", length = 10, nullable = false)
    private String ledgerOrderStatus = "NEW";

    /**
     * 비고
     */
    @Column(name = "ledger_order_remarks", length = 500)
    private String ledgerOrderRemarks;

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
     * 원장상태가 신규인지 확인
     */
    public boolean isNew() {
        return "NEW".equals(this.ledgerOrderStatus);
    }

    /**
     * 원장상태가 진행중인지 확인
     */
    public boolean isInProgress() {
        return "PROG".equals(this.ledgerOrderStatus);
    }

    /**
     * 원장상태가 종료인지 확인
     */
    public boolean isClosed() {
        return "CLSD".equals(this.ledgerOrderStatus);
    }

    /**
     * 원장차수 상태 변경
     */
    public void changeStatus(String newStatus) {
        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException("유효하지 않은 원장상태입니다: " + newStatus);
        }
        this.ledgerOrderStatus = newStatus;
    }

    /**
     * 유효한 원장상태인지 확인
     */
    private boolean isValidStatus(String status) {
        return "NEW".equals(status) || "PROG".equals(status) || "CLSD".equals(status);
    }

    /**
     * 원장차수 정보 수정
     */
    public void update(String title, String status, String remarks, String updatedBy) {
        if (title != null && !title.isBlank()) {
            this.ledgerOrderTitle = title;
        }

        if (status != null && isValidStatus(status)) {
            this.ledgerOrderStatus = status;
        }

        this.ledgerOrderRemarks = remarks;
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 년도 추출
     */
    public String getYear() {
        if (ledgerOrderId != null && ledgerOrderId.length() >= 4) {
            return ledgerOrderId.substring(0, 4);
        }
        return null;
    }

    /**
     * 순번 추출
     */
    public String getSequence() {
        if (ledgerOrderId != null && ledgerOrderId.length() == 8) {
            return ledgerOrderId.substring(4, 8);
        }
        return null;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.ledgerOrderStatus == null) {
            this.ledgerOrderStatus = "NEW";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
