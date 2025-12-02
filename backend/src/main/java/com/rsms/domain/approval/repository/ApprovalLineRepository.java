package com.rsms.domain.approval.repository;

import com.rsms.domain.approval.entity.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 결재선 Repository
 *
 * @description 결재선 마스터 데이터 접근 인터페이스
 * - 기본 CRUD + 검색 기능 제공
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Repository
public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, String> {

    /**
     * 업무구분별 결재선 목록 조회
     */
    List<ApprovalLine> findByWorkTypeCdOrderBySequenceAsc(String workTypeCd);

    /**
     * 사용중인 결재선 목록 조회
     */
    List<ApprovalLine> findByIsUsedOrderBySequenceAsc(String isUsed);

    /**
     * 업무구분 + 사용여부로 결재선 조회
     */
    List<ApprovalLine> findByWorkTypeCdAndIsUsedOrderBySequenceAsc(String workTypeCd, String isUsed);

    /**
     * 결재선명으로 검색
     */
    @Query("SELECT al FROM ApprovalLine al WHERE al.approvalLineName LIKE %:keyword% ORDER BY al.sequence ASC")
    List<ApprovalLine> searchByName(@Param("keyword") String keyword);

    /**
     * 결재선명 또는 팝업제목으로 검색
     */
    @Query("SELECT al FROM ApprovalLine al WHERE " +
           "(al.approvalLineName LIKE %:keyword% OR al.popupTitle LIKE %:keyword%) " +
           "ORDER BY al.sequence ASC")
    List<ApprovalLine> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 복합 검색 (업무구분 + 사용여부 + 키워드)
     */
    @Query("SELECT al FROM ApprovalLine al WHERE " +
           "(:workTypeCd IS NULL OR al.workTypeCd = :workTypeCd) AND " +
           "(:isUsed IS NULL OR al.isUsed = :isUsed) AND " +
           "(:keyword IS NULL OR al.approvalLineName LIKE %:keyword% OR al.popupTitle LIKE %:keyword%) " +
           "ORDER BY al.sequence ASC")
    List<ApprovalLine> search(
            @Param("workTypeCd") String workTypeCd,
            @Param("isUsed") String isUsed,
            @Param("keyword") String keyword);

    /**
     * 결재선과 단계 함께 조회 (fetch join)
     */
    @Query("SELECT DISTINCT al FROM ApprovalLine al LEFT JOIN FETCH al.steps WHERE al.approvalLineId = :id")
    Optional<ApprovalLine> findByIdWithSteps(@Param("id") String id);

    /**
     * 업무구분별 사용중인 결재선 개수
     */
    long countByWorkTypeCdAndIsUsed(String workTypeCd, String isUsed);

    /**
     * 전체 사용중인 결재선 개수
     */
    long countByIsUsed(String isUsed);

    /**
     * 다음 시퀀스 번호 조회
     */
    @Query("SELECT COALESCE(MAX(al.sequence), 0) + 1 FROM ApprovalLine al WHERE al.workTypeCd = :workTypeCd")
    Integer getNextSequence(@Param("workTypeCd") String workTypeCd);
}
