package com.rsms.domain.approval.repository;

import com.rsms.domain.approval.entity.ApprovalLineStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 결재선 단계 Repository
 *
 * @description 결재선 단계 데이터 접근 인터페이스
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Repository
public interface ApprovalLineStepRepository extends JpaRepository<ApprovalLineStep, String> {

    /**
     * 결재선ID로 단계 목록 조회 (순서대로)
     */
    List<ApprovalLineStep> findByApprovalLine_ApprovalLineIdOrderByStepOrderAsc(String approvalLineId);

    /**
     * 결재선ID로 단계 삭제
     */
    void deleteByApprovalLine_ApprovalLineId(String approvalLineId);

    /**
     * 결재선ID의 단계 수 조회
     */
    long countByApprovalLine_ApprovalLineId(String approvalLineId);
}
