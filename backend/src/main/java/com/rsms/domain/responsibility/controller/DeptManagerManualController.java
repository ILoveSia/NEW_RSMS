package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.CreateDeptManagerManualRequest;
import com.rsms.domain.responsibility.dto.DeptManagerManualDto;
import com.rsms.domain.responsibility.dto.UpdateDeptManagerManualRequest;
import com.rsms.domain.responsibility.service.DeptManagerManualService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 부서장업무메뉴얼 컨트롤러
 * - 부서장업무메뉴얼 CRUD REST API 제공
 * - 원장차수별, 조직별 관리활동 정보 관리
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Slf4j
@RestController
@RequestMapping("/api/resps/dept-manager-manuals")
@RequiredArgsConstructor
public class DeptManagerManualController {

    private final DeptManagerManualService deptManagerManualService;

    /**
     * 메뉴얼 생성 API
     * POST /api/resps/dept-manager-manuals
     *
     * @param request 메뉴얼 생성 요청
     * @param principal 인증된 사용자 정보
     * @return 생성된 메뉴얼 DTO
     */
    @PostMapping
    public ResponseEntity<DeptManagerManualDto> createManual(
            @RequestBody CreateDeptManagerManualRequest request,
            Principal principal) {
        log.info("POST /api/resps/dept-manager-manuals - 메뉴얼 생성: ledgerOrderId={}, obligationCd={}, orgCode={}",
            request.getLedgerOrderId(), request.getObligationCd(), request.getOrgCode());

        String username = principal != null ? principal.getName() : "system";
        DeptManagerManualDto created = deptManagerManualService.createManual(request, username);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 전체 메뉴얼 목록 조회 API
     * GET /api/resps/dept-manager-manuals
     *
     * @return 전체 메뉴얼 DTO 리스트
     */
    @GetMapping
    public ResponseEntity<List<DeptManagerManualDto>> getAllManuals() {
        log.info("GET /api/resps/dept-manager-manuals - 전체 메뉴얼 목록 조회");

        List<DeptManagerManualDto> manuals = deptManagerManualService.findAll();

        return ResponseEntity.ok(manuals);
    }

    /**
     * 원장차수ID로 메뉴얼 목록 조회 API
     * GET /api/resps/dept-manager-manuals/ledger-order/{ledgerOrderId}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 메뉴얼 DTO 리스트
     */
    @GetMapping("/ledger-order/{ledgerOrderId}")
    public ResponseEntity<List<DeptManagerManualDto>> getManualsByLedgerOrderId(
            @PathVariable String ledgerOrderId) {
        log.info("GET /api/resps/dept-manager-manuals/ledger-order/{} - 메뉴얼 목록 조회", ledgerOrderId);

        List<DeptManagerManualDto> manuals = deptManagerManualService.findByLedgerOrderId(ledgerOrderId);

        return ResponseEntity.ok(manuals);
    }

    /**
     * 조직코드로 메뉴얼 목록 조회 API
     * GET /api/resps/dept-manager-manuals/organization/{orgCode}
     *
     * @param orgCode 조직코드
     * @return 메뉴얼 DTO 리스트
     */
    @GetMapping("/organization/{orgCode}")
    public ResponseEntity<List<DeptManagerManualDto>> getManualsByOrgCode(
            @PathVariable String orgCode) {
        log.info("GET /api/resps/dept-manager-manuals/organization/{} - 메뉴얼 목록 조회", orgCode);

        List<DeptManagerManualDto> manuals = deptManagerManualService.findByOrgCode(orgCode);

        return ResponseEntity.ok(manuals);
    }

    /**
     * 원장차수ID와 조직코드로 메뉴얼 목록 조회 API (가장 자주 사용됨)
     * GET /api/resps/dept-manager-manuals/ledger-order/{ledgerOrderId}/organization/{orgCode}
     * - 관계 테이블 정보 포함 (responsibilities, responsibility_details, management_obligations, organizations)
     *
     * @param ledgerOrderId 원장차수ID
     * @param orgCode 조직코드
     * @return 메뉴얼 DTO 리스트 (관계 테이블 정보 포함)
     */
    @GetMapping("/ledger-order/{ledgerOrderId}/organization/{orgCode}")
    public ResponseEntity<List<DeptManagerManualDto>> getManualsByLedgerOrderIdAndOrgCode(
            @PathVariable String ledgerOrderId,
            @PathVariable String orgCode) {
        log.info("GET /api/resps/dept-manager-manuals/ledger-order/{}/organization/{} - 메뉴얼 목록 조회",
            ledgerOrderId, orgCode);

        List<DeptManagerManualDto> manuals = deptManagerManualService.findByLedgerOrderIdAndOrgCode(ledgerOrderId, orgCode);

        return ResponseEntity.ok(manuals);
    }

    /**
     * 메뉴얼 단일 조회 API
     * GET /api/resps/dept-manager-manuals/{manualCd}
     *
     * @param manualCd 메뉴얼코드
     * @return 메뉴얼 DTO
     */
    @GetMapping("/{manualCd}")
    public ResponseEntity<DeptManagerManualDto> getManual(@PathVariable String manualCd) {
        log.info("GET /api/resps/dept-manager-manuals/{} - 메뉴얼 단일 조회", manualCd);

        DeptManagerManualDto manual = deptManagerManualService.getManual(manualCd);

        return ResponseEntity.ok(manual);
    }

    /**
     * 메뉴얼 수정 API
     * PUT /api/resps/dept-manager-manuals/{manualCd}
     *
     * @param manualCd 메뉴얼코드
     * @param request 메뉴얼 수정 요청
     * @param principal 인증된 사용자 정보
     * @return 수정된 메뉴얼 DTO
     */
    @PutMapping("/{manualCd}")
    public ResponseEntity<DeptManagerManualDto> updateManual(
            @PathVariable String manualCd,
            @RequestBody UpdateDeptManagerManualRequest request,
            Principal principal) {
        log.info("PUT /api/resps/dept-manager-manuals/{} - 메뉴얼 수정", manualCd);

        String username = principal != null ? principal.getName() : "system";
        DeptManagerManualDto updated = deptManagerManualService.updateManual(manualCd, request, username);

        return ResponseEntity.ok(updated);
    }

    /**
     * 메뉴얼 삭제 API
     * DELETE /api/resps/dept-manager-manuals/{manualCd}
     *
     * @param manualCd 메뉴얼코드
     * @return 성공 메시지
     */
    @DeleteMapping("/{manualCd}")
    public ResponseEntity<Void> deleteManual(@PathVariable String manualCd) {
        log.info("DELETE /api/resps/dept-manager-manuals/{} - 메뉴얼 삭제", manualCd);

        deptManagerManualService.deleteManual(manualCd);

        return ResponseEntity.noContent().build();
    }

    /**
     * 메뉴얼 일괄 삭제 API
     * POST /api/resps/dept-manager-manuals/delete-batch
     *
     * @param manualCds 메뉴얼코드 리스트
     * @return 성공 메시지
     */
    @PostMapping("/delete-batch")
    public ResponseEntity<Void> deleteManuals(@RequestBody List<String> manualCds) {
        log.info("POST /api/resps/dept-manager-manuals/delete-batch - 메뉴얼 일괄 삭제: count={}", manualCds.size());

        deptManagerManualService.deleteManuals(manualCds);

        return ResponseEntity.noContent().build();
    }
}
