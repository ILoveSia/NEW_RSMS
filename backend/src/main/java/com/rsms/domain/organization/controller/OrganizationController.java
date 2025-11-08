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
     * 활성 조직 목록 조회
     * - GET /api/organizations/active
     *
     * @return 활성 조직 목록 (is_active='Y')
     */
    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveOrganizations() {
        log.info("GET /api/organizations/active - 활성 조직 목록 조회");
        List<Map<String, Object>> organizations = organizationService.getActiveOrganizations();
        return ResponseEntity.ok(organizations);
    }

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

    /**
     * 조직 검색 (본부명 포함)
     * - GET /api/organizations/search?keyword={keyword}
     * - 검색어가 없으면 전체 조회
     *
     * @param keyword 검색어 (조직코드 또는 조직명)
     * @return 조직 목록 (org_code, hq_code, hq_name, org_name)
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchOrganizations(
            @RequestParam(required = false) String keyword) {
        log.info("GET /api/organizations/search?keyword={} - 조직 검색", keyword);
        List<Map<String, Object>> organizations = organizationService.searchOrganizations(keyword);
        return ResponseEntity.ok(organizations);
    }

    /**
     * 조직코드별 관리의무 목록 조회
     * - GET /api/organizations/{orgCode}/management-obligations
     *
     * @param orgCode 조직코드
     * @return 관리의무 목록 (obligation_cd, obligation_info)
     */
    @GetMapping("/{orgCode}/management-obligations")
    public ResponseEntity<List<Map<String, Object>>> getManagementObligationsByOrgCode(
            @PathVariable String orgCode) {
        log.info("GET /api/organizations/{}/management-obligations - 조직별 관리의무 조회", orgCode);
        List<Map<String, Object>> obligations = organizationService.getManagementObligationsByOrgCode(orgCode);
        return ResponseEntity.ok(obligations);
    }
}
