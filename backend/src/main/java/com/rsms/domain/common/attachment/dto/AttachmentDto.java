package com.rsms.domain.common.attachment.dto;

import com.rsms.domain.common.attachment.entity.Attachment;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 첨부파일 응답 DTO
 * - 첨부파일 조회 시 반환되는 데이터
 *
 * @author Claude AI
 * @since 2025-12-01
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {

    /** 첨부파일ID */
    private String attachmentId;

    /** 연결된 엔티티 타입 */
    private String entityType;

    /** 연결된 엔티티 ID */
    private String entityId;

    /** 업무 단계 (PLAN, IMPL, FINAL, null) */
    private String attachmentPhase;

    /** 원본 파일명 */
    private String fileName;

    /** 저장 파일명 */
    private String storedFileName;

    /** 파일 확장자 */
    private String fileExtension;

    /** 파일 크기 (bytes) */
    private Long fileSize;

    /** MIME 타입 */
    private String contentType;

    /** 파일 분류 */
    private String fileCategory;

    /** 파일 설명 */
    private String description;

    /** 정렬 순서 */
    private Integer sortOrder;

    /** 다운로드 횟수 */
    private Integer downloadCount;

    /** 생성일시 */
    private LocalDateTime createdAt;

    /** 생성자ID */
    private String createdBy;

    /** 다운로드 URL (프론트엔드에서 사용) */
    private String downloadUrl;

    /**
     * Entity → DTO 변환
     * @param entity 첨부파일 엔티티
     * @return 첨부파일 DTO
     */
    public static AttachmentDto from(Attachment entity) {
        return AttachmentDto.builder()
                .attachmentId(entity.getAttachmentId())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .attachmentPhase(entity.getAttachmentPhase())
                .fileName(entity.getFileName())
                .storedFileName(entity.getStoredFileName())
                .fileExtension(entity.getFileExtension())
                .fileSize(entity.getFileSize())
                .contentType(entity.getContentType())
                .fileCategory(entity.getFileCategory())
                .description(entity.getDescription())
                .sortOrder(entity.getSortOrder())
                .downloadCount(entity.getDownloadCount())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .downloadUrl("/api/attachments/" + entity.getAttachmentId() + "/download")
                .build();
    }
}
