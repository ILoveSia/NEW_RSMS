package com.rsms.domain.organization.repository;

import com.rsms.domain.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 조직 Repository
 * - organizations 테이블 데이터 접근
 * - 본부별 부점 조회 쿼리 제공
 *
 * @author Claude AI
 * @since 2025-10-21
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {

    /**
     * 모든 활성 조직 목록 조회
     * - 사용중(is_active='Y')이고 폐쇄되지 않은(is_closed='N') 조직만 조회
     * - org_code 기준 정렬
     *
     * @return 조직 목록 (org_code, hq_code, org_name, org_type, is_active)
     */
    @Query(value = """
        SELECT org_code, hq_code, org_name, org_type, is_active
        FROM rsms.organizations
        WHERE is_active = 'Y'
          AND is_closed = 'N'
        ORDER BY org_code
        """, nativeQuery = true)
    List<Map<String, Object>> findAllActive();

    /**
     * 본부코드별 조직 목록 조회
     * - 사용중(is_active='Y')이고 폐쇄되지 않은(is_closed='N') 조직만 조회
     * - org_code 기준 정렬
     *
     * @param hqCode 본부코드
     * @return 조직 목록 (org_code, org_name, org_type, is_active)
     */
    @Query(value = """
        SELECT org_code, org_name, org_type, is_active
        FROM rsms.organizations
        WHERE hq_code = :hqCode
          AND is_active = 'Y'
          AND is_closed = 'N'
        ORDER BY org_code
        """, nativeQuery = true)
    List<Map<String, Object>> findByHqCodeAndActive(@Param("hqCode") String hqCode);

    /**
     * 조직 검색 (본부명 포함)
     * - 조직코드 또는 조직명으로 검색
     * - common_code_details와 조인하여 본부명 조회
     * - 사용중(is_active='Y')이고 폐쇄되지 않은(is_closed='N') 조직만 조회
     *
     * @param searchKeyword 검색어 (조직코드 또는 조직명)
     * @return 조직 목록 (org_code, hq_code, hq_name, org_name)
     */
    @Query(value = """
        SELECT
            o.org_code,
            o.hq_code,
            COALESCE(c.detail_name, o.hq_code) as hq_name,
            o.org_name,
            o.org_type,
            o.is_active
        FROM rsms.organizations o
        LEFT JOIN rsms.common_code_details c
            ON c.group_code = 'DPRM_CD'
            AND c.detail_code = o.hq_code
        WHERE o.is_active = 'Y'
          AND o.is_closed = 'N'
          AND (
              LOWER(o.org_code) LIKE LOWER(CONCAT('%', :searchKeyword, '%'))
              OR LOWER(o.org_name) LIKE LOWER(CONCAT('%', :searchKeyword, '%'))
          )
        ORDER BY o.org_code
        """, nativeQuery = true)
    List<Map<String, Object>> searchOrganizations(@Param("searchKeyword") String searchKeyword);

    /**
     * 모든 활성 조직 목록 조회 (본부명 포함)
     * - common_code_details와 조인하여 본부명 조회
     * - 사용중(is_active='Y')이고 폐쇄되지 않은(is_closed='N') 조직만 조회
     *
     * @return 조직 목록 (org_code, hq_code, hq_name, org_name)
     */
    @Query(value = """
        SELECT
            o.org_code,
            o.hq_code,
            COALESCE(c.detail_name, o.hq_code) as hq_name,
            o.org_name,
            o.org_type,
            o.is_active
        FROM rsms.organizations o
        LEFT JOIN rsms.common_code_details c
            ON c.group_code = 'DPRM_CD'
            AND c.detail_code = o.hq_code
        WHERE o.is_active = 'Y'
          AND o.is_closed = 'N'
        ORDER BY o.org_code
        """, nativeQuery = true)
    List<Map<String, Object>> findAllActiveWithHqName();

    /**
     * 조직코드별 관리의무 목록 조회
     * - 사용중(is_active='Y')인 관리의무만 조회
     * - obligation_cd 기준 정렬
     *
     * @param orgCode 조직코드
     * @return 관리의무 목록 (obligation_cd, obligation_info)
     */
    @Query(value = """
        SELECT
            obligation_cd,
            obligation_info
        FROM rsms.management_obligations
        WHERE org_code = :orgCode
          AND is_active = 'Y'
        ORDER BY obligation_cd
        """, nativeQuery = true)
    List<Map<String, Object>> findManagementObligationsByOrgCode(@Param("orgCode") String orgCode);
}
