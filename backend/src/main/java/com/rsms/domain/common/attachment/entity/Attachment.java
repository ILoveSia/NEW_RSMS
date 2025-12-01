package com.rsms.domain.common.attachment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 첨부파일 엔티티
 * - 다형성 관계: entity_type, entity_id로 다양한 테이블과 연결
 * - attachment_phase로 같은 엔티티 내 업무 단계 구분
 * - attachments 테이블 매핑
 *
 * @author Claude AI
 * @since 2025-12-01
 */
@Entity
@Table(name = "attachments", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    /**
     * 첨부파일ID (PK)
     * 코드 생성 규칙: ATT + YYYYMMDD + 순번(6자리)
     * 예시: "ATT20251201000001"
     */
    @Id
    @Column(name = "attachment_id", length = 20, nullable = false)
    private String attachmentId;

    // ============================================
    // 다형성 관계 컬럼 (연결 엔티티 정보)
    // ============================================

    /**
     * 연결된 엔티티 타입 (테이블명)
     * 예: 'impl_inspection_items', 'submit_reports'
     */
    @Column(name = "entity_type", length = 100, nullable = false)
    private String entityType;

    /**
     * 해당 엔티티의 기본키 ID
     */
    @Column(name = "entity_id", length = 100, nullable = false)
    private String entityId;

    /**
     * 첨부파일 업무 단계 (같은 엔티티 내 구분용)
     * - PLAN: 개선계획 단계
     * - IMPL: 개선이행 단계
     * - FINAL: 최종점검 단계
     * - NULL: 일반 첨부 (단계 구분 없음)
     */
    @Column(name = "attachment_phase", length = 50)
    private String attachmentPhase;

    // ============================================
    // 파일 메타데이터
    // ============================================

    /**
     * 원본 파일명 (사용자가 업로드한 파일명)
     */
    @Column(name = "file_name", length = 500, nullable = false)
    private String fileName;

    /**
     * 저장 경로 (서버 파일 시스템 경로)
     */
    @Column(name = "file_path", length = 1000, nullable = false)
    private String filePath;

    /**
     * 저장 파일명 (UUID 등으로 변환된 파일명)
     */
    @Column(name = "stored_file_name", length = 500, nullable = false)
    private String storedFileName;

    /**
     * 파일 확장자
     */
    @Column(name = "file_extension", length = 50)
    private String fileExtension;

    /**
     * 파일 크기 (bytes)
     */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /**
     * MIME 타입
     */
    @Column(name = "content_type", length = 200)
    private String contentType;

    // ============================================
    // 파일 분류 및 설명
    // ============================================

    /**
     * 파일 분류
     * - EVIDENCE: 증빙자료
     * - REPORT: 보고서
     * - REFERENCE: 참고자료
     * - ETC: 기타
     */
    @Column(name = "file_category", length = 50)
    @Builder.Default
    private String fileCategory = "ETC";

    /**
     * 파일 설명
     */
    @Column(name = "description", length = 1000)
    private String description;

    /**
     * 정렬 순서
     */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    // ============================================
    // 다운로드 추적
    // ============================================

    /**
     * 다운로드 횟수
     */
    @Column(name = "download_count")
    @Builder.Default
    private Integer downloadCount = 0;

    /**
     * 마지막 다운로드 일시
     */
    @Column(name = "last_download_at")
    private LocalDateTime lastDownloadAt;

    /**
     * 마지막 다운로드 사용자ID
     */
    @Column(name = "last_download_by", length = 50)
    private String lastDownloadBy;

    // ============================================
    // 공통 감사 필드
    // ============================================

    /**
     * 사용여부 (Y: 사용, N: 삭제)
     */
    @Column(name = "is_active", length = 1, nullable = false)
    @Builder.Default
    private String isActive = "Y";

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 생성자ID
     */
    @Column(name = "created_by", length = 50, nullable = false, updatable = false)
    private String createdBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 수정자ID
     */
    @Column(name = "updated_by", length = 50, nullable = false)
    private String updatedBy;

    // ============================================
    // 생명주기 콜백
    // ============================================

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = "Y";
        }
        if (this.downloadCount == null) {
            this.downloadCount = 0;
        }
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ============================================
    // 비즈니스 메서드
    // ============================================

    /**
     * 다운로드 횟수 증가
     * @param downloaderId 다운로드한 사용자 ID
     */
    public void incrementDownloadCount(String downloaderId) {
        this.downloadCount = (this.downloadCount == null ? 0 : this.downloadCount) + 1;
        this.lastDownloadAt = LocalDateTime.now();
        this.lastDownloadBy = downloaderId;
    }

    /**
     * 소프트 삭제 (is_active = 'N')
     * @param deleterId 삭제자 ID
     */
    public void softDelete(String deleterId) {
        this.isActive = "N";
        this.updatedBy = deleterId;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 활성 상태 여부 확인
     */
    public boolean isActiveAttachment() {
        return "Y".equals(this.isActive);
    }
}
