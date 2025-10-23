package com.rsms.domain.committee.repository;

import com.rsms.domain.committee.entity.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 회의체 Repository
 *
 * @description 회의체 데이터 접근 인터페이스
 * @author Claude AI
 * @since 2025-10-24
 */
@Repository
public interface CommitteeRepository extends JpaRepository<Committee, Long> {

    /**
     * 원장차수별 회의체 목록 조회
     */
    List<Committee> findByLedgerOrderIdOrderByCommitteesIdDesc(String ledgerOrderId);

    /**
     * 원장차수별 활성 회의체 목록 조회
     */
    List<Committee> findByLedgerOrderIdAndIsActiveOrderByCommitteesIdDesc(String ledgerOrderId, String isActive);

    /**
     * 회의체ID로 조회
     */
    Optional<Committee> findByCommitteesId(Long committeesId);

    /**
     * 회의체명으로 검색 (LIKE)
     */
    @Query("SELECT c FROM Committee c WHERE c.committeesTitle LIKE %:committeesTitle% ORDER BY c.committeesId DESC")
    List<Committee> searchByCommitteesTitle(@Param("committeesTitle") String committeesTitle);

    /**
     * 원장차수 + 회의체명으로 검색
     */
    @Query("SELECT c FROM Committee c WHERE c.ledgerOrderId = :ledgerOrderId AND c.committeesTitle LIKE %:committeesTitle% ORDER BY c.committeesId DESC")
    List<Committee> searchByLedgerOrderIdAndCommitteesTitle(
            @Param("ledgerOrderId") String ledgerOrderId,
            @Param("committeesTitle") String committeesTitle
    );

    /**
     * 원장차수 + 개최주기로 검색
     */
    List<Committee> findByLedgerOrderIdAndCommitteeFrequencyOrderByCommitteesIdDesc(
            String ledgerOrderId,
            String committeeFrequency
    );

    /**
     * 회의체명 중복 체크
     */
    boolean existsByLedgerOrderIdAndCommitteesTitle(String ledgerOrderId, String committeesTitle);
}
