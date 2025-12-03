package com.rsms.domain.compliance.controller;

import com.rsms.domain.compliance.dto.ImplInspectionReportDto.*;
import com.rsms.domain.compliance.service.ImplInspectionReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 이행점검결과보고서 Controller
 * - 이행점검결과보고서 CRUD API 제공
 * - /api/impl-inspection-reports 경로로 매핑
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Slf4j
@RestController
@RequestMapping("/api/impl-inspection-reports")
@RequiredArgsConstructor
public class ImplInspectionReportController {

    private final ImplInspectionReportService reportService;

    // ===============================
    // 조회 (Read)
    // ===============================

    /**
     * 보고서 목록 조회
     * GET /api/impl-inspection-reports?ledgerOrderId={id}&implInspectionPlanId={planId}&orgCode={code}
     *
     * @param ledgerOrderId 원장차수ID (선택 - 없으면 전체 조회)
     * @param implInspectionPlanId 이행점검계획ID (선택)
     * @param orgCode 부서코드 (선택)
     * @return 보고서 목록
     */
    @GetMapping
    public ResponseEntity<List<Response>> getReports(
            @RequestParam(required = false) String ledgerOrderId,
            @RequestParam(required = false) String implInspectionPlanId,
            @RequestParam(required = false) String orgCode) {

        log.info("[ImplInspectionReportController] 보고서 목록 조회");
        log.info("  - 원장차수ID: {}", ledgerOrderId);
        log.info("  - 이행점검계획ID: {}", implInspectionPlanId);
        log.info("  - 부서코드: {}", orgCode);

        List<Response> reports = reportService.getReports(ledgerOrderId, implInspectionPlanId, orgCode);

        log.info("[ImplInspectionReportController] 조회 완료 - {} 건", reports.size());

        return ResponseEntity.ok(reports);
    }

    /**
     * 보고서 단건 조회
     * GET /api/impl-inspection-reports/{id}
     *
     * @param id 이행점검결과보고서ID
     * @return 보고서 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<Response> getReport(@PathVariable String id) {
        log.info("[ImplInspectionReportController] 보고서 단건 조회 - reportId: {}", id);

        Response report = reportService.getReport(id);

        return ResponseEntity.ok(report);
    }

    /**
     * 보고서구분별 목록 조회
     * GET /api/impl-inspection-reports/by-type/{reportTypeCd}
     *
     * @param reportTypeCd 보고서구분코드 (01: CEO, 02: 임원)
     * @return 보고서 목록
     */
    @GetMapping("/by-type/{reportTypeCd}")
    public ResponseEntity<List<Response>> getReportsByType(@PathVariable String reportTypeCd) {
        log.info("[ImplInspectionReportController] 보고서구분별 조회 - reportTypeCd: {}", reportTypeCd);

        List<Response> reports = reportService.getReportsByType(reportTypeCd);

        return ResponseEntity.ok(reports);
    }

    // ===============================
    // 생성 (Create)
    // ===============================

    /**
     * 보고서 생성
     * POST /api/impl-inspection-reports
     *
     * @param request 생성 요청 DTO
     * @return 생성된 보고서 정보
     */
    @PostMapping
    public ResponseEntity<Response> createReport(@RequestBody CreateRequest request) {
        log.info("[ImplInspectionReportController] 보고서 생성");
        log.info("  - 원장차수ID: {}", request.getLedgerOrderId());
        log.info("  - 이행점검계획ID: {}", request.getImplInspectionPlanId());
        log.info("  - 보고서구분: {}", request.getReportTypeCd());

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        Response created = reportService.createReport(request, currentUser);

        log.info("[ImplInspectionReportController] 보고서 생성 완료 - reportId: {}", created.getImplInspectionReportId());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ===============================
    // 수정 (Update)
    // ===============================

    /**
     * 보고서 수정
     * PUT /api/impl-inspection-reports/{id}
     *
     * @param id 이행점검결과보고서ID
     * @param request 수정 요청 DTO
     * @return 수정된 보고서 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<Response> updateReport(
            @PathVariable String id,
            @RequestBody UpdateRequest request) {

        log.info("[ImplInspectionReportController] 보고서 수정 - reportId: {}", id);

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        Response updated = reportService.updateReport(id, request, currentUser);

        log.info("[ImplInspectionReportController] 보고서 수정 완료 - reportId: {}", updated.getImplInspectionReportId());

        return ResponseEntity.ok(updated);
    }

    // ===============================
    // 삭제 (Delete)
    // ===============================

    /**
     * 보고서 삭제 (단건)
     * DELETE /api/impl-inspection-reports/{id}
     *
     * @param id 이행점검결과보고서ID
     * @return 성공 응답
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReport(@PathVariable String id) {
        log.info("[ImplInspectionReportController] 보고서 삭제 - reportId: {}", id);

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        reportService.deleteReport(id, currentUser);

        log.info("[ImplInspectionReportController] 보고서 삭제 완료 - reportId: {}", id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "보고서가 삭제되었습니다.",
                "deletedId", id
        ));
    }

    /**
     * 보고서 일괄 삭제
     * DELETE /api/impl-inspection-reports/batch
     *
     * @param reportIds 삭제할 보고서 ID 목록
     * @return 삭제 결과
     */
    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deleteReports(@RequestBody List<String> reportIds) {
        log.info("[ImplInspectionReportController] 보고서 일괄 삭제 - count: {}", reportIds.size());

        // TODO: 인증 정보에서 현재 사용자 가져오기
        String currentUser = "system";

        int deletedCount = reportService.deleteReports(reportIds, currentUser);

        log.info("[ImplInspectionReportController] 보고서 일괄 삭제 완료 - deleted: {}/{}", deletedCount, reportIds.size());

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
     * 원장차수별 보고서 수 조회
     * GET /api/impl-inspection-reports/count?ledgerOrderId={id}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 보고서 수
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getReportCount(@RequestParam String ledgerOrderId) {
        log.info("[ImplInspectionReportController] 보고서 수 조회 - ledgerOrderId: {}", ledgerOrderId);

        long count = reportService.getReportCount(ledgerOrderId);

        return ResponseEntity.ok(Map.of(
                "ledgerOrderId", ledgerOrderId,
                "count", count
        ));
    }

    /**
     * 보고서 존재 여부 확인
     * GET /api/impl-inspection-reports/exists?implInspectionPlanId={planId}&reportTypeCd={typeCd}
     *
     * @param implInspectionPlanId 이행점검계획ID
     * @param reportTypeCd 보고서구분코드
     * @return 존재 여부
     */
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> checkReportExists(
            @RequestParam String implInspectionPlanId,
            @RequestParam String reportTypeCd) {

        log.info("[ImplInspectionReportController] 보고서 존재 여부 확인 - planId: {}, typeCd: {}",
                implInspectionPlanId, reportTypeCd);

        boolean exists = reportService.existsReport(implInspectionPlanId, reportTypeCd);

        return ResponseEntity.ok(Map.of(
                "implInspectionPlanId", implInspectionPlanId,
                "reportTypeCd", reportTypeCd,
                "exists", exists
        ));
    }
}
