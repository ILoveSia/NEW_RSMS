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
     * 코드 생성 규칙: 책무코드 전체 + "D" + 순번(4자리)
     * 예시: "20250001M0001D0001"
     */
    @Id
    @Column(name = "responsibility_detail_cd", length = 30, nullable = false)
    private String responsibilityDetailCd;

    /**
     * 책무 엔티티 (ManyToOne 관계)
     * - responsibility_cd 컬럼을 FK로 사용
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_cd", nullable = false)
    private Responsibility responsibility;

    /**
     * 책무코드 조회 (convenience method)
     * - responsibility 객체에서 코드를 가져옴
     * - 엑셀 업로드 등에서 직접 코드 설정이 필요한 경우를 위한 임시 필드
     */
    @Transient
    private String tempResponsibilityCd;

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

    /**
     * 책무코드 조회 (getter)
     * - responsibility 객체가 있으면 해당 코드 반환
     * - 없으면 임시 필드 값 반환
     */
    public String getResponsibilityCd() {
        if (responsibility != null) {
            return responsibility.getResponsibilityCd();
        }
        return tempResponsibilityCd;
    }

    /**
     * 책무코드 설정 (setter)
     * - 임시 필드에 저장 (Service에서 responsibility 객체 설정 시 사용)
     */
    public void setResponsibilityCd(String responsibilityCd) {
        this.tempResponsibilityCd = responsibilityCd;
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
