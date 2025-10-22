package com.rsms.domain.position.controller;

import com.rsms.domain.position.dto.*;
import com.rsms.domain.position.service.PositionService;
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
 * 직책 Controller
 * - 직책 관리 REST API 제공
 * - CRUD 및 검색/통계 기능
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Slf4j
@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    /**
     * 모든 직책 조회
     * - GET /api/positions
     *
     * @return 전체 직책 리스트
     */
    @GetMapping
    public ResponseEntity<List<PositionDto>> getAllPositions() {
        log.info("GET /api/positions - 모든 직책 조회");
        List<PositionDto> positions = positionService.getAllPositions();
        return ResponseEntity.ok(positions);
    }

    /**
     * 직책 검색
     * - GET /api/positions/search
     * - 키워드, 본부코드, 사용여부, 원장차수로 검색
     *
     * @param keyword 검색 키워드
     * @param hqCode 본부코드
     * @param isActive 사용여부 (Y/N)
     * @param ledgerOrderId 원장차수ID
     * @return 검색 결과 리스트
     */
    @GetMapping("/search")
    public ResponseEntity<List<PositionDto>> searchPositions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String hqCode,
            @RequestParam(required = false) String isActive,
            @RequestParam(required = false) String ledgerOrderId) {
        log.info("GET /api/positions/search - keyword: {}, hqCode: {}, isActive: {}, ledgerOrderId: {}",
                keyword, hqCode, isActive, ledgerOrderId);

        PositionSearchRequest searchRequest = PositionSearchRequest.builder()
            .keyword(keyword)
            .hqCode(hqCode)
            .isActive(isActive)
            .ledgerOrderId(ledgerOrderId)
            .build();

        List<PositionDto> positions = positionService.searchPositions(searchRequest);
        return ResponseEntity.ok(positions);
    }

    /**
     * 직책 단건 조회
     * - GET /api/positions/{positionsId}
     *
     * @param positionsId 직책ID
     * @return 직책 DTO
     */
    @GetMapping("/{positionsId}")
    public ResponseEntity<PositionDto> getPosition(@PathVariable Long positionsId) {
        log.info("GET /api/positions/{} - 직책 조회", positionsId);
        PositionDto position = positionService.getPosition(positionsId);
        return ResponseEntity.ok(position);
    }

    /**
     * 사용여부별 조회
     * - GET /api/positions/active/{isActive}
     *
     * @param isActive 사용여부 (Y/N)
     * @return 직책 리스트
     */
    @GetMapping("/active/{isActive}")
    public ResponseEntity<List<PositionDto>> getPositionsByActive(@PathVariable String isActive) {
        log.info("GET /api/positions/active/{} - 사용여부별 조회", isActive);
        List<PositionDto> positions = positionService.getPositionsByActive(isActive);
        return ResponseEntity.ok(positions);
    }

    /**
     * 본부코드별 조회
     * - GET /api/positions/hq/{hqCode}
     *
     * @param hqCode 본부코드
     * @return 직책 리스트
     */
    @GetMapping("/hq/{hqCode}")
    public ResponseEntity<List<PositionDto>> getPositionsByHqCode(@PathVariable String hqCode) {
        log.info("GET /api/positions/hq/{} - 본부코드별 조회", hqCode);
        List<PositionDto> positions = positionService.getPositionsByHqCode(hqCode);
        return ResponseEntity.ok(positions);
    }

    /**
     * 최근 직책 조회
     * - GET /api/positions/recent
     * - 생성일시 기준 최신순
     *
     * @param limit 조회 개수 (기본 10개)
     * @return 최근 직책 리스트
     */
    @GetMapping("/recent")
    public ResponseEntity<List<PositionDto>> getRecentPositions(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/positions/recent - limit: {}", limit);
        List<PositionDto> positions = positionService.getRecentPositions(limit);
        return ResponseEntity.ok(positions);
    }

    /**
     * 직책 생성
     * - POST /api/positions
     *
     * @param request 생성 요청 DTO
     * @param principal 인증 정보
     * @return 생성된 직책 DTO
     */
    @PostMapping
    public ResponseEntity<PositionDto> createPosition(
            @Valid @RequestBody CreatePositionRequest request,
            Principal principal) {
        log.info("POST /api/positions - 직책 생성: {}", request.getPositionsName());
        String username = principal != null ? principal.getName() : "anonymous";
        PositionDto created = positionService.createPosition(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 직책 수정
     * - PUT /api/positions/{positionsId}
     *
     * @param positionsId 직책ID
     * @param request 수정 요청 DTO
     * @param principal 인증 정보
     * @return 수정된 직책 DTO
     */
    @PutMapping("/{positionsId}")
    public ResponseEntity<PositionDto> updatePosition(
            @PathVariable Long positionsId,
            @Valid @RequestBody UpdatePositionRequest request,
            Principal principal) {
        log.info("PUT /api/positions/{} - 직책 수정", positionsId);
        String username = principal != null ? principal.getName() : "anonymous";
        PositionDto updated = positionService.updatePosition(positionsId, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 직책 삭제
     * - DELETE /api/positions/{positionsId}
     *
     * @param positionsId 직책ID
     * @param principal 인증 정보
     * @return 204 No Content
     */
    @DeleteMapping("/{positionsId}")
    public ResponseEntity<Void> deletePosition(
            @PathVariable Long positionsId,
            Principal principal) {
        log.info("DELETE /api/positions/{} - 직책 삭제", positionsId);
        String username = principal != null ? principal.getName() : "anonymous";
        positionService.deletePosition(positionsId, username);
        return ResponseEntity.noContent().build();
    }

    /**
     * 직책 복수 삭제
     * - DELETE /api/positions
     *
     * @param positionsIds 직책ID 리스트
     * @param principal 인증 정보
     * @return 204 No Content
     */
    @DeleteMapping
    public ResponseEntity<Void> deletePositions(
            @RequestBody List<Long> positionsIds,
            Principal principal) {
        log.info("DELETE /api/positions - 직책 복수 삭제: {} 건", positionsIds.size());
        String username = principal != null ? principal.getName() : "anonymous";
        positionService.deletePositions(positionsIds, username);
        return ResponseEntity.noContent().build();
    }

    /**
     * 직책 활성화/비활성화 토글
     * - PATCH /api/positions/{positionsId}/toggle-active
     * - 사용여부를 Y ↔ N으로 변경
     *
     * @param positionsId 직책ID
     * @param principal 인증 정보
     * @return 수정된 직책 DTO
     */
    @PatchMapping("/{positionsId}/toggle-active")
    public ResponseEntity<PositionDto> toggleActive(
            @PathVariable Long positionsId,
            Principal principal) {
        log.info("PATCH /api/positions/{}/toggle-active - 직책 활성화/비활성화", positionsId);
        String username = principal != null ? principal.getName() : "anonymous";
        PositionDto updated = positionService.toggleActive(positionsId, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 사용여부별 카운트 조회
     * - GET /api/positions/count/active/{isActive}
     *
     * @param isActive 사용여부 (Y/N)
     * @return 카운트
     */
    @GetMapping("/count/active/{isActive}")
    public ResponseEntity<Map<String, Long>> countByActive(@PathVariable String isActive) {
        log.info("GET /api/positions/count/active/{} - 사용여부별 카운트 조회", isActive);
        long count = positionService.countByActive(isActive);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 본부코드별 카운트 조회
     * - GET /api/positions/count/hq/{hqCode}
     *
     * @param hqCode 본부코드
     * @return 카운트
     */
    @GetMapping("/count/hq/{hqCode}")
    public ResponseEntity<Map<String, Long>> countByHqCode(@PathVariable String hqCode) {
        log.info("GET /api/positions/count/hq/{} - 본부코드별 카운트 조회", hqCode);
        long count = positionService.countByHqCode(hqCode);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 검색 조건별 카운트 조회
     * - GET /api/positions/count/search
     *
     * @param keyword 검색 키워드
     * @param hqCode 본부코드
     * @param isActive 사용여부 (Y/N)
     * @return 카운트
     */
    @GetMapping("/count/search")
    public ResponseEntity<Map<String, Long>> countBySearchConditions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String hqCode,
            @RequestParam(required = false) String isActive) {
        log.info("GET /api/positions/count/search - 검색 조건별 카운트 조회");

        PositionSearchRequest searchRequest = PositionSearchRequest.builder()
            .keyword(keyword)
            .hqCode(hqCode)
            .isActive(isActive)
            .build();

        long count = positionService.countBySearchConditions(searchRequest);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * 직책별 부점 목록 조회
     * - GET /api/positions/{positionsId}/departments
     * - positions_details + organizations 조인하여 부점 목록 반환
     *
     * @param positionsId 직책ID
     * @return 부점 목록 (org_code, org_name)
     */
    @GetMapping("/{positionsId}/departments")
    public ResponseEntity<List<Map<String, Object>>> getPositionDepartments(@PathVariable Long positionsId) {
        log.info("GET /api/positions/{}/departments - 직책별 부점 목록 조회", positionsId);
        List<Map<String, Object>> departments = positionService.getPositionDepartments(positionsId);
        return ResponseEntity.ok(departments);
    }
}
