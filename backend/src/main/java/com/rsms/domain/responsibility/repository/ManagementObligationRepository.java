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
 * @updated 2025-01-05 - PK/FK 타입 변경 (Long → String), 코드 생성용 쿼리 메서드 추가
 */
@Repository
public interface ManagementObligationRepository extends JpaRepository<ManagementObligation, String> {

    /**
     * 책무세부코드로 관리의무 목록 조회 (조직명 포함)
     * - organizations 테이블과 LEFT JOIN하여 org_name 조회
     */
    @Query(value = """
        SELECT mo.*, o.org_name
        FROM rsms.management_obligations mo
        LEFT JOIN rsms.organizations o ON mo.org_code = o.org_code
        WHERE mo.responsibility_detail_cd = :responsibilityDetailCd
        ORDER BY mo.obligation_cd
        """, nativeQuery = true)
    List<Object[]> findByResponsibilityDetailCdWithOrgName(@Param("responsibilityDetailCd") String responsibilityDetailCd);

    /**
     * 책무세부코드로 관리의무 목록 조회 (기본)
     */
    List<ManagementObligation> findByResponsibilityDetailCd(String responsibilityDetailCd);

    /**
     * 책무세부코드 목록으로 관리의무 목록 조회 (IN 절)
     */
    List<ManagementObligation> findByResponsibilityDetailCdIn(List<String> responsibilityDetailCodes);

    /**
     * 책무세부코드로 관리의무 전체 삭제
     */
    void deleteByResponsibilityDetailCd(String responsibilityDetailCd);

    /**
     * 책무코드 목록으로 관리의무 전체 조회
     * - responsibilities → responsibility_details → management_obligations 전체 조회
     *
     * @param responsibilityCds 책무코드 목록
     * @return 관리의무 목록
     */
    @Query("SELECT mo FROM ManagementObligation mo " +
           "JOIN FETCH mo.responsibilityDetail rd " +
           "JOIN FETCH rd.responsibility r " +
           "WHERE r.responsibilityCd IN :responsibilityCds")
    List<ManagementObligation> findByResponsibilityCds(@Param("responsibilityCds") List<String> responsibilityCds);

    // ===============================
    // 코드 생성용 쿼리 메서드
    // ===============================

    /**
     * 특정 책무세부코드의 최대 순번 조회 (코드 생성용)
     *
     * @param responsibilityDetailCd 책무세부코드 (예: "RM0001D0001")
     * @return 최대 순번 (없으면 0)
     *
     * 사용 예시:
     * - responsibilityDetailCd = "RM0001D0001"
     * - 기존 코드: "RM0001D0001MO0001", "RM0001D0001MO0002"
     * - 코드에서 "MO" 다음 4자리 추출: "0001", "0002"
     * - 반환값: 2
     * - 다음 코드: "RM0001D0001MO0003"
     */
    @Query("""
        SELECT COALESCE(MAX(CAST(SUBSTRING(mo.obligationCd, :prefixLength + 1, 4) AS integer)), 0)
        FROM ManagementObligation mo
        WHERE mo.responsibilityDetailCd = :responsibilityDetailCd
        """)
    Integer findMaxSequenceByResponsibilityDetailCd(
        @Param("responsibilityDetailCd") String responsibilityDetailCd,
        @Param("prefixLength") Integer prefixLength
    );

    /**
     * 관리의무코드 존재 여부 확인
     */
    boolean existsByObligationCd(String obligationCd);
}
