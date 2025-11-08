package com.rsms.domain.organization.service;

import com.rsms.domain.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 조직 Service
 * - 조직(본부/부점) 비즈니스 로직 처리
 *
 * @author Claude AI
 * @since 2025-10-21
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    /**
     * 활성 조직 목록 조회
     * - 사용중이고 폐쇄되지 않은 모든 조직 반환
     * - snake_case를 camelCase로 변환
     *
     * @return 활성 조직 목록 (camelCase)
     */
    public List<Map<String, Object>> getActiveOrganizations() {
        log.debug("활성 조직 목록 조회");
        List<Map<String, Object>> results = organizationRepository.findAllActive();

        // snake_case를 camelCase로 변환
        return results.stream()
            .map(row -> {
                Map<String, Object> converted = new HashMap<>();
                converted.put("orgCode", row.get("org_code"));
                converted.put("hqCode", row.get("hq_code"));
                converted.put("orgName", row.get("org_name"));
                converted.put("orgType", row.get("org_type"));
                converted.put("isActive", row.get("is_active"));
                return converted;
            })
            .collect(Collectors.toList());
    }

    /**
     * 본부코드별 조직 목록 조회
     * - 사용중이고 폐쇄되지 않은 조직만 반환
     * - snake_case를 camelCase로 변환
     *
     * @param hqCode 본부코드
     * @return 조직 목록 (camelCase)
     */
    public List<Map<String, Object>> getOrganizationsByHqCode(String hqCode) {
        log.debug("본부코드별 조직 목록 조회 - hqCode: {}", hqCode);
        List<Map<String, Object>> results = organizationRepository.findByHqCodeAndActive(hqCode);

        // snake_case를 camelCase로 변환
        return results.stream()
            .map(row -> {
                Map<String, Object> converted = new HashMap<>();
                converted.put("hqCode", hqCode);
                converted.put("orgCode", row.get("org_code"));
                converted.put("orgName", row.get("org_name"));
                converted.put("orgType", row.get("org_type"));
                converted.put("isActive", row.get("is_active"));
                return converted;
            })
            .collect(Collectors.toList());
    }

    /**
     * 조직 검색 (본부명 포함)
     * - 조직코드 또는 조직명으로 검색
     * - 본부명을 포함하여 반환
     * - snake_case를 camelCase로 변환
     *
     * @param searchKeyword 검색어 (조직코드 또는 조직명)
     * @return 조직 목록 (camelCase, hqName 포함)
     */
    public List<Map<String, Object>> searchOrganizations(String searchKeyword) {
        log.debug("조직 검색 - searchKeyword: {}", searchKeyword);

        // 검색어가 null이거나 빈 문자열이면 전체 조회
        List<Map<String, Object>> results;
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            results = organizationRepository.findAllActiveWithHqName();
        } else {
            results = organizationRepository.searchOrganizations(searchKeyword);
        }

        // snake_case를 camelCase로 변환
        return results.stream()
            .map(row -> {
                Map<String, Object> converted = new HashMap<>();
                converted.put("orgCode", row.get("org_code"));
                converted.put("hqCode", row.get("hq_code"));
                converted.put("hqName", row.get("hq_name"));
                converted.put("orgName", row.get("org_name"));
                converted.put("orgType", row.get("org_type"));
                converted.put("isActive", row.get("is_active"));
                return converted;
            })
            .collect(Collectors.toList());
    }

    /**
     * 조직코드별 관리의무 목록 조회
     * - 사용중(is_active='Y')인 관리의무만 반환
     * - snake_case를 camelCase로 변환
     *
     * @param orgCode 조직코드
     * @return 관리의무 목록 (camelCase)
     */
    public List<Map<String, Object>> getManagementObligationsByOrgCode(String orgCode) {
        log.debug("조직별 관리의무 조회 - orgCode: {}", orgCode);
        List<Map<String, Object>> results = organizationRepository.findManagementObligationsByOrgCode(orgCode);

        // snake_case를 camelCase로 변환
        return results.stream()
            .map(row -> {
                Map<String, Object> converted = new HashMap<>();
                converted.put("obligationCd", row.get("obligation_cd"));
                converted.put("obligationInfo", row.get("obligation_info"));
                return converted;
            })
            .collect(Collectors.toList());
    }
}
