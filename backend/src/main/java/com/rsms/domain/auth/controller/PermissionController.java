package com.rsms.domain.auth.controller;

import com.rsms.domain.auth.dto.CreatePermissionRequest;
import com.rsms.domain.auth.dto.PermissionDto;
import com.rsms.domain.auth.dto.UpdatePermissionRequest;
import com.rsms.domain.auth.service.PermissionService;
import com.rsms.domain.auth.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 권한 관리 Controller
 * - 권한(상세역할) CRUD API
 * - RoleMgmt UI 오른쪽 그리드 백엔드
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/system/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final RoleService roleService;
    private final PermissionService permissionService;

    /**
     * 모든 권한 조회
     * - GET /api/system/permissions
     */
    @GetMapping
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        log.debug("GET /api/system/permissions - 모든 권한 조회");
        List<PermissionDto> permissions = roleService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    /**
     * 권한 단건 조회
     * - GET /api/system/permissions/{permissionId}
     */
    @GetMapping("/{permissionId}")
    public ResponseEntity<PermissionDto> getPermission(@PathVariable Long permissionId) {
        log.debug("GET /api/system/permissions/{} - 권한 단건 조회", permissionId);
        PermissionDto permission = permissionService.getPermission(permissionId);
        return ResponseEntity.ok(permission);
    }

    /**
     * 권한 생성
     * - POST /api/system/permissions
     */
    @PostMapping
    public ResponseEntity<PermissionDto> createPermission(@RequestBody CreatePermissionRequest request) {
        log.debug("POST /api/system/permissions - 권한 생성 request: {}", request);
        PermissionDto permission = permissionService.createPermission(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(permission);
    }

    /**
     * 권한 수정
     * - PUT /api/system/permissions/{permissionId}
     */
    @PutMapping("/{permissionId}")
    public ResponseEntity<PermissionDto> updatePermission(
            @PathVariable Long permissionId,
            @RequestBody UpdatePermissionRequest request) {
        log.debug("PUT /api/system/permissions/{} - 권한 수정 request: {}", permissionId, request);
        PermissionDto permission = permissionService.updatePermission(permissionId, request);
        return ResponseEntity.ok(permission);
    }

    /**
     * 권한 삭제
     * - DELETE /api/system/permissions/{permissionId}
     */
    @DeleteMapping("/{permissionId}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long permissionId) {
        log.debug("DELETE /api/system/permissions/{} - 권한 삭제", permissionId);
        permissionService.deletePermission(permissionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 권한 복수 삭제
     * - DELETE /api/system/permissions
     */
    @DeleteMapping
    public ResponseEntity<Void> deletePermissions(@RequestBody List<Long> permissionIds) {
        log.debug("DELETE /api/system/permissions - 권한 복수 삭제 permissionIds: {}", permissionIds);
        permissionService.deletePermissions(permissionIds);
        return ResponseEntity.noContent().build();
    }
}
