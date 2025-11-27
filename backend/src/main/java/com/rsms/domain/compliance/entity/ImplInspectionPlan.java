package com.rsms.domain.compliance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 이행점검계획 엔티티
 * - 원장차수별 이행점검계획 정보 관리
 * - impl_inspection_plans 테이블 매핑
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Entity
@Table(name = "impl_inspection_plans", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImplInspectionPlan {

    /**
     * 이행점검ID (PK)
     * 코드 생성 규칙: ledger_order_id + "A" + 순번(4자리)
     * 예시: "20250001A0001"
     */
    @Id
    @Column(name = "impl_inspection_plan_id", length = 13, nullable = false)
    private String implInspectionPlanId;

    /**
     * 원장차수ID (FK → ledger_order)
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 이행점검명
     */
    @Column(name = "impl_inspection_name", length = 200, nullable = false)
    private String implInspectionName;

    /**
     * 점검유형코드 (common_code_details.group_code = 'FLFL_TYP_DVCD')
     * 01: 정기점검, 02: 특별점검
     */
    @Column(name = "inspection_type_cd", length = 20)
    private String inspectionTypeCd;

    /**
     * 이행점검시작일
     */
    @Column(name = "impl_inspection_start_date", nullable = false)
    private LocalDate implInspectionStartDate;

    /**
     * 이행점검종료일
     */
    @Column(name = "impl_inspection_end_date", nullable = false)
    private LocalDate implInspectionEndDate;

    /**
     * 이행점검계획상태코드 (common_code_details.group_code = 'FLFL_STCD')
     * 01: 계획, 02: 진행중, 03: 완료, 04: 보류
     */
    @Column(name = "impl_inspection_status_cd", length = 20, nullable = false)
    @Builder.Default
    private String implInspectionStatusCd = "01";

    /**
     * 비고
     */
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    /**
     * 사용여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "is_active", nullable = false, length = 1)
    @Builder.Default
    private String isActive = "Y";

    /**
     * 등록일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 등록자
     */
    @Column(name = "created_by", length = 50, nullable = false)
    private String createdBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 50, nullable = false)
    private String updatedBy;

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
     * 점검 시작
     */
    public void startInspection() {
        this.implInspectionStatusCd = "02"; // 진행중
    }

    /**
     * 점검 완료
     */
    public void completeInspection() {
        this.implInspectionStatusCd = "03"; // 완료
    }

    /**
     * 점검 보류
     */
    public void holdInspection() {
        this.implInspectionStatusCd = "04"; // 보류
    }

    /**
     * 점검유형명 반환
     */
    public String getInspectionTypeName() {
        if ("01".equals(this.inspectionTypeCd)) {
            return "정기점검";
        } else if ("02".equals(this.inspectionTypeCd)) {
            return "특별점검";
        }
        return "";
    }

    /**
     * 점검상태명 반환
     */
    public String getStatusName() {
        switch (this.implInspectionStatusCd) {
            case "01": return "계획";
            case "02": return "진행중";
            case "03": return "완료";
            case "04": return "보류";
            default: return "";
        }
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
        if (this.implInspectionStatusCd == null) {
            this.implInspectionStatusCd = "01";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
