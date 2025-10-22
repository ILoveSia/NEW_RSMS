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
}
