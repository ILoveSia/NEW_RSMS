package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 메뉴 권한 엔티티
 * - 역할별 메뉴 접근 권한 및 CRUD 권한 관리
 * - MenuMgmt UI 오른쪽 그리드 데이터
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "menu_permissions", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuPermission {

    /**
     * 메뉴권한ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_permission_id")
    private Long menuPermissionId;

    /**
     * 역할 ID (roles FK)
     */
    @Column(name = "role_id", nullable = false)
    private Long roleId;

    /**
     * 메뉴 ID (menu_items FK)
     */
    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    /**
     * 조회 권한 ('Y', 'N')
     */
    @Column(name = "can_view", length = 1, nullable = false)
    private String canView;

    /**
     * 등록 권한 ('Y', 'N')
     */
    @Column(name = "can_create", length = 1, nullable = false)
    private String canCreate;

    /**
     * 수정 권한 ('Y', 'N')
     */
    @Column(name = "can_update", length = 1, nullable = false)
    private String canUpdate;

    /**
     * 삭제 권한 ('Y', 'N')
     */
    @Column(name = "can_delete", length = 1, nullable = false)
    private String canDelete;

    /**
     * 선택 권한 ('Y', 'N')
     */
    @Column(name = "can_select", length = 1, nullable = false)
    private String canSelect;

    /**
     * 할당 일시
     */
    @Column(name = "assigned_at")
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
    // 비즈니스 로직
    // ===============================

    /**
     * 조회 권한 확인
     */
    public boolean hasViewPermission() {
        return "Y".equals(this.canView);
    }

    /**
     * 등록 권한 확인
     */
    public boolean hasCreatePermission() {
        return "Y".equals(this.canCreate);
    }

    /**
     * 수정 권한 확인
     */
    public boolean hasUpdatePermission() {
        return "Y".equals(this.canUpdate);
    }

    /**
     * 삭제 권한 확인
     */
    public boolean hasDeletePermission() {
        return "Y".equals(this.canDelete);
    }

    /**
     * 선택 권한 확인
     */
    public boolean hasSelectPermission() {
        return "Y".equals(this.canSelect);
    }

    /**
     * 전체 권한 여부 확인
     */
    public boolean hasAllPermissions() {
        return hasViewPermission() && hasCreatePermission() &&
               hasUpdatePermission() && hasDeletePermission() && hasSelectPermission();
    }

    /**
     * 권한 업데이트
     */
    public void updatePermissions(String canView, String canCreate, String canUpdate,
                                   String canDelete, String canSelect, String updatedBy) {
        if (canView != null) this.canView = canView;
        if (canCreate != null) this.canCreate = canCreate;
        if (canUpdate != null) this.canUpdate = canUpdate;
        if (canDelete != null) this.canDelete = canDelete;
        if (canSelect != null) this.canSelect = canSelect;
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
        if (this.assignedAt == null) {
            this.assignedAt = now;
        }
        if (this.canView == null) {
            this.canView = "N";
        }
        if (this.canCreate == null) {
            this.canCreate = "N";
        }
        if (this.canUpdate == null) {
            this.canUpdate = "N";
        }
        if (this.canDelete == null) {
            this.canDelete = "N";
        }
        if (this.canSelect == null) {
            this.canSelect = "N";
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
