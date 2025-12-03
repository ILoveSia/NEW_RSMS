package com.rsms.domain.compliance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 이행점검결과보고서 엔티티
 * - 이행점검계획에 대한 결과보고서 정보 관리
 * - impl_inspection_reports 테이블 매핑
 * - ID 생성 규칙: impl_inspection_plan_id + "R" + 순번(3자리)
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Entity
@Table(name = "impl_inspection_reports", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImplInspectionReport {

    /**
     * 이행점검결과보고서ID (PK)
     * 코드 생성 규칙: impl_inspection_plan_id + "R" + 순번(3자리)
     * 예시: "20250001A0001R001"
     */
    @Id
    @Column(name = "impl_inspection_report_id", length = 17, nullable = false)
    private String implInspectionReportId;

    /**
     * 원장차수ID (FK → ledger_order)
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 이행점검ID (FK → impl_inspection_plans)
     */
    @Column(name = "impl_inspection_plan_id", length = 13, nullable = false)
    private String implInspectionPlanId;

    /**
     * 보고서구분코드 (01: CEO보고서, 02: 임원보고서)
     */
    @Column(name = "report_type_cd", length = 20, nullable = false)
    private String reportTypeCd;

    /**
     * 검토내용
     */
    @Column(name = "review_content", columnDefinition = "TEXT")
    private String reviewContent;

    /**
     * 검토일자
     */
    @Column(name = "review_date")
    private LocalDate reviewDate;

    /**
     * 결과
     */
    @Column(name = "result", columnDefinition = "TEXT")
    private String result;

    /**
     * 개선조치
     */
    @Column(name = "improvement_action", columnDefinition = "TEXT")
    private String improvementAction;

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
    // 연관 관계 (필요 시 활성화)
    // ===============================

    /**
     * 이행점검계획 참조 (Lazy 로딩)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "impl_inspection_plan_id", insertable = false, updatable = false)
    private ImplInspectionPlan implInspectionPlan;

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
     * 비활성화 (논리적 삭제)
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
     * 보고서 구분명 반환
     */
    public String getReportTypeName() {
        if ("01".equals(this.reportTypeCd)) {
            return "CEO보고서";
        } else if ("02".equals(this.reportTypeCd)) {
            return "임원보고서";
        }
        return "";
    }

    /**
     * CEO 보고서 여부 확인
     */
    public boolean isCeoReport() {
        return "01".equals(this.reportTypeCd);
    }

    /**
     * 임원 보고서 여부 확인
     */
    public boolean isExecutiveReport() {
        return "02".equals(this.reportTypeCd);
    }

    /**
     * 검토내용 업데이트
     */
    public void updateReviewContent(String reviewContent, LocalDate reviewDate) {
        this.reviewContent = reviewContent;
        this.reviewDate = reviewDate;
    }

    /**
     * 결과 업데이트
     */
    public void updateResult(String result) {
        this.result = result;
    }

    /**
     * 개선조치 업데이트
     */
    public void updateImprovementAction(String improvementAction) {
        this.improvementAction = improvementAction;
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
