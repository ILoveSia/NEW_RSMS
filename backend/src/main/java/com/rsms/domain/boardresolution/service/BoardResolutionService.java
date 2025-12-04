package com.rsms.domain.boardresolution.service;

import com.rsms.domain.boardresolution.dto.BoardResolutionDto;
import com.rsms.domain.boardresolution.dto.CreateBoardResolutionRequest;
import com.rsms.domain.boardresolution.dto.UpdateBoardResolutionRequest;
import com.rsms.domain.boardresolution.entity.BoardResolution;
import com.rsms.domain.boardresolution.repository.BoardResolutionRepository;
import com.rsms.domain.common.attachment.entity.Attachment;
import com.rsms.domain.common.attachment.repository.AttachmentRepository;
import com.rsms.domain.ledger.entity.LedgerOrder;
import com.rsms.domain.ledger.repository.LedgerOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 이사회결의 서비스
 * - 이사회결의 CRUD 기능
 * - 첨부파일 연동
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BoardResolutionService {

    private final BoardResolutionRepository boardResolutionRepository;
    private final LedgerOrderRepository ledgerOrderRepository;
    private final AttachmentRepository attachmentRepository;

    /**
     * 엔티티 타입 상수 (Attachment 다형성 관계에서 사용)
     */
    private static final String ENTITY_TYPE = "board_resolutions";

    /**
     * 전체 이사회결의 목록 조회
     */
    public List<BoardResolutionDto> getAllBoardResolutions() {
        log.debug("전체 이사회결의 목록 조회");

        List<BoardResolution> resolutions = boardResolutionRepository.findAllOrderByCreatedAtDesc();

        // 원장차수 정보 일괄 조회
        List<String> ledgerOrderIds = resolutions.stream()
            .map(BoardResolution::getLedgerOrderId)
            .distinct()
            .collect(Collectors.toList());

        Map<String, LedgerOrder> ledgerOrderMap = ledgerOrderIds.isEmpty()
            ? Map.of()
            : ledgerOrderRepository.findAllById(ledgerOrderIds).stream()
                .collect(Collectors.toMap(LedgerOrder::getLedgerOrderId, lo -> lo));

        // 첨부파일 개수 일괄 조회
        List<String> resolutionIds = resolutions.stream()
            .map(BoardResolution::getResolutionId)
            .collect(Collectors.toList());

        Map<String, Long> fileCountMap = getFileCountMap(resolutionIds);
        Map<String, Long> responsibilityFileCountMap = getResponsibilityFileCountMap(resolutionIds);

        // DTO 변환
        return resolutions.stream()
            .map(resolution -> convertToDto(
                resolution,
                ledgerOrderMap.get(resolution.getLedgerOrderId()),
                fileCountMap.getOrDefault(resolution.getResolutionId(), 0L).intValue(),
                responsibilityFileCountMap.getOrDefault(resolution.getResolutionId(), 0L).intValue(),
                null
            ))
            .collect(Collectors.toList());
    }

    /**
     * 이사회결의 검색
     */
    public List<BoardResolutionDto> searchBoardResolutions(String ledgerOrderId, String keyword) {
        log.debug("이사회결의 검색: ledgerOrderId={}, keyword={}", ledgerOrderId, keyword);

        List<BoardResolution> resolutions = boardResolutionRepository.searchByConditions(ledgerOrderId, keyword);

        // 원장차수 정보 일괄 조회
        List<String> ledgerOrderIds = resolutions.stream()
            .map(BoardResolution::getLedgerOrderId)
            .distinct()
            .collect(Collectors.toList());

        Map<String, LedgerOrder> ledgerOrderMap = ledgerOrderIds.isEmpty()
            ? Map.of()
            : ledgerOrderRepository.findAllById(ledgerOrderIds).stream()
                .collect(Collectors.toMap(LedgerOrder::getLedgerOrderId, lo -> lo));

        // 첨부파일 개수 일괄 조회
        List<String> resolutionIds = resolutions.stream()
            .map(BoardResolution::getResolutionId)
            .collect(Collectors.toList());

        Map<String, Long> fileCountMap = getFileCountMap(resolutionIds);
        Map<String, Long> responsibilityFileCountMap = getResponsibilityFileCountMap(resolutionIds);

        return resolutions.stream()
            .map(resolution -> convertToDto(
                resolution,
                ledgerOrderMap.get(resolution.getLedgerOrderId()),
                fileCountMap.getOrDefault(resolution.getResolutionId(), 0L).intValue(),
                responsibilityFileCountMap.getOrDefault(resolution.getResolutionId(), 0L).intValue(),
                null
            ))
            .collect(Collectors.toList());
    }

    /**
     * 이사회결의 단건 조회 (상세)
     */
    public BoardResolutionDto getBoardResolution(String resolutionId) {
        log.debug("이사회결의 상세 조회: resolutionId={}", resolutionId);

        BoardResolution resolution = boardResolutionRepository.findById(resolutionId)
            .orElseThrow(() -> new IllegalArgumentException("이사회결의를 찾을 수 없습니다: " + resolutionId));

        // 원장차수 정보 조회
        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(resolution.getLedgerOrderId()).orElse(null);

        // 첨부파일 목록 조회
        List<Attachment> attachments = attachmentRepository.findByEntityTypeAndEntityIdAndIsActive(
            ENTITY_TYPE, resolutionId, "Y"
        );

        int fileCount = attachments.size();
        int responsibilityFileCount = (int) attachments.stream()
            .filter(a -> "responsibility".equalsIgnoreCase(a.getFileCategory()))
            .count();

        return convertToDto(resolution, ledgerOrder, fileCount, responsibilityFileCount, attachments);
    }

    /**
     * 이사회결의 생성
     */
    @Transactional
    public BoardResolutionDto createBoardResolution(CreateBoardResolutionRequest request) {
        log.debug("이사회결의 생성: ledgerOrderId={}, resolutionName={}",
            request.getLedgerOrderId(), request.getResolutionName());

        // 원장차수 존재 확인
        if (!ledgerOrderRepository.existsById(request.getLedgerOrderId())) {
            throw new IllegalArgumentException("존재하지 않는 원장차수입니다: " + request.getLedgerOrderId());
        }

        // 회차 자동 계산 (원장차수별 최대값 + 1)
        Integer maxMeetingNumber = boardResolutionRepository.findMaxMeetingNumberByLedgerOrderId(request.getLedgerOrderId());
        int newMeetingNumber = (maxMeetingNumber != null ? maxMeetingNumber : 0) + 1;

        // ID 생성 (원장차수별 순번)
        Integer maxSequence = boardResolutionRepository.findMaxSequenceByLedgerOrderId(request.getLedgerOrderId());
        int newSequence = (maxSequence != null ? maxSequence : 0) + 1;
        String resolutionId = BoardResolution.generateId(request.getLedgerOrderId(), newSequence);

        // 엔티티 생성
        BoardResolution resolution = BoardResolution.builder()
            .resolutionId(resolutionId)
            .ledgerOrderId(request.getLedgerOrderId())
            .meetingNumber(newMeetingNumber)
            .resolutionName(request.getResolutionName())
            .summary(request.getSummary())
            .content(request.getContent())
            .createdBy("system")
            .updatedBy("system")
            .build();

        BoardResolution savedResolution = boardResolutionRepository.save(resolution);
        log.info("이사회결의 생성 완료: resolutionId={}", savedResolution.getResolutionId());

        // 원장차수 정보 조회
        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(savedResolution.getLedgerOrderId()).orElse(null);

        return convertToDto(savedResolution, ledgerOrder, 0, 0, null);
    }

    /**
     * 이사회결의 수정
     */
    @Transactional
    public BoardResolutionDto updateBoardResolution(String resolutionId, UpdateBoardResolutionRequest request) {
        log.debug("이사회결의 수정: resolutionId={}", resolutionId);

        BoardResolution resolution = boardResolutionRepository.findById(resolutionId)
            .orElseThrow(() -> new IllegalArgumentException("이사회결의를 찾을 수 없습니다: " + resolutionId));

        // 엔티티 업데이트
        resolution.update(
            request.getResolutionName(),
            request.getSummary(),
            request.getContent(),
            "system"
        );

        BoardResolution savedResolution = boardResolutionRepository.save(resolution);
        log.info("이사회결의 수정 완료: resolutionId={}", savedResolution.getResolutionId());

        return getBoardResolution(resolutionId);
    }

    /**
     * 이사회결의 삭제
     */
    @Transactional
    public void deleteBoardResolution(String resolutionId) {
        log.debug("이사회결의 삭제: resolutionId={}", resolutionId);

        if (!boardResolutionRepository.existsById(resolutionId)) {
            throw new IllegalArgumentException("이사회결의를 찾을 수 없습니다: " + resolutionId);
        }

        // 첨부파일 소프트 삭제
        List<Attachment> attachments = attachmentRepository.findByEntityTypeAndEntityIdAndIsActive(
            ENTITY_TYPE, resolutionId, "Y"
        );
        for (Attachment attachment : attachments) {
            attachment.softDelete("system");
            attachmentRepository.save(attachment);
        }

        // 이사회결의 삭제
        boardResolutionRepository.deleteById(resolutionId);
        log.info("이사회결의 삭제 완료: resolutionId={}", resolutionId);
    }

    /**
     * 이사회결의 복수 삭제
     */
    @Transactional
    public int deleteBoardResolutions(List<String> resolutionIds) {
        log.debug("이사회결의 복수 삭제: count={}", resolutionIds.size());

        int successCount = 0;
        for (String resolutionId : resolutionIds) {
            try {
                deleteBoardResolution(resolutionId);
                successCount++;
            } catch (Exception e) {
                log.warn("이사회결의 삭제 실패: resolutionId={}, error={}", resolutionId, e.getMessage());
            }
        }

        return successCount;
    }

    /**
     * 통계 정보 조회
     */
    public Map<String, Object> getStatistics() {
        long totalCount = boardResolutionRepository.count();
        Long currentYearCount = boardResolutionRepository.countCurrentYearResolutions();
        Long totalFileCount = boardResolutionRepository.countTotalAttachments();

        return Map.of(
            "totalCount", totalCount,
            "currentYearCount", currentYearCount != null ? currentYearCount : 0L,
            "totalFileCount", totalFileCount != null ? totalFileCount : 0L
        );
    }

    // ===============================
    // Private Helper Methods
    // ===============================

    /**
     * 첨부파일 개수 맵 조회
     */
    private Map<String, Long> getFileCountMap(List<String> entityIds) {
        if (entityIds.isEmpty()) {
            return Map.of();
        }

        List<Object[]> results = attachmentRepository.countByEntityTypeAndEntityIds(ENTITY_TYPE, entityIds);
        return results.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
            ));
    }

    /**
     * 책무구조도 파일 개수 맵 조회
     */
    private Map<String, Long> getResponsibilityFileCountMap(List<String> entityIds) {
        if (entityIds.isEmpty()) {
            return Map.of();
        }

        List<Object[]> results = attachmentRepository.countByEntityTypeAndEntityIdsAndCategory(
            ENTITY_TYPE, entityIds, "responsibility"
        );
        return results.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
            ));
    }

    /**
     * Entity를 DTO로 변환
     */
    private BoardResolutionDto convertToDto(
        BoardResolution resolution,
        LedgerOrder ledgerOrder,
        int fileCount,
        int responsibilityFileCount,
        List<Attachment> attachments
    ) {
        List<BoardResolutionDto.AttachmentDto> attachmentDtos = null;
        if (attachments != null && !attachments.isEmpty()) {
            attachmentDtos = attachments.stream()
                .map(att -> BoardResolutionDto.AttachmentDto.builder()
                    .attachmentId(att.getAttachmentId())
                    .fileName(att.getFileName())
                    .storedFileName(att.getStoredFileName())
                    .fileSize(att.getFileSize())
                    .contentType(att.getContentType())
                    .fileCategory(att.getFileCategory())
                    .description(att.getDescription())
                    .createdAt(att.getCreatedAt() != null ? att.getCreatedAt().toString() : null)
                    .createdBy(att.getCreatedBy())
                    .build())
                .collect(Collectors.toList());
        }

        return BoardResolutionDto.builder()
            .resolutionId(resolution.getResolutionId())
            .ledgerOrderId(resolution.getLedgerOrderId())
            .ledgerOrderTitle(ledgerOrder != null ? ledgerOrder.getLedgerOrderTitle() : null)
            .meetingNumber(resolution.getMeetingNumber())
            .resolutionName(resolution.getResolutionName())
            .summary(resolution.getSummary())
            .content(resolution.getContent())
            .createdAt(resolution.getCreatedAt() != null ? resolution.getCreatedAt().toString() : null)
            .createdBy(resolution.getCreatedBy())
            .updatedAt(resolution.getUpdatedAt() != null ? resolution.getUpdatedAt().toString() : null)
            .updatedBy(resolution.getUpdatedBy())
            .fileCount(fileCount)
            .responsibilityFileCount(responsibilityFileCount)
            .attachments(attachmentDtos)
            .build();
    }
}
