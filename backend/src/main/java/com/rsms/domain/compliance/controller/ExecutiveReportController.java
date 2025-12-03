package com.rsms.domain.compliance.controller;

import com.rsms.domain.compliance.dto.ExecutiveReportDto.ExecutiveReportResponse;
import com.rsms.domain.compliance.service.ExecutiveReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 임원이행점검보고서 Controller
 * - 집계현황, 책무별/관리의무별/관리활동별 점검현황 조회 API
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Slf4j
@RestController
@RequestMapping("/api/reports/executive")
@RequiredArgsConstructor
public class ExecutiveReportController {

    private final ExecutiveReportService executiveReportService;

    /**
     * 임원이행점검보고서 데이터 조회
     * GET /api/reports/executive?ledgerOrderId={ledgerOrderId}&implInspectionPlanId={planId}&orgCode={orgCode}
     *
     * @param ledgerOrderId        원장차수ID (필수)
     * @param implInspectionPlanId 이행점검계획ID (선택)
     * @param orgCode              부서코드 (선택)
     * @return 임원이행점검보고서 응답 DTO
     */
    @GetMapping
    public ResponseEntity<ExecutiveReportResponse> getExecutiveReport(
            @RequestParam String ledgerOrderId,
            @RequestParam(required = false) String implInspectionPlanId,
            @RequestParam(required = false) String orgCode) {

        log.info("✅ [ExecutiveReportController] 임원이행점검보고서 조회");
        log.info("  - 원장차수ID: {}", ledgerOrderId);
        log.info("  - 이행점검계획ID: {}", implInspectionPlanId);
        log.info("  - 부서코드: {}", orgCode);

        ExecutiveReportResponse response = executiveReportService.getExecutiveReport(
                ledgerOrderId,
                implInspectionPlanId,
                orgCode
        );

        return ResponseEntity.ok(response);
    }
}
