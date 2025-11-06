package com.rsms.domain.responsibility.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 책무 세부내용 엔티티
 *
 * @description 책무에 대한 세부내용을 관리하는 엔티티 (1:N 관계)
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - PK/FK를 자동증가에서 업무 코드로 변경
 */
@Entity
@Table(name = "responsibility_details", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsibilityDetail {

    /**
     * 책무세부코드 (PK, 업무 코드)
     * 코드 생성 규칙: 책무코드 뒷 9자리 + "D" + 순번(4자리)
     * 예시: "RM0001D0001"
     */
    @Id
    @Column(name = "responsibility_detail_cd", length = 30, nullable = false)
    private String responsibilityDetailCd;

    /**
     * 책무코드 (FK)
     */
    @Column(name = "responsibility_cd", length = 20, nullable = false, insertable = false, updatable = false)
    private String responsibilityCd;

    /**
     * 책무 엔티티 (ManyToOne 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_cd", nullable = false)
    private Responsibility responsibility;

    /**
     * 책무세부내용
     */
    @Column(name = "responsibility_detail_info", length = 2000, nullable = false)
    private String responsibilityDetailInfo;

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
