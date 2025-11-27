package com.rsms.domain.compliance.repository;

import com.rsms.domain.compliance.entity.ImplInspectionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 이행점검계획 Repository
 * - impl_inspection_plans 테이블 데이터 액세스
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Repository
public interface ImplInspectionPlanRepository extends JpaRepository<ImplInspectionPlan, String> {

    /**
     * 활성 상태의 모든 이행점검계획 조회
     */
    List<ImplInspectionPlan> findByIsActiveOrderByCreatedAtDesc(String isActive);

    /**
     * 원장차수ID로 이행점검계획 목록 조회
     */
    List<ImplInspectionPlan> findByLedgerOrderIdAndIsActiveOrderByCreatedAtDesc(String ledgerOrderId, String isActive);

    /**
     * 원장차수ID로 이행점검계획 목록 조회 (모든 상태)
     */
    List<ImplInspectionPlan> findByLedgerOrderIdOrderByCreatedAtDesc(String ledgerOrderId);

    /**
     * 점검상태코드로 조회
     */
    List<ImplInspectionPlan> findByImplInspectionStatusCdAndIsActiveOrderByCreatedAtDesc(
            String implInspectionStatusCd, String isActive);

    /**
     * 점검기간 내의 이행점검계획 조회
     */
    @Query("SELECT p FROM ImplInspectionPlan p " +
           "WHERE p.isActive = :isActive " +
           "AND p.implInspectionStartDate <= :endDate " +
           "AND p.implInspectionEndDate >= :startDate " +
           "ORDER BY p.createdAt DESC")
    List<ImplInspectionPlan> findByDateRangeAndIsActive(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("isActive") String isActive);

    /**
     * 원장차수ID와 점검상태코드로 조회
     */
    List<ImplInspectionPlan> findByLedgerOrderIdAndImplInspectionStatusCdAndIsActive(
            String ledgerOrderId, String implInspectionStatusCd, String isActive);

    /**
     * 원장차수의 최대 순번 조회 (ID 생성용)
     */
    @Query(value = "SELECT MAX(SUBSTRING(impl_inspection_plan_id, 10, 4)::INTEGER) " +
                   "FROM rsms.impl_inspection_plans " +
                   "WHERE SUBSTRING(impl_inspection_plan_id, 1, 8) = :ledgerOrderId",
           nativeQuery = true)
    Optional<Integer> findMaxSequenceByLedgerOrderId(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 새로운 이행점검ID 생성
     */
    @Query(value = "SELECT rsms.generate_impl_inspection_plan_id(:ledgerOrderId)",
           nativeQuery = true)
    String generateImplInspectionPlanId(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 원장차수ID로 이행점검계획 수 조회
     */
    long countByLedgerOrderIdAndIsActive(String ledgerOrderId, String isActive);

    /**
     * 점검상태별 통계 조회
     */
    long countByImplInspectionStatusCdAndIsActive(String implInspectionStatusCd, String isActive);
}
