package com.rsms.domain.auth.service;

import com.rsms.domain.auth.dto.*;
import com.rsms.domain.auth.entity.Permission;
import com.rsms.domain.auth.repository.PermissionRepository;
import com.rsms.domain.auth.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 권한 관리 서비스
 * - 권한(상세역할) CRUD
 * - RoleMgmt UI 오른쪽 그리드 백엔드 서비스
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    // 기본 사용자 (추후 Security Context에서 가져오기)
    private static final String DEFAULT_USER = "system";

    /**
     * 권한 단건 조회
     * - GET /api/system/permissions/{permissionId}
     */
    public PermissionDto getPermission(Long permissionId) {
        log.debug("권한 단건 조회 - permissionId: {}", permissionId);
        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new IllegalArgumentException("권한을 찾을 수 없습니다. ID: " + permissionId));

        return PermissionDto.from(permission);
    }

    /**
     * 권한 생성
     * - POST /api/system/permissions
     */
    @Transactional
    public PermissionDto createPermission(CreatePermissionRequest request) {
        log.debug("권한 생성 - request: {}", request);

        // 권한 코드 중복 확인
        if (permissionRepository.existsByPermissionCode(request.getPermissionCode())) {
            throw new IllegalArgumentException("이미 존재하는 권한 코드입니다: " + request.getPermissionCode());
        }

        LocalDateTime now = LocalDateTime.now();

        Permission permission = Permission.builder()
            .permissionCode(request.getPermissionCode())
            .permissionName(request.getPermissionName())
            .description(request.getDescription())
            .menuId(request.getMenuId() != null ? request.getMenuId() : 1L)
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .businessPermission(request.getBusinessPermission() != null ? request.getBusinessPermission() : "N")
            .mainBusinessPermission(request.getMainBusinessPermission() != null ? request.getMainBusinessPermission() : "N")
            .executionPermission(request.getExecutionPermission() != null ? request.getExecutionPermission() : "N")
            .canView(request.getCanView() != null ? request.getCanView() : "N")
            .canCreate(request.getCanCreate() != null ? request.getCanCreate() : "N")
            .canUpdate(request.getCanUpdate() != null ? request.getCanUpdate() : "N")
            .canDelete(request.getCanDelete() != null ? request.getCanDelete() : "N")
            .canSelect(request.getCanSelect() != null ? request.getCanSelect() : "N")
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(DEFAULT_USER)
            .createdAt(now)
            .updatedBy(DEFAULT_USER)
            .updatedAt(now)
            .isDeleted("N")
            .build();

        Permission savedPermission = permissionRepository.save(permission);
        log.info("권한 생성 완료 - permissionId: {}, permissionCode: {}",
            savedPermission.getPermissionId(), savedPermission.getPermissionCode());

        return PermissionDto.from(savedPermission);
    }

    /**
     * 권한 수정
     * - PUT /api/system/permissions/{permissionId}
     */
    @Transactional
    public PermissionDto updatePermission(Long permissionId, UpdatePermissionRequest request) {
        log.debug("권한 수정 - permissionId: {}, request: {}", permissionId, request);

        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new IllegalArgumentException("권한을 찾을 수 없습니다. ID: " + permissionId));

        // 필드 업데이트
        if (request.getPermissionName() != null && !request.getPermissionName().isBlank()) {
            permission.setPermissionName(request.getPermissionName());
        }
        if (request.getDescription() != null) {
            permission.setDescription(request.getDescription());
        }
        if (request.getSortOrder() != null) {
            permission.setSortOrder(request.getSortOrder());
        }
        if (request.getBusinessPermission() != null) {
            permission.setBusinessPermission(request.getBusinessPermission());
        }
        if (request.getMainBusinessPermission() != null) {
            permission.setMainBusinessPermission(request.getMainBusinessPermission());
        }
        if (request.getExecutionPermission() != null) {
            permission.setExecutionPermission(request.getExecutionPermission());
        }
        if (request.getCanView() != null) {
            permission.setCanView(request.getCanView());
        }
        if (request.getCanCreate() != null) {
            permission.setCanCreate(request.getCanCreate());
        }
        if (request.getCanUpdate() != null) {
            permission.setCanUpdate(request.getCanUpdate());
        }
        if (request.getCanDelete() != null) {
            permission.setCanDelete(request.getCanDelete());
        }
        if (request.getCanSelect() != null) {
            permission.setCanSelect(request.getCanSelect());
        }
        if (request.getIsActive() != null) {
            permission.setIsActive(request.getIsActive());
        }

        permission.setUpdatedBy(DEFAULT_USER);
        permission.setUpdatedAt(LocalDateTime.now());

        Permission savedPermission = permissionRepository.save(permission);
        log.info("권한 수정 완료 - permissionId: {}", permissionId);

        return PermissionDto.from(savedPermission);
    }

    /**
     * 권한 삭제 (논리적 삭제)
     * - DELETE /api/system/permissions/{permissionId}
     */
    @Transactional
    public void deletePermission(Long permissionId) {
        log.debug("권한 삭제 - permissionId: {}", permissionId);

        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new IllegalArgumentException("권한을 찾을 수 없습니다. ID: " + permissionId));

        // 논리적 삭제
        permission.setIsDeleted("Y");
        permission.setUpdatedBy(DEFAULT_USER);
        permission.setUpdatedAt(LocalDateTime.now());
        permissionRepository.save(permission);

        // 연관된 역할-권한 매핑도 삭제
        rolePermissionRepository.softDeleteByPermissionId(permissionId, DEFAULT_USER);

        log.info("권한 삭제 완료 - permissionId: {}", permissionId);
    }

    /**
     * 권한 복수 삭제
     * - DELETE /api/system/permissions
     */
    @Transactional
    public void deletePermissions(List<Long> permissionIds) {
        log.debug("권한 복수 삭제 - permissionIds: {}", permissionIds);

        for (Long permissionId : permissionIds) {
            try {
                deletePermission(permissionId);
            } catch (IllegalArgumentException e) {
                log.warn("권한 삭제 실패 - permissionId: {}, error: {}", permissionId, e.getMessage());
            }
        }

        log.info("권한 복수 삭제 완료 - count: {}", permissionIds.size());
    }
}
