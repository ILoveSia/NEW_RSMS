package com.rsms.domain.boardresolution.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 이사회결의 엔티티
 * - board_resolutions 테이블 매핑
 * - 원장차수별 이사회 결의 정보 관리
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */
@Entity
@Table(name = "board_resolutions", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResolution {

    /**
     * 이사회결의ID (PK)
     * - 원장차수ID(8자리) + "B" + 순번(4자리)
     * - 예: 20250001B0001
     */
    @Id
    @Column(name = "resolution_id", length = 13, nullable = false)
    private String resolutionId;

    /**
     * 원장차수ID (FK)
     * - ledger_order 테이블 참조
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 회차
     * - 원장차수별 자동 증가
     * - 새 원장차수 시작 시 1로 초기화
     */
    @Column(name = "meeting_number", nullable = false)
    private Integer meetingNumber;

    /**
     * 이사회 결의명
     */
    @Column(name = "resolution_name", length = 200, nullable = false)
    private String resolutionName;

    /**
     * 요약정보
     */
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    /**
     * 내용
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 생성자
     */
    @Column(name = "created_by", length = 50)
    private String createdBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    // ===============================
    // 생명주기 콜백
    // ===============================

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===============================
    // 비즈니스 메서드
    // ===============================

    /**
     * 이사회결의 정보 수정
     */
    public void update(String resolutionName, String summary, String content, String updatedBy) {
        if (resolutionName != null && !resolutionName.isBlank()) {
            this.resolutionName = resolutionName;
        }
        this.summary = summary;
        this.content = content;
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * ID 생성
     * - 형식: 원장차수ID + "B" + 순번(4자리)
     */
    public static String generateId(String ledgerOrderId, int sequence) {
        return String.format("%sB%04d", ledgerOrderId, sequence);
    }
}
