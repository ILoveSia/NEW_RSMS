package com.rsms.domain.auth.service;

import com.rsms.domain.auth.dto.*;
import com.rsms.domain.auth.entity.Role;
import com.rsms.domain.auth.entity.Permission;
import com.rsms.domain.auth.entity.RolePermission;
import com.rsms.domain.auth.repository.RoleRepository;
import com.rsms.domain.auth.repository.PermissionRepository;
import com.rsms.domain.auth.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 역할 관리 서비스
 * - 역할 CRUD 및 권한 매핑 관리
 * - RoleMgmt UI 백엔드 서비스
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    // 기본 사용자 (추후 Security Context에서 가져오기)
    private static final String DEFAULT_USER = "system";

    // ===============================
    // 역할 CRUD
    // ===============================

    /**
     * 모든 역할 조회 (상세역할 수 포함)
     * - GET /api/system/roles
     */
    public List<RoleDto> getAllRoles() {
        log.debug("모든 역할 조회");
        List<Role> roles = roleRepository.findAllActiveRoles();

        return roles.stream()
            .map(role -> {
                Long permissionCount = rolePermissionRepository.countByRoleId(role.getRoleId());
                return RoleDto.from(role, permissionCount);
            })
            .collect(Collectors.toList());
    }

    /**
     * 역할 검색
     * - GET /api/system/roles/search
     */
    public List<RoleDto> searchRoles(String keyword, String roleType, String status) {
        log.debug("역할 검색 - keyword: {}, roleType: {}, status: {}", keyword, roleType, status);

        List<Role> roles;

        // 키워드 검색
        if (keyword != null && !keyword.isBlank()) {
            roles = roleRepository.searchByRoleName(keyword);
        } else {
            roles = roleRepository.findAllActiveRoles();
        }

        // 필터링 적용
        return roles.stream()
            .filter(role -> roleType == null || roleType.isBlank() || role.getRoleType().equals(roleType))
            .filter(role -> status == null || status.isBlank() || role.getStatus().equals(status))
            .map(role -> {
                Long permissionCount = rolePermissionRepository.countByRoleId(role.getRoleId());
                return RoleDto.from(role, permissionCount);
            })
            .collect(Collectors.toList());
    }

    /**
     * 역할 단건 조회
     * - GET /api/system/roles/{roleId}
     */
    public RoleDto getRole(Long roleId) {
        log.debug("역할 단건 조회 - roleId: {}", roleId);
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        Long permissionCount = rolePermissionRepository.countByRoleId(roleId);
        return RoleDto.from(role, permissionCount);
    }

    /**
     * 역할 생성
     * - POST /api/system/roles
     */
    @Transactional
    public RoleDto createRole(CreateRoleRequest request) {
        log.debug("역할 생성 - request: {}", request);

        // 역할 코드 중복 확인
        if (roleRepository.existsByRoleCode(request.getRoleCode())) {
            throw new IllegalArgumentException("이미 존재하는 역할 코드입니다: " + request.getRoleCode());
        }

        LocalDateTime now = LocalDateTime.now();

        // isSystemRole: Boolean -> String ('Y'/'N') 변환
        String isSystemRoleValue = (request.getIsSystemRole() != null && request.getIsSystemRole()) ? "Y" : "N";

        Role role = Role.builder()
            .roleCode(request.getRoleCode())
            .roleName(request.getRoleName())
            .description(request.getDescription())
            .roleType(request.getRoleType() != null ? request.getRoleType() : "CUSTOM")
            .roleCategory(request.getRoleCategory() != null ? request.getRoleCategory() : "사용자")
            .parentRoleId(request.getParentRoleId())
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
            .isSystemRole(isSystemRoleValue)
            .createdBy(DEFAULT_USER)
            .createdAt(now)
            .updatedBy(DEFAULT_USER)
            .updatedAt(now)
            .isDeleted("N")
            .build();

        Role savedRole = roleRepository.save(role);
        log.info("역할 생성 완료 - roleId: {}, roleCode: {}", savedRole.getRoleId(), savedRole.getRoleCode());

        return RoleDto.from(savedRole, 0L);
    }

    /**
     * 역할 수정
     * - PUT /api/system/roles/{roleId}
     */
    @Transactional
    public RoleDto updateRole(Long roleId, UpdateRoleRequest request) {
        log.debug("역할 수정 - roleId: {}, request: {}", roleId, request);

        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        // 시스템 역할 수정 제한
        if (role.isSystemRoleType()) {
            log.warn("시스템 역할은 수정할 수 없습니다. roleId: {}", roleId);
            throw new IllegalArgumentException("시스템 역할은 수정할 수 없습니다.");
        }

        // 필드 업데이트
        if (request.getRoleName() != null && !request.getRoleName().isBlank()) {
            role.setRoleName(request.getRoleName());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getRoleType() != null) {
            role.setRoleType(request.getRoleType());
        }
        if (request.getRoleCategory() != null) {
            role.setRoleCategory(request.getRoleCategory());
        }
        if (request.getParentRoleId() != null) {
            role.setParentRoleId(request.getParentRoleId());
        }
        if (request.getSortOrder() != null) {
            role.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            role.setStatus(request.getStatus());
        }
        if (request.getIsSystemRole() != null) {
            role.setIsSystemRole(request.getIsSystemRole() ? "Y" : "N");
        }

        role.setUpdatedBy(DEFAULT_USER);
        role.setUpdatedAt(LocalDateTime.now());

        Role savedRole = roleRepository.save(role);
        Long permissionCount = rolePermissionRepository.countByRoleId(roleId);

        log.info("역할 수정 완료 - roleId: {}", roleId);
        return RoleDto.from(savedRole, permissionCount);
    }

    /**
     * 역할 삭제 (논리적 삭제)
     * - DELETE /api/system/roles/{roleId}
     */
    @Transactional
    public void deleteRole(Long roleId) {
        log.debug("역할 삭제 - roleId: {}", roleId);

        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        // 시스템 역할 삭제 제한
        if (role.isSystemRoleType()) {
            log.warn("시스템 역할은 삭제할 수 없습니다. roleId: {}", roleId);
            throw new IllegalArgumentException("시스템 역할은 삭제할 수 없습니다.");
        }

        // 논리적 삭제
        role.setIsDeleted("Y");
        role.setUpdatedBy(DEFAULT_USER);
        role.setUpdatedAt(LocalDateTime.now());
        roleRepository.save(role);

        // 연관된 권한 매핑도 삭제
        rolePermissionRepository.softDeleteByRoleId(roleId, DEFAULT_USER);

        log.info("역할 삭제 완료 - roleId: {}", roleId);
    }

    /**
     * 역할 복수 삭제
     * - DELETE /api/system/roles
     */
    @Transactional
    public void deleteRoles(List<Long> roleIds) {
        log.debug("역할 복수 삭제 - roleIds: {}", roleIds);

        for (Long roleId : roleIds) {
            try {
                deleteRole(roleId);
            } catch (IllegalArgumentException e) {
                log.warn("역할 삭제 실패 - roleId: {}, error: {}", roleId, e.getMessage());
            }
        }

        log.info("역할 복수 삭제 완료 - count: {}", roleIds.size());
    }

    // ===============================
    // 권한 관리
    // ===============================

    /**
     * 모든 권한 조회
     * - GET /api/system/permissions
     */
    public List<PermissionDto> getAllPermissions() {
        log.debug("모든 권한 조회");
        List<Permission> permissions = permissionRepository.findAllNotDeleted();

        return permissions.stream()
            .map(PermissionDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 역할별 권한 조회
     * - GET /api/system/roles/{roleId}/permissions
     */
    public List<PermissionDto> getPermissionsByRoleId(Long roleId) {
        log.debug("역할별 권한 조회 - roleId: {}", roleId);

        // 역할 존재 확인
        roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        List<Permission> permissions = permissionRepository.findByRoleId(roleId);

        return permissions.stream()
            .map(PermissionDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 역할에 권한 할당
     * - POST /api/system/roles/{roleId}/permissions
     */
    @Transactional
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        log.debug("역할에 권한 할당 - roleId: {}, permissionIds: {}", roleId, permissionIds);

        // 역할 존재 확인
        roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        for (Long permissionId : permissionIds) {
            // 이미 매핑되어 있는지 확인
            if (!rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
                RolePermission rolePermission = RolePermission.create(roleId, permissionId, DEFAULT_USER);
                rolePermissionRepository.save(rolePermission);
                log.debug("권한 할당 완료 - roleId: {}, permissionId: {}", roleId, permissionId);
            }
        }

        log.info("역할에 권한 할당 완료 - roleId: {}, count: {}", roleId, permissionIds.size());
    }

    /**
     * 역할에서 권한 해제
     * - DELETE /api/system/roles/{roleId}/permissions
     */
    @Transactional
    public void removePermissions(Long roleId, List<Long> permissionIds) {
        log.debug("역할에서 권한 해제 - roleId: {}, permissionIds: {}", roleId, permissionIds);

        // 역할 존재 확인
        roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        rolePermissionRepository.softDeleteByRoleIdAndPermissionIds(roleId, permissionIds, DEFAULT_USER);

        log.info("역할에서 권한 해제 완료 - roleId: {}, count: {}", roleId, permissionIds.size());
    }

    /**
     * 역할의 권한 전체 갱신
     * - PUT /api/system/roles/{roleId}/permissions
     * - 기존 권한을 모두 삭제하고 새로운 권한으로 대체
     */
    @Transactional
    public void updateRolePermissions(Long roleId, List<Long> permissionIds) {
        log.debug("역할의 권한 전체 갱신 - roleId: {}, permissionIds: {}", roleId, permissionIds);

        // 역할 존재 확인
        roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("역할을 찾을 수 없습니다. ID: " + roleId));

        // 기존 매핑 조회
        List<RolePermission> existingMappings = rolePermissionRepository.findByRoleId(roleId);
        Set<Long> existingPermissionIds = existingMappings.stream()
            .map(RolePermission::getPermissionId)
            .collect(Collectors.toSet());

        Set<Long> newPermissionIds = permissionIds.stream().collect(Collectors.toSet());

        // 삭제할 권한 (기존에는 있었으나 새로운 목록에는 없는 것)
        List<Long> toRemove = existingPermissionIds.stream()
            .filter(id -> !newPermissionIds.contains(id))
            .collect(Collectors.toList());

        // 추가할 권한 (기존에는 없었으나 새로운 목록에 있는 것)
        List<Long> toAdd = newPermissionIds.stream()
            .filter(id -> !existingPermissionIds.contains(id))
            .collect(Collectors.toList());

        // 삭제
        if (!toRemove.isEmpty()) {
            rolePermissionRepository.softDeleteByRoleIdAndPermissionIds(roleId, toRemove, DEFAULT_USER);
            log.debug("권한 삭제 - roleId: {}, count: {}", roleId, toRemove.size());
        }

        // 추가
        for (Long permissionId : toAdd) {
            RolePermission rolePermission = RolePermission.create(roleId, permissionId, DEFAULT_USER);
            rolePermissionRepository.save(rolePermission);
            log.debug("권한 추가 - roleId: {}, permissionId: {}", roleId, permissionId);
        }

        log.info("역할의 권한 전체 갱신 완료 - roleId: {}, removed: {}, added: {}",
            roleId, toRemove.size(), toAdd.size());
    }
}
