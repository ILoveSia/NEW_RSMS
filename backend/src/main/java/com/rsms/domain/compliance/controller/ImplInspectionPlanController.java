package com.rsms.domain.compliance.controller;

import com.rsms.domain.compliance.dto.AssignInspectorBatchRequest;
import com.rsms.domain.compliance.dto.CreateImplInspectionPlanRequest;
import com.rsms.domain.compliance.dto.ImplInspectionItemDto;
import com.rsms.domain.compliance.dto.ImplInspectionPlanDto;
import com.rsms.domain.compliance.service.ImplInspectionPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 이행점검계획 Controller
 * - 이행점검계획 CRUD API 엔드포인트
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Slf4j
@RestController
@RequestMapping("/api/compliance/impl-inspection-plans")
@RequiredArgsConstructor
public class ImplInspectionPlanController {

    private final ImplInspectionPlanService planService;

    /**
     * 이행점검계획 전체 목록 조회
     * GET /api/compliance/impl-inspection-plans
     */
    @GetMapping
    public ResponseEntity<List<ImplInspectionPlanDto>> findAll() {
        log.info("✅ [ImplInspectionPlanController] 전체 이행점검계획 목록 조회");
        List<ImplInspectionPlanDto> plans = planService.findAll();
        return ResponseEntity.ok(plans);
    }

    /**
     * 원장차수ID로 이행점검계획 목록 조회
     * GET /api/compliance/impl-inspection-plans/ledger-order/{ledgerOrderId}
     */
    @GetMapping("/ledger-order/{ledgerOrderId}")
    public ResponseEntity<List<ImplInspectionPlanDto>> findByLedgerOrderId(
            @PathVariable String ledgerOrderId) {
        log.info("✅ [ImplInspectionPlanController] 원장차수ID별 이행점검계획 조회: {}", ledgerOrderId);
        List<ImplInspectionPlanDto> plans = planService.findByLedgerOrderId(ledgerOrderId);
        return ResponseEntity.ok(plans);
    }

