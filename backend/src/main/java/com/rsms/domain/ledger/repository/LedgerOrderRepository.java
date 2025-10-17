package com.rsms.domain.ledger.repository;

import com.rsms.domain.ledger.entity.LedgerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 원장차수 Repository
 *
 * @description 원장차수 데이터 접근 인터페이스
 * @author Claude AI
 * @since 2025-10-16
 */
@Repository
public interface LedgerOrderRepository extends JpaRepository<LedgerOrder, String> {

    /**
     * 원장상태로 조회
     */
    List<LedgerOrder> findByLedgerOrderStatus(String ledgerOrderStatus);

    /**
     * 원장상태로 조회 (생성일시 역순 정렬)
     */
    List<LedgerOrder> findByLedgerOrderStatusOrderByCreatedAtDesc(String ledgerOrderStatus);

    /**
     * 원장 제목으로 검색 (LIKE)
     */
    List<LedgerOrder> findByLedgerOrderTitleContaining(String title);

    /**
     * 년도로 조회 (ID의 앞 4자리)
     */
    @Query("SELECT lo FROM LedgerOrder lo WHERE SUBSTRING(lo.ledgerOrderId, 1, 4) = :year ORDER BY lo.ledgerOrderId DESC")
    List<LedgerOrder> findByYear(@Param("year") String year);

    /**
     * 년도 및 상태로 조회
     */
    @Query("SELECT lo FROM LedgerOrder lo WHERE " +
           "SUBSTRING(lo.ledgerOrderId, 1, 4) = :year AND " +
           "lo.ledgerOrderStatus = :status " +
           "ORDER BY lo.ledgerOrderId DESC")
    List<LedgerOrder> findByYearAndStatus(
        @Param("year") String year,
        @Param("status") String status
    );

    /**
     * 복합 검색 (키워드, 상태, 년도)
     */
    @Query("SELECT lo FROM LedgerOrder lo WHERE " +
           "(:keyword IS NULL OR " +
           " lo.ledgerOrderId LIKE %:keyword% OR " +
           " lo.ledgerOrderTitle LIKE %:keyword% OR " +
           " lo.ledgerOrderRemarks LIKE %:keyword%) AND " +
           "(:status IS NULL OR lo.ledgerOrderStatus = :status) AND " +
           "(:year IS NULL OR SUBSTRING(lo.ledgerOrderId, 1, 4) = :year) " +
           "ORDER BY lo.ledgerOrderId DESC")
    List<LedgerOrder> searchLedgerOrders(
        @Param("keyword") String keyword,
        @Param("status") String status,
        @Param("year") String year
    );

    /**
     * 원장차수 존재 여부 확인
     */
    boolean existsByLedgerOrderId(String ledgerOrderId);

    /**
     * 원장 제목 중복 확인
     */
    boolean existsByLedgerOrderTitle(String ledgerOrderTitle);

    /**
     * 원장 제목 중복 확인 (자신 제외)
     */
    @Query("SELECT CASE WHEN COUNT(lo) > 0 THEN true ELSE false END " +
           "FROM LedgerOrder lo WHERE " +
           "lo.ledgerOrderTitle = :title AND " +
           "lo.ledgerOrderId <> :excludeId")
    boolean existsByTitleExcludingId(
        @Param("title") String title,
        @Param("excludeId") String excludeId
    );

    /**
     * 해당 년도의 최대 ID 조회 (다음 순번 계산용)
     */
    @Query("SELECT MAX(lo.ledgerOrderId) FROM LedgerOrder lo WHERE SUBSTRING(lo.ledgerOrderId, 1, 4) = :year")
    Optional<String> findMaxIdByYear(@Param("year") String year);

    /**
     * 최근 생성된 원장차수 N개 조회
     */
    @Query("SELECT lo FROM LedgerOrder lo ORDER BY lo.createdAt DESC")
    List<LedgerOrder> findRecentLedgerOrders();

    /**
     * 상태별 카운트
     */
    long countByLedgerOrderStatus(String ledgerOrderStatus);

    /**
     * 년도별 카운트
     */
    @Query("SELECT COUNT(lo) FROM LedgerOrder lo WHERE SUBSTRING(lo.ledgerOrderId, 1, 4) = :year")
    long countByYear(@Param("year") String year);

    /**
     * 전체 카운트 (검색 조건 포함)
     */
    @Query("SELECT COUNT(lo) FROM LedgerOrder lo WHERE " +
           "(:keyword IS NULL OR " +
           " lo.ledgerOrderId LIKE %:keyword% OR " +
           " lo.ledgerOrderTitle LIKE %:keyword% OR " +
           " lo.ledgerOrderRemarks LIKE %:keyword%) AND " +
           "(:status IS NULL OR lo.ledgerOrderStatus = :status) AND " +
           "(:year IS NULL OR SUBSTRING(lo.ledgerOrderId, 1, 4) = :year)")
    long countBySearchConditions(
        @Param("keyword") String keyword,
        @Param("status") String status,
        @Param("year") String year
    );

    /**
     * 콤보박스용 원장차수 조회 (PROG, CLSD만 조회)
     * - 진행중(PROG)과 종료(CLSD) 상태만 조회
     * - 생성일시 역순 정렬 (최신 순)
     */
    @Query("SELECT lo FROM LedgerOrder lo WHERE " +
           "lo.ledgerOrderStatus IN ('PROG', 'CLSD') " +
           "ORDER BY lo.createdAt DESC")
    List<LedgerOrder> findActiveOrdersForComboBox();
}
