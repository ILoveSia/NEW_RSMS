package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 역할 엔티티
 * - 사용자 역할/권한 정의 (RoleMgmt UI 왼쪽 그리드)
 * - 계층 구조 지원 (parent_role_id)
 * - 시스템 역할 vs 사용자 정의 역할
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "roles", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    /**
     * 역할ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    /**
     * 역할 코드 (예: 001, 002, 003)
     */
    @Column(name = "role_code", length = 50, nullable = false, unique = true)
    private String roleCode;

    /**
     * 역할명 (예: CEO, CFO, 본부장)
     */
    @Column(name = "role_name", length = 100, nullable = false)
    private String roleName;

    /**
     * 역할 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 역할 유형: SYSTEM(시스템), CUSTOM(사용자정의)
     */
    @Column(name = "role_type", length = 20, nullable = false)
    private String roleType;

    /**
     * 역할 분류: 최고관리자, 관리자, 사용자
     */
    @Column(name = "role_category", length = 20)
    private String roleCategory;

    /**
     * 상위 역할 ID (계층 구조)
     */
    @Column(name = "parent_role_id")
    private Long parentRoleId;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    /**
     * 상태: ACTIVE(활성), INACTIVE(비활성), DEPRECATED(폐기)
     */
    @Column(name = "status", length = 20, nullable = false)
    private String status;

    /**
     * 시스템 역할 여부 ('Y': 시스템, 'N': 사용자정의)
     */
    @Column(name = "is_system_role", length = 1, nullable = false)
    private String isSystemRole;

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
    // 비즈니스 로직
    // ===============================

    /**
     * 시스템 역할 확인
     */
    public boolean isSystemRoleType() {
        return "Y".equals(this.isSystemRole);
    }

    /**
     * 활성 상태 확인
     */
    public boolean isActiveStatus() {
        return "ACTIVE".equals(this.status);
    }

    /**
     * 최고관리자 역할 확인
     */
    public boolean isSuperAdmin() {
        return "최고관리자".equals(this.roleCategory);
    }

    /**
     * 관리자 역할 확인
     */
    public boolean isAdmin() {
        return "관리자".equals(this.roleCategory);
    }

    /**
     * 상위 역할 존재 여부 확인
     */
    public boolean hasParent() {
        return this.parentRoleId != null;
    }

    /**
     * 역할 활성화
     */
    public void activate() {
        this.status = "ACTIVE";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 역할 비활성화
     */
    public void deactivate() {
        this.status = "INACTIVE";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 역할 정보 수정
     */
    public void update(String roleName, String description, String updatedBy) {
        if (roleName != null && !roleName.isBlank()) {
            this.roleName = roleName;
        }
        if (description != null) {
            this.description = description;
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
        if (this.roleType == null) {
            this.roleType = "CUSTOM";
        }
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.isSystemRole == null) {
            this.isSystemRole = "N";
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
