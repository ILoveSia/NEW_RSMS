package com.rsms.domain.common.attachment.dto;

import lombok.*;

/**
 * 첨부파일 업로드 요청 DTO
 * - 파일 업로드 시 함께 전달되는 메타데이터
 *
 * @author Claude AI
 * @since 2025-12-01
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentUploadRequest {

    /**
     * 연결된 엔티티 타입 (테이블명)
     * 예: "impl_inspection_items", "submit_reports"
     */
    private String entityType;

    /**
     * 연결된 엔티티 ID
     * 예: "20250001A0001I000001"
     */
    private String entityId;

    /**
     * 업무 단계 (같은 엔티티 내 구분용)
     * - PLAN: 개선계획 단계
     * - IMPL: 개선이행 단계
     * - FINAL: 최종점검 단계
     * - null: 일반 첨부
     */
    private String attachmentPhase;

    /**
     * 파일 분류
     * - EVIDENCE: 증빙자료
     * - REPORT: 보고서
     * - REFERENCE: 참고자료
     * - ETC: 기타
     */
    private String fileCategory;

    /**
     * 파일 설명
     */
    private String description;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;
}
