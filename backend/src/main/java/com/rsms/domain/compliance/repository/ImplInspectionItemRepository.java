package com.rsms.domain.compliance.repository;

import com.rsms.domain.compliance.entity.ImplInspectionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 이행점검항목 Repository
 * - impl_inspection_items 테이블 데이터 액세스
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Repository
public interface ImplInspectionItemRepository extends JpaRepository<ImplInspectionItem, String> {

    /**
     * 이행점검계획ID로 점검항목 목록 조회
     */
    List<ImplInspectionItem> findByImplInspectionPlanIdAndIsActiveOrderByCreatedAtAsc(
            String implInspectionPlanId, String isActive);

    /**
     * 이행점검계획ID로 점검항목 목록 조회 (부서장업무메뉴얼 정보 포함)
     * - deptManagerManual과 organization을 JOIN FETCH하여 Lazy Loading 문제 해결
     * - 조직명(orgName)을 포함한 정보 조회
     */
    @Query("SELECT i FROM ImplInspectionItem i " +
           "LEFT JOIN FETCH i.deptManagerManual m " +
           "LEFT JOIN FETCH m.organization " +
           "WHERE i.implInspectionPlanId = :implInspectionPlanId " +
           "AND i.isActive = :isActive " +
           "ORDER BY i.createdAt ASC")
    List<ImplInspectionItem> findByImplInspectionPlanIdWithManual(
            @Param("implInspectionPlanId") String implInspectionPlanId,
            @Param("isActive") String isActive);

    /**
     * 이행점검계획ID로 점검항목 목록 조회 (모든 상태)
     */
    List<ImplInspectionItem> findByImplInspectionPlanIdOrderByCreatedAtAsc(String implInspectionPlanId);

    /**
     * 부서장업무메뉴얼CD로 점검항목 조회
     */
    List<ImplInspectionItem> findByManualCdAndIsActive(String manualCd, String isActive);

    /**
     * 점검상태코드로 조회
     */
    List<ImplInspectionItem> findByInspectionStatusCdAndIsActive(String inspectionStatusCd, String isActive);

    /**
     * 이행점검계획ID와 점검상태코드로 조회
     */
    List<ImplInspectionItem> findByImplInspectionPlanIdAndInspectionStatusCdAndIsActive(
            String implInspectionPlanId, String inspectionStatusCd, String isActive);

    /**
     * 이행점검계획의 최대 순번 조회 (ID 생성용)
     */
    @Query(value = "SELECT MAX(SUBSTRING(impl_inspection_item_id, 15, 6)::INTEGER) " +
                   "FROM rsms.impl_inspection_items " +
                   "WHERE SUBSTRING(impl_inspection_item_id, 1, 13) = :implInspectionPlanId",
           nativeQuery = true)
    Optional<Integer> findMaxSequenceByImplInspectionPlanId(@Param("implInspectionPlanId") String implInspectionPlanId);

    /**
     * 새로운 이행점검항목ID 생성
     */
    @Query(value = "SELECT rsms.generate_impl_inspection_item_id(:implInspectionPlanId)",
           nativeQuery = true)
    String generateImplInspectionItemId(@Param("implInspectionPlanId") String implInspectionPlanId);

    /**
     * 이행점검계획ID로 점검항목 수 조회
     */
    long countByImplInspectionPlanIdAndIsActive(String implInspectionPlanId, String isActive);

    /**
     * 이행점검계획ID와 점검상태코드로 점검항목 수 조회
     */
    long countByImplInspectionPlanIdAndInspectionStatusCdAndIsActive(
            String implInspectionPlanId, String inspectionStatusCd, String isActive);

    /**
     * 이행점검계획ID로 점검항목 일괄 삭제 (비활성화)
     */
    @Query("UPDATE ImplInspectionItem i SET i.isActive = 'N' WHERE i.implInspectionPlanId = :implInspectionPlanId")
    void deactivateByImplInspectionPlanId(@Param("implInspectionPlanId") String implInspectionPlanId);

