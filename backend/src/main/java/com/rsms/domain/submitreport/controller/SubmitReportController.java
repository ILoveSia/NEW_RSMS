package com.rsms.domain.submitreport.controller;

import com.rsms.domain.submitreport.dto.SubmitReportRequest;
import com.rsms.domain.submitreport.dto.SubmitReportResponse;
import com.rsms.domain.submitreport.dto.SubmitReportSearchRequest;
import com.rsms.domain.submitreport.service.SubmitReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 제출보고서 Controller
 * - 제출보고서 CRUD API 제공
 * - /api/submit-reports 경로로 매핑
 * - 정부기관(금융감독원 등)에 제출하는 보고서 관리
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Slf4j
@RestController
@RequestMapping("/api/submit-reports")
@RequiredArgsConstructor
public class SubmitReportController {

    private final SubmitReportService submitReportService;

    // ===============================
    // 조회 (Read)
    // ===============================

    /**
     * 제출보고서 목록 조회 (검색 조건 포함)
     * GET /api/submit-reports?ledgerOrderId={id}&submittingAgencyCd={code}&reportTypeCd={code}&submissionDateFrom={date}&submissionDateTo={date}
     *
     * @param ledgerOrderId 원장차수ID (선택)
     * @param submittingAgencyCd 제출기관코드 (선택)
     * @param reportTypeCd 보고서구분코드 (선택)
     * @param submissionDateFrom 제출일시작 (선택)
     * @param submissionDateTo 제출일종료 (선택)
     * @return 제출보고서 목록
     */
    @GetMapping
    public ResponseEntity<List<SubmitReportResponse>> getReports(
            @RequestParam(required = false) String ledgerOrderId,
            @RequestParam(required = false) String submittingAgencyCd,
            @RequestParam(required = false) String reportTypeCd,
            @RequestParam(required = false) LocalDate submissionDateFrom,
            @RequestParam(required = false) LocalDate submissionDateTo) {

        log.info("[SubmitReportController] 제출보고서 목록 조회");
        log.info("  - 원장차수ID: {}", ledgerOrderId);
        log.info("  - 제출기관코드: {}", submittingAgencyCd);
        log.info("  - 보고서구분코드: {}", reportTypeCd);
        log.info("  - 제출일From: {}", submissionDateFrom);
        log.info("  - 제출일To: {}", submissionDateTo);

        // 검색 조건 DTO 생성
        SubmitReportSearchRequest searchRequest = SubmitReportSearchRequest.builder()
                .ledgerOrderId(ledgerOrderId)
                .submittingAgencyCd(submittingAgencyCd)
                .reportTypeCd(reportTypeCd)
                .submissionDateFrom(submissionDateFrom)
                .submissionDateTo(submissionDateTo)
                .build();

        List<SubmitReportResponse> reports = submitReportService.searchReports(searchRequest);

        log.info("[SubmitReportController] 조회 완료 - {} 건", reports.size());

        return ResponseEntity.ok(reports);
    }

    /**
     * 제출보고서 단건 조회
     * GET /api/submit-reports/{id}
     *
     * @param id 보고서ID
     * @return 제출보고서 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubmitReportResponse> getReport(@PathVariable Long id) {
        log.info("[SubmitReportController] 제출보고서 단건 조회 - reportId: {}", id);

        SubmitReportResponse report = submitReportService.getReport(id);

        return ResponseEntity.ok(report);
    }

    /**
     * 원장차수별 제출보고서 목록 조회
     * GET /api/submit-reports/by-ledger/{ledgerOrderId}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 제출보고서 목록
     */
    @GetMapping("/by-ledger/{ledgerOrderId}")
    public ResponseEntity<List<SubmitReportResponse>> getReportsByLedgerOrderId(
            @PathVariable String ledgerOrderId) {

        log.info("[SubmitReportController] 원장차수별 제출보고서 조회 - ledgerOrderId: {}", ledgerOrderId);

        List<SubmitReportResponse> reports = submitReportService.getReportsByLedgerOrderId(ledgerOrderId);

        return ResponseEntity.ok(reports);
    }

    // ===============================
    // 생성 (Create)
    // ===============================

    /**
     * 제출보고서 생성
     * POST /api/submit-reports
     *
     * @param request 생성 요청 DTO
     * @return 생성된 제출보고서 정보
     */
    @PostMapping
    public ResponseEntity<SubmitReportResponse> createReport(@RequestBody SubmitReportRequest request) {
        log.info("[SubmitReportController] 제출보고서 생성");
        log.info("  - 원장차수ID: {}", request.getLedgerOrderId());
        log.info("  - 제출기관: {}", request.getSubmittingAgencyCd());
        log.info("  - 보고서구분: {}", request.getReportTypeCd());

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        SubmitReportResponse created = submitReportService.createReport(request, currentUser);

        log.info("[SubmitReportController] 제출보고서 생성 완료 - reportId: {}", created.getReportId());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ===============================
    // 수정 (Update)
    // ===============================

    /**
     * 제출보고서 수정
     * PUT /api/submit-reports/{id}
     *
     * @param id 보고서ID
     * @param request 수정 요청 DTO
     * @return 수정된 제출보고서 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubmitReportResponse> updateReport(
            @PathVariable Long id,
            @RequestBody SubmitReportRequest request) {

        log.info("[SubmitReportController] 제출보고서 수정 - reportId: {}", id);

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        SubmitReportResponse updated = submitReportService.updateReport(id, request, currentUser);

        log.info("[SubmitReportController] 제출보고서 수정 완료 - reportId: {}", updated.getReportId());

        return ResponseEntity.ok(updated);
    }

    // ===============================
    // 삭제 (Delete)
    // ===============================

    /**
     * 제출보고서 삭제 (단건)
     * DELETE /api/submit-reports/{id}
     *
     * @param id 보고서ID
     * @return 성공 응답
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReport(@PathVariable Long id) {
        log.info("[SubmitReportController] 제출보고서 삭제 - reportId: {}", id);

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        submitReportService.deleteReport(id, currentUser);

        log.info("[SubmitReportController] 제출보고서 삭제 완료 - reportId: {}", id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "제출보고서가 삭제되었습니다.",
                "deletedId", id
        ));
    }

    /**
     * 제출보고서 일괄 삭제
     * DELETE /api/submit-reports/batch
     *
     * @param reportIds 삭제할 보고서 ID 목록
     * @return 삭제 결과
     */
    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deleteReports(@RequestBody List<Long> reportIds) {
        log.info("[SubmitReportController] 제출보고서 일괄 삭제 - count: {}", reportIds.size());

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        int deletedCount = submitReportService.deleteReports(reportIds, currentUser);

        log.info("[SubmitReportController] 제출보고서 일괄 삭제 완료 - deleted: {}/{}", deletedCount, reportIds.size());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", deletedCount + "건이 삭제되었습니다.",
                "deletedCount", deletedCount,
                "requestedCount", reportIds.size()
        ));
    }

    // ===============================
    // 통계/유틸리티
    // ===============================

    /**
     * 원장차수별 제출보고서 수 조회
     * GET /api/submit-reports/count?ledgerOrderId={id}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 제출보고서 수
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getReportCount(@RequestParam String ledgerOrderId) {
        log.info("[SubmitReportController] 제출보고서 수 조회 - ledgerOrderId: {}", ledgerOrderId);

        long count = submitReportService.getReportCount(ledgerOrderId);

        return ResponseEntity.ok(Map.of(
                "ledgerOrderId", ledgerOrderId,
                "count", count
        ));
    }
}
