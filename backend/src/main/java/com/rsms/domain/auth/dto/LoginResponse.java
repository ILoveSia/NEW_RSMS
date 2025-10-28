package com.rsms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 로그인 응답 DTO
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * 성공 여부
     */
    private Boolean success;

    /**
     * 메시지
     */
    private String message;

    /**
     * 세션 ID (선택)
     */
    private String sessionId;

    /**
     * 사용자 정보
     */
    private UserInfoDto userInfo;

    /**
     * 사용자 정보 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfoDto {
        /**
         * 사용자 ID
         */
        private Long userId;

        /**
         * 사용자 아이디
         */
        private String username;

        /**
         * 직원번호
         */
        private String empNo;

        /**
         * 관리자 여부
         */
        private Boolean isAdmin;

        /**
         * 임원 여부
         */
        private Boolean isExecutive;

        /**
         * 권한 레벨
         */
        private Integer authLevel;

        /**
         * 역할 목록
         */
        private List<String> roles;

        /**
         * 비밀번호 변경 필요 여부
         */
        private Boolean needsPasswordChange;

        /**
         * 타임존
         */
        private String timezone;

        /**
         * 언어
         */
        private String language;
    }
}