    /**
     * 전체 점검항목 조회 (부서장업무메뉴얼, 조직, 이행점검계획 정보 포함)
     * - 점검자지정 페이지용
     */
    @Query("SELECT i FROM ImplInspectionItem i " +
           "LEFT JOIN FETCH i.deptManagerManual m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH i.implInspectionPlan p " +
           "WHERE i.isActive = :isActive " +
           "ORDER BY i.createdAt DESC")
    List<ImplInspectionItem> findAllWithManualAndPlan(@Param("isActive") String isActive);

    /**
     * 원장차수ID로 점검항목 조회 (부서장업무메뉴얼, 조직, 이행점검계획 정보 포함)
     * - 점검자지정 페이지용
     */
    @Query("SELECT i FROM ImplInspectionItem i " +
           "LEFT JOIN FETCH i.deptManagerManual m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH i.implInspectionPlan p " +
           "WHERE p.ledgerOrderId = :ledgerOrderId " +
           "AND i.isActive = :isActive " +
           "ORDER BY i.createdAt DESC")
    List<ImplInspectionItem> findByLedgerOrderIdWithManualAndPlan(
            @Param("ledgerOrderId") String ledgerOrderId,
            @Param("isActive") String isActive);

    /**
     * 전체 점검항목 조회 (책무/책무상세/관리의무 정보 포함)
     * - 이행점검수행 페이지용
     * - dept_manager_manuals → management_obligations → responsibility_details → responsibilities JOIN
     * - 점검자가 지정된 항목만 조회 (inspector_id IS NOT NULL)
     */
    @Query("SELECT DISTINCT i FROM ImplInspectionItem i " +
           "LEFT JOIN FETCH i.deptManagerManual m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.managementObligation o " +
           "LEFT JOIN FETCH o.responsibilityDetail rd " +
           "LEFT JOIN FETCH rd.responsibility r " +
           "LEFT JOIN FETCH i.implInspectionPlan p " +
           "WHERE i.isActive = :isActive " +
           "AND i.inspectorId IS NOT NULL " +
           "ORDER BY i.createdAt DESC")
    List<ImplInspectionItem> findAllWithFullHierarchy(@Param("isActive") String isActive);

    /**
     * 원장차수ID로 점검항목 조회 (책무/책무상세/관리의무 정보 포함)
     * - 이행점검수행 페이지용
     * - dept_manager_manuals → management_obligations → responsibility_details → responsibilities JOIN
     * - 점검자가 지정된 항목만 조회 (inspector_id IS NOT NULL)
     */
    @Query("SELECT DISTINCT i FROM ImplInspectionItem i " +
           "LEFT JOIN FETCH i.deptManagerManual m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.managementObligation o " +
           "LEFT JOIN FETCH o.responsibilityDetail rd " +
           "LEFT JOIN FETCH rd.responsibility r " +
           "LEFT JOIN FETCH i.implInspectionPlan p " +
           "WHERE p.ledgerOrderId = :ledgerOrderId " +
           "AND i.isActive = :isActive " +
           "AND i.inspectorId IS NOT NULL " +
           "ORDER BY i.createdAt DESC")
    List<ImplInspectionItem> findByLedgerOrderIdWithFullHierarchy(
            @Param("ledgerOrderId") String ledgerOrderId,
            @Param("isActive") String isActive);

    /**
     * 이행점검계획ID로 점검항목 조회 (책무/책무상세/관리의무 정보 포함)
     * - 이행점검수행 페이지용
     * - 점검자가 지정된 항목만 조회 (inspector_id IS NOT NULL)
     */
    @Query("SELECT DISTINCT i FROM ImplInspectionItem i " +
           "LEFT JOIN FETCH i.deptManagerManual m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.managementObligation o " +
           "LEFT JOIN FETCH o.responsibilityDetail rd " +
           "LEFT JOIN FETCH rd.responsibility r " +
           "LEFT JOIN FETCH i.implInspectionPlan p " +
           "WHERE i.implInspectionPlanId = :implInspectionPlanId " +
           "AND i.isActive = :isActive " +
           "AND i.inspectorId IS NOT NULL " +
           "ORDER BY i.createdAt ASC")
    List<ImplInspectionItem> findByImplInspectionPlanIdWithFullHierarchy(
            @Param("implInspectionPlanId") String implInspectionPlanId,
            @Param("isActive") String isActive);
}
