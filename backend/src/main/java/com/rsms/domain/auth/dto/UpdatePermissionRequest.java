package com.rsms.domain.auth.dto;

import lombok.*;

/**
 * 권한 수정 요청 DTO
 * - permissions 테이블 수정 가능 컬럼 포함
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePermissionRequest {

    /**
     * 권한명
     */
    private String permissionName;

    /**
     * 권한 설명
     */
    private String description;

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
     * 사용여부 ('Y', 'N')
     */
    private String isActive;
}
