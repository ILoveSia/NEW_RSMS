package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.ManagementObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 관리의무 Repository
 * - 관리의무 데이터 접근 계층
 *
 * @author Claude AI
 * @since 2025-09-24
 */
@Repository
public interface ManagementObligationRepository extends JpaRepository<ManagementObligation, Long> {

    /**
     * 책무세부ID로 관리의무 목록 조회 (조직명 포함)
     * - organizations 테이블과 LEFT JOIN하여 org_name 조회
     */
    @Query(value = """
        SELECT mo.*, o.org_name
        FROM rsms.management_obligations mo
        LEFT JOIN rsms.organizations o ON mo.org_code = o.org_code
        WHERE mo.responsibility_detail_id = :responsibilityDetailId
        ORDER BY mo.management_obligation_id
        """, nativeQuery = true)
    List<Object[]> findByResponsibilityDetailIdWithOrgName(@Param("responsibilityDetailId") Long responsibilityDetailId);

    /**
     * 책무세부ID로 관리의무 목록 조회 (기본)
     */
    List<ManagementObligation> findByResponsibilityDetailId(Long responsibilityDetailId);

    /**
     * 책무세부ID로 관리의무 전체 삭제
     */
    void deleteByResponsibilityDetailId(Long responsibilityDetailId);

    /**
     * 책무ID 목록으로 관리의무 전체 조회
     * - responsibilities → responsibility_details → management_obligations 전체 조회
     *
     * @param responsibilityIds 책무ID 목록
     * @return 관리의무 목록
     */
    @Query("SELECT mo FROM ManagementObligation mo " +
           "JOIN FETCH mo.responsibilityDetail rd " +
           "JOIN FETCH rd.responsibility r " +
           "WHERE r.responsibilityId IN :responsibilityIds")
    List<ManagementObligation> findByResponsibilityIds(@Param("responsibilityIds") List<Long> responsibilityIds);
}
