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
     * 2개 테이블 조인 책무 목록 조회
     * - GET /api/resps/responsibilities/list-with-join
     * - responsibilities(마스터), positions 조인
     *
     * @param ledgerOrderId 원장차수ID (선택적)
     * @param responsibilityInfo 책무정보 (선택적, LIKE 검색)
     * @param responsibilityCd 책무코드 (선택적)
     * @return 2테이블 조인된 책무 목록
     */
    @GetMapping("/list-with-join")
    public ResponseEntity<List<ResponsibilityListDto>> getAllResponsibilitiesWithJoin(
            @RequestParam(required = false) String ledgerOrderId,
            @RequestParam(required = false) String responsibilityInfo,
            @RequestParam(required = false) String responsibilityCd) {
        log.info("GET /api/resps/responsibilities/list-with-join - ledgerOrderId: {}, responsibilityInfo: {}, responsibilityCd: {}",
                 ledgerOrderId, responsibilityInfo, responsibilityCd);
        List<ResponsibilityListDto> responsibilities = responsibilityService
            .getAllResponsibilitiesWithJoin(ledgerOrderId, responsibilityInfo, responsibilityCd);
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
     * - GET /api/resps/responsibilities/{responsibilityCd}
     *
     * @param responsibilityCd 책무코드 (예: "20250001RM0001")
     * @return 책무 상세 정보
     */
    @GetMapping("/{responsibilityCd}")
    public ResponseEntity<ResponsibilityDto> getResponsibility(@PathVariable String responsibilityCd) {
        log.info("GET /api/resps/responsibilities/{} - 책무 단건 조회", responsibilityCd);
        ResponsibilityDto responsibility = responsibilityService.getResponsibility(responsibilityCd);
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
     * - PUT /api/resps/responsibilities/{responsibilityCd}
     *
     * @param responsibilityCd 책무코드 (예: "20250001RM0001")
     * @param request 책무 수정 요청
     * @param principal 현재 로그인 사용자
     * @return 수정된 책무
     */
    @PutMapping("/{responsibilityCd}")
    public ResponseEntity<ResponsibilityDto> updateResponsibility(
            @PathVariable String responsibilityCd,
            @RequestBody UpdateResponsibilityRequest request,
            Principal principal) {
        log.info("PUT /api/resps/responsibilities/{} - 책무 수정: {}", responsibilityCd, request);
        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDto updated = responsibilityService.updateResponsibility(responsibilityCd, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 책무 삭제
     * - DELETE /api/resps/responsibilities/{responsibilityCd}
     *
     * @param responsibilityCd 책무코드 (예: "20250001RM0001")
     * @return 삭제 성공 응답
     */
    @DeleteMapping("/{responsibilityCd}")
    public ResponseEntity<Void> deleteResponsibility(@PathVariable String responsibilityCd) {
        log.info("DELETE /api/resps/responsibilities/{} - 책무 삭제", responsibilityCd);
        responsibilityService.deleteResponsibility(responsibilityCd);
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

    /**
     * 책무, 책무세부, 관리의무를 한 번에 생성
     * - POST /api/resps/responsibilities/with-details
     * - responsibilities, responsibility_details, management_obligations 3개 테이블 저장
     *
     * @param request 책무 전체 생성 요청 (책무, 책무세부, 관리의무 포함)
     * @param principal 현재 로그인 사용자
     * @return 생성된 책무 정보
     */
    @PostMapping("/with-details")
    public ResponseEntity<ResponsibilityDto> createResponsibilityWithDetails(
            @RequestBody CreateResponsibilityWithDetailsRequest request,
            Principal principal) {
        log.info("POST /api/resps/responsibilities/with-details - 책무 전체 생성: {}", request);
        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDto created = responsibilityService.createResponsibilityWithDetails(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