    /**
     * 이행점검계획 단건 조회
     * GET /api/compliance/impl-inspection-plans/{implInspectionPlanId}
     */
    @GetMapping("/{implInspectionPlanId}")
    public ResponseEntity<ImplInspectionPlanDto> findById(
            @PathVariable String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanController] 이행점검계획 단건 조회: {}", implInspectionPlanId);
        ImplInspectionPlanDto plan = planService.findById(implInspectionPlanId);
        return ResponseEntity.ok(plan);
    }

    /**
     * 이행점검계획 생성 (점검항목 일괄 생성 포함)
     * POST /api/compliance/impl-inspection-plans
     */
    @PostMapping
    public ResponseEntity<ImplInspectionPlanDto> create(
            @RequestBody CreateImplInspectionPlanRequest request) {
        log.info("✅ [ImplInspectionPlanController] 이행점검계획 생성");
        log.info("  - 원장차수ID: {}", request.getLedgerOrderId());
        log.info("  - 점검명: {}", request.getImplInspectionName());
        log.info("  - 선택된 manualCd 수: {}", request.getManualCds().size());

        // TODO: Spring Security에서 현재 사용자 ID 가져오기
        String userId = "system";

        ImplInspectionPlanDto created = planService.create(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 이행점검계획 수정
     * PUT /api/compliance/impl-inspection-plans/{implInspectionPlanId}
     */
    @PutMapping("/{implInspectionPlanId}")
    public ResponseEntity<ImplInspectionPlanDto> update(
            @PathVariable String implInspectionPlanId,
            @RequestBody CreateImplInspectionPlanRequest request) {
        log.info("✅ [ImplInspectionPlanController] 이행점검계획 수정: {}", implInspectionPlanId);

        // TODO: Spring Security에서 현재 사용자 ID 가져오기
        String userId = "system";

        ImplInspectionPlanDto updated = planService.update(implInspectionPlanId, request, userId);
        return ResponseEntity.ok(updated);
    }

    /**
     * 이행점검계획 삭제 (비활성화)
     * DELETE /api/compliance/impl-inspection-plans/{implInspectionPlanId}
     */
    @DeleteMapping("/{implInspectionPlanId}")
    public ResponseEntity<Void> delete(@PathVariable String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanController] 이행점검계획 삭제: {}", implInspectionPlanId);

        // TODO: Spring Security에서 현재 사용자 ID 가져오기
        String userId = "system";

        planService.delete(implInspectionPlanId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 이행점검계획 일괄 삭제
     * DELETE /api/compliance/impl-inspection-plans/batch
     */
    @DeleteMapping("/batch")
    public ResponseEntity<Void> deleteAll(@RequestBody Map<String, List<String>> request) {
        List<String> ids = request.get("ids");
        log.info("✅ [ImplInspectionPlanController] 이행점검계획 일괄 삭제: {}건", ids.size());

        // TODO: Spring Security에서 현재 사용자 ID 가져오기
        String userId = "system";

        planService.deleteAll(ids, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 이행점검계획의 점검항목 목록 조회
     * GET /api/compliance/impl-inspection-plans/{implInspectionPlanId}/items
     */
    @GetMapping("/{implInspectionPlanId}/items")
    public ResponseEntity<List<ImplInspectionItemDto>> findItemsByPlanId(
            @PathVariable String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanController] 이행점검항목 조회: {}", implInspectionPlanId);
        List<ImplInspectionItemDto> items = planService.findItemsByPlanId(implInspectionPlanId);
        return ResponseEntity.ok(items);
    }

    /**
     * 전체 이행점검항목 목록 조회 (점검자지정 페이지용)
     * GET /api/compliance/impl-inspection-plans/items/all
     * - impl_inspection_items 테이블 기준
     * - dept_manager_manuals, impl_inspection_plans JOIN
     */
    @GetMapping("/items/all")
    public ResponseEntity<List<ImplInspectionItemDto>> findAllItems() {
        log.info("✅ [ImplInspectionPlanController] 전체 이행점검항목 조회 (점검자지정용)");
        List<ImplInspectionItemDto> items = planService.findAllItems();
        return ResponseEntity.ok(items);
    }

    /**
     * 원장차수ID별 이행점검항목 목록 조회 (점검자지정 페이지용)
     * GET /api/compliance/impl-inspection-plans/items/ledger-order/{ledgerOrderId}
     * - impl_inspection_items 테이블 기준
     * - dept_manager_manuals, impl_inspection_plans JOIN
     */
    @GetMapping("/items/ledger-order/{ledgerOrderId}")
    public ResponseEntity<List<ImplInspectionItemDto>> findItemsByLedgerOrderId(
            @PathVariable String ledgerOrderId) {
        log.info("✅ [ImplInspectionPlanController] 원장차수ID별 이행점검항목 조회 (점검자지정용): {}", ledgerOrderId);
        List<ImplInspectionItemDto> items = planService.findItemsByLedgerOrderId(ledgerOrderId);
        return ResponseEntity.ok(items);
    }

    /**
     * 점검자 일괄 지정
     * POST /api/compliance/impl-inspection-plans/items/assign-inspector
     * - impl_inspection_items 테이블의 inspector_id 일괄 업데이트
     */
    @PostMapping("/items/assign-inspector")
    public ResponseEntity<Map<String, Object>> assignInspectorBatch(
            @RequestBody AssignInspectorBatchRequest request) {
        log.info("✅ [ImplInspectionPlanController] 점검자 일괄 지정");
        log.info("  - 대상 항목 수: {}", request.getItemIds().size());
        log.info("  - 점검자ID: {}", request.getInspectorId());

        // TODO: Spring Security에서 현재 사용자 ID 가져오기
        String userId = "system";

        int updatedCount = planService.assignInspectorBatch(
                request.getItemIds(),
                request.getInspectorId(),
                userId
        );

        Map<String, Object> response = Map.of(
                "success", true,
                "updatedCount", updatedCount,
                "message", updatedCount + "건의 점검자가 지정되었습니다."
        );

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 이행점검수행 페이지용 API (책무/책무상세/관리의무 정보 포함)
    // ============================================================

    /**
     * 전체 이행점검항목 목록 조회 (이행점검수행 페이지용)
     * GET /api/compliance/impl-inspection-plans/items/execution/all
     * - 책무/책무상세/관리의무 정보 포함
     */
    @GetMapping("/items/execution/all")
    public ResponseEntity<List<ImplInspectionItemDto>> findAllItemsForExecution() {
        log.info("✅ [ImplInspectionPlanController] 전체 이행점검항목 조회 (이행점검수행용)");
        List<ImplInspectionItemDto> items = planService.findAllItemsWithFullHierarchy();
        return ResponseEntity.ok(items);
    }

    /**
     * 원장차수ID별 이행점검항목 목록 조회 (이행점검수행 페이지용)
     * GET /api/compliance/impl-inspection-plans/items/execution/ledger-order/{ledgerOrderId}
     * - 책무/책무상세/관리의무 정보 포함
     */
    @GetMapping("/items/execution/ledger-order/{ledgerOrderId}")
    public ResponseEntity<List<ImplInspectionItemDto>> findItemsByLedgerOrderIdForExecution(
            @PathVariable String ledgerOrderId) {
        log.info("✅ [ImplInspectionPlanController] 원장차수ID별 이행점검항목 조회 (이행점검수행용): {}", ledgerOrderId);
        List<ImplInspectionItemDto> items = planService.findItemsByLedgerOrderIdWithFullHierarchy(ledgerOrderId);
        return ResponseEntity.ok(items);
    }

    /**
     * 이행점검계획ID별 이행점검항목 목록 조회 (이행점검수행 페이지용)
     * GET /api/compliance/impl-inspection-plans/items/execution/plan/{implInspectionPlanId}
     * - 책무/책무상세/관리의무 정보 포함
     */
    @GetMapping("/items/execution/plan/{implInspectionPlanId}")
    public ResponseEntity<List<ImplInspectionItemDto>> findItemsByPlanIdForExecution(
            @PathVariable String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanController] 이행점검계획ID별 이행점검항목 조회 (이행점검수행용): {}", implInspectionPlanId);
        List<ImplInspectionItemDto> items = planService.findItemsByPlanIdWithFullHierarchy(implInspectionPlanId);
        return ResponseEntity.ok(items);
    }

    /**
     * 점검결과 업데이트 요청 DTO
     */
    public record UpdateInspectionResultRequest(
            String inspectionStatusCd,       // 점검결과상태코드 (01:미점검, 02:적정, 03:부적정)
            String inspectionResultContent   // 점검결과내용
    ) {}

    /**
     * 점검결과 업데이트
     * PUT /api/compliance/impl-inspection-plans/items/{itemId}/inspection-result
     * - 점검결과상태코드, 점검결과내용, 점검일자 업데이트
     */
    @PutMapping("/items/{itemId}/inspection-result")
    public ResponseEntity<ImplInspectionItemDto> updateInspectionResult(
            @PathVariable String itemId,
            @RequestBody UpdateInspectionResultRequest request) {
        log.info("✅ [ImplInspectionPlanController] 점검결과 업데이트: {}", itemId);
        log.info("  - 점검결과상태코드: {}", request.inspectionStatusCd());

        // TODO: Spring Security에서 현재 사용자 ID 가져오기
        String userId = "system";

        ImplInspectionItemDto updated = planService.updateInspectionResult(
                itemId,
                request.inspectionStatusCd(),
                request.inspectionResultContent(),
                userId
        );

        return ResponseEntity.ok(updated);
    }
}
