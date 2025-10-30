package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.RespStatementExec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 책무기술서_임원_정보 Repository
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
}
