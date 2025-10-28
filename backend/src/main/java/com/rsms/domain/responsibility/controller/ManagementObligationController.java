package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.CreateManagementObligationRequest;
import com.rsms.domain.responsibility.dto.ManagementObligationDto;
import com.rsms.domain.responsibility.service.ManagementObligationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 관리의무 컨트롤러
 * - 관리의무 CRUD REST API 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/resps/management-obligations")
@RequiredArgsConstructor
public class ManagementObligationController {

    private final ManagementObligationService managementObligationService;

    /**
     * 관리의무 생성 API
     * POST /api/resps/management-obligations
     *
     * @param request 관리의무 생성 요청
     * @param principal 인증된 사용자 정보
     * @return 생성된 관리의무 DTO
     */
    @PostMapping
    public ResponseEntity<ManagementObligationDto> createObligation(
            @RequestBody CreateManagementObligationRequest request,
            Principal principal) {
        log.info("POST /api/resps/management-obligations - 관리의무 생성: responsibilityDetailId={}, orgCode={}",
            request.getResponsibilityDetailId(), request.getOrgCode());

        String username = principal != null ? principal.getName() : "system";
        ManagementObligationDto created = managementObligationService.createObligation(request, username);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무세부ID로 관리의무 목록 조회 API
     * GET /api/resps/management-obligations/detail/{responsibilityDetailId}
     *
     * @param responsibilityDetailId 책무세부ID
     * @return 관리의무 DTO 리스트
     */
    @GetMapping("/detail/{responsibilityDetailId}")
    public ResponseEntity<List<ManagementObligationDto>> getObligationsByDetailId(
            @PathVariable Long responsibilityDetailId) {
        log.info("GET /api/resps/management-obligations/detail/{} - 관리의무 목록 조회", responsibilityDetailId);

        List<ManagementObligationDto> obligations = managementObligationService.findByResponsibilityDetailId(responsibilityDetailId);

        return ResponseEntity.ok(obligations);
    }

    /**
     * 관리의무 삭제 API
     * DELETE /api/resps/management-obligations/{managementObligationId}
     *
     * @param managementObligationId 관리의무ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{managementObligationId}")
    public ResponseEntity<Void> deleteObligation(@PathVariable Long managementObligationId) {
        log.info("DELETE /api/resps/management-obligations/{} - 관리의무 삭제", managementObligationId);

        managementObligationService.deleteObligation(managementObligationId);

        return ResponseEntity.noContent().build();
    }

    /**
     * 책무세부ID로 모든 관리의무 삭제 API
     * DELETE /api/resps/management-obligations/detail/{responsibilityDetailId}
     *
     * @param responsibilityDetailId 책무세부ID
     * @return 성공 메시지
     */
    @DeleteMapping("/detail/{responsibilityDetailId}")
    public ResponseEntity<Void> deleteObligationsByDetailId(@PathVariable Long responsibilityDetailId) {
        log.info("DELETE /api/resps/management-obligations/detail/{} - 책무세부의 모든 관리의무 삭제", responsibilityDetailId);

        managementObligationService.deleteByResponsibilityDetailId(responsibilityDetailId);

        return ResponseEntity.noContent().build();
    }
}
