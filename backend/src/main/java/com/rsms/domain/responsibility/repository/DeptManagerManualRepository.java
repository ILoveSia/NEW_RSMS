package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.DeptManagerManual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 부서장업무메뉴얼 Repository
 * - 부서장업무메뉴얼 데이터 접근
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Repository
public interface DeptManagerManualRepository extends JpaRepository<DeptManagerManual, String> {

    /**
     * 원장차수ID로 조회
     */
    List<DeptManagerManual> findByLedgerOrderId(String ledgerOrderId);

    /**
     * 조직코드로 조회
     */
    List<DeptManagerManual> findByOrgCode(String orgCode);

    /**
     * 관리의무코드로 조회
     */
    List<DeptManagerManual> findByObligationCd(String obligationCd);

    /**
     * 원장차수ID와 조직코드로 조회
     */
    List<DeptManagerManual> findByLedgerOrderIdAndOrgCode(String ledgerOrderId, String orgCode);

    /**
     * 사용여부로 조회
     */
    List<DeptManagerManual> findByIsActive(String isActive);

    /**
     * 수행여부로 조회
     */
    List<DeptManagerManual> findByExecutionStatus(String executionStatus);

    /**
     * 원장차수ID와 조직코드로 조회 (관계 테이블 JOIN 포함)
     * - responsibilities, responsibility_details, management_obligations, organizations 조인
     */
    @Query("""
        SELECT dmm
        FROM DeptManagerManual dmm
        JOIN FETCH dmm.managementObligation mo
        JOIN FETCH mo.responsibilityDetail rd
        JOIN FETCH rd.responsibility r
        WHERE dmm.ledgerOrderId = :ledgerOrderId
        AND dmm.orgCode = :orgCode
        ORDER BY dmm.createdAt DESC
        """)
    List<DeptManagerManual> findByLedgerOrderIdAndOrgCodeWithDetails(
        @Param("ledgerOrderId") String ledgerOrderId,
        @Param("orgCode") String orgCode
    );

    /**
     * 관리의무코드의 마지막 순번 조회
     * manual_cd 생성을 위한 메서드
     */
    @Query("""
        SELECT MAX(CAST(SUBSTRING(dmm.manualCd, LENGTH(:obligationCd) + 2) AS integer))
        FROM DeptManagerManual dmm
        WHERE dmm.manualCd LIKE CONCAT(:obligationCd, 'A%')
        """)
    Integer findMaxSequenceByObligationCd(@Param("obligationCd") String obligationCd);

    /**
     * 원장차수ID 존재 여부 확인
     */
    boolean existsByLedgerOrderId(String ledgerOrderId);

    /**
     * 조직코드 존재 여부 확인
     */
    boolean existsByOrgCode(String orgCode);
}
