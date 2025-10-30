package com.rsms.domain.position.repository;

import com.rsms.domain.position.entity.PositionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 직책 상세정보 Repository
 *
 * @description 직책별 조직 상세 정보 데이터 액세스 레이어
 * @author Claude AI
 * @since 2025-10-21
 */
@Repository
public interface PositionDetailRepository extends JpaRepository<PositionDetail, Long> {

    /**
     * 직책ID로 상세 목록 조회
     */
    List<PositionDetail> findByPositionsId(Long positionsId);

    /**
     * 본부코드로 상세 목록 조회
     */
    List<PositionDetail> findByHqCode(String hqCode);

    /**
     * 조직코드로 상세 목록 조회
     */
    List<PositionDetail> findByOrgCode(String orgCode);

    /**
     * 직책ID로 상세 정보 삭제
     */
    void deleteByPositionsId(Long positionsId);

    /**
     * 직책ID와 조직코드로 존재 여부 확인
     */
    boolean existsByPositionsIdAndOrgCode(Long positionsId, String orgCode);

    /**
     * 직책ID로 부서 정보 조회 (organizations 테이블 조인)
     * - positions_details와 organizations 테이블을 org_code 기준으로 조인
     * - 조직코드(org_code)와 조직명(org_name)을 Map으로 반환
     *
     * @param positionsId 직책ID
     * @return Map 리스트 (org_code, org_name 포함)
     */
    @Query(value = """
        SELECT pd.org_code, o.org_name
        FROM rsms.positions_details pd
        INNER JOIN rsms.organizations o ON pd.org_code = o.org_code
        WHERE pd.positions_id = :positionsId
        ORDER BY pd.org_code
        """, nativeQuery = true)
    List<Map<String, Object>> findOrgInfoByPositionsId(@Param("positionsId") Long positionsId);

    /**
     * 직책ID로 조직코드 목록 조회 (소관부점 한줄 표시용)
     * - 조직코드들을 콤마로 구분하여 한줄로 표시
     *
     * @param positionId 직책ID
     * @return 조직코드 리스트
     */
    @Query(value = """
        SELECT o.org_name
        FROM rsms.positions_details pd
        INNER JOIN rsms.organizations o ON pd.org_code = o.org_code
        WHERE pd.positions_id = :positionId
        ORDER BY pd.org_code
        """, nativeQuery = true)
    List<String> findOrgCodesByPositionId(@Param("positionId") Long positionId);
}
