package com.rsms.domain.boardresolution.repository;

import com.rsms.domain.boardresolution.entity.BoardResolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 이사회결의 Repository
 * - 이사회 결의 정보 데이터 접근 계층
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */
@Repository
public interface BoardResolutionRepository extends JpaRepository<BoardResolution, String> {

    /**
     * 전체 이사회결의 목록 조회 (최신순)
     */
    @Query("SELECT br FROM BoardResolution br ORDER BY br.createdAt DESC")
    List<BoardResolution> findAllOrderByCreatedAtDesc();

    /**
     * 원장차수별 이사회결의 목록 조회
     */
    @Query("SELECT br FROM BoardResolution br WHERE br.ledgerOrderId = :ledgerOrderId ORDER BY br.meetingNumber ASC")
    List<BoardResolution> findByLedgerOrderId(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 결의명으로 검색 (LIKE 검색)
     */
    @Query("SELECT br FROM BoardResolution br WHERE br.resolutionName LIKE %:keyword% ORDER BY br.createdAt DESC")
    List<BoardResolution> searchByResolutionName(@Param("keyword") String keyword);

    /**
     * 원장차수 + 결의명 복합 검색
     */
    @Query("SELECT br FROM BoardResolution br " +
           "WHERE (:ledgerOrderId IS NULL OR :ledgerOrderId = '' OR br.ledgerOrderId = :ledgerOrderId) " +
           "AND (:keyword IS NULL OR :keyword = '' OR br.resolutionName LIKE %:keyword%) " +
           "ORDER BY br.createdAt DESC")
    List<BoardResolution> searchByConditions(
        @Param("ledgerOrderId") String ledgerOrderId,
        @Param("keyword") String keyword
    );

    /**
     * 원장차수별 최대 회차 조회
     * - 새 이사회결의 등록 시 회차 자동 계산용
     */
    @Query("SELECT COALESCE(MAX(br.meetingNumber), 0) FROM BoardResolution br WHERE br.ledgerOrderId = :ledgerOrderId")
    Integer findMaxMeetingNumberByLedgerOrderId(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 원장차수별 최대 순번 조회
     * - ID 생성 시 순번 계산용
     */
    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(resolution_id, 10, 4) AS INTEGER)), 0) " +
                   "FROM rsms.board_resolutions WHERE ledger_order_id = :ledgerOrderId",
           nativeQuery = true)
    Integer findMaxSequenceByLedgerOrderId(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 원장차수와 회차로 존재 여부 확인
     */
    boolean existsByLedgerOrderIdAndMeetingNumber(String ledgerOrderId, Integer meetingNumber);

    /**
     * 결의ID 존재 여부 확인
     */
    boolean existsByResolutionId(String resolutionId);

    /**
     * 현재 연도 이사회결의 개수 조회
     */
    @Query("SELECT COUNT(br) FROM BoardResolution br WHERE YEAR(br.createdAt) = YEAR(CURRENT_DATE)")
    Long countCurrentYearResolutions();

    /**
     * 전체 첨부파일 개수 조회 (attachments 테이블 연동)
     */
    @Query(value = "SELECT COUNT(*) FROM rsms.attachments WHERE entity_type = 'board_resolutions' AND is_active = 'Y'",
           nativeQuery = true)
    Long countTotalAttachments();
}
