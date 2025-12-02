package com.rsms.domain.approval.repository;

import com.rsms.domain.approval.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 결재 이력 Repository
 *
 * @description 결재 이력 데이터 접근 인터페이스
 * - SQL 스키마: approval_histories 테이블
 * - PK: approval_history_id (VARCHAR(20))
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, String> {

    /**
     * 결재ID로 이력 목록 조회 (단계순서대로)
     * - step_sequence 컬럼 기준 오름차순 정렬
     */
    List<ApprovalHistory> findByApproval_ApprovalIdOrderByStepSequenceAsc(String approvalId);

    /**
     * 결재ID + 결재자ID로 이력 조회
     */
    Optional<ApprovalHistory> findByApproval_ApprovalIdAndApproverId(String approvalId, String approverId);

    /**
     * 결재ID + 단계순서로 이력 조회
     * - step_sequence 컬럼 사용
     */
    Optional<ApprovalHistory> findByApproval_ApprovalIdAndStepSequence(String approvalId, Integer stepSequence);

    /**
     * 결재자의 대기중인 이력 조회
     * - action_cd = 'DRAFT' (아직 처리하지 않은 상태)
     */
    @Query("SELECT h FROM ApprovalHistory h WHERE h.approverId = :approverId AND h.actionCd = 'DRAFT'")
    List<ApprovalHistory> findPendingByApproverId(@Param("approverId") String approverId);

    /**
     * 결재ID의 다음 단계순서 조회
     * - step_sequence 컬럼 최대값 + 1
     */
    @Query("SELECT COALESCE(MAX(h.stepSequence), 0) + 1 FROM ApprovalHistory h WHERE h.approval.approvalId = :approvalId")
    Integer getNextStepSequence(@Param("approvalId") String approvalId);

    /**
     * 결재ID의 이력 삭제
     */
    void deleteByApproval_ApprovalId(String approvalId);
}
