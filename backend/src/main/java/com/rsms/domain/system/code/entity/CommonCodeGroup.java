package com.rsms.domain.system.code.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 공통코드 그룹 엔티티
 *
 * @description 시스템 전반에서 사용하는 공통코드의 그룹을 관리
 * @author Claude AI
 * @since 2025-09-24
 */
@Entity
@Table(name = "common_code_groups", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonCodeGroup {

    /**
     * 그룹코드 (기본키)
     */
    @Id
    @Column(name = "group_code", length = 50, nullable = false)
    private String groupCode;

    /**
     * 그룹코드명
     */
    @Column(name = "group_name", length = 200, nullable = false)
    private String groupName;

    /**
     * 설명
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * 구분 (시스템 공통, 미선택, 책무구조)
     */
    @Column(name = "category", length = 50, nullable = false)
    private String category = "시스템 공통";

    /**
     * 카테고리 코드 (SYSTEM, BUSINESS, COMMON)
     */
    @Column(name = "category_code", length = 50, nullable = false)
    private String categoryCode = "SYSTEM";

    /**
     * 시스템 코드 여부 (시스템 필수 코드는 true)
     */
    @Column(name = "system_code", nullable = false)
    private Boolean systemCode = false;

    /**
     * 수정 가능 여부 (시스템 코드는 false)
     */
    @Column(name = "editable", nullable = false)
    private Boolean editable = true;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * 사용여부 (Y, N)
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive = "Y";

    /**
     * 생성자
     */
    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 100, nullable = false)
    private String updatedBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at", nullable = false)
    private java.time.LocalDateTime updatedAt;

    /**
     * 상세 코드 목록 (양방향 연관관계)
     */
    @OneToMany(mappedBy = "codeGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommonCodeDetail> details = new ArrayList<>();

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 상세 코드 추가
     */
    public void addDetail(CommonCodeDetail detail) {
        this.details.add(detail);
        detail.setCodeGroup(this);
    }

    /**
     * 상세 코드 제거
     */
    public void removeDetail(CommonCodeDetail detail) {
        this.details.remove(detail);
        detail.setCodeGroup(null);
    }

    /**
     * 활성화 상태 확인
     */
    public boolean isActive() {
        return "Y".equals(this.isActive);
    }

    /**
     * 시스템 코드 여부 확인
     */
    public boolean isSystemCode() {
        return this.systemCode != null && this.systemCode;
    }

    /**
     * 수정 가능 여부 확인
     */
    public boolean isEditable() {
        return this.editable != null && this.editable;
    }

    /**
     * 그룹 활성화
     */
    public void activate() {
        this.isActive = "Y";
    }

    /**
     * 그룹 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
    }

    /**
     * 정렬 순서 변경
     */
    public void changeSortOrder(Integer newOrder) {
        if (newOrder == null || newOrder < 0) {
            throw new IllegalArgumentException("정렬 순서는 0 이상이어야 합니다.");
        }
        this.sortOrder = newOrder;
    }

    /**
     * 그룹 정보 수정
     */
    public void update(String groupName, String description, String category, Integer sortOrder) {
        if (!this.isEditable()) {
            throw new IllegalStateException("시스템 코드는 수정할 수 없습니다.");
        }

        if (groupName != null && !groupName.isBlank()) {
            this.groupName = groupName;
        }

        this.description = description;

        if (category != null) {
            this.category = category;
        }

        if (sortOrder != null && sortOrder >= 0) {
            this.sortOrder = sortOrder;
        }

        this.updatedAt = java.time.LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = java.time.LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = java.time.LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = java.time.LocalDateTime.now();
    }
}
