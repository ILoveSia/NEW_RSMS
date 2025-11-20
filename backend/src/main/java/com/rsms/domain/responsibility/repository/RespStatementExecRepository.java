package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.RespStatementExec;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 책무기술서_임원_정보 Repository
 * - resp_statement_execs 테이블 조회
 *
 * @author RSMS
 * @since 2025-10-29
 */
@Repository
public interface RespStatementExecRepository extends JpaRepository<RespStatementExec, Long> {

    /**
     * 직책ID로 책무기술서 임원정보 조회
     *
     * @param positionId 직책ID
     * @return 책무기술서 임원정보
     */
    Optional<RespStatementExec> findByPosition_PositionsId(Long positionId);

    /**
     * 필터 조건으로 책무기술서 목록 조회 (페이징)
     * - 원장차수ID, 직책명, 사용여부로 필터링
     *
     * @param ledgerOrderId 원장차수ID (null 허용)
     * @param positionName 직책명 (null 허용, LIKE 검색)
     * @param isActive 사용여부 (null 허용)
     * @param pageable 페이징 정보
     * @return 필터링된 책무기술서 목록 (페이징)
     */
    @Query("SELECT r FROM RespStatementExec r " +
           "JOIN FETCH r.position p " +
           "JOIN FETCH r.ledgerOrder l " +
           "WHERE (:ledgerOrderId IS NULL OR r.ledgerOrder.ledgerOrderId = :ledgerOrderId) " +
           "AND (:positionName IS NULL OR p.positionsName LIKE %:positionName%) " +
           "AND (:isActive IS NULL OR r.isActive = :isActive)")
    Page<RespStatementExec> findAllWithFilters(
            @Param("ledgerOrderId") String ledgerOrderId,
            @Param("positionName") String positionName,
            @Param("isActive") String isActive,
            Pageable pageable
    );
}
