package com.rsms.domain.system.code.controller;

import com.rsms.domain.system.code.dto.*;
import com.rsms.domain.system.code.service.CommonCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 공통코드 Controller
 *
 * @description 공통코드 관리 REST API
 * @author Claude AI
 * @since 2025-09-24
 */
@Slf4j
@RestController
@RequestMapping("/api/system/codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    // ===============================
    // 코드 그룹 API
    // ===============================

    /**
     * 모든 코드 그룹 조회
     */
    @GetMapping("/groups")
    public ResponseEntity<List<CommonCodeGroupDto>> getAllCodeGroups() {
        log.info("GET /api/system/codes/groups - 모든 코드 그룹 조회");
        List<CommonCodeGroupDto> groups = commonCodeService.getAllCodeGroups();
        return ResponseEntity.ok(groups);
    }

    /**
     * 코드 그룹 페이징 조회
     */
    @GetMapping("/groups/search")
    public ResponseEntity<Page<CommonCodeGroupDto>> searchCodeGroups(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String isActive,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("GET /api/system/codes/groups/search - keyword: {}, category: {}, isActive: {}",
                keyword, category, isActive);
        Page<CommonCodeGroupDto> groups = commonCodeService.getCodeGroups(keyword, category, isActive, pageable);
        return ResponseEntity.ok(groups);
    }

    /**
     * 코드 그룹 단건 조회
     */
    @GetMapping("/groups/{groupCode}")
    public ResponseEntity<CommonCodeGroupDto> getCodeGroup(@PathVariable String groupCode) {
        log.info("GET /api/system/codes/groups/{} - 코드 그룹 조회", groupCode);
        CommonCodeGroupDto group = commonCodeService.getCodeGroup(groupCode);
        return ResponseEntity.ok(group);
    }

    /**
     * 코드 그룹 및 상세 조회
     */
    @GetMapping("/groups/{groupCode}/with-details")
    public ResponseEntity<CommonCodeGroupDto> getCodeGroupWithDetails(@PathVariable String groupCode) {
        log.info("GET /api/system/codes/groups/{}/with-details - 코드 그룹 및 상세 조회", groupCode);
        CommonCodeGroupDto group = commonCodeService.getCodeGroupWithDetails(groupCode);
        return ResponseEntity.ok(group);
    }

    /**
     * 활성화된 모든 코드 그룹 및 상세 조회
     */
    @GetMapping("/groups/active/with-details")
    public ResponseEntity<List<CommonCodeGroupDto>> getAllActiveCodeGroupsWithDetails() {
        log.info("GET /api/system/codes/groups/active/with-details - 활성화된 모든 코드 그룹 및 상세 조회");
        List<CommonCodeGroupDto> groups = commonCodeService.getAllActiveCodeGroupsWithDetails();
        return ResponseEntity.ok(groups);
    }

    /**
     * 카테고리별 코드 그룹 조회
     */
    @GetMapping("/groups/category/{category}")
    public ResponseEntity<List<CommonCodeGroupDto>> getCodeGroupsByCategory(@PathVariable String category) {
        log.info("GET /api/system/codes/groups/category/{} - 카테고리별 코드 그룹 조회", category);
        List<CommonCodeGroupDto> groups = commonCodeService.getCodeGroupsByCategory(category);
        return ResponseEntity.ok(groups);
    }

    /**
     * 코드 그룹 생성
     */
    @PostMapping("/groups")
    public ResponseEntity<CommonCodeGroupDto> createCodeGroup(
            @Valid @RequestBody CreateCodeGroupRequest request,
            Principal principal) {
        log.info("POST /api/system/codes/groups - 코드 그룹 생성: {}", request.getGroupCode());
        String username = principal != null ? principal.getName() : "anonymous";
        CommonCodeGroupDto created = commonCodeService.createCodeGroup(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 코드 그룹 수정
     */
    @PutMapping("/groups/{groupCode}")
    public ResponseEntity<CommonCodeGroupDto> updateCodeGroup(
            @PathVariable String groupCode,
            @Valid @RequestBody UpdateCodeGroupRequest request,
            Principal principal) {
        log.info("PUT /api/system/codes/groups/{} - 코드 그룹 수정", groupCode);
        String username = principal != null ? principal.getName() : "anonymous";
        CommonCodeGroupDto updated = commonCodeService.updateCodeGroup(groupCode, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 코드 그룹 삭제
     */
    @DeleteMapping("/groups/{groupCode}")
    public ResponseEntity<Void> deleteCodeGroup(
            @PathVariable String groupCode,
            Principal principal) {
        log.info("DELETE /api/system/codes/groups/{} - 코드 그룹 삭제", groupCode);
        String username = principal != null ? principal.getName() : "anonymous";
        commonCodeService.deleteCodeGroup(groupCode, username);
        return ResponseEntity.noContent().build();
    }

    /**
     * 코드 그룹 활성화/비활성화
     */
    @PatchMapping("/groups/{groupCode}/toggle-active")
    public ResponseEntity<Void> toggleCodeGroupActive(
            @PathVariable String groupCode,
            Principal principal) {
        log.info("PATCH /api/system/codes/groups/{}/toggle-active - 활성화 토글", groupCode);
        String username = principal != null ? principal.getName() : "anonymous";
        commonCodeService.toggleCodeGroupActive(groupCode, username);
        return ResponseEntity.ok().build();
    }

    // ===============================
    // 코드 상세 API
    // ===============================

    /**
     * 그룹별 상세 코드 조회
     */
    @GetMapping("/groups/{groupCode}/details")
    public ResponseEntity<List<CommonCodeDetailDto>> getCodeDetailsByGroup(@PathVariable String groupCode) {
        log.info("GET /api/system/codes/groups/{}/details - 그룹별 상세 코드 조회", groupCode);
        List<CommonCodeDetailDto> details = commonCodeService.getCodeDetailsByGroup(groupCode);
        return ResponseEntity.ok(details);
    }

    /**
     * 그룹별 활성화된 상세 코드 조회
     */
    @GetMapping("/groups/{groupCode}/details/active")
    public ResponseEntity<List<CommonCodeDetailDto>> getActiveCodeDetailsByGroup(@PathVariable String groupCode) {
        log.info("GET /api/system/codes/groups/{}/details/active - 활성화된 상세 코드 조회", groupCode);
        List<CommonCodeDetailDto> details = commonCodeService.getActiveCodeDetailsByGroup(groupCode);
        return ResponseEntity.ok(details);
    }

    /**
     * 현재 유효한 코드 조회
     */
    @GetMapping("/groups/{groupCode}/details/valid")
    public ResponseEntity<List<CommonCodeDetailDto>> getCurrentValidCodes(@PathVariable String groupCode) {
        log.info("GET /api/system/codes/groups/{}/details/valid - 현재 유효한 코드 조회", groupCode);
        List<CommonCodeDetailDto> details = commonCodeService.getCurrentValidCodes(groupCode);
        return ResponseEntity.ok(details);
    }

    /**
     * 상세 코드 단건 조회
     */
    @GetMapping("/groups/{groupCode}/details/{detailCode}")
    public ResponseEntity<CommonCodeDetailDto> getCodeDetail(
            @PathVariable String groupCode,
            @PathVariable String detailCode) {
        log.info("GET /api/system/codes/groups/{}/details/{} - 상세 코드 조회", groupCode, detailCode);
        CommonCodeDetailDto detail = commonCodeService.getCodeDetail(groupCode, detailCode);
        return ResponseEntity.ok(detail);
    }

    /**
     * 상세 코드 생성
     */
    @PostMapping("/details")
    public ResponseEntity<CommonCodeDetailDto> createCodeDetail(
            @Valid @RequestBody CreateCodeDetailRequest request,
            Principal principal) {
        log.info("POST /api/system/codes/details - 상세 코드 생성: {}-{}",
                request.getGroupCode(), request.getDetailCode());
        String username = principal != null ? principal.getName() : "anonymous";
        CommonCodeDetailDto created = commonCodeService.createCodeDetail(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 상세 코드 수정
     */
    @PutMapping("/groups/{groupCode}/details/{detailCode}")
    public ResponseEntity<CommonCodeDetailDto> updateCodeDetail(
            @PathVariable String groupCode,
            @PathVariable String detailCode,
            @Valid @RequestBody UpdateCodeDetailRequest request,
            Principal principal) {
        log.info("PUT /api/system/codes/groups/{}/details/{} - 상세 코드 수정", groupCode, detailCode);
        String username = principal != null ? principal.getName() : "anonymous";
        CommonCodeDetailDto updated = commonCodeService.updateCodeDetail(groupCode, detailCode, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * 상세 코드 삭제
     */
    @DeleteMapping("/groups/{groupCode}/details/{detailCode}")
    public ResponseEntity<Void> deleteCodeDetail(
            @PathVariable String groupCode,
            @PathVariable String detailCode,
            Principal principal) {
        log.info("DELETE /api/system/codes/groups/{}/details/{} - 상세 코드 삭제", groupCode, detailCode);
        String username = principal != null ? principal.getName() : "anonymous";
        commonCodeService.deleteCodeDetail(groupCode, detailCode, username);
        return ResponseEntity.noContent().build();
    }

    /**
     * 상세 코드 활성화/비활성화
     */
    @PatchMapping("/groups/{groupCode}/details/{detailCode}/toggle-active")
    public ResponseEntity<Void> toggleCodeDetailActive(
            @PathVariable String groupCode,
            @PathVariable String detailCode,
            Principal principal) {
        log.info("PATCH /api/system/codes/groups/{}/details/{}/toggle-active - 활성화 토글",
                groupCode, detailCode);
        String username = principal != null ? principal.getName() : "anonymous";
        commonCodeService.toggleCodeDetailActive(groupCode, detailCode, username);
        return ResponseEntity.ok().build();
    }
}
