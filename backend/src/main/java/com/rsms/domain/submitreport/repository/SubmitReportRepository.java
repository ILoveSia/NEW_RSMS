package com.rsms.domain.submitreport.repository;

import com.rsms.domain.submitreport.entity.SubmitReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 제출보고서 Repository
 * - submit_reports 테이블 데이터 접근
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Repository
public interface SubmitReportRepository extends JpaRepository<SubmitReport, Long> {

    /**
     * 원장차수ID로 제출보고서 목록 조회
     */
    List<SubmitReport> findByLedgerOrderIdOrderBySubmissionDateDesc(String ledgerOrderId);

    /**
     * 제출기관코드로 제출보고서 목록 조회
     */
    List<SubmitReport> findBySubmittingAgencyCdOrderBySubmissionDateDesc(String submittingAgencyCd);

    /**
     * 보고서구분코드로 제출보고서 목록 조회
     */
    List<SubmitReport> findByReportTypeCdOrderBySubmissionDateDesc(String reportTypeCd);

    /**
     * 제출일 기간으로 제출보고서 목록 조회
     */
    List<SubmitReport> findBySubmissionDateBetweenOrderBySubmissionDateDesc(LocalDate startDate, LocalDate endDate);

    /**
     * 임원 사번으로 제출보고서 목록 조회
     */
    List<SubmitReport> findByTargetExecutiveEmpNoOrderBySubmissionDateDesc(String targetExecutiveEmpNo);

    /**
     * 원장차수ID별 제출보고서 수 조회
     */
    long countByLedgerOrderId(String ledgerOrderId);

    /**
     * 복합 조건 검색 (동적 쿼리)
     */
    @Query("SELECT sr FROM SubmitReport sr WHERE " +
           "(:ledgerOrderId IS NULL OR sr.ledgerOrderId = :ledgerOrderId) AND " +
           "(:submittingAgencyCd IS NULL OR sr.submittingAgencyCd = :submittingAgencyCd) AND " +
           "(:reportTypeCd IS NULL OR sr.reportTypeCd = :reportTypeCd) AND " +
           "(:submissionDateFrom IS NULL OR sr.submissionDate >= :submissionDateFrom) AND " +
           "(:submissionDateTo IS NULL OR sr.submissionDate <= :submissionDateTo) " +
           "ORDER BY sr.submissionDate DESC, sr.reportId DESC")
    List<SubmitReport> searchByConditions(
            @Param("ledgerOrderId") String ledgerOrderId,
            @Param("submittingAgencyCd") String submittingAgencyCd,
            @Param("reportTypeCd") String reportTypeCd,
            @Param("submissionDateFrom") LocalDate submissionDateFrom,
            @Param("submissionDateTo") LocalDate submissionDateTo
    );
}
