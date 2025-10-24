package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.*;
import com.rsms.domain.responsibility.service.ResponsibilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 책무 Controller
 * - 책무 관리 REST API 제공
 * - CRUD 기능
 *
 * @author Claude AI
 * @since 2025-09-24
 */
@Slf4j
@RestController
@RequestMapping("/api/resps/responsibilities")
@RequiredArgsConstructor
public class ResponsibilityController {

    private final ResponsibilityService responsibilityService;

    /**
     * 4개 테이블 조인 책무 목록 조회
     * - GET /api/resps/responsibilities/list-with-join
     * - positions, responsibilities, responsibility_details, management_obligations 조인
     *
     * @param ledgerOrderId 원장차수ID (선택적)
     * @param positionsName 직책명 (선택적, LIKE 검색)
     * @param responsibilityCd 책무코드 (선택적)
     * @return 4테이블 조인된 책무 목록
     */
    @GetMapping("/list-with-join")
    public ResponseEntity<List<ResponsibilityListDto>> getAllResponsibilitiesWithJoin(
            @RequestParam(required = false) String ledgerOrderId,
            @RequestParam(required = false) String positionsName,
            @RequestParam(required = false) String responsibilityCd) {
        log.info("GET /api/resps/responsibilities/list-with-join - ledgerOrderId: {}, positionsName: {}, responsibilityCd: {}",
                 ledgerOrderId, positionsName, responsibilityCd);
        List<ResponsibilityListDto> responsibilities = responsibilityService
            .getAllResponsibilitiesWithJoin(ledgerOrderId, positionsName, responsibilityCd);
        return ResponseEntity.ok(responsibilities);
    }

    /**
     * 원장차수ID와 직책ID로 책무 목록 조회
     * - GET /api/resps/responsibilities?ledgerOrderId={ledgerOrderId}&positionsId={positionsId}
     *
     * @param ledgerOrderId 원장차수ID
     * @param positionsId 직책ID
     * @return 책무 목록
     */
    @GetMapping
    public ResponseEntity<List<ResponsibilityDto>> getResponsibilities(
            @RequestParam String ledgerOrderId,
            @RequestParam Long positionsId) {
        log.info("GET /api/resps/responsibilities - ledgerOrderId: {}, positionsId: {}", ledgerOrderId, positionsId);
        List<ResponsibilityDto> responsibilities = responsibilityService
            .getResponsibilitiesByLedgerAndPosition(ledgerOrderId, positionsId);
        return ResponseEntity.ok(responsibilities);
    }

    /**
     * 책무 단건 조회
     * - GET /api/resps/responsibilities/{responsibilityId}
     *
     * @param responsibilityId 책무ID
     * @return 책무 상세 정보
     */
    @GetMapping("/{responsibilityId}")
    public ResponseEntity<ResponsibilityDto> getResponsibility(@PathVariable Long responsibilityId) {
        log.info("GET /api/resps/responsibilities/{} - 책무 단건 조회", responsibilityId);
        ResponsibilityDto responsibility = responsibilityService.getResponsibility(responsibilityId);
        return ResponseEntity.ok(responsibility);
    }

    /**
     * 책무 생성
     * - POST /api/resps/responsibilities
     *
     * @param request 책무 생성 요청
     * @param principal 현재 로그인 사용자
     * @return 생성된 책무
     */
    @PostMapping
    public ResponseEntity<ResponsibilityDto> createResponsibility(
            @RequestBody CreateResponsibilityRequest request,
            Principal principal) {
        log.info("POST /api/resps/responsibilities - 책무 생성: {}", request);
        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDto created = responsibilityService.createResponsibility(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무 수정
     * - PUT /api/resps/responsibilities/{responsibilityId}
     *
     * @param responsibilityId 책무ID
     * @param request 책무 수정 요청
     * @param principal 현재 로그인 사용자
     * @return 수정된 책무
     */
    @PutMapping("/{responsibilityId}")
    public ResponseEntity<ResponsibilityDto> updateResponsibility(
            @PathVariable Long responsibilityId,
            @RequestBody UpdateResponsibilityRequest request,
            Principal principal) {
        log.info("PUT /api/resps/responsibilities/{} - 책무 수정: {}", responsibilityId, request);
        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDto updated = responsibilityService.updateResponsibility(responsibilityId, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 책무 삭제
     * - DELETE /api/resps/responsibilities/{responsibilityId}
     *
     * @param responsibilityId 책무ID
     * @return 삭제 성공 응답
     */
    @DeleteMapping("/{responsibilityId}")
    public ResponseEntity<Void> deleteResponsibility(@PathVariable Long responsibilityId) {
        log.info("DELETE /api/resps/responsibilities/{} - 책무 삭제", responsibilityId);
        responsibilityService.deleteResponsibility(responsibilityId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 원장차수ID와 직책ID로 모든 책무 저장 (기존 삭제 후 신규 저장)
     * - POST /api/resps/responsibilities/save-all
     *
     * @param ledgerOrderId 원장차수ID
     * @param positionsId 직책ID
     * @param requests 책무 생성 요청 리스트
     * @param principal 현재 로그인 사용자
     * @return 저장된 책무 목록
     */
    @PostMapping("/save-all")
    public ResponseEntity<List<ResponsibilityDto>> saveAllResponsibilities(
            @RequestParam String ledgerOrderId,
            @RequestParam Long positionsId,
            @RequestBody List<CreateResponsibilityRequest> requests,
            Principal principal) {
        log.info("POST /api/resps/responsibilities/save-all - ledgerOrderId: {}, positionsId: {}, count: {}",
                ledgerOrderId, positionsId, requests.size());
        String username = principal != null ? principal.getName() : "system";
        List<ResponsibilityDto> saved = responsibilityService
            .saveAllResponsibilities(ledgerOrderId, positionsId, requests, username);
        return ResponseEntity.ok(saved);
    }
}
