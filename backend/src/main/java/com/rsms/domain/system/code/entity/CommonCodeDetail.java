package com.rsms.domain.system.code.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 공통코드 상세 엔티티
 *
 * @description 공통코드 그룹에 속한 상세 코드를 관리
 * @author Claude AI
 * @since 2025-09-24
 */
@Entity
@Table(name = "common_code_details", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(CommonCodeDetail.CodeDetailId.class)
public class CommonCodeDetail {

    /**
     * 그룹코드 (복합키, FK)
     */
    @Id
    @Column(name = "group_code", length = 50, nullable = false)
    private String groupCode;

    /**
     * 상세코드 (복합키)
     */
    @Id
    @Column(name = "detail_code", length = 50, nullable = false)
    private String detailCode;

    /**
     * 상세코드명
     */
    @Column(name = "detail_name", length = 200, nullable = false)
    private String detailName;

    /**
     * 설명
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * 부모 코드 (계층 구조 지원)
     */
    @Column(name = "parent_code", length = 50)
    private String parentCode;

    /**
     * 레벨 깊이 (1부터 시작)
     */
    @Column(name = "level_depth", nullable = false)
    private Integer levelDepth = 1;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * 확장 속성1
     */
    @Column(name = "ext_attr1", length = 200)
    private String extAttr1;

    /**
     * 확장 속성2
     */
    @Column(name = "ext_attr2", length = 200)
    private String extAttr2;

    /**
     * 확장 속성3
     */
    @Column(name = "ext_attr3", length = 200)
    private String extAttr3;

    /**
     * 추가 데이터 (JSON 형식)
     */
    @Column(name = "extra_data", columnDefinition = "jsonb")
    private String extraData;

    /**
     * 유효 시작일
     */
    @Column(name = "valid_from")
    private LocalDate validFrom;

    /**
     * 유효 종료일
     */
    @Column(name = "valid_until")
    private LocalDate validUntil;

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
     * 그룹 연관관계 (ManyToOne)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_code", insertable = false, updatable = false)
    private CommonCodeGroup codeGroup;

    // ===============================
    // 복합키 클래스
    // ===============================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeDetailId implements Serializable {
        private String groupCode;
        private String detailCode;
    }

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 활성화 상태 확인
     */
    public boolean isActive() {
        return "Y".equals(this.isActive);
    }

    /**
     * 유효 기간 확인
     */
    public boolean isValidPeriod(LocalDate checkDate) {
        LocalDate date = checkDate != null ? checkDate : LocalDate.now();

        boolean afterFrom = validFrom == null || !date.isBefore(validFrom);
        boolean beforeUntil = validUntil == null || !date.isAfter(validUntil);

        return afterFrom && beforeUntil;
    }

    /**
     * 현재 유효한지 확인
     */
    public boolean isCurrentlyValid() {
        return isValidPeriod(LocalDate.now());
    }

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
     * 정렬 순서 변경
     */
    public void changeSortOrder(Integer newOrder) {
        if (newOrder == null || newOrder < 0) {
            throw new IllegalArgumentException("정렬 순서는 0 이상이어야 합니다.");
        }
        this.sortOrder = newOrder;
    }

    /**
     * 상세 정보 수정
     */
    public void update(String detailName, String description, Integer sortOrder,
                       String extAttr1, String extAttr2, String extAttr3) {
        if (detailName != null && !detailName.isBlank()) {
            this.detailName = detailName;
        }

        this.description = description;

        if (sortOrder != null && sortOrder >= 0) {
            this.sortOrder = sortOrder;
        }

        this.extAttr1 = extAttr1;
        this.extAttr2 = extAttr2;
        this.extAttr3 = extAttr3;

        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 유효 기간 설정
     */
    public void setValidPeriod(LocalDate validFrom, LocalDate validUntil) {
        if (validFrom != null && validUntil != null && validFrom.isAfter(validUntil)) {
            throw new IllegalArgumentException("유효 시작일은 종료일보다 이전이어야 합니다.");
        }

        this.validFrom = validFrom;
        this.validUntil = validUntil;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
