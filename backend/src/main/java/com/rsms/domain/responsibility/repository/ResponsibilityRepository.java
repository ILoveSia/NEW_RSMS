package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.Responsibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 책무 Repository
 *
 * @description 책무 데이터 접근 인터페이스
 * @author Claude AI
 * @since 2025-09-24
 */
@Repository
public interface ResponsibilityRepository extends JpaRepository<Responsibility, Long> {

    /**
     * 원장차수ID와 직책ID로 책무 목록 조회
     */
    List<Responsibility> findByLedgerOrderIdAndPositionsId(String ledgerOrderId, Long positionsId);

    /**
     * 원장차수ID로 책무 목록 조회
     */
    List<Responsibility> findByLedgerOrderId(String ledgerOrderId);

    /**
     * 직책ID로 책무 목록 조회
     */
    List<Responsibility> findByPositionsId(Long positionsId);

    /**
     * 원장차수ID와 직책ID로 책무 삭제
     */
    void deleteByLedgerOrderIdAndPositionsId(String ledgerOrderId, Long positionsId);

    /**
     * 4개 테이블 조인 조회 (positions, responsibilities, responsibility_details, management_obligations)
     * - 1:N 관계로 인해 직책, 책무, 책무세부가 중복될 수 있음 (정상)
     *
     * @param ledgerOrderId 원장차수ID (선택적)
     * @param positionsName 직책명 (선택적, LIKE 검색)
     * @param responsibilityCdName 책무명 (선택적, LIKE 검색)
     * @return 조인된 책무 목록
     */
    @Query(value = """
        SELECT
            p.positions_id,
            p.ledger_order_id,
            p.positions_cd,
            p.positions_name,
            p.hq_code,
            p.hq_name,
            r.responsibility_id,
            r.responsibility_cat,
            r.responsibility_cd,
            r.responsibility_info,
            r.responsibility_legal,
            r.is_active as responsibility_is_active,
            rd.responsibility_detail_id,
            rd.responsibility_detail_info,
            rd.is_active as detail_is_active,
            mo.management_obligation_id,
            mo.obligation_major_cat_cd,
            mo.obligation_middle_cat_cd,
            mo.obligation_cd,
            mo.obligation_info,
            mo.org_code,
            mo.is_active as obligation_is_active
        FROM rsms.positions p
        LEFT JOIN rsms.responsibilities r ON p.positions_id = r.positions_id
        LEFT JOIN rsms.responsibility_details rd ON r.responsibility_id = rd.responsibility_id
        LEFT JOIN rsms.management_obligations mo ON rd.responsibility_detail_id = mo.responsibility_detail_id
        WHERE 1=1
            AND (:ledgerOrderId IS NULL OR p.ledger_order_id = :ledgerOrderId)
            AND (:positionsName IS NULL OR p.positions_name LIKE CONCAT('%', :positionsName, '%'))
            AND (:responsibilityCd IS NULL OR r.responsibility_cd = :responsibilityCd)
        ORDER BY p.positions_id, r.responsibility_id, rd.responsibility_detail_id, mo.management_obligation_id
        """, nativeQuery = true)
    List<Map<String, Object>> findAllResponsibilitiesWithJoin(
        @Param("ledgerOrderId") String ledgerOrderId,
        @Param("positionsName") String positionsName,
        @Param("responsibilityCd") String responsibilityCd
    );
}
