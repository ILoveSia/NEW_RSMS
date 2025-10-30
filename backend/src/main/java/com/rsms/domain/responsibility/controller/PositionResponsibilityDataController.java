package com.rsms.domain.responsibility.controller;

import com.rsms.domain.responsibility.dto.PositionResponsibilityDataDto;
import com.rsms.domain.responsibility.service.PositionResponsibilityDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 직책 책무기술서 데이터 조회 Controller
 * - 직책 선택 시 필요한 7개 필드를 한번에 조회하는 단일 API
 *
 * @author RSMS
 * @since 2025-10-29
 */
@Slf4j
@RestController
@RequestMapping("/api/responsibility-docs")
@RequiredArgsConstructor
public class PositionResponsibilityDataController {

    private final PositionResponsibilityDataService positionResponsibilityDataService;

    /**
     * 직책ID로 책무기술서 관련 전체 데이터 조회
     * - 7개 필드를 한번에 조회하여 반환
     *
     * GET /api/responsibility-docs/position/{positionId}/data
     *
     * @param positionId 직책ID
     * @return 책무기술서 관련 전체 데이터
     */
    @GetMapping("/position/{positionId}/data")
    public ResponseEntity<PositionResponsibilityDataDto> getPositionResponsibilityData(
            @PathVariable Long positionId
    ) {
        log.info("[PositionResponsibilityDataController] 직책ID {}의 책무기술서 데이터 조회 요청", positionId);

        PositionResponsibilityDataDto data = positionResponsibilityDataService
                .getPositionResponsibilityData(positionId);

        log.info("[PositionResponsibilityDataController] 직책ID {}의 책무기술서 데이터 조회 완료 - " +
                        "겸직여부: {}, 회의체: {}개, 책무: {}개, 관리의무: {}개",
                positionId, data.getIsConcurrent(),
                data.getCommittees().size(),
                data.getResponsibilities().size(),
                data.getManagementObligations().size());

        return ResponseEntity.ok(data);
    }
}
