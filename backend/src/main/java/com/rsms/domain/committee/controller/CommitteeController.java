package com.rsms.domain.committee.controller;

import com.rsms.domain.committee.dto.*;
import com.rsms.domain.committee.service.CommitteeService;
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
 * 회의체 Controller
 *
 * @description 회의체 관리 REST API 제공
 * - CRUD 및 검색 기능
 *
 * @author Claude AI
 * @since 2025-10-24
 */
@Slf4j
@RestController
@RequestMapping("/api/committees")
@RequiredArgsConstructor
public class CommitteeController {

    private final CommitteeService committeeService;

    /**
     * 모든 회의체 조회
     * - GET /api/committees
     *
     * @return 전체 회의체 리스트 (위원 목록 포함)
     */
    @GetMapping
    public ResponseEntity<List<CommitteeDto>> getAllCommittees() {
        log.info("GET /api/committees - 모든 회의체 조회");
        List<CommitteeDto> committees = committeeService.getAllCommittees();
        return ResponseEntity.ok(committees);
    }

    /**
     * 원장차수별 회의체 조회
     * - GET /api/committees/ledger/{ledgerOrderId}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 해당 원장차수의 회의체 리스트
     */
    @GetMapping("/ledger/{ledgerOrderId}")
    public ResponseEntity<List<CommitteeDto>> getCommitteesByLedgerOrderId(
            @PathVariable String ledgerOrderId) {
        log.info("GET /api/committees/ledger/{} - 원장차수별 회의체 조회", ledgerOrderId);
        List<CommitteeDto> committees = committeeService.getCommitteesByLedgerOrderId(ledgerOrderId);
        return ResponseEntity.ok(committees);
    }

    /**
     * 회의체 단건 조회 (위원 목록 포함)
     * - GET /api/committees/{committeeId}
     *
     * @param committeeId 회의체ID
     * @return 회의체 상세 정보 (위원 목록 포함)
     */
    @GetMapping("/{committeeId}")
    public ResponseEntity<CommitteeDto> getCommitteeById(@PathVariable Long committeesId) {
        log.info("GET /api/committees/{} - 회의체 상세 조회", committeesId);
        CommitteeDto committee = committeeService.getCommitteeById(committeesId);
        return ResponseEntity.ok(committee);
    }

    /**
     * 회의체 등록
     * - POST /api/committees
     *
     * @param request 회의체 등록 요청 데이터
     * @param principal 현재 로그인 사용자
     * @return 등록된 회의체 정보
     */
    @PostMapping
    public ResponseEntity<CommitteeDto> createCommittee(
            @Valid @RequestBody CommitteeCreateRequest request,
            Principal principal) {
        log.info("POST /api/committees - 회의체 등록: {}", request.getCommitteesTitle());

        String createdBy = principal != null ? principal.getName() : "system";
        CommitteeDto created = committeeService.createCommittee(request, createdBy);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 회의체 수정
     * - PUT /api/committees/{committeeId}
     *
     * @param committeeId 회의체ID
     * @param request 회의체 수정 요청 데이터
     * @param principal 현재 로그인 사용자
     * @return 수정된 회의체 정보
     */
    @PutMapping("/{committeeId}")
    public ResponseEntity<CommitteeDto> updateCommittee(
            @PathVariable Long committeesId,
            @Valid @RequestBody CommitteeUpdateRequest request,
            Principal principal) {
        log.info("PUT /api/committees/{} - 회의체 수정", committeesId);

        String updatedBy = principal != null ? principal.getName() : "system";
        CommitteeDto updated = committeeService.updateCommittee(committeesId, request, updatedBy);

        return ResponseEntity.ok(updated);
    }

    /**
     * 회의체 삭제
     * - DELETE /api/committees/{committeeId}
     *
     * @param committeeId 회의체ID
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/{committeeId}")
    public ResponseEntity<Map<String, String>> deleteCommittee(@PathVariable Long committeesId) {
        log.info("DELETE /api/committees/{} - 회의체 삭제", committeesId);
        committeeService.deleteCommittee(committeesId);
        return ResponseEntity.ok(Map.of("message", "회의체가 삭제되었습니다"));
    }

    /**
     * 회의체 일괄 삭제
     * - POST /api/committees/delete-batch
     *
     * @param request 삭제할 회의체ID 목록
     * @return 삭제 성공 메시지
     */
    @PostMapping("/delete-batch")
    public ResponseEntity<Map<String, String>> deleteCommittees(
            @RequestBody Map<String, List<Long>> request) {
        List<Long> committeeIds = request.get("committeeIds");
        log.info("POST /api/committees/delete-batch - 회의체 일괄 삭제: {}개", committeeIds.size());

        committeeService.deleteCommittees(committeeIds);

        return ResponseEntity.ok(Map.of(
                "message", committeeIds.size() + "개의 회의체가 삭제되었습니다"
        ));
    }

    /**
     * 회의체 통계 조회
     * - GET /api/committees/stats
     *
     * @return 회의체 통계 정보
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCommitteeStats() {
        log.info("GET /api/committees/stats - 회의체 통계 조회");

        List<CommitteeDto> allCommittees = committeeService.getAllCommittees();

        long totalCount = allCommittees.size();
        long activeCount = allCommittees.stream()
                .filter(c -> "Y".equals(c.getIsActive()))
                .count();
        long inactiveCount = totalCount - activeCount;

        Map<String, Object> stats = Map.of(
                "totalCount", totalCount,
                "activeCount", activeCount,
                "inactiveCount", inactiveCount
        );

        return ResponseEntity.ok(stats);
    }
}
