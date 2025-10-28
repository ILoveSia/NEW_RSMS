package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 메뉴 아이템 엔티티
 * - 시스템 메뉴 구조 정의 (MenuMgmt UI)
 * - 3단계 계층 구조 (최대 depth 2)
 * - 폴더(folder) / 페이지(page) 타입 구분
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "menu_items", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {

    /**
     * 메뉴 ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;

    /**
     * 메뉴 코드 (예: 01, 0201, 020102)
     */
    @Column(name = "menu_code", length = 50, nullable = false, unique = true)
    private String menuCode;

    /**
     * 메뉴명
     */
    @Column(name = "menu_name", length = 100, nullable = false)
    private String menuName;

    /**
     * 메뉴 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * URL 경로
     */
    @Column(name = "url", length = 500)
    private String url;

    /**
     * URL 파라미터
     */
    @Column(name = "parameters", length = 500)
    private String parameters;

    /**
     * 메뉴 타입: folder(폴더), page(페이지)
     */
    @Column(name = "menu_type", length = 20, nullable = false)
    private String menuType;

    /**
     * 메뉴 깊이 (1: 최상위, 2: 2단계, 3: 3단계)
     */
    @Column(name = "depth", nullable = false)
    private Integer depth;

    /**
     * 상위 메뉴 ID
     */
    @Column(name = "parent_id")
    private Long parentId;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    /**
     * 시스템 코드 (예: DASHBOARD_MAIN, RESP_LEDGER)
     */
    @Column(name = "system_code", length = 100, nullable = false)
    private String systemCode;

    /**
     * 아이콘명 (Material-UI Icon)
     */
    @Column(name = "icon", length = 50)
    private String icon;

    /**
     * 활성화 여부 ('Y', 'N')
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive;

    /**
     * 테스트 페이지 여부 ('Y', 'N')
     */
    @Column(name = "is_test_page", length = 1, nullable = false)
    private String isTestPage;

    /**
     * 인증 필요 여부 ('Y', 'N')
     */
    @Column(name = "requires_auth", length = 1, nullable = false)
    private String requiresAuth;

    /**
     * 새창 열기 여부 ('Y', 'N')
     */
    @Column(name = "open_in_new_window", length = 1, nullable = false)
    private String openInNewWindow;

    /**
     * 대시보드 레이아웃 사용 여부 ('Y', 'N')
     */
    @Column(name = "dashboard_layout", length = 1, nullable = false)
    private String dashboardLayout;

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
     * 폴더 타입 확인
     */
    public boolean isFolder() {
        return "folder".equals(this.menuType);
    }

    /**
     * 페이지 타입 확인
     */
    public boolean isPage() {
        return "page".equals(this.menuType);
    }

    /**
     * 최상위 메뉴 확인
     */
    public boolean isTopLevel() {
        return this.depth == 1 && this.parentId == null;
    }

    /**
     * 활성 상태 확인
     */
    public boolean isActiveStatus() {
        return "Y".equals(this.isActive);
    }

    /**
     * 인증 필요 확인
     */
    public boolean requiresAuthentication() {
        return "Y".equals(this.requiresAuth);
    }

    /**
     * 대시보드 레이아웃 사용 확인
     */
    public boolean usesDashboardLayout() {
        return "Y".equals(this.dashboardLayout);
    }

    /**
     * 메뉴 활성화
     */
    public void activate() {
        this.isActive = "Y";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 메뉴 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 메뉴 정보 수정
     */
    public void update(String menuName, String description, String url, String updatedBy) {
        if (menuName != null && !menuName.isBlank()) {
            this.menuName = menuName;
        }
        if (description != null) {
            this.description = description;
        }
        if (url != null) {
            this.url = url;
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
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
        if (this.depth == null) {
            this.depth = 1;
        }
        if (this.isActive == null) {
            this.isActive = "Y";
        }
        if (this.isTestPage == null) {
            this.isTestPage = "N";
        }
        if (this.requiresAuth == null) {
            this.requiresAuth = "Y";
        }
        if (this.openInNewWindow == null) {
            this.openInNewWindow = "N";
        }
        if (this.dashboardLayout == null) {
            this.dashboardLayout = "N";
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
