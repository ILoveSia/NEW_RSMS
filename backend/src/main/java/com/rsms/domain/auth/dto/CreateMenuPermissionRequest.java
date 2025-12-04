package com.rsms.domain.auth.dto;

import lombok.*;

/**
 * 메뉴 권한 생성 요청 DTO
 * - MenuMgmt에서 역할에 메뉴 권한 추가 시 사용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMenuPermissionRequest {

    /**
     * 메뉴 ID (필수)
     */
    private Long menuId;

    /**
     * 역할 ID (필수)
     */
    private Long roleId;

    /**
     * 조회 권한 ('Y', 'N')
     */
    private String canView;

    /**
     * 등록 권한 ('Y', 'N')
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
}
