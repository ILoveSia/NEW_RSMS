package com.rsms.domain.auth.dto;

import com.rsms.domain.auth.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 역할 응답 DTO
 * - roles 테이블 기반
 * - RoleMgmt UI 왼쪽 그리드용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDto {

    /**
     * 역할ID
     */
    private Long roleId;

    /**
     * 역할 코드
     */
    private String roleCode;

    /**
     * 역할명
     */
    private String roleName;

    /**
     * 역할 설명
     */
    private String description;

    /**
     * 역할 유형 (SYSTEM, CUSTOM)
     */
    private String roleType;

    /**
     * 역할 분류 (최고관리자, 관리자, 사용자)
     */
    private String roleCategory;

    /**
     * 상위 역할 ID
     */
    private Long parentRoleId;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 상태 (ACTIVE, INACTIVE, ARCHIVED)
     */
    private String status;

    /**
     * 시스템 역할 여부 ('Y', 'N')
     */
    private String isSystemRole;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 상세역할(권한) 수 - role_permissions 조인 결과
     */
    private Long detailRoleCount;

    /**
     * Entity → DTO 변환
     */
    public static RoleDto from(Role role) {
        return RoleDto.builder()
            .roleId(role.getRoleId())
            .roleCode(role.getRoleCode())
            .roleName(role.getRoleName())
            .description(role.getDescription())
            .roleType(role.getRoleType())
            .roleCategory(role.getRoleCategory())
            .parentRoleId(role.getParentRoleId())
            .sortOrder(role.getSortOrder())
            .status(role.getStatus())
            .isSystemRole(role.getIsSystemRole())
            .createdAt(role.getCreatedAt())
            .updatedAt(role.getUpdatedAt())
            .createdBy(role.getCreatedBy())
            .updatedBy(role.getUpdatedBy())
            .detailRoleCount(0L) // 기본값, 별도 조회 필요
            .build();
    }

    /**
     * Entity → DTO 변환 (권한 수 포함)
     */
    public static RoleDto from(Role role, Long permissionCount) {
        RoleDto dto = from(role);
        dto.setDetailRoleCount(permissionCount);
        return dto;
    }
}
