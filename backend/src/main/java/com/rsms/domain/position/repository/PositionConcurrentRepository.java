package com.rsms.domain.position.repository;

import com.rsms.domain.position.entity.PositionConcurrent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 직책겸직 Repository
 * - position_concurrents 테이블 접근
 */
@Repository
public interface PositionConcurrentRepository extends JpaRepository<PositionConcurrent, Long> {

    /**
     * 원장차수ID로 겸직 목록 조회
     */
    List<PositionConcurrent> findByLedgerOrderId(String ledgerOrderId);

    /**
     * 겸직그룹코드로 겸직 목록 조회
     */
    List<PositionConcurrent> findByConcurrentGroupCd(String concurrentGroupCd);

    /**
     * 원장차수ID와 겸직그룹코드로 겸직 목록 조회
     */
    List<PositionConcurrent> findByLedgerOrderIdAndConcurrentGroupCd(
        String ledgerOrderId,
        String concurrentGroupCd
    );

    /**
     * 원장차수ID와 직책코드로 겸직 정보 조회
     */
    Optional<PositionConcurrent> findByLedgerOrderIdAndPositionsCd(
        String ledgerOrderId,
        String positionsCd
    );

    /**
     * 다음 겸직그룹코드 생성을 위한 최대값 조회
     * - 예: G0001, G0002, ... 중 최대값
     */
    @Query(value = """
        SELECT COALESCE(MAX(CAST(SUBSTRING(concurrent_group_cd, 2) AS INTEGER)), 0)
        FROM rsms.position_concurrents
        WHERE concurrent_group_cd LIKE 'G%'
        """, nativeQuery = true)
    Integer findMaxConcurrentGroupNumber();

    /**
     * 겸직그룹코드 존재 여부 확인
     */
    boolean existsByConcurrentGroupCd(String concurrentGroupCd);

    /**
     * 원장차수ID와 직책코드로 겸직 존재 여부 확인
     */
    boolean existsByLedgerOrderIdAndPositionsCd(String ledgerOrderId, String positionsCd);

    /**
     * 겸직그룹코드로 삭제
     */
    void deleteByConcurrentGroupCd(String concurrentGroupCd);

    /**
     * 사용중인 겸직 목록 조회 (is_active = 'Y')
     */
    @Query(value = """
        SELECT pc.*
        FROM rsms.position_concurrents pc
        WHERE pc.ledger_order_id = :ledgerOrderId
          AND pc.is_active = 'Y'
        ORDER BY pc.concurrent_group_cd, pc.is_representative DESC
        """, nativeQuery = true)
    List<PositionConcurrent> findActiveByLedgerOrderId(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 원장차수ID로 겸직 목록 조회 (positions 테이블 조인)
     * - positions 테이블의 hq_code, hq_name을 함께 조회
     */
    @Query(value = """
        SELECT pc.position_concurrent_id,
               pc.ledger_order_id,
               pc.positions_cd,
               pc.concurrent_group_cd,
               pc.positions_name,
               pc.is_representative,
               COALESCE(p.hq_code, pc.hq_code) as hq_code,
               COALESCE(p.hq_name, pc.hq_name) as hq_name,
               pc.is_active,
               pc.created_by,
               pc.created_at,
               pc.updated_by,
               pc.updated_at
        FROM rsms.position_concurrents pc
        LEFT JOIN rsms.positions p
            ON pc.ledger_order_id = p.ledger_order_id
            AND pc.positions_cd = p.positions_cd
        WHERE pc.ledger_order_id = :ledgerOrderId
        ORDER BY pc.concurrent_group_cd, pc.is_representative DESC
        """, nativeQuery = true)
    List<PositionConcurrent> findByLedgerOrderIdWithPositions(@Param("ledgerOrderId") String ledgerOrderId);

    /**
     * 겸직그룹코드로 겸직 목록 조회 (positions 테이블 조인)
     * - positions 테이블의 hq_code, hq_name을 함께 조회
     */
    @Query(value = """
        SELECT pc.position_concurrent_id,
               pc.ledger_order_id,
               pc.positions_cd,
               pc.concurrent_group_cd,
               pc.positions_name,
               pc.is_representative,
               COALESCE(p.hq_code, pc.hq_code) as hq_code,
               COALESCE(p.hq_name, pc.hq_name) as hq_name,
               pc.is_active,
               pc.created_by,
               pc.created_at,
               pc.updated_by,
               pc.updated_at
        FROM rsms.position_concurrents pc
        LEFT JOIN rsms.positions p
            ON pc.ledger_order_id = p.ledger_order_id
            AND pc.positions_cd = p.positions_cd
        WHERE pc.concurrent_group_cd = :concurrentGroupCd
        ORDER BY pc.is_representative DESC
        """, nativeQuery = true)
    List<PositionConcurrent> findByConcurrentGroupCdWithPositions(@Param("concurrentGroupCd") String concurrentGroupCd);
}
