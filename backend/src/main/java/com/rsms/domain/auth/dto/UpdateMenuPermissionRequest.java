package com.rsms.domain.auth.dto;

import lombok.*;

/**
 * 메뉴 권한 수정 요청 DTO
 * - MenuMgmt에서 역할의 메뉴 권한 수정 시 사용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMenuPermissionRequest {

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
