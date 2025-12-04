package com.rsms.domain.common.attachment.repository;

import com.rsms.domain.common.attachment.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 첨부파일 Repository
 * - 첨부파일 CRUD 및 조회 기능 제공
 * - 다형성 관계 기반 조회 지원
 *
 * @author Claude AI
 * @since 2025-12-01
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {

    /**
     * 특정 엔티티의 모든 활성 첨부파일 조회
     * @param entityType 엔티티 타입 (테이블명)
     * @param entityId 엔티티 ID
     * @return 첨부파일 목록 (정렬순서, 생성일 순)
     */
    @Query("SELECT a FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId = :entityId " +
           "AND a.isActive = 'Y' " +
           "ORDER BY a.attachmentPhase, a.sortOrder, a.createdAt")
    List<Attachment> findByEntityTypeAndEntityIdAndIsActiveY(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId);

    /**
     * 특정 엔티티의 특정 단계 활성 첨부파일 조회
     * @param entityType 엔티티 타입 (테이블명)
     * @param entityId 엔티티 ID
     * @param attachmentPhase 업무 단계 (PLAN, IMPL, FINAL)
     * @return 첨부파일 목록 (정렬순서, 생성일 순)
     */
    @Query("SELECT a FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId = :entityId " +
           "AND a.attachmentPhase = :attachmentPhase " +
           "AND a.isActive = 'Y' " +
           "ORDER BY a.sortOrder, a.createdAt")
    List<Attachment> findByEntityTypeAndEntityIdAndAttachmentPhaseAndIsActiveY(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("attachmentPhase") String attachmentPhase);

    /**
     * 첨부파일 ID로 활성 첨부파일 조회
     * @param attachmentId 첨부파일 ID
     * @return 첨부파일 Optional
     */
    @Query("SELECT a FROM Attachment a " +
           "WHERE a.attachmentId = :attachmentId " +
           "AND a.isActive = 'Y'")
    Optional<Attachment> findByAttachmentIdAndIsActiveY(@Param("attachmentId") String attachmentId);

    /**
     * 특정 엔티티의 첨부파일 개수 조회
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 첨부파일 개수
     */
    @Query("SELECT COUNT(a) FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId = :entityId " +
           "AND a.isActive = 'Y'")
    long countByEntityTypeAndEntityIdAndIsActiveY(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId);

    /**
     * 특정 엔티티의 특정 단계 첨부파일 개수 조회
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @param attachmentPhase 업무 단계
     * @return 첨부파일 개수
     */
    @Query("SELECT COUNT(a) FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId = :entityId " +
           "AND a.attachmentPhase = :attachmentPhase " +
           "AND a.isActive = 'Y'")
    long countByEntityTypeAndEntityIdAndAttachmentPhaseAndIsActiveY(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("attachmentPhase") String attachmentPhase);

    /**
     * 오늘 날짜의 최대 순번 조회 (ID 생성용)
     * @param prefix 첨부파일 ID 접두사 (ATT + YYYYMMDD)
     * @return 최대 순번
     */
    @Query("SELECT MAX(CAST(SUBSTRING(a.attachmentId, 12, 6) AS int)) " +
           "FROM Attachment a " +
           "WHERE a.attachmentId LIKE :prefix%")
    Integer findMaxSequenceByPrefix(@Param("prefix") String prefix);

    /**
     * 특정 엔티티의 활성 첨부파일 조회 (isActive 파라미터 버전)
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @param isActive 활성 여부
     * @return 첨부파일 목록
     */
    @Query("SELECT a FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId = :entityId " +
           "AND a.isActive = :isActive " +
           "ORDER BY a.sortOrder, a.createdAt")
    List<Attachment> findByEntityTypeAndEntityIdAndIsActive(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("isActive") String isActive);

    /**
     * 복수 엔티티의 첨부파일 개수 조회 (일괄 조회용)
     * @param entityType 엔티티 타입
     * @param entityIds 엔티티 ID 목록
     * @return [entityId, count] 배열 목록
     */
    @Query("SELECT a.entityId, COUNT(a) FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId IN :entityIds " +
           "AND a.isActive = 'Y' " +
           "GROUP BY a.entityId")
    List<Object[]> countByEntityTypeAndEntityIds(
            @Param("entityType") String entityType,
            @Param("entityIds") List<String> entityIds);

    /**
     * 복수 엔티티의 특정 분류 첨부파일 개수 조회
     * @param entityType 엔티티 타입
     * @param entityIds 엔티티 ID 목록
     * @param fileCategory 파일 분류
     * @return [entityId, count] 배열 목록
     */
    @Query("SELECT a.entityId, COUNT(a) FROM Attachment a " +
           "WHERE a.entityType = :entityType " +
           "AND a.entityId IN :entityIds " +
           "AND LOWER(a.fileCategory) = LOWER(:fileCategory) " +
           "AND a.isActive = 'Y' " +
           "GROUP BY a.entityId")
    List<Object[]> countByEntityTypeAndEntityIdsAndCategory(
            @Param("entityType") String entityType,
            @Param("entityIds") List<String> entityIds,
            @Param("fileCategory") String fileCategory);
}
