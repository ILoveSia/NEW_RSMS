package com.rsms.domain.auth.dto;

import lombok.*;

/**
 * 메뉴 수정 요청 DTO
 * - MenuMgmt에서 메뉴 정보 수정 시 사용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMenuRequest {

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
     * 활성화 여부 ('Y', 'N')
     */
    private String isActive;

    /**
     * 테스트 페이지 여부 ('Y', 'N')
     */
    private String isTestPage;

    /**
     * 인증 필요 여부 ('Y', 'N')
     */
    private String requiresAuth;

    /**
     * 새창 열기 여부 ('Y', 'N')
     */
    private String openInNewWindow;

    /**
     * 대시보드 레이아웃 사용 여부 ('Y', 'N')
     */
    private String dashboardLayout;
}
