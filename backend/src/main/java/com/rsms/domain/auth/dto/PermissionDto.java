package com.rsms.domain.auth.dto;

import com.rsms.domain.auth.entity.Permission;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 권한(상세역할) 응답 DTO
 * - permissions 테이블 기반
 * - RoleMgmt UI 오른쪽 그리드용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDto {

    /**
     * 권한ID
     */
    private Long permissionId;

    /**
     * 권한 코드
     */
    private String permissionCode;

    /**
     * 권한명
     */
    private String permissionName;

    /**
     * 권한 설명
     */
    private String description;

    /**
     * 메뉴 ID
     */
    private Long menuId;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 역할유형 (Y: 업무, N: 일반)
     */
    private String businessPermission;

    /**
     * 본점기본 ('Y', 'N')
     */
    private String mainBusinessPermission;

    /**
     * 영업점기본 ('Y', 'N')
     */
    private String executionPermission;

    /**
     * 조회 권한 ('Y', 'N')
     */
    private String canView;

    /**
     * 생성 권한 ('Y', 'N')
     */
    private String canCreate;

    /**
     * 수정 권한 ('Y', 'N')
     */
    private String canUpdate;

    /**
     * 삭제 권한 ('Y', 'N')
     */
    private String canDelete;

    /**
     * 선택 권한 ('Y', 'N')
     */
    private String canSelect;

    /**
     * 확장 권한 유형 (전체권한, 제한권한, 조회권한)
     */
    private String extendedPermissionType;

    /**
     * 확장 권한명
     */
    private String extendedPermissionName;

    /**
     * 사용여부 ('Y', 'N')
     */
    private String isActive;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * Entity → DTO 변환
     */
    public static PermissionDto from(Permission permission) {
        return PermissionDto.builder()
            .permissionId(permission.getPermissionId())
            .permissionCode(permission.getPermissionCode())
            .permissionName(permission.getPermissionName())
            .description(permission.getDescription())
            .menuId(permission.getMenuId())
            .sortOrder(permission.getSortOrder())
            .businessPermission(permission.getBusinessPermission())
            .mainBusinessPermission(permission.getMainBusinessPermission())
            .executionPermission(permission.getExecutionPermission())
            .canView(permission.getCanView())
            .canCreate(permission.getCanCreate())
            .canUpdate(permission.getCanUpdate())
            .canDelete(permission.getCanDelete())
            .canSelect(permission.getCanSelect())
            .extendedPermissionType(permission.getExtendedPermissionType())
            .extendedPermissionName(permission.getExtendedPermissionName())
            .isActive(permission.getIsActive())
            .createdAt(permission.getCreatedAt())
            .updatedAt(permission.getUpdatedAt())
            .build();
    }
}
