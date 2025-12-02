package com.rsms.domain.compliance.entity;

import com.rsms.domain.responsibility.entity.DeptManagerManual;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 이행점검항목 엔티티
 * - 이행점검계획별 점검항목 정보 관리
 * - impl_inspection_items 테이블 매핑
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Entity
@Table(name = "impl_inspection_items", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImplInspectionItem {

    /**
     * 이행점검항목ID (PK)
     * 코드 생성 규칙: impl_inspection_plan_id + "I" + 순번(6자리)
     * 예시: "20250001A0001I000001"
     */
    @Id
    @Column(name = "impl_inspection_item_id", length = 20, nullable = false)
    private String implInspectionItemId;

    /**
     * 이행점검ID (FK → impl_inspection_plans)
     */
    @Column(name = "impl_inspection_plan_id", length = 13, nullable = false, insertable = false, updatable = false)
    private String implInspectionPlanId;

    /**
     * 이행점검계획 엔티티 (ManyToOne 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "impl_inspection_plan_id", nullable = false)
    private ImplInspectionPlan implInspectionPlan;

    /**
     * 부서장업무메뉴얼CD (FK → dept_manager_manuals)
     */
    @Column(name = "manual_cd", length = 50, nullable = false, insertable = false, updatable = false)
    private String manualCd;

    /**
     * 부서장업무메뉴얼 엔티티 (ManyToOne 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manual_cd", nullable = false)
    private DeptManagerManual deptManagerManual;

    // ============================================
    // 1단계: 점검 정보
    // ============================================

    /**
     * 점검자ID
     */
    @Column(name = "inspector_id", length = 50)
    private String inspectorId;

    /**
     * 점검자명 (employees 테이블 조인 결과, DB 컬럼 아님)
     */
    @Transient
    private String inspectorName;

    /**
     * 점검결과상태코드 (01:미점검, 02:적정, 03:부적정)
     */
    @Column(name = "inspection_status_cd", length = 20, nullable = false)
    @Builder.Default
    private String inspectionStatusCd = "01";

    /**
     * 점검결과내용
     */
    @Column(name = "inspection_result_content", columnDefinition = "TEXT")
    private String inspectionResultContent;

    /**
     * 점검일자
     */
    @Column(name = "inspection_date")
    private LocalDate inspectionDate;

    // ============================================
    // 2단계: 개선이행 정보
    // ============================================

    /**
     * 개선이행상태코드 (01:개선미이행, 02:개선계획, 03:승인요청, 04:개선이행, 05:개선완료)
     */
    @Column(name = "improvement_status_cd", length = 20, nullable = false)
    @Builder.Default
    private String improvementStatusCd = "01";

    /**
     * 개선담당자ID
     */
    @Column(name = "improvement_manager_id", length = 50)
    private String improvementManagerId;

    /**
     * 개선담당자명 (employees 테이블 조인 결과, DB 컬럼 아님)
     */
    @Transient
    private String improvementManagerName;

    /**
     * 개선계획내용
     */
    @Column(name = "improvement_plan_content", columnDefinition = "TEXT")
    private String improvementPlanContent;

    /**
     * 개선계획수립일자
     */
    @Column(name = "improvement_plan_date")
    private LocalDate improvementPlanDate;

    /**
     * 개선계획 승인자ID
     */
    @Column(name = "improvement_plan_approved_by", length = 50)
    private String improvementPlanApprovedBy;

    /**
     * 개선계획 승인일자
     */
    @Column(name = "improvement_plan_approved_date")
    private LocalDate improvementPlanApprovedDate;

    /**
     * 개선이행세부내용
     */
    @Column(name = "improvement_detail_content", columnDefinition = "TEXT")
    private String improvementDetailContent;

    /**
     * 개선이행완료일자
     */
    @Column(name = "improvement_completed_date")
    private LocalDate improvementCompletedDate;

    // ============================================
    // 3단계: 최종점검 정보
    // ============================================

    /**
     * 최종점검자ID (DB 컬럼 없음, 점검자ID와 동일하게 사용)
     * - 최종점검은 점검자(inspector_id)가 수행
     */
    @Transient
    private String finalInspectorId;

    /**
     * 최종점검자명 (employees 테이블 조인 결과, DB 컬럼 아님)
     */
    @Transient
    private String finalInspectorName;

    /**
     * 최종점검결과코드 (01:승인, 02:반려)
     */
    @Column(name = "final_inspection_result_cd", length = 20)
    private String finalInspectionResultCd;

    /**
     * 최종점검결과내용
     */
    @Column(name = "final_inspection_result_content", columnDefinition = "TEXT")
    private String finalInspectionResultContent;

    /**
     * 최종점검일자
     */
    @Column(name = "final_inspection_date")
    private LocalDate finalInspectionDate;

    // ============================================
    // 부가 정보
    // ============================================

    /**
     * 반려 횟수
     */
    @Column(name = "rejection_count")
    @Builder.Default
    private Integer rejectionCount = 0;

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
     * 점검결과 - 적정
     */
    public void markAsAppropriate(String inspectorId, String resultContent) {
        this.inspectorId = inspectorId;
        this.inspectionStatusCd = "02"; // 적정
        this.inspectionResultContent = resultContent;
        this.inspectionDate = LocalDate.now();
    }

    /**
     * 점검결과 - 부적정
     */
    public void markAsInappropriate(String inspectorId, String resultContent) {
        this.inspectorId = inspectorId;
        this.inspectionStatusCd = "03"; // 부적정
        this.inspectionResultContent = resultContent;
        this.inspectionDate = LocalDate.now();
    }

    /**
     * 개선이행 완료
     */
    public void completeImprovement(String detailContent) {
        this.improvementStatusCd = "03"; // 개선완료
        this.improvementDetailContent = detailContent;
        this.improvementCompletedDate = LocalDate.now();
    }

    /**
     * 개선계획 승인 처리
     * - 결재 승인 시 호출
     * - 상태: 승인요청(03) → 개선이행(04)
     * @param approverId 승인자 ID
     */
    public void approvePlanApproval(String approverId) {
        this.improvementStatusCd = "04"; // 개선이행
        this.improvementPlanApprovedBy = approverId;
        this.improvementPlanApprovedDate = LocalDate.now();
    }

    /**
     * 개선계획 반려 처리
     * - 결재 반려 시 호출
     * - 상태: 승인요청(03) → 개선계획(02)
     */
    public void rejectPlanApproval() {
        this.improvementStatusCd = "02"; // 개선계획
        this.improvementPlanApprovedBy = null;
        this.improvementPlanApprovedDate = null;
    }

    /**
     * 개선완료 승인 처리
     * - 완료 결재 승인 시 호출
     * - 상태: 완료승인요청(05) → 개선완료(06)
     */
    public void approveCompleteApproval() {
        this.improvementStatusCd = "06"; // 개선완료
        this.improvementCompletedDate = LocalDate.now();
    }

    /**
     * 개선완료 반려 처리
     * - 완료 결재 반려 시 호출
     * - 상태: 완료승인요청(05) → 개선이행(04)
     */
    public void rejectCompleteApproval() {
        this.improvementStatusCd = "04"; // 개선이행
    }

    /**
     * 최종점검 - 승인
     */
    public void approveFinally(String resultContent) {
        this.finalInspectionResultCd = "01"; // 승인
        this.finalInspectionResultContent = resultContent;
        this.finalInspectionDate = LocalDate.now();
    }

    /**
     * 최종점검 - 반려
     */
    public void rejectFinally(String resultContent) {
        this.finalInspectionResultCd = "02"; // 반려
        this.finalInspectionResultContent = resultContent;
        this.finalInspectionDate = LocalDate.now();
        this.rejectionCount = (this.rejectionCount == null ? 0 : this.rejectionCount) + 1;
        this.improvementStatusCd = "01"; // 개선미이행으로 리셋
    }

    /**
     * 최종 완료 여부 확인
     * - 적정이면 완료
     * - 부적정 후 최종승인이면 완료
     */
    public boolean isFinalCompleted() {
        if ("02".equals(this.inspectionStatusCd)) {
            return true; // 적정
        }
        if ("03".equals(this.inspectionStatusCd) && "01".equals(this.finalInspectionResultCd)) {
            return true; // 부적정 → 개선 → 승인
        }
        return false;
    }

    /**
     * 점검상태명 반환
     */
    public String getInspectionStatusName() {
        switch (this.inspectionStatusCd) {
            case "01": return "미점검";
            case "02": return "적정";
            case "03": return "부적정";
            default: return "";
        }
    }

    /**
     * 개선이행상태명 반환
     */
    public String getImprovementStatusName() {
        switch (this.improvementStatusCd) {
            case "01": return "개선미이행";
            case "02": return "개선계획";
            case "03": return "개선완료";
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
        if (this.inspectionStatusCd == null) {
            this.inspectionStatusCd = "01";
        }
        if (this.improvementStatusCd == null) {
            this.improvementStatusCd = "01";
        }
        if (this.rejectionCount == null) {
            this.rejectionCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
