package com.rsms.domain.submitreport.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 제출보고서 엔티티
 * - 정부기관(금융감독원 등)에 제출하는 각종 보고서 관리
 * - submit_reports 테이블 매핑
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Entity
@Table(name = "submit_reports", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReport {

    /**
     * 보고서ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    /**
     * 원장차수ID (FK → ledger_order)
     */
    @Column(name = "ledger_order_id", length = 8, nullable = false)
    private String ledgerOrderId;

    /**
     * 제출기관코드 (common_code_details의 SUB_AGENCY_CD 그룹 참조)
     */
    @Column(name = "submitting_agency_cd", length = 20, nullable = false)
    private String submittingAgencyCd;

    /**
     * 제출보고서구분코드 (common_code_details의 SUB_REPORT_TYCD 그룹 참조)
     */
    @Column(name = "report_type_cd", length = 20, nullable = false)
    private String reportTypeCd;

    /**
     * 제출보고서 제목
     */
    @Column(name = "sub_report_title", length = 100)
    private String subReportTitle;

    /**
     * 제출 대상 임원 사번
     */
    @Column(name = "target_executive_emp_no", length = 20)
    private String targetExecutiveEmpNo;

    /**
     * 제출 대상 임원명 (비정규화)
     */
    @Column(name = "target_executive_name", length = 100)
    private String targetExecutiveName;

    /**
     * 임원 직책ID (FK → positions)
     */
    @Column(name = "position_id")
    private Long positionId;

    /**
     * 직책명 (비정규화)
     */
    @Column(name = "position_name", length = 100)
    private String positionName;

    /**
     * 제출일
     */
    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    /**
     * 비고
     */
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

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

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 보고서 정보 업데이트
     */
    public void update(String submittingAgencyCd, String reportTypeCd, String subReportTitle,
                       String targetExecutiveEmpNo, String targetExecutiveName,
                       Long positionId, String positionName, LocalDate submissionDate, String remarks) {
        this.submittingAgencyCd = submittingAgencyCd;
        this.reportTypeCd = reportTypeCd;
        this.subReportTitle = subReportTitle;
        this.targetExecutiveEmpNo = targetExecutiveEmpNo;
        this.targetExecutiveName = targetExecutiveName;
        this.positionId = positionId;
        this.positionName = positionName;
        this.submissionDate = submissionDate;
        this.remarks = remarks;
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
        if (this.submissionDate == null) {
            this.submissionDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
