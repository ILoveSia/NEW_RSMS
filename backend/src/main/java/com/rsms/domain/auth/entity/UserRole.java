package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 사용자-역할 매핑 엔티티
 * - 사용자와 역할 간의 다대다 관계 매핑
 * - 사용자는 여러 역할을 가질 수 있음
 * - 역할 할당/해제 이력 관리
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "user_roles", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {

    /**
     * 사용자-역할 매핑 ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_role_id")
    private Long userRoleId;

    /**
     * 사용자 ID (FK)
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 역할 ID (FK)
     */
    @Column(name = "role_id", nullable = false)
    private Long roleId;

    /**
     * 할당일시
     */
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    /**
     * 할당자
     */
    @Column(name = "assigned_by", length = 100)
    private String assignedBy;

    /**
     * 활성화 여부 ('Y', 'N')
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

    /**
     * 삭제여부 ('Y', 'N')
     */
    @Column(name = "is_deleted", length = 1, nullable = false)
    private String isDeleted;

    // 연관관계 매핑 (선택적)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 활성 상태 확인
     */
    public boolean isActiveMapping() {
        return "Y".equals(this.isActive);
    }

    /**
     * 역할 할당 활성화
     */
    public void activate() {
        this.isActive = "Y";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 역할 할당 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 정적 팩토리 메서드: 새로운 역할 할당 생성
     */
    public static UserRole createAssignment(Long userId, Long roleId, String assignedBy) {
        return UserRole.builder()
            .userId(userId)
            .roleId(roleId)
            .assignedAt(LocalDateTime.now())
            .assignedBy(assignedBy)
            .isActive("Y")
            .createdBy(assignedBy)
            .updatedBy(assignedBy)
            .isDeleted("N")
            .build();
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
        if (this.assignedAt == null) {
            this.assignedAt = now;
        }
        if (this.isActive == null) {
            this.isActive = "Y";
        }
        if (this.isDeleted == null) {
            this.isDeleted = "N";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
