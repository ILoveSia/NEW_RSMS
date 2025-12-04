package com.rsms.domain.boardresolution.controller;

import com.rsms.domain.boardresolution.dto.BoardResolutionDto;
import com.rsms.domain.boardresolution.dto.CreateBoardResolutionRequest;
import com.rsms.domain.boardresolution.dto.UpdateBoardResolutionRequest;
import com.rsms.domain.boardresolution.service.BoardResolutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 이사회결의 Controller
 * - 이사회결의 CRUD API
 * - BoardHistoryMgmt UI 백엔드
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */
@Slf4j
@RestController
@RequestMapping("/api/resps/board-resolutions")
@RequiredArgsConstructor
public class BoardResolutionController {

    private final BoardResolutionService boardResolutionService;

    // ===============================
    // 조회 API
    // ===============================

    /**
     * 전체 이사회결의 목록 조회
     * - GET /api/resps/board-resolutions
     */
    @GetMapping
    public ResponseEntity<List<BoardResolutionDto>> getAllBoardResolutions() {
        log.debug("GET /api/resps/board-resolutions - 전체 이사회결의 목록 조회");
        List<BoardResolutionDto> resolutions = boardResolutionService.getAllBoardResolutions();
        return ResponseEntity.ok(resolutions);
    }

    /**
     * 이사회결의 검색
     * - GET /api/resps/board-resolutions/search
     * - 원장차수ID 또는 결의명으로 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<BoardResolutionDto>> searchBoardResolutions(
            @RequestParam(required = false, defaultValue = "") String ledgerOrderId,
            @RequestParam(required = false, defaultValue = "") String keyword) {
        log.debug("GET /api/resps/board-resolutions/search - 검색: ledgerOrderId={}, keyword={}", ledgerOrderId, keyword);
        List<BoardResolutionDto> resolutions = boardResolutionService.searchBoardResolutions(ledgerOrderId, keyword);
        return ResponseEntity.ok(resolutions);
    }

    /**
     * 이사회결의 단건 조회 (상세)
     * - GET /api/resps/board-resolutions/{resolutionId}
     */
    @GetMapping("/{resolutionId}")
    public ResponseEntity<BoardResolutionDto> getBoardResolution(@PathVariable String resolutionId) {
        log.debug("GET /api/resps/board-resolutions/{} - 이사회결의 상세 조회", resolutionId);
        try {
            BoardResolutionDto resolution = boardResolutionService.getBoardResolution(resolutionId);
            return ResponseEntity.ok(resolution);
        } catch (IllegalArgumentException e) {
            log.warn("이사회결의 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 통계 정보 조회
     * - GET /api/resps/board-resolutions/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.debug("GET /api/resps/board-resolutions/statistics - 통계 정보 조회");
        Map<String, Object> statistics = boardResolutionService.getStatistics();
        return ResponseEntity.ok(statistics);
    }

    // ===============================
    // 등록/수정/삭제 API
    // ===============================

    /**
     * 이사회결의 생성
     * - POST /api/resps/board-resolutions
     */
    @PostMapping
    public ResponseEntity<BoardResolutionDto> createBoardResolution(@RequestBody CreateBoardResolutionRequest request) {
        log.debug("POST /api/resps/board-resolutions - 이사회결의 생성: ledgerOrderId={}", request.getLedgerOrderId());
        try {
            BoardResolutionDto resolution = boardResolutionService.createBoardResolution(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(resolution);
        } catch (IllegalArgumentException e) {
            log.error("이사회결의 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 이사회결의 수정
     * - PUT /api/resps/board-resolutions/{resolutionId}
     */
    @PutMapping("/{resolutionId}")
    public ResponseEntity<BoardResolutionDto> updateBoardResolution(
            @PathVariable String resolutionId,
            @RequestBody UpdateBoardResolutionRequest request) {
        log.debug("PUT /api/resps/board-resolutions/{} - 이사회결의 수정", resolutionId);
        try {
            BoardResolutionDto resolution = boardResolutionService.updateBoardResolution(resolutionId, request);
            return ResponseEntity.ok(resolution);
        } catch (IllegalArgumentException e) {
            log.error("이사회결의 수정 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 이사회결의 삭제
     * - DELETE /api/resps/board-resolutions/{resolutionId}
     */
    @DeleteMapping("/{resolutionId}")
    public ResponseEntity<Void> deleteBoardResolution(@PathVariable String resolutionId) {
        log.debug("DELETE /api/resps/board-resolutions/{} - 이사회결의 삭제", resolutionId);
        try {
            boardResolutionService.deleteBoardResolution(resolutionId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("이사회결의 삭제 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 이사회결의 복수 삭제
     * - DELETE /api/resps/board-resolutions
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteBoardResolutions(@RequestBody List<String> resolutionIds) {
        log.debug("DELETE /api/resps/board-resolutions - 복수 삭제: count={}", resolutionIds.size());
        int successCount = boardResolutionService.deleteBoardResolutions(resolutionIds);
        int failCount = resolutionIds.size() - successCount;

        return ResponseEntity.ok(Map.of(
            "successCount", successCount,
            "failCount", failCount,
            "totalRequested", resolutionIds.size()
        ));
    }
}
