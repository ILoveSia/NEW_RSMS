package com.rsms.domain.ledger.controller;

import com.rsms.domain.ledger.dto.*;
import com.rsms.domain.ledger.service.LedgerOrderService;
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
 * 원장차수 Controller
 *
 * @description 원장차수 관리 REST API
 * @author Claude AI
 * @since 2025-10-16
 */
@Slf4j
@RestController
@RequestMapping("/api/ledger-orders")
@RequiredArgsConstructor
public class LedgerOrderController {

    private final LedgerOrderService ledgerOrderService;

    /**
     * 모든 원장차수 조회
     */
    @GetMapping
    public ResponseEntity<List<LedgerOrderDto>> getAllLedgerOrders() {
        log.info("GET /api/ledger-orders - 모든 원장차수 조회");
        List<LedgerOrderDto> ledgerOrders = ledgerOrderService.getAllLedgerOrders();
        return ResponseEntity.ok(ledgerOrders);
    }

    /**
     * 원장차수 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<LedgerOrderDto>> searchLedgerOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String ledgerOrderStatus,
            @RequestParam(required = false) String year) {
        log.info("GET /api/ledger-orders/search - keyword: {}, status: {}, year: {}",
                keyword, ledgerOrderStatus, year);

        LedgerOrderSearchRequest searchRequest = LedgerOrderSearchRequest.builder()
            .keyword(keyword)
            .ledgerOrderStatus(ledgerOrderStatus)
            .year(year)
            .build();

        List<LedgerOrderDto> ledgerOrders = ledgerOrderService.searchLedgerOrders(searchRequest);
        return ResponseEntity.ok(ledgerOrders);
    }

    /**
     * 원장차수 단건 조회
     */
    @GetMapping("/{ledgerOrderId}")
    public ResponseEntity<LedgerOrderDto> getLedgerOrder(@PathVariable String ledgerOrderId) {
        log.info("GET /api/ledger-orders/{} - 원장차수 조회", ledgerOrderId);
        LedgerOrderDto ledgerOrder = ledgerOrderService.getLedgerOrder(ledgerOrderId);
        return ResponseEntity.ok(ledgerOrder);
    }

    /**
     * 원장상태별 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LedgerOrderDto>> getLedgerOrdersByStatus(@PathVariable String status) {
        log.info("GET /api/ledger-orders/status/{} - 원장상태별 조회", status);
        List<LedgerOrderDto> ledgerOrders = ledgerOrderService.getLedgerOrdersByStatus(status);
        return ResponseEntity.ok(ledgerOrders);
    }

    /**
     * 년도별 조회
     */
    @GetMapping("/year/{year}")
    public ResponseEntity<List<LedgerOrderDto>> getLedgerOrdersByYear(@PathVariable String year) {
        log.info("GET /api/ledger-orders/year/{} - 년도별 조회", year);
        List<LedgerOrderDto> ledgerOrders = ledgerOrderService.getLedgerOrdersByYear(year);
        return ResponseEntity.ok(ledgerOrders);
    }

    /**
     * 최근 원장차수 조회
     */
    @GetMapping("/recent")
    public ResponseEntity<List<LedgerOrderDto>> getRecentLedgerOrders(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/ledger-orders/recent - limit: {}", limit);
        List<LedgerOrderDto> ledgerOrders = ledgerOrderService.getRecentLedgerOrders(limit);
        return ResponseEntity.ok(ledgerOrders);
    }

    /**
     * 콤보박스용 원장차수 조회 (PROG, CLSD만 조회)
     *
     * <p>진행중(PROG)과 종료(CLSD) 상태의 원장차수만 조회하여
     * 콤보박스 UI에 최적화된 포맷으로 반환합니다.</p>
     *
     * <p>응답 형식:
     * <ul>
     *   <li>PROG: "20250001-1차점검이행[진행중]"</li>
     *   <li>CLSD: "20250001-1차점검이행"</li>
     * </ul>
     * </p>
     *
     * @return 활성 원장차수 목록 (빈 리스트 가능)
     */
    @GetMapping("/combo")
    public ResponseEntity<List<LedgerOrderComboDto>> getActiveOrdersForComboBox() {
        log.info("GET /api/ledger-orders/combo - 콤보박스용 원장차수 조회 (PROG, CLSD만)");
        List<LedgerOrderComboDto> comboOptions = ledgerOrderService.getActiveOrdersForComboBox();
        return ResponseEntity.ok(comboOptions);
    }

