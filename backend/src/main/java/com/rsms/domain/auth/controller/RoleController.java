package com.rsms.domain.auth.controller;

import com.rsms.domain.auth.dto.*;
import com.rsms.domain.auth.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 역할 관리 Controller
 * - 역할 CRUD API
 * - 권한 매핑 관리 API
 * - RoleMgmt UI 백엔드
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/system/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    // ===============================
    // 역할 CRUD
    // ===============================

    /**
     * 모든 역할 조회
     * - GET /api/system/roles
     */
    @GetMapping
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        log.debug("GET /api/system/roles - 모든 역할 조회");
        List<RoleDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * 역할 검색
     * - GET /api/system/roles/search
     */
    @GetMapping("/search")
    public ResponseEntity<List<RoleDto>> searchRoles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleType,
            @RequestParam(required = false) String status) {
        log.debug("GET /api/system/roles/search - 역할 검색 keyword: {}, roleType: {}, status: {}",
            keyword, roleType, status);
        List<RoleDto> roles = roleService.searchRoles(keyword, roleType, status);
        return ResponseEntity.ok(roles);
    }

    /**
     * 역할 단건 조회
     * - GET /api/system/roles/{roleId}
     */
    @GetMapping("/{roleId}")
    public ResponseEntity<RoleDto> getRole(@PathVariable Long roleId) {
        log.debug("GET /api/system/roles/{} - 역할 단건 조회", roleId);
        RoleDto role = roleService.getRole(roleId);
        return ResponseEntity.ok(role);
    }

    /**
     * 역할 생성
     * - POST /api/system/roles
     */
    @PostMapping
    public ResponseEntity<RoleDto> createRole(@RequestBody CreateRoleRequest request) {
        log.debug("POST /api/system/roles - 역할 생성 request: {}", request);
        RoleDto role = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    /**
     * 역할 수정
     * - PUT /api/system/roles/{roleId}
     */
    @PutMapping("/{roleId}")
    public ResponseEntity<RoleDto> updateRole(
            @PathVariable Long roleId,
            @RequestBody UpdateRoleRequest request) {
        log.debug("PUT /api/system/roles/{} - 역할 수정 request: {}", roleId, request);
        RoleDto role = roleService.updateRole(roleId, request);
        return ResponseEntity.ok(role);
    }

    /**
     * 역할 삭제
     * - DELETE /api/system/roles/{roleId}
     */
    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long roleId) {
        log.debug("DELETE /api/system/roles/{} - 역할 삭제", roleId);
        roleService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 역할 복수 삭제
     * - DELETE /api/system/roles
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteRoles(@RequestBody List<Long> roleIds) {
        log.debug("DELETE /api/system/roles - 역할 복수 삭제 roleIds: {}", roleIds);
        roleService.deleteRoles(roleIds);
        return ResponseEntity.noContent().build();
    }

    // ===============================
    // 권한 관리
    // ===============================

    /**
     * 역할별 권한 조회
     * - GET /api/system/roles/{roleId}/permissions
     */
    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<List<PermissionDto>> getPermissionsByRoleId(@PathVariable Long roleId) {
        log.debug("GET /api/system/roles/{}/permissions - 역할별 권한 조회", roleId);
        List<PermissionDto> permissions = roleService.getPermissionsByRoleId(roleId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 역할에 권한 할당
     * - POST /api/system/roles/{roleId}/permissions
     */
    @PostMapping("/{roleId}/permissions")
    public ResponseEntity<Void> assignPermissions(
            @PathVariable Long roleId,
            @RequestBody RolePermissionRequest request) {
        log.debug("POST /api/system/roles/{}/permissions - 역할에 권한 할당 request: {}", roleId, request);
        roleService.assignPermissions(roleId, request.getPermissionIds());
        return ResponseEntity.ok().build();
    }

    /**
     * 역할에서 권한 해제
     * - DELETE /api/system/roles/{roleId}/permissions
     */
    @DeleteMapping("/{roleId}/permissions")
    public ResponseEntity<Void> removePermissions(
            @PathVariable Long roleId,
            @RequestBody RolePermissionRequest request) {
        log.debug("DELETE /api/system/roles/{}/permissions - 역할에서 권한 해제 request: {}", roleId, request);
        roleService.removePermissions(roleId, request.getPermissionIds());
        return ResponseEntity.noContent().build();
    }

    /**
     * 역할의 권한 전체 갱신
     * - PUT /api/system/roles/{roleId}/permissions
     */
    @PutMapping("/{roleId}/permissions")
    public ResponseEntity<Void> updateRolePermissions(
            @PathVariable Long roleId,
            @RequestBody RolePermissionRequest request) {
        log.debug("PUT /api/system/roles/{}/permissions - 역할의 권한 전체 갱신 request: {}", roleId, request);
        roleService.updateRolePermissions(roleId, request.getPermissionIds());
        return ResponseEntity.ok().build();
    }
}
