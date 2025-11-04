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
}
