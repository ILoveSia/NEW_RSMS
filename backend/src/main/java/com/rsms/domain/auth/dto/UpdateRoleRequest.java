package com.rsms.domain.auth.dto;

import lombok.*;

/**
 * 역할 수정 요청 DTO
 * - roles 테이블 수정 가능 컬럼 포함
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoleRequest {

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
     * 역할 카테고리 (최고관리자, 관리자, 사용자)
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
     * 시스템 역할 여부 (true: Y, false: N)
     */
    private Boolean isSystemRole;
}
