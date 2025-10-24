package com.rsms.domain.responsibility.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 관리의무 엔티티
 *
 * @description 책무세부에 대한 관리의무 정보를 관리하는 엔티티 (1:N 관계)
 * @author Claude AI
 * @since 2025-09-24
 */
@Entity
@Table(name = "management_obligations", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagementObligation {

    /**
     * 관리의무ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "management_obligation_id")
    private Long managementObligationId;

    /**
     * 책무세부ID (FK)
     */
    @Column(name = "responsibility_detail_id", nullable = false)
    private Long responsibilityDetailId;

    /**
     * 관리의무 대분류 구분코드 (MGMT_OBLG_LCCD)
     */
    @Column(name = "obligation_major_cat_cd", length = 20, nullable = false)
    private String obligationMajorCatCd;

    /**
     * 관리의무 중분류 구분코드 (MGMT_OBLG_MCCD)
     */
    @Column(name = "obligation_middle_cat_cd", length = 20, nullable = false)
    private String obligationMiddleCatCd;

    /**
     * 관리의무코드
     */
    @Column(name = "obligation_cd", length = 20, nullable = false)
    private String obligationCd;

    /**
     * 관리의무내용
     */
    @Column(name = "obligation_info", length = 1000, nullable = false)
    private String obligationInfo;

    /**
     * 조직코드
     */
    @Column(name = "org_code", length = 20, nullable = false)
    private String orgCode;

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
