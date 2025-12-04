package com.rsms.domain.auth.dto;

import lombok.*;

/**
 * 메뉴 권한 DTO
 * - MenuMgmt 오른쪽 그리드에 표시할 권한 정보
 * - Role 정보와 함께 반환
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuPermissionDto {

    /**
     * 메뉴권한ID
     */
    private Long menuPermissionId;

    /**
     * 메뉴 ID
     */
    private Long menuId;

    /**
     * 역할 ID
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
     * 역할 카테고리 (최고관리자, 관리자, 사용자)
     */
    private String roleCategory;

    /**
     * 조회 권한
     */
    private Boolean canView;

    /**
     * 등록 권한
     */
    private Boolean canCreate;

    /**
     * 수정 권한
     */
    private Boolean canUpdate;

    /**
     * 삭제 권한
     */
    private Boolean canDelete;

    /**
     * 선택 권한
     */
    private Boolean canSelect;

    /**
     * 확장 권한 유형
     */
    private String extendedPermissionType;

    /**
     * 확장 권한명
     */
    private String extendedPermissionName;

    /**
     * 할당자
     */
    private String assignedBy;

    /**
     * 할당 일시
     */
    private String assignedAt;
}
