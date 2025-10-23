package com.rsms.domain.committee.repository;

import com.rsms.domain.committee.entity.CommitteeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 회의체 상세정보 Repository
 *
 * @description 회의체 위원 정보 데이터 접근 인터페이스
 * @author Claude AI
 * @since 2025-10-24
 */
@Repository
public interface CommitteeDetailRepository extends JpaRepository<CommitteeDetail, Long> {

    /**
     * 회의체ID로 위원 목록 조회
     */
    List<CommitteeDetail> findByCommitteesIdOrderByCommitteeDetailsIdAsc(Long committeesId);

    /**
     * 회의체ID + 구분으로 조회
     */
    List<CommitteeDetail> findByCommitteesIdAndCommitteesTypeOrderByCommitteeDetailsIdAsc(
            Long committeesId,
            String committeesType
    );

    /**
     * 회의체ID로 위원 목록 조회 (positions JOIN)
     * - committee_details와 positions를 JOIN하여 직책명 포함
     */
    @Query(value = """
        SELECT
            cd.committee_details_id,
            cd.committees_id,
            cd.committees_type,
            cd.positions_id,
            p.positions_name,
            cd.created_by,
            cd.created_at,
            cd.updated_by,
            cd.updated_at
        FROM rsms.committee_details cd
        LEFT JOIN rsms.positions p ON cd.positions_id = p.positions_id
        WHERE cd.committees_id = :committeesId
        ORDER BY cd.committee_details_id ASC
        """, nativeQuery = true)
    List<Map<String, Object>> findCommitteeDetailsWithPositionsByCommitteesId(@Param("committeesId") Long committeesId);

    /**
     * 회의체ID로 위원명 문자열 조회 (구분별로 그룹핑)
     * - chairman: 위원장
     * - member: 위원 (콤마로 구분하여 한 줄로 표시)
     */
    @Query(value = """
        SELECT
            cd.committees_type,
            STRING_AGG(p.positions_name, ', ' ORDER BY cd.committee_details_id) as position_names
        FROM rsms.committee_details cd
        LEFT JOIN rsms.positions p ON cd.positions_id = p.positions_id
        WHERE cd.committees_id = :committeesId
        GROUP BY cd.committees_type
        """, nativeQuery = true)
    List<Map<String, Object>> findGroupedPositionNamesByCommitteesId(@Param("committeesId") Long committeesId);

    /**
     * 회의체ID로 위원 전체 삭제
     */
    @Modifying
    @Query("DELETE FROM CommitteeDetail cd WHERE cd.committeesId = :committeesId")
    void deleteByCommitteesId(@Param("committeesId") Long committeesId);

    /**
     * 회의체ID + 직책ID로 중복 체크
     */
    boolean existsByCommitteesIdAndPositionsId(Long committeesId, Long positionsId);
}
