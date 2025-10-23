package com.rsms.domain.committee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회의체 상세정보 엔티티 (위원장/위원)
 *
 * @description 회의체별 위원장 및 위원 정보를 관리하는 엔티티
 * - 데이터베이스 테이블: rsms.committee_details
 * - PK: committee_details_id (BIGSERIAL, 자동증가)
 * - FK: committees_id (→ committees), positions_id (→ positions)
 * - committees 테이블과 1:N 관계
 * - 하나의 회의체에 여러 위원(위원장, 위원)이 소속됨
 *
 * @author Claude AI
 * @since 2025-10-24
 */
@Entity
@Table(name = "committee_details", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeDetail {

    /**
     * 회의체상세ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "committee_details_id")
    private Long committeeDetailsId;

    /**
     * 회의체ID (FK → committees)
     */
    @Column(name = "committees_id", nullable = false)
    private Long committeesId;

    /**
     * 직책ID (FK → positions)
     */
    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    /**
     * 구분코드 (CHAIR: 위원장, MEMBER: 위원)
     * - common_code_details의 CMITE_DVCD 그룹 참조
     */
    @Column(name = "committees_type", length = 20, nullable = false)
    private String committeesType;

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
     * 위원 정보 수정
     */
    public void update(String committeesType, Long positionsId, String updatedBy) {
        if (committeesType != null && !committeesType.isBlank()) {
            this.committeesType = committeesType;
        }

        if (positionsId != null) {
            this.positionsId = positionsId;
        }

        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 위원장인지 확인
     */
    public boolean isChairman() {
        return "CHAIR".equals(this.committeesType);
    }

    /**
     * 위원인지 확인
     */
    public boolean isMember() {
        return "MEMBER".equals(this.committeesType);
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
