package com.rsms.domain.auth.dto;

import lombok.*;

import java.util.List;

/**
 * 역할 권한 할당 요청 DTO
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermissionRequest {

    /**
     * 권한 ID 목록
     */
    private List<Long> permissionIds;
}
