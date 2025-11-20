package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.RespStatementRequest;
import com.rsms.domain.responsibility.dto.RespStatementResponse;
import com.rsms.domain.responsibility.service.RespStatementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 책무기술서 REST API Controller
 * - 책무기술서 CRUD API 엔드포인트 제공
 *
 * @author RSMS
 * @since 2025-11-07
 */
@Slf4j
@RestController
@RequestMapping("/api/responsibility-docs")
@RequiredArgsConstructor
public class RespStatementController {

    private final RespStatementService respStatementService;

    /**
     * 책무기술서 생성
     * POST /api/responsibility-docs
     *
     * @param request 생성 요청 DTO
     * @return 생성된 책무기술서 응답 DTO
     */
    @PostMapping
    public ResponseEntity<RespStatementResponse> createRespStatement(
            @RequestBody RespStatementRequest request) {
        log.info("[RespStatementController] 책무기술서 생성 요청");

        RespStatementResponse response = respStatementService.create(request);

        log.info("[RespStatementController] 책무기술서 생성 완료 - id: {}", response.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 책무기술서 수정
     * PUT /api/responsibility-docs/{id}
     *
     * @param id 책무기술서 ID
     * @param request 수정 요청 DTO
     * @return 수정된 책무기술서 응답 DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<RespStatementResponse> updateRespStatement(
            @PathVariable String id,
            @RequestBody RespStatementRequest request) {
        log.info("[RespStatementController] 책무기술서 수정 요청 - id: {}", id);

        RespStatementResponse response = respStatementService.update(Long.parseLong(id), request);

        log.info("[RespStatementController] 책무기술서 수정 완료 - id: {}", id);

        return ResponseEntity.ok(response);
    }

    /**
     * 책무기술서 삭제
     * DELETE /api/responsibility-docs/{id}
     *
     * @param id 책무기술서 ID
     * @return 삭제 완료 응답
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRespStatement(@PathVariable String id) {
        log.info("[RespStatementController] 책무기술서 삭제 요청 - id: {}", id);

        respStatementService.delete(Long.parseLong(id));

        log.info("[RespStatementController] 책무기술서 삭제 완료 - id: {}", id);

        return ResponseEntity.noContent().build();
    }

    /**
     * 책무기술서 목록 조회 (페이징 + 필터링)
     * GET /api/responsibility-docs
     *
     * @param ledgerOrderId 원장차수ID (선택)
     * @param positionName 직책명 (선택)
     * @param status 상태 (선택, 향후 확장용)
     * @param isActive 사용여부 (선택)
     * @param approvalStatus 결재상태 (선택, 향후 확장용)
     * @param page 페이지 번호 (기본값: 0)
     * @param size 페이지 크기 (기본값: 20)
     * @return 책무기술서 목록 (페이징)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getRespStatements(
            @RequestParam(required = false) String ledgerOrderId,
            @RequestParam(required = false) String positionName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String approvalStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("[RespStatementController] 책무기술서 목록 조회 - ledgerOrderId: {}, positionName: {}, isActive: {}, page: {}, size: {}",
                ledgerOrderId, positionName, isActive, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<RespStatementResponse> responsePage;

        // 필터 조건이 하나라도 있으면 필터링 쿼리 사용
        if (ledgerOrderId != null || positionName != null || isActive != null) {
            responsePage = respStatementService.findAllWithFilters(
                    ledgerOrderId,
                    positionName,
                    isActive,
                    pageable
            );
        } else {
            // 필터 조건이 없으면 전체 조회
            responsePage = respStatementService.findAll(pageable);
        }

        // 응답 형식 맞추기
        Map<String, Object> response = new HashMap<>();
        response.put("content", responsePage.getContent());
        response.put("totalElements", responsePage.getTotalElements());
        response.put("totalPages", responsePage.getTotalPages());
        response.put("page", responsePage.getNumber());
        response.put("size", responsePage.getSize());

        log.info("[RespStatementController] 책무기술서 목록 조회 완료 - 총 {}건", responsePage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    /**
     * 책무기술서 상세 조회
     * GET /api/responsibility-docs/{id}
     *
     * @param id 책무기술서 ID
     * @return 책무기술서 응답 DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<RespStatementResponse> getRespStatement(@PathVariable String id) {
        log.info("[RespStatementController] 책무기술서 상세 조회 - id: {}", id);

        RespStatementResponse response = respStatementService.findById(Long.parseLong(id));

        log.info("[RespStatementController] 책무기술서 상세 조회 완료 - id: {}", id);

        return ResponseEntity.ok(response);
    }
}
