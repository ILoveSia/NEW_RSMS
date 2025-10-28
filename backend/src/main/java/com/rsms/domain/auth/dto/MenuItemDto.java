package com.rsms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 메뉴 아이템 DTO
 * - LeftMenu에 표시할 메뉴 정보
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDto {

    /**
     * 메뉴 ID
     */
    private Long menuId;

    /**
     * 메뉴 코드 (예: 01, 0201, 020102)
     */
    private String menuCode;

    /**
     * 메뉴명
     */
    private String menuName;

    /**
     * 메뉴 설명
     */
    private String description;

    /**
     * URL 경로
     */
    private String url;

    /**
     * URL 파라미터
     */
    private String parameters;

    /**
     * 메뉴 타입 (folder/page)
     */
    private String menuType;

    /**
     * 메뉴 깊이 (1/2/3)
     */
    private Integer depth;

    /**
     * 상위 메뉴 ID
     */
    private Long parentId;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 시스템 코드
     */
    private String systemCode;

    /**
     * 아이콘명
     */
    private String icon;

    /**
     * 활성화 여부
     */
    private Boolean isActive;

    /**
     * 인증 필요 여부
     */
    private Boolean requiresAuth;

    /**
     * 새창 열기 여부
     */
    private Boolean openInNewWindow;

    /**
     * 대시보드 레이아웃 사용 여부
     */
    private Boolean dashboardLayout;

    /**
     * 하위 메뉴 목록 (계층 구조)
     */
    private List<MenuItemDto> children;
}
