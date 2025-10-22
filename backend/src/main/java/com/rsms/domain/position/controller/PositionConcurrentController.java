package com.rsms.domain.position.controller;

import com.rsms.domain.position.dto.CreatePositionConcurrentRequest;
import com.rsms.domain.position.dto.PositionConcurrentDto;
import com.rsms.domain.position.service.PositionConcurrentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 직책겸직 Controller
 * - 겸직 등록/조회/삭제 API 제공
 */
@RestController
@RequestMapping("/api/resps/position-concurrents")
@RequiredArgsConstructor
@Slf4j
public class PositionConcurrentController {

    private final PositionConcurrentService positionConcurrentService;

    /**
     * 겸직 등록
     * POST /api/resps/position-concurrents
     *
     * @param request 겸직 등록 요청 (원장차수ID, 겸직 직책 목록)
     * @return 등록된 겸직 목록
     */
    @PostMapping
    public ResponseEntity<List<PositionConcurrentDto>> createPositionConcurrents(
        @RequestBody CreatePositionConcurrentRequest request
    ) {
        log.info("겸직 등록 요청: ledgerOrderId={}, positions={}",
            request.getLedgerOrderId(), request.getPositions().size());

        List<PositionConcurrentDto> result = positionConcurrentService.createPositionConcurrents(request);

        log.info("겸직 등록 완료: {} 건", result.size());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * 원장차수ID로 겸직 목록 조회
     * GET /api/resps/position-concurrents?ledgerOrderId={ledgerOrderId}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 겸직 목록
     */
    @GetMapping
    public ResponseEntity<List<PositionConcurrentDto>> getPositionConcurrents(
        @RequestParam String ledgerOrderId
    ) {
        log.info("겸직 목록 조회 요청: ledgerOrderId={}", ledgerOrderId);

        List<PositionConcurrentDto> result = positionConcurrentService.getPositionConcurrentsByLedgerOrderId(ledgerOrderId);

        log.info("겸직 목록 조회 완료: {} 건", result.size());
        return ResponseEntity.ok(result);
    }

    /**
     * 겸직그룹코드로 겸직 목록 조회
     * GET /api/resps/position-concurrents/group/{concurrentGroupCd}
     *
     * @param concurrentGroupCd 겸직그룹코드 (G0001, G0002, ...)
     * @return 겸직 그룹에 속한 직책 목록
     */
    @GetMapping("/group/{concurrentGroupCd}")
    public ResponseEntity<List<PositionConcurrentDto>> getPositionConcurrentsByGroup(
        @PathVariable String concurrentGroupCd
    ) {
        log.info("겸직 그룹 조회 요청: concurrentGroupCd={}", concurrentGroupCd);

        List<PositionConcurrentDto> result = positionConcurrentService.getPositionConcurrentsByConcurrentGroupCd(concurrentGroupCd);

        log.info("겸직 그룹 조회 완료: {} 건", result.size());
        return ResponseEntity.ok(result);
    }

    /**
     * 사용중인 겸직 목록 조회 (is_active = 'Y')
     * GET /api/resps/position-concurrents/active?ledgerOrderId={ledgerOrderId}
     *
     * @param ledgerOrderId 원장차수ID
     * @return 사용중인 겸직 목록
     */
    @GetMapping("/active")
    public ResponseEntity<List<PositionConcurrentDto>> getActivePositionConcurrents(
        @RequestParam String ledgerOrderId
    ) {
        log.info("사용중인 겸직 목록 조회 요청: ledgerOrderId={}", ledgerOrderId);

        List<PositionConcurrentDto> result = positionConcurrentService.getActivePositionConcurrents(ledgerOrderId);

        log.info("사용중인 겸직 목록 조회 완료: {} 건", result.size());
        return ResponseEntity.ok(result);
    }

    /**
     * 겸직그룹 삭제
     * DELETE /api/resps/position-concurrents/group/{concurrentGroupCd}
     *
     * @param concurrentGroupCd 겸직그룹코드 (G0001, G0002, ...)
     * @return 삭제 완료 메시지
     */
    @DeleteMapping("/group/{concurrentGroupCd}")
    public ResponseEntity<Void> deletePositionConcurrentGroup(
        @PathVariable String concurrentGroupCd
    ) {
        log.info("겸직 그룹 삭제 요청: concurrentGroupCd={}", concurrentGroupCd);

        positionConcurrentService.deletePositionConcurrentGroup(concurrentGroupCd);

        log.info("겸직 그룹 삭제 완료: concurrentGroupCd={}", concurrentGroupCd);
        return ResponseEntity.noContent().build();
    }

    /**
     * 겸직그룹 비활성화
     * PUT /api/resps/position-concurrents/group/{concurrentGroupCd}/deactivate
     *
     * @param concurrentGroupCd 겸직그룹코드 (G0001, G0002, ...)
     * @return 비활성화 완료 메시지
     */
    @PutMapping("/group/{concurrentGroupCd}/deactivate")
    public ResponseEntity<Void> deactivatePositionConcurrentGroup(
        @PathVariable String concurrentGroupCd
    ) {
        log.info("겸직 그룹 비활성화 요청: concurrentGroupCd={}", concurrentGroupCd);

        positionConcurrentService.deactivatePositionConcurrentGroup(concurrentGroupCd);

        log.info("겸직 그룹 비활성화 완료: concurrentGroupCd={}", concurrentGroupCd);
        return ResponseEntity.ok().build();
    }
}
