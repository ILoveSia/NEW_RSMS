package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.CreateResponsibilityDetailRequest;
import com.rsms.domain.responsibility.dto.ResponsibilityDetailDto;
import com.rsms.domain.responsibility.service.ResponsibilityDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 책무세부 컨트롤러
 * - 책무세부 CRUD REST API 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/resps/responsibility-details")
@RequiredArgsConstructor
public class ResponsibilityDetailController {

    private final ResponsibilityDetailService responsibilityDetailService;

    /**
     * 책무세부 생성 API
     * POST /api/resps/responsibility-details
     *
     * @param request 책무세부 생성 요청
     * @param principal 인증된 사용자 정보
     * @return 생성된 책무세부 DTO
     */
    @PostMapping
    public ResponseEntity<ResponsibilityDetailDto> createDetail(
            @RequestBody CreateResponsibilityDetailRequest request,
            Principal principal) {
        log.info("POST /api/resps/responsibility-details - 책무세부 생성: responsibilityId={}",
            request.getResponsibilityId());

        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDetailDto created = responsibilityDetailService.createDetail(request, username);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무ID로 책무세부 목록 조회 API
     * GET /api/resps/responsibility-details/responsibility/{responsibilityId}
     *
     * @param responsibilityId 책무ID
     * @return 책무세부 DTO 리스트
     */
    @GetMapping("/responsibility/{responsibilityId}")
    public ResponseEntity<List<ResponsibilityDetailDto>> getDetailsByResponsibilityId(
            @PathVariable Long responsibilityId) {
        log.info("GET /api/resps/responsibility-details/responsibility/{} - 책무세부 목록 조회", responsibilityId);

        List<ResponsibilityDetailDto> details = responsibilityDetailService.findByResponsibilityId(responsibilityId);

        return ResponseEntity.ok(details);
    }

    /**
     * 책무세부 삭제 API
     * DELETE /api/resps/responsibility-details/{responsibilityDetailId}
     *
     * @param responsibilityDetailId 책무세부ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{responsibilityDetailId}")
    public ResponseEntity<Void> deleteDetail(@PathVariable Long responsibilityDetailId) {
        log.info("DELETE /api/resps/responsibility-details/{} - 책무세부 삭제", responsibilityDetailId);

        responsibilityDetailService.deleteDetail(responsibilityDetailId);

        return ResponseEntity.noContent().build();
    }

    /**
     * 책무ID로 모든 책무세부 삭제 API
     * DELETE /api/resps/responsibility-details/responsibility/{responsibilityId}
     *
     * @param responsibilityId 책무ID
     * @return 성공 메시지
     */
    @DeleteMapping("/responsibility/{responsibilityId}")
    public ResponseEntity<Void> deleteDetailsByResponsibilityId(@PathVariable Long responsibilityId) {
        log.info("DELETE /api/resps/responsibility-details/responsibility/{} - 책무의 모든 세부 삭제", responsibilityId);

        responsibilityDetailService.deleteByResponsibilityId(responsibilityId);

        return ResponseEntity.noContent().build();
    }
}
