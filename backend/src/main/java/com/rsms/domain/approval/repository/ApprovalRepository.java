package com.rsms.domain.approval.repository;

import com.rsms.domain.approval.entity.Approval;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 결재 문서 Repository
 *
 * @description 결재 문서 데이터 접근 인터페이스
 * - 기안함, 결재대기함, 결재완료함 조회 기능
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Repository
public interface ApprovalRepository extends JpaRepository<Approval, String> {

    /**
     * 기안함 조회 (내가 기안한 문서)
     */
    @Query("SELECT a FROM Approval a WHERE a.drafterId = :drafterId ORDER BY a.draftDate DESC")
    List<Approval> findDraftBox(@Param("drafterId") String drafterId);

    /**
     * 기안함 조회 (페이징)
     */
    @Query("SELECT a FROM Approval a WHERE a.drafterId = :drafterId ORDER BY a.draftDate DESC")
    Page<Approval> findDraftBox(@Param("drafterId") String drafterId, Pageable pageable);

    /**
     * 결재대기함 조회 (내가 결재할 문서)
     * - 현재 결재자가 나이고, 상태가 기안(01) 또는 진행중(02)
     */
    @Query("SELECT a FROM Approval a WHERE a.currentApproverId = :approverId " +
           "AND a.approvalStatusCd IN ('01', '02') ORDER BY a.draftDate DESC")
    List<Approval> findPendingBox(@Param("approverId") String approverId);

    /**
     * 결재대기함 조회 (페이징)
     */
    @Query("SELECT a FROM Approval a WHERE a.currentApproverId = :approverId " +
           "AND a.approvalStatusCd IN ('01', '02') ORDER BY a.draftDate DESC")
    Page<Approval> findPendingBox(@Param("approverId") String approverId, Pageable pageable);

    /**
     * 결재완료함 조회 (내가 결재한 문서)
     * - 결재 이력에 내가 승인한 기록이 있는 문서
     */
    @Query("SELECT DISTINCT a FROM Approval a JOIN a.histories h " +
           "WHERE h.approverId = :approverId AND h.actionCd = 'APPROVE' " +
           "ORDER BY a.completedDate DESC")
    List<Approval> findCompletedBox(@Param("approverId") String approverId);

    /**
     * 결재완료함 조회 (페이징)
     */
    @Query("SELECT DISTINCT a FROM Approval a JOIN a.histories h " +
           "WHERE h.approverId = :approverId AND h.actionCd = 'APPROVE' " +
           "ORDER BY a.completedDate DESC")
    Page<Approval> findCompletedBox(@Param("approverId") String approverId, Pageable pageable);

    /**
     * 상태별 결재 문서 조회
     */
    List<Approval> findByApprovalStatusCdOrderByDraftDateDesc(String approvalStatusCd);

    /**
     * 업무구분별 결재 문서 조회
     */
    List<Approval> findByWorkTypeCdOrderByDraftDateDesc(String workTypeCd);

    /**
     * 결재 문서 상세 조회 (이력 포함)
     */
    @Query("SELECT DISTINCT a FROM Approval a LEFT JOIN FETCH a.histories WHERE a.approvalId = :id")
    Optional<Approval> findByIdWithHistories(@Param("id") String id);

    /**
     * 참조문서로 결재 문서 조회
     */
    Optional<Approval> findByReferenceTypeAndReferenceId(String referenceType, String referenceId);

    /**
     * 복합 검색 (기안함용)
     * - PostgreSQL null 파라미터 타입 추론 문제 해결을 위해 Native Query 사용
     */
    @Query(value = "SELECT * FROM approvals a WHERE a.drafter_id = :drafterId " +
           "AND (CAST(:workTypeCd AS VARCHAR) IS NULL OR a.work_type_cd = :workTypeCd) " +
           "AND (CAST(:approvalStatusCd AS VARCHAR) IS NULL OR a.approval_status_cd = :approvalStatusCd) " +
           "AND (CAST(:keyword AS VARCHAR) IS NULL OR a.title LIKE '%' || :keyword || '%') " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR a.draft_date >= :startDate) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR a.draft_date <= :endDate) " +
           "ORDER BY a.draft_date DESC", nativeQuery = true)
    List<Approval> searchDraftBox(
            @Param("drafterId") String drafterId,
            @Param("workTypeCd") String workTypeCd,
            @Param("approvalStatusCd") String approvalStatusCd,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * 복합 검색 (결재대기함용)
     * - PostgreSQL null 파라미터 타입 추론 문제 해결을 위해 Native Query 사용
     */
    @Query(value = "SELECT * FROM approvals a WHERE a.current_approver_id = :approverId " +
           "AND a.approval_status_cd IN ('01', '02') " +
           "AND (CAST(:workTypeCd AS VARCHAR) IS NULL OR a.work_type_cd = :workTypeCd) " +
           "AND (CAST(:keyword AS VARCHAR) IS NULL OR a.title LIKE '%' || :keyword || '%') " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR a.draft_date >= :startDate) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR a.draft_date <= :endDate) " +
           "ORDER BY a.draft_date DESC", nativeQuery = true)
    List<Approval> searchPendingBox(
            @Param("approverId") String approverId,
            @Param("workTypeCd") String workTypeCd,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * 기안함 건수 조회
     */
    long countByDrafterId(String drafterId);

    /**
     * 결재대기함 건수 조회
     */
    @Query("SELECT COUNT(a) FROM Approval a WHERE a.currentApproverId = :approverId " +
           "AND a.approvalStatusCd IN ('01', '02')")
    long countPendingBox(@Param("approverId") String approverId);

    /**
     * 결재완료함 건수 조회
     */
    @Query("SELECT COUNT(DISTINCT a) FROM Approval a JOIN a.histories h " +
           "WHERE h.approverId = :approverId AND h.actionCd = 'APPROVE'")
    long countCompletedBox(@Param("approverId") String approverId);

    /**
     * 결재번호 중복 확인
     */
    boolean existsByApprovalNo(String approvalNo);
}
