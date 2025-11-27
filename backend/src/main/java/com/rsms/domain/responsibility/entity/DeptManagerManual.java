package com.rsms.domain.responsibility.entity;

import com.rsms.domain.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 부서장업무메뉴얼 엔티티
 * - 부서장업무 관련 관리활동 등록 및 수행점검 관리
 * - dept_manager_manuals 테이블 매핑
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Entity
@Table(name = "dept_manager_manuals", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeptManagerManual {

    /**
     * 부서업무메뉴얼CD (PK)
     * 코드 생성 규칙: obligation_cd + "A" + 순번(4자리)
     * 예시: "20250001R0001D0001O0001A0001"
     */
    @Id
    @Column(name = "manual_cd", length = 50, nullable = false)
    private String manualCd;

    /**
     * 원장차수ID (FK → ledger_order)
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 관리의무코드 (FK → management_obligations)
     */
    @Column(name = "obligation_cd", length = 50, nullable = false, insertable = false, updatable = false)
    private String obligationCd;

    /**
     * 관리의무 엔티티 (ManyToOne 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obligation_cd", nullable = false)
    private ManagementObligation managementObligation;

    /**
     * 조직코드 (FK → organizations)
     */
    @Column(name = "org_code", length = 20, nullable = false, insertable = false, updatable = false)
    private String orgCode;

    /**
     * 조직 엔티티 (ManyToOne 관계)
     * - orgCode를 통해 조직명(orgName) 조회
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_code", nullable = false)
    private Organization organization;

    /**
     * 책무관리항목
     */
    @Column(name = "resp_item", length = 500, nullable = false)
    private String respItem;

    /**
     * 관리활동명
     */
    @Column(name = "activity_name", length = 200, nullable = false)
    private String activityName;

    /**
     * 수행자ID
     */
    @Column(name = "executor_id", length = 50)
    private String executorId;

    /**
     * 수행일자
     */
    @Column(name = "execution_date")
    private LocalDate executionDate;

    /**
     * 수행여부 (01:미수행, 02:수행완료)
     */
    @Column(name = "execution_status", length = 20)
    private String executionStatus;

    /**
     * 수행결과코드 (01:적정, 02:부적정)
     */
    @Column(name = "execution_result_cd", length = 20)
    private String executionResultCd;

    /**
     * 수행결과내용
     */
    @Column(name = "execution_result_content", columnDefinition = "TEXT")
    private String executionResultContent;

    /**
     * 수행점검항목
     */
    @Column(name = "exec_check_method", length = 500)
    private String execCheckMethod;

    /**
     * 수행점검세부내용
     */
    @Column(name = "exec_check_detail", columnDefinition = "TEXT")
    private String execCheckDetail;

    /**
     * 수행점검주기 (FLFL_ISPC_FRCD)
     */
    @Column(name = "exec_check_frequency_cd", length = 20)
    private String execCheckFrequencyCd;

    /**
     * 사용여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "is_active", nullable = false, length = 1)
    @Builder.Default
    private String isActive = "Y";

    /**
     * 상태 (active: 사용, inactive: 미사용)
     */
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "active";

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
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    /**
     * 승인일시
     */
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    /**
     * 승인자
     */
    @Column(name = "approved_by", length = 50)
    private String approvedBy;

    /**
     * 비고
     */
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 활성화
     */
    public void activate() {
        this.isActive = "Y";
        this.status = "active";
    }

    /**
     * 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
        this.status = "inactive";
    }

    /**
     * 활성 상태인지 확인
     */
    public boolean isActiveStatus() {
        return "Y".equals(this.isActive) && "active".equals(this.status);
    }

    /**
     * 수행 완료 처리
     */
    public void markAsCompleted(String executorId, String resultCd, String resultContent) {
        this.executorId = executorId;
        this.executionDate = LocalDate.now();
        this.executionStatus = "02"; // 수행완료
        this.executionResultCd = resultCd;
        this.executionResultContent = resultContent;
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
        if (this.status == null) {
            this.status = "active";
        }
        if (this.executionStatus == null) {
            this.executionStatus = "01"; // 미수행
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
