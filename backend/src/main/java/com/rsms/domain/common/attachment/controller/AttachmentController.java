package com.rsms.domain.common.attachment.controller;

import com.rsms.domain.common.attachment.dto.AttachmentDto;
import com.rsms.domain.common.attachment.dto.AttachmentUploadRequest;
import com.rsms.domain.common.attachment.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;

/**
 * 첨부파일 Controller
 * - 파일 업로드, 다운로드, 조회, 삭제 REST API 제공
 *
 * @author Claude AI
 * @since 2025-12-01
 */
@Slf4j
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    /**
     * 파일 업로드
     * - POST /api/attachments/upload
     *
     * @param file 업로드할 파일
     * @param entityType 연결할 엔티티 타입 (테이블명)
     * @param entityId 연결할 엔티티 ID
     * @param attachmentPhase 업무 단계 (PLAN, IMPL, FINAL, null)
     * @param fileCategory 파일 분류 (EVIDENCE, REPORT, REFERENCE, ETC)
     * @param description 파일 설명
     * @param sortOrder 정렬 순서
     * @param principal 인증된 사용자 정보
     * @return 저장된 첨부파일 정보
     */
    @PostMapping("/upload")
    public ResponseEntity<AttachmentDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId,
            @RequestParam(value = "attachmentPhase", required = false) String attachmentPhase,
            @RequestParam(value = "fileCategory", required = false) String fileCategory,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
            Principal principal
    ) {
        log.info("POST /api/attachments/upload - entityType: {}, entityId: {}, phase: {}",
                entityType, entityId, attachmentPhase);

        String userId = principal != null ? principal.getName() : "system";

        AttachmentUploadRequest request = AttachmentUploadRequest.builder()
                .entityType(entityType)
                .entityId(entityId)
                .attachmentPhase(attachmentPhase)
                .fileCategory(fileCategory)
                .description(description)
                .sortOrder(sortOrder)
                .build();

        AttachmentDto result = attachmentService.uploadFile(file, request, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * 여러 파일 업로드
     * - POST /api/attachments/upload-multiple
     *
     * @param files 업로드할 파일 목록
     * @param entityType 연결할 엔티티 타입
     * @param entityId 연결할 엔티티 ID
     * @param attachmentPhase 업무 단계
     * @param fileCategory 파일 분류
     * @param principal 인증된 사용자 정보
     * @return 저장된 첨부파일 정보 목록
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<List<AttachmentDto>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId,
            @RequestParam(value = "attachmentPhase", required = false) String attachmentPhase,
            @RequestParam(value = "fileCategory", required = false) String fileCategory,
            Principal principal
    ) {
        log.info("POST /api/attachments/upload-multiple - entityType: {}, entityId: {}, phase: {}, count: {}",
                entityType, entityId, attachmentPhase, files.size());

        String userId = principal != null ? principal.getName() : "system";

        List<AttachmentDto> results = files.stream()
                .map(file -> {
                    AttachmentUploadRequest request = AttachmentUploadRequest.builder()
                            .entityType(entityType)
                            .entityId(entityId)
                            .attachmentPhase(attachmentPhase)
                            .fileCategory(fileCategory)
                            .build();
                    return attachmentService.uploadFile(file, request, userId);
                })
                .toList();

        return ResponseEntity.ok(results);
    }

    /**
     * 특정 엔티티의 모든 첨부파일 조회
     * - GET /api/attachments?entityType=xxx&entityId=xxx
     *
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 첨부파일 목록
     */
    @GetMapping
    public ResponseEntity<List<AttachmentDto>> getAttachmentsByEntity(
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId
    ) {
        log.info("GET /api/attachments - entityType: {}, entityId: {}", entityType, entityId);

        List<AttachmentDto> attachments = attachmentService.getAttachmentsByEntity(entityType, entityId);
        return ResponseEntity.ok(attachments);
    }

    /**
     * 특정 엔티티의 특정 단계 첨부파일 조회
     * - GET /api/attachments/by-phase?entityType=xxx&entityId=xxx&attachmentPhase=xxx
     *
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @param attachmentPhase 업무 단계 (PLAN, IMPL, FINAL)
     * @return 첨부파일 목록
     */
    @GetMapping("/by-phase")
    public ResponseEntity<List<AttachmentDto>> getAttachmentsByEntityAndPhase(
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId,
            @RequestParam("attachmentPhase") String attachmentPhase
    ) {
        log.info("GET /api/attachments/by-phase - entityType: {}, entityId: {}, phase: {}",
                entityType, entityId, attachmentPhase);

        List<AttachmentDto> attachments = attachmentService.getAttachmentsByEntityAndPhase(
                entityType, entityId, attachmentPhase);
        return ResponseEntity.ok(attachments);
    }

    /**
     * 첨부파일 상세 조회
     * - GET /api/attachments/{attachmentId}
     *
     * @param attachmentId 첨부파일 ID
     * @return 첨부파일 정보
     */
    @GetMapping("/{attachmentId}")
    public ResponseEntity<AttachmentDto> getAttachment(@PathVariable String attachmentId) {
        log.info("GET /api/attachments/{}", attachmentId);

        AttachmentDto attachment = attachmentService.getAttachment(attachmentId);
        return ResponseEntity.ok(attachment);
    }

    /**
     * 파일 다운로드
     * - GET /api/attachments/{attachmentId}/download
     *
     * @param attachmentId 첨부파일 ID
     * @param principal 인증된 사용자 정보
     * @return 파일 Resource
     */
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String attachmentId,
            Principal principal
    ) {
        log.info("GET /api/attachments/{}/download", attachmentId);

        String userId = principal != null ? principal.getName() : "system";

        // 메타데이터 조회 (원본 파일명 필요)
        AttachmentDto attachment = attachmentService.getAttachment(attachmentId);

        // 파일 Resource 조회
        Resource resource = attachmentService.downloadFile(attachmentId, userId);

        // Content-Disposition 헤더 설정 (파일명 인코딩)
        String encodedFileName = URLEncoder.encode(attachment.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }

    /**
     * 첨부파일 삭제
     * - DELETE /api/attachments/{attachmentId}
     *
     * @param attachmentId 첨부파일 ID
     * @param principal 인증된 사용자 정보
     * @return 삭제 결과
     */
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String attachmentId,
            Principal principal
    ) {
        log.info("DELETE /api/attachments/{}", attachmentId);

        String userId = principal != null ? principal.getName() : "system";

        attachmentService.deleteAttachment(attachmentId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 여러 첨부파일 일괄 삭제
     * - DELETE /api/attachments
     *
     * @param attachmentIds 첨부파일 ID 목록
     * @param principal 인증된 사용자 정보
     * @return 삭제 결과
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAttachments(
            @RequestBody List<String> attachmentIds,
            Principal principal
    ) {
        log.info("DELETE /api/attachments - count: {}", attachmentIds.size());

        String userId = principal != null ? principal.getName() : "system";

        attachmentService.deleteAttachments(attachmentIds, userId);
        return ResponseEntity.noContent().build();
    }
}