    /**
     * 원장차수 생성
     */
    @PostMapping
    public ResponseEntity<LedgerOrderDto> createLedgerOrder(
            @Valid @RequestBody CreateLedgerOrderRequest request,
            Principal principal) {
        log.info("POST /api/ledger-orders - 원장차수 생성: {}", request.getLedgerOrderTitle());
        String username = principal != null ? principal.getName() : "anonymous";
        LedgerOrderDto created = ledgerOrderService.createLedgerOrder(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 원장차수 수정
     */
    @PutMapping("/{ledgerOrderId}")
    public ResponseEntity<LedgerOrderDto> updateLedgerOrder(
            @PathVariable String ledgerOrderId,
            @Valid @RequestBody UpdateLedgerOrderRequest request,
            Principal principal) {
        log.info("PUT /api/ledger-orders/{} - 원장차수 수정", ledgerOrderId);
        String username = principal != null ? principal.getName() : "anonymous";
        LedgerOrderDto updated = ledgerOrderService.updateLedgerOrder(ledgerOrderId, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 원장차수 삭제
     */
    @DeleteMapping("/{ledgerOrderId}")
    public ResponseEntity<Void> deleteLedgerOrder(
            @PathVariable String ledgerOrderId,
            Principal principal) {
        log.info("DELETE /api/ledger-orders/{} - 원장차수 삭제", ledgerOrderId);
        String username = principal != null ? principal.getName() : "anonymous";
        ledgerOrderService.deleteLedgerOrder(ledgerOrderId, username);
        return ResponseEntity.noContent().build();
    }

    /**
     * 원장차수 복수 삭제
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteLedgerOrders(
            @RequestBody List<String> ledgerOrderIds,
            Principal principal) {
        log.info("DELETE /api/ledger-orders - 원장차수 복수 삭제: {} 건", ledgerOrderIds.size());
        String username = principal != null ? principal.getName() : "anonymous";
        ledgerOrderService.deleteLedgerOrders(ledgerOrderIds, username);
        return ResponseEntity.noContent().build();
    }

    /**
     * 원장상태 변경
     */
    @PatchMapping("/{ledgerOrderId}/status")
    public ResponseEntity<LedgerOrderDto> changeStatus(
            @PathVariable String ledgerOrderId,
            @RequestBody Map<String, String> statusRequest,
            Principal principal) {
        log.info("PATCH /api/ledger-orders/{}/status - 원장상태 변경", ledgerOrderId);
        String username = principal != null ? principal.getName() : "anonymous";
        String newStatus = statusRequest.get("ledgerOrderStatus");
        LedgerOrderDto updated = ledgerOrderService.changeStatus(ledgerOrderId, newStatus, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 상태별 카운트 조회
     */
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Map<String, Long>> countByStatus(@PathVariable String status) {
        log.info("GET /api/ledger-orders/count/status/{} - 상태별 카운트 조회", status);
        long count = ledgerOrderService.countByStatus(status);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 년도별 카운트 조회
     */
    @GetMapping("/count/year/{year}")
    public ResponseEntity<Map<String, Long>> countByYear(@PathVariable String year) {
        log.info("GET /api/ledger-orders/count/year/{} - 년도별 카운트 조회", year);
        long count = ledgerOrderService.countByYear(year);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 검색 조건별 카운트 조회
     */
    @GetMapping("/count/search")
    public ResponseEntity<Map<String, Long>> countBySearchConditions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String ledgerOrderStatus,
            @RequestParam(required = false) String year) {
        log.info("GET /api/ledger-orders/count/search - 검색 조건별 카운트 조회");

        LedgerOrderSearchRequest searchRequest = LedgerOrderSearchRequest.builder()
            .keyword(keyword)
            .ledgerOrderStatus(ledgerOrderStatus)
            .year(year)
            .build();

        long count = ledgerOrderService.countBySearchConditions(searchRequest);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
