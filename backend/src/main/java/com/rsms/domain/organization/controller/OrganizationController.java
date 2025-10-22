package com.rsms.domain.organization.controller;

import com.rsms.domain.organization.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 조직 Controller
 * - 조직(본부/부점) 관리 REST API 제공
 *
 * @author Claude AI
 * @since 2025-10-21
 */
@Slf4j
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    /**
     * 본부코드별 부점 목록 조회
     * - GET /api/organizations/by-hq/{hqCode}
     *
     * @param hqCode 본부코드
     * @return 부점 목록 (org_code, org_name, org_type, is_active)
     */
    @GetMapping("/by-hq/{hqCode}")
    public ResponseEntity<List<Map<String, Object>>> getOrganizationsByHqCode(@PathVariable String hqCode) {
        log.info("GET /api/organizations/by-hq/{} - 본부별 부점 목록 조회", hqCode);
        List<Map<String, Object>> organizations = organizationService.getOrganizationsByHqCode(hqCode);
        return ResponseEntity.ok(organizations);
    }
}
