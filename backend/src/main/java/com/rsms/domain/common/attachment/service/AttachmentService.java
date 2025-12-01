package com.rsms.domain.common.attachment.service;

import com.rsms.domain.common.attachment.dto.AttachmentDto;
import com.rsms.domain.common.attachment.dto.AttachmentUploadRequest;
import com.rsms.domain.common.attachment.entity.Attachment;
import com.rsms.domain.common.attachment.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 첨부파일 서비스
 * - 파일 업로드, 다운로드, 조회, 삭제 기능 제공
 * - 파일 시스템 저장 및 메타데이터 관리
 *
 * @author Claude AI
 * @since 2025-12-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    /**
     * 파일 저장 기본 경로
     * application.yml에서 설정: rsms.upload.path
     */
    @Value("${rsms.upload.path:/uploads}")
    private String uploadPath;

    /**
     * 허용되는 파일 확장자 목록
     */
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "hwp", "txt", "jpg", "jpeg", "png", "gif", "bmp", "zip"
    );

    /**
     * 최대 파일 크기 (10MB)
     */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * 파일 업로드
     * - 파일을 서버에 저장하고 메타데이터를 DB에 저장
     *
     * @param file 업로드할 파일
     * @param request 업로드 요청 정보 (엔티티 연결 정보)
     * @param userId 업로드 사용자 ID
     * @return 저장된 첨부파일 DTO
     */
    @Transactional
    public AttachmentDto uploadFile(MultipartFile file, AttachmentUploadRequest request, String userId) {
        log.info("📎 [AttachmentService] 파일 업로드 시작");
        log.info("  - 원본 파일명: {}", file.getOriginalFilename());
        log.info("  - 파일 크기: {} bytes", file.getSize());
        log.info("  - 엔티티 타입: {}, ID: {}", request.getEntityType(), request.getEntityId());
        log.info("  - 업무 단계: {}", request.getAttachmentPhase());

        // 1. 파일 유효성 검사
        validateFile(file);

        // 2. 파일 정보 추출
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String storedFileName = generateStoredFileName(fileExtension);
        String contentType = file.getContentType();

        // 3. 저장 경로 생성 (년/월/일 기준 폴더 구조)
        String relativePath = generateRelativePath(request.getEntityType());
        Path targetDirectory = Paths.get(uploadPath, relativePath);

        try {
            // 디렉토리가 없으면 생성
            Files.createDirectories(targetDirectory);

            // 4. 파일 저장
            Path targetPath = targetDirectory.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("  - 파일 저장 완료: {}", targetPath);

            // 5. 첨부파일 ID 생성
            String attachmentId = generateAttachmentId();

            // 6. 메타데이터 DB 저장
            Attachment attachment = Attachment.builder()
                    .attachmentId(attachmentId)
                    .entityType(request.getEntityType())
                    .entityId(request.getEntityId())
                    .attachmentPhase(request.getAttachmentPhase())
                    .fileName(originalFileName)
                    .filePath(relativePath)
                    .storedFileName(storedFileName)
                    .fileExtension(fileExtension)
                    .fileSize(file.getSize())
                    .contentType(contentType)
                    .fileCategory(request.getFileCategory() != null ? request.getFileCategory() : "ETC")
                    .description(request.getDescription())
                    .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                    .createdBy(userId)
                    .updatedBy(userId)
                    .build();

            Attachment savedAttachment = attachmentRepository.save(attachment);
            log.info("✅ [AttachmentService] 파일 업로드 완료: {}", attachmentId);

            return AttachmentDto.from(savedAttachment);

        } catch (IOException e) {
            log.error("❌ [AttachmentService] 파일 저장 실패: {}", e.getMessage());
            throw new RuntimeException("파일 저장에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 특정 엔티티의 모든 첨부파일 조회
     *
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 첨부파일 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<AttachmentDto> getAttachmentsByEntity(String entityType, String entityId) {
        log.info("📎 [AttachmentService] 엔티티별 첨부파일 조회: type={}, id={}", entityType, entityId);

        return attachmentRepository.findByEntityTypeAndEntityIdAndIsActiveY(entityType, entityId)
                .stream()
                .map(AttachmentDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 엔티티의 특정 단계 첨부파일 조회
     *
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @param attachmentPhase 업무 단계 (PLAN, IMPL, FINAL)
     * @return 첨부파일 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<AttachmentDto> getAttachmentsByEntityAndPhase(String entityType, String entityId, String attachmentPhase) {
        log.info("📎 [AttachmentService] 엔티티/단계별 첨부파일 조회: type={}, id={}, phase={}",
                entityType, entityId, attachmentPhase);

        return attachmentRepository.findByEntityTypeAndEntityIdAndAttachmentPhaseAndIsActiveY(
                        entityType, entityId, attachmentPhase)
                .stream()
                .map(AttachmentDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 첨부파일 다운로드
     * - 다운로드 횟수 증가 및 Resource 반환
     *
     * @param attachmentId 첨부파일 ID
     * @param userId 다운로드 사용자 ID
     * @return 파일 Resource
     */
    @Transactional
    public Resource downloadFile(String attachmentId, String userId) {
        log.info("📎 [AttachmentService] 파일 다운로드: id={}, user={}", attachmentId, userId);

        Attachment attachment = attachmentRepository.findByAttachmentIdAndIsActiveY(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        // 다운로드 횟수 증가
        attachment.incrementDownloadCount(userId);
        attachmentRepository.save(attachment);

        // 파일 Resource 반환
        try {
            Path filePath = Paths.get(uploadPath, attachment.getFilePath(), attachment.getStoredFileName());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 읽을 수 없습니다: " + attachmentId);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로가 올바르지 않습니다: " + attachmentId, e);
        }
    }

    /**
     * 첨부파일 조회 (다운로드용 - 메타데이터만)
     *
     * @param attachmentId 첨부파일 ID
     * @return 첨부파일 DTO
     */
    @Transactional(readOnly = true)
    public AttachmentDto getAttachment(String attachmentId) {
        Attachment attachment = attachmentRepository.findByAttachmentIdAndIsActiveY(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));
        return AttachmentDto.from(attachment);
    }

    /**
     * 첨부파일 삭제 (소프트 삭제)
     *
     * @param attachmentId 첨부파일 ID
     * @param userId 삭제 사용자 ID
     */
    @Transactional
    public void deleteAttachment(String attachmentId, String userId) {
        log.info("📎 [AttachmentService] 첨부파일 삭제: id={}, user={}", attachmentId, userId);

        Attachment attachment = attachmentRepository.findByAttachmentIdAndIsActiveY(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        // 소프트 삭제
        attachment.softDelete(userId);
        attachmentRepository.save(attachment);

        log.info("✅ [AttachmentService] 첨부파일 삭제 완료: {}", attachmentId);
    }

    /**
     * 여러 첨부파일 일괄 삭제 (소프트 삭제)
     *
     * @param attachmentIds 첨부파일 ID 목록
     * @param userId 삭제 사용자 ID
     */
    @Transactional
    public void deleteAttachments(List<String> attachmentIds, String userId) {
        log.info("📎 [AttachmentService] 첨부파일 일괄 삭제: count={}", attachmentIds.size());

        for (String attachmentId : attachmentIds) {
            try {
                deleteAttachment(attachmentId, userId);
            } catch (Exception e) {
                log.warn("첨부파일 삭제 실패 (계속 진행): id={}, error={}", attachmentId, e.getMessage());
            }
        }
    }

    // ============================================
    // Private Helper Methods
    // ============================================

    /**
     * 파일 유효성 검사
     * - 빈 파일, 파일 크기, 확장자 검사
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기가 10MB를 초과합니다.");
        }

        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + extension);
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    /**
     * 저장 파일명 생성 (UUID 기반)
     */
    private String generateStoredFileName(String extension) {
        return UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
    }

    /**
     * 상대 저장 경로 생성 (년/월 기준)
     */
    private String generateRelativePath(String entityType) {
        LocalDate now = LocalDate.now();
        return String.format("%s/%d/%02d", entityType, now.getYear(), now.getMonthValue());
    }

    /**
     * 첨부파일 ID 생성
     * 형식: ATT + YYYYMMDD + 순번(6자리)
     */
    private String generateAttachmentId() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "ATT" + today;

        Integer maxSeq = attachmentRepository.findMaxSequenceByPrefix(prefix);
        int nextSeq = (maxSeq == null ? 0 : maxSeq) + 1;

        return String.format("%s%06d", prefix, nextSeq);
    }
}
