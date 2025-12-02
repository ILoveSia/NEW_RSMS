package com.rsms.domain.approval.controller;

import com.rsms.domain.approval.dto.*;
import com.rsms.domain.approval.service.ApprovalLineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * 결재선 Controller
 *
 * @description 결재선 관리 REST API 제공
 * - 결재선 CRUD
 * - 결재선 검색
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Slf4j
@RestController
@RequestMapping("/api/approval-lines")
@RequiredArgsConstructor
public class ApprovalLineController {

    private final ApprovalLineService approvalLineService;

    /**
     * 전체 결재선 목록 조회
     * - GET /api/approval-lines
     */
    @GetMapping
    public ResponseEntity<List<ApprovalLineDto>> getAllApprovalLines() {
        log.info("GET /api/approval-lines - 전체 결재선 조회");
        List<ApprovalLineDto> approvalLines = approvalLineService.getAllApprovalLines();
        return ResponseEntity.ok(approvalLines);
    }

    /**
     * 결재선 검색
     * - GET /api/approval-lines/search
     */
    @GetMapping("/search")
    public ResponseEntity<List<ApprovalLineDto>> searchApprovalLines(
            @RequestParam(required = false) String workTypeCd,
            @RequestParam(required = false) String isUsed,
            @RequestParam(required = false) String keyword) {
        log.info("GET /api/approval-lines/search - workTypeCd: {}, isUsed: {}, keyword: {}",
                workTypeCd, isUsed, keyword);
        List<ApprovalLineDto> approvalLines = approvalLineService.searchApprovalLines(workTypeCd, isUsed, keyword);
        return ResponseEntity.ok(approvalLines);
    }

    /**
     * 결재선 단건 조회
     * - GET /api/approval-lines/{approvalLineId}
     */
    @GetMapping("/{approvalLineId}")
    public ResponseEntity<ApprovalLineDto> getApprovalLine(@PathVariable String approvalLineId) {
        log.info("GET /api/approval-lines/{} - 결재선 조회", approvalLineId);
        ApprovalLineDto approvalLine = approvalLineService.getApprovalLine(approvalLineId);
        return ResponseEntity.ok(approvalLine);
    }

    /**
     * 업무구분별 사용중인 결재선 목록 조회
     * - GET /api/approval-lines/work-type/{workTypeCd}
     */
    @GetMapping("/work-type/{workTypeCd}")
    public ResponseEntity<List<ApprovalLineDto>> getActiveApprovalLinesByWorkType(
            @PathVariable String workTypeCd) {
        log.info("GET /api/approval-lines/work-type/{} - 업무구분별 결재선 조회", workTypeCd);
        List<ApprovalLineDto> approvalLines = approvalLineService.getActiveApprovalLinesByWorkType(workTypeCd);
        return ResponseEntity.ok(approvalLines);
    }

    /**
     * 결재선 생성
     * - POST /api/approval-lines
     */
    @PostMapping
    public ResponseEntity<ApprovalLineDto> createApprovalLine(
            @Valid @RequestBody CreateApprovalLineRequest request,
            Principal principal) {
        log.info("POST /api/approval-lines - 결재선 생성: {}", request.getApprovalLineName());
        String userId = principal != null ? principal.getName() : "anonymous";
        ApprovalLineDto created = approvalLineService.createApprovalLine(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 결재선 수정
     * - PUT /api/approval-lines/{approvalLineId}
     */
    @PutMapping("/{approvalLineId}")
    public ResponseEntity<ApprovalLineDto> updateApprovalLine(
            @PathVariable String approvalLineId,
            @Valid @RequestBody UpdateApprovalLineRequest request,
            Principal principal) {
        log.info("PUT /api/approval-lines/{} - 결재선 수정", approvalLineId);
        String userId = principal != null ? principal.getName() : "anonymous";
        ApprovalLineDto updated = approvalLineService.updateApprovalLine(approvalLineId, request, userId);
        return ResponseEntity.ok(updated);
    }

    /**
     * 결재선 삭제
     * - DELETE /api/approval-lines/{approvalLineId}
     */
    @DeleteMapping("/{approvalLineId}")
    public ResponseEntity<Void> deleteApprovalLine(@PathVariable String approvalLineId) {
        log.info("DELETE /api/approval-lines/{} - 결재선 삭제", approvalLineId);
        approvalLineService.deleteApprovalLine(approvalLineId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 결재선 복수 삭제
     * - DELETE /api/approval-lines
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteApprovalLines(@RequestBody List<String> approvalLineIds) {
        log.info("DELETE /api/approval-lines - 결재선 복수 삭제: {} 건", approvalLineIds.size());
        approvalLineService.deleteApprovalLines(approvalLineIds);
        return ResponseEntity.noContent().build();
    }

    /**
     * 결재선 사용여부 토글
     * - PATCH /api/approval-lines/{approvalLineId}/toggle-active
     */
    @PatchMapping("/{approvalLineId}/toggle-active")
    public ResponseEntity<ApprovalLineDto> toggleActive(
            @PathVariable String approvalLineId,
            Principal principal) {
        log.info("PATCH /api/approval-lines/{}/toggle-active - 사용여부 토글", approvalLineId);
        String userId = principal != null ? principal.getName() : "anonymous";
        ApprovalLineDto updated = approvalLineService.toggleActive(approvalLineId, userId);
        return ResponseEntity.ok(updated);
    }

    /**
     * 결재선 통계 조회
     * - GET /api/approval-lines/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        log.info("GET /api/approval-lines/statistics - 통계 조회");
        ApprovalLineService.ApprovalLineStatistics stats = approvalLineService.getStatistics();
        return ResponseEntity.ok(Map.of(
                "total", stats.getTotal(),
                "used", stats.getUsed(),
                "unused", stats.getUnused()
        ));
    }
}
