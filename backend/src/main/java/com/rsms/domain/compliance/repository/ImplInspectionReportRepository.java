package com.rsms.domain.compliance.repository;

import com.rsms.domain.compliance.entity.ImplInspectionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 이행점검결과보고서 Repository
 * - impl_inspection_reports 테이블 데이터 액세스
 * - CRUD 및 조회 기능 제공
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Repository
public interface ImplInspectionReportRepository extends JpaRepository<ImplInspectionReport, String> {

    // ===============================
    // 기본 조회 메서드
    // ===============================

    /**
     * 활성 상태의 모든 보고서 조회 (최신순)
     */
    List<ImplInspectionReport> findByIsActiveOrderByCreatedAtDesc(String isActive);

    /**
     * 원장차수ID로 보고서 목록 조회
     */
    List<ImplInspectionReport> findByLedgerOrderIdAndIsActiveOrderByCreatedAtDesc(
            String ledgerOrderId, String isActive);

    /**
     * 이행점검계획ID로 보고서 목록 조회
     */
    List<ImplInspectionReport> findByImplInspectionPlanIdAndIsActiveOrderByCreatedAtDesc(
            String implInspectionPlanId, String isActive);

    /**
     * 보고서구분코드로 조회
     */
    List<ImplInspectionReport> findByReportTypeCdAndIsActiveOrderByCreatedAtDesc(
            String reportTypeCd, String isActive);

    // ===============================
    // 복합 조건 조회
    // ===============================

    /**
     * 원장차수ID + 이행점검계획ID로 보고서 목록 조회
     */
    List<ImplInspectionReport> findByLedgerOrderIdAndImplInspectionPlanIdAndIsActiveOrderByCreatedAtDesc(
            String ledgerOrderId, String implInspectionPlanId, String isActive);

    /**
     * 원장차수ID + 보고서구분코드로 조회
     */
    List<ImplInspectionReport> findByLedgerOrderIdAndReportTypeCdAndIsActiveOrderByCreatedAtDesc(
            String ledgerOrderId, String reportTypeCd, String isActive);

    /**
     * 이행점검계획ID + 보고서구분코드로 조회
     */
    List<ImplInspectionReport> findByImplInspectionPlanIdAndReportTypeCdAndIsActive(
            String implInspectionPlanId, String reportTypeCd, String isActive);

    // ===============================
    // 검토일자 기반 조회
    // ===============================

    /**
     * 검토일자 범위로 조회
     */
    @Query("SELECT r FROM ImplInspectionReport r " +
           "WHERE r.isActive = :isActive " +
           "AND r.reviewDate BETWEEN :startDate AND :endDate " +
           "ORDER BY r.reviewDate DESC")
    List<ImplInspectionReport> findByReviewDateBetweenAndIsActive(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("isActive") String isActive);

    // ===============================
    // ID 생성 관련
    // ===============================

    /**
     * 이행점검계획ID의 최대 순번 조회 (ID 생성용)
     */
    @Query(value = "SELECT MAX(SUBSTRING(impl_inspection_report_id, 15, 3)::INTEGER) " +
                   "FROM rsms.impl_inspection_reports " +
                   "WHERE SUBSTRING(impl_inspection_report_id, 1, 13) = :implInspectionPlanId",
           nativeQuery = true)
    Optional<Integer> findMaxSequenceByImplInspectionPlanId(
            @Param("implInspectionPlanId") String implInspectionPlanId);

    /**
     * 새로운 이행점검결과보고서ID 생성 (DB 함수 호출)
     */
    @Query(value = "SELECT rsms.generate_impl_inspection_report_id(:implInspectionPlanId)",
           nativeQuery = true)
    String generateImplInspectionReportId(
            @Param("implInspectionPlanId") String implInspectionPlanId);

    // ===============================
    // 통계 조회
    // ===============================

    /**
     * 원장차수ID별 보고서 수 조회
     */
    long countByLedgerOrderIdAndIsActive(String ledgerOrderId, String isActive);

    /**
     * 이행점검계획ID별 보고서 수 조회
     */
    long countByImplInspectionPlanIdAndIsActive(String implInspectionPlanId, String isActive);

    /**
     * 보고서구분코드별 통계 조회
     */
    long countByReportTypeCdAndIsActive(String reportTypeCd, String isActive);

    /**
     * 원장차수ID + 보고서구분코드별 통계
     */
    long countByLedgerOrderIdAndReportTypeCdAndIsActive(
            String ledgerOrderId, String reportTypeCd, String isActive);

    // ===============================
    // 존재 여부 확인
    // ===============================

    /**
     * 이행점검계획에 대한 보고서 존재 여부 확인
     */
    boolean existsByImplInspectionPlanIdAndReportTypeCdAndIsActive(
            String implInspectionPlanId, String reportTypeCd, String isActive);
}
