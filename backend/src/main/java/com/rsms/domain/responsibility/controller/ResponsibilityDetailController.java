package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.CreateResponsibilityDetailRequest;
import com.rsms.domain.responsibility.dto.ResponsibilityDetailDto;
import com.rsms.domain.responsibility.dto.UpdateResponsibilityDetailRequest;
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
        log.info("POST /api/resps/responsibility-details - 책무세부 생성: responsibilityCd={}",
            request.getResponsibilityCd());

        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDetailDto created = responsibilityDetailService.createDetail(request, username);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무세부 일괄 생성 API (엑셀 업로드용)
     * POST /api/resps/responsibility-details/bulk
     *
     * @param requests 책무세부 생성 요청 리스트
     * @param principal 인증된 사용자 정보
     * @return 생성된 책무세부 DTO 리스트
     */
    @PostMapping("/bulk")
    public ResponseEntity<List<ResponsibilityDetailDto>> createDetailsBulk(
            @RequestBody List<CreateResponsibilityDetailRequest> requests,
            Principal principal) {
        log.info("POST /api/resps/responsibility-details/bulk - 책무세부 일괄 생성: count={}", requests.size());

        String username = principal != null ? principal.getName() : "system";
        List<ResponsibilityDetailDto> created = responsibilityDetailService.createDetailsBulk(requests, username);

        log.info("책무세부 일괄 생성 완료: {}개", created.size());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무세부 단건 조회 API
     * GET /api/resps/responsibility-details/{responsibilityDetailCd}
     *
     * @param responsibilityDetailCd 책무세부코드
     * @return 책무세부 DTO
     */
    @GetMapping("/{responsibilityDetailCd}")
    public ResponseEntity<ResponsibilityDetailDto> getDetail(@PathVariable String responsibilityDetailCd) {
        log.info("GET /api/resps/responsibility-details/{} - 책무세부 단건 조회", responsibilityDetailCd);

        ResponsibilityDetailDto detail = responsibilityDetailService.getDetail(responsibilityDetailCd);

        return ResponseEntity.ok(detail);
    }

    /**
     * 전체 책무세부 목록 조회 API
     * GET /api/resps/responsibility-details
     *
     * @return 전체 책무세부 DTO 리스트
     */
    @GetMapping
    public ResponseEntity<List<ResponsibilityDetailDto>> getAllDetails() {
        log.info("GET /api/resps/responsibility-details - 전체 책무세부 목록 조회");

        List<ResponsibilityDetailDto> details = responsibilityDetailService.findAll();

        return ResponseEntity.ok(details);
    }

    /**
     * 책무코드로 책무세부 목록 조회 API
     * GET /api/resps/responsibility-details/responsibility/{responsibilityCd}
     *
     * @param responsibilityCd 책무코드
     * @return 책무세부 DTO 리스트
     */
    @GetMapping("/responsibility/{responsibilityCd}")
    public ResponseEntity<List<ResponsibilityDetailDto>> getDetailsByResponsibilityCd(
            @PathVariable String responsibilityCd) {
        log.info("GET /api/resps/responsibility-details/responsibility/{} - 책무세부 목록 조회", responsibilityCd);

        List<ResponsibilityDetailDto> details = responsibilityDetailService.findByResponsibilityCd(responsibilityCd);

        return ResponseEntity.ok(details);
    }

    /**
     * 책무세부 수정 API
     * PUT /api/resps/responsibility-details/{responsibilityDetailCd}
     *
     * @param responsibilityDetailCd 책무세부코드
     * @param request 수정 요청
     * @param principal 인증된 사용자 정보
     * @return 수정된 책무세부 DTO
     */
    @PutMapping("/{responsibilityDetailCd}")
    public ResponseEntity<ResponsibilityDetailDto> updateDetail(
            @PathVariable String responsibilityDetailCd,
            @RequestBody UpdateResponsibilityDetailRequest request,
            Principal principal) {
        log.info("PUT /api/resps/responsibility-details/{} - 책무세부 수정", responsibilityDetailCd);

        String username = principal != null ? principal.getName() : "system";
        ResponsibilityDetailDto updated = responsibilityDetailService.updateDetail(responsibilityDetailCd, request, username);

        return ResponseEntity.ok(updated);
    }

    /**
     * 책무세부 삭제 API
     * DELETE /api/resps/responsibility-details/{responsibilityDetailCd}
     *
     * @param responsibilityDetailCd 책무세부코드
     * @return 성공 메시지
     */
    @DeleteMapping("/{responsibilityDetailCd}")
    public ResponseEntity<Void> deleteDetail(@PathVariable String responsibilityDetailCd) {
        log.info("DELETE /api/resps/responsibility-details/{} - 책무세부 삭제", responsibilityDetailCd);

        responsibilityDetailService.deleteDetail(responsibilityDetailCd);

        return ResponseEntity.noContent().build();
    }

    /**
     * 책무코드로 모든 책무세부 삭제 API
     * DELETE /api/resps/responsibility-details/responsibility/{responsibilityCd}
     *
     * @param responsibilityCd 책무코드
     * @return 성공 메시지
     */
    @DeleteMapping("/responsibility/{responsibilityCd}")
    public ResponseEntity<Void> deleteDetailsByResponsibilityCd(@PathVariable String responsibilityCd) {
        log.info("DELETE /api/resps/responsibility-details/responsibility/{} - 책무의 모든 세부 삭제", responsibilityCd);

        responsibilityDetailService.deleteByResponsibilityCd(responsibilityCd);

        return ResponseEntity.noContent().build();
    }
}
