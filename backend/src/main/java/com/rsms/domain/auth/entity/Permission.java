package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 권한(상세역할) 엔티티
 * - RoleMgmt UI 오른쪽 그리드 데이터
 * - 메뉴별 세밀한 권한 정의
 * - CRUD 권한 및 확장 권한 포함
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "permissions", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    /**
     * 권한ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Long permissionId;

    /**
     * 권한 코드 (예: A01, A99, U01)
     */
    @Column(name = "permission_code", length = 50, nullable = false, unique = true)
    private String permissionCode;

    /**
     * 권한명 (예: 운영관리자, 시스템관리자)
     */
    @Column(name = "permission_name", length = 100, nullable = false)
    private String permissionName;

    /**
     * 권한 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 메뉴 ID (연결된 메뉴)
     */
    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    /**
     * 역할유형 (Y: 업무, N: 일반)
     */
    @Column(name = "business_permission", length = 1, nullable = false)
    private String businessPermission;

    /**
     * 본점기본 ('Y', 'N')
     */
    @Column(name = "main_business_permission", length = 1, nullable = false)
    private String mainBusinessPermission;

    /**
     * 영업점기본 ('Y', 'N')
     */
    @Column(name = "execution_permission", length = 1, nullable = false)
    private String executionPermission;

    /**
     * 조회 권한 ('Y', 'N')
     */
    @Column(name = "can_view", length = 1, nullable = false)
    private String canView;

    /**
     * 생성 권한 ('Y', 'N')
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
     * 확장 권한 유형 (전체권한, 제한권한, 조회권한)
     */
    @Column(name = "extended_permission_type", length = 50)
    private String extendedPermissionType;

    /**
     * 확장 권한명
     */
    @Column(name = "extended_permission_name", length = 100)
    private String extendedPermissionName;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    /**
     * 사용여부 ('Y', 'N')
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

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 활성 상태 확인
     */
    public boolean isActivePermission() {
        return "Y".equals(this.isActive);
    }

    /**
     * 업무 권한 확인
     */
    public boolean isBusinessType() {
        return "Y".equals(this.businessPermission);
    }

    /**
     * 본점기본 권한 확인
     */
    public boolean isMainBusinessType() {
        return "Y".equals(this.mainBusinessPermission);
    }

    /**
     * 영업점기본 권한 확인
     */
    public boolean isExecutionType() {
        return "Y".equals(this.executionPermission);
    }

    /**
     * 조회 권한 확인
     */
    public boolean hasViewPermission() {
        return "Y".equals(this.canView);
    }

    /**
     * 생성 권한 확인
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
     * 권한 활성화
     */
    public void activate() {
        this.isActive = "Y";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 권한 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
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
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
        if (this.isActive == null) {
            this.isActive = "Y";
        }
        if (this.isDeleted == null) {
            this.isDeleted = "N";
        }
        // 기본값 설정
        if (this.businessPermission == null) {
            this.businessPermission = "N";
        }
        if (this.mainBusinessPermission == null) {
            this.mainBusinessPermission = "N";
        }
        if (this.executionPermission == null) {
            this.executionPermission = "N";
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
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
