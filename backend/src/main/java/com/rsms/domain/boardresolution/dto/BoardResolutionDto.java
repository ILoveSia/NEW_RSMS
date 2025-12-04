package com.rsms.domain.boardresolution.dto;

import lombok.*;

import java.util.List;

/**
 * 이사회결의 응답 DTO
 * - API 응답 시 사용
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResolutionDto {

    /**
     * 이사회결의ID (PK)
     */
    private String resolutionId;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 원장차수명 (조인 데이터)
     */
    private String ledgerOrderTitle;

    /**
     * 회차
     */
    private Integer meetingNumber;

    /**
     * 이사회 결의명
     */
    private String resolutionName;

    /**
     * 요약정보
     */
    private String summary;

    /**
     * 내용
     */
    private String content;

    /**
     * 생성일시
     */
    private String createdAt;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 수정일시
     */
    private String updatedAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 첨부파일 개수
     */
    private Integer fileCount;

    /**
     * 책무구조도 파일 개수
     */
    private Integer responsibilityFileCount;

    /**
     * 첨부파일 목록 (상세 조회 시)
     */
    private List<AttachmentDto> attachments;

    /**
     * 첨부파일 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttachmentDto {
        private String attachmentId;
        private String fileName;
        private String storedFileName;
        private Long fileSize;
        private String contentType;
        private String fileCategory;
        private String description;
        private String createdAt;
        private String createdBy;
    }
}
