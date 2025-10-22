package com.rsms.domain.position.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 직책 상세정보 엔티티
 *
 * @description 직책별 조직(부서/영업점) 상세 정보를 관리하는 엔티티
 * - positions 테이블과 1:N 관계
 * - 하나의 직책(본부)에 여러 조직(부서/영업점)이 소속됨
 *
 * @author Claude AI
 * @since 2025-10-21
 */
@Entity
@Table(name = "positions_details", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionDetail {

    /**
     * 직책상세ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "positions_details_id")
    private Long positionsDetailsId;

    /**
     * 직책ID (FK → positions)
     */
    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    /**
     * 본부코드 (positions의 hq_code와 동일)
     */
    @Column(name = "hq_code", length = 20, nullable = false)
    private String hqCode;

    /**
     * 조직코드 (FK → organizations)
     */
    @Column(name = "org_code", length = 20, nullable = false)
    private String orgCode;

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
     * 조직코드 수정
     */
    public void updateOrgCode(String orgCode, String updatedBy) {
        if (orgCode != null && !orgCode.isBlank()) {
            this.orgCode = orgCode;
        }
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
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
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
