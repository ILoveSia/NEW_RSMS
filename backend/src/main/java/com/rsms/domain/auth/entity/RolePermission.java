package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 역할-권한 매핑 엔티티
 * - 역할(Role)과 권한(Permission)의 N:M 관계
 * - 역할에 상세역할(권한)을 할당하는 매핑
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "role_permissions", schema = "rsms",
    uniqueConstraints = @UniqueConstraint(columnNames = {"role_id", "permission_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {

    /**
     * 역할권한ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_permission_id")
    private Long rolePermissionId;

    /**
     * 역할 ID
     */
    @Column(name = "role_id", nullable = false)
    private Long roleId;

    /**
     * 권한 ID
     */
    @Column(name = "permission_id", nullable = false)
    private Long permissionId;

    /**
     * 권한 부여 여부 ('Y', 'N')
     */
    @Column(name = "granted", length = 1, nullable = false)
    private String granted;

    /**
     * 할당 일시
     */
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    /**
     * 할당자
     */
    @Column(name = "assigned_by", length = 100)
    private String assignedBy;

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

    // ===============================
    // 연관관계 (Lazy Loading)
    // ===============================

    /**
     * 역할 엔티티
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    /**
     * 권한 엔티티
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", insertable = false, updatable = false)
    private Permission permission;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 권한 부여됨 확인
     */
    public boolean isGranted() {
        return "Y".equals(this.granted);
    }

    /**
     * 권한 부여
     */
    public void grant(String assignedBy) {
        this.granted = "Y";
        this.assignedBy = assignedBy;
        this.assignedAt = LocalDateTime.now();
        this.updatedBy = assignedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 권한 해제
     */
    public void revoke(String updatedBy) {
        this.granted = "N";
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 새로운 역할-권한 매핑 생성
     */
    public static RolePermission create(Long roleId, Long permissionId, String createdBy) {
        LocalDateTime now = LocalDateTime.now();
        return RolePermission.builder()
            .roleId(roleId)
            .permissionId(permissionId)
            .granted("Y")
            .assignedAt(now)
            .assignedBy(createdBy)
            .createdBy(createdBy)
            .createdAt(now)
            .updatedBy(createdBy)
            .updatedAt(now)
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
        if (this.granted == null) {
            this.granted = "Y";
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
